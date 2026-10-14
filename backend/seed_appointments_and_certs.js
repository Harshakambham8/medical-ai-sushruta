import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import db from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function createMinimalPdf(title, doctorName, specialty, licenseNo, issueDate) {
  const content = [
    "BT",
    "/F1 20 Tf",
    "50 720 Td",
    `(${title}) Tj`,
    "/F1 12 Tf",
    "0 -30 Td",
    "(============================================================) Tj",
    "0 -25 Td",
    "(STATE MEDICAL BOARD OF LICENSURE & CREDENTIALING) Tj",
    "0 -25 Td",
    "(Official Board Certification of Medical Practice) Tj",
    "0 -35 Td",
    "/F1 16 Tf",
    `(PHYSICIAN: ${doctorName}) Tj`,
    "0 -25 Td",
    "/F1 12 Tf",
    `(SPECIALTY: ${specialty}) Tj`,
    "0 -20 Td",
    `(STATE LICENSE NUMBER: ${licenseNo}) Tj`,
    "0 -20 Td",
    "(BOARD STATUS: ACTIVE & VERIFIED CLINICAL CREDENTIALS) Tj",
    "0 -20 Td",
    `(REGISTRATION DATE: ${issueDate}) Tj`,
    "0 -35 Td",
    "(============================================================) Tj",
    "0 -25 Td",
    "(Authenticated by Sushruta Medical Council of Clinical Licensure) Tj",
    "ET"
  ].join("\n");

  const streamLen = Buffer.byteLength(content);

  const objects = [
    "%PDF-1.4\n",
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${streamLen} >>\nstream\n${content}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
  ];

  let offset = 0;
  const offsets = [];
  let pdf = "";
  for (const obj of objects) {
    offsets.push(offset);
    pdf += obj;
    offset += Buffer.byteLength(obj, "utf-8");
  }

  const xrefOffset = offset;
  let xref = "xref\n0 6\n0000000000 65535 f \n";
  for (let i = 1; i <= 5; i++) {
    xref += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
  }

  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf + xref + trailer, "utf-8");
}

// 1. UPDATE ALL EXISTING DOCTORS WITH CERTIFICATIONS
const doctorCertificates = [
  { id: 1, name: "Dr. Jane Hart, MD", spec: "Cardiology", lic: "MD-CARDIO-48921", date: "2023-04-12" },
  { id: 2, name: "Dr. Sarah Skinner, MD", spec: "Dermatology", lic: "MD-DERM-73104", date: "2023-06-18" },
  { id: 3, name: "Dr. Albert Medic, MD", spec: "General Medicine", lic: "MD-GENMED-10928", date: "2021-11-05" },
  { id: 4, name: "Dr. Charles Brain, MD, PhD", spec: "Neurology", lic: "MD-NEURO-99214", date: "2022-08-20" },
  { id: 5, name: "Dr. Arthur Bone, MD", spec: "Orthopedics", lic: "MD-ORTHO-67120", date: "2022-03-14" },
  { id: 6, name: "Dr. Sigmund Mind, MD", spec: "Psychiatry", lic: "MD-PSYCH-88231", date: "2023-01-22" },
  { id: 7, name: "Dr. Alice Mother, MD", spec: "Gynecology", lic: "MD-GYNEC-44189", date: "2022-10-30" },
  { id: 8, name: "Dr. Bruce Child, MD", spec: "Pediatrics", lic: "MD-PEDIAT-33290", date: "2024-02-15" },
  { id: 9, name: "Dr. Marcus Vance, MD", spec: "Neurology", lic: "MD-NEURO-78901", date: "2023-09-08" },
  { id: 10, name: "Dr. Elena Rostova, MD", spec: "Dermatology & Oncology", lic: "MD-DERMONC-89012", date: "2024-05-10" },
  { id: 11, name: "Dr. David K. Miller, MD", spec: "Orthopedic Surgery", lic: "MD-ORTHOSURG-90123", date: "2024-06-25" }
];

const updateDoc = db.prepare(
  "UPDATE doctors SET certificate_url = ?, certificate_filename = ?, license_number = ? WHERE id = ?"
);

