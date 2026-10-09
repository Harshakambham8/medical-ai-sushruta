// ==========================================================================
// MEDICAL AI SUSHRUTA - HYBRID COGNITIVE & GEMINI 2.5 FLASH AI ENGINE
// High-Fidelity Educational Healthcare Triage, Pathology & Biomarker Interpretation
// ==========================================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateChatWithGroq, extractBiomarkersWithGroq } from "./groqService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DISCLAIMER = "\n\nDisclaimer: Medical AI Sushruta provides educational healthcare guidance only. Consult a qualified medical practitioner for diagnosis or treatment.";

// Retrieve Gemini API Key from process.env or apikey.txt / .env
function getGeminiApiKey() {
  const isValid = (k) => typeof k === "string" && k.trim().length >= 20;

  if (process.env.GEMINI_API_KEY && isValid(process.env.GEMINI_API_KEY)) {
    return process.env.GEMINI_API_KEY.trim();
  }

  // Check .env file
  const envPath = path.resolve(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    const match = content.match(/GEMINI_API_KEY\s*=\s*(.+)/);
    if (match && match[1] && isValid(match[1].trim())) {
      return match[1].trim().replace(/^['"]|['"]$/g, "");
    }
  }

  // Check parent apikey.txt
  const rootApiKeyPath = path.resolve(__dirname, "..", "apikey.txt");
  if (fs.existsSync(rootApiKeyPath)) {
    const key = fs.readFileSync(rootApiKeyPath, "utf-8").trim();
    if (isValid(key)) return key;
  }

  return null;
}

// --------------------------------------------------------------------------
// TIER 1: LIVE DIRECT GEMINI FLASH AI INTEGRATION
// Full generative capability without keyword or sentence restrictions
// --------------------------------------------------------------------------
async function callGeminiAPI(userQuery) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.warn("No Gemini API key detected.");
    return null;
  }

  const systemInstruction = `You are "Medical AI Sushruta", an advanced, high-fidelity clinical AI educational assistant.
The user is asking you a health, medical, wellness, symptom, or scientific question.
Provide a direct, thorough, comprehensive, and clear response to EXACTLY what the user asks about.
Generate the FULL, detailed explanation, covering:
- In-depth physiological explanation and clinical context
- Potential causes, risk factors, or mechanisms
- Practical, evidence-based recommendations, lifestyle measures, and guidance
- Key red flags or warning signs to be mindful of
- Recommended questions or points to discuss with their healthcare provider

Be compassionate, authoritative, highly informative, and articulate.
Do NOT restrict yourself to keywords or rigid canned templates. Generate the complete, full content the user is seeking.
Do not write a generic legal disclaimer at the end because one will be appended automatically.`;

  const requestBody = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: [
      {
        parts: [{ text: userQuery }]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 8192,
    }
  };

  const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];

  for (let attempt = 0; attempt < 3; attempt++) {
    for (const model of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText && candidateText.trim()) {
            const keywords = extractClinicalKeywords(userQuery + " " + candidateText);
            return {
              response: candidateText.trim() + DISCLAIMER,
              matchedKeywords: keywords.length > 0 ? keywords : ["Direct Gemini AI", "Clinical Guidance"]
            };
          }
        } else if (response.status === 401 || response.status === 403) {
          console.warn(`Gemini API Key unauthorized (${response.status}). Falling back to Groq.`);
          return null;
        } else if (response.status === 503) {
          // Temporary spike in demand - brief pause then try next candidate
          await new Promise((resolve) => setTimeout(resolve, 800));
        } else {
          const errText = await response.text().catch(() => "");
          console.warn(`Model ${model} returned status ${response.status}: ${errText.slice(0, 100)}`);
        }
      } catch (err) {
        console.warn(`Attempt with ${model} failed: ${err.message}`);
      }
    }
  }

  return null;
}

// --------------------------------------------------------------------------
// EXTRACT CLINICAL KEYWORDS HELPER
// --------------------------------------------------------------------------
function extractClinicalKeywords(text) {
  const query = (text || "").toLowerCase();
  const candidates = [
    "Oncology", "Cancer", "Tumor", "Biopsy", "Fever", "Creatinine", "Renal", "Kidney",
    "CBC", "WBC", "Platelet", "Hemoglobin", "Anemia", "Migraine", "Headache",
    "Cardiac", "Chest Pain", "Cardiovascular", "Hypertension", "Blood Pressure",
    "Diabetes", "Glucose", "HbA1c", "Lipid", "Cholesterol", "Liver", "AST/ALT",
    "Thyroid", "TSH", "Asthma", "Pneumonia", "Respiratory", "GERD", "Gastritis",
    "Arthritis", "Gout", "Fatigue", "Infection", "Inflammation", "Electrolytes",
    "SpO2", "Vital Signs", "Neurology", "Gastroenterology"
  ];

  const matched = [];
  for (const term of candidates) {
    if (query.includes(term.toLowerCase())) {
      matched.push(term);
      if (matched.length >= 4) break;
    }
  }
  return matched;
}

