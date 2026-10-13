// ==========================================================================
// GROQ AI CLINICAL DIAGNOSTIC & SYMPTOM EVALUATION SERVICE
// Powered by Groq Ultra-Fast Inference API (Llama 3.3 70B & Llama 3.1 8B)
// ==========================================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
  "gemma2-9b-it"
];

/**
 * Retrieve and resolve the best available Groq API Key
 */
export function getGroqApiKey(customKey = null) {
  if (customKey && typeof customKey === "string" && customKey.trim().startsWith("gsk_")) {
    return customKey.trim();
  }
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().startsWith("gsk_")) {
    return process.env.GROQ_API_KEY.trim();
  }
  // Check backend/.env
  try {
    const envPath = path.resolve(__dirname, ".env");
    if (fs.existsSync(envPath)) {
      const txt = fs.readFileSync(envPath, "utf-8");
      const match = txt.match(/GROQ_API_KEY\s*=\s*(gsk_[a-zA-Z0-9_-]+)/);
      if (match && match[1]) return match[1].trim();
    }
  } catch {}
  // Check root apikey.txt
  try {
    const rootPath = path.resolve(__dirname, "..", "apikey.txt");
    if (fs.existsSync(rootPath)) {
      const txt = fs.readFileSync(rootPath, "utf-8");
      const match = txt.match(/(gsk_[a-zA-Z0-9_-]+)/);
      if (match && match[1]) return match[1].trim();
    }
  } catch {}
  return "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";
}

/**
 * Evaluate patient symptoms using Groq API
 * @param {Array<{ symptom: string, severity: string, effectiveFrom: string }>} symptoms
 * @param {string} patientNotes
 * @param {object} patientProfile
 * @param {string|null} customApiKey
 */
export async function evaluateSymptomsWithGroq(symptoms = [], patientNotes = "", patientProfile = {}, customApiKey = null) {
  if (!Array.isArray(symptoms) || symptoms.length === 0) {
    throw new Error("At least one symptom is required for clinical evaluation.");
  }

  const apiKey = getGroqApiKey(customApiKey);

  // Format structured symptoms narrative
  const symptomsText = symptoms
    .map(
      (s, idx) =>
        `${idx + 1}. Symptom: "${s.symptom}" | Severity: [${s.severity || "Moderate"}] | Effective From: [${s.effectiveFrom || "Recent"}]`
    )
    .join("\n");

  const systemPrompt = `You are "Medical AI Sushruta - Clinical Diagnostic & Disease Risk Evaluator", a world-class educational clinical AI engine.
Your task is to perform an immediate, high-fidelity differential clinical symptom evaluation.

The user will provide a structured list of patient symptoms, their respective severity levels, and their onset duration ("Effective From").

You must analyze this symptom cluster and directly state:
1. The **Possible Diseases / Medical Conditions** that correspond to or match these symptoms.
2. The **Secondary Illnesses or Complications that May Occur** if not treated.
3. The **Clinical Urgency / Triage Level** (CRITICAL_EMERGENCY, URGENT_CARE, MODERATE_PRIMARY_CARE, MILD_OBSERVATION).
4. The **Underlying Pathophysiology**: Explain clearly why this combination of symptoms, severity, and duration points to these diseases.
5. The **Recommended Diagnostic Tests & Lab Work** (e.g. CBC, ESR, CRP, Blood Culture, Imaging, CT, MRI, ECG).
6. **Immediate Supportive First-Aid & Self-Care Steps**.
7. **Recommended Medical Specialist Type** (e.g. Neurologist, Cardiologist, Pulmonologist, Infectious Disease Specialist, etc.).

Format your response in structured JSON with the following exact keys:
{
  "triageLevel": "EMERGENCY" | "URGENT" | "MODERATE" | "MILD",
  "urgencyBadge": "Critical Emergency" | "Urgent Physician Visit" | "Primary Care Consult" | "Routine Monitoring",
  "triageAdvice": "Direct concise advice on what action the patient should immediately take",
  "possibleDiseases": [
    {
      "name": "Disease or Condition Name",
      "likelihood": "High" | "Moderate" | "Low",
      "icdCategory": "Infectious / Cardiovascular / Neurological etc.",
      "clinicalReasoning": "Detailed explanation connecting the patient's symptoms, severity, and onset duration to this condition"
    }
  ],
  "potentialComplications": [
    "Complication or downstream illness that may occur if left untreated"
  ],
  "pathophysiologySummary": "Concise clinical narrative explaining the biological mechanism occurring in the body",
  "recommendedDiagnostics": [
    { "test": "Test Name", "purpose": "Why this test is indicated" }
  ],
  "immediateActions": [
    "Immediate supportive recommendation or caution"
  ],
  "recommendedSpecialist": "Type of physician specialist to consult",
  "disclaimer": "Medical AI Sushruta provides educational clinical guidance. This does not replace a definitive in-person examination by a licensed medical practitioner."
}

Only return valid JSON without Markdown backticks if possible. Do not add conversational pleasantries.`;

  const userPrompt = `Patient Demographics: Age ${patientProfile.age || "Adult"}, Gender: ${patientProfile.gender || "Unspecified"}.
Documented Pre-existing: ${patientProfile.chronic_conditions || "None reported"}.

Patient Symptoms Report:
${symptomsText}

Additional Patient Notes:
${patientNotes || "None provided."}

Perform the comprehensive clinical diagnostic analysis now and return the JSON evaluation.`;

  for (const model of GROQ_MODELS) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.2,
          max_tokens: 4096
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content;
        if (rawContent) {
          let clean = rawContent.trim();
          if (clean.startsWith("```json")) clean = clean.slice(7);
          if (clean.startsWith("```")) clean = clean.slice(3);
          if (clean.endsWith("```")) clean = clean.slice(0, -3);
          clean = clean.trim();

          try {
            const parsed = JSON.parse(clean);
            return {
              success: true,
              engine: `Groq (${model})`,
              data: parsed,
              rawText: rawContent
            };
          } catch (jsonErr) {
            return {
              success: true,
              engine: `Groq (${model})`,
              data: {
                triageLevel: "MODERATE",
                urgencyBadge: "Clinical Review Recommended",
                triageAdvice: "Review the clinical evaluation below and consult an appropriate specialist.",
                possibleDiseases: [
                  {
                    name: "Differential Clinical Evaluation",
                    likelihood: "High",
                    icdCategory: "Multi-System",
                    clinicalReasoning: clean
                  }
                ],
                potentialComplications: ["Requires clinical correlation by attending physician"],
                pathophysiologySummary: clean.slice(0, 500),
                recommendedDiagnostics: [
                  { test: "Complete Blood Count & Metabolic Panel", purpose: "Baseline inflammatory and organ function review" }
                ],
                immediateActions: ["Monitor vitals closely", "Stay hydrated and rest", "Seek urgent care if symptoms worsen"],
                recommendedSpecialist: "General Physician / Internist",
                disclaimer: "Medical AI Sushruta provides educational clinical guidance. Consult a qualified medical practitioner for diagnosis or treatment."
              },
              rawText: rawContent
            };
          }
        }
      }
    } catch (err) {
      console.warn(`Groq request failed with model ${model}: ${err.message}`);
    }
  }

  // Graceful Fallback
  return generateClinicalFallback(symptoms, patientNotes, patientProfile);
}

