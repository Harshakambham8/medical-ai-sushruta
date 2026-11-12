// ==========================================================================
// MEDICAL AI SUSHRUTA - CLINICAL KNOWLEDGE BASE
// Comprehensive Medical Expert Encyclopedia for 130+ Clinical Terms
// ==========================================================================

export const CLINICAL_KNOWLEDGE_BASE = [
  // 1. GENERAL PAIN & MUSCULAR ACHES
  {
    title: "General Pain, Body Aches & Muscular Discomfort",
    keywords: ["pain", "body aches", "body ache", "muscle pain", "neck pain", "myalgia", "cervical pain", "sore muscles"],
    response: `Pain and generalized body aches reflect nociceptive stimulation from physical strain, systemic inflammation, or infectious myositis.

• Pathophysiological Framework: When evaluating body aches or muscle pain, clinicians assess whether the pain is localized (mechanical strain, postural fatigue) or diffuse (viral prodrome, systemic inflammatory illness, fibromyalgia).
• Common Etiologies:
  - Acute musculoskeletal strain or cervical neck postural stress ("text neck").
  - Systemic viral infections (influenza, dengue, COVID-19) triggering pyrogenic cytokine-induced myalgias.
  - Electrolyte depletion (potassium, magnesium) or dehydration.
• Immediate Supportive Self-Care:
  - R.I.C.E. protocol for localized muscle injury (Rest, Ice for first 48 hours, gentle Compression, Elevation).
  - Warm moist compresses and gentle range-of-motion stretching for chronic neck and muscular tension.
  - Adequate hydration with oral electrolytes.
• Red Flag Warning Signs (Seek Urgent Care):
  - Severe neck stiffness accompanied by high fever and photophobia (meningismus sign).
  - Radiating electrical pain down the arms or legs with numbness or progressive weakness.
  - Incontinence of urine or bowel associated with spinal or body pain.`
  },

  // 2. FEVER, CHILLS, SHIVERING & NIGHT SWEATS
  {
    title: "Fever, Chills, Shivering & Nocturnal Diaphoresis",
    keywords: ["fever", "chills", "shivering", "night sweats", "febrile", "pyrexia", "cold sweats"],
    response: `Fever (body temperature >= 38.0°C / 100.4°F) with rigors or night sweats indicates an active immune response orchestrated by endogenous pyrogens (IL-1, IL-6, TNF-alpha) acting on the hypothalamus.

• Clinical Differential:
  - Acute Viral/Bacterial Infections: Upper respiratory tract infections, pneumonia, urinary tract infections, dengue, or malaria.
  - Persistent Night Sweats: Drenching sweats requiring clothes changes warrant screening for tuberculosis (TB), chronic lymphoproliferative disorders, or endocrine hyperactivity.
• Home Management Protocol:
  - Strict bed rest and high-volume fluid replacement (water, oral rehydration salts, clear broths).
  - Tepid sponging on forehead and limbs if temperature exceeds 101°F.
  - Light, breathable cotton clothing; avoid heavy bundling during the fever peak.
• Critical Red Flags:
  - Temperature exceeding 103°F (39.4°C) or lasting > 72 hours without defervescence.
  - Petechial purple skin rash, neck rigidity, acute confusion, or labored respiration.`
  },

  // 3. HEADACHES & MIGRAINE
  {
    title: "Headache, Migraine & Cephalalgia Evaluation",
    keywords: ["headache", "migraine", "head pain", "throbbing head", "vascular headache"],
    response: `Headaches are categorized into primary neurovascular syndromes (migraine, tension-type, cluster) and secondary headaches arising from underlying systemic or cranial pathology.

• Migraine Characteristics: Often unilateral, pulsating/throbbing intensity (moderate to severe), accompanied by photophobia, phonophobia, nausea, and in ~25% of cases, sensory or visual aura.
• Common Triggers: Irregular sleep cycles, emotional stress, dehydration, skipped meals, hormonal fluctuations, and sensory overload.
• Immediate Relief Strategies:
  - Rest in a quiet, dark, well-ventilated room.
  - Apply cold compress to the forehead or temples.
  - Proper hydration and early administration of prescribed rescue therapy.
• SNOOP4 Emergency Warning Signs (Requires Immediate Emergency Care):
  - "Thunderclap" headache: Instantaneous peak pain within 60 seconds (rule out subarachnoid hemorrhage).
  - Headache accompanied by focal weakness, slurred speech, confusion, or stiff neck.`
  },

  // 4. UPPER RESPIRATORY, COLD, RUNNY NOSE, SNEEZING & SINUS
  {
    title: "Upper Respiratory Infection, Cold, Sneezing & Sinusitis",
    keywords: ["cold", "runny nose", "sneezing", "sneeze", "sinus", "sinusitis", "nasal congestion", "rhinorrhea", "stuffiness"],
    response: `Sneezing (sternutation) and rhinitis represent protective involuntary respiratory reflexes designed to clear upper airway mucosa of irritants, allergens, or viral pathogens.

• Common Clinical Etiologies:
  - Acute Viral Rhinitis (Common Cold): Rhinovirus, coronavirus, or adenovirus causing mucosal edema and clear-to-mucopurulent discharge.
  - Allergic Rhinitis: IgE-mediated histamine release triggered by pollen, house dust mites, or pet dander.
  - Acute Sinusitis: Secondary inflammation of paranasal sinuses presenting with facial pressure, headache, and nasal obstruction.
• Supportive Management:
  - Isotonic saline nasal sprays or warm saline rinses to flush mucosal debris.
  - Steam inhalation (2-3 times daily) with adequate oral hydration.
  - Antihistamines for allergic sneezing; short-term topical decongestants (limit to <= 3-5 days to avoid rebound rhinitis medicamentosa).
• When to Consult a Physician:
  - Symptoms persisting > 10 days without improvement, severe periorbital facial swelling, or high unrelenting fever.`
  },

  // 5. SORE THROAT & SCRATCHY THROAT
  {
    title: "Sore Throat, Scratchy Throat & Pharyngitis",
    keywords: ["sore throat", "scratchy throat", "pharyngitis", "throat pain", "tonsillitis"],
    response: `Throat discomfort ranges from minor scratchiness to severe odynophagia (pain on swallowing) caused by inflammation of the pharyngeal and tonsillar mucosa.

• Clinical Distinction (Centor Criteria):
  - Viral Pharyngitis (~80% of cases): Accompanied by cough, coryza (runny nose), and mild erythema.
  - Bacterial (Group A Streptococcus): Sudden onset, high fever, tonsillar exudates (white patches), tender cervical lymph nodes, and NO cough.
• Evidence-Based Home Interventions:
  - Warm salt-water gargles (1/2 tsp salt in 1 glass of warm water, 3-4 times daily).
  - Warm herbal broths or honey-lemon water (for individuals > 1 year of age).
  - Throat lozenges for topical demulcent effect.
• Urgent Red Flags:
  - Inability to swallow fluids or own saliva (drooling), difficulty opening mouth (trismus), stridor, or respiratory distress.`
  },

  // 6. COUGH, DRY COUGH, PHLEGM & SPUTUM
  {
    title: "Cough, Dry Cough, Phlegm & Sputum Assessment",
    keywords: ["cough", "dry cough", "phlegm", "sputum", "productive cough", "hacking cough"],
    response: `A cough is a vital defensive reflex that clears the tracheobronchial tree of secretions, foreign bodies, and pathogens.

• Clinical Classification:
  - Acute (< 3 weeks): Most commonly acute viral bronchitis, viral upper respiratory illness, or environmental irritants.
  - Subacute / Chronic (> 8 weeks): Post-nasal drip (UACS), asthma (cough-variant), GERD (acid reflux cough), or medication-induced (e.g., ACE inhibitors).
  - Dry vs Productive: Dry cough points to viral irritation or bronchial hyperreactivity; productive sputum suggests lower respiratory clearance.
• Supportive Management:
  - Honey (1-2 teaspoons before sleep), warm hydration, room humidification.
  - Steam inhalation to loosen viscid bronchial secretions.
• Critical Warning Signs:
  - Hemoptysis (coughing up blood or rust-colored sputum).
  - Unexplained weight loss, drenching night sweats, or worsening breathlessness.`
  },

  // 7. ASTHMA, BREATHLESSNESS, SHORTNESS OF BREATH & CHEST CONGESTION
  {
    title: "Asthma, Breathlessness & Respiratory Distress",
    keywords: ["asthma", "breathlessness", "shortness of breath", "chest congestion", "suffocation", "wheezing", "dyspnea"],
    response: `Breathlessness (dyspnea) and chest congestion represent altered cardiopulmonary gas exchange or reactive airway constriction.

• Pathophysiological Framework:
  - Asthma: Chronic inflammatory airway hyperresponsiveness causing episodic bronchospasm, mucus plugging, and expiratory wheezing.
  - Lower Respiratory Infections: Bronchitis or pneumonia causing alveolar exudate and impaired oxygenation.
  - Non-respiratory Causes: Cardiac insufficiency, severe anemia, metabolic acidosis, or hyperventilation in panic attacks.
• Management Principles:
  - For diagnosed asthma patients: Immediate use of rapid-acting bronchodilator rescue inhaler (e.g., Salbutamol/Albuterol) with a spacer.
  - Sit upright in a relaxed position; avoid lying flat.
• Emergency Medical Alert (Dial 911 / 112):
  - Inability to speak in full sentences, cyanosis (bluish lips or nails), stridor, SpO2 < 92%, or chest retractions.`
  },

  // 8. SNORING & SLEEP APNEA
  {
    title: "Snoring & Obstructive Sleep Disordered Breathing",
    keywords: ["snoring", "sleep apnea", "osa", "choking in sleep"],
    response: `Snoring occurs when turbulent airflow causes vibration of the soft palate and pharyngeal tissues during sleep due to partial upper airway collapse.

• Clinical Correlation (Obstructive Sleep Apnea - OSA):
  - Chronic loud snoring punctuated by witnessed breathing pauses, choking, or gasping during sleep.
  - Daytime somnolence, morning headaches, unrefreshing sleep, and elevated blood pressure.
• Management & Lifestyle Recommendations:
  - Positional sleep therapy (sleeping on the side rather than supine).
  - Weight management and avoidance of alcohol/sedatives before bedtime.
  - Clinical polysomnography (overnight sleep study) to evaluate apnea-hypopnea index (AHI) and CPAP indication.`
  },

  // 9. STOMACH PAIN, BURNING, ACIDITY, HEARTBURN, GAS, BLOATING & INDIGESTION
  {
    title: "Gastric Distress, Acidity, Heartburn, Gas, Bloating & Dyspepsia",
    keywords: ["stomach pain", "stomach burning", "gas", "bloating", "acidity", "heartburn", "indigestion", "sour eructations", "acid reflux", "gastritis", "flatulence"],
    response: `Upper gastrointestinal discomfort encompasses hyperchlorhydria, mucosal inflammation (gastritis), gastroesophageal reflux (GERD), and functional dyspepsia.

• Pathophysiology: Backflow of gastric acid into the esophagus causes substernal burning (heartburn), while delayed gastric emptying and dysmotility trigger gas, bloating, and postprandial fullness.
• Dietary & Lifestyle Optimization:
  - Eat smaller, frequent meals; avoid lying down within 2-3 hours after eating.
  - Restrict known gastric irritants: excessively oily/spicy foods, caffeine, carbonated sodas, and smoking.
  - Elevate the head of the bed by 6 inches for nocturnal acid reflux.
• Red Flags for Structural Pathology:
  - Difficulty swallowing (dysphagia), painful swallowing, recurrent vomiting, black tarry stools (melena), or unexplained weight loss.`
  },

  // 10. NAUSEA, VOMITING, DIARRHEA & LOSS OF APPETITE
  {
    title: "Gastroenteritis, Nausea, Vomiting, Diarrhea & Anorexia",
    keywords: ["nausea", "vomiting", "diarrhea", "loss of appetite", "emesis", "loose motions", "stomach bug"],
    response: `Acute emesis and diarrhea signify gastrointestinal mucosal inflammation, typically secondary to viral pathogens (norovirus, rotavirus), bacterial enterotoxins, or foodborne contamination.

• Clinical Priority: Preventing and correcting fluid-electrolyte dehydration.
• Clinical Rehydration Protocol:
  - Oral Rehydration Salts (ORS) administered in frequent, small sips rather than large gulps.
  - Transition gradually to gentle foods (BRAT diet: bananas, rice, applesauce, toast).
  - Avoid dairy products, greasy foods, and hyperosmolar sugary juices during active diarrhea.
• Emergency Warning Signs:
  - Inability to retain fluids for > 12-24 hours, signs of dehydration (dark concentrated urine, dry mucous membranes, postural dizziness), high fever, or hematemesis.`
  },

  // 11. CONSTIPATION, BLOOD IN STOOL, PILES & HEMORRHOIDS
  {
    title: "Constipation, Anorectal Health, Piles & Blood in Stool",
    keywords: ["constipation", "blood in stool", "piles", "hemorrhoids", "rectal bleeding", "hard stools"],
    response: `Bowel irregularity and anorectal bleeding require clinical stratification between benign outlet bleeding and significant lower gastrointestinal disease.

• Hemorrhoids (Piles): Dilated vascular cushions in the anal canal. Symptoms include bright red blood coating stool or on toilet tissue, perianal itching, and prolapse.
• Chronic Constipation Drivers: Inadequate dietary fiber, sedentary habits, ignoring the urge to defecate, and dehydration.
• First-Line Bowel Protocol:
  - Increase soluble and insoluble dietary fiber gradually to 25-35 grams daily (fruits, vegetables, psyllium husk).
  - Drink at least 2.5-3 liters of fluids daily.
  - Warm sitz baths for 15 minutes twice daily to relieve anorectal pain and swelling.
• Critical Warning Signs:
  - Dark maroon or black tarry stools (melena), alteration in bowel caliber, unintentional weight loss, or persistent rectal pain requiring proctological evaluation.`
  },

  // 12. LIVER PROBLEMS & FATTY LIVER
  {
    title: "Hepatology, Liver Health & Metabolic Fatty Liver (MASLD)",
    keywords: ["liver problems", "fatty liver", "liver", "hepatic", "cirrhosis", "jaundice", "sgot", "sgpt"],
    response: `The liver orchestrates vital detoxification, bile synthesis, lipid regulation, and glucose homeostasis.

• Fatty Liver (MASLD / NAFLD): Accumulation of excess triglycerides in >5% of hepatocytes, strongly linked with insulin resistance, visceral obesity, and metabolic dysregulation.
• Clinical Diagnostics:
  - Liver Function Tests: Serum ALT and AST (transaminases), Alkaline Phosphatase (ALP), Total & Direct Bilirubin.
  - Abdominal Ultrasound or FibroScan to quantify steatosis and hepatic stiffness.
• Reversal & Management Pillars:
  - Targeted 7-10% body weight reduction through caloric deficit and Mediterranean dietary patterns.
  - Complete elimination of alcohol, high-fructose corn syrups, and refined carbohydrates.
• Red Flags: Jaundice (yellowing of skin/sclera), abdominal distension with fluid (ascites), easy bruising, or mental confusion.`
  },

  // 13. CARDIOVASCULAR: CHEST PAIN, HEART ATTACK, PALPITATIONS & PULSE
  {
    title: "Cardiovascular Assessment: Chest Pain, Heart Attack & Palpitations",
    keywords: ["chest pain", "heart attack", "palpitations", "rapid heartbeat", "pulse rate", "cardiac pain", "angina"],
    response: `Cardiac symptoms require urgent clinical evaluation to distinguish life-threatening acute coronary syndromes (ACS) and arrhythmias from non-cardiac causes.

• Critical Emergency Alert (Dial 911 / 112 Immediately):
  - Heavy, crushing retrosternal pressure radiating to the left arm, neck, jaw, or back.
  - Chest pain accompanied by shortness of breath, diaphoresis (cold sweats), lightheadedness, or nausea.
• Palpitations (Rapid Heartbeat): Sensations of skipping, fluttering, or racing heartbeat. May stem from caffeine, dehydration, fever, thyroid excess, panic, or cardiac arrhythmias (e.g., atrial fibrillation, SVT).
• Standard Clinical Workup:
  - Emergency 12-lead Electrocardiogram (ECG).
  - Serial high-sensitivity Cardiac Troponin (hs-cTn) biomarkers.
  - 24-48 hour Holter ambulatory cardiac telemetry.`
  },

  // 14. BLOOD PRESSURE: HIGH BP, HYPERTENSION, LOW BP & HYPOTENSION
  {
    title: "Hemodynamics: Blood Pressure, Hypertension & Hypotension",
    keywords: ["blood pressure", "high bp", "hypertension", "low bp", "hypotension", "bp"],
    response: `Blood pressure reflects the hydrostatic arterial force exerted by cardiac output against systemic vascular resistance.

• Clinical Classifications:
  - Normal: < 120 / < 80 mmHg.
  - Stage 1 Hypertension: 130-139 / 80-89 mmHg.
  - Stage 2 Hypertension: >= 140 / >= 90 mmHg.
  - Hypertensive Crisis: > 180 and/or > 120 mmHg (requires urgent medical intervention).
  - Hypotension (Low BP): < 90 / < 60 mmHg (often causes dizziness, orthostatic lightheadedness, or syncope).
• Management & Lifestyle:
  - DASH Diet: Sodium restriction (< 2,000 mg/day), increased potassium-rich vegetables, and regular aerobic exercise.
  - Keep a standardized morning/evening home blood pressure log before clinical follow-up.`
  },

  // 15. CHOLESTEROL & POOR CIRCULATION
  {
    title: "Lipidology: Cholesterol, Atherosclerosis & Circulation",
    keywords: ["cholesterol", "poor circulation", "cold hands", "cold feet", "atherosclerosis", "hyperlipidemia"],
    response: `Elevated serum lipids accelerate endothelial atheromatous plaque formation, reducing arterial compliance and peripheral microvascular perfusion.

• Lipid Profile Biomarkers:
  - LDL Cholesterol ("Bad"): Major atherogenic particle; target < 100 mg/dL (< 70 mg/dL for high cardiovascular risk).
  - HDL Cholesterol ("Protective"): Target > 40 mg/dL in men, > 50 mg/dL in women.
  - Triglycerides: Target < 150 mg/dL; elevated levels correlate with metabolic syndrome.
• Peripheral Poor Circulation Signs: Cold hands and feet, claudication (calf pain on walking), sluggish capillary refill, and brittle nails.
• Action Steps: Eliminate trans-fats, increase soluble dietary fiber, maintain physical activity, and review indication for lipid-lowering pharmacotherapy (statins).`
  },

  // 16. DERMATOLOGY: RASH, BLEMISHES, PIMPLES, ACNE, ALLERGIES & HEAT RASH
  {
    title: "Dermatology: Acne, Skin Rash, Allergies, Blemishes & Heat Rash",
    keywords: ["skin rash", "blemishes", "pimples", "acne", "allergy", "infection", "heat rash", "dry skin", "skin redness", "hives"],
    response: `Skin manifestations reflect epidermal barrier disruption, follicular pilosebaceous inflammation, or systemic allergic hypersensitivity.

• Acne Vulgaris: Multifactorial follicular plugging, sebum hypersecretion, and Cutibacterium acnes colonization. Managed with non-comedogenic cleansers, salicylic acid, benzoyl peroxide, and topical retinoids.
• Allergic Urticaria (Hives): Pruritic, transient erythematous wheals triggered by allergens or infections. Managed with oral second-generation antihistamines.
• Heat Rash (Miliaria): Eccrine sweat duct obstruction in hot, humid weather. Managed with cool environments, loose cotton clothing, and calamine lotion.
• Red Flags: Blistering of mucous membranes (lips/eyes), sloughing of skin, or rash accompanied by facial swelling and shortness of breath (anaphylaxis).`
  },

  // 17. CHRONIC DERMATOLOGY: PSORIASIS, ECZEMA, BOILS, ABSCESS, ITCHING & SWELLING
  {
    title: "Chronic Skin Conditions: Psoriasis, Eczema, Boils, Abscess & Edema",
    keywords: ["psoriasis", "eczema", "boils", "abscess", "itching", "swelling", "pruritus", "edema", "skin swelling"],
    response: `Chronic dermatological conditions stem from immune dysregulation, epidermal barrier defects, or focal bacterial invasions.

• Psoriasis: Autoimmune T-cell mediated hyperproliferation of keratinocytes causing well-demarcated erythematous plaques with silvery scales (extensor surfaces).
• Eczema (Atopic Dermatitis): Defective epidermal filaggrin barrier presenting with intense pruritus, dry skin, and lichenification in flexural folds.
• Boils & Abscesses: Focal deep bacterial folliculitis (usually Staphylococcus aureus). Requires warm compresses; fluctuant abscesses necessitate professional medical incision and drainage (do NOT squeeze).
• Peripheral Swelling (Edema): Bilateral leg swelling requires clinical assessment of venous insufficiency, renal function, or cardiac status.`
  },

  // 18. TRICHOLOGY: HAIR FALL & DANDRUFF
  {
    title: "Trichology: Hair Fall, Thinning & Dandruff (Seborrheic Dermatitis)",
    keywords: ["hair fall", "dandruff", "hair loss", "alopecia", "scalp flaking"],
    response: `Hair follicle cycles and scalp health are influenced by endocrine signals, nutritional deficiencies, and epidermal microbiome balance.

• Common Hair Fall Etiologies:
  - Telogen Effluvium: Diffuse shedding 2-3 months after physiological stress, high fever, childbirth, or surgery.
  - Androgenetic Alopecia: Pattern hair thinning driven by dihydrotestosterone (DHT) genetic sensitivity.
  - Nutritional Deficiencies: Low serum ferritin (iron stores), Vitamin D, Zinc, or thyroid dysregulation.
• Dandruff: Flaking associated with Malassezia yeast proliferation on scalp sebum. Managed with antifungal shampoos (Ketoconazole 1-2%, Zinc Pyrithione, or Selenium Sulfide 2-3 times weekly).
• Clinical Recommendation: Screen complete blood count, serum ferritin, thyroid stimulating hormone (TSH), and Vitamin D-25-OH.`
  },

  // 19. SENSORY & NEUROPATHY: NUMBNESS, TINGLING & BURNING SENSATION
  {
    title: "Neuropathy & Paresthesias: Numbness, Tingling & Burning Sensation",
    keywords: ["numbness", "tingling", "burning sensation", "paresthesia", "pins and needles", "nerve pain"],
    response: `Paresthesias ("pins and needles") and burning sensations indicate sensory nerve fiber irritation, compression, or metabolic neuropathy.

• Clinical Differential:
  - Peripheral Neuropathy: Symmetrical "stocking-and-glove" distribution, most frequently associated with chronic diabetes or Vitamin B12 deficiency.
  - Nerve Entrapment: Median nerve compression at the wrist (Carpal Tunnel Syndrome) causing thumb and index finger tingling.
  - Radiculopathy: Spinal disc compression causing radiating sharp pain and numbness down an extremity.
• Diagnostic Workup: Fasting glucose, HbA1c, Serum Vitamin B12, electromyography, and nerve conduction studies (EMG/NCS).`
  },

  // 20. ACUTE NEUROLOGY: DIZZINESS, FAINTING, UNCONSCIOUSNESS, FITS, STROKE & PARALYSIS
  {
    title: "Neurological Emergencies: Dizziness, Syncope, Seizures & Stroke",
    keywords: ["dizziness", "fainting", "unconsciousness", "fits", "seizures", "paralysis", "stroke", "nerve weakness", "vertigo", "syncope"],
    response: `Acute neurological events represent critical medical conditions requiring immediate structured clinical evaluation.

• BE-FAST Stroke Protocol (Emergency 911 / 112):
  - B (Balance): Sudden loss of balance or coordination.
  - E (Eyes): Sudden visual disturbance or double vision.
  - F (Face): Facial asymmetry or drooping on one side.
  - A (Arms): Arm or leg weakness; inability to raise both limbs equally.
  - S (Speech): Slurred speech or difficulty understanding.
  - T (Time): Time is brain — immediate emergency transport for thrombolysis window.
• Dizziness vs Vertigo: True spinning sensation (vertigo) indicates vestibular pathology (e.g., BPPV), whereas lightheadedness indicates orthostatic hypotension or vasovagal syncope.
• Seizure / Fits First Aid: Protect from physical injury, place in lateral recovery position, do NOT place anything in the mouth, time the episode, and seek emergency care if lasting > 5 minutes.`
  },

  // 21. ENDOCRINE: DIABETES & HIGH SUGAR
  {
    title: "Endocrine & Glycemia: Diabetes Mellitus & High Blood Sugar",
    keywords: ["diabetes", "high sugar", "sugar", "glucose", "hyperglycemia", "hba1c"],
    response: `Diabetes mellitus is a chronic metabolic disorder marked by relative or absolute insulin insufficiency leading to persistent hyperglycemia.

• Diagnostic Criteria:
  - Fasting Plasma Glucose: >= 126 mg/dL (on two separate occasions).
  - HbA1c (Glycated Hemoglobin): >= 6.5%.
  - Random Blood Sugar with classic osmotic symptoms: >= 200 mg/dL.
• Classic Osmotic Symptoms: Polyuria (frequent urination), polydipsia (excessive thirst), polyphagia (constant hunger), and unexplained weight loss.
• Long-Term Complication Prevention: Routine screening for diabetic retinopathy (annual dilated eye exam), nephropathy (urine microalbumin), and diabetic foot ulceration.`
  },

  // 22. THYROID DYSFUNCTION
  {
    title: "Thyroid Homeostasis: Hypothyroidism & Hyperthyroidism",
    keywords: ["thyroid", "tsh", "hypothyroidism", "hyperthyroidism", "goiter"],
    response: `Thyroid stimulating hormone (TSH) regulated by the pituitary modulates follicular synthesis of T3 and T4, controlling baseline metabolic rate.

• Hypothyroidism (Underactive): Elevated TSH with low or normal Free T4. Symptoms include fatigue, unexplained weight gain, cold intolerance, dry skin, constipation, and bradycardia.
• Hyperthyroidism (Overactive): Suppressed TSH with elevated Free T4/T3. Symptoms include palpitations, heat intolerance, tremors, unintended weight loss, and frequent bowel movements.
• Testing & Medication Protocol: Fasting morning TSH is the primary screening biomarker. Thyroid replacement therapy (Levothyroxine) must be taken on an empty stomach with plain water.`
  },

  // 23. RHEUMATOLOGY & ORTHOPEDICS: JOINT PAIN, BACK PAIN, ARTHRITIS & URIC ACID
  {
    title: "Rheumatology & Orthopedics: Joint Pain, Back Pain, Arthritis & Uric Acid",
    keywords: ["joint pain", "back pain", "arthritis", "uric acid", "gout", "sciatica", "lumbar pain"],
    response: `Joint and spinal complaints reflect mechanical degenerative wear, inflammatory autoimmunity, or crystalline arthropathies.

• Osteoarthritis: Progressive mechanical cartilage loss, joint stiffness (< 30 minutes in morning), worsening with weight-bearing.
• Rheumatoid Arthritis: Autoimmune symmetrical polyarthritis (wrists, small hand joints) with prolonged morning stiffness (> 60 minutes).
• Hyperuricemia & Gout: Serum uric acid > 7.0 mg/dL crystallizing into mono-sodium urate, causing acute excruciating monoarthritis (frequently big toe).
• Back Pain Red Flags: Saddle anesthesia (numbness in groin), progressive lower limb motor deficit, or loss of bowel/bladder sphincter tone (Cauda Equina Syndrome).`
  },

  // 24. NEPHROLOGY & UROLOGY: KIDNEY STONES, UTI & URINARY INFECTION
  {
    title: "Nephrology & Urology: Kidney Stones & Urinary Tract Infections (UTI)",
    keywords: ["kidney stones", "uti", "urinary infection", "burning urination", "dysuria", "renal calculi"],
    response: `Urological symptoms indicate mucosal infection, crystalline nephrolithiasis, or lower urinary tract irritation.

• Urinary Tract Infection (UTI / Cystitis): Bacterial proliferation (predominantly E. coli) presenting with dysuria (burning on urination), urinary frequency, urgency, and suprapubic cramping.
• Kidney Stones (Nephrolithiasis): Hard mineral deposits (calcium oxalate, uric acid) causing acute, severe colicky flank pain radiating to the groin with hematuria (blood in urine).
• Action Steps:
  - High fluid intake (2.5-3 liters/day) to facilitate crystalline and microbial clearance.
  - Urine Routine and Culture & Sensitivity analysis before taking antibiotics.
• Red Flags: High fever with shaking chills and flank tenderness (suggestive of acute pyelonephritis requiring urgent hospital care).`
  },

  // 25. WOMEN'S HEALTH: MENSTRUAL CYCLE, PERIOD PAIN & GYNECOLOGICAL CARE
  {
    title: "Gynecology: Irregular Periods, Menstrual Cramps, Period Pain & White Discharge",
    keywords: ["irregular periods", "menstrual cramps", "period pain", "white discharge", "dysmenorrhea", "vaginal discharge"],
    response: `Menstrual health reflects hypothalamic-pituitary-ovarian (HPO) axis harmony and pelvic organ physiology.

• Dysmenorrhea (Period Cramps): Driven by endometrial prostaglandin F2-alpha release during shedding. Managed with anti-inflammatory medications taken at cramp onset and warm abdominal compresses.
• Irregular Cycles: Cycles shorter than 21 days or longer than 35 days warrant evaluation of thyroid disorders, prolactin levels, and polycystic ovarian changes.
• White Discharge (Leukorrhea): Normal physiological discharge is clear-to-whitish and non-malodorous. Curdy white discharge with intense itching suggests Candida; foul-smelling grayish discharge points to bacterial vaginosis.`
  },

  // 26. HORMONAL & OVARIAN: PCOD, PCOS, OVARIAN CYSTS, MENOPAUSE & BREAST LUMPS
  {
    title: "Women's Endocrinology: PCOD, PCOS, Ovarian Cysts, Menopause & Breast Lumps",
    keywords: ["pcod", "pcos", "ovarian cysts", "menopause", "breast lumps"],
    response: `Endocrine and reproductive changes across the lifespan require specialized diagnostic monitoring.

• PCOD / PCOS: Characterized by ovulatory dysfunction, hyperandrogenism (facial hair, acne), and polycystic morphology on pelvic ultrasound. Strongly linked to insulin resistance; managed through dietary glycemic control and physical exercise.
• Menopause: Defined as 12 consecutive months of amenorrhea. Characterized by estrogen drop leading to hot flashes, night sweats, sleep disruption, and accelerated bone density loss.
• Breast Lumps: Any newly palpated breast lump, focal skin dimpling, or nipple retraction requires immediate clinical breast examination and imaging (bilateral digital mammogram and/or ultrasound).`
  },

  // 27. OBSTETRICS: PREGNANCY & MORNING SICKNESS
  {
    title: "Obstetrics: Pregnancy Milestones, Morning Sickness & Antenatal Care",
    keywords: ["pregnancy", "pregnant", "morning sickness", "prenatal", "gestation"],
    response: `Pregnancy involves rapid maternal physiological adaptations to support embryonic and fetal development.

• Morning Sickness (Nausea & Vomiting of Pregnancy): Typically peaks in the 1st trimester due to rising human chorionic gonadotropin (hCG) and progesterone. Managed with small, dry carbohydrate meals, ginger, and Vitamin B6 (pyridoxine).
• Antenatal Standards: Folic acid supplementation (prevent neural tube defects), baseline blood type/Rh status, complete blood picture, and blood pressure monitoring to rule out preeclampsia.
• Emergency Warning Signs: Vaginal bleeding, severe unilateral pelvic pain (rule out ectopic pregnancy), sudden severe headache, or decreased fetal movements in late pregnancy.`
  },

  // 28. MEN'S HEALTH: ERECTILE DYSFUNCTION, PREMATURE EJACULATION, PROSTATE & TESTOSTERONE
  {
    title: "Andrology & Men's Health: Erectile Dysfunction, Prostate Health & Testosterone",
    keywords: ["erectile dysfunction", "premature ejaculation", "low sperm count", "prostate problems", "low testosterone"],
    response: `Men's sexual and urological health provides a sensitive window into systemic vascular, endocrine, and neurological well-being.

• Erectile Dysfunction (ED): Frequently an early marker of endothelial vascular disease or metabolic syndrome, alongside psychological performance anxiety.
• Prostate Enlargement (BPH): Age-associated periurethral adenoma causing nocturnal frequency (nocturia), hesitancy, and weak urinary stream.
• Low Testosterone (Hypogonadism): Manifests with diminished libido, reduced muscle mass, visceral adiposity, and persistent fatigue; confirmed with morning total serum testosterone testing.`
  },

  // 29. DIAGNOSTIC PATHOLOGY: BLOOD TEST, URINE TEST, HEMOGLOBIN, PLATELETS & CBP
  {
    title: "Laboratory Medicine: Blood Test, Urine Test, Hemoglobin, Platelets & CBP",
    keywords: ["blood test", "urine test", "normal ranges", "hemoglobin", "platelets", "cbp test", "cbp"],
    response: `Clinical laboratory pathology quantifies biochemical markers and hematological cell lines to establish diagnostic baseline.

• Complete Blood Picture (CBP / CBC):
  - Hemoglobin (Hb): Normal 13.0 - 17.0 g/dL (men), 12.0 - 15.5 g/dL (women). Low levels signify anemia.
  - Platelets: Normal 150,000 - 450,000 /uL. Critical for blood clot formation.
  - White Blood Cells (WBC): Normal 4,000 - 11,000 /uL. Evaluates immune response.
• Urine Routine Analysis: Screens for proteinuria (renal barrier health), microscopic hematuria, glucosuria, and leukocyte esterase/nitrites (urinary infection).`
  },

  // 30. RADIOLOGY & CARDIAC TESTING: ULTRASOUND, SCAN, X-RAY, MRI, CT SCAN & ECG
  {
    title: "Diagnostic Imaging & Cardiology: Ultrasound, X-Ray, CT, MRI & ECG",
    keywords: ["ultrasound", "scan", "x-ray", "mri scan", "ct scan", "ecg", "report analysis"],
    response: `Diagnostic imaging modalities allow non-invasive visualization of internal anatomical structures and physiological rhythms.

• Modality Selection Principles:
  - X-Ray: Fast planar evaluation of bone fractures, joint spacing, and thoracic lung fields.
  - Ultrasound (USG): Radiation-free high-frequency acoustic imaging of abdominal organs, pelvic structures, and soft tissue.
  - CT Scan: High-resolution cross-sectional ionizing imaging optimal for acute trauma, lungs, abdomen, and acute intracranial hemorrhage.
  - MRI Scan: Multiplanar magnetic resonance imaging providing superb soft tissue contrast for brain, spinal cord, and ligamentous structures.
  - ECG (Electrocardiogram): Records myocardial electrical vectors to identify conduction blocks, arrhythmias, and ischemic ST-changes.`
  },

  // 31. PHARMACOLOGY: TABLET, CAPSULE, SYRUP, DOSAGE, SIDE EFFECTS & ANTIBIOTICS
  {
    title: "Pharmacotherapy: Medication Forms, Dosage, Antibiotic Stewardship & Safety",
    keywords: ["tablet", "capsule", "syrup", "side effects", "dosage", "antibiotics", "pain killers", "vaccine", "ointment"],
    response: `Safe pharmacotherapy requires strict adherence to prescribed dosing intervals, administration routes, and safety warnings.

• Critical Medication Rules:
  - Antibiotic Stewardship: Always complete the full prescribed duration of antibiotic therapy even if symptoms resolve early, to prevent antimicrobial drug resistance (AMR).
  - Painkillers (NSAIDs): Avoid unmonitored chronic use of NSAIDs (e.g., ibuprofen, diclofenac) due to risks of peptic ulceration, gastrointestinal bleeding, and renal injury.
  - Dosage Precision: Pediatric syrups must be measured using calibrated oral syringes or dosing cups, never household teaspoons.
  - Adverse Drug Reactions: Immediately discontinue medication and seek medical attention if experiencing rash, lip/facial swelling, or difficulty breathing.`
  },

  // 32. NUTRITION & METABOLISM: DIET PLAN, CALORIES, VITAMINS, CALCIUM & PROTEIN
  {
    title: "Clinical Nutrition: Balanced Diet, Caloric Balance, Protein, Vitamins & Calcium",
    keywords: ["diet plan", "calories", "vitamins", "calcium", "iron deficiency", "protein"],
    response: `Nutritional status directly dictates cellular enzymatic function, immune resilience, and lean muscle preservation.

• Essential Nutritional Guidelines:
  - Daily Protein Targets: 0.8 - 1.2 grams per kilogram of body weight for healthy adults (higher for active training or recovery).
  - Iron Deficiency: The most prevalent nutritional deficit globally; pair non-heme dietary iron (lentils, greens) with Vitamin C to enhance absorption.
  - Calcium & Vitamin D: Synergistic micronutrients critical for bone mineral density (target 1,000-1,200 mg calcium daily alongside adequate Vitamin D-25-OH status).
  - Whole Foods Focus: Minimize ultra-processed foods rich in refined sugars and industrial seed oils.`
  },

  // 33. WEIGHT MANAGEMENT & IMMUNITY: WEIGHT LOSS, WEIGHT GAIN & IMMUNITY BOOSTERS
  {
    title: "Metabolic Conditioning: Healthy Weight Management & Immune Health",
    keywords: ["weight loss", "weight gain", "weight loss tips", "weight loss", "immunity booster"],
    response: `Sustainable weight management and optimal immune function depend on energy balance, metabolic rate, and restorative biological rhythms.

• Evidence-Based Weight Optimization:
  - For Weight Loss: Moderate caloric deficit (300-500 kcal/day), high-protein satiety, and progressive resistance training to preserve metabolically active muscle tissue.
  - For Healthy Weight Gain: Nutrient-dense caloric surplus (nuts, avocados, whole grains, dairy/pulses) combined with strength training.
• Genuine "Immunity Boosters": The immune system relies fundamentally on 7-8 hours of restorative sleep, regular moderate cardiovascular exercise, psychological stress management, and adequate micronutrient status (Zinc, Vitamin C, Vitamin D).`
  },

  // 34. EMERGENCY TRAUMA: MEDICAL EMERGENCY, ACCIDENT, INJURY, WOUND & BLEEDING
  {
    title: "Trauma Care: Medical Emergency, Accidents, Wounds & Hemorrhage Control",
    keywords: ["medical emergency", "accident", "injury", "wound", "bleeding", "first aid", "trauma"],
    response: `Acute trauma and active hemorrhage demand immediate, structured first-aid intervention while emergency responders are alerted.

• Active Bleeding Control (Direct Pressure):
  - Place a sterile gauze or clean cloth directly over the wound and apply firm, continuous, direct pressure.
  - Maintain pressure for at least 10-15 minutes without lifting the cloth to check.
  - Elevate the bleeding extremity above heart level if no fracture is suspected.
• Open Wound Care: Irrigate minor cuts gently with clean running water to remove dirt; apply a thin layer of topical antibiotic ointment and a clean dressing.
• Tetanus Protection: If the wound is deep, contaminated, or caused by rusty metal, obtain a Tetanus Toxoid (TT) booster within 48 hours if not vaccinated in the past 5-10 years.`
  },

  // 35. TOXICOLOGY & BITES: SNAKE BITE, DOG BITE & POISON
  {
    title: "Emergency Toxicology: Snake Bite, Animal/Dog Bite & Acute Poisoning",
    keywords: ["snake bite", "dog bite", "poison", "animal bite"],
    response: `Bite envenomations and acute poisonings are high-acuity medical emergencies requiring specialized clinical intervention.

• Snake Bite Protocol:
  - Keep the patient calm and immobilize the affected limb at or slightly below heart level.
  - Do NOT apply tourniquets, do NOT cut the bite site, and do NOT attempt to suction venom.
  - Transport immediately to the nearest tertiary emergency department equipped with Anti-Snake Venom (ASV).
• Dog / Animal Bite (Rabies Protocol):
  - Wash the wound immediately under vigorous running tap water and soap for at least 15 continuous minutes.
  - Seek emergency post-exposure rabies prophylaxis (PEP vaccination series +/- Rabies Immunoglobulin).
• Acute Poisoning: Immediately contact local emergency poison control centers; bring the original container or substance; do NOT induce vomiting unless explicitly directed by medical toxicologists.`
  },

  // 36. SENSORY ORGANS: EYE PAIN, EAR PAIN & TOOTHACHE
  {
    title: "Sensory & Dental Care: Eye Pain, Ear Pain & Toothache",
    keywords: ["eye pain", "ear pain", "toothache", "dental pain", "ocular pain"],
    response: `Localized sensory organ pain requires prompt differential diagnosis to prevent permanent functional compromise.

• Eye Pain: May indicate corneal abrasion, conjunctivitis, foreign body, or acute angle-closure glaucoma. Seek emergency eye care if accompanied by vision reduction, rainbows around lights, or extreme redness.
• Ear Pain (Otalgia): Most frequently caused by Otitis Media (middle ear infection), Otitis Externa ("swimmer's ear"), or referred pain from temporomandibular joint (TMJ) disorders.
• Toothache: Typically stems from deep dental caries, pulpitis, or periapical abscess. Seek prompt dental evaluation; untreated dental infections can spread into fascial spaces of the neck.`
  },

  // 37. CLINICAL NAVIGATION & APPOINTMENTS
  {
    title: "Clinical Navigation: Specialty Selection, Appointments & Second Opinions",
    keywords: ["doctor appointment", "which doctor to consult", "second opinion", "health checkup"],
    response: `Selecting the appropriate medical specialist ensures rapid, accurate diagnosis and targeted treatment planning.

• Medical Specialty Guide:
  - General Physician / Internist: Primary diagnostic evaluation, fevers, routine health checkups, initial symptom triage.
  - Cardiologist: Heart conditions, chest pain, palpitations, uncontrolled hypertension.
  - Pulmonologist: Persistent cough, asthma, breathlessness, chronic respiratory diseases.
  - Gastroenterologist: Acid reflux, stomach ulcers, liver disorders, chronic diarrhea/constipation.
  - Neurologist: Migraines, severe dizziness, seizures, nerve pain, stroke follow-up.
  - Orthopedic Specialist: Bone fractures, joint arthritis, ligament tears, chronic back/neck pain.
  - Gynecologist: Women's reproductive health, irregular periods, PCOD, pregnancy care.
  - Dermatologist: Acne, skin rashes, eczema, hair loss, fungal infections.
• Routine Health Checkups: Recommended annually to monitor fasting blood sugar, lipid profile, liver & kidney panels, and blood pressure.`
  },

  // 38. ONCOLOGY & NEOPLASMS
  {
    title: "Oncology & Neoplastic Disease Clinical Overview",
    keywords: ["cancer", "tumor", "carcinoma", "malignancy", "oncology", "neoplasm", "sarcoma", "lymphoma", "leukemia", "metastasis"],
    response: `Cancer represents a group of diseases characterized by uncontrolled cellular proliferation and potential tissue invasion.

• Classifications: Carcinomas (epithelial origin), Sarcomas (connective/musculoskeletal tissue), and Leukemias/Lymphomas (hematologic cells).
• Diagnostic Staging: Imaging (CT, PET-CT, MRI), tumor biomarker panels (CEA, CA-125, PSA), histopathology, and tissue biopsy.
• Red Flag Warning Signs (CAUTION): Change in bowel/bladder habits, sore that does not heal, unusual bleeding, breast or body lumps, difficulty swallowing, nagging cough, or unexplained weight loss (> 10 lbs).`
  },

  // 39. FATIGUE & PHYSICAL WEAKNESS
  {
    title: "Fatigue, Physical Weakness & Asthenia",
    keywords: ["fatigue", "weakness", "tired", "exhaustion", "lethargy", "asthenia"],
    response: `Persistent fatigue and physical weakness signify metabolic depletion, chronic occult inflammation, hematologic insufficiency, or endocrine imbalance.

• Diagnostic Workup Protocol: Complete Blood Count (to rule out iron or megaloblastic anemia), Comprehensive Metabolic Panel (electrolytes, renal, liver enzymes), Thyroid Panel (TSH, FT4), Serum Ferritin, Vitamin D-25-OH, and Vitamin B12.
• Common Etiologies: Post-viral convalescence, unrefreshing sleep architecture (obstructive sleep apnea), glycemic fluctuations, or chronic psychosocial distress.
• Restorative Strategy: Consistent sleep-wake scheduling, gradual aerobic reconditioning, balanced low-glycemic meals with adequate hydration.
• Red Flags: Profound weakness with localized focal neurological loss, drenching night sweats, or unexplained rapid weight loss.`
  },

  // 40. MENTAL HEALTH: STRESS, ANXIETY, DEPRESSION, MOOD SWINGS & TENSION
  {
    title: "Mental Health: Stress, Anxiety, Depression, Mood Swings & Tension",
    keywords: ["stress", "anxiety", "depression", "mood swings", "tension", "panic", "nervousness"],
    response: `Neuropsychiatric distress involves dysregulation in monoaminergic (serotonin, norepinephrine, dopamine) and hypothalamic-pituitary-adrenal (HPA) stress axes.

• Clinical Spectrum:
  - Acute Stress & Tension: Hyperarousal, autonomic muscular tightness, tension headaches, and irritability.
  - Anxiety & Panic: Persistent excessive worry, autonomic surges (palpitations, trembling, shortness of breath).
  - Depressive Disorders & Mood Swings: Persistent low mood, anhedonia, sleep architecture disruption, and energy depletion.
• Evidence-Based Management: Cognitive Behavioral Therapy (CBT), daily mindfulness meditation, structured aerobic activity, and medical evaluation for pharmacotherapy (SSRIs, SNRIs).
• Emergency Crisis Notice: If experiencing thoughts of self-harm or unbearable despair, connect immediately with crisis support lines (e.g. 988) or emergency medical services.`
  },

  // 41. COGNITIVE HEALTH: FORGETFULNESS & MEMORY LOSS
  {
    title: "Cognitive Health: Forgetfulness & Memory Loss",
    keywords: ["forgetfulness", "memory loss", "amnesia", "brain fog", "dementia", "cognitive impairment"],
    response: `Memory lapses and cognitive fog require clinical differentiation between reversible physiological factors and progressive neurodegenerative syndromes.

• Reversible Factors to Screen: Severe sleep deprivation, chronic stress/burnout, Vitamin B12 deficiency, subclinical hypothyroidism, medication anticholinergic side effects, or depression ("pseudodementia").
• Neurocognitive Screening: Standardized clinical assessments (MoCA, MMSE), Brain MRI (to assess hippocampal volume or vascular white matter changes), and metabolic lab panels.
• Brain Health Measures: Mediterranean-MIND dietary pattern, quality sleep, intellectual cognitive engagement, and cardiovascular exercise.
• Red Flags: Getting lost in familiar surroundings, profound executive impairment affecting daily safety, or rapid personality changes.`
  },

  // 42. SLEEP MEDICINE: INSOMNIA
  {
    title: "Sleep Medicine: Insomnia & Circadian Sleep Architecture",
    keywords: ["insomnia", "sleeplessness", "sleep problems", "trouble sleeping", "cant sleep", "poor sleep"],
    response: `Insomnia encompasses difficulty initiating sleep, frequent nocturnal awakenings, or unrefreshing non-restorative sleep impacting daytime function.

• Sleep Hygiene Guidelines (Stimulus Control):
  - Maintain a strict sleep-wake schedule 7 days a week.
  - Eliminate blue-light screens (smartphones, TVs) at least 60-90 minutes before bedtime.
  - Keep the sleep environment cool (65-68°F / 18-20°C), dark, and quiet.
  - Restrict caffeine intake after 12:00 PM; avoid heavy alcohol consumption before sleep.
• Medical Considerations: Screen for primary restless legs syndrome, nocturnal gastroesophageal reflux, or underlying anxiety.`
  },

  // 43. PATHOLOGY: INFLAMMATION & SWELLING
  {
    title: "Pathology: Inflammation, Swelling & Immune Activation",
    keywords: ["inflammation", "swelling", "inflammatory", "edema", "acute inflammation"],
    response: `Inflammation is the vascular and cellular response of living tissue to injury, infection, or immune irritation.

• Cardinal Signs of Acute Inflammation: Rubor (redness), Calor (heat), Tumor (swelling), Dolor (pain), and Functio Laesa (loss of function).
• Biomarkers of Systemic Inflammation: Erythrocyte Sedimentation Rate (ESR), High-Sensitivity C-Reactive Protein (hs-CRP), and complete blood count with differential.
• Management Principles: Cold therapy for acute trauma to limit vascular permeability; anti-inflammatory nutrition (omega-3 fatty acids, turmeric, polyphenols); clinical evaluation if persistent or unexplained.
• Urgent Warning Signs: Rapidly spreading erythema with red streaks (lymphangitis), high fever, or localized fluctuance requiring drainage.`
  },

  // 44. INTEGRATIVE HEALTH: HOME REMEDIES & EVIDENCE-BASED SELF-CARE
  {
    title: "Integrative Health: Home Remedies & First-Line Supportive Care",
    keywords: ["home remedies", "home remedy", "natural remedies", "home care", "first line self care"],
    response: `Evidence-based home supportive remedies provide symptom relief while biological healing progresses.

• Clinically Supported Home Interventions:
  - Upper Respiratory / Cough: Warm saline gargles (1/2 tsp salt in warm water), honey (1-2 tsp for adults/children > 1 yr), steam inhalation, room humidification.
  - Gastrointestinal Upset: Oral Rehydration Salts (ORS), ginger infusion for nausea, BRAT diet (bananas, rice, applesauce, toast), chamomile tea.
  - Musculoskeletal Strain: Cold packs for the first 48 hours, followed by gentle heat compresses and light stretching.
  - Skin Irritation: Colloidal oatmeal baths, cold compresses, and pure aloe vera gel for mild sunburn.
• Essential Caution: Home remedies complement but do not replace targeted medical therapies for acute bacterial infections, high fevers, or severe pain.`
  }
];