// --------------------------------------------------------------------------
// TIER 2: EXTENSIVE CLINICAL KNOWLEDGE BASE (50+ Conditions & Lab Biomarkers)
// --------------------------------------------------------------------------
const KNOWLEDGE_BASE = [
  // ONCOLOGY & NEOPLASMS
  {
    keywords: ["cancer", "tumor", "carcinoma", "malignancy", "oncology", "neoplasm", "sarcoma", "lymphoma", "leukemia", "metastasis"],
    title: "Oncology & Neoplastic Disease Clinical Overview",
    response: `Cancer represents a group of diseases characterized by uncontrolled cellular proliferation, evasion of programmed cell death (apoptosis), and the potential to invade surrounding tissues.

• Pathophysiology: Arises from cumulative genetic alterations (oncogene activation, tumor suppressor inactivation) influenced by hereditary factors, environmental carcinogens, radiation, and chronic inflammation.
• Major Classifications:
  - Carcinomas: Originating in epithelial tissues (e.g. breast, lung, prostate, colon).
  - Sarcomas: Developing in connective and musculoskeletal tissues (bone, cartilage, fat, muscle).
  - Leukemias & Lymphomas: Hematologic malignancies arising in bone marrow and lymphatic systems.
• Diagnostic & Staging Workup: High-resolution imaging (CT, PET-CT, MRI), tumor biomarker panels (CEA, CA-125, PSA), histopathology, and tissue biopsy.
• Red Flag Warning Signs (CAUTION):
  - Change in bowel or bladder habits
  - A sore that does not heal
  - Unusual bleeding or discharge
  - Thickening or lump in breast or elsewhere
  - What should i do when i'm dizzy
  - Indigestion or difficulty swallowing
  - Obvious change in a wart or mole
  - Nagging cough or persistent hoarseness
  - Unexplained rapid weight loss (>10 lbs).
• Clinical Recommendation: Discuss comprehensive staging, genetic testing, and multidisciplinary oncological evaluation with your specialist.${DISCLAIMER}`
  },

  // RENAL & KIDNEY
  {
    keywords: ["creatinine", "kidney", "renal", "egfr", "bun", "nephrology", "dialysis", "glomerular", "proteinuria"],
    title: "Renal Function & Serum Creatinine Analysis",
    response: `Serum Creatinine is a chemical waste byproduct of phosphocreatine breakdown in skeletal muscle, cleared almost entirely via glomerular filtration in healthy kidneys.

• Pathophysiological Elevation:
  - Prerenal: Dehydration, hypovolemia, high dietary protein/creatine intake, vigorous muscle exertion.
  - Intrinsic Renal: Glomerulonephritis, acute tubular necrosis, nephrotoxic medications (NSAIDs, ACEi, aminoglycosides).
  - Postrenal: Urinary outflow obstruction (kidney stones, benign prostatic hyperplasia).
• Clinical Correlation: Physicians evaluate serum creatinine alongside estimated Glomerular Filtration Rate (eGFR), Blood Urea Nitrogen (BUN), and Urine Albumin-to-Creatinine Ratio (uACR).
• Recommended Next Steps: Maintain adequate hydration, review all nephrotoxic prescriptions with your nephrologist, and repeat renal panel within 1-2 weeks.${DISCLAIMER}`
  },

  // HEMATOLOGY & COMPLETE BLOOD COUNT
  {
    keywords: ["cbc", "complete blood count", "wbc", "platelet", "hemoglobin", "leukocyte", "anemia", "hematocrit", "rbc", "neutrophil", "lymphocyte"],
    title: "Complete Blood Count (CBC) Differential Interpretation",
    response: `A Complete Blood Count evaluates the three primary cellular lines produced in bone marrow: erythrocytes (RBCs), leukocytes (WBCs), and thrombocytes (platelets).

• White Blood Cells (WBC):
  - Leukocytosis (>11.0 x10^3/uL): Points toward acute bacterial/viral infection, systemic inflammation, physical trauma, or corticosteroid therapy.
  - Leukopenia (<4.0 x10^3/uL): May indicate viral suppression, autoimmune bone marrow suppression, or medication effects.
• Hemoglobin / Hematocrit:
  - Low (Anemia): Characterized by fatigue and pallor; common causes include iron deficiency, chronic disease, vitamin B12/folate deficiency, or acute/chronic blood loss.
• Platelets (Thrombocytes):
  - Normal reference spans 150,000 - 450,000 /uL. Low counts (thrombocytopenia) elevate bleeding risk; elevated counts (thrombocytosis) suggest reactive inflammation or myeloproliferative disorders.
• Clinical Recommendation: Correlate absolute differential counts with peripheral blood smear and clinical presentation.${DISCLAIMER}`
  },

  // FEVER & INFECTIOUS DISEASE
  {
    keywords: ["fever", "temperature", "pyrexia", "chills", "febrile", "sweats", "hyperthermia"],
    title: "Clinical Evaluation of Elevated Temperature (Fever)",
    response: `A fever (core body temperature ≥ 38.0°C / 100.4°F) is an adaptive physiological response regulated by the hypothalamic thermoregulatory center in response to pyrogenic cytokines (IL-1, IL-6, TNF-alpha).

• Common Etiologies: Viral upper respiratory infections (influenza, COVID-19, RSV), bacterial infections (pneumonia, urinary tract infection, cellulitis), or systemic inflammatory flares.
• Supportive Management Protocol: Rest, oral hydration with balanced electrolyte solutions, and light breathable clothing.
• Urgent Red Flags: Fever exceeding 103°F (39.4°F), lasting > 72 hours, accompanied by nuchal rigidity (stiff neck), confusion, petechial rash, persistent vomiting, or dyspnea (shortness of breath).
• Doctor Clarification Questions: Are blood cultures or rapid respiratory viral panels indicated?${DISCLAIMER}`
  },

  // CARDIAC & CHEST DISCOMFORT
  {
    keywords: ["chest pain", "angina", "heart", "cardiac", "palpitation", "myocardial", "infarction", "arrhythmia", "coronary", "tachycardia"],
    title: "Cardiovascular Symptoms & Chest Discomfort Stratification",
    response: `Chest pain warrants rigorous immediate triage to differentiate life-threatening cardiopulmonary conditions from musculoskeletal or gastrointestinal causes.

• Critical Red Flags (Dial Emergency Services 911 / 112 Immediately):
  - Crushing substernal pressure radiating to the left arm, shoulder, neck, or jaw.
  - Accompanied by diaphoresis (cold sweats), shortness of breath, dizziness, or syncope.
• Differential Diagnoses:
  - Cardiac: Acute Coronary Syndrome (ACS), angina pectoris, myocarditis, pericarditis.
  - Non-Cardiac: Gastroesophageal reflux (GERD), esophageal spasm, costochondritis, panic disorder, pulmonary embolism.
• Gold-Standard Diagnostics: 12-lead Electrocardiogram (ECG), Serial high-sensitivity Cardiac Troponin, and Chest X-ray.${DISCLAIMER}`
  },

  // DIABETES & METABOLISM
  {
    keywords: ["diabetes", "sugar", "glucose", "hba1c", "insulin", "hyperglycemia", "hypoglycemia", "prediabetes"],
    title: "Glycemic Telemetry & Glucose Regulation",
    response: `Glucose is the central metabolic carbohydrate utilized for cellular ATP production, tightly modulated by pancreatic endocrine hormones (insulin and glucagon).

• Diagnostic Diagnostic Reference Intervals:
  - Fasting Plasma Glucose: Normal < 100 mg/dL; Prediabetes: 100 - 125 mg/dL; Diabetes: ≥ 126 mg/dL (on repeated testing).
  - Hemoglobin A1c (90-Day Glycemic Average): Normal < 5.7%; Prediabetes: 5.7% - 6.4%; Diabetes: ≥ 6.5%.
• Physiological Complications: Sustained hyperglycemia accelerates microvascular damage (retinopathy, nephropathy, neuropathy) and macrovascular atherosclerosis.
• Management Pillars: Low-glycemic dietary planning, regular aerobic and resistance exercise, self-monitoring of blood glucose, and medication management (metformin, GLP-1 agonists, insulin).${DISCLAIMER}`
  },

  // HYPERTENSION & VASCULAR HEALTH
  {
    keywords: ["hypertension", "blood pressure", "bp", "systolic", "diastolic", "vascular"],
    title: "Blood Pressure Classification & Cardiovascular Risk",
    response: `Blood pressure quantifies the hydrostatic force exerted by circulating blood against arterial walls throughout cardiac systole and diastole.

• AHA/ACC Clinical Staging:
  - Normal: < 120 / < 80 mmHg
  - Elevated: 120 - 129 / < 80 mmHg
  - Stage 1 Hypertension: 130 - 139 or 80 - 89 mmHg
  - Stage 2 Hypertension: ≥ 140 or ≥ 90 mmHg
  - Hypertensive Crisis: > 180 and/or > 120 mmHg (requires emergency medical care).
• Lifestyle Interventions: Dietary Approaches to Stop Hypertension (DASH diet), sodium restriction (< 2,300 mg/day), weight optimization, stress reduction, and potassium-rich nutrition.${DISCLAIMER}`
  },

  // LIPID & CHOLESTEROL
  {
    keywords: ["cholesterol", "lipid", "ldl", "hdl", "triglyceride", "atherosclerosis", "statin"],
    title: "Lipid Profile & Atherosclerotic Risk Assessment",
    response: `A lipid panel quantifies serum lipoproteins to assess atherosclerotic cardiovascular disease (ASCVD) risk.

• Key Biomarkers:
  - LDL-C ("Low-Density Lipoprotein"): Primary atherogenic driver; target < 100 mg/dL (or < 70 mg/dL in high-risk individuals).
  - HDL-C ("High-Density Lipoprotein"): Facilitates reverse cholesterol transport; optimal > 40 mg/dL in men, > 50 mg/dL in women.
  - Triglycerides: Ideal fasting < 150 mg/dL; elevated levels associate with insulin resistance and pancreatitis risk.
• Management: Mediterranean dietary framework, elimination of trans fats, increased soluble fiber, and lipid-lowering pharmacotherapy (e.g. statins, ezetimibe).${DISCLAIMER}`
  },

  // NEUROLOGY & HEADACHES
  {
    keywords: ["migraine", "headache", "aura", "throbbing", "cephalalgia", "cluster", "tension headache"],
    title: "Neurovascular Headache & Migraine Triage",
    response: `Headaches are categorized into primary disorders (migraine, tension-type, cluster) and secondary disorders caused by underlying structural or systemic pathology.

• Migraine Features: Unilateral pulsating/throbbing pain of moderate-to-severe intensity, photophobia, phonophobia, nausea, and in 25-30% of patients, visual/sensory aura.
• Common Triggers: Sleep deprivation, physiological stress, hormonal shifts, skipping meals, dehydration, and certain dietary vasoactive compounds.
• SNOOP4 Red Flags Requiring Immediate ER Evaluation:
  - Systemic symptoms (fever, weight loss)
  - Neurologic deficits (confusion, weakness, visual loss)
  - Sudden onset "Thunderclap" headache (reaching maximum intensity in < 1 minute)
  - Older age onset (> 50 years)
  - Positional aggravation or pattern change.${DISCLAIMER}`
  },

  // RESPIRATORY & PULMONARY
  {
    keywords: ["cough", "asthma", "breath", "shortness of breath", "dyspnea", "wheezing", "pneumonia", "bronchitis", "copd", "lungs"],
    title: "Pulmonary Symptoms & Respiratory Assessment",
    response: `Respiratory symptoms reflect alterations in gas exchange, airway caliber, or pulmonary parenchyma.

• Key Diagnostic Considerations:
  - Asthma & COPD: Characterized by reversible or fixed airway obstruction, wheezing, and episodic dyspnea.
  - Pneumonia: Infection of alveoli presenting with productive cough, fever, pleuritic chest pain, and focal crackles on auscultation.
  - Acute Bronchitis: Self-limiting viral inflammation of bronchial tree typically lasting 1-3 weeks.
• Emergency Warning Signs: Resting SpO2 < 92%, cyanosis (bluish lips/fingers), inability to speak full sentences without pausing for breath, or intercostal retractions.${DISCLAIMER}`
  },

  // GASTROINTESTINAL & DIGESTIVE
  {
    keywords: ["stomach", "abdomen", "abdominal pain", "gerd", "acid reflux", "nausea", "vomiting", "diarrhea", "constipation", "ulcer", "ibs", "gastritis", "cramps"],
    title: "Gastrointestinal Evaluation & Abdominal Triage",
    response: `Abdominal and gastrointestinal symptoms require topographic anatomical evaluation to differentiate functional discomfort from acute surgical pathology.

• Key Conditions:
  - GERD / Gastritis: Epigastric burning exacerbated by reclining or spicy foods; managed with antacids, H2 blockers, and proton pump inhibitors.
  - Acute Gastroenteritis: Viral/bacterial infection causing vomiting, watery diarrhea, and cramping; primary goal is oral rehydration therapy.
  - Irritable Bowel Syndrome (IBS): Functional bowel disorder with recurrent abdominal pain associated with defecation and altered bowel habits.
• Red Flags for Acute Surgical Abdomen: Rigid involuntary guarding, localized rebound tenderness (e.g. McBurney's point in appendicitis), bloody stools (melena/hematochezia), or intractable vomiting.${DISCLAIMER}`
  },

  // THYROID & ENDOCRINE
  {
    keywords: ["thyroid", "tsh", "hypothyroidism", "hyperthyroidism", "hashimoto", "graves", "metabolism", "t3", "t4"],
    title: "Thyroid Function & Endocrine Homeostasis",
    response: `The thyroid gland produces triiodothyronine (T3) and thyroxine (T4) to regulate basal metabolic rate, cardiac chronotropy, and body temperature.

• Hypothyroidism (Underactive): Characterized by fatigue, unexplained weight gain, cold intolerance, constipation, bradycardia, and dry skin. Typically presents with elevated TSH and low free T4.
• Hyperthyroidism (Overactive): Characterized by palpitations, tremors, unintentional weight loss, heat intolerance, anxiety, and frequent bowel movements. Presents with suppressed TSH and elevated free T4/T3.
• Clinical Testing: Serum TSH (Thyroid Stimulating Hormone) is the primary first-line screening biomarker.${DISCLAIMER}`
  },

  // MUSCULOSKELETAL & ARTHRITIS
  {
    keywords: ["joint", "arthritis", "back pain", "gout", "uric acid", "osteoarthritis", "rheumatoid", "inflammation", "stiffness"],
    title: "Musculoskeletal Pain & Rheumatologic Screening",
    response: `Musculoskeletal pain can originate from degenerative mechanical wear, inflammatory autoimmunity, or crystalline arthropathies.

• Osteoarthritis: Degenerative cartilage degradation causing joint stiffness (< 30 min morning stiffness) that worsens with weight-bearing and activity.
• Rheumatoid Arthritis: Autoimmune synovial inflammation presenting symmetrically in small joints of hands/wrists with prolonged morning stiffness (> 1 hour).
• Gout: Uric acid crystal deposition causing sudden, excruciating monoarticular pain, typically in the first metatarsophalangeal joint (great toe).
• Lumbar Spine Red Flags: Cauda equina syndrome markers (saddle anesthesia, bowel/bladder incontinence, progressive lower extremity motor weakness) require emergency surgical decompression.${DISCLAIMER}`
  },

  // LIVER & HEPATIC
  {
    keywords: ["liver", "hepatic", "ast", "alt", "bilirubin", "jaundice", "cirrhosis", "fatty liver", "hepatitis"],
    title: "Hepatic Biomarkers & Liver Health Screening",
    response: `The liver coordinates drug metabolism, bile synthesis, protein synthesis (albumin, clotting factors), and glycogen storage.

• Key Liver Function Biomarkers:
  - ALT (Alanine Aminotransferase): Highly specific for hepatocyte injury.
  - AST (Aspartate Aminotransferase): Found in liver and cardiac/skeletal muscle; AST:ALT ratio > 2 may suggest alcohol-related injury.
  - Alkaline Phosphatase (ALP) & GGT: Markers of biliary tract obstruction or cholestasis.
  - Total Bilirubin: Elevation indicates biliary obstruction, hemolysis, or hepatic clearance dysfunction (manifesting as jaundice).
• Common Etiologies: Metabolic Dysfunction-Associated Steatotic Liver Disease (MASLD/NAFLD), viral hepatitis, and alcohol toxicity.${DISCLAIMER}`
  },

  // MENTAL HEALTH & ANXIETY
  {
    keywords: ["anxiety", "depression", "panic", "stress", "insomnia", "sleep", "mental health", "mood"],
    title: "Neuropsychiatric Health & Stress Response",
    response: `Psychological and emotional symptoms involve neurochemical dysregulation in central monoaminergic and GABAergic neurotransmitter pathways.

• Generalized Anxiety & Panic: Characterized by hyperarousal, racing heartbeat, somatic tension, and sudden surges of intense apprehension.
• Depressive Disorders: Marked by persistent low mood, anhedonia (loss of interest), changes in appetite or sleep architecture, and impaired concentration.
• Evidence-Based Modalities: Cognitive Behavioral Therapy (CBT), mindfulness-based stress reduction, structured sleep hygiene, regular aerobic exercise, and medical consultation for pharmacotherapy (SSRIs, SNRIs).
• Emergency Crisis Support: If experiencing thoughts of self-harm, please connect with crisis counselors by dialing 988 (Suicide & Crisis Lifeline) or local emergency services.${DISCLAIMER}`
  },

  // FATIGUE & GENERAL MALAISE
  {
    keywords: ["fatigue", "tired", "exhaustion", "lethargy", "weakness", "burnout"],
    title: "Chronic Fatigue Clinical Screening Protocol",
    response: `Persistent, unexplained fatigue requires a methodical diagnostic strategy to rule out systemic metabolic, hematologic, or sleep disorders.

• Recommended First-Line Lab Panels:
  - Complete Blood Count (CBC) with differential (to evaluate anemia or occult infection).
  - Comprehensive Metabolic Panel (electrolytes, renal, hepatic indices).
  - Thyroid Stimulating Hormone (TSH) to assess hypothyroidism.
  - Serum Ferritin, Vitamin D-25-OH, and Vitamin B12 levels.
  - Fasting Blood Glucose and HbA1c to assess dysglycemia.
• Sleep Architecture Review: Screen for Obstructive Sleep Apnea (OSA) if fatigue is accompanied by loud snoring, morning dry mouth, or daytime somnolence.${DISCLAIMER}`
  }
];