for (const d of doctorCertificates) {
  const safeName = d.name.toLowerCase().replace(/[^a-z]/g, "_").replace(/_+/g, "_").replace(/_$/, "");
  const fileName = `certificate_${safeName}.pdf`;
  const filePath = path.join(uploadsDir, fileName);

  const pdfBuffer = createMinimalPdf("CERTIFICATE OF MEDICAL PRACTICE", d.name, d.spec, d.lic, d.date);
  fs.writeFileSync(filePath, pdfBuffer);

  const displayFilename = `${d.name.replace(/[^a-zA-Z]/g, "_")}_Board_Certification.pdf`;
  updateDoc.run(`/uploads/${fileName}`, displayFilename, d.lic, d.id);
  console.log(`[CERT] Generated & linked for: ${d.name} (${fileName})`);
}

// 2. CREATE APPOINTMENTS FOR EVERY VERIFIED DOCTOR & EVERY PATIENT
// EXCLUDE UNVERIFIED DOCTORS (is_approved = 0)
const patients = db.prepare("SELECT * FROM patients ORDER BY id ASC").all();
const verifiedDocs = db.prepare("SELECT * FROM doctors WHERE is_approved = 1 ORDER BY id ASC").all();
const unverifiedDocs = db.prepare("SELECT * FROM doctors WHERE is_approved = 0 ORDER BY id ASC").all();

console.log(`Verified Doctors (${verifiedDocs.length}):`, verifiedDocs.map(d => d.name));
console.log(`Unverified Doctors (EXCLUDED) (${unverifiedDocs.length}):`, unverifiedDocs.map(d => d.name));
console.log(`Patients (${patients.length}):`, patients.map(p => p.name));