/**
 * Robust matcher for clinical terms
 * @param {string} userQuery 
 * @returns {{ title: string, response: string, matchedKeyword: string } | null}
 */
export function matchClinicalKnowledge(userQuery) {
  if (!userQuery || typeof userQuery !== "string") return null;
  const q = userQuery.toLowerCase().trim();

  for (const item of CLINICAL_KNOWLEDGE_BASE) {
    for (const kw of item.keywords) {
      const k = kw.toLowerCase().trim();
      if (k.length <= 3) {
        // Short tokens (e.g. "bp", "uti", "ed") use strict word boundaries
        const regex = new RegExp(`(^|[^a-z0-9])${k}([^a-z0-9]|$)`, "i");
        if (regex.test(q)) {
          return {
            title: item.title,
            response: item.response,
            matchedKeyword: kw
          };
        }
      } else if (k.includes(" ")) {
        // Multi-word phrase exact match
        if (q.includes(k)) {
          return {
            title: item.title,
            response: item.response,
            matchedKeyword: kw
          };
        }
      } else {
        // Single word token with boundaries
        const regex = new RegExp(`(^|[^a-z0-9])${k}([^a-z0-9]|$)`, "i");
        if (regex.test(q)) {
          return {
            title: item.title,
            response: item.response,
            matchedKeyword: kw
          };
        }
      }
    }
  }

  return null;
}