// --------------------------------------------------------------------------
// TIER 3: DYNAMIC CONTEXTUAL SYNTHESIS FALLBACK
// --------------------------------------------------------------------------
function generateContextualResponse(query) {
  const clean = query.trim();
  const lower = clean.toLowerCase();

  // Anatomical and Clinical Feature Extraction
  let focusSystem = "General Physiological System";
  if (lower.includes("head") || lower.includes("brain") || lower.includes("eye") || lower.includes("ear") || lower.includes("neck")) {
    focusSystem = "Head, Neurological & Sensory System";
  } else if (lower.includes("chest") || lower.includes("heart") || lower.includes("rib") || lower.includes("lung")) {
    focusSystem = "Cardiopulmonary System";
  } else if (lower.includes("stomach") || lower.includes("belly") || lower.includes("bowel") || lower.includes("gut") || lower.includes("liver")) {
    focusSystem = "Gastrointestinal & Hepatic System";
  } else if (lower.includes("back") || lower.includes("spine") || lower.includes("knee") || lower.includes("leg") || lower.includes("arm") || lower.includes("muscle") || lower.includes("bone")) {
    focusSystem = "Musculoskeletal & Orthopedic System";
  } else if (lower.includes("skin") || lower.includes("rash") || lower.includes("itch") || lower.includes("mole")) {
    focusSystem = "Dermatological System";
  } else if (lower.includes("urine") || lower.includes("bladder") || lower.includes("kidney") || lower.includes("prostate")) {
    focusSystem = "Renal & Urological System";
  }

  const keywords = extractClinicalKeywords(query);
  if (keywords.length === 0) keywords.push("Clinical Consultation", focusSystem);

  const responseText = `Clinical Evaluation Summary for: "${clean}"

• Anatomical & Clinical Focus: ${focusSystem}
• Pathophysiological Framework: When evaluating "${clean}", healthcare professionals assess symptom duration, precipitating triggers, radiation patterns, and associated functional changes.
• Standard Diagnostic Investigations:
  1. Complete Blood Count (CBC) and targeted biochemical panels.
  2. Diagnostic imaging or anatomical physical examination if symptoms localize to specific anatomical regions.
  3. Medication reconciliation to rule out adverse pharmacological effects.
• Clinical Clarification Questions for Your Doctor:
  1. What is the most probable underlying etiology for "${clean}"?
  2. Are specific diagnostic lab tests, imaging, or specialist referrals indicated?
  3. What secondary red-flag symptoms should prompt emergency care?${DISCLAIMER}`;

  return {
    response: responseText,
    matchedKeywords: keywords
  };
}