const appointmentRoster = [
  // Patient 1: Alex Mercer / Prashanth Chinthala
  {
    docId: 1, // Dr. Jane Hart (Cardiology)
    patientEmail: "alex.mercer@sushruta-ai.local",
    date: "2026-10-15",
    timeSlot: "09:00 AM",
    notes: "Cardiovascular telemetry review, blood pressure log evaluation, and beta-blocker assessment.",
    status: "confirmed"
  },
  {
    docId: 3, // Dr. Albert Medic (General Medicine)
    patientEmail: "alex.mercer@sushruta-ai.local",
    date: "2026-10-18",
    timeSlot: "11:00 AM",
    notes: "Annual primary care physical, seasonal asthma spirometry, and routine metabolic panel.",
    status: "confirmed"
  },

  // Patient 2: John Patient
  {
    docId: 1, // Dr. Jane Hart (Cardiology)
    patientEmail: "patient1@gmail.com",
    date: "2026-10-16",
    timeSlot: "10:00 AM",
    notes: "Hyperlipidemia lipid panel follow-up, dietary cholesterol management, and carotid ultrasound.",
    status: "confirmed"
  },
  {
    docId: 3, // Dr. Albert Medic (General Medicine)
    patientEmail: "patient1@gmail.com",
    date: "2026-10-19",
    timeSlot: "02:00 PM",
    notes: "Prediabetes fasting glucose monitoring, HbA1c review, and exercise regimen optimization.",
    status: "pending"
  },

  // Patient 3: Sarah Patient
  {
    docId: 4, // Dr. Charles Brain (Neurology)
    patientEmail: "patient2@gmail.com",
    date: "2026-10-16",
    timeSlot: "01:00 PM",
    notes: "Acute recurring migraine episodes with visual scotoma, photophobia, and prophylactic options.",
    status: "confirmed"
  },
  {
    docId: 2, // Dr. Sarah Skinner (Dermatology)
    patientEmail: "patient2@gmail.com",
    date: "2026-10-20",
    timeSlot: "09:30 AM",
    notes: "Latex and seasonal allergic rhinitis dermatitis examination with non-steroid barrier cream trial.",
    status: "completed"
  },

  // Patient 4: Elena Vasquez
  {
    docId: 4, // Dr. Charles Brain (Neurology)
    patientEmail: "elena.vasquez@gmail.com",
    date: "2026-10-15",
    timeSlot: "02:30 PM",
    notes: "Chronic occipital tension headache management and sleep architecture assessment.",
    status: "confirmed"
  },
  {
    docId: 7, // Dr. Alice Mother (Gynecology)
    patientEmail: "elena.vasquez@gmail.com",
    date: "2026-10-21",
    timeSlot: "10:30 AM",
    notes: "Hashimoto thyroiditis systemic endocrine correlation and pelvic ultrasound review.",
    status: "pending"
  },

  // Patient 5: Marcus Sterling
  {
    docId: 3, // Dr. Albert Medic (General Medicine)
    patientEmail: "marcus.sterling@gmail.com",
    date: "2026-10-17",
    timeSlot: "09:00 AM",
    notes: "Type 2 diabetes quarterly review, fasting blood sugar log, and peripheral sensation test.",
    status: "confirmed"
  },
  {
    docId: 5, // Dr. Arthur Bone (Orthopedics)
    patientEmail: "marcus.sterling@gmail.com",
    date: "2026-10-22",
    timeSlot: "03:00 PM",
    notes: "Bilateral patellofemoral knee ache during stair descent and joint mobility consultation.",
    status: "confirmed"
  },

  // Patient 6: Amina Al-Mansoor
  {
    docId: 1, // Dr. Jane Hart (Cardiology)
    patientEmail: "amina.mansoor@gmail.com",
    date: "2026-10-17",
    timeSlot: "11:30 AM",
    notes: "Exercise-induced sinus tachycardia investigation, 48-hr Holter monitor results debrief.",
    status: "confirmed"
  },
  {
    docId: 7, // Dr. Alice Mother (Gynecology)
    patientEmail: "amina.mansoor@gmail.com",
    date: "2026-10-23",
    timeSlot: "02:00 PM",
    notes: "Preventative women's health screening, cycle regularity, and bone density baseline.",
    status: "pending"
  },

  // Patient 7: Robert Chen
  {
    docId: 5, // Dr. Arthur Bone (Orthopedics)
    patientEmail: "robert.chen@gmail.com",
    date: "2026-10-16",
    timeSlot: "11:00 AM",
    notes: "Lumbar disc degeneration at L4-S1, ergonomic posture evaluation, and core physical therapy.",
    status: "confirmed"
  },
  {
    docId: 1, // Dr. Jane Hart (Cardiology)
    patientEmail: "robert.chen@gmail.com",
    date: "2026-10-24",
    timeSlot: "10:00 AM",
    notes: "Post-angioplasty 6-month surveillance, ECG ST-segment verification, and statin tolerance check.",
    status: "confirmed"
  },

  // Patient 8: Priya Patel
  {
    docId: 6, // Dr. Sigmund Mind (Psychiatry)
    patientEmail: "priya.patel@gmail.com",
    date: "2026-10-15",
    timeSlot: "03:30 PM",
    notes: "Generalized anxiety reduction strategies, circadian rhythm regulation, and psychotherapeutic review.",
    status: "confirmed"
  },
  {
    docId: 7, // Dr. Alice Mother (Gynecology)
    patientEmail: "priya.patel@gmail.com",
    date: "2026-10-20",
    timeSlot: "11:00 AM",
    notes: "PCOS cycle management, metabolic insulin resistance counseling, and ovarian tracking.",
    status: "completed"
  },

  // Patient 9: Lucas Gomez
  {
    docId: 5, // Dr. Arthur Bone (Orthopedics)
    patientEmail: "lucas.gomez@gmail.com",
    date: "2026-10-19",
    timeSlot: "01:30 PM",
    notes: "Lower lumbar radiculopathy, sciatic nerve traction check, and spine decompression exercise review.",
    status: "confirmed"
  },
  {
    docId: 9, // Dr. Marcus Vance (Neurology)
    patientEmail: "lucas.gomez@gmail.com",
    date: "2026-10-22",
    timeSlot: "10:00 AM",
    notes: "Neuromuscular electromyogram and motor reflex assessment for lower extremity paresthesia.",
    status: "pending"
  },

  // Patient 10: Chloe Dubois
  {
    docId: 2, // Dr. Sarah Skinner (Dermatology)
    patientEmail: "chloe.dubois@gmail.com",
    date: "2026-10-16",
    timeSlot: "02:00 PM",
    notes: "Atopic dermatitis erythematous lesions, epidermal ceramide barrier therapy, and patch test results.",
    status: "confirmed"
  },
  {
    docId: 8, // Dr. Bruce Child (Pediatrics)
    patientEmail: "chloe.dubois@gmail.com",
    date: "2026-10-21",
    timeSlot: "09:00 AM",
    notes: "Transition from pediatric allergy immunotherapy to adult desensitization protocols.",
    status: "confirmed"
  },

  // Patient 11: David Washington
  {
    docId: 9, // Dr. Marcus Vance (Neurology)
    patientEmail: "david.washington@gmail.com",
    date: "2026-10-16",
    timeSlot: "02:00 PM",
    notes: "Bilateral postural hand tremor examination, gait stability analysis, and neuro-motor evaluation.",
    status: "confirmed"
  },
  {
    docId: 3, // Dr. Albert Medic (General Medicine)
    patientEmail: "david.washington@gmail.com",
    date: "2026-10-23",
    timeSlot: "10:00 AM",
    notes: "Comprehensive senior vitality screening, renal function panel, and cardiovascular baseline.",
    status: "pending"
  },

  // Patient 12: Hannah Schmidt
  {
    docId: 2, // Dr. Sarah Skinner (Dermatology)
    patientEmail: "hannah.schmidt@gmail.com",
    date: "2026-10-17",
    timeSlot: "03:00 PM",
    notes: "Total body digital dermatoscopy, atypical nevus photodocumentation, and UV prophylaxis counsel.",
    status: "confirmed"
  },
  {
    docId: 6, // Dr. Sigmund Mind (Psychiatry)
    patientEmail: "hannah.schmidt@gmail.com",
    date: "2026-10-24",
    timeSlot: "01:00 PM",
    notes: "High-stress occupational fatigue decompression, sleep latency therapy, and resilience coaching.",
    status: "confirmed"
  },

  // Patient 13: Kavita Reddy
  {
    docId: 8, // Dr. Bruce Child (Pediatrics)
    patientEmail: "kavita.reddy@gmail.com",
    date: "2026-10-18",
    timeSlot: "10:00 AM",
    notes: "Family pediatric wellness consultation, childhood nutrition optimization, and immunizations.",
    status: "confirmed"
  },
  {
    docId: 6, // Dr. Sigmund Mind (Psychiatry)
    patientEmail: "kavita.reddy@gmail.com",
    date: "2026-10-25",
    timeSlot: "04:00 PM",
    notes: "Mindfulness-based stress reduction follow-up, autonomic relaxation, and mental wellness review.",
    status: "pending"
  }
];

