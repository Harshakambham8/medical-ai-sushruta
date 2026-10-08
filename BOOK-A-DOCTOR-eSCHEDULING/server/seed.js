import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Doctor from './models/Doctor.js';
import Appointment from './models/Appointment.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/book-my-doctor';

const seedData = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // Clear existing collections
    console.log('Clearing database collections...');
    await User.deleteMany();
    await Doctor.deleteMany();
    await Appointment.deleteMany();
    console.log('Database cleared.');

    // Create Admin
    console.log('Creating Admin account...');
    await User.create({
      name: 'System Admin',
      email: 'admin@gmail.com',
      password: 'admin123',
      role: 'admin',
      contactInfo: '999-999-9999'
    });
    console.log('Admin account created successfully.');

    // Create Patients
    console.log('Creating Patient accounts...');
    await User.create({
      name: 'John Patient',
      email: 'patient1@gmail.com',
      password: 'patient123',
      role: 'patient',
      contactInfo: '111-111-1111'
    });

    await User.create({
      name: 'Sarah Patient',
      email: 'patient2@gmail.com',
      password: 'patient123',
      role: 'patient',
      contactInfo: '222-222-2222'
    });
    console.log('Patient accounts created.');

    const defaultSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];

    // 1. Cardiology (Approved)
    console.log('Seeding Cardiology Doctor...');
    const user1 = await User.create({
      name: 'Dr. Jane Hart',
      email: 'doctor1@gmail.com',
      password: 'doctor123',
      role: 'doctor',
      contactInfo: '555-000-0001'
    });
    await Doctor.create({
      user: user1._id,
      specialization: 'Cardiology',
      bio: 'Dr. Jane Hart is an expert cardiologist with over 12 years of experience. She specializes in cardiac diagnostic checks, surgery consulting, and healthy lifestyle planning.',
      experience: 12,
      fees: 150,
      availability: [
        { day: 'Monday', slots: defaultSlots },
        { day: 'Wednesday', slots: defaultSlots },
        { day: 'Friday', slots: defaultSlots }
      ],
      isApproved: true
    });

    // 2. Pediatrics (Pending)
    console.log('Seeding Pediatrics Doctor...');
    const user2 = await User.create({
      name: 'Dr. Bruce Child',
      email: 'doctor2@gmail.com',
      password: 'doctor123',
      role: 'doctor',
      contactInfo: '555-000-0002'
    });
    await Doctor.create({
      user: user2._id,
      specialization: 'Pediatrics',
      bio: 'Dr. Bruce Child loves caring for children of all ages. He has 5 years of pediatric experience, focusing on developmental health and immunization programs.',
      experience: 5,
      fees: 90,
      availability: [
        { day: 'Tuesday', slots: defaultSlots },
        { day: 'Thursday', slots: defaultSlots }
      ],
      isApproved: false
    });

    // 3. Dermatology (Approved)
    console.log('Seeding Dermatology Doctor...');
    const user3 = await User.create({
      name: 'Dr. Sarah Skinner',
      email: 'doctor3@gmail.com',
      password: 'doctor123',
      role: 'doctor',
      contactInfo: '555-000-0003'
    });
    await Doctor.create({
      user: user3._id,
      specialization: 'Dermatology',
      bio: 'Dr. Sarah Skinner specializes in medical, surgical, and cosmetic dermatology, helping patients achieve healthy, glowing skin and treatment for acute conditions.',
      experience: 8,
      fees: 120,
      availability: [
        { day: 'Monday', slots: defaultSlots },
        { day: 'Thursday', slots: defaultSlots }
      ],
      isApproved: true
    });

    // 4. General Medicine (Approved)
    console.log('Seeding General Medicine Doctor...');
    const user4 = await User.create({
      name: 'Dr. Albert Medic',
      email: 'doctor4@gmail.com',
      password: 'doctor123',
      role: 'doctor',
      contactInfo: '555-000-0004'
    });
    await Doctor.create({
      user: user4._id,
      specialization: 'General Medicine',
      bio: 'Dr. Albert Medic provides primary care, diagnosis of multi-system illnesses, preventative health screening, and management of chronic conditions.',
      experience: 15,
      fees: 80,
      availability: [
        { day: 'Tuesday', slots: defaultSlots },
        { day: 'Wednesday', slots: defaultSlots },
        { day: 'Friday', slots: defaultSlots }
      ],
      isApproved: true
    });

    // 5. Neurology (Approved)
    console.log('Seeding Neurology Doctor...');
    const user5 = await User.create({
      name: 'Dr. Charles Brain',
      email: 'doctor5@gmail.com',
      password: 'doctor123',
      role: 'doctor',
      contactInfo: '555-000-0005'
    });
    await Doctor.create({
      user: user5._id,
      specialization: 'Neurology',
      bio: 'Dr. Charles Brain is a board-certified neurologist specializing in sleep disorders, headache management, epilepsy, and cognitive neurological therapy.',
      experience: 10,
      fees: 200,
      availability: [
        { day: 'Wednesday', slots: defaultSlots },
        { day: 'Friday', slots: defaultSlots }
      ],
      isApproved: true
    });

    // 6. Orthopedics (Approved)
    console.log('Seeding Orthopedics Doctor...');
    const user6 = await User.create({
      name: 'Dr. Arthur Bone',
      email: 'doctor6@gmail.com',
      password: 'doctor123',
      role: 'doctor',
      contactInfo: '555-000-0006'
    });
    await Doctor.create({
      user: user6._id,
      specialization: 'Orthopedics',
      bio: 'Dr. Arthur Bone specializes in bone and joint wellness, joint replacements, sports injuries, fracture management, and corrective orthopedic therapies.',
      experience: 14,
      fees: 160,
      availability: [
        { day: 'Monday', slots: defaultSlots },
        { day: 'Tuesday', slots: defaultSlots }
      ],
      isApproved: true
    });

    // 7. Psychiatry (Approved)
    console.log('Seeding Psychiatry Doctor...');
    const user7 = await User.create({
      name: 'Dr. Sigmund Mind',
      email: 'doctor7@gmail.com',
      password: 'doctor123',
      role: 'doctor',
      contactInfo: '555-000-0007'
    });
    await Doctor.create({
      user: user7._id,
      specialization: 'Psychiatry',
      bio: 'Dr. Sigmund Mind offers expert mental health consultation, therapy, anxiety management, mood disorder resolution, and custom mental fitness coaching.',
      experience: 9,
      fees: 130,
      availability: [
        { day: 'Wednesday', slots: defaultSlots },
        { day: 'Thursday', slots: defaultSlots }
      ],
      isApproved: true
    });

    // 8. Gynecology (Approved)
    console.log('Seeding Gynecology Doctor...');
    const user8 = await User.create({
      name: 'Dr. Alice Mother',
      email: 'doctor8@gmail.com',
      password: 'doctor123',
      role: 'doctor',
      contactInfo: '555-000-0008'
    });
    await Doctor.create({
      user: user8._id,
      specialization: 'Gynecology',
      bio: 'Dr. Alice Mother provides dedicated clinical care in obstetrics, neonatal consultation, reproductive wellness, and comprehensive women health coaching.',
      experience: 11,
      fees: 140,
      availability: [
        { day: 'Tuesday', slots: defaultSlots },
        { day: 'Thursday', slots: defaultSlots },
        { day: 'Friday', slots: defaultSlots }
      ],
      isApproved: true
    });

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