// --------------------------------------------------------------------------
// MAIN DISPATCHER: PROCESS CHAT QUERY (Async with Gemini + Fallback)
// --------------------------------------------------------------------------
export async function processChatQuery(userMessage) {
  if (!userMessage || typeof userMessage !== "string" || !userMessage.trim()) {
    return {
      response: `Please provide a health query or describe your symptoms.${DISCLAIMER}`,
      matchedKeywords: ["Consultation"]
    };
  }

  // 1. Attempt Live Gemini API First
  try {
    const geminiResult = await callGeminiAPI(userMessage);
    if (geminiResult && geminiResult.response) {
      return geminiResult;
    }
  } catch (err) {
    console.warn("Gemini call bypassed:", err.message);
  }

  // 2. Attempt Groq Ultra-Fast AI (qwen/qwen3.8-27b & gpt-oss-120b)
  try {
    const groqResponse = await generateChatWithGroq(userMessage);
    if (groqResponse && groqResponse.trim()) {
      const keywords = extractClinicalKeywords(userMessage + " " + groqResponse);
      return {
        response: groqResponse.trim() + DISCLAIMER,
        matchedKeywords: keywords.length > 0 ? keywords : ["Groq Clinical Engine", "Medical Guidance"]
      };
    }
  } catch (err) {
    console.warn("Groq chat bypassed:", err.message);
  }

  // 3. Check Extensive Clinical Knowledge Base (Tier 2)
  const cleanQuery = userMessage.toLowerCase();
  for (const item of KNOWLEDGE_BASE) {
    for (const kw of item.keywords) {
      if (cleanQuery.includes(kw)) {
        return {
          response: item.response,
          matchedKeywords: [kw.charAt(0).toUpperCase() + kw.slice(1), "Clinical Guidelines"]
        };
      }
    }
  }

  // 4. Dynamic Contextual Synthesizer (Tier 3)
  return generateContextualResponse(userMessage);
}