const insertAppt = db.prepare(`
  INSERT INTO appointments (
    doctor_id, doctor_name, specialization, patient_name, patient_email, patient_phone, date, time_slot, notes, document_url, document_name, status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '', '', ?)
`);

let insertedCount = 0;
for (const a of appointmentRoster) {
  const doc = verifiedDocs.find(d => d.id === a.docId);
  const pat = patients.find(p => p.email.toLowerCase() === a.patientEmail.toLowerCase());

  if (!doc) {
    console.warn(`[WARN] Doctor ID ${a.docId} not found or unapproved! Skipping.`);
    continue;
  }
  if (!pat) {
    console.warn(`[WARN] Patient ${a.patientEmail} not found! Skipping.`);
    continue;
  }

  // Ensure no unverified doctor is ever booked
  if (doc.is_approved !== 1) {
    console.warn(`[SECURITY] Attempted appointment on unverified doctor: ${doc.name}! Blocked.`);
    continue;
  }

  // Check if slot already exists for doctor on date & time
  const existing = db.prepare(
    "SELECT id FROM appointments WHERE doctor_id = ? AND date = ? AND time_slot = ?"
  ).get(doc.id, a.date, a.timeSlot);

  if (existing) {
    console.log(`[EXISTS] Slot occupied: ${doc.name} on ${a.date} at ${a.timeSlot}`);
    continue;
  }

  insertAppt.run(
    doc.id,
    doc.name,
    doc.specialization,
    pat.name,
    pat.email,
    pat.phone,
    a.date,
    a.timeSlot,
    a.notes,
    a.status
  );
  insertedCount++;
  console.log(`[APPT] Booked: ${pat.name} -> ${doc.name} (${doc.specialization}) on ${a.date} at ${a.timeSlot} [${a.status}]`);
}

console.log(`\n=== SUMMARY ===`);
console.log(`Newly inserted appointments: ${insertedCount}`);
const totalAppts = db.prepare("SELECT COUNT(*) as cnt FROM appointments").get();
console.log(`Total appointments now in DB: ${totalAppts.cnt}`);

// Verification check:
const unverifiedAppointments = db.prepare(`
  SELECT a.id, a.doctor_name, d.is_approved
  FROM appointments a
  JOIN doctors d ON a.doctor_id = d.id
  WHERE d.is_approved = 0
`).all();

console.log(`Appointments with unverified doctors: ${unverifiedAppointments.length} (Must be 0)`);