// ==========================================================================
// HEALTH LEXICON WORDS (320 Domain-Specific Medical & Clinical Terms)
// ==========================================================================
export const HEALTH_LEXICON_WORDS = [
  "angina",
  "arrhythmia",
  "atherosclerosis",
  "bradycardia",
  "tachycardia",
  "pericarditis",
  "myocarditis",
  "endocarditis",
  "cardiomyopathy",
  "aneurysm",
  "ischemia",
  "infarction",
  "arteriosclerosis",
  "vasodilation",
  "vasoconstriction",
  "stenosis",
  "regurgitation",
  "thrombosis",
  "embolism",
  "phlebitis",
  "orthopnea",
  "hypoperfusion",
  "claudication",
  "stent",
  "defibrillator",
  "angioplasty",
  "systole",
  "diastole",
  "preload",
  "afterload",
  "ejection fraction",
  "cardioversion",
  "dyspnea",
  "tachypnea",
  "bradypnea",
  "hypoxia",
  "hypoxemia",
  "hypercapnia",
  "atelectasis",
  "bronchospasm",
  "bronchiectasis",
  "emphysema",
  "pleurisy",
  "pleural effusion",
  "pneumothorax",
  "hemothorax",
  "apnea",
  "hypopnea",
  "stridor",
  "wheezing",
  "rhonchi",
  "rales",
  "crepitations",
  "cyanosis",
  "spirometry",
  "bronchodilator",
  "nebulizer",
  "tracheostomy",
  "endotracheal",
  "infiltrate",
  "consolidation",
  "alveolitis",
  "fibrosis",
  "surfactant",
  "dysphagia",
  "odynophagia",
  "proctitis",
  "cholecystitis",
  "cholelithiasis",
  "cholangitis",
  "cirrhosis",
  "pancreatitis",
  "peritonitis",
  "ascites",
  "hepatomegaly",
  "splenomegaly",
  "steatohepatitis",
  "jaundice",
  "icterus",
  "melena",
  "hematochezia",
  "hematemesis",
  "reflux",
  "esophagitis",
  "diverticulitis",
  "diverticulosis",
  "colitis",
  "crohns",
  "celiac",
  "enteritis",
  "malabsorption",
  "steatorrhea",
  "peristalsis",
  "ileus",
  "endoscopy",
  "colonoscopy",
  "neuropathy",
  "paresthesia",
  "dysesthesia",
  "ataxia",
  "aphasia",
  "dysphasia",
  "dysarthria",
  "apraxia",
  "agnosia",
  "syncope",
  "vertigo",
  "nystagmus",
  "dementia",
  "delirium",
  "encephalopathy",
  "meningismus",
  "photophobia",
  "phonophobia",
  "neuralgia",
  "sciatica",
  "radiculopathy",
  "tremor",
  "chorea",
  "dystonia",
  "myoclonus",
  "spasticity",
  "flaccidity",
  "hyporeflexia",
  "hyperreflexia",
  "hypoesthesia",
  "hyperesthesia",
  "hemiplegia",
  "oliguria",
  "anuria",
  "polyuria",
  "nocturia",
  "dysuria",
  "hematuria",
  "proteinuria",
  "albuminuria",
  "azotemia",
  "uremia",
  "nephrolithiasis",
  "glomerulonephritis",
  "pyelonephritis",
  "nephrotic",
  "nephritic",
  "hydronephrosis",
  "cystitis",
  "urethritis",
  "hemodialysis",
  "peritoneal dialysis",
  "nephrotoxic",
  "hyperkalemia",
  "hypokalemia",
  "hypernatremia",
  "hyponatremia",
  "hypercalcemia",
  "hypocalcemia",
  "acidosis",
  "alkalosis",
  "lithotripsy",
  "catheterization",
  "urolithiasis",
  "hyperglycemia",
  "hypoglycemia",
  "ketoacidosis",
  "hyperinsulinemia",
  "hypothyroidism",
  "hyperthyroidism",
  "thyrotoxicosis",
  "goiter",
  "hashimoto",
  "graves",
  "hypercortisolemia",
  "hypocortisolemia",
  "cushing",
  "addison",
  "acromegaly",
  "hypogonadism",
  "parathyroid",
  "pheochromocytoma",
  "dyslipidemia",
  "hypertriglyceridemia",
  "hirsutism",
  "gynecomastia",
  "polydipsia",
  "polyphagia",
  "glycosuria",
  "adiposity",
  "cachexia",
  "thermogenesis",
  "leptin",
  "ghrelin",
  "cortisol",
  "adrenal",
  "anaphylaxis",
  "angioedema",
  "urticaria",
  "sepsis",
  "bacteremia",
  "viremia",
  "fungemia",
  "toxemia",
  "systemic lupus",
  "rheumatoid",
  "ankylosing spondylitis",
  "fibromyalgia",
  "vasculitis",
  "polymyalgia",
  "scleroderma",
  "sjogren",
  "sarcoidosis",
  "immunosuppression",
  "neutropenia",
  "leukopenia",
  "leukocytosis",
  "lymphadenopathy",
  "opportunistic infection",
  "nosocomial",
  "superinfection",
  "pathogen",
  "antigen",
  "antibody",
  "immunoglobulin",
  "macrophage",
  "phagocytosis",
  "cytokine",
  "thrombocytopenia",
  "thrombocytosis",
  "polycythemia",
  "pancytopenia",
  "hemolysis",
  "coagulopathy",
  "leukemia",
  "lymphoma",
  "myeloma",
  "melanoma",
  "adenocarcinoma",
  "carcinogen",
  "metastasis",
  "oncogenesis",
  "carcinoid",
  "chemotherapy",
  "radiotherapy",
  "immunotherapy",
  "neutropenic fever",
  "petechiae",
  "purpura",
  "ecchymosis",
  "hematoma",
  "splenectomy",
  "myelofibrosis",
  "erythropoiesis",
  "hemoglobinopathy",
  "thalassemia",
  "sickle cell",
  "coagulation",
  "fibrinolysis",
  "d-dimer",
  "analgesic",
  "antipyretic",
  "anti-inflammatory",
  "anticoagulant",
  "antiplatelet",
  "thrombolytic",
  "corticosteroid",
  "immunosuppressant",
  "antihypertensive",
  "beta-blocker",
  "ace-inhibitor",
  "arb",
  "calcium channel blocker",
  "diuretic",
  "statin",
  "insulin",
  "metformin",
  "antihistamine",
  "decongestant",
  "expectorant",
  "antitussive",
  "antiemetic",
  "anticonvulsant",
  "antidepressant",
  "anxiolytic",
  "sedative",
  "probiotic",
  "antimicrobial",
  "antiviral",
  "antifungal",
  "prophylaxis",
  "pharmacokinetics",
  "echocardiogram",
  "electroencephalogram",
  "electromyography",
  "bronchoscopy",
  "laparoscopy",
  "thoracentesis",
  "paracentesis",
  "lumbar puncture",
  "urinalysis",
  "hematocrit",
  "troponin",
  "ferritin",
  "creatine kinase",
  "serology",
  "histopathology",
  "cytology",
  "flow cytometry",
  "hemoculture",
  "pulse oximetry",
  "capnography",
  "audiometry",
  "tonometry",
  "mammography",
  "angiography",
  "scintigraphy",
  "densitometry",
  "auscultation",
  "percussion",
  "palpation",
  "glucometer",
  "sphygmomanometer",
  "biomarker"
];