// --------------------------------------------------------------------------
// REPORT ANALYZER LOGIC (Precision Local + Live Gemini)
// ==========================================================================

const REPORT_BIOMARKER_DEFS = [
  // 1. Glycemic
  {
    name: "Fasting Blood Sugar (FBS)",
    match: line => /\b(fasting|fbs)\b/i.test(line) && !/\b(ppbs|random|post|hba1c)\b/i.test(line),
    defaultUnit: "mg/dL",
    ref: "70.0 - 99.0 mg/dL",
    eval: v => v >= 126 ? "Elevated (Diabetic Range)" : (v > 99 ? "Elevated (Impaired Fasting)" : (v < 70 ? "Low (Hypoglycemia)" : "Optimal"))
  },
  {
    name: "Postprandial Blood Sugar (PPBS)",
    match: line => /\b(post\s*prandial|ppbs|after\s*food|after\s*meal)\b/i.test(line),
    defaultUnit: "mg/dL",
    ref: "< 140 mg/dL",
    eval: v => v >= 200 ? "Elevated (Diabetic Range)" : (v >= 140 ? "Elevated (Impaired Glucose)" : "Optimal")
  },
  {
    name: "Random Blood Sugar (RBS)",
    match: line => /\b(random\s*blood\s*sugar|rbs)\b/i.test(line),
    defaultUnit: "mg/dL",
    ref: "< 140 mg/dL",
    eval: v => v >= 200 ? "Elevated" : (v < 70 ? "Low" : "Optimal")
  },
  {
    name: "HbA1c (Glycated Hemoglobin)",
    match: line => /\b(hba1c|glycated\s*hemoglobin|glycohemoglobin)\b/i.test(line),
    defaultUnit: "%",
    ref: "< 5.7 %",
    eval: v => v >= 6.5 ? "Elevated (Diabetic Range)" : (v >= 5.7 ? "Elevated (Prediabetes)" : "Optimal")
  },

  // 2. Renal
  {
    name: "Serum Creatinine",
    match: line => /\b(serum\s*creatinine|creatinine)\b/i.test(line) && !/\b(clearance|ratio|urine)\b/i.test(line),
    defaultUnit: "mg/dL",
    ref: "0.70 - 1.20 mg/dL",
    eval: v => v > 1.20 ? "Elevated (Renal Strain)" : (v < 0.60 ? "Low" : "Optimal")
  },
  {
    name: "Blood Urea Nitrogen (BUN)",
    match: line => /\b(bun|blood\s*urea\s*nitrogen)\b/i.test(line),
    defaultUnit: "mg/dL",
    ref: "7.0 - 20.0 mg/dL",
    eval: v => v > 20.0 ? "Elevated" : "Optimal"
  },
  {
    name: "Blood Urea",
    match: line => /\b(blood\s*urea|urea)\b/i.test(line) && !/\b(nitrogen|bun)\b/i.test(line),
    defaultUnit: "mg/dL",
    ref: "15.0 - 45.0 mg/dL",
    eval: v => v > 45.0 ? "Elevated" : "Optimal"
  },
  {
    name: "Estimated GFR (eGFR)",
    match: line => /\b(egfr|estimated\s*gfr|gfr)\b/i.test(line),
    defaultUnit: "mL/min",
    ref: "> 90 mL/min",
    eval: v => v < 60 ? "Reduced (Impaired Clearance)" : (v < 90 ? "Mildly Reduced" : "Optimal")
  },
  {
    name: "Uric Acid",
    match: line => /\b(uric\s*acid)\b/i.test(line),
    defaultUnit: "mg/dL",
    ref: "3.5 - 7.2 mg/dL",
    eval: v => v > 7.2 ? "Elevated (Hyperuricemia)" : (v < 3.0 ? "Low" : "Optimal")
  },

  // 3. Complete Blood Count (CBC)
  {
    name: "Hemoglobin",
    match: line => /\b(hemoglobin|hb)\b/i.test(line) && !/\b(hba1c|a1c|glycated)\b/i.test(line),
    defaultUnit: "g/dL",
    ref: "13.0 - 17.0 g/dL",
    eval: v => v < 12.0 ? "Low (Anemia Indicator)" : (v > 17.5 ? "Elevated" : "Optimal")
  },
  {
    name: "White Blood Cell Count (WBC)",
    match: line => /\b(wbc|leukocyte|tlc|total\s*leukocyte)\b/i.test(line),
    defaultUnit: "x10^3/uL",
    ref: "4.5 - 11.0 x10^3/uL",
    eval: v => v > 11.0 ? "Elevated (Leukocytosis)" : (v < 4.0 ? "Low (Leukopenia)" : "Optimal")
  },
  {
    name: "Platelet Count",
    match: line => /\b(platelet|platelets|thrombocyte)\b/i.test(line),
    defaultUnit: "x10^3/uL",
    ref: "150 - 450 x10^3/uL",
    eval: v => v < 150 ? "Low (Thrombocytopenia)" : (v > 450 ? "Elevated (Thrombocytosis)" : "Optimal")
  },
  {
    name: "Erythrocyte Count (RBC)",
    match: line => /\b(rbc|red\s*blood\s*cell|erythrocyte)\b/i.test(line) && !/\b(wbc)\b/i.test(line),
    defaultUnit: "x10^6/uL",
    ref: "4.5 - 5.9 x10^6/uL",
    eval: v => v < 4.2 ? "Low" : (v > 6.0 ? "Elevated" : "Optimal")
  },
  {
    name: "Packed Cell Volume (Hematocrit/PCV)",
    match: line => /\b(pcv|hematocrit|packed\s*cell)\b/i.test(line),
    defaultUnit: "%",
    ref: "38.0 - 50.0 %",
    eval: v => v < 36.0 ? "Low" : (v > 52.0 ? "Elevated" : "Optimal")
  },
  {
    name: "Erythrocyte Sedimentation Rate (ESR)",
    match: line => /\b(esr|erythrocyte\s*sedimentation)\b/i.test(line),
    defaultUnit: "mm/hr",
    ref: "0 - 20 mm/hr",
    eval: v => v > 20 ? "Elevated (Inflammatory Marker)" : "Optimal"
  },

  // 4. Lipid Profile
  {
    name: "Total Cholesterol",
    match: line => /\b(total\s*cholesterol)\b/i.test(line) || (/\b(cholesterol)\b/i.test(line) && !/\b(hdl|ldl|vldl)\b/i.test(line)),
    defaultUnit: "mg/dL",
    ref: "< 200 mg/dL",
    eval: v => v >= 240 ? "High (Hypercholesterolemia)" : (v >= 200 ? "Borderline High" : "Optimal")
  },
  {
    name: "LDL Cholesterol",
    match: line => /\b(ldl(?:s*cholesterol|\s*-?\s*c)?)\b/i.test(line),
    defaultUnit: "mg/dL",
    ref: "< 100 mg/dL",
    eval: v => v >= 160 ? "High" : (v >= 100 ? "Elevated" : "Optimal")
  },
  {
    name: "HDL Cholesterol",
    match: line => /\b(hdl(?:s*cholesterol|\s*-?\s*c)?)\b/i.test(line),
    defaultUnit: "mg/dL",
    ref: "> 40 mg/dL",
    eval: v => v < 40 ? "Low (Reduced Protective Factor)" : "Optimal"
  },
  {
    name: "Triglycerides",
    match: line => /\b(triglycerides?|tg)\b/i.test(line),
    defaultUnit: "mg/dL",
    ref: "< 150 mg/dL",
    eval: v => v >= 200 ? "High" : (v >= 150 ? "Borderline High" : "Optimal")
  },
  {
    name: "VLDL Cholesterol",
    match: line => /\b(vldl)\b/i.test(line),
    defaultUnit: "mg/dL",
    ref: "< 30 mg/dL",
    eval: v => v > 30 ? "Elevated" : "Optimal"
  },

  // 5. Liver Function (LFT)
  {
    name: "ALT (SGPT)",
    match: line => /\b(alt|sgpt|alanine\s*aminotransferase)\b/i.test(line),
    defaultUnit: "U/L",
    ref: "10 - 40 U/L",
    eval: v => v > 40 ? "Elevated (Hepatic Transaminase)" : "Optimal"
  },
  {
    name: "AST (SGOT)",
    match: line => /\b(ast|sgot|aspartate\s*aminotransferase)\b/i.test(line) && !/\b(fasting)\b/i.test(line),
    defaultUnit: "U/L",
    ref: "10 - 38 U/L",
    eval: v => v > 38 ? "Elevated (Hepatic Transaminase)" : "Optimal"
  },
  {
    name: "Total Bilirubin",
    match: line => /\b(total\s*bilirubin|bilirubin\s*total)\b/i.test(line) || (/\b(bilirubin)\b/i.test(line) && !/\b(direct|indirect)\b/i.test(line)),
    defaultUnit: "mg/dL",
    ref: "0.2 - 1.2 mg/dL",
    eval: v => v > 1.2 ? "Elevated (Jaundice / Biliary)" : "Optimal"
  },
  {
    name: "Direct Bilirubin",
    match: line => /\b(direct\s*bilirubin|conjugated\s*bilirubin)\b/i.test(line),
    defaultUnit: "mg/dL",
    ref: "< 0.3 mg/dL",
    eval: v => v > 0.3 ? "Elevated" : "Optimal"
  },
  {
    name: "Alkaline Phosphatase (ALP)",
    match: line => /\b(alp|alkaline\s*phosphatase)\b/i.test(line),
    defaultUnit: "U/L",
    ref: "44 - 147 U/L",
    eval: v => v > 147 ? "Elevated" : (v < 40 ? "Low" : "Optimal")
  },

  // 6. Thyroid
  {
    name: "Thyroid Stimulating Hormone (TSH)",
    match: line => /\b(tsh|thyroid\s*stimulating)\b/i.test(line),
    defaultUnit: "uIU/mL",
    ref: "0.40 - 4.50 uIU/mL",
    eval: v => v > 4.50 ? "Elevated (Hypothyroid Tendency)" : (v < 0.40 ? "Low (Hyperthyroid Tendency)" : "Optimal")
  },
  {
    name: "Free T3 (FT3)",
    match: line => /\b(ft3|free\s*t3)\b/i.test(line),
    defaultUnit: "pg/mL",
    ref: "2.3 - 4.2 pg/mL",
    eval: v => v > 4.2 ? "Elevated" : (v < 2.3 ? "Low" : "Optimal")
  },
  {
    name: "Free T4 (FT4)",
    match: line => /\b(ft4|free\s*t4)\b/i.test(line),
    defaultUnit: "ng/dL",
    ref: "0.8 - 1.8 ng/dL",
    eval: v => v > 1.8 ? "Elevated" : (v < 0.8 ? "Low" : "Optimal")
  },

  // 7. Inflammatory & Cardiac
  {
    name: "hs-CRP (High-Sensitivity CRP)",
    match: line => /\b(hs-?crp|c-?reactive\s*protein)\b/i.test(line),
    defaultUnit: "mg/L",
    ref: "< 1.0 mg/L",
    eval: v => v > 3.0 ? "High (Systemic Inflammation)" : (v >= 1.0 ? "Elevated (Moderate Risk)" : "Optimal")
  },
  {
    name: "Serum Ferritin",
    match: line => /\b(ferritin)\b/i.test(line),
    defaultUnit: "ng/mL",
    ref: "20 - 250 ng/mL",
    eval: v => v < 20 ? "Low (Iron Depletion)" : (v > 300 ? "Elevated" : "Optimal")
  },

  // 8. Vitamins & Minerals
  {
    name: "Vitamin D (25-Hydroxy)",
    match: line => /\b(vitamin\s*d|25-?oh\s*vitamin\s*d)\b/i.test(line),
    defaultUnit: "ng/mL",
    ref: "30.0 - 100.0 ng/mL",
    eval: v => v < 20 ? "Deficient" : (v < 30 ? "Insufficient" : "Optimal")
  },
  {
    name: "Vitamin B12",
    match: line => /\b(vitamin\s*b12|b12|cobalamin)\b/i.test(line),
    defaultUnit: "pg/mL",
    ref: "200 - 900 pg/mL",
    eval: v => v < 200 ? "Low (Deficiency Indicator)" : "Optimal"
  },
  {
    name: "Serum Calcium",
    match: line => /\b(calcium)\b/i.test(line),
    defaultUnit: "mg/dL",
    ref: "8.5 - 10.5 mg/dL",
    eval: v => v > 10.5 ? "Elevated" : (v < 8.5 ? "Low" : "Optimal")
  },
  {
    name: "Serum Potassium",
    match: line => /\b(potassium|k\+)\b/i.test(line),
    defaultUnit: "mEq/L",
    ref: "3.5 - 5.0 mEq/L",
    eval: v => v > 5.2 ? "Elevated (Hyperkalemia Risk)" : (v < 3.5 ? "Low (Hypokalemia)" : "Optimal")
  },
  {
    name: "Serum Sodium",
    match: line => /\b(sodium|na\+)\b/i.test(line),
    defaultUnit: "mEq/L",
    ref: "135 - 145 mEq/L",
    eval: v => v > 145 ? "Elevated (Hypernatremia)" : (v < 135 ? "Low (Hyponatremia)" : "Optimal")
  }
];

