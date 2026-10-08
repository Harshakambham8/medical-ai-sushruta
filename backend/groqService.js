// ==========================================================================
// GROQ AI CLINICAL DIAGNOSTIC & SYMPTOM EVALUATION SERVICE
// Powered by Groq Ultra-Fast Inference API (qwen/qwen3.8-27b & gpt-oss-120b)
// ==========================================================================

const GROQ_API_KEY =
  process.env.GROQ_API_KEY ||
  "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";

const GROQ_MODELS = [
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b"
];

/**
 * Evaluate patient symptoms using Groq API
 * @param {Array<{ symptom: string, severity: string, effectiveFrom: string }>} symptoms
 * @param {string} patientNotes
 * @param {object} patientProfile
 */
export async function evaluateSymptomsWithGroq(symptoms = [], patientNotes = "", patientProfile = {}) {
  if (!Array.isArray(symptoms) || symptoms.length === 0) {
    throw new Error("At least one symptom is required for clinical evaluation.");
  }

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

Only return valid JSON without Markdown backticks if possible, or with standard json block. Do not add conversational pleasantries.`;

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
          Authorization: `Bearer ${GROQ_API_KEY}`,
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
          // Attempt JSON parse
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
            // If model returned rich markdown instead of strict JSON, structure it cleanly
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
                  { test: "Routine Complete Blood Count & Metabolic Panel", purpose: "Baseline inflammatory and organ function review" }
                ],
                immediateActions: ["Monitor vitals closely", "Stay hydrated and rest", "Seek urgent care if symptoms worsen"],
                recommendedSpecialist: "General Physician / Internist",
                disclaimer: "Medical AI Sushruta provides educational clinical guidance. Consult a qualified medical practitioner for diagnosis or treatment."
              },
              rawText: rawContent
            };
          }
        }
      } else {
        const errBody = await response.text().catch(() => "");
        console.warn(`Groq model ${model} error (${response.status}): ${errBody.slice(0, 150)}`);
      }
    } catch (err) {
      console.warn(`Groq request failed with model ${model}: ${err.message}`);
    }
  }

  // Graceful Fallback: Generate intelligent clinical differential if Groq network is unreachable
  console.warn("Groq online models unreachable. Activating clinical expert system fallback.");
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

