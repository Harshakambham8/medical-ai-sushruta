import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "medical_ai.sqlite");

const db = new DatabaseSync(dbPath);

// Initialize schema: users, patients, chats, reports
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT DEFAULT 'password123',
    role TEXT DEFAULT 'patient', -- 'admin' | 'patient' | 'doctor'
    contact_info TEXT,
    doctor_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER DEFAULT 34,
    gender TEXT DEFAULT 'Male',
    blood_group TEXT DEFAULT 'O+ (Positive)',
    height TEXT DEFAULT '178 cm',
    weight TEXT DEFAULT '74 kg',
    email TEXT DEFAULT 'alex.mercer@sushruta-ai.local',
    phone TEXT DEFAULT '+1 (555) 382-9012',
    allergies TEXT DEFAULT 'Penicillin, Shellfish',
    chronic_conditions TEXT DEFAULT 'Mild Hypertension, Seasonal Asthma',
    emergency_contact TEXT DEFAULT 'Elena Mercer (Spouse) - +1 (555) 902-3341',
    primary_physician TEXT DEFAULT 'Dr. Aris Thorne, MD (Cardiology)',
    heart_rate TEXT DEFAULT '72 bpm',
    blood_pressure TEXT DEFAULT '120/80 mmHg',
    temperature TEXT DEFAULT '98.6 °F',
    spo2 TEXT DEFAULT '99%',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    sender TEXT NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    keywords TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT NOT NULL,
    filename TEXT,
    raw_content TEXT,
    summary TEXT NOT NULL,
    status TEXT DEFAULT 'optimal',
    biomarkers TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    specialization TEXT NOT NULL,
    bio TEXT,
    experience INTEGER DEFAULT 5,
    fees REAL DEFAULT 100,
    rating REAL DEFAULT 4.9,
    reviews_count INTEGER DEFAULT 28,
    avatar TEXT,
    availability TEXT, -- JSON array of { day: string, slots: string[] }
    is_approved INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id INTEGER NOT NULL,
    doctor_name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    patient_email TEXT,
    patient_phone TEXT,
    date TEXT NOT NULL, -- YYYY-MM-DD
    time_slot TEXT NOT NULL,
    notes TEXT,
    document_url TEXT,
    document_name TEXT,
    status TEXT DEFAULT 'confirmed', -- 'confirmed' | 'pending' | 'cancelled' | 'completed'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL, -- 'doctor' | 'patient' | 'admin' | 'system'
    actor_email TEXT,
    action_type TEXT NOT NULL,
    description TEXT NOT NULL,
    ip_address TEXT DEFAULT '127.0.0.1',
    status TEXT DEFAULT 'success', -- 'success' | 'warning' | 'info' | 'flagged'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_no TEXT NOT NULL UNIQUE,
    patient_name TEXT NOT NULL,
    patient_email TEXT,
    doctor_name TEXT NOT NULL,
    doctor_email TEXT,
    service_type TEXT NOT NULL,
    amount REAL NOT NULL,
    platform_fee REAL NOT NULL,
    doctor_payout REAL NOT NULL,
    payment_method TEXT DEFAULT 'Credit Card (Stripe)',
    payment_status TEXT DEFAULT 'Completed', -- 'Completed' | 'Settled' | 'Pending' | 'Refunded'
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Safe migrations for users table
try {
  db.exec("ALTER TABLE users ADD COLUMN password TEXT DEFAULT 'password123'");
} catch {}
try {
  db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'patient'");
} catch {}
try {
  db.exec("ALTER TABLE users ADD COLUMN contact_info TEXT");
} catch {}
try {
  db.exec("ALTER TABLE users ADD COLUMN doctor_id INTEGER");
} catch {}