function extractBiomarkersLocally(text) {
  if (!text || typeof text !== "string") return [];

  // Robust splitting: newlines, semicolons, pipe, sentences, comma-separated key-values
  const lines = text
    .split(/(?:[\r\n|;]+|\.\s+(?=[A-Za-z])|\band\s+(?=[A-Za-z])|,\s*(?=[A-Za-z]))/)
    .map(l => l.trim())
    .filter(l => l.length > 2);

  const biomarkers = [];
  const matchedNames = new Set();

  for (const line of lines) {
    for (const def of REPORT_BIOMARKER_DEFS) {
      if (matchedNames.has(def.name)) continue;
      if (def.match(line)) {
        // Find number: preceded by colon/equals/tab/is/at/of/spaces, or followed by unit, or standalone
        const m = line.match(/(?:[:=|\t]|\bis\b|\bat\b|\bof\b|\s{2,})\s*([<>]?\s*\d+(?:\.\d+)?)/i) ||
          line.match(/\b([<>]?\s*\d+(?:\.\d+)?)\s*(mg\/dl|mmol\/l|g\/dl|g\/l|%|u\/l|uiu\/ml|x10\^?3\/[uµ]l|\/cumm|k\/[uµ]l|ml\/min|pg\/ml|ng\/ml|meq\/l|mm\/hr)/i) ||
          line.match(/(?:^|\s)([<>]?\s*\d+(?:\.\d+)?)(?:\s|$)/);

        if (m) {
          const rawNumStr = m[1].replace(/[<>\s]/g, "");
          const num = parseFloat(rawNumStr);
          if (!isNaN(num)) {
            const uMatch = line.match(/(mg\/dl|mmol\/l|g\/dl|g\/l|%|u\/l|uiu\/ml|x10\^?3\/[uµ]l|\/cumm|k\/[uµ]l|ml\/min|pg\/ml|ng\/ml|meq\/l|mm\/hr)/i);
            const unit = uMatch ? uMatch[1] : def.defaultUnit;

            biomarkers.push({
              name: def.name,
              value: `${num} ${unit}`.trim(),
              ref: def.ref,
              status: def.eval(num)
            });
            matchedNames.add(def.name);
            break;
          }
        }
      }
    }
  }

  // Fallback generic parser for custom or unlisted lab lines
  if (biomarkers.length === 0) {
    for (const line of lines) {
      const genericM = line.match(/^([A-Za-z0-9\s\(\)\-\/.\+]{3,40}?)\s*[:=|\t]\s*([<>]?\s*\d+(?:\.\d+)?)\s*([a-zA-Z%\/\^0-9]+)?/);
      if (genericM) {
        const testName = genericM[1].trim();
        const testVal = genericM[2].trim();
        const testUnit = (genericM[3] || "").trim();
        if (!matchedNames.has(testName) && testName.length > 2) {
          biomarkers.push({
            name: testName,
            value: `${testVal} ${testUnit}`.trim(),
            ref: "Clinical Reference Interval",
            status: "Reported"
          });
          matchedNames.add(testName);
        }
      }
    }
  }

  return biomarkers;
}