function generateClinicalFallback(symptoms = [], patientNotes = "", patientProfile = {}) {
  const hasSevere = symptoms.some(s => (s.severity || "").toLowerCase().includes("severe"));
  const hasModerate = symptoms.some(s => (s.severity || "").toLowerCase().includes("moderate"));

  const triageLevel = hasSevere ? "URGENT" : hasModerate ? "MODERATE" : "MILD";
  const urgencyBadge = hasSevere ? "Urgent Physician Visit" : hasModerate ? "Primary Care Consult" : "Routine Monitoring";
  const symptomNames = symptoms.map(s => s.symptom).join(", ");

  return {
    success: true,
    engine: "Sushruta Clinical Expert System (Resilient Fallback)",
    data: {
      triageLevel,
      urgencyBadge,
      triageAdvice: hasSevere
        ? "Given the reported severe symptoms, seek a timely in-person evaluation at an urgent care clinic or hospital."
        : "Monitor your vitals and symptom progression. If symptoms persist beyond 48-72 hours, schedule a physician consult.",
      possibleDiseases: symptoms.map(s => ({
        name: `Clinical Condition associated with ${s.symptom}`,
        likelihood: (s.severity || "").toLowerCase().includes("severe") ? "High" : "Moderate",
        icdCategory: "General Medicine / Differential",
        clinicalReasoning: `Reported symptom of "${s.symptom}" rated as [${s.severity || "Moderate"}] effective from [${s.effectiveFrom || "Recent"}]. Clinical physical correlation is recommended.`
      })),
      potentialComplications: [
        "Symptom chronicity or secondary inflammation if left unmanaged",
        "Fatigue, fluid-electrolyte imbalance, or sleep disturbance"
      ],
      pathophysiologySummary: `Presentation of ${symptomNames} indicates localized physiological stress or an active immune response. Onset timeline and severity correlate with an acute-to-subacute presentation requiring observation.`,
      recommendedDiagnostics: [
        { test: "Complete Blood Count (CBC) with Differential", purpose: "Evaluate systemic immune response and inflammation" },
        { test: "Comprehensive Metabolic Panel (CMP)", purpose: "Check electrolyte balance, renal function, and liver enzymes" }
      ],
      immediateActions: [
        "Maintain adequate oral hydration and bed rest",
        "Monitor core temperature and blood pressure regularly",
        "Avoid unverified self-medication without physician supervision"
      ],
      recommendedSpecialist: hasSevere ? "Emergency Medicine / Urgent Care Specialist" : "General Physician / Internist",
      disclaimer: "Medical AI Sushruta provides educational clinical guidance. Consult a qualified medical practitioner for diagnosis or treatment."
    }
  };
}

