import fs from "node:fs";
import { createRequire } from "node:module";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import db from "./db.js";
import { processChatQuery, analyzeReportContent } from "./aiEngine.js";
import { evaluateSymptomsWithGroq } from "./groqService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload config
const storage = multer.diskStorage({
  destination: path.join(__dirname, "uploads"),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
const require = createRequire(import.meta.url);
const pdfModule = require("pdf-parse");

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

async function extractPdfText(buffer) {
  if (!buffer || buffer.length === 0) return "";
  try {
    if (typeof pdfModule === "function") {
      const data = await pdfModule(buffer);
      return data.text || "";
    } else if (pdfModule && pdfModule.PDFParse) {
      const parser = new pdfModule.PDFParse({ data: buffer });
      const res = await parser.getText();
      if (typeof parser.destroy === "function") {
        await parser.destroy();
      }
      return res.text || "";
    }
  } catch (err) {
    console.error("PDF parse failure:", err.message);
  }
  return "";
}

const uploadFields = upload.fields([
  { name: "report", maxCount: 1 },
  { name: "file", maxCount: 1 }
]);


// Helper to get or resolve patient for a specific user account
function getPatientForUser(email) {
  if (email && typeof email === "string" && email.trim()) {
    const patient = db.prepare("SELECT * FROM patients WHERE LOWER(email) = LOWER(?)").get(email.trim());
    if (patient) return patient;
  }
  let defaultPatient = db.prepare("SELECT * FROM patients ORDER BY id ASC LIMIT 1").get();
  if (!defaultPatient) {
    const insert = db.prepare(`
      INSERT INTO patients (
        name, age, gender, blood_group, height, weight, email, phone,
        allergies, chronic_conditions, emergency_contact, primary_physician,
        heart_rate, blood_pressure, temperature, spo2
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(
      "Alex Mercer",
      34,
      "Male",
      "O+ (Positive)",
      "178 cm",
      "74 kg",
      "alex.mercer@sushruta-ai.local",
      "+1 (555) 382-9012",
      "Penicillin, Shellfish",
      "Mild Hypertension, Seasonal Asthma",
      "Elena Mercer (Spouse) - +1 (555) 902-3341",
      "Dr. Aris Thorne, MD (Cardiology)",
      "72 bpm",
      "120/80 mmHg",
      "98.6 °F",
      "99%"
    );
    defaultPatient = db.prepare("SELECT * FROM patients ORDER BY id ASC LIMIT 1").get();
  }
  return defaultPatient;
}

// ============================================================
// PATIENT PROFILE ENDPOINTS (ACCOUNT-AWARE)
// ============================================================

// GET /api/patient - Retrieve patient details for active user account
app.get("/api/patient", (req, res) => {
  try {
    const userEmail = req.query.email || req.headers["x-user-email"];
    const patient = getPatientForUser(userEmail);
    res.json(patient);
  } catch (err) {
    console.error("Get patient error:", err);
    res.status(500).json({ error: "Failed to retrieve patient profile" });
  }
});

// PUT /api/patient - Update patient details for active user account
app.put("/api/patient", (req, res) => {
  try {
    const p = req.body;
    const userEmail = p.email || req.query.email || req.headers["x-user-email"];
    let patient = getPatientForUser(userEmail);

    const updateStmt = db.prepare(`
      UPDATE patients SET
        name = ?,
        age = ?,
        gender = ?,
        blood_group = ?,
        height = ?,
        weight = ?,
        email = ?,
        phone = ?,
        allergies = ?,
        chronic_conditions = ?,
        emergency_contact = ?,
        primary_physician = ?,
        heart_rate = ?,
        blood_pressure = ?,
        temperature = ?,
        spo2 = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateStmt.run(
      p.name ?? patient.name,
      p.age ? parseInt(p.age, 10) : patient.age,
      p.gender ?? patient.gender,
      p.blood_group ?? patient.blood_group,
      p.height ?? patient.height,
      p.weight ?? patient.weight,
      p.email ?? patient.email,
      p.phone ?? patient.phone,
      p.allergies ?? patient.allergies,
      p.chronic_conditions ?? patient.chronic_conditions,
      p.emergency_contact ?? patient.emergency_contact,
      p.primary_physician ?? patient.primary_physician,
      p.heart_rate ?? patient.heart_rate,
      p.blood_pressure ?? patient.blood_pressure,
      p.temperature ?? patient.temperature,
      p.spo2 ?? patient.spo2,
      patient.id
    );

    const updated = db.prepare("SELECT * FROM patients WHERE id = ?").get(patient.id);
    res.json({ message: "Patient profile updated successfully", patient: updated });
  } catch (err) {
    console.error("Update patient error:", err);
    res.status(500).json({ error: "Failed to update patient profile" });
  }
});

// ============================================================
// GET /api/dashboard — Comprehensive telemetry & dynamic account logs
// ============================================================
app.get("/api/dashboard", (req, res) => {
  try {
    const userEmail = req.query.email || req.headers["x-user-email"];
    const userRole = (req.query.role || req.headers["x-user-role"] || "patient").toLowerCase();

    // DOCTOR DASHBOARD VIEW
    if (userRole === "doctor") {
      let doctor = null;
      if (userEmail) {
        doctor = db.prepare("SELECT * FROM doctors WHERE LOWER(email) = LOWER(?)").get(userEmail.trim());
      }
      if (!doctor) {
        doctor = db.prepare("SELECT * FROM doctors ORDER BY id ASC LIMIT 1").get();
      }

      const doctorId = doctor ? doctor.id : 1;
      const doctorName = doctor ? doctor.name : "";
      const doctorAppointments = db.prepare("SELECT * FROM appointments WHERE doctor_id = ? OR LOWER(doctor_name) LIKE LOWER(?) ORDER BY date ASC, time_slot ASC").all(doctorId, `%${doctorName}%`);
      const totalDoctorAppts = doctorAppointments.length;
      const pendingAppts = doctorAppointments.filter(a => a.status === "pending").length;
      const confirmedAppts = doctorAppointments.filter(a => a.status === "confirmed").length;

      return res.json({
        role: "doctor",
        doctor: {
          ...doctor,
          availability: doctor.availability ? (typeof doctor.availability === "string" ? JSON.parse(doctor.availability) : doctor.availability) : []
        },
        healthStatus: "Doctor Clinical Duty Active",
        healthScore: 98,
        stats: {
          totalConsultations: totalDoctorAppts,
          totalLabReports: 12,
          activeAlerts: pendingAppts,
          telemetrySync: "Doctor Station Online",
        },
        appointments: doctorAppointments,
        recentChats: [],
        recentReports: db.prepare("SELECT * FROM reports ORDER BY created_at DESC LIMIT 4").all()
      });
    }

    // ADMIN DASHBOARD VIEW
    if (userRole === "admin") {
      const allPatients = db.prepare("SELECT * FROM patients ORDER BY id ASC").all();
      const allDoctors = db.prepare("SELECT * FROM doctors ORDER BY id ASC").all();
      const allAppointments = db.prepare("SELECT * FROM appointments ORDER BY date ASC").all();
      const allUsers = db.prepare("SELECT id, name, email, role, created_at FROM users").all();

      return res.json({
        role: "admin",
        healthStatus: "Administrator Full Access Console",
        healthScore: 100,
        stats: {
          totalPatients: allPatients.length,
          totalDoctors: allDoctors.length,
          totalAppointments: allAppointments.length,
          totalUsers: allUsers.length,
          activeAlerts: 0,
          telemetrySync: "Central Admin Operational",
        },
        patient: getPatientForUser(userEmail),
        allPatients,
        allDoctors,
        allAppointments,
        allUsers,
        recentChats: db.prepare("SELECT * FROM chats ORDER BY created_at DESC LIMIT 6").all(),
        recentReports: db.prepare("SELECT * FROM reports ORDER BY created_at DESC LIMIT 6").all()
      });
    }

    // PATIENT DASHBOARD VIEW (DEFAULT / ROLE === 'PATIENT')
    const patient = getPatientForUser(userEmail);
    const chats = db.prepare("SELECT * FROM chats ORDER BY created_at DESC LIMIT 8").all();
    const reports = db.prepare("SELECT * FROM reports ORDER BY created_at DESC LIMIT 8").all();
    const patientAppointments = db.prepare("SELECT * FROM appointments WHERE LOWER(patient_email) = LOWER(?) OR LOWER(patient_name) = LOWER(?) ORDER BY date ASC").all(patient.email || "", patient.name || "");
    const totalChats = db.prepare("SELECT COUNT(*) as cnt FROM chats").get().cnt;
    const totalReports = db.prepare("SELECT COUNT(*) as cnt FROM reports").get().cnt;

    // Calculate dynamic health metric
    const hasAbnormalReports = reports.some(r => r.status === "attention" || r.status === "critical");
    const healthStatus = hasAbnormalReports ? "Attention Required" : "Optimal Condition";
    const healthScore = hasAbnormalReports ? 86 : 96;

    res.json({
      role: "patient",
      patient,
      healthStatus,
      healthScore,
      stats: {
        totalConsultations: totalChats,
        totalLabReports: totalReports,
        totalAppointments: patientAppointments.length,
        activeAlerts: hasAbnormalReports ? 2 : 0,
        telemetrySync: "Real-Time (Online)",
      },
      patientAppointments,
      recentChats: chats,
      recentReports: reports,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Failed to load dashboard telemetry" });
  }
});

// ============================================================
// POST /api/chat — AI Health Chatbot (Async with Gemini + Multi-Tier AI)
// ============================================================
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Process via Hybrid AI Engine (Live Gemini -> 50+ Medical Topics -> Dynamic Synthesizer)
    const result = await processChatQuery(message);

    // Save to database
    const insertChat = db.prepare(
      "INSERT INTO chats (sender, message, response, keywords) VALUES (?, ?, ?, ?)"
    );
    insertChat.run(
      "User",
      message,
      result.response,
      (result.matchedKeywords || []).join(", ")
    );

    res.json(result);
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ============================================================
// POST /api/symptoms/evaluate — Clinical Symptom Diagnostic Evaluator (Groq AI)
// ============================================================
app.post(["/api/symptoms/evaluate", "/api/symptom-evaluate"], async (req, res) => {
  try {
    const { symptoms, patientNotes } = req.body;
    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ error: "At least one symptom is required for clinical evaluation." });
    }

    const userEmail = req.headers["x-user-email"] || req.query.email;
    const patientProfile = getPatientForUser(userEmail);

    const evaluation = await evaluateSymptomsWithGroq(symptoms, patientNotes, patientProfile);

    // Save to audit logs
    try {
      db.prepare(`
        INSERT INTO audit_logs (actor_name, actor_role, actor_email, action_type, description, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        patientProfile.name || "Patient",
        "patient",
        patientProfile.email || "",
        "SYMPTOM_EVALUATION",
        `Evaluated ${symptoms.length} symptoms via Groq Engine. Primary Indication: ${evaluation.data?.possibleDiseases?.[0]?.name || "Differential"}`,
        evaluation.data?.triageLevel === "EMERGENCY" ? "warning" : "info"
      );
    } catch {}

    res.json(evaluation);
  } catch (err) {
    console.error("Symptom evaluation error:", err);
    res.status(500).json({ error: "Failed to evaluate symptoms", details: err.message });
  }
});

// ============================================================
// POST /api/analyze-report — Medical Report Analyzer
// ============================================================
// POST /api/analyze-report — Medical Report Analyzer & File Parser
// ============================================================
async function handleAnalyzeReport(req, res) {
  try {
    let text = "";
    let filename = "Diagnostic_Report";
    let fileBuffer = null;
    let fileMimeType = null;

    // Check if file was uploaded via req.file or req.files
    const uploadedFile =
      (req.files && (req.files["report"]?.[0] || req.files["file"]?.[0])) ||
      req.file;

    if (uploadedFile) {
      filename = uploadedFile.originalname || "Uploaded_Report.pdf";
      fileMimeType = uploadedFile.mimetype || "";
      const filePath = uploadedFile.path;

      if (fs.existsSync(filePath)) {
        fileBuffer = fs.readFileSync(filePath);
        const ext = path.extname(filename).toLowerCase();

        if (ext === ".pdf" || fileMimeType === "application/pdf") {
          text = await extractPdfText(fileBuffer);
        } else if (
          [".txt", ".csv", ".tsv", ".md", ".json", ".log"].includes(ext) ||
          fileMimeType.startsWith("text/")
        ) {
          text = fileBuffer.toString("utf-8");
        } else if (
          [".png", ".jpg", ".jpeg", ".webp"].includes(ext) ||
          fileMimeType.startsWith("image/")
        ) {
          text = `Medical laboratory report image: ${filename}`;
        } else {
          try {
            text = fileBuffer.toString("utf-8");
          } catch {}
        }
      }
    }

    // Direct text submission (can accompany or override)
    if (req.body && req.body.text && req.body.text.trim()) {
      text = req.body.text.trim();
      if (req.body.filename) {
        filename = req.body.filename;
      } else if (!uploadedFile) {
        filename = "Manual_Entry_Report.txt";
      }
    }

    if (!text && !fileBuffer) {
      return res.status(400).json({ error: "Medical report text or document file is required" });
    }

    // Run deep clinical analyzer (multimodal Gemini Flash + Precision local parser fallback)
    const result = await analyzeReportContent(text || "", filename, {
      buffer: fileBuffer,
      mimeType: fileMimeType
    });

    // Save to database
    try {
      const insertReport = db.prepare(
        "INSERT INTO reports (title, filename, raw_content, summary, status, biomarkers) VALUES (?, ?, ?, ?, ?, ?)"
      );
      insertReport.run(
        `Analysis: ${filename}`,
        filename,
        (text || "").slice(0, 5000),
        result.summary,
        result.status,
        JSON.stringify(result.biomarkers || [])
      );
    } catch (dbErr) {
      console.warn("Report DB insertion notice:", dbErr.message);
    }

    res.json(result);
  } catch (err) {
    console.error("Report analysis handler error:", err);
    res.status(500).json({
      error: "Internal server error during report analysis",
      details: err.message
    });
  }
}

app.post("/api/analyze-report", uploadFields, handleAnalyzeReport);
app.post("/reports/upload", uploadFields, handleAnalyzeReport);
app.post("/api/reports/upload", uploadFields, handleAnalyzeReport);

// ============================================================
// GET /api/patient/download-report — Comprehensive Clinical Dossier
// ============================================================
function generatePatientDossierHtml(patient, reports, chats) {
  const generatedAt = new Date().toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "medium"
  });
  const docId = `MED-VERIFY-${Date.now().toString(36).toUpperCase()}`;

  let bmiStr = "23.4";
  let bmiCat = "Normal";
  try {
    const h = parseFloat((patient.height || "178").replace(/[^\d.]/g, "")) / 100;
    const w = parseFloat((patient.weight || "74").replace(/[^\d.]/g, ""));
    if (h > 0 && w > 0) {
      const bmi = (w / (h * h)).toFixed(1);
      bmiStr = bmi;
      if (bmi < 18.5) bmiCat = "Underweight";
      else if (bmi >= 25 && bmi < 30) bmiCat = "Overweight";
      else if (bmi >= 30) bmiCat = "Obese";
    }
  } catch {}

  const reportsHtml = (reports || []).map((rep, idx) => {
    let biomarkers = [];
    try {
      biomarkers = typeof rep.biomarkers === "string" ? JSON.parse(rep.biomarkers) : (rep.biomarkers || []);
    } catch {}

    const isAbnormal = (rep.status || "").toLowerCase().includes("attention") || (rep.status || "").toLowerCase().includes("critical");

    const bioRows = biomarkers.map(b => {
      const s = (b.status || "").toLowerCase();
      const isWarn = s.includes("elevated") || s.includes("high") || s.includes("low") || s.includes("critical") || s.includes("attention");
      const statusBadge = isWarn
        ? `<span style="display:inline-block; padding:2px 8px; border-radius:4px; font-weight:700; font-size:11px; background:#fee2e2; color:#991b1b; border:1px solid #f87171;">${b.status}</span>`
        : `<span style="display:inline-block; padding:2px 8px; border-radius:4px; font-weight:600; font-size:11px; background:#dcfce7; color:#166534; border:1px solid #86efac;">${b.status || "Optimal"}</span>`;

      return `
        <tr style="border-bottom: 1px solid #e2e8f0; ${isWarn ? "background:#fff1f2;" : ""}">
          <td style="padding: 8px 12px; font-weight:600; color:#1e293b;">${b.name}</td>
          <td style="padding: 8px 12px; font-weight:700; color:${isWarn ? "#b91c1c" : "#0f172a"};">${b.value}</td>
          <td style="padding: 8px 12px; color:#64748b; font-family:monospace; font-size:12px;">${b.ref || "Standard"}</td>
          <td style="padding: 8px 12px;">${statusBadge}</td>
        </tr>
      `;
    }).join("");

    return `
      <div style="margin-bottom: 24px; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background:#ffffff; page-break-inside:avoid;">
        <div style="background: #f8fafc; padding: 12px 16px; border-bottom: 1px solid #cbd5e1; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 style="margin:0; font-size:15px; color:#0f172a;">${idx + 1}. ${rep.title || "Diagnostic Lab Analysis"}</h3>
            <span style="font-size:11px; color:#64748b; font-family:monospace;">Source: ${rep.filename || "Diagnostic Document"} • Date: ${new Date(rep.created_at || Date.now()).toLocaleDateString()}</span>
          </div>
          <div>
            <span style="padding:4px 10px; border-radius:6px; font-size:11px; font-weight:700; ${isAbnormal ? "background:#fef2f2; color:#b91c1c; border:1px solid #fca5a5;" : "background:#f0fdf4; color:#15803d; border:1px solid #86efac;"}">
              ${isAbnormal ? "⚠ ATTENTION REQUIRED" : "✓ OPTIMAL"}
            </span>
          </div>
        </div>

        <div style="padding: 14px 16px;">
          <div style="margin-bottom: 12px; font-size:13px; line-height:1.6; color:#334155; background:#f1f5f9; padding:10px 14px; border-radius:6px; border-left:4px solid #0284c7;">
            <strong>Clinical Interpretation:</strong> ${rep.summary}
          </div>

          ${biomarkers.length > 0 ? `
            <table style="width:100%; border-collapse:collapse; font-size:13px; margin-top:10px;">
              <thead>
                <tr style="background:#f8fafc; border-bottom:2px solid #cbd5e1; text-align:left;">
                  <th style="padding:8px 12px; color:#475569; font-size:11px; text-transform:uppercase;">Test / Biomarker</th>
                  <th style="padding:8px 12px; color:#475569; font-size:11px; text-transform:uppercase;">Measured Result</th>
                  <th style="padding:8px 12px; color:#475569; font-size:11px; text-transform:uppercase;">Reference Range</th>
                  <th style="padding:8px 12px; color:#475569; font-size:11px; text-transform:uppercase;">Diagnostic Status</th>
                </tr>
              </thead>
              <tbody>
                ${bioRows}
              </tbody>
            </table>
          ` : '<p style="color:#64748b; font-size:12px; font-style:italic;">No discrete numerical biomarkers identified.</p>'}
        </div>
      </div>
    `;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Patient Medical Dossier - ${patient.name || "Alex Mercer"}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      background: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.5;
    }
    .paper-sheet {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
    }
    .no-print-toolbar {
      max-width: 900px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.15);
    }
    .btn-action {
      background: #0ea5e9;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
    }
    .btn-action:hover { background: #0284c7; }
    .btn-secondary {
      background: #334155;
      color: #f8fafc;
    }
    .btn-secondary:hover { background: #475569; }

    @media print {
      body { background: #ffffff !important; padding: 0 !important; font-size: 11pt; }
      .paper-sheet { box-shadow: none !important; border: none !important; padding: 0 !important; max-width: 100% !important; }
      .no-print-toolbar { display: none !important; }
      @page { size: A4; margin: 12mm 15mm; }
    }
  </style>
</head>
<body>

  <div class="no-print-toolbar">
    <div style="display:flex; align-items:center; gap:10px;">
      <span style="font-size:18px;">⚕</span>
      <span style="font-weight:700; letter-spacing:0.5px;">MEDICAL AI SUSHRUTA — PATIENT VERIFICATION DOSSIER</span>
    </div>
    <div style="display:flex; gap:10px;">
      <button class="btn-action" onclick="window.print()">🖨️ Print / Save as PDF</button>
      <a class="btn-action btn-secondary" href="/api/patient/download-report">📥 Direct Download</a>
    </div>
  </div>

  <div class="paper-sheet">
    <!-- Header -->
    <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 24px;">
      <div>
        <div style="display:flex; align-items:center; gap:8px; color:#0284c7; font-weight:800; font-size:14px; letter-spacing:1px; text-transform:uppercase;">
          <span>⚕ MEDICAL AI SUSHRUTA</span>
          <span>•</span>
          <span>CLINICAL DIAGNOSTIC INTELLIGENCE</span>
        </div>
        <h1 style="margin: 6px 0 4px; font-size: 24px; color:#0f172a; letter-spacing:-0.5px;">
          PATIENT CLINICAL SUMMARY & VERIFICATION REPORT
        </h1>
        <div style="font-size:12px; color:#64748b;">
          Document Reference: <strong>${docId}</strong> • Generated: ${generatedAt}
        </div>
      </div>
      <div style="text-align:right;">
        <span style="display:inline-block; background:#0f172a; color:#ffffff; font-size:11px; font-weight:700; padding:6px 12px; border-radius:4px; letter-spacing:1px; text-transform:uppercase;">
          PHYSICIAN COPY
        </span>
        <div style="font-size:10px; color:#64748b; margin-top:6px; font-family:monospace;">
          CONFIDENTIAL HEALTH RECORD
        </div>
      </div>
    </div>

    <!-- Section 1: Patient Demographics & Profile -->
    <div style="margin-bottom: 24px;">
      <h2 style="font-size: 14px; text-transform:uppercase; letter-spacing:1px; color:#0284c7; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
        1. Patient Identification & Demographics
      </h2>
      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 12px; font-size: 13px;">
        <div style="background:#f8fafc; padding:10px 14px; border-radius:6px; border:1px solid #e2e8f0;">
          <div style="font-size:11px; color:#64748b; text-transform:uppercase;">Patient Full Name</div>
          <div style="font-size:15px; font-weight:700; color:#0f172a;">${patient.name || "Alex Mercer"}</div>
          <div style="font-size:11px; color:#64748b; font-family:monospace;">MRN: #MED-${String(patient.id || 1).padStart(5, "0")}</div>
        </div>

        <div style="background:#f8fafc; padding:10px 14px; border-radius:6px; border:1px solid #e2e8f0;">
          <div style="font-size:11px; color:#64748b; text-transform:uppercase;">Age & Biological Sex</div>
          <div style="font-size:15px; font-weight:700; color:#0f172a;">${patient.age || 34} Years • ${patient.gender || "Male"}</div>
          <div style="font-size:11px; color:#0284c7; font-weight:600;">Blood: ${patient.blood_group || "O+ (Positive)"}</div>
        </div>

        <div style="background:#f8fafc; padding:10px 14px; border-radius:6px; border:1px solid #e2e8f0;">
          <div style="font-size:11px; color:#64748b; text-transform:uppercase;">Height / Weight / BMI</div>
          <div style="font-size:15px; font-weight:700; color:#0f172a;">${patient.height || "178 cm"} / ${patient.weight || "74 kg"}</div>
          <div style="font-size:11px; color:#475569;">BMI: <strong>${bmiStr}</strong> (${bmiCat})</div>
        </div>

        <div style="background:#f8fafc; padding:10px 14px; border-radius:6px; border:1px solid #e2e8f0;">
          <div style="font-size:11px; color:#64748b; text-transform:uppercase;">Contact Phone</div>
          <div style="font-weight:600; color:#0f172a;">${patient.phone || "Not recorded"}</div>
        </div>

        <div style="background:#f8fafc; padding:10px 14px; border-radius:6px; border:1px solid #e2e8f0;">
          <div style="font-size:11px; color:#64748b; text-transform:uppercase;">Email Address</div>
          <div style="font-weight:600; color:#0f172a;">${patient.email || "Not recorded"}</div>
        </div>

        <div style="background:#f8fafc; padding:10px 14px; border-radius:6px; border:1px solid #e2e8f0;">
          <div style="font-size:11px; color:#64748b; text-transform:uppercase;">Attending Physician</div>
          <div style="font-weight:700; color:#0284c7;">${patient.primary_physician || "Dr. Aris Thorne, MD"}</div>
        </div>
      </div>
    </div>

    <!-- Section 2: Physiological Vitals & Clinical Alerts -->
    <div style="margin-bottom: 24px;">
      <h2 style="font-size: 14px; text-transform:uppercase; letter-spacing:1px; color:#0284c7; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
        2. Current Vitals & Medical Background
      </h2>
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px;">
        <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:10px; border-radius:6px; text-align:center;">
          <div style="font-size:10px; color:#166534; font-weight:700; text-transform:uppercase;">Blood Pressure</div>
          <div style="font-size:18px; font-weight:800; color:#14532d; margin:2px 0;">${patient.blood_pressure || "120/80 mmHg"}</div>
          <div style="font-size:10px; color:#166534;">Standard Normative</div>
        </div>

        <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:10px; border-radius:6px; text-align:center;">
          <div style="font-size:10px; color:#166534; font-weight:700; text-transform:uppercase;">Heart Rate</div>
          <div style="font-size:18px; font-weight:800; color:#14532d; margin:2px 0;">${patient.heart_rate || "72 bpm"}</div>
          <div style="font-size:10px; color:#166534;">Normal Sinus (60-100)</div>
        </div>

        <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:10px; border-radius:6px; text-align:center;">
          <div style="font-size:10px; color:#166534; font-weight:700; text-transform:uppercase;">Temperature</div>
          <div style="font-size:18px; font-weight:800; color:#14532d; margin:2px 0;">${patient.temperature || "98.6 °F"}</div>
          <div style="font-size:10px; color:#166534;">Afebrile (97.7-99.5)</div>
        </div>

        <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:10px; border-radius:6px; text-align:center;">
          <div style="font-size:10px; color:#166534; font-weight:700; text-transform:uppercase;">Oxygen Sat (SpO2)</div>
          <div style="font-size:18px; font-weight:800; color:#14532d; margin:2px 0;">${patient.spo2 || "99%"}</div>
          <div style="font-size:10px; color:#166534;">Optimal (≥95%)</div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="background:#fff1f2; border:1px solid #fecdd3; border-radius:6px; padding:10px 14px;">
          <div style="font-size:11px; font-weight:700; color:#9f1239; text-transform:uppercase;">⚠ Documented Allergies</div>
          <div style="font-size:13px; font-weight:600; color:#881337; margin-top:2px;">${patient.allergies || "None Reported"}</div>
        </div>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px 14px;">
          <div style="font-size:11px; font-weight:700; color:#475569; text-transform:uppercase;">🩺 Chronic Diagnoses / History</div>
          <div style="font-size:13px; font-weight:600; color:#1e293b; margin-top:2px;">${patient.chronic_conditions || "None Reported"}</div>
        </div>
      </div>
    </div>

    <!-- Section 3: Diagnostic Laboratory Reports -->
    <div style="margin-bottom: 24px;">
      <h2 style="font-size: 14px; text-transform:uppercase; letter-spacing:1px; color:#0284c7; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
        3. Comprehensive Diagnostic Laboratory Reports (${(reports || []).length} Record${(reports || []).length === 1 ? "" : "s"})
      </h2>
      ${reportsHtml || '<p style="color:#64748b; font-size:13px;">No lab reports recorded in the database.</p>'}
    </div>

    <!-- Section 4: Physician Attestation & Verification (Doctor Signoff) -->
    <div style="margin-top: 30px; border: 2px solid #0f172a; border-radius: 8px; padding: 20px; background:#f8fafc; page-break-inside: avoid;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #cbd5e1; padding-bottom: 10px; margin-bottom: 14px;">
        <h2 style="margin:0; font-size: 15px; color:#0f172a; text-transform:uppercase; letter-spacing:1px;">
          4. Attending Physician Clinical Verification & Attestation
        </h2>
        <span style="font-size:11px; font-weight:700; color:#0284c7; font-family:monospace;">
          REQUIRED FOR CLINICAL VALIDATION
        </span>
      </div>

      <p style="font-size:12px; color:#475569; margin: 0 0 14px;">
        I hereby certify that I have verified the patient demographics, examined the correlated diagnostic laboratory biomarkers, and issued the relevant clinical directives detailed below.
      </p>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px; margin-bottom: 16px;">
        <label style="display:flex; align-items:center; gap:8px;">
          <input type="checkbox" style="width:16px; height:16px;" checked />
          <span>Patient identity and vitals verified</span>
        </label>
        <label style="display:flex; align-items:center; gap:8px;">
          <input type="checkbox" style="width:16px; height:16px;" checked />
          <span>Diagnostic lab biomarker deviations reviewed</span>
        </label>
        <label style="display:flex; align-items:center; gap:8px;">
          <input type="checkbox" style="width:16px; height:16px;" />
          <span>Prescription or treatment regimen updated</span>
        </label>
        <label style="display:flex; align-items:center; gap:8px;">
          <input type="checkbox" style="width:16px; height:16px;" />
          <span>Follow-up consultation scheduled</span>
        </label>
      </div>

      <div style="margin-bottom: 16px;">
        <div style="font-size:11px; font-weight:700; color:#334155; text-transform:uppercase; margin-bottom:4px;">
          Physician Clinical Notes & Management Directives:
        </div>
        <div style="border: 1px dashed #94a3b8; height: 70px; background:#ffffff; border-radius:4px; padding:8px; font-size:12px; color:#94a3b8;">
          [ Doctor may write or stamp clinical directives, prescription orders, and follow-up instructions here ]
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap: 20px; align-items:flex-end; padding-top: 10px; border-top: 1px solid #cbd5e1;">
        <div>
          <div style="font-size:11px; color:#64748b; text-transform:uppercase;">Attending Physician Name & License #</div>
          <div style="border-bottom: 1px solid #0f172a; height: 28px; font-weight:700; color:#0f172a; padding-top:6px; font-size:13px;">
            ${patient.primary_physician || "Dr. Aris Thorne, MD"}
          </div>
        </div>

        <div>
          <div style="font-size:11px; color:#64748b; text-transform:uppercase;">Physician Signature</div>
          <div style="border-bottom: 1px solid #0f172a; height: 28px;"></div>
        </div>

        <div>
          <div style="font-size:11px; color:#64748b; text-transform:uppercase;">Verification Date</div>
          <div style="border-bottom: 1px solid #0f172a; height: 28px; padding-top:6px; font-size:12px; color:#0f172a;">
            ${new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Disclaimer -->
    <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color:#94a3b8; line-height:1.5; text-align:center;">
      This clinical summary dossier was prepared by Medical AI Sushruta for clinical reference and verification by an authorized medical practitioner.
      It does not replace independent clinical evaluation or hospital admission procedures. Confidential Medical Record.
    </div>
  </div>

</body>
</html>`;
}

app.get("/api/patient/download-report", (req, res) => {
  try {
    const patient = getOrCreateDefaultPatient();
    const reports = db.prepare("SELECT * FROM reports ORDER BY created_at DESC").all();
    const chats = db.prepare("SELECT * FROM chats ORDER BY created_at DESC LIMIT 10").all();

    if (req.query.format === "json") {
      return res.json({
        patient,
        reports,
        chats,
        generated_at: new Date().toISOString()
      });
    }

    const html = generatePatientDossierHtml(patient, reports, chats);
    const sanitizedName = (patient.name || "Patient").replace(/[^a-zA-Z0-9_-]/g, "_");
    const dateTag = new Date().toISOString().slice(0, 10);
    const filename = `Medical_Dossier_${sanitizedName}_${dateTag}.html`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    if (req.query.view === "1" || req.query.preview === "1") {
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    } else {
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    }
    res.send(html);
  } catch (err) {
    console.error("Download dossier error:", err);
    res.status(500).json({ error: "Failed to generate patient dossier" });
  }
});

app.get("/api/patient/dossier", (req, res) => {
  req.url = "/api/patient/download-report" + (req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "");
  app._router.handle(req, res);
});

// GET /api/history — Fetch past chats and report logs
// ============================================================
app.get("/api/history", (req, res) => {
  try {
    const chats = db
      .prepare("SELECT * FROM chats ORDER BY created_at DESC LIMIT 50")
      .all();
    const reports = db
      .prepare("SELECT * FROM reports ORDER BY created_at DESC LIMIT 50")
      .all();

    res.json({ chats, reports });
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ============================================================
// DOCTOR & e-SCHEDULING ENDPOINTS (BOOK A DOCTOR SYSTEM)
// ============================================================

// GET /api/doctors — List doctors with optional search and specialization filtering
app.get("/api/doctors", (req, res) => {
  try {
    const { search, specialization } = req.query;
    let query = "SELECT * FROM doctors WHERE is_approved = 1";
    const params = [];

    if (specialization && specialization.trim() && specialization !== "All") {
      query += " AND LOWER(specialization) = LOWER(?)";
      params.push(specialization.trim());
    }

    if (search && search.trim()) {
      query += " AND (LOWER(name) LIKE LOWER(?) OR LOWER(bio) LIKE LOWER(?) OR LOWER(specialization) LIKE LOWER(?))";
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += " ORDER BY rating DESC, experience DESC";

    const doctors = db.prepare(query).all(...params);
    const parsedDoctors = doctors.map(doc => ({
      ...doc,
      availability: doc.availability ? JSON.parse(doc.availability) : []
    }));

    res.json({ success: true, count: parsedDoctors.length, data: parsedDoctors });
  } catch (err) {
    console.error("Get doctors error:", err);
    res.status(500).json({ success: false, error: "Failed to retrieve doctors list" });
  }
});

// GET /api/doctors/:id — Get doctor details & availability
app.get("/api/doctors/:id", (req, res) => {
  try {
    const doc = db.prepare("SELECT * FROM doctors WHERE id = ?").get(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, error: "Doctor not found" });
    }
    const doctor = {
      ...doc,
      availability: doc.availability ? JSON.parse(doc.availability) : []
    };
    res.json({ success: true, data: doctor });
  } catch (err) {
    console.error("Get doctor by id error:", err);
    res.status(500).json({ success: false, error: "Failed to retrieve doctor profile" });
  }
});

// POST /api/doctors — Register a new specialist profile
app.post("/api/doctors", (req, res) => {
  try {
    const { name, email, phone, specialization, bio, experience, fees, availability, avatar } = req.body;
    if (!name || !specialization) {
      return res.status(400).json({ success: false, error: "Doctor name and specialization are required" });
    }

    const defaultSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];
    const availJson = availability
      ? JSON.stringify(availability)
      : JSON.stringify([
          { day: "Monday", slots: defaultSlots },
          { day: "Wednesday", slots: defaultSlots },
          { day: "Friday", slots: defaultSlots }
        ]);

    const insert = db.prepare(`
      INSERT INTO doctors (
        name, email, phone, specialization, bio, experience, fees, rating, reviews_count, avatar, availability, is_approved
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const info = insert.run(
      name,
      email || `${name.toLowerCase().replace(/[^a-z]/g, "")}@sushruta-med.com`,
      phone || "+1 (555) 000-0000",
      specialization,
      bio || `Specialist in ${specialization} with clinical expertise.`,
      experience ? parseInt(experience, 10) : 5,
      fees ? parseFloat(fees) : 120,
      4.9,
      1,
      avatar || "👨‍⚕️",
      availJson
    );

    const created = db.prepare("SELECT * FROM doctors WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json({
      success: true,
      message: "Doctor profile created successfully",
      data: {
        ...created,
        availability: JSON.parse(created.availability)
      }
    });
  } catch (err) {
    console.error("Create doctor error:", err);
    res.status(500).json({ success: false, error: "Failed to create doctor profile" });
  }
});

// GET /api/appointments — List all booked appointments
app.get("/api/appointments", (req, res) => {
  try {
    const appointments = db.prepare("SELECT * FROM appointments ORDER BY date ASC, time_slot ASC").all();
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (err) {
    console.error("Get appointments error:", err);
    res.status(500).json({ success: false, error: "Failed to retrieve appointments" });
  }
});

// POST /api/appointments — Book an appointment slot
app.post("/api/appointments", (req, res) => {
  try {
    const { doctorId, date, timeSlot, notes, patientName, patientEmail, patientPhone, documentName, documentUrl } = req.body;
    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({ success: false, error: "Doctor, appointment date, and time slot are required." });
    }

    const doctor = db.prepare("SELECT * FROM doctors WHERE id = ?").get(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, error: "Selected doctor profile does not exist." });
    }

    // Check for double booking at the same slot
    const existing = db.prepare("SELECT * FROM appointments WHERE doctor_id = ? AND date = ? AND time_slot = ? AND status != 'cancelled'").get(doctorId, date, timeSlot);
    if (existing) {
      return res.status(409).json({ success: false, error: `This time slot (${timeSlot}) on ${date} is already booked. Please choose another slot.` });
    }

    // Get default patient if not provided
    const patient = db.prepare("SELECT * FROM patients ORDER BY id ASC LIMIT 1").get();
    const finalPatientName = patientName || patient?.name || "Alex Mercer";
    const finalPatientEmail = patientEmail || patient?.email || "alex.mercer@sushruta-ai.local";
    const finalPatientPhone = patientPhone || patient?.phone || "+1 (555) 382-9012";

    const insert = db.prepare(`
      INSERT INTO appointments (
        doctor_id, doctor_name, specialization, patient_name, patient_email, patient_phone, date, time_slot, notes, document_url, document_name, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
    `);

    const info = insert.run(
      doctor.id,
      doctor.name,
      doctor.specialization,
      finalPatientName,
      finalPatientEmail,
      finalPatientPhone,
      date,
      timeSlot,
      notes || "Routine consultation & clinical evaluation.",
      documentUrl || "",
      documentName || "",
    );

    const booked = db.prepare("SELECT * FROM appointments WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json({
      success: true,
      message: `Appointment successfully confirmed with ${doctor.name} on ${date} at ${timeSlot}!`,
      data: booked
    });
  } catch (err) {
    console.error("Book appointment error:", err);
    res.status(500).json({ success: false, error: "Failed to book appointment" });
  }
});

// PATCH /api/appointments/:id/status — Update status (confirmed, cancelled, completed)
app.patch("/api/appointments/:id/status", (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: "Status is required" });
    }

    const stmt = db.prepare("UPDATE appointments SET status = ? WHERE id = ?");
    stmt.run(status, req.params.id);

    const updated = db.prepare("SELECT * FROM appointments WHERE id = ?").get(req.params.id);
    res.json({ success: true, message: `Appointment status updated to ${status}`, data: updated });
  } catch (err) {
    console.error("Update appointment status error:", err);
    res.status(500).json({ success: false, error: "Failed to update status" });
  }
});

// DELETE /api/appointments/:id — Cancel appointment
app.delete("/api/appointments/:id", (req, res) => {
  try {
    const stmt = db.prepare("DELETE FROM appointments WHERE id = ?");
    stmt.run(req.params.id);
    res.json({ success: true, message: "Appointment cancelled successfully" });
  } catch (err) {
    console.error("Delete appointment error:", err);
    res.status(500).json({ success: false, error: "Failed to cancel appointment" });
  }
});

// ============================================================
// AUTHENTICATION & ACCOUNT ENDPOINTS (ADMIN, PATIENT, DOCTOR)
// ============================================================

// POST /api/auth/login — Sign in with email & password
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = db.prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?)").get(email.trim());
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email credentials or account does not exist." });
    }

    if (user.password && user.password !== password) {
      return res.status(401).json({ success: false, message: "Incorrect password. Please verify and try again." });
    }

    // If role is doctor, fetch doctor profile details
    let doctor = null;
    if (user.role === "doctor" && user.doctor_id) {
      const doc = db.prepare("SELECT * FROM doctors WHERE id = ?").get(user.doctor_id);
      if (doc) {
        doctor = {
          ...doc,
          availability: doc.availability ? JSON.parse(doc.availability) : []
        };
      }
    }

    const token = `sushruta_token_${user.id}_${Date.now()}`;
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      contactInfo: user.contact_info,
      doctorId: user.doctor_id
    };

    res.json({
      success: true,
      message: `Welcome back, ${user.name}! Signed in as ${user.role.toUpperCase()}.`,
      token,
      user: safeUser,
      doctor
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Internal server authentication error" });
  }
});

// POST /api/auth/register — Create a new patient or doctor account
app.post("/api/auth/register", (req, res) => {
  try {
    const { name, email, password, role = "patient", contactInfo } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    const existing = db.prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)").get(email.trim());
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with this email address already exists." });
    }

    const insert = db.prepare(`
      INSERT INTO users (name, email, password, role, contact_info)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = insert.run(name, email.trim(), password, role, contactInfo || "");
    const token = `sushruta_token_${info.lastInsertRowid}_${Date.now()}`;

    res.status(201).json({
      success: true,
      message: "Account registered successfully!",
      token,
      user: {
        id: info.lastInsertRowid,
        name,
        email,
        role,
        contactInfo
      }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Failed to register account" });
  }
});

// GET /api/auth/demo-accounts — Fast account switcher for Admin, Doctor, and Patient
app.get("/api/auth/demo-accounts", (req, res) => {
  try {
    const users = db.prepare("SELECT id, name, email, password, role, contact_info, doctor_id FROM users ORDER BY id ASC").all();
    res.json({ success: true, count: users.length, accounts: users });
  } catch (err) {
    console.error("Demo accounts error:", err);
    res.status(500).json({ success: false, message: "Failed to load accounts" });
  }
});

// ============================================================
// ADMIN API ROUTES
// ============================================================

// GET /api/admin/doctors — Full doctor verification directory
app.get("/api/admin/doctors", (req, res) => {
  try {
    const doctors = db.prepare("SELECT * FROM doctors ORDER BY is_approved ASC, id ASC").all();
    const formatted = doctors.map(d => ({
      ...d,
      availability: d.availability ? (typeof d.availability === "string" ? JSON.parse(d.availability) : d.availability) : []
    }));
    const pendingCount = doctors.filter(d => !d.is_approved).length;
    const approvedCount = doctors.filter(d => d.is_approved).length;

    res.json({
      success: true,
      count: doctors.length,
      pendingCount,
      approvedCount,
      doctors: formatted
    });
  } catch (err) {
    console.error("Admin doctors error:", err);
    res.status(500).json({ success: false, message: "Failed to load doctor directory" });
  }
});

// PUT /api/admin/doctors/:id/approve — Verify and accept doctor application
app.put("/api/admin/doctors/:id/approve", (req, res) => {
  try {
    const { id } = req.params;
    const doc = db.prepare("SELECT * FROM doctors WHERE id = ?").get(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    db.prepare("UPDATE doctors SET is_approved = 1 WHERE id = ?").run(id);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (actor_name, actor_role, actor_email, action_type, description, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run("System Admin", "admin", "admin@gmail.com", "DOCTOR_VERIFIED", `Approved & verified medical credentials for ${doc.name} (${doc.specialization}).`, "success");

    res.json({ success: true, message: `Doctor ${doc.name} has been verified and approved!` });
  } catch (err) {
    console.error("Approve doctor error:", err);
    res.status(500).json({ success: false, message: "Failed to approve doctor" });
  }
});

// PUT /api/admin/doctors/:id/reject — Reject or suspend doctor application
app.put("/api/admin/doctors/:id/reject", (req, res) => {
  try {
    const { id } = req.params;
    const doc = db.prepare("SELECT * FROM doctors WHERE id = ?").get(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    db.prepare("UPDATE doctors SET is_approved = 0 WHERE id = ?").run(id);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (actor_name, actor_role, actor_email, action_type, description, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run("System Admin", "admin", "admin@gmail.com", "DOCTOR_SUSPENDED", `Suspended or rejected verification for ${doc.name} (${doc.specialization}).`, "warning");

    res.json({ success: true, message: `Doctor ${doc.name} verification status set to rejected/pending.` });
  } catch (err) {
    console.error("Reject doctor error:", err);
    res.status(500).json({ success: false, message: "Failed to reject doctor" });
  }
});

// GET /api/admin/activities — Activity Audit Logs for Doctors and Patients
app.get("/api/admin/activities", (req, res) => {
  try {
    const { role, action, search } = req.query;
    let query = "SELECT * FROM audit_logs WHERE 1=1";
    const params = [];

    if (role && role !== "all") {
      query += " AND LOWER(actor_role) = LOWER(?)";
      params.push(role);
    }
    if (action && action !== "all") {
      query += " AND action_type = ?";
      params.push(action);
    }
    if (search && search.trim()) {
      query += " AND (LOWER(actor_name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?) OR LOWER(actor_email) LIKE LOWER(?))";
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    query += " ORDER BY created_at DESC LIMIT 100";
    const logs = db.prepare(query).all(...params);

    const doctorActionCount = db.prepare("SELECT COUNT(*) as cnt FROM audit_logs WHERE actor_role = 'doctor'").get().cnt;
    const patientActionCount = db.prepare("SELECT COUNT(*) as cnt FROM audit_logs WHERE actor_role = 'patient'").get().cnt;
    const adminActionCount = db.prepare("SELECT COUNT(*) as cnt FROM audit_logs WHERE actor_role = 'admin'").get().cnt;

    res.json({
      success: true,
      count: logs.length,
      stats: {
        total: logs.length,
        doctorActions: doctorActionCount,
        patientActions: patientActionCount,
        adminActions: adminActionCount
      },
      logs
    });
  } catch (err) {
    console.error("Admin activities error:", err);
    res.status(500).json({ success: false, message: "Failed to load audit logs" });
  }
});

// POST /api/admin/activities — Log a new action
app.post("/api/admin/activities", (req, res) => {
  try {
    const { actor_name, actor_role, actor_email, action_type, description, status } = req.body;
    const insert = db.prepare(`
      INSERT INTO audit_logs (actor_name, actor_role, actor_email, action_type, description, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insert.run(
      actor_name || "Anonymous",
      actor_role || "patient",
      actor_email || "",
      action_type || "ACTION",
      description || "",
      status || "success"
    );
    res.json({ success: true, message: "Activity logged" });
  } catch (err) {
    console.error("Log activity error:", err);
    res.status(500).json({ success: false, message: "Failed to log activity" });
  }
});

// GET /api/admin/bookings — Complete bookings and confirmations dispatch center
app.get("/api/admin/bookings", (req, res) => {
  try {
    const appointments = db.prepare("SELECT * FROM appointments ORDER BY date DESC, time_slot DESC").all();
    const total = appointments.length;
    const confirmed = appointments.filter(a => a.status === "confirmed").length;
    const pending = appointments.filter(a => a.status === "pending").length;
    const cancelled = appointments.filter(a => a.status === "cancelled").length;
    const completed = appointments.filter(a => a.status === "completed").length;

    res.json({
      success: true,
      stats: {
        total,
        confirmed,
        pending,
        cancelled,
        completed
      },
      appointments
    });
  } catch (err) {
    console.error("Admin bookings error:", err);
    res.status(500).json({ success: false, message: "Failed to load bookings" });
  }
});

// PUT /api/admin/bookings/:id/status — Update appointment status
app.put("/api/admin/bookings/:id/status", (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const appt = db.prepare("SELECT * FROM appointments WHERE id = ?").get(id);
    if (!appt) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    db.prepare("UPDATE appointments SET status = ? WHERE id = ?").run(status, id);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (actor_name, actor_role, actor_email, action_type, description, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      "System Admin",
      "admin",
      "admin@gmail.com",
      status === "confirmed" ? "APPOINTMENT_CONFIRMED" : status === "cancelled" ? "APPOINTMENT_CANCELLED" : "APPOINTMENT_UPDATED",
      `Admin updated booking #${id} (${appt.patient_name} with ${appt.doctor_name}) to ${status.toUpperCase()}.`,
      status === "cancelled" ? "warning" : "success"
    );

    res.json({ success: true, message: `Appointment status updated to ${status}` });
  } catch (err) {
    console.error("Update appointment error:", err);
    res.status(500).json({ success: false, message: "Failed to update appointment" });
  }
});

// GET /api/admin/accountant/transactions — Accountant Financial & Revenue Ledger
app.get("/api/admin/accountant/transactions", (req, res) => {
  try {
    const transactions = db.prepare("SELECT * FROM transactions ORDER BY transaction_date DESC").all();
    const totalGross = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
    const totalPlatformFee = transactions.reduce((acc, t) => acc + (t.platform_fee || 0), 0);
    const totalDoctorPayout = transactions.reduce((acc, t) => acc + (t.doctor_payout || 0), 0);
    const settledCount = transactions.filter(t => t.payment_status === "Settled" || t.payment_status === "Completed").length;
    const pendingCount = transactions.filter(t => t.payment_status === "Pending").length;

    res.json({
      success: true,
      stats: {
        totalGross: Number(totalGross.toFixed(2)),
        totalPlatformFee: Number(totalPlatformFee.toFixed(2)),
        totalDoctorPayout: Number(totalDoctorPayout.toFixed(2)),
        settledCount,
        pendingCount,
        transactionCount: transactions.length
      },
      transactions
    });
  } catch (err) {
    console.error("Accountant transactions error:", err);
    res.status(500).json({ success: false, message: "Failed to load accountant ledger" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "online", engine: "Medical AI Sushruta (Gemini 2.5 Flash Enabled)", version: "2.0.0" });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`====================================================`);
  console.log(` Medical AI Sushruta Express Backend Running`);
  console.log(` Port: ${PORT} (0.0.0.0)`);
  console.log(` Database: SQLite (medical_ai.sqlite active)`);
  console.log(` Engine: Gemini 2.5 Flash + 50+ Medical Topics`);
  console.log(` Endpoints:`);
  console.log(`   GET  /api/dashboard`);
  console.log(`   GET  /api/patient`);
  console.log(`   PUT  /api/patient`);
  console.log(`   POST /api/chat`);
  console.log(`   POST /api/analyze-report`);
  console.log(`   GET  /api/history`);
  console.log(`====================================================`);
});