// Ensure default patient profiles exist for each account
const ensurePatient = (name, age, gender, blood_group, height, weight, email, phone, allergies, chronic_conditions, emergency_contact, primary_physician, heart_rate, blood_pressure, temperature, spo2) => {
  const existing = db.prepare("SELECT id FROM patients WHERE LOWER(email) = LOWER(?)").get(email);
  if (!existing) {
    const insert = db.prepare(`
      INSERT INTO patients (
        name, age, gender, blood_group, height, weight, email, phone,
        allergies, chronic_conditions, emergency_contact, primary_physician,
        heart_rate, blood_pressure, temperature, spo2
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(name, age, gender, blood_group, height, weight, email, phone, allergies, chronic_conditions, emergency_contact, primary_physician, heart_rate, blood_pressure, temperature, spo2);
  }
};

// 1. Alex Mercer
ensurePatient(
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

// 2. John Patient
ensurePatient(
  "John Patient",
  42,
  "Male",
  "A+ (Positive)",
  "182 cm",
  "84 kg",
  "patient1@gmail.com",
  "+1 (555) 111-1111",
  "Peanuts, Sulfites",
  "Prediabetes, Mild Hyperlipidemia",
  "Mary Patient (Spouse) - +1 (555) 111-9988",
  "Dr. Albert Medic, MD (General Medicine)",
  "78 bpm",
  "130/85 mmHg",
  "98.4 °F",
  "98%"
);

// 3. Sarah Patient
ensurePatient(
  "Sarah Patient",
  29,
  "Female",
  "B+ (Positive)",
  "165 cm",
  "60 kg",
  "patient2@gmail.com",
  "+1 (555) 222-2222",
  "Latex, Cefazolin",
  "Seasonal Allergic Rhinitis",
  "David Patient (Brother) - +1 (555) 222-7711",
  "Dr. Jane Hart, MD (Cardiology)",
  "68 bpm",
  "115/75 mmHg",
  "98.6 °F",
  "99%"
);

// Insert default seed records if empty
const countChats = db.prepare("SELECT COUNT(*) as cnt FROM chats").get();
if (countChats.cnt === 0) {
  const insertChat = db.prepare(
    "INSERT INTO chats (sender, message, response, keywords) VALUES (?, ?, ?, ?)"
  );
  insertChat.run(
    "User",
    "What causes high creatinine in routine blood test?",
    "Creatinine is a chemical waste byproduct produced by regular muscle metabolism and filtered out by healthy kidneys.\n\n• Common Factors: Mild dehydration, intense strength workouts, high dietary protein, or reduced renal clearance.\n• Clinical Assessment: Physicians typically cross-examine BUN levels, eGFR, and hydration status.\n\nDisclaimer: Medical AI Sushruta provides educational healthcare guidance only. Consult a qualified medical practitioner for diagnosis or treatment.",
    "Creatinine"
  );
  insertChat.run(
    "User",
    "What does elevated WBC count mean in CBC test?",
    "A Complete Blood Count (CBC) measuring high White Blood Cells (Leukocytosis) suggests your immune defense system is active.\n\n• Typical Causes: Acute bacterial or viral infection, systemic inflammation, high physical stress, or allergic response.\n• Clinical Correlation: Reviewing absolute neutrophil and lymphocyte differentials helps identify the underlying trigger.\n\nDisclaimer: Medical AI Sushruta provides educational healthcare guidance only. Consult a qualified medical practitioner for diagnosis or treatment.",
    "CBC, WBC"
  );
}

const countReports = db.prepare("SELECT COUNT(*) as cnt FROM reports").get();
if (countReports.cnt === 0) {
  const insertReport = db.prepare(
    "INSERT INTO reports (title, filename, raw_content, summary, status, biomarkers) VALUES (?, ?, ?, ?, ?, ?)"
  );
  insertReport.run(
    "Comprehensive Metabolic Panel (CMP)",
    "cmp_lab_record.pdf",
    "Glucose: 106 mg/dL (High)\nBUN: 14 mg/dL\nCreatinine: 0.9 mg/dL\neGFR: >90\nSodium: 140 mEq/L",
    "Renal and electrolyte biomarkers are well-balanced within normal thresholds. Fasting blood sugar indicates mild borderline elevation (106 mg/dL).",
    "attention",
    JSON.stringify([
      { name: "Fasting Glucose", value: "106 mg/dL", ref: "70-99", status: "Elevated" },
      { name: "Creatinine", value: "0.9 mg/dL", ref: "0.6-1.2", status: "Optimal" },
      { name: "eGFR", value: ">90 mL/min", ref: ">60", status: "Optimal" }
    ])
  );
  insertReport.run(
    "Complete Blood Count (CBC)",
    "cbc_routine.pdf",
    "WBC: 7.2 x10^3/uL\nRBC: 4.1 x10^6/uL\nHemoglobin: 11.2 g/dL (Low)\nHematocrit: 34%\nPlatelets: 240 x10^3/uL",
    "Hemoglobin level is mildly below standard reference interval, pointing towards potential mild iron deficiency or nutritional anemia. Platelets and leukocytes are in normal range.",
    "attention",
    JSON.stringify([
      { name: "Hemoglobin", value: "11.2 g/dL", ref: "12.0-16.0", status: "Mildly Low" },
      { name: "WBC", value: "7.2 x10^3/uL", ref: "4.5-11.0", status: "Optimal" },
      { name: "Platelets", value: "240 x10^3/uL", ref: "150-450", status: "Optimal" }
    ])
  );
}

const countDoctors = db.prepare("SELECT COUNT(*) as cnt FROM doctors").get();
if (countDoctors.cnt === 0) {
  const defaultSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];

  const doctorsSeed = [
    {
      name: "Dr. Jane Hart, MD",
      email: "jane.hart@sushruta-med.com",
      phone: "+1 (555) 431-9081",
      specialization: "Cardiology",
      bio: "Dr. Jane Hart is an expert board-certified cardiologist with over 12 years of clinical experience. Specializes in preventive cardiac care, ECG/stress analysis, hypertension therapy, and post-cardiac surgery consulting.",
      experience: 12,
      fees: 150,
      rating: 4.9,
      reviews_count: 56,
      avatar: "👩‍⚕️",
      availability: JSON.stringify([
        { day: "Monday", slots: defaultSlots },
        { day: "Wednesday", slots: defaultSlots },
        { day: "Friday", slots: defaultSlots }
      ]),
      is_approved: 1
    },
    {
      name: "Dr. Sarah Skinner, MD",
      email: "sarah.skinner@sushruta-med.com",
      phone: "+1 (555) 772-1029",
      specialization: "Dermatology",
      bio: "Dr. Sarah Skinner specializes in clinical, surgical, and therapeutic dermatology. Expert in inflammatory skin conditions, allergic dermatitis, eczema, psoriasis, and lesion screenings.",
      experience: 8,
      fees: 120,
      rating: 4.8,
      reviews_count: 42,
      avatar: "👩‍⚕️",
      availability: JSON.stringify([
        { day: "Monday", slots: defaultSlots },
        { day: "Thursday", slots: defaultSlots }
      ]),
      is_approved: 1
    },
    {
      name: "Dr. Albert Medic, MD",
      email: "albert.medic@sushruta-med.com",
      phone: "+1 (555) 902-8812",
      specialization: "General Medicine",
      bio: "Dr. Albert Medic is a senior primary care physician focusing on holistic diagnosis of multi-system complaints, routine metabolic screening, preventive longevity, and chronic disease management.",
      experience: 15,
      fees: 80,
      rating: 4.9,
      reviews_count: 88,
      avatar: "👨‍⚕️",
      availability: JSON.stringify([
        { day: "Tuesday", slots: defaultSlots },
        { day: "Wednesday", slots: defaultSlots },
        { day: "Friday", slots: defaultSlots }
      ]),
      is_approved: 1
    },
    {
      name: "Dr. Charles Brain, MD, PhD",
      email: "charles.brain@sushruta-med.com",
      phone: "+1 (555) 234-9911",
      specialization: "Neurology",
      bio: "Dr. Charles Brain is a neurologist specializing in migraine pathophysiology, cognitive assessment, peripheral neuropathy, and neurological sleep disorders.",
      experience: 10,
      fees: 200,
      rating: 5.0,
      reviews_count: 34,
      avatar: "👨‍⚕️",
      availability: JSON.stringify([
        { day: "Wednesday", slots: defaultSlots },
        { day: "Friday", slots: defaultSlots }
      ]),
      is_approved: 1
    },
    {
      name: "Dr. Arthur Bone, MD",
      email: "arthur.bone@sushruta-med.com",
      phone: "+1 (555) 671-5523",
      specialization: "Orthopedics",
      bio: "Dr. Arthur Bone specializes in bone and joint trauma, sports kinematics, knee/hip arthroscopy, rotator cuff injuries, and non-surgical orthopedic rehabilitation.",
      experience: 14,
      fees: 160,
      rating: 4.8,
      reviews_count: 51,
      avatar: "👨‍⚕️",
      availability: JSON.stringify([
        { day: "Monday", slots: defaultSlots },
        { day: "Tuesday", slots: defaultSlots }
      ]),
      is_approved: 1
    },
    {
      name: "Dr. Sigmund Mind, MD",
      email: "sigmund.mind@sushruta-med.com",
      phone: "+1 (555) 881-2290",
      specialization: "Psychiatry",
      bio: "Dr. Sigmund Mind offers compassionate psychiatric assessment, evidence-based medication therapy, stress anxiety resolution, and psycho-somatic health optimization.",
      experience: 9,
      fees: 130,
      rating: 4.9,
      reviews_count: 67,
      avatar: "👨‍⚕️",
      availability: JSON.stringify([
        { day: "Wednesday", slots: defaultSlots },
        { day: "Thursday", slots: defaultSlots }
      ]),
      is_approved: 1
    },
    {
      name: "Dr. Alice Mother, MD",
      email: "alice.mother@sushruta-med.com",
      phone: "+1 (555) 441-7789",
      specialization: "Gynecology",
      bio: "Dr. Alice Mother provides dedicated clinical care in obstetrics, endocrine hormonal balances, reproductive wellness, pre-natal counsel, and preventative women's health.",
      experience: 11,
      fees: 140,
      rating: 4.9,
      reviews_count: 62,
      avatar: "👩‍⚕️",
      availability: JSON.stringify([
        { day: "Tuesday", slots: defaultSlots },
        { day: "Thursday", slots: defaultSlots },
        { day: "Friday", slots: defaultSlots }
      ]),
      is_approved: 1
    },
    {
      name: "Dr. Bruce Child, MD",
      email: "bruce.child@sushruta-med.com",
      phone: "+1 (555) 332-9011",
      specialization: "Pediatrics",
      bio: "Dr. Bruce Child specializes in pediatric developmental health, routine childhood immunization, pediatric allergy identification, and family health guidance.",
      experience: 5,
      fees: 90,
      rating: 4.7,
      reviews_count: 29,
      avatar: "👨‍⚕️",
      availability: JSON.stringify([
        { day: "Tuesday", slots: defaultSlots },
        { day: "Thursday", slots: defaultSlots }
      ]),
      is_approved: 1
    }
  ];

  const insertDoctor = db.prepare(`
    INSERT INTO doctors (
      name, email, phone, specialization, bio, experience, fees, rating, reviews_count, avatar, availability, is_approved
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const doc of doctorsSeed) {
    insertDoctor.run(
      doc.name,
      doc.email,
      doc.phone,
      doc.specialization,
      doc.bio,
      doc.experience,
      doc.fees,
      doc.rating,
      doc.reviews_count,
      doc.avatar,
      doc.availability,
      doc.is_approved
    );
  }
}

// Seed sample upcoming appointment for patient Alex Mercer if empty
const countAppointments = db.prepare("SELECT COUNT(*) as cnt FROM appointments").get();
if (countAppointments.cnt === 0) {
  const insertAppointment = db.prepare(`
    INSERT INTO appointments (
      doctor_id, doctor_name, specialization, patient_name, patient_email, patient_phone, date, time_slot, notes, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  insertAppointment.run(
    1,
    "Dr. Jane Hart, MD",
    "Cardiology",
    "Alex Mercer",
    "alex.mercer@sushruta-ai.local",
    "+1 (555) 382-9012",
    tomorrow,
    "10:00 AM",
    "Routine cardiovascular telemetry follow-up and blood pressure check.",
    "confirmed"
  );
}

// Seed Pending Verification Doctors if not present
const pendingDoctorsSeed = [
  {
    name: "Dr. Marcus Vance, MD",
    email: "dr.vance@neuro-clinic.com",
    phone: "+1 (555) 789-0123",
    specialization: "Neurology",
    bio: "Fellow of the American Academy of Neurology with 12 years expertise in cognitive diagnostics, migraines, and neurodegenerative disorders.",
    experience: 12,
    fees: 180,
    rating: 4.8,
    reviews_count: 14,
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80",
    availability: JSON.stringify([
      { day: "Monday", slots: ["09:00 AM", "11:00 AM", "02:00 PM"] },
      { day: "Wednesday", slots: ["10:00 AM", "01:00 PM", "03:30 PM"] }
    ]),
    is_approved: 0
  },
  {
    name: "Dr. Elena Rostova, MD",
    email: "elena.rostova@dermacare.org",
    phone: "+1 (555) 890-1234",
    specialization: "Dermatology & Oncology",
    bio: "Board-certified dermatologist specializing in laser therapy, melanocytic lesion screening, and autoimmune skin disorders.",
    experience: 9,
    fees: 140,
    rating: 4.9,
    reviews_count: 22,
    avatar: "https://images.unsplash.com/photo-1594824813593-5494f6f8bbd6?w=300&auto=format&fit=crop&q=80",
    availability: JSON.stringify([
      { day: "Tuesday", slots: ["08:30 AM", "11:30 AM", "02:30 PM"] },
      { day: "Thursday", slots: ["09:30 AM", "12:00 PM", "04:00 PM"] }
    ]),
    is_approved: 0
  },
  {
    name: "Dr. David K. Miller, MD",
    email: "david.miller@ortho-spine.com",
    phone: "+1 (555) 901-2345",
    specialization: "Orthopedic Surgery",
    bio: "Spine and joint replacement specialist with extensive surgical experience in robotic arthroplasty and sports medicine rehab.",
    experience: 16,
    fees: 220,
    rating: 4.7,
    reviews_count: 31,
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80",
    availability: JSON.stringify([
      { day: "Wednesday", slots: ["09:00 AM", "01:00 PM"] },
      { day: "Friday", slots: ["10:00 AM", "02:00 PM"] }
    ]),
    is_approved: 0
  }
];

const insertDocStmt = db.prepare(`
  INSERT INTO doctors (
    name, email, phone, specialization, bio, experience, fees, rating, reviews_count, avatar, availability, is_approved
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const pDoc of pendingDoctorsSeed) {
  const exists = db.prepare("SELECT id FROM doctors WHERE LOWER(email) = LOWER(?)").get(pDoc.email);
  if (!exists) {
    insertDocStmt.run(
      pDoc.name,
      pDoc.email,
      pDoc.phone,
      pDoc.specialization,
      pDoc.bio,
      pDoc.experience,
      pDoc.fees,
      pDoc.rating,
      pDoc.reviews_count,
      pDoc.avatar,
      pDoc.availability,
      pDoc.is_approved
    );
  }
}

// Seed Audit Logs if empty
const countLogs = db.prepare("SELECT COUNT(*) as cnt FROM audit_logs").get();
if (countLogs.cnt === 0) {
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (actor_name, actor_role, actor_email, action_type, description, ip_address, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const sampleLogs = [
    {
      actor_name: "Alex Mercer",
      actor_role: "patient",
      actor_email: "alex.mercer@sushruta-ai.local",
      action_type: "APPOINTMENT_BOOKED",
      description: "Booked cardiology consultation slot with Dr. Jane Hart, MD for 10:00 AM.",
      ip_address: "192.168.1.42",
      status: "success",
      created_at: "2026-10-08 14:10:00"
    },
    {
      actor_name: "Dr. Jane Hart, MD",
      actor_role: "doctor",
      actor_email: "doctor1@gmail.com",
      action_type: "APPOINTMENT_CONFIRMED",
      description: "Confirmed upcoming appointment for Alex Mercer and generated e-scheduling pass.",
      ip_address: "172.16.0.15",
      status: "success",
      created_at: "2026-10-08 14:15:30"
    },
    {
      actor_name: "John Patient",
      actor_role: "patient",
      actor_email: "patient1@gmail.com",
      action_type: "REPORT_ANALYZED",
      description: "Uploaded comprehensive metabolic lab report (Manual_Entry_Report.txt) for AI biomarker extraction.",
      ip_address: "192.168.1.88",
      status: "success",
      created_at: "2026-10-08 13:45:12"
    },
    {
      actor_name: "Sarah Patient",
      actor_role: "patient",
      actor_email: "patient2@gmail.com",
      action_type: "SYMPTOM_CONSULTATION",
      description: "Queried AI Clinical Engine regarding acute migraine and seasonal allergic rhinitis symptoms.",
      ip_address: "192.168.1.95",
      status: "info",
      created_at: "2026-10-08 12:30:45"
    },
    {
      actor_name: "Dr. Bruce Child, MD",
      actor_role: "doctor",
      actor_email: "doctor2@gmail.com",
      action_type: "SLOTS_UPDATED",
      description: "Updated pediatric outpatient schedule slots for Wednesday and Friday.",
      ip_address: "172.16.0.22",
      status: "info",
      created_at: "2026-10-08 11:20:10"
    },
    {
      actor_name: "Dr. Marcus Vance, MD",
      actor_role: "doctor",
      actor_email: "dr.vance@neuro-clinic.com",
      action_type: "DOCTOR_REGISTRATION",
      description: "Submitted medical license credential application for Neurology clinical verification.",
      ip_address: "10.0.4.55",
      status: "warning",
      created_at: "2026-10-08 09:15:00"
    },
    {
      actor_name: "System AI Engine",
      actor_role: "system",
      actor_email: "engine@sushruta-ai.local",
      action_type: "TELEMETRY_SYNC",
      description: "Executed automated real-time biometric and biomarker sync across 3 active patient nodes.",
      ip_address: "127.0.0.1",
      status: "success",
      created_at: "2026-10-08 08:00:00"
    }
  ];

  for (const log of sampleLogs) {
    insertAudit.run(log.actor_name, log.actor_role, log.actor_email, log.action_type, log.description, log.ip_address, log.status, log.created_at);
  }
}

// Seed Transactions (Accountant Ledger) if empty
const countTx = db.prepare("SELECT COUNT(*) as cnt FROM transactions").get();
if (countTx.cnt === 0) {
  const insertTx = db.prepare(`
    INSERT INTO transactions (invoice_no, patient_name, patient_email, doctor_name, doctor_email, service_type, amount, platform_fee, doctor_payout, payment_method, payment_status, transaction_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const sampleTx = [
    {
      invoice_no: "INV-2026-8801",
      patient_name: "Alex Mercer",
      patient_email: "alex.mercer@sushruta-ai.local",
      doctor_name: "Dr. Jane Hart, MD",
      doctor_email: "doctor1@gmail.com",
      service_type: "Specialist Cardiology Consultation",
      amount: 150.00,
      platform_fee: 22.50,
      doctor_payout: 127.50,
      payment_method: "Credit Card (Visa - 4021)",
      payment_status: "Settled",
      transaction_date: "2026-10-08 14:10:05"
    },
    {
      invoice_no: "INV-2026-8802",
      patient_name: "John Patient",
      patient_email: "patient1@gmail.com",
      doctor_name: "Dr. Albert Medic, MD",
      doctor_email: "doctor4@gmail.com",
      service_type: "General Medicine Comprehensive Review",
      amount: 100.00,
      platform_fee: 15.00,
      doctor_payout: 85.00,
      payment_method: "Health Insurance (BlueCross PPO)",
      payment_status: "Completed",
      transaction_date: "2026-10-08 13:45:30"
    },
    {
      invoice_no: "INV-2026-8803",
      patient_name: "Sarah Patient",
      patient_email: "patient2@gmail.com",
      doctor_name: "Dr. Sarah Skinner, MD",
      doctor_email: "doctor3@gmail.com",
      service_type: "Dermatological Lesion AI Diagnostic Review",
      amount: 120.00,
      platform_fee: 18.00,
      doctor_payout: 102.00,
      payment_method: "Apple Pay (Mastercard)",
      payment_status: "Completed",
      transaction_date: "2026-10-08 12:35:10"
    },
    {
      invoice_no: "INV-2026-8804",
      patient_name: "Alex Mercer",
      patient_email: "alex.mercer@sushruta-ai.local",
      doctor_name: "AI Clinical Core Engine",
      doctor_email: "engine@sushruta-ai.local",
      service_type: "Diagnostic Laboratory AI Biomarker Synthesis",
      amount: 45.00,
      platform_fee: 45.00,
      doctor_payout: 0.00,
      payment_method: "Medicare E-Claim #88192",
      payment_status: "Settled",
      transaction_date: "2026-10-08 09:12:00"
    },
    {
      invoice_no: "INV-2026-8805",
      patient_name: "John Patient",
      patient_email: "patient1@gmail.com",
      doctor_name: "Dr. Bruce Child, MD",
      doctor_email: "doctor2@gmail.com",
      service_type: "Family Pediatrics Follow-Up",
      amount: 90.00,
      platform_fee: 13.50,
      doctor_payout: 76.50,
      payment_method: "Debit Card (Interac)",
      payment_status: "Completed",
      transaction_date: "2026-10-07 16:20:00"
    }
  ];

  for (const tx of sampleTx) {
    insertTx.run(tx.invoice_no, tx.patient_name, tx.patient_email, tx.doctor_name, tx.doctor_email, tx.service_type, tx.amount, tx.platform_fee, tx.doctor_payout, tx.payment_method, tx.payment_status, tx.transaction_date);
  }
}

export default db;

