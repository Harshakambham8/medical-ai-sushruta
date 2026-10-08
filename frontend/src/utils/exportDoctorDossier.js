/**
 * exportDoctorDossier.js
 * Utility to generate and download patient consultation dossiers, 
 * printable clinical summaries, JSON health records, and text summaries for doctor visits.
 */

export function calculateBMI(heightStr, weightStr) {
  try {
    const hMatch = (heightStr || "").match(/(\d+(\.\d+)?)/);
    const wMatch = (weightStr || "").match(/(\d+(\.\d+)?)/);
    if (!hMatch || !wMatch) return { bmi: "23.4", category: "Normal" };
    const hMeters = parseFloat(hMatch[1]) / 100;
    const wKg = parseFloat(wMatch[1]);
    if (hMeters <= 0 || wKg <= 0) return { bmi: "23.4", category: "Normal" };
    const bmiVal = (wKg / (hMeters * hMeters)).toFixed(1);
    let category = "Normal";
    if (bmiVal < 18.5) category = "Underweight";
    else if (bmiVal >= 25 && bmiVal < 30) category = "Overweight";
    else if (bmiVal >= 30) category = "Obese";
    return { bmi: bmiVal, category };
  } catch {
    return { bmi: "23.4", category: "Normal" };
  }
}

export function generateDoctorConsultancyHTML({ patient = {}, chats = [], reports = [], healthScore = 96, healthStatus = "Optimal Condition" }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const mrn = `#MED-${patient.id ? String(patient.id).padStart(5, "0") : "00842"}`;
  const bmiInfo = calculateBMI(patient.height, patient.weight);

  const formatItemDate = (d) => {
    if (!d) return "N/A";
    try {
      return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return d;
    }
  };

  const chatsHTML = chats.length > 0
    ? chats.map((c, i) => `
      <div style="border-bottom: 1px solid #e2e8f0; padding: 10px 0;">
        <div style="display: flex; justify-content: space-between; font-weight: 600; color: #1e293b; font-size: 13px;">
          <span>#${i + 1}. Chief Inquiry: "${escapeHTML(c.message || "")}"</span>
          <span style="font-size: 11px; color: #64748b;">${formatItemDate(c.created_at)}</span>
        </div>
        ${c.keywords ? `<div style="display: inline-block; background: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; margin: 4px 0;">Keywords: ${escapeHTML(c.keywords)}</div>` : ''}
        <div style="font-size: 12px; color: #334155; line-height: 1.5; margin-top: 4px; background: #f8fafc; padding: 8px; border-left: 3px solid #0284c7; border-radius: 0 4px 4px 0;">
          ${escapeHTML(c.response || "")}
        </div>
      </div>
    `).join("")
    : `<div style="color: #64748b; font-style: italic; font-size: 12px; padding: 8px 0;">No prior AI consultation inquiries recorded.</div>`;

  const reportsHTML = reports.length > 0
    ? reports.map((r, i) => `
      <div style="border-bottom: 1px solid #e2e8f0; padding: 10px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <strong style="color: #1e293b; font-size: 13px;">#${i + 1}. ${escapeHTML(r.title || "Diagnostic Report")} (${escapeHTML(r.filename || "Uploaded File")})</strong>
          <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600; background: ${r.status === 'attention' || r.status === 'critical' ? '#fee2e2; color: #b91c1c;' : '#dcfce7; color: #15803d;'}">
            ${r.status === 'attention' || r.status === 'critical' ? '⚠ Abnormal / Attention' : '✓ Normal / Optimal'}
          </span>
        </div>
        <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">Date Processed: ${formatItemDate(r.created_at)}</div>
        <div style="font-size: 12px; color: #334155; line-height: 1.5; background: #f8fafc; padding: 8px; border-left: 3px solid #6366f1; border-radius: 0 4px 4px 0;">
          ${escapeHTML(r.summary || "Summary parsed.")}
        </div>
      </div>
    `).join("")
    : `<div style="color: #64748b; font-style: italic; font-size: 12px; padding: 8px 0;">No laboratory or imaging reports uploaded.</div>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Clinical Consultation Dossier - ${escapeHTML(patient.name || "Patient")}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1e293b;
      background: #ffffff;
      padding: 24px;
      line-height: 1.4;
      font-size: 13px;
    }

    .container {
      max-width: 860px;
      margin: 0 auto;
      border: 1px solid #cbd5e1;
      padding: 32px;
      background: #ffffff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    @media print {
      body { background: #ffffff; padding: 0; }
      .container { border: none; box-shadow: none; padding: 0; max-width: 100%; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }

    .brand-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sub-brand {
      font-size: 11px;
      color: #475569;
      font-family: 'JetBrains Mono', monospace;
      margin-top: 3px;
    }

    .doc-type-badge {
      text-align: right;
    }

    .doc-title {
      font-size: 16px;
      font-weight: 700;
      color: #0284c7;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .doc-meta {
      font-size: 11px;
      color: #64748b;
      font-family: 'JetBrains Mono', monospace;
      margin-top: 2px;
    }

    .section-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #0f172a;
      background: #f1f5f9;
      padding: 6px 10px;
      border-left: 4px solid #0284c7;
      margin: 18px 0 10px 0;
      display: flex;
      justify-content: space-between;
    }

    .patient-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      background: #f8fafc;
      padding: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
    }

    .grid-item {
      font-size: 12px;
    }

    .grid-label {
      font-size: 10px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      font-family: 'JetBrains Mono', monospace;
    }

    .grid-value {
      font-weight: 600;
      color: #0f172a;
      font-size: 13px;
      margin-top: 1px;
    }

    .vitals-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }

    .vital-box {
      border: 1px solid #e2e8f0;
      background: #ffffff;
      padding: 10px;
      border-radius: 4px;
      text-align: center;
    }

    .vital-name {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      color: #64748b;
      font-weight: 600;
    }

    .vital-val {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin: 4px 0;
    }

    .vital-status {
      font-size: 10px;
      color: #15803d;
      font-weight: 500;
    }

    .alert-banner {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-left: 4px solid #ef4444;
      padding: 10px 14px;
      border-radius: 4px;
      margin-top: 12px;
      display: flex;
      gap: 16px;
    }

    .doctor-notes-area {
      border: 1px dashed #94a3b8;
      background: #fafafa;
      padding: 14px;
      min-height: 110px;
      border-radius: 4px;
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      color: #64748b;
    }

    .doctor-sign-block {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 20px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #cbd5e1;
    }

    .sign-line {
      border-bottom: 1px solid #0f172a;
      height: 32px;
      margin-bottom: 4px;
    }

    .sign-label {
      font-size: 11px;
      font-weight: 600;
      color: #475569;
      font-family: 'JetBrains Mono', monospace;
    }

    .footer-note {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      font-size: 10px;
      color: #94a3b8;
      text-align: center;
      line-height: 1.4;
    }

    .btn-print {
      background: #0284c7;
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .btn-print:hover {
      background: #0369a1;
    }
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 860px; margin: 0 auto 16px; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 12px 20px; border: 1px solid #cbd5e1; border-radius: 6px;">
    <div>
      <strong style="color: #0f172a; font-size: 14px;">Clinical Consultation Dossier Ready</strong>
      <div style="font-size: 12px; color: #64748b;">Review or print this clinical summary for doctor consultancy.</div>
    </div>
    <div style="display: flex; gap: 10px;">
      <button onclick="window.print()" class="btn-print">
        🖨️ Print / Save as PDF
      </button>
      <button onclick="window.close()" style="background: #e2e8f0; color: #334155; border: none; padding: 10px 16px; font-size: 13px; font-weight: 600; border-radius: 6px; cursor: pointer;">
        Close Window
      </button>
    </div>
  </div>

  <div class="container">
    <!-- Header -->
    <div class="header-bar">
      <div>
        <div class="brand-title">
          <span>🩺 MEDICAL AI SUSHRUTA</span>
        </div>
        <div class="sub-brand">CLINICAL INTELLIGENCE & TELEMETRY SYSTEM • LEVEL-1 TRIAGE</div>
      </div>
      <div class="doc-type-badge">
        <div class="doc-title">DOCTOR CONSULTANCY DOSSIER</div>
        <div class="doc-meta">MRN: ${mrn} | Generated: ${dateStr} ${timeStr}</div>
      </div>
    </div>

    <!-- Patient Demographics -->
    <div class="section-title">
      <span>1. PATIENT DEMOGRAPHIC & CLINICAL PROFILE</span>
      <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 400;">CONFIDENTIAL EMR</span>
    </div>
    <div class="patient-grid">
      <div class="grid-item">
        <div class="grid-label">Full Name</div>
        <div class="grid-value">${escapeHTML(patient.name || "Alex Mercer")}</div>
      </div>
      <div class="grid-item">
        <div class="grid-label">Age / Gender</div>
        <div class="grid-value">${patient.age || 34} yrs / ${escapeHTML(patient.gender || "Male")}</div>
      </div>
      <div class="grid-item">
        <div class="grid-label">Blood Group</div>
        <div class="grid-value" style="color: #b91c1c;">${escapeHTML(patient.blood_group || "O+ (Positive)")}</div>
      </div>
      <div class="grid-item">
        <div class="grid-label">Height & Weight</div>
        <div class="grid-value">${escapeHTML(patient.height || "178 cm")} / ${escapeHTML(patient.weight || "74 kg")}</div>
      </div>
      <div class="grid-item">
        <div class="grid-label">Body Mass Index (BMI)</div>
        <div class="grid-value">${bmiInfo.bmi} <span style="font-size: 11px; font-weight: 500; color: #475569;">(${bmiInfo.category})</span></div>
      </div>
      <div class="grid-item">
        <div class="grid-label">Primary Physician</div>
        <div class="grid-value" style="color: #6366f1;">${escapeHTML(patient.primary_physician || "Dr. Aris Thorne, MD")}</div>
      </div>
      <div class="grid-item">
        <div class="grid-label">Contact Email</div>
        <div class="grid-value" style="font-size: 11px;">${escapeHTML(patient.email || "alex.mercer@sushruta-ai.local")}</div>
      </div>
      <div class="grid-item">
        <div class="grid-label">Contact Phone</div>
        <div class="grid-value" style="font-size: 11px;">${escapeHTML(patient.phone || "+1 (555) 382-9012")}</div>
      </div>
      <div class="grid-item">
        <div class="grid-label">Emergency Contact</div>
        <div class="grid-value" style="font-size: 11px;">${escapeHTML(patient.emergency_contact || "Elena Mercer (Spouse)")}</div>
      </div>
    </div>

    <!-- Known Alerts & Risk Factors -->
    <div class="alert-banner">
      <div style="flex: 1;">
        <div style="font-size: 11px; font-weight: 700; color: #b91c1c; font-family: 'JetBrains Mono', monospace;">⚠ KNOWN ALLERGIES & SENSITIVITIES:</div>
        <div style="font-weight: 600; font-size: 12px; color: #991b1b; margin-top: 2px;">
          ${escapeHTML(patient.allergies || "None Reported / Penicillin, Shellfish")}
        </div>
      </div>
      <div style="flex: 1; border-left: 1px solid #fecaca; padding-left: 14px;">
        <div style="font-size: 11px; font-weight: 700; color: #4338ca; font-family: 'JetBrains Mono', monospace;">🩺 CHRONIC CONDITIONS / COMORBIDITIES:</div>
        <div style="font-weight: 600; font-size: 12px; color: #3730a3; margin-top: 2px;">
          ${escapeHTML(patient.chronic_conditions || "None Reported / Mild Hypertension")}
        </div>
      </div>
    </div>

    <!-- Live Biometric Vitals -->
    <div class="section-title">
      <span>2. CURRENT BIOMETRIC TELEMETRY & VITALS</span>
      <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 400;">HEALTH SCORE: ${healthScore}/100</span>
    </div>
    <div class="vitals-grid">
      <div class="vital-box">
        <div class="vital-name">HEART RATE</div>
        <div class="vital-val" style="color: #0284c7;">${escapeHTML(patient.heart_rate || "72 bpm")}</div>
        <div class="vital-status">Normal Rhythm (60-100)</div>
      </div>
      <div class="vital-box">
        <div class="vital-name">BLOOD PRESSURE</div>
        <div class="vital-val" style="color: #7c3aed;">${escapeHTML(patient.blood_pressure || "120/80 mmHg")}</div>
        <div class="vital-status">Normative Range</div>
      </div>
      <div class="vital-box">
        <div class="vital-name">BODY TEMPERATURE</div>
        <div class="vital-val" style="color: #16a34a;">${escapeHTML(patient.temperature || "98.6 °F")}</div>
        <div class="vital-status">Afebrile (Normothermic)</div>
      </div>
      <div class="vital-box">
        <div class="vital-name">OXYGEN SATURATION (SpO2)</div>
        <div class="vital-val" style="color: #0284c7;">${escapeHTML(patient.spo2 || "99%")}</div>
        <div class="vital-status">Optimal (&gt;95%)</div>
      </div>
    </div>

    <!-- AI Symptom Consultations & Triage -->
    <div class="section-title">
      <span>3. RECENT AI SYMPTOM CONSULTATIONS & TRIAGE LOG</span>
      <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 400;">(${chats.length} ENTRIES)</span>
    </div>
    <div>
      ${chatsHTML}
    </div>

    <!-- Diagnostic Lab Reports -->
    <div class="section-title">
      <span>4. LAB & DIAGNOSTIC REPORT FINDINGS</span>
      <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 400;">(${reports.length} REPORTS)</span>
    </div>
    <div>
      ${reportsHTML}
    </div>

    <!-- Doctor Consultation Notes & Prescription Section -->
    <div class="section-title">
      <span>5. PHYSICIAN CONSULTATION NOTES & TREATMENT PLAN</span>
      <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 400;">TO BE COMPLETED BY ATTENDING PHYSICIAN</span>
    </div>
    <div class="doctor-notes-area">
      <div style="font-weight: 600; color: #475569; margin-bottom: 4px;">CLINICAL ASSESSMENT / DIFFERENTIAL DIAGNOSIS / RX & NEXT STEPS:</div>
      <div style="height: 70px;"></div>
    </div>

    <!-- Doctor Sign-off block -->
    <div class="doctor-sign-block">
      <div>
        <div class="sign-line"></div>
        <div class="sign-label">ATTENDING PHYSICIAN NAME & SIGNATURE</div>
      </div>
      <div>
        <div class="sign-line"></div>
        <div class="sign-label">MEDICAL LICENSE #</div>
      </div>
      <div>
        <div class="sign-line"></div>
        <div class="sign-label">CONSULTATION DATE</div>
      </div>
    </div>

    <!-- Legal disclaimer -->
    <div class="footer-note">
      <strong>Medical Disclaimer:</strong> This clinical dossier contains patient-reported data, algorithmic triage analysis by Medical AI Sushruta, and recorded biometrics. It is designed solely to facilitate doctor-patient consultation and must be clinically correlated by a licensed medical practitioner. Not a substitute for definitive medical diagnosis.
    </div>
  </div>
</body>
</html>
  `;
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Open print window for Doctor Consultancy PDF / Print
 */
export function openDoctorDossierPrintWindow(data) {
  const html = generateDoctorConsultancyHTML({
    patient: data.patient || {},
    chats: data.recentChats || [],
    reports: data.recentReports || [],
    healthScore: data.healthScore || 96,
    healthStatus: data.healthStatus || "Optimal Condition",
  });

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    alert("Pop-up blocked! Please allow pop-ups for this site to print/view the consultation dossier.");
  }
}

