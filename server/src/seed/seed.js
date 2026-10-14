import mongoose from 'mongoose';
import { ENV } from '../config/env.js';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { ClinicService } from '../models/ClinicService.js';
import { Doctor } from '../models/Doctor.js';
import { DoctorAvailability } from '../models/DoctorAvailability.js';
import { Patient } from '../models/Patient.js';
import { Appointment } from '../models/Appointment.js';
import { Encounter } from '../models/Encounter.js';
import { Prescription } from '../models/Prescription.js';
import { LaboratoryOrder } from '../models/LaboratoryOrder.js';
import { Invoice } from '../models/Invoice.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await mongoose.connect(ENV.MONGO_URI);
    console.log('[Seed] Connected. Clearing previous seed collections...');

    // Clear collections
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      ClinicService.deleteMany({}),
      Doctor.deleteMany({}),
      DoctorAvailability.deleteMany({}),
      Patient.deleteMany({}),
      Appointment.deleteMany({}),
      Encounter.deleteMany({}),
      Prescription.deleteMany({}),
      LaboratoryOrder.deleteMany({}),
      Invoice.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    console.log('[Seed] Database cleared. Seeding Departments...');

    // 1. Departments
    const departments = await Department.insertMany([
      {
        name: 'General Internal Medicine',
        code: 'GEN',
        description: 'Comprehensive primary care, chronic disease management, and adult preventive health.',
        icon: 'Stethoscope',
        color: '#0D9488',
      },
      {
        name: 'Cardiology',
        code: 'CARD',
        description: 'Advanced cardiovascular care, diagnostic ECG, hypertension, and heart disease therapies.',
        icon: 'HeartPulse',
        color: '#E11D48',
      },
      {
        name: 'Pediatrics',
        code: 'PEDS',
        description: 'Dedicated neonatal, infant, and child developmental wellness and acute care.',
        icon: 'Baby',
        color: '#3B82F6',
      },
      {
        name: 'Orthopedics & Sports Medicine',
        code: 'ORTH',
        description: 'Musculoskeletal care, joint health, rehabilitation, and fracture management.',
        icon: 'Activity',
        color: '#F59E0B',
      },
      {
        name: 'Dermatology',
        code: 'DERM',
        description: 'Skin health, dermatologic diagnostics, allergy testing, and minor procedures.',
        icon: 'Sparkles',
        color: '#8B5CF6',
      },
    ]);

    console.log(`[Seed] Seeded ${departments.length} departments.`);

    // 2. Clinic Services
    console.log('[Seed] Seeding Clinic Services...');
    const services = await ClinicService.insertMany([
      {
        name: 'General Medical Consultation',
        code: 'GEN-CONSULT',
        departmentId: departments[0]._id,
        category: 'consultation',
        fee: 90,
        durationMinutes: 30,
        description: 'Standard 30-minute primary care medical assessment.',
      },
      {
        name: 'Comprehensive Cardiac Evaluation',
        code: 'CARD-EVAL',
        departmentId: departments[1]._id,
        category: 'consultation',
        fee: 175,
        durationMinutes: 45,
        description: 'In-depth cardiac exam including resting 12-lead ECG review.',
      },
      {
        name: 'Pediatric Well-Child Checkup',
        code: 'PEDS-WELL',
        departmentId: departments[2]._id,
        category: 'consultation',
        fee: 110,
        durationMinutes: 30,
        description: 'Growth monitoring, developmental screening, and parent guidance.',
      },
      {
        name: 'Orthopedic Joint Assessment',
        code: 'ORTH-JOINT',
        departmentId: departments[3]._id,
        category: 'consultation',
        fee: 140,
        durationMinutes: 30,
        description: 'Clinical evaluation of joint mobility, gait analysis, and pain etiology.',
      },
      {
        name: 'Comprehensive Metabolic Panel (CMP)',
        code: 'LAB-CMP',
        departmentId: departments[0]._id,
        category: 'lab',
        fee: 65,
        durationMinutes: 15,
        description: 'Complete blood chemistry assessing kidneys, liver, electrolytes, and glucose.',
      },
      {
        name: 'Lipid Cardiovascular Profile',
        code: 'LAB-LIPID',
        departmentId: departments[1]._id,
        category: 'lab',
        fee: 55,
        durationMinutes: 15,
        description: 'Fasting lipid profile measuring Total Cholesterol, HDL, LDL, and Triglycerides.',
      },
    ]);

    // 3. Staff & User Accounts for All 5 Roles
    console.log('[Seed] Creating Users for all 5 roles...');

    // A. Administrator
    const adminUser = await User.create({
      name: 'Eleanor Vance, RN, MHA',
      email: 'admin@medassist.local',
      password: 'AdminPass123!',
      role: 'admin',
      phone: '555-010-0001',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    });

    // B. Doctors
    const doctor1User = await User.create({
      name: 'Dr. Marcus Sterling, MD',
      email: 'doctor@medassist.local',
      password: 'DoctorPass123!',
      role: 'doctor',
      phone: '555-010-0002',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
    });

    const doctor2User = await User.create({
      name: 'Dr. Sarah Lin, MD, FACC',
      email: 'dr.lin@medassist.local',
      password: 'DoctorPass123!',
      role: 'doctor',
      phone: '555-010-0003',
      avatar: 'https://images.unsplash.com/photo-1594824813583-b788e381665e?w=150',
    });

    const doctor3User = await User.create({
      name: 'Dr. David Okafor, MD',
      email: 'dr.okafor@medassist.local',
      password: 'DoctorPass123!',
      role: 'doctor',
      phone: '555-010-0004',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150',
    });

    // C. Receptionist
    const receptionistUser = await User.create({
      name: 'Hannah Brooks',
      email: 'receptionist@medassist.local',
      password: 'ReceptPass123!',
      role: 'receptionist',
      phone: '555-010-0005',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    });

    // D. Lab Technician
    const labTechUser = await User.create({
      name: 'Julian Hayes, MLS (ASCP)',
      email: 'labtech@medassist.local',
      password: 'LabPass123!',
      role: 'lab_technician',
      phone: '555-010-0006',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });

    // E. Patient Portal Users
    const patientUser1 = await User.create({
      name: 'Arthur Pendelton',
      email: 'patient@medassist.local',
      password: 'PatientPass123!',
      role: 'patient',
      phone: '555-010-0101',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    });

    const patientUser2 = await User.create({
      name: 'Clara Oswald',
      email: 'patient2@medassist.local',
      password: 'PatientPass123!',
      role: 'patient',
      phone: '555-010-0102',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    });

    // 4. Doctor Profiles and Schedules
    console.log('[Seed] Creating Doctor profiles and availability...');
    const doctor1 = await Doctor.create({
      userId: doctor1User._id,
      licenseNumber: 'MD-884910',
      departmentId: departments[0]._id, // Internal Medicine
      specialties: ['Internal Medicine', 'Preventive Health', 'Hypertension'],
      qualification: 'MD, FACP (Johns Hopkins)',
      experienceYears: 12,
      consultationFee: 100,
      roomNumber: 'Suite 201',
      bio: 'Dr. Sterling is board-certified in Internal Medicine with clinical interests in cardiovascular risk reduction and chronic metabolic disease.',
    });
    doctor1User.doctorProfile = doctor1._id;
    await doctor1User.save();

    const doctor2 = await Doctor.create({
      userId: doctor2User._id,
      licenseNumber: 'MD-921475',
      departmentId: departments[1]._id, // Cardiology
      specialties: ['Cardiology', 'Echocardiography', 'Arrhythmia'],
      qualification: 'MD, FACC (Harvard Medical)',
      experienceYears: 15,
      consultationFee: 150,
      roomNumber: 'Suite 305',
      bio: 'Dr. Lin is an experienced cardiologist focusing on non-invasive diagnostics, lipidology, and congestive heart failure.',
    });
    doctor2User.doctorProfile = doctor2._id;
    await doctor2User.save();

    const doctor3 = await Doctor.create({
      userId: doctor3User._id,
      licenseNumber: 'MD-743120',
      departmentId: departments[2]._id, // Pediatrics
      specialties: ['Pediatrics', 'Adolescent Medicine'],
      qualification: 'MD, FAAP (Stanford)',
      experienceYears: 8,
      consultationFee: 95,
      roomNumber: 'Suite 108',
      bio: 'Dr. Okafor provides compassionate, family-centered pediatric care with focus on early development and preventative immunizations.',
    });
    doctor3User.doctorProfile = doctor3._id;
    await doctor3User.save();

    // Doctor Availability Schedules (Monday - Friday for all 3 doctors)
    const availabilityList = [];
    const doctorsList = [doctor1, doctor2, doctor3];

    for (const doc of doctorsList) {
      for (let day = 1; day <= 5; day++) {
        availabilityList.push({
          doctorId: doc._id,
          dayOfWeek: day, // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
          startTime: '09:00',
          endTime: '17:00',
          slotDurationMinutes: 30,
          breakStartTime: '13:00',
          breakEndTime: '14:00',
          isAvailable: true,
        });
      }
    }
    await DoctorAvailability.insertMany(availabilityList);

    // 5. Patients
    console.log('[Seed] Seeding Patients with complete medical records...');
    const patient1 = await Patient.create({
      userId: patientUser1._id,
      mrn: 'MRN-10021',
      firstName: 'Arthur',
      lastName: 'Pendelton',
      dateOfBirth: new Date(1968, 5, 14),
      gender: 'male',
      phone: '555-010-0101',
      email: 'patient@medassist.local',
      address: {
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62704',
        country: 'USA',
      },
      bloodGroup: 'O+',
      allergies: ['Penicillin', 'Sulfa drugs'],
      emergencyContact: {
        name: 'Martha Pendelton',
        relationship: 'Spouse',
        phone: '555-010-0999',
      },
      medicalHistory: ['Essential Hypertension (10 yrs)', 'Type 2 Diabetes Mellitus', 'Hyperlipidemia'],
      insuranceProvider: 'Blue Cross Blue Shield Preferred',
      insurancePolicyNumber: 'BCBS-99482104-A',
    });
    patientUser1.patientProfile = patient1._id;
    await patientUser1.save();

    const patient2 = await Patient.create({
      userId: patientUser2._id,
      mrn: 'MRN-10022',
      firstName: 'Clara',
      lastName: 'Oswald',
      dateOfBirth: new Date(1992, 10, 23),
      gender: 'female',
      phone: '555-010-0102',
      email: 'patient2@medassist.local',
      address: {
        street: '12 Rosewood Lane',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60611',
        country: 'USA',
      },
      bloodGroup: 'A+',
      allergies: ['Latex'],
      emergencyContact: {
        name: 'David Oswald',
        relationship: 'Father',
        phone: '555-010-0888',
      },
      medicalHistory: ['Mild Intermittent Asthma'],
      insuranceProvider: 'Aetna Open Choice PPO',
      insurancePolicyNumber: 'AET-773190-2B',
    });
    patientUser2.patientProfile = patient2._id;
    await patientUser2.save();

    const patient3 = await Patient.create({
      mrn: 'MRN-10023',
      firstName: 'Robert',
      lastName: 'Chen',
      dateOfBirth: new Date(1984, 2, 11),
      gender: 'male',
      phone: '555-010-0103',
      email: 'robert.chen@example.com',
      bloodGroup: 'B+',
      allergies: ['Aspirin (triggers bronchospasm)'],
      emergencyContact: { name: 'Linda Chen', relationship: 'Sister', phone: '555-010-0777' },
      medicalHistory: ['Lumbar Disc Herniation', 'Seasonal Allergic Rhinitis'],
      insuranceProvider: 'UnitedHealthcare Choice Plus',
      insurancePolicyNumber: 'UHC-44821190',
    });

    const patient4 = await Patient.create({
      mrn: 'MRN-10024',
      firstName: 'Sophia',
      lastName: 'Rodriguez',
      dateOfBirth: new Date(2018, 7, 19),
      gender: 'female',
      phone: '555-010-0104',
      email: 'elena.rodriguez@example.com',
      bloodGroup: 'O-',
      allergies: ['Peanuts'],
      emergencyContact: { name: 'Elena Rodriguez', relationship: 'Mother', phone: '555-010-0666' },
      medicalHistory: ['Childhood Eczema', 'Frequent Otitis Media'],
      insuranceProvider: 'Cigna HealthSpring',
      insurancePolicyNumber: 'CIG-8821943',
    });

    // 6. Appointments across status spectrum
    console.log('[Seed] Seeding Appointments across status lifecycle...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Appointment 1: In-consultation right now with Dr. Sterling
    const aptInConsultation = await Appointment.create({
      appointmentNumber: 'APT-20261014-001',
      patientId: patient1._id,
      doctorId: doctor1._id,
      departmentId: departments[0]._id,
      serviceId: services[0]._id,
      appointmentDate: today,
      startTime: '09:30',
      endTime: '10:00',
      status: 'in-consultation',
      queueNumber: 1,
      reason: 'Hypertension follow-up and elevated fasting blood sugars',
      notes: 'Patient reports mild occasional morning headache. Compliance with lisinopril confirmed.',
      checkInTime: new Date(Date.now() - 45 * 60 * 1000),
      consultationStartTime: new Date(Date.now() - 15 * 60 * 1000),
      bookedBy: receptionistUser._id,
    });

    // Appointment 2: Arrived in Waiting Room for Dr. Sterling
    const aptWaiting = await Appointment.create({
      appointmentNumber: 'APT-20261014-002',
      patientId: patient2._id,
      doctorId: doctor1._id,
      departmentId: departments[0]._id,
      serviceId: services[0]._id,
      appointmentDate: today,
      startTime: '10:00',
      endTime: '10:30',
      status: 'arrived',
      queueNumber: 2,
      reason: 'Routine Annual Wellness Exam & Asthma Refill Review',
      notes: 'Check-in completed. Copay collected at reception desk.',
      checkInTime: new Date(Date.now() - 10 * 60 * 1000),
      bookedBy: patientUser2._id,
    });

    // Appointment 3: Booked later today with Dr. Lin
    const aptBooked = await Appointment.create({
      appointmentNumber: 'APT-20261014-003',
      patientId: patient3._id,
      doctorId: doctor2._id,
      departmentId: departments[1]._id,
      serviceId: services[1]._id,
      appointmentDate: today,
      startTime: '11:00',
      endTime: '11:45',
      status: 'booked',
      reason: 'Cardiology consultation for exertional palpitations',
      bookedBy: receptionistUser._id,
    });

    // Appointment 4: Completed historical appointment
    const pastDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const aptCompleted = await Appointment.create({
      appointmentNumber: 'APT-20260930-008',
      patientId: patient1._id,
      doctorId: doctor1._id,
      departmentId: departments[0]._id,
      serviceId: services[0]._id,
      appointmentDate: pastDate,
      startTime: '14:00',
      endTime: '14:30',
      status: 'completed',
      queueNumber: 4,
      reason: 'Biannual chronic disease checkup',
      checkInTime: new Date(pastDate.getTime() + 13 * 3600 * 1000 + 45 * 60 * 1000),
      consultationStartTime: new Date(pastDate.getTime() + 14 * 3600 * 1000),
      completedTime: new Date(pastDate.getTime() + 14 * 3600 * 1000 + 35 * 60 * 1000),
      bookedBy: receptionistUser._id,
    });

    // 7. Clinical Encounter for past completed visit
    console.log('[Seed] Seeding Clinical Encounters and Notes...');
    const pastEncounter = await Encounter.create({
      encounterNumber: 'ENC-20260930-001',
      appointmentId: aptCompleted._id,
      patientId: patient1._id,
      doctorId: doctor1._id,
      status: 'finalized',
      encounterDate: pastDate,
      vitals: {
        bloodPressureSys: 138,
        bloodPressureDia: 86,
        heartRate: 72,
        temperature: 36.8,
        respiratoryRate: 16,
        oxygenSaturation: 98,
        weightKg: 84.5,
        heightCm: 178,
        bmi: 26.7,
      },
      chiefComplaint: 'Biannual chronic disease review for hypertension and glycemic monitoring.',
      symptoms: ['Mild fatigue after work', 'No chest discomfort', 'No orthopnea'],
      soapNotes: {
        subjective:
          'Arthur presents for regular checkup. Takes Lisinopril 20mg and Metformin 1000mg BID. Blood pressure at home averages 135/84. Reports occasional dietary indiscretions with carbohydrates.',
        objective:
          'Alert, oriented x4, in no acute distress. CV: Regular rate and rhythm, normal S1/S2, no murmurs. Lungs: Clear to auscultation bilaterally. Abdomen: Soft, non-tender, no hepatomegaly. Extremities: Trace bilateral pretibial edema.',
        assessment:
          '1. Essential hypertension, borderline controlled on current monotherapy.\n2. Type 2 Diabetes Mellitus, well-tolerated on metformin. Ordered HbA1c to assess 90-day glycemic trend.\n3. Hyperlipidemia, stable.',
        plan:
          '1. Continue Lisinopril 20mg daily.\n2. Increase dietary fiber and reduce sodium intake.\n3. Ordered Comprehensive Metabolic Panel and HbA1c.\n4. Return to clinic in 3 months with home BP log.',
      },
      diagnoses: [
        { code: 'I10', description: 'Essential (primary) hypertension', type: 'primary', status: 'active' },
        { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', type: 'secondary', status: 'active' },
      ],
      followUpPlan: {
        recommendedDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
        instructions: 'Return in 3 months for repeat blood pressure check and review of HbA1c trend.',
        intervalWeeks: 12,
      },
      aiSummary: {
        generatedText:
          'Visit Summary: 58-year-old male with chronic hypertension and T2D seen for routine surveillance. BP borderline at 138/86. Current regimen of Lisinopril and Metformin maintained. Lifestyle counseling reinforced; comprehensive metabolic panel and HbA1c investigations ordered. Follow-up scheduled in 12 weeks.',
        status: 'approved_by_clinician',
        approvedAt: pastDate,
        approvedBy: doctor1User._id,
      },
      finalizedAt: pastDate,
      finalizedBy: doctor1User._id,
    });

    // 8. Prescription for Patient 1
    console.log('[Seed] Seeding Prescriptions...');
    await Prescription.create({
      prescriptionNumber: 'RX-20260930-001',
      encounterId: pastEncounter._id,
      patientId: patient1._id,
      doctorId: doctor1._id,
      medications: [
        {
          name: 'Lisinopril',
          dosage: '20 mg',
          frequency: 'Once daily every morning',
          route: 'Oral',
          duration: '90 days',
          quantity: '90 tablets',
          instructions: 'Take consistently at the same time each morning with a glass of water.',
        },
        {
          name: 'Metformin Hydrochloride (Glucophage)',
          dosage: '1000 mg',
          frequency: 'Twice daily with meals',
          route: 'Oral',
          duration: '90 days',
          quantity: '180 tablets',
          instructions: 'Take immediately with breakfast and dinner to minimize gastrointestinal upset.',
        },
        {
          name: 'Atorvastatin Calcium',
          dosage: '20 mg',
          frequency: 'Once daily at bedtime',
          route: 'Oral',
          duration: '90 days',
          quantity: '90 tablets',
          instructions: 'Take in the evening. Report any unexplained muscle pain or soreness promptly.',
        },
      ],
      generalInstructions:
        'Maintain a low-sodium Mediterranean-style diet. Monitor and record blood pressure three times weekly before breakfast.',
      dietaryAdvice: 'Limit sodium intake to under 2,000 mg per day. Increase potassium-rich leafy greens and lean proteins.',
      plainLanguageExplanation: {
        text: `### Your Personal Medication Guide

1. **Lisinopril (20 mg)**
   - **What it does**: Relaxes your blood vessels to keep your blood pressure smooth and protect your kidneys.
   - **How to take**: 1 tablet every morning with water.

2. **Metformin (1000 mg)**
   - **What it does**: Helps your body handle sugar better and keeps blood glucose in a safe range.
   - **How to take**: 1 tablet twice a day with meals (breakfast & dinner).

3. **Atorvastatin (20 mg)**
   - **What it does**: Lowers harmful cholesterol to protect your heart.
   - **How to take**: 1 tablet at night before sleeping.

⚠️ **Helpful Tips:**
- Do not stop taking your blood pressure medication even if you feel completely fine.
- If you forget a dose, take it as soon as you remember, unless it is almost time for your next dose. Never take two doses at once.`,
        generatedAt: pastDate,
      },
      status: 'active',
      issuedDate: pastDate,
    });

    // 9. Laboratory Orders across the 6 workflow lifecycle stages
    console.log('[Seed] Seeding Laboratory Orders across all stages...');

    // Stage 1: Ordered (New order waiting for sample collection)
    await LaboratoryOrder.create({
      orderNumber: 'LAB-20261014-001',
      patientId: patient2._id,
      doctorId: doctor1._id,
      testName: 'Complete Blood Count (CBC) with Differential',
      testCode: 'CBC-DIFF',
      category: 'Hematology',
      priority: 'routine',
      sampleType: 'Whole Blood (EDTA)',
      clinicalNotes: 'Check for eosinophilia and baseline hematology prior to asthma step-up therapy.',
      status: 'ordered',
    });

    // Stage 2: Sample Collected & Accessioned
    await LaboratoryOrder.create({
      orderNumber: 'LAB-20261014-002',
      accessionNumber: 'ACC-89104',
      patientId: patient3._id,
      doctorId: doctor2._id,
      testName: 'High-Sensitivity C-Reactive Protein (hs-CRP)',
      testCode: 'HS-CRP',
      category: 'Immunology',
      priority: 'urgent',
      sampleType: 'Serum Separator Tube',
      clinicalNotes: 'Cardiovascular risk stratification in patient with family history.',
      status: 'sample_collected',
      sampleCollectedAt: new Date(Date.now() - 30 * 60 * 1000),
      sampleCollectedBy: labTechUser._id,
    });

    // Stage 3: Processing (In analyzer)
    await LaboratoryOrder.create({
      orderNumber: 'LAB-20261014-003',
      accessionNumber: 'ACC-89102',
      patientId: patient4._id,
      doctorId: doctor3._id,
      testName: 'Serum Total IgE & Pediatric Allergy Panel',
      testCode: 'PEDS-IGE',
      category: 'Immunology',
      priority: 'routine',
      sampleType: 'Serum',
      status: 'processing',
      sampleCollectedAt: new Date(Date.now() - 2 * 3600 * 1000),
      sampleCollectedBy: labTechUser._id,
      processingStartedAt: new Date(Date.now() - 20 * 60 * 1000),
    });

    // Stage 4: Completed Pending Clinical Verification
    await LaboratoryOrder.create({
      orderNumber: 'LAB-20261014-004',
      accessionNumber: 'ACC-89098',
      patientId: patient1._id,
      doctorId: doctor1._id,
      testName: 'Glycated Hemoglobin (HbA1c)',
      testCode: 'HBA1C',
      category: 'Biochemistry',
      priority: 'routine',
      sampleType: 'Whole Blood',
      status: 'completed_pending_verification',
      sampleCollectedAt: new Date(Date.now() - 4 * 3600 * 1000),
      sampleCollectedBy: labTechUser._id,
      resultsEnteredAt: new Date(Date.now() - 1 * 3600 * 1000),
      resultsEnteredBy: labTechUser._id,
      technicianNotes: 'Analyzed on Roche Cobas c513. Dual control validation within acceptable 2SD limits.',
      results: [
        { parameter: 'Hemoglobin A1c', value: '7.1', unit: '%', referenceRange: '4.0 - 5.6', flag: 'abnormal' },
        { parameter: 'Estimated Average Glucose (eAG)', value: '157', unit: 'mg/dL', referenceRange: '70 - 126', flag: 'abnormal' },
      ],
    });

    // Stage 5 & 6: Verified and Released to Patient
    await LaboratoryOrder.create({
      orderNumber: 'LAB-20260930-001',
      accessionNumber: 'ACC-88741',
      encounterId: pastEncounter._id,
      patientId: patient1._id,
      doctorId: doctor1._id,
      testName: 'Comprehensive Metabolic Panel (CMP)',
      testCode: 'LAB-CMP',
      category: 'Biochemistry',
      priority: 'routine',
      sampleType: 'Serum',
      status: 'released',
      sampleCollectedAt: new Date(pastDate.getTime() + 15 * 3600 * 1000),
      sampleCollectedBy: labTechUser._id,
      resultsEnteredAt: new Date(pastDate.getTime() + 17 * 3600 * 1000),
      resultsEnteredBy: labTechUser._id,
      verifiedAt: new Date(pastDate.getTime() + 19 * 3600 * 1000),
      verifiedBy: doctor1User._id,
      releasedAt: new Date(pastDate.getTime() + 20 * 3600 * 1000),
      releasedBy: doctor1User._id,
      technicianNotes: 'Serum non-hemolyzed. Calibrations passed.',
      results: [
        { parameter: 'Fasting Glucose', value: '112', unit: 'mg/dL', referenceRange: '70 - 99', flag: 'abnormal' },
        { parameter: 'Blood Urea Nitrogen (BUN)', value: '16', unit: 'mg/dL', referenceRange: '7 - 20', flag: 'normal' },
        { parameter: 'Serum Creatinine', value: '0.98', unit: 'mg/dL', referenceRange: '0.70 - 1.30', flag: 'normal' },
        { parameter: 'eGFR (CKD-EPI)', value: '88', unit: 'mL/min/1.73m²', referenceRange: '> 60', flag: 'normal' },
        { parameter: 'Sodium', value: '140', unit: 'mmol/L', referenceRange: '136 - 145', flag: 'normal' },
        { parameter: 'Potassium', value: '4.4', unit: 'mmol/L', referenceRange: '3.5 - 5.1', flag: 'normal' },
        { parameter: 'Chloride', value: '102', unit: 'mmol/L', referenceRange: '98 - 107', flag: 'normal' },
        { parameter: 'Carbon Dioxide (Bicarbonate)', value: '25', unit: 'mmol/L', referenceRange: '22 - 29', flag: 'normal' },
        { parameter: 'Total Calcium', value: '9.4', unit: 'mg/dL', referenceRange: '8.6 - 10.2', flag: 'normal' },
        { parameter: 'Total Protein', value: '7.1', unit: 'g/dL', referenceRange: '6.4 - 8.3', flag: 'normal' },
        { parameter: 'Albumin', value: '4.2', unit: 'g/dL', referenceRange: '3.5 - 5.0', flag: 'normal' },
        { parameter: 'Total Bilirubin', value: '0.6', unit: 'mg/dL', referenceRange: '0.2 - 1.2', flag: 'normal' },
        { parameter: 'Alkaline Phosphatase (ALP)', value: '64', unit: 'U/L', referenceRange: '44 - 147', flag: 'normal' },
        { parameter: 'Alanine Aminotransferase (ALT)', value: '28', unit: 'U/L', referenceRange: '7 - 56', flag: 'normal' },
      ],
    });

    // 10. Billing Invoices
    console.log('[Seed] Seeding Invoices and Payments...');
    // Paid invoice
    await Invoice.create({
      invoiceNumber: 'INV-20260930-001',
      patientId: patient1._id,
      appointmentId: aptCompleted._id,
      encounterId: pastEncounter._id,
      items: [
        { description: 'General Medical Consultation (Dr. Sterling)', category: 'consultation', quantity: 1, unitPrice: 90, amount: 90 },
        { description: 'Comprehensive Metabolic Panel (CMP)', category: 'lab', quantity: 1, unitPrice: 65, amount: 65 },
      ],
      subtotal: 155,
      discount: 0,
      tax: 0,
      totalAmount: 155,
      paidAmount: 155,
      balanceAmount: 0,
      status: 'paid',
      issueDate: pastDate,
      payments: [
        {
          receiptNumber: 'RCP-881021',
          amount: 155,
          method: 'card',
          transactionReference: 'TXN_VISA_99410',
          paidAt: pastDate,
          receivedBy: receptionistUser._id,
          notes: 'Paid via Chip & PIN terminal at front desk',
        },
      ],
      createdBy: receptionistUser._id,
    });

    // Pending invoice for today's arrived visit
    await Invoice.create({
      invoiceNumber: 'INV-20261014-001',
      patientId: patient2._id,
      appointmentId: aptWaiting._id,
      items: [
        { description: 'Annual Wellness Exam & Consultation', category: 'consultation', quantity: 1, unitPrice: 90, amount: 90 },
        { description: 'Peak Flow Spirometry Test', category: 'procedure', quantity: 1, unitPrice: 45, amount: 45 },
      ],
      subtotal: 135,
      discount: 10,
      tax: 0,
      totalAmount: 125,
      paidAmount: 25, // Insurance copay paid
      balanceAmount: 100, // Remaining balance billed to insurer
      status: 'partially_paid',
      issueDate: today,
      payments: [
        {
          receiptNumber: 'RCP-890101',
          amount: 25,
          method: 'cash',
          paidAt: today,
          receivedBy: receptionistUser._id,
          notes: 'Patient copay collected at check-in',
        },
      ],
      createdBy: receptionistUser._id,
    });

    // 11. Notifications
    console.log('[Seed] Seeding Notifications...');
    await Notification.insertMany([
      {
        userId: doctor1User._id,
        title: 'Patient Waiting in Queue',
        message: 'Clara Oswald (MRN-10022) has arrived and is waiting in the lobby (Queue #2).',
        type: 'appointment',
        link: '/doctor/queue',
      },
      {
        userId: doctor1User._id,
        title: 'Laboratory Results Pending Verification',
        message: 'HbA1c results for Arthur Pendelton (MRN-10021) are ready for clinical review.',
        type: 'lab',
        link: '/doctor/encounters',
      },
      {
        userId: patientUser1._id,
        title: 'Diagnostic Lab Report Available',
        message: 'Your Comprehensive Metabolic Panel results have been verified and released by Dr. Sterling.',
        type: 'lab',
        link: '/patient/lab-reports',
      },
      {
        userId: adminUser._id,
        title: 'Monthly Clinic Summary Ready',
        message: 'System audit logs and monthly operational revenue metrics are compiled for review.',
        type: 'system',
        link: '/admin/dashboard',
      },
    ]);

    // 12. Audit Logs
    console.log('[Seed] Seeding Audit Logs...');
    await AuditLog.insertMany([
      {
        actorId: receptionistUser._id,
        actorName: receptionistUser.name,
        actorRole: receptionistUser.role,
        action: 'PATIENT_CHECK_IN',
        resourceType: 'Appointment',
        resourceId: aptWaiting._id.toString(),
        outcome: 'success',
        details: { patientName: 'Clara Oswald', queueNumber: 2 },
      },
      {
        actorId: doctor1User._id,
        actorName: doctor1User.name,
        actorRole: doctor1User.role,
        action: 'ENCOUNTER_FINALIZED_AND_SIGNED',
        resourceType: 'Encounter',
        resourceId: pastEncounter._id.toString(),
        outcome: 'success',
        details: { encounterNumber: pastEncounter.encounterNumber },
      },
      {
        actorId: labTechUser._id,
        actorName: labTechUser.name,
        actorRole: labTechUser.role,
        action: 'LAB_RESULTS_ENTERED',
        resourceType: 'LaboratoryOrder',
        outcome: 'success',
        details: { testCode: 'HBA1C', parametersCount: 2 },
      },
    ]);

    console.log('\n======================================================');
    console.log('✅ MedAssist Synthetic Clinical Database Seeded!');
    console.log('======================================================');
    console.log('Demo Credentials for All 5 Roles:');
    console.log('1. Administrator:  admin@medassist.local      / AdminPass123!');
    console.log('2. Doctor:         doctor@medassist.local     / DoctorPass123!');
    console.log('3. Receptionist:   receptionist@medassist.local / ReceptPass123!');
    console.log('4. Lab Technician: labtech@medassist.local    / LabPass123!');
    console.log('5. Patient:        patient@medassist.local    / PatientPass123!');
    console.log('======================================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Critical failure during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