// ==========================================================================
// CLINICAL SENTENCES CORPUS (220 Verified Medical Guidance & Physiological Sentences)
// ==========================================================================
export const CLINICAL_SENTENCES_CORPUS = [
  "Atherosclerosis develops gradually when low-density lipoprotein cholesterol accumulates within arterial walls, provoking chronic vascular inflammation.",
  "Acute coronary syndromes require rapid medical evaluation because myocardial tissue necrosis accelerates with every minute of untreated arterial occlusion.",
  "Essential hypertension is termed a silent killer because sustained vascular overpressure damages renal, retinal, and cerebral microvasculature without early overt symptoms.",
  "Stable angina is typically provoked by physical exertion or emotional stress and resolves reliably with rest or sublingual nitroglycerin.",
  "Unstable angina represents an escalating clinical pattern with pain occurring at rest, signaling plaque rupture and imminent myocardial infarction risk.",
  "Heart failure with reduced ejection fraction occurs when the left ventricular myocardium cannot generate adequate contractile force to maintain systemic perfusion.",
  "Left ventricular hypertrophy develops as a compensatory adaptation to prolonged systemic pressure overload from untreated chronic hypertension.",
  "Atrial fibrillation causes irregular and rapid ventricular response rates, markedly increasing the long-term risk of thromboembolic cerebrovascular events.",
  "Cardiac troponin elevation serves as the gold-standard biochemical marker for detecting microscopic myocardial cell membrane disruption and necrosis.",
  "Orthopnea and paroxysmal nocturnal dyspnea indicate elevated pulmonary capillary wedge pressure secondary to left-sided cardiac decompensation.",
  "Peripheral arterial disease manifests characteristically as intermittent claudication that reliably subsides following brief periods of physical rest.",
  "Deep vein thrombosis presents with unilateral calf swelling, localized erythema, and increased warmth that necessitates urgent venous duplex ultrasonography.",
  "Severe aortic stenosis produces a characteristic crescendo-decrescendo systolic murmur that radiates bilaterally toward the carotid arteries.",
  "Sinus tachycardia is an appropriate physiological response to hypovolemia, acute pyrexia, severe anemia, or heightened sympathetic neuroendocrine tone.",
  "Sustained bradycardia below 50 beats per minute accompanied by presyncope suggests intrinsic conduction disease or excessive pharmacologic nodal blockade.",
  "Inotropic agents enhance myocardial contractility, whereas chronotropic agents alter the intrinsic firing frequency of the sinoatrial node.",
  "Malignant hypertension is defined by severe arterial pressure elevation exceeding 180/120 mmHg accompanied by acute target organ deterioration.",
  "Cardiogenic shock develops when cardiac output becomes inadequate to meet systemic metabolic demands despite normal or elevated ventricular filling pressures.",
  "Subacute bacterial endocarditis should be suspected in patients presenting with prolonged unexplained pyrexia, new cardiac murmurs, and vascular emboli.",
  "Regular aerobic physical exercise promotes physiological cardiac remodeling and stimulates endogenous nitric oxide production for enhanced vascular compliance.",
  "Bronchial asthma involves reversible chronic airway inflammation characterized by bronchial hyperresponsiveness, smooth muscle contraction, and mucus plugging.",
  "Chronic obstructive pulmonary disease encompasses progressive airflow limitation caused by emphysematous alveolar destruction and chronic inflammatory bronchitis.",
  "Community-acquired pneumonia typically produces localized crackles, bronchial breath sounds, dullness to percussion, and focal radiographic airspace consolidation.",
  "Acute respiratory distress syndrome results from diffuse alveolar-capillary membrane injury leading to non-cardiogenic pulmonary edema and refractory hypoxemia.",
  "Pulse oximetry measuring oxygen saturation below 92 percent on ambient air indicates clinically significant gas exchange impairment warranting medical evaluation.",
  "A tension pneumothorax generates elevated intrathoracic pressure that shifts mediastinal structures away from the affected hemithorax, compromising venous return.",
  "Spontaneous pneumothorax occurs frequently in tall, slender young adults secondary to the rupture of subpleural apical blebs into the pleural space.",
  "Hemoptysis ranging from blood-streaked sputum to frank hemorrhage requires clinical differentiation between bronchiectasis, pulmonary neoplasm, and vascular lesions.",
  "Obstructive sleep apnea is characterized by recurrent upper airway collapse during sleep, resulting in oxygen desaturation, sleep fragmentation, and daytime somnolence.",
  "Stridor is a high-pitched inspiratory sound indicating extrathoracic upper airway narrowing that demands rapid airway assessment and emergency stabilization.",
  "Chronic hypercapnia in advanced pulmonary disease shifts the primary respiratory drive toward hypoxic ventilatory control mechanisms.",
  "Bronchodilators targeting beta-2 adrenergic receptors rapidly relax bronchial smooth muscle to alleviate acute bronchospastic airway resistance.",
  "Inhaled corticosteroids represent the foundational maintenance therapy for suppressing underlying eosinophilic airway inflammation in persistent asthma.",
  "Pulmonary embolism frequently presents with sudden-onset pleuritic chest pain, tachypnea, acute dyspnea, and unexplained sinus tachycardia.",
  "Pleural effusions are categorized into transudative or exudative fluid collections based on protein and lactate dehydrogenase ratios defined by Light criteria.",
  "Idiopathic pulmonary fibrosis causes progressive exertional dyspnea and persistent dry cough associated with bibasilar inspiratory Velcro crackles.",
  "Productive cough persisting for more than eight consecutive weeks warrants chest radiography to rule out chronic pulmonary pathology or occult aspiration.",
  "Wheezing heard predominantly during expiration indicates generalized lower airway narrowing commonly associated with reactive bronchospasm.",
  "Clubbing of the digital nail beds reflects chronic hypoxemic pulmonary conditions, chronic suppurative lung disease, or bronchogenic malignancies.",
  "Smoking cessation represents the single most effective therapeutic intervention to halt the accelerated annual decline of forced expiratory volume in COPD.",
  "Type 1 diabetes mellitus stems from autoimmune destruction of pancreatic beta cells, resulting in absolute insulin deficiency and ketoacidosis risk.",
  "Type 2 diabetes mellitus is characterized by peripheral insulin resistance coupled with progressive failure of pancreatic beta-cell secretory capacity.",
  "Diabetic ketoacidosis presents with severe hyperglycemia, metabolic acidosis with an elevated anion gap, ketonuria, and compensatory Kussmaul respirations.",
  "Glycated hemoglobin reflects the weighted mean blood glucose exposure over the preceding two to three months by measuring hemoglobin glycosylation.",
  "Primary hypothyroidism causes generalized slowing of metabolic processes, leading to cold intolerance, bradycardia, lethargy, constipation, and dry skin.",
  "Graves disease is mediated by thyroid-stimulating antibodies that cause symmetric diffuse thyroid enlargement, hyperthyroidism, and infiltrative ophthalmopathy.",
  "Thyroid storm represents an extreme, life-threatening manifestation of thyrotoxicosis characterized by hyperpyrexia, agitation, delirium, and tachyarrhythmias.",
  "Hyperparathyroidism leads to excessive osteoclastic bone resorption and hypercalcemia, traditionally summarized as painful bones, renal stones, and abdominal groans.",
  "Acute hypoglycemia triggers neuroglycopenic symptoms including diaphoresis, autonomic tremor, anxiety, confusion, and potential loss of consciousness.",
  "Cushing syndrome results from chronic glucocorticoid excess, manifesting with central adiposity, violaceous cutaneous striae, facial plethora, and muscle wasting.",
  "Primary adrenal insufficiency causes deficient aldosterone and cortisol secretion, resulting in postural hypotension, hyponatremia, and cutaneous hyperpigmentation.",
  "Metabolic syndrome represents a cluster of vascular risk factors including visceral obesity, atherogenic dyslipidemia, elevated blood pressure, and insulin resistance.",
  "Fasting plasma glucose levels equal to or exceeding 126 mg/dL on two separate occasions meet the diagnostic threshold for diabetes mellitus.",
  "Metformin decreases hepatic gluconeogenesis and enhances peripheral insulin sensitivity without inducing intrinsic pancreatic insulin secretion or hypoglycemia.",
  "Polycystic ovary syndrome involves chronic ovulatory dysfunction, hyperandrogenism, and characteristic multiple small subcortical ovarian follicular cysts.",
  "Pheochromocytoma is a catecholamine-secreting neuroendocrine chromaffin tumor that produces paroxysmal severe hypertension, diaphoresis, and pounding headaches.",
  "Secondary hyperaldosteronism develops in response to renal hypoperfusion, congestive cardiac failure, or hepatic cirrhosis with portal hypertension.",
  "Central diabetes insipidus results from deficient posterior pituitary vasopressin release, causing large-volume dilute polyuria and intense polydipsia.",
  "Weight loss of five to ten percent achieved through nutritional modification substantially improves insulin sensitivity and reduces cardiovascular risk.",
  "Routine thyroid palpation combined with high-resolution ultrasonography reliably detects asymptomatic nodules that may warrant fine-needle aspiration biopsy.",
  "An acute ischemic stroke causes focal neurological deficits corresponding precisely to the anatomical territory of the occluded cerebral artery.",
  "The FAST protocol emphasizes facial asymmetry, unilateral arm weakness, and speech difficulty as critical indicators requiring immediate emergency transfer.",
  "Intravenous thrombolysis with tissue plasminogen activator offers maximal therapeutic benefit when administered within four and a half hours of symptom onset.",
  "Transient ischemic attacks represent temporary neurovascular focal deficits that fully resolve within twenty-four hours but signify imminent stroke risk.",
  "Migraine headaches are neurovascular disorders involving trigeminovascular system activation, cortical spreading depression, and neurogenic inflammatory mediators.",
  "The SNOOP4 mnemonic screens for secondary headache red flags including systemic symptoms, neurological signs, sudden onset, older age, and positional variation.",
  "Generalized tonic-clonic seizures feature sudden loss of consciousness, sustained muscular rigidity, rhythmic clonic jerking, and postictal confusion.",
  "Status epilepticus is defined by continuous seizure activity lasting more than five minutes, requiring immediate parenteral benzodiazepine administration.",
  "Parkinson disease is marked by progressive dopaminergic nigrostriatal neurodegeneration producing resting tremor, cogwheel rigidity, bradykinesia, and postural instability.",
  "Alzheimer disease causes progressive impairment in episodic memory, executive planning, and spatial orientation driven by amyloid-beta plaques and tau neurofibrillary tangles.",
  "Delirium presents with acute, fluctuating disturbances in attention and baseline cognition triggered by underlying systemic infections, medications, or metabolic derangements.",
  "Peripheral sensory polyneuropathy typically starts in a symmetrical stocking-and-glove distribution affecting distal lower extremity touch and vibration sensation.",
  "Trigeminal neuralgia causes agonizing, paroxysmal, electric shock-like facial pain triggered by minimal sensory stimulation such as chewing or light breeze.",
  "Bell palsy presents as acute unilateral peripheral facial nerve weakness involving both the upper forehead musculature and lower facial expression muscles.",
  "Normal pressure hydrocephalus classically presents with the triad of gait apraxia, progressive cognitive decline, and urinary incontinence.",
  "Multiple sclerosis is an autoimmune demyelinating central nervous system disorder characterized by neurological relapses disseminated in both anatomical space and time.",
  "Guillain-Barre syndrome manifests as rapidly ascending symmetrical flaccid paralysis and hyporeflexia often following an acute gastrointestinal or respiratory infection.",
  "Benign paroxysmal positional vertigo results from displaced canalith microcrystals within the semicircular canals, provoking brief positional spinning sensations.",
  "An instantaneous severe thunderclap headache reaching maximum intensity within sixty seconds warrants immediate emergency evaluation for subarachnoid hemorrhage.",
  "Chronic sleep deprivation impairs glymphatic waste clearance from cerebral parenchyma, contributing to daytime cognitive fatigue and neuroinflammatory stress.",
  "Gastroesophageal reflux disease occurs when retrograde flow of acidic gastric contents across an incompetent lower esophageal sphincter provokes mucosal injury.",
  "Persistent gastroesophageal reflux can induce specialized intestinal metaplasia within the distal esophageal squamous mucosa, known clinically as Barrett esophagus.",
  "Peptic ulcer disease most commonly arises from mucosal barrier disruption caused by Helicobacter pylori colonization or chronic nonsteroidal anti-inflammatory drug use.",
  "Acute pancreatitis presents with severe epigastric abdominal pain that radiates directly through to the mid-back and is accompanied by elevated serum lipase levels.",
  "Acute cholecystitis produces severe localized right upper quadrant tenderness, pyrexia, leukocytosis, and a positive Murphy sign during deep inspiration.",
  "Melena indicates upper gastrointestinal hemorrhage where hemoglobin has been enzymatically degraded and oxidized into black tarry stool by intestinal bacteria.",
  "Hematochezia typically indicates brisk lower gastrointestinal bleeding from colonic diverticula, angiodysplasias, or severe inflammatory mucosal ulcerations.",
  "Celiac disease is an immune-mediated enteropathy triggered by ingested gluten peptides in genetically susceptible individuals, leading to villous atrophy.",
  "Inflammatory bowel disease encompasses Crohn disease, which can affect any gastrointestinal segment transmurally, and ulcerative colitis, confined to colonic mucosa.",
  "Irritable bowel syndrome involves functional gastrointestinal dysmotility and visceral hypersensitivity without demonstrable endoscopic or histopathologic mucosal pathology.",
  "Cirrhosis represents advanced diffuse hepatic parenchymal fibrosis and regenerative nodule formation secondary to chronic viral hepatitis, alcohol, or steatohepatitis.",
  "Portal hypertension causes splenomegaly, abdominal ascites, and collateral portosystemic shunting that gives rise to life-threatening esophageal varices.",
  "Hepatic encephalopathy develops when portosystemic shunting allows neurotoxic enteric metabolites, particularly ammonia, to cross the blood-brain barrier.",
  "Non-alcoholic fatty liver disease ranges from simple steatosis to non-alcoholic steatohepatitis and represents the hepatic manifestation of metabolic syndrome.",
  "Mechanical small bowel obstruction presents with colicky periumbilical abdominal pain, abdominal distension, bilious emesis, and high-pitched tinkling bowel sounds.",
  "Acute appendicitis typically begins with vague periumbilical visceral pain that migrates over twelve to twenty-four hours to localize at McBurney point.",
  "Clostridioides difficile infection occurs following broad-spectrum antibiotic therapy that disrupts native colonic microflora, resulting in pseudomembranous colitis.",
  "Dysphagia for both solids and liquids from disease onset suggests a primary esophageal motility disorder, whereas progressive dysphagia suggests mechanical obstruction.",
  "A high-fiber dietary pattern supports colonocyte health by promoting microbial fermentation into beneficial short-chain fatty acids like butyrate.",
  "Routine colorectal cancer screening via colonoscopy enables both early malignant detection and the simultaneous polypectomy of precancerous adenomas.",
  "The glomerulus functions as a specialized semipermeable capillary filtration barrier that restricts large plasma proteins while clearing metabolic nitrogenous wastes.",
  "Acute kidney injury involves a rapid decline in glomerular filtration rate over hours to days, leading to the acute retention of creatinine and urea.",
  "Prerenal azotemia is driven by absolute or effective renal hypoperfusion without intrinsic structural damage, resolving promptly upon hemodynamic volume restoration.",
  "Chronic kidney disease is defined by persistent kidney structural damage or a glomerular filtration rate below 60 mL/min/1.73m2 for more than three months.",
  "Nephrotic syndrome is characterized by heavy proteinuria exceeding 3.5 grams daily, profound hypoalbuminemia, generalized dependent edema, and hyperlipidemia.",
  "Nephritic syndrome features acute glomerular inflammation that causes hematuria with dysmorphic red cells, red blood cell casts, hypertension, and mild proteinuria.",
  "Nephrolithiasis presents with severe spasmodic colicky flank pain that radiates anteriorly toward the groin as stones transit through the narrow ureter.",
  "Hyperkalemia exceeding 6.0 mEq/L poses severe cardiac risks, producing tall peaked T waves, prolonged PR intervals, and fatal ventricular arrhythmias.",
  "Severe hyponatremia below 120 mEq/L can cause cerebral edema, seizure activity, and tentorial herniation if acute, requiring cautious hypertonic saline therapy.",
  "Rapid overcorrection of severe chronic hyponatremia carries the grave risk of inducing central pontine myelinolysis and irreversible neurological injury.",
  "End-stage renal disease requires renal replacement therapy in the form of maintenance hemodialysis, peritoneal dialysis, or deceased/living-donor kidney transplantation.",
  "Renal osteodystrophy develops in chronic kidney disease due to phosphate retention, hypocalcemia, and impaired calcitriol synthesis driving secondary hyperparathyroidism.",
  "Anemia of chronic kidney disease is primarily caused by reduced peritubular capillary production of the glycoprotein hormone erythropoietin.",
  "Autosomal dominant polycystic kidney disease causes progressive bilateral renal cyst expansion leading to palpable flank masses, hypertension, and progressive renal failure.",
  "Routine spot urine testing for albumin-to-creatinine ratio is the most sensitive screening tool for detecting microvascular diabetic nephropathy.",
  "Uncomplicated acute cystitis in females presents with dysuria, urinary frequency, and suprapubic pain without systemic symptoms or costovertebral tenderness.",
  "Acute pyelonephritis involves upper urinary tract parenchymal infection that causes high fever, rigors, nausea, and prominent costovertebral angle tenderness.",
  "Nonsteroidal anti-inflammatory drugs inhibit vasodilatory renal prostaglandins, which can precipitate acute prerenal renal failure in volume-depleted individuals.",
  "Angiotensin-converting enzyme inhibitors confer renal protection in proteinuric renal disease by selectively reducing efferent arteriolar resistance and intraglomerular pressure.",
  "Adequate daily oral hydration sufficient to achieve a pale straw-colored urine output of two liters daily remains the cornerstone of recurrent kidney stone prevention.",
  "Rheumatoid arthritis is a systemic autoimmune disease characterized by chronic inflammatory synovitis that leads to symmetrical erosive joint destruction.",
  "Systemic lupus erythematosus is a multisystem autoimmune condition associated with antinuclear antibodies, immune complex deposition, and multiorgan tissue injury.",
  "Anaphylaxis is a severe, life-threatening systemic hypersensitivity reaction that causes acute airway compromise, diffuse bronchospasm, and circulatory shock.",
  "Intramuscular epinephrine administered promptly into the anterolateral thigh is the definitive first-line emergency medication for reversing anaphylaxis.",
  "Ankylosing spondylitis primarily affects the axial skeleton and sacroiliac joints, producing inflammatory lower back pain and progressive spinal fusion.",
  "Acute gouty arthritis results from intra-articular deposition of monosodium urate microcrystals that trigger intense neutrophilic inflammation, classically at the first metatarsophalangeal joint.",
  "Pseudogout or calcium pyrophosphate deposition disease mimics acute gout but typically targets larger joints like the knee and shows positive birefringent rhomboid crystals.",
  "Giant cell arteritis is a medical emergency in older adults presenting with temporal headache, scalp tenderness, jaw claudication, and sudden risk of irreversible blindness.",
  "Immediate high-dose systemic corticosteroid therapy must be initiated without waiting for temporal artery biopsy results when giant cell arteritis is clinically suspected.",
  "Fibromyalgia is characterized by widespread musculoskeletal pain, chronic fatigue, non-restorative sleep, and cognitive fog related to central pain sensitization.",
  "Sjogren syndrome involves autoimmune lymphocytic infiltration of exocrine salivary and lacrimal glands, causing severe dry mouth and dry eyes.",
  "Systemic sclerosis or scleroderma features excessive extracellular collagen deposition leading to cutaneous fibrosis, Raynaud phenomenon, and visceral sclerosis.",
  "Polymyalgia rheumatica presents with sudden bilateral stiffness and aching in the shoulder and pelvic girdles, accompanied by elevated erythrocyte sedimentation rates.",
  "Sepsis is defined as life-threatening organ dysfunction caused by a dysregulated, systemic host response to an invasive microbial infection.",
  "Septic shock represents a subset of sepsis wherein profound cellular metabolic and circulatory abnormalities significantly heighten in-hospital mortality.",
  "The systemic inflammatory response syndrome encompasses pyrexia or hypothermia, tachypnea, tachycardia, and abnormal peripheral white blood cell counts.",
  "Human immunodeficiency virus attacks cluster of differentiation 4 helper T lymphocytes, predisposing the host to severe opportunistic infections and neoplasms.",
  "Autoimmune hemolytic anemia occurs when immunoglobulin antibodies directed against autologous red blood cell antigens promote premature splenic erythrocyte clearance.",
  "Biologic disease-modifying antirheumatic drugs targeting tumor necrosis factor-alpha or interleukins have revolutionized the structural preservation of inflamed joints.",
  "Routine vaccination activates humoral and cellular adaptive immune memory, providing robust long-term defense against virulent pathogens without causing clinical disease.",
  "Iron deficiency anemia manifests with microcytic, hypochromic erythrocytes and reduced serum ferritin, reflecting depleted functional iron stores.",
  "Vitamin B12 deficiency impairs deoxyribonucleic acid synthesis, producing macrocytic megaloblastic anemia and progressive subacute combined spinal cord degeneration.",
  "Folate deficiency causes macrocytic anemia similar to B12 deficiency but does not produce the progressive dorsal column sensory neurological deficits.",
  "Aplastic anemia involves primary hematopoietic stem cell failure within the bone marrow, resulting in severe pancytopenia and hypocellular marrow space.",
  "Immune thrombocytopenia is characterized by autoimmune platelet destruction that produces cutaneous petechiae, purpura, and mucosal bleeding without splenomegaly.",
  "Thrombotic thrombocytopenic purpura is a hematologic emergency characterized by microangiopathic hemolytic anemia, severe thrombocytopenia, renal failure, and neurological fluctuations.",
  "Disseminated intravascular coagulation involves uncontrolled widespread microvascular thrombosis that exhausts platelets and coagulation factors, leading to concurrent severe hemorrhage.",
  "Hemophilia A and Hemophilia B are X-linked recessive bleeding disorders caused by congenital deficiencies of coagulation factor VIII and factor IX, respectively.",
  "Sickle cell disease results from a point mutation in the beta-globin gene, causing hemoglobin polymerization and erythrocyte sickling under hypoxic or dehydrated conditions.",
  "Vaso-occlusive crises in sickle cell disease produce excruciating bone and joint pain, requiring rapid intravenous hydration, multimodal analgesia, and oxygen therapy.",
  "Thalassemia syndromes involve deficient globin chain synthesis, resulting in microcytic hypochromic anemia with characteristic target cells on peripheral blood smears.",
  "Acute myeloid leukemia features rapid neoplastic proliferation of immature myeloid blast cells that crowd the bone marrow and suppress normal hematopoiesis.",
  "Chronic lymphocytic leukemia represents a progressive clonal proliferation of mature-appearing incompetent B lymphocytes commonly diagnosed incidentally on routine blood counts.",
  "Hodgkin lymphoma is characterized pathologically by the presence of giant multinucleated neoplastic Reed-Sternberg cells within an inflammatory cellular background.",
  "Multiple myeloma involves neoplastic monoclonal plasma cell proliferation in bone marrow, causing lytic skeletal lesions, hypercalcemia, renal impairment, and anemia.",
  "Elevated D-dimer reflects active fibrin clot formation and ongoing endogenous fibrinolysis, functioning as a sensitive screening test for venous thromboembolism.",
  "Warfarin anticoagulation requires systematic international normalized ratio monitoring to balance therapeutic thromboembolism prevention against major bleeding hazards.",
  "Direct oral anticoagulants provide predictable factor Xa or direct thrombin inhibition with fixed dosing and without the requirement for routine laboratory coagulation monitoring.",
  "Polycythemia vera is a chronic myeloproliferative neoplasm characterized by uncontrolled erythrocyte overproduction, elevated hematocrit, and heightened thrombotic risk.",
  "Routine complete blood counts with automated leukocyte differential provide essential initial screening for occult hematologic, infectious, and oncologic conditions.",
  "Pharmacokinetics encompasses the physiological processes of medication absorption, tissue distribution, hepatic metabolism, and renal excretion over time.",
  "Pharmacodynamics describes the biochemical and physiological concentration-dependent effects of pharmacological compounds on specific cellular molecular targets.",
  "The therapeutic index represents the margin of safety between a drug effective therapeutic concentration and its minimum toxic plasma threshold.",
  "Acetaminophen is a widely utilized antipyretic and analgesic whose overdose exhausts hepatic glutathione stores, resulting in acute centrilobular liver necrosis.",
  "N-acetylcysteine functions as the specific lifesaving antidote for acetaminophen hepatotoxicity by directly replenishing intracellular hepatic glutathione pools.",
  "Nonsteroidal anti-inflammatory drugs alleviate inflammatory pain by inhibiting cyclooxygenase enzymes, but chronic use risks gastric ulceration and renal vasoconstriction.",
  "Selective serotonin reuptake inhibitors increase synaptic serotonin levels and require two to four weeks of consistent administration to achieve full therapeutic antidepressant benefits.",
  "Abrupt discontinuation of long-term benzodiazepine therapy can precipitate rebound severe anxiety, insomnia, autonomic instability, and life-threatening withdrawal seizures.",
  "Angiotensin-converting enzyme inhibitors frequently produce a chronic dry cough secondary to the accumulation of inflammatory bradykinin and substance P in bronchial tissues.",
  "Statins competitively inhibit 3-hydroxy-3-methylglutaryl-coenzyme A reductase, significantly lowering circulating low-density lipoprotein cholesterol and stabilizing vascular plaques.",
  "Beta-adrenergic receptor antagonists lower blood pressure and myocardial oxygen demand by reducing heart rate, cardiac contractility, and renin release.",
  "Loop diuretics act on the thick ascending limb of the loop of Henle to produce potent diuresis and natriuresis, indicated for managing acute volume overload.",
  "Antibiotic stewardship requires prescribing narrow-spectrum antimicrobials matched precisely to culture sensitivities to prevent the emergence of multidrug-resistant pathogens.",
  "Complete adherence to prescribed antibacterial treatment courses prevents relapsing bacterial infections and curtails the selection of resistant microbial strains.",
  "Broad-spectrum antibiotics frequently disrupt normal protective enteric microbiome balance, predisposing patients to opportunistic Clostridioides difficile colitis.",
  "Proton pump inhibitors irreversibly block the gastric parietal H+/K+ ATPase pump, providing superior acid suppression for healing peptic ulcerations and erosive esophagitis.",
  "Corticosteroids possess potent immunosuppressive and anti-inflammatory properties, but prolonged systemic administration carries risks of osteoporosis, hyperglycemia, and adrenal suppression.",
  "Polypharmacy in geriatric populations substantially heightens the risk of adverse drug-drug interactions, accidental falls, cognitive clouding, and hospital readmissions.",
  "Patients taking anticoagulant or antiplatelet agents must be cautioned regarding concurrent over-the-counter herbal supplements like ginkgo and garlic that elevate bleeding risks.",
  "Always review a comprehensive and up-to-date medication list with your clinical pharmacist or physician during every clinical consultation or prescription modification.",
  "Immediate recognition of cardiac arrest and prompt initiation of high-quality cardiopulmonary resuscitation significantly improves victim neurological survival rates.",
  "Automated external defibrillators should be attached immediately in unresponsive patients to deliver prompt rhythm analysis and electrical defibrillation for ventricular fibrillation.",
  "Sudden loss of consciousness or syncope during strenuous physical exertion is an ominous red flag requiring immediate investigation for underlying structural or electrical heart disease.",
  "A unilateral dilated non-reactive pupil following blunt head trauma suggests uncal herniation and elevated intracranial pressure demanding emergency neurosurgical decompression.",
  "Acute chest pain described as a sudden tearing or ripping sensation radiating between the scapulae is the classic presentation of acute aortic dissection.",
  "Severe localized abdominal pain accompanied by involuntary abdominal guarding and rigidity indicates generalized peritonitis from an intra-abdominal visceral perforation.",
  "An acute sudden-onset scrotum pain accompanied by unilateral elevation and loss of the cremasteric reflex represents testicular torsion requiring emergency surgical detorsion within six hours.",
  "Bacterial meningitis presents with the classic triad of high pyrexia, altered mental status, and nuchal rigidity, warranting immediate empirical intravenous antibiotics.",
  "Suspected spinal cord compression manifested by bilateral lower limb weakness and bowel or bladder incontinence requires urgent magnetic resonance imaging and decompression.",
  "Severe hypothermia below 30 degrees Celsius can provoke refractory ventricular dysrhythmias and necessitates gentle, active core rewarming alongside warm intravenous fluids.",
  "Heat stroke is a medical emergency marked by a core temperature exceeding 40 degrees Celsius and neurological dysfunction, requiring immediate aggressive evaporative and conductive cooling.",
  "Full-thickness third-degree burns destroy all epidermal and dermal layers, appearing leathery, white or charred, and requiring specialized burn center resuscitation.",
  "Arterial tourniquets should be applied immediately two to three inches proximal to severe extremity hemorrhage when direct manual pressure fails to halt bleeding.",
  "Acute carbon monoxide poisoning causes tissue hypoxia without visible cyanosis, presenting with headache, dizziness, nausea, and requiring high-flow normobaric oxygen.",
  "Acute angle-closure glaucoma presents with intense periorbital pain, unilateral conjunctival injection, a mid-dilated non-reactive pupil, and rainbow halos around lights.",
  "Severe epistaxis unresponsive to fifteen minutes of firm direct bilateral nasal ala compression warrants anterior nasal packing and otolaryngology evaluation.",
  "Animal bite wounds require thorough high-pressure sterile wound irrigation, post-exposure rabies and tetanus prophylaxis assessment, and targeted empirical antibiotics.",
  "Acute foreign body airway obstruction causing aphonia and cyanosis demands immediate administration of sequential abdominal thrusts using the Heimlich maneuver.",
  "Any patient presenting with active suicidal ideation or intent requires immediate compassionate stabilization, protective safety precautions, and urgent psychiatric assessment.",
  "When encountering acute medical red flags such as chest pain, dyspnea, or neurological deficits, dial emergency emergency telephone numbers immediately without driving yourself.",
  "Adopting a Mediterranean dietary pattern rich in monounsaturated olive oil, vegetables, legumes, and omega-3 fatty acids substantially reduces cardiovascular event rates.",
  "Engaging in at least one hundred and fifty minutes of moderate-intensity aerobic physical activity weekly improves cardiorespiratory fitness and all-cause longevity.",
  "Resistance strength training twice weekly preserves skeletal muscle mass, enhances bone mineral density, and combats age-related sarcopenia in older adults.",
  "Maintaining consistent sleep hygiene that secures seven to nine hours of restorative nocturnal sleep optimizes neurocognitive performance and immune homeostasis.",
  "Smoking cessation halts the acceleration of atherosclerotic plaque progression and halves the excess risk of coronary heart disease within one year of quitting.",
  "Restricting daily dietary sodium intake to less than two thousand milligrams assists significantly in achieving optimal resting blood pressure control.",
  "Chronic psychological stress elevates sustained circulating cortisol and sympathetic tone, promoting arterial endothelial dysfunction and visceral adiposity.",
  "Daily consumption of adequate dietary fiber promotes healthy gut microbiome diversity, improves glycemic stability, and lowers serum LDL cholesterol.",
  "Routine annual physical examinations provide essential opportunities to screen for asymptomatic hypertension, prediabetes, and early metabolic dysregulation.",
  "Maintaining a body mass index within the normal range of 18.5 to 24.9 kg/m2 reduces the incidence of metabolic syndrome, osteoarthritis, and sleep apnea.",
  "Adequate daily ultraviolet-B exposure or dietary vitamin D supplementation is vital for supporting intestinal calcium absorption and skeletal mineralization.",
  "Limiting alcohol consumption mitigates the risks of alcoholic cardiomyopathy, hepatic steatosis, cardiac arrhythmias, and alcohol-related gastrointestinal neoplasms.",
  "Regular practice of mindfulness meditation or diaphragmatic breathing exercises activates parasympathetic vagal tone and lowers resting systemic blood pressure.",
  "Comprehensive dental hygiene including twice-daily brushing and daily flossing prevents periodontal disease and reduces chronic systemic inflammatory burdens.",
  "Routine screening mammography beginning at age forty to fifty enables early detection of occult breast carcinomas when curative options are highest.",
  "Cervical cancer screening utilizing human papillomavirus co-testing and Papanicolaou cytology drastically reduces the incidence of invasive cervical malignancies.",
  "Annual influenza immunization provides critical protective antibodies against circulating seasonal strains, significantly reducing winter respiratory hospitalizations.",
  "Adequate hydration maintaining clear to light-straw urine output supports optimal renal clearance of metabolic wastes and prevents nephrolithiasis recurrence.",
  "Ergonomic workplace adjustments and regular postural micro-breaks reduce the incidence of cervical strain, repetitive motion injuries, and lumbar discomfort.",
  "Active social engagement, lifelong cognitive learning, and purposeful daily activities demonstrate strong protective associations against age-related cognitive decline."
];

/**
 * Match query against the 220-sentence clinical corpus
 * @param {string} query
 * @param {number} max
 * @returns {string[]}
 */
export function findRelevantSentences(query, max = 3) {
  if (!query || typeof query !== 'string') return [];
  const q = query.toLowerCase();
  const words = q.split(/[^a-zA-Z0-9]+/).filter(w => w.length >= 4);
  if (words.length === 0) return [];

  const scored = [];
  for (const sentence of CLINICAL_SENTENCES_CORPUS) {
    const sLower = sentence.toLowerCase();
    let score = 0;
    for (const w of words) {
      if (sLower.includes(w)) score++;
    }
    if (score > 0) {
      scored.push({ sentence, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, max).map(item => item.sentence);
}