/**
 * Interactive Clinical Chat Inference powered by Groq
 * @param {string} userQuery
 * @param {string|null} customApiKey
 */
export async function generateChatWithGroq(userQuery, customApiKey = null) {
  const apiKey = getGroqApiKey(customApiKey);
  if (!apiKey) return null;

  const systemInstruction = `You are "Medical AI Sushruta", an advanced, compassionate, articulate, and authoritative clinical AI medical educational assistant.
The user is asking a health, symptom, medication, or medical question.
Provide a clear, detailed, clinically thorough, and structured response addressing the user's specific query.
Include:
- Clear physiological explanation of what is happening (e.g. mechanisms, reasons)
- Common causes, contributing triggers, or conditions associated with it
- Practical self-care, home remedies, lifestyle measures, and guidance
- Red flags / warning signs indicating when to seek medical attention
- Specific questions to ask their doctor

Format with clear headers and bullet points. Be empathetic, clear, and reassuring. Do not output legal disclaimers at the end as one is automatically added.`;

  for (const model of GROQ_MODELS) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userQuery }
          ],
          temperature: 0.5,
          max_tokens: 2048
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content && content.trim()) {
          return content.trim();
        }
      }
    } catch (err) {
      console.warn(`Groq chat inference attempt with ${model} failed:`, err.message);
    }
  }
  return null;
}

/**
 * Comprehensive Medical Report Analysis & Biomarker Extraction powered by Groq
 * @param {string} reportText
 * @param {string|null} customApiKey
 */
export async function extractBiomarkersWithGroq(reportText, customApiKey = null) {
  const apiKey = getGroqApiKey(customApiKey);
  if (!apiKey || !reportText) return null;

  const systemPrompt = `You are "Medical AI Sushruta - Clinical Diagnostic & Laboratory Pathologist AI".
Carefully analyze the provided laboratory report, blood test, metabolic panel, or pathology findings.
Extract all actual biomarkers with their exact numerical or qualitative values, units, and reference ranges.
Evaluate each marker status as: "Optimal", "Elevated", "Low", or "Critical".
Evaluate overall report status as: "optimal", "attention", or "critical".
Determine the triage level: "MILD", "MODERATE", "URGENT", or "CRITICAL".
Identify the organ systems impacted (e.g. Endocrine, Renal, Hepatic, Cardiovascular, Hematologic).
List potential clinical risks / downstream complications if abnormal values persist.
Provide concrete clinical recommendations (lifestyle, hydration, retesting interval).
Specify the recommended physician specialist (e.g. "Endocrinologist", "Cardiologist", "Nephrologist", "Gastroenterologist", "Hematologist", "General Physician").

Return STRICT JSON matching this schema:
{
  "status": "optimal" | "attention" | "critical",
  "triageLevel": "MILD" | "MODERATE" | "URGENT" | "CRITICAL",
  "urgencyBadge": "Optimal Baseline" | "Routine Clinical Attention" | "Urgent Physician Consultation",
  "summary": "Clear, detailed clinical summary describing the findings and clinical meaning.",
  "recommendedSpecialist": "Type of physician specialist to consult",
  "organSystemsImpacted": [
    { "system": "Endocrine / Glycemic", "status": "Attention", "note": "Elevated fasting glucose indicates insulin resistance" }
  ],
  "potentialRisks": [
    "Specific potential risk if unmanaged"
  ],
  "clinicalRecommendations": [
    "Actionable guidance or diagnostic recheck"
  ],
  "biomarkers": [
    {
      "name": "Exact Test Name",
      "value": "Exact Value with Unit",
      "ref": "Reference range",
      "status": "Optimal" | "Elevated" | "Low" | "Critical",
      "category": "Metabolic" | "Lipid" | "Renal" | "Hepatic" | "Hematology" | "Thyroid" | "General",
      "clinicalSignificance": "Brief explanation of this biomarker"
    }
  ]
}`;

  for (const model of GROQ_MODELS) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Medical Report Document Content:\n${reportText}` }
          ],
          temperature: 0.1,
          max_tokens: 3000,
          response_format: { type: "json_object" }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const raw = data?.choices?.[0]?.message?.content;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.biomarkers) && parsed.biomarkers.length > 0) {
            parsed.engine = `Groq (${model})`;
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn(`Groq report parser attempt with ${model} failed:`, err.message);
    }
  }
  return null;
}