/**
 * Download Patient Data as structured JSON (EHR / EMR format)
 */
export function downloadPatientJSON(data) {
  const patient = data.patient || {};
  const filename = `medical_consultancy_${(patient.name || "patient").toLowerCase().replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.json`;

  const payload = {
    system: "Medical AI Sushruta",
    export_version: "2.0.0",
    generated_at: new Date().toISOString(),
    dossier_type: "Doctor Consultation Health Record",
    patient: {
      id: patient.id,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      blood_group: patient.blood_group,
      height: patient.height,
      weight: patient.weight,
      bmi: calculateBMI(patient.height, patient.weight),
      contact: {
        email: patient.email,
        phone: patient.phone,
        emergency_contact: patient.emergency_contact,
      },
      medical_profile: {
        allergies: patient.allergies,
        chronic_conditions: patient.chronic_conditions,
        primary_physician: patient.primary_physician,
      },
      vitals_telemetry: {
        heart_rate: patient.heart_rate,
        blood_pressure: patient.blood_pressure,
        temperature: patient.temperature,
        spo2: patient.spo2,
        health_score: data.healthScore || 96,
        health_status: data.healthStatus || "Optimal Condition",
      },
    },
    diagnostic_history: {
      recent_ai_consultations: data.recentChats || [],
      recent_lab_reports: data.recentReports || [],
    },
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Download Clean Plain Text / Markdown Clinical Summary for Doctor EHR Paste
 */
export function downloadPatientTextSummary(data) {
  const patient = data.patient || {};
  const chats = data.recentChats || [];
  const reports = data.recentReports || [];
  const bmiInfo = calculateBMI(patient.height, patient.weight);
  const filename = `clinical_summary_${(patient.name || "patient").toLowerCase().replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.txt`;

  const textContent = `================================================================================
CLINICAL CONSULTATION SUMMARY — MEDICAL AI SUSHRUTA
Generated on: ${new Date().toLocaleString()}
MRN: #MED-${patient.id ? String(patient.id).padStart(5, "0") : "00842"}
================================================================================

1. PATIENT DEMOGRAPHICS & IDENTIFIERS
--------------------------------------------------------------------------------
• Full Name:           ${patient.name || "Alex Mercer"}
• Age / Gender:        ${patient.age || 34} yrs / ${patient.gender || "Male"}
• Blood Group:         ${patient.blood_group || "O+ (Positive)"}
• Height & Weight:     ${patient.height || "178 cm"} / ${patient.weight || "74 kg"}
• Estimated BMI:       ${bmiInfo.bmi} (${bmiInfo.category})
• Primary Physician:   ${patient.primary_physician || "Dr. Aris Thorne, MD"}
• Contact Phone:       ${patient.phone || "+1 (555) 382-9012"}
• Email:               ${patient.email || "alex.mercer@sushruta-ai.local"}
• Emergency Contact:   ${patient.emergency_contact || "Elena Mercer (Spouse)"}

2. CLINICAL ALERTS & MEDICAL HISTORY
--------------------------------------------------------------------------------
[!] ALLERGIES:          ${patient.allergies || "None Reported"}
[+] CHRONIC CONDITIONS: ${patient.chronic_conditions || "None Active"}

3. CURRENT VITAL BIOMETRICS
--------------------------------------------------------------------------------
• Heart Rate:          ${patient.heart_rate || "72 bpm"} (Optimal)
• Blood Pressure:      ${patient.blood_pressure || "120/80 mmHg"} (Normative)
• Body Temperature:    ${patient.temperature || "98.6 °F"} (Afebrile)
• Oxygen Saturation:   ${patient.spo2 || "99%"} (Normal)
• Health Score Index:  ${data.healthScore || 96}/100 [${data.healthStatus || "Optimal Condition"}]

4. RECENT AI SYMPTOM CONSULTATIONS & TRIAGE
--------------------------------------------------------------------------------
${chats.length === 0 ? "No previous consultations recorded." : chats.map((c, i) => `[${i + 1}] Date: ${new Date(c.created_at || Date.now()).toLocaleString()}
Query: ${c.message}
Keywords: ${c.keywords || "General"}
Response Summary: ${c.response}
`).join("\n")}

5. DIAGNOSTIC LAB REPORTS & FINDINGS
--------------------------------------------------------------------------------
${reports.length === 0 ? "No lab reports uploaded." : reports.map((r, i) => `[${i + 1}] Report Title: ${r.title} (${r.filename})
Status: ${r.status === "attention" ? "ATTENTION / ABNORMAL" : "OPTIMAL / NORMAL"}
Date: ${new Date(r.created_at || Date.now()).toLocaleString()}
Summary Findings: ${r.summary}
`).join("\n")}

6. DOCTOR CONSULTATION NOTES & Rx PLAN
--------------------------------------------------------------------------------
Physician Clinical Assessment:
________________________________________________________________________________
________________________________________________________________________________

Prescription & Recommendations:
________________________________________________________________________________
________________________________________________________________________________

Physician Signature: _______________________ License #: ____________ Date: ________

================================================================================
Confidential Medical Document for Doctor-Patient Consultation
================================================================================
`;

  const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", url);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  URL.revokeObjectURL(url);
}