async function extractBiomarkersWithGemini(text, fileContext = {}) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  const prompt = `You are Medical AI Sushruta, an expert clinical pathologist and lab diagnostic intelligence AI.
Carefully examine this medical report text or document.
Extract ALL actual lab test biomarkers with their exact measured numerical or qualitative values, their units, and the exact reference intervals reported.
Evaluate the clinical status for each marker as: "Optimal", "Elevated", "Low", or "Critical".
Evaluate overall report status as: "optimal", "attention", or "critical".
Provide a clear 3-4 sentence clinical summary explaining the specific findings and practical questions to discuss with their physician.

Return STRICT JSON ONLY (no markdown code fences, just raw JSON matching this schema):
{
  "status": "attention" or "optimal",
  "summary": "Clinical interpretation of specific findings...",
  "biomarkers": [
    {
      "name": "Exact Test Name",
      "value": "Exact Number with Unit (e.g. 148 mg/dL)",
      "ref": "Reference range (e.g. 70.0 - 99.0 mg/dL)",
      "status": "Optimal" or "Elevated" or "Low" or "Critical"
    }
  ]
}

Report Content:
${text}`;

  const parts = [];
  if (fileContext.buffer && fileContext.mimeType && fileContext.mimeType.startsWith("image/")) {
    parts.push({
      inline_data: {
        mime_type: fileContext.mimeType,
        data: fileContext.buffer.toString("base64")
      }
    });
  }
  parts.push({ text: prompt });

  const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
  for (const model of modelsToTry) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 4096
            }
          }),
          signal: controller.signal
        }
      );
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          let clean = rawText.trim();
          if (clean.startsWith("```json")) clean = clean.slice(7);
          if (clean.startsWith("```")) clean = clean.slice(3);
          if (clean.endsWith("```")) clean = clean.slice(0, -3);
          clean = clean.trim();

          const parsed = JSON.parse(clean);
          if (Array.isArray(parsed.biomarkers) && parsed.biomarkers.length > 0) {
            return parsed;
          }
        }
      } else if (response.status === 401 || response.status === 403) {
        return null;
      }
    } catch (err) {
      console.warn(`Gemini report extraction notice (${model}):`, err.message);
    }
  }

  return null;
}

export async function analyzeReportContent(text, filename = "Diagnostic_Report.pdf", fileContext = {}) {
  // 1. Try Live Gemini First
  let aiResult = null;
  try {
    aiResult = await extractBiomarkersWithGemini(text, fileContext);
  } catch { }

  // 2. Try Groq Clinical Parser Second
  if ((!aiResult || !aiResult.biomarkers || aiResult.biomarkers.length === 0) && text) {
    try {
      aiResult = await extractBiomarkersWithGroq(text);
    } catch { }
  }

  if (aiResult && aiResult.biomarkers && aiResult.biomarkers.length > 0) {
    return {
      filename,
      status: aiResult.status || "optimal",
      summary: (aiResult.summary || "Clinical diagnostic evaluation completed.") + DISCLAIMER,
      biomarkers: aiResult.biomarkers
    };
  }

  // 2. High-Precision Local Clinical Extraction (Extracts EXACT numbers from user's report)
  const biomarkers = extractBiomarkersLocally(text);

  if (biomarkers.length === 0) {
    return {
      filename,
      status: "optimal",
      summary: `Diagnostic review of "${filename}" did not identify numerical lab biomarkers in the provided content. Please ensure the file contains readable test metrics (e.g., "Fasting Glucose: 110 mg/dL, HbA1c: 6.2%") or paste the values directly into the text field.${DISCLAIMER}`,
      biomarkers: []
    };
  }

  const abnormal = biomarkers.filter(b => b.status && !b.status.toLowerCase().includes("optimal") && !b.status.toLowerCase().includes("normal") && !b.status.toLowerCase().includes("reported"));
  const optimal = biomarkers.filter(b => b.status && (b.status.toLowerCase().includes("optimal") || b.status.toLowerCase().includes("normal")));

  const status = abnormal.length > 0 ? "attention" : "optimal";
  let summary = "";

  if (abnormal.length > 0) {
    const abnormalList = abnormal.map(b => `${b.name} is ${b.status.toLowerCase()} at ${b.value} (ref: ${b.ref})`).join("; ");
    const optimalMention = optimal.length > 0 ? ` Normal physiological findings were confirmed in ${optimal.length} marker(s) including ${optimal.slice(0, 3).map(o => o.name).join(", ")}.` : "";
    summary = `Clinical review of "${filename}" identified ${abnormal.length} biomarker(s) outside standard reference intervals: ${abnormalList}.${optimalMention} Targeted medical follow-up with your physician is advised to correlate these specific findings.`;
  } else {
    const listNames = biomarkers.slice(0, 4).map(b => b.name).join(", ");
    summary = `Diagnostic review of "${filename}" confirms that all ${biomarkers.length} identified biomarkers (${listNames}) are aligned within normative reference intervals. Continue scheduled routine health maintenance.`;
  }

  return {
    filename,
    status,
    summary: summary + DISCLAIMER,
    biomarkers
  };
}
