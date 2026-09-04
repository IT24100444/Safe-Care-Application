import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Facility from '../models/Facility.js';
import MedicalService from '../models/MedicalService.js';
import FacilityStatus from '../models/FacilityStatus.js';
import CareRequest from '../models/CareRequest.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/safecare';
    console.log(`[Seed] Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Facility.deleteMany({});
    await MedicalService.deleteMany({});
    await FacilityStatus.deleteMany({});
    await CareRequest.deleteMany({});

    console.log('[Seed] Creating demo users...');
    // Pass plain-text password — the User model pre-save hook encrypts it with bcrypt
    const plainPassword = 'Password123!';

    const admin = await User.create({
      name: 'Dr. Arthur Vance (Admin)',
      email: 'admin@safecare.com',
      password: plainPassword,
      role: 'admin',
      phone: '+94 11 234 5678',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150'
    });

    const manager = await User.create({
      name: 'Sarah Fernando (Facility Manager)',
      email: 'manager@safecare.com',
      password: plainPassword,
      role: 'manager',
      phone: '+94 11 765 4321',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
    });

    const staff = await User.create({
      name: 'Nurse David Miller (Staff)',
      email: 'staff@safecare.com',
      password: plainPassword,
      role: 'staff',
      phone: '+94 11 987 6543',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'
    });

    const patient = await User.create({
      name: 'Elena Perera (Patient)',
      email: 'patient@safecare.com',
      password: plainPassword,
      role: 'patient',
      phone: '+94 77 123 4567',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
    });

    console.log('[Seed] Creating Healthcare Facilities...');
    const facilities = await Facility.create([
      {
        name: 'Apex Central General Hospital',
        facilityType: 'Hospital',
        address: '124 Healthcare Boulevard, Ward Place',
        city: 'Colombo',
        contactNumber: '+94 11 269 1111',
        email: 'info@apexcentral.com',
        emergency24x7: true,
        operatingHours: '24/7 All Departments',
        description: 'Premier tertiary care hospital featuring advanced cardiac, trauma, intensive care units, and 24/7 surgical suites.',
        imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop',
        rating: 4.9,
        totalBeds: 350,
        website: 'https://apexcentral.health',
        manager: manager._id,
        createdBy: admin._id
      },
      {
        name: 'Lanka National Heart & Vascular Center',
        facilityType: 'Specialized Care',
        address: '88 Cardiology Way, Cinnamon Gardens',
        city: 'Colombo',
        contactNumber: '+94 11 456 7890',
        email: 'care@lankaheart.org',
        emergency24x7: true,
        operatingHours: '24/7 Specialized Emergency',
        description: 'World-class cardiology hospital with state-of-the-art catheterization labs, cardiac surgery, and emergency vascular interventions.',
        imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop',
        rating: 4.8,
        totalBeds: 180,
        website: 'https://lankaheart.org',
        manager: manager._id,
        createdBy: admin._id
      },
      {
        name: 'Pearl Bay Dental & Orthodontic Institute',
        facilityType: 'Clinic',
        address: '42 Marine Drive, Kollupitiya',
        city: 'Colombo',
        contactNumber: '+94 11 233 4455',
        email: 'appointments@pearlbaydental.com',
        emergency24x7: false,
        operatingHours: '08:00 AM - 08:00 PM',
        description: 'Award-winning specialized dental hospital offering digital smile design, root canal microsurgery, restorative treatments, and emergency dental trauma care.',
        imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop',
        rating: 4.9,
        totalBeds: 20,
        website: 'https://pearlbaydental.com',
        manager: manager._id,
        createdBy: admin._id
      },
      {
        name: 'Highland Regional Medical Center',
        facilityType: 'Hospital',
        address: '15 Peradeniya Road',
        city: 'Kandy',
        contactNumber: '+94 81 222 3344',
        email: 'reception@highlandhealth.lk',
        emergency24x7: true,
        operatingHours: '24/7 Emergency & Inpatient',
        description: 'Comprehensive regional healthcare hub serving central province with extensive pediatric, surgical, orthopedic, and general medicine facilities.',
        imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop',
        rating: 4.7,
        totalBeds: 220,
        website: 'https://highlandhealth.lk',
        manager: manager._id,
        createdBy: admin._id
      },
      {
        name: 'St. Jude Family Health Clinic',
        facilityType: 'Clinic',
        address: '77 Temple Street',
        city: 'Kandy',
        contactNumber: '+94 81 234 5678',
        email: 'contact@stjudeclinic.lk',
        emergency24x7: false,
        operatingHours: '08:30 AM - 07:00 PM',
        description: 'Community-centered family clinic providing routine preventive care, pediatric checkups, vaccination schedules, and chronic disease management.',
        imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop',
        rating: 4.6,
        totalBeds: 15,
        website: 'https://stjudeclinic.lk',
        manager: manager._id,
        createdBy: admin._id
      },
      {
        name: 'Southern Coast Diagnostic & Urgent Care',
        facilityType: 'Medical Center',
        address: '50 Galle Fort Road',
        city: 'Galle',
        contactNumber: '+94 91 224 8899',
        email: 'galle@southerncoastcare.lk',
        emergency24x7: true,
        operatingHours: '24/7 Urgent Care & Laboratory',
        description: 'Modern urgent care and high-definition medical imaging center equipped with 128-slice CT, MRI, ultrasound, and walk-in trauma services.',
        imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop',
        rating: 4.7,
        totalBeds: 45,
        website: 'https://southerncoastcare.lk',
        manager: manager._id,
        createdBy: admin._id
      }
    ]);

    // Update manager's assigned facility
    await User.findByIdAndUpdate(manager._id, { assignedFacility: facilities[0]._id });
    await User.findByIdAndUpdate(staff._id, { assignedFacility: facilities[0]._id });

    console.log('[Seed] Creating Medical Services...');
    const services = await MedicalService.create([
      // Apex Central (Colombo)
      {
        name: 'Emergency Trauma & Resuscitation',
        department: 'Emergency Care',
        facility: facilities[0]._id,
        fees: 7500,
        description: 'Rapid triage, urgent medical stabilization, and immediate trauma resuscitation by board-certified emergency physicians.',
        serviceType: 'Emergency',
        estimatedDuration: 'Immediate',
        isAvailable: true,
        doctorInCharge: 'Dr. Keith Larson',
        createdBy: admin._id
      },
      {
        name: 'Comprehensive General Consultation',
        department: 'General Consultation',
        facility: facilities[0]._id,
        fees: 2500,
        description: 'Thorough health checkup, physical examination, vitals review, and diagnostic prescription.',
        serviceType: 'Consultation',
        estimatedDuration: '30 mins',
        isAvailable: true,
        doctorInCharge: 'Dr. Maya Silva',
        createdBy: admin._id
      },
      {
        name: 'Orthopedic Joint & Fracture Care',
        department: 'Orthopedics',
        facility: facilities[0]._id,
        fees: 8500,
        description: 'Diagnostic casting, orthopedic examination, joint pain management, and surgical consultations.',
        serviceType: 'Outpatient',
        estimatedDuration: '40 mins',
        isAvailable: true,
        doctorInCharge: 'Dr. Sean Ratnayake',
        createdBy: admin._id
      },

      // Lanka National Heart (Colombo)
      {
        name: 'Cardiology Consultation & ECG Analysis',
        department: 'Cardiology',
        facility: facilities[1]._id,
        fees: 6500,
        description: '12-lead ECG, blood pressure assessment, cardiac murmur evaluation, and personalized cardiovascular counseling.',
        serviceType: 'Consultation',
        estimatedDuration: '45 mins',
        isAvailable: true,
        doctorInCharge: 'Dr. Samantha Dias',
        createdBy: admin._id
      },
      {
        name: 'Echocardiogram (2D Echo with Doppler)',
        department: 'Cardiology',
        facility: facilities[1]._id,
        fees: 16500,
        description: 'Advanced ultrasound cardiac imaging assessing ventricular function, valve pathology, and wall motion.',
        serviceType: 'Diagnostic',
        estimatedDuration: '40 mins',
        isAvailable: true,
        doctorInCharge: 'Dr. Samantha Dias',
        createdBy: admin._id
      },
      {
        name: 'Cardiac Emergency & Angioplasty Prep',
        department: 'Emergency Care',
        facility: facilities[1]._id,
        fees: 28000,
        description: 'Emergency cardiac stabilization, STEMI protocol, and rapid cardiac catheterization laboratory activation.',
        serviceType: 'Emergency',
        estimatedDuration: 'Immediate',
        isAvailable: true,
        doctorInCharge: 'Dr. Samantha Dias',
        createdBy: admin._id
      },

      // Pearl Bay Dental (Colombo)
      {
        name: 'Dental Cleaning, Polishing & Scaling',
        department: 'Dental',
        facility: facilities[2]._id,
        fees: 4500,
        description: 'Ultrasonic calculus removal, deep stain polishing, periodontal pocket assessment, and fluoride application.',
        serviceType: 'Outpatient',
        estimatedDuration: '45 mins',
        isAvailable: true,
        doctorInCharge: 'Dr. Nimalka Sen',
        createdBy: admin._id
      },
      {
        name: 'Urgent Dental Pain Relief & Root Canal',
        department: 'Dental',
        facility: facilities[2]._id,
        fees: 18000,
        description: 'Immediate relief for acute pulpitis, localized anesthesia, digital dental X-ray, and precision endodontic therapy.',
        serviceType: 'Outpatient',
        estimatedDuration: '60 mins',
        isAvailable: true,
        doctorInCharge: 'Dr. Nimalka Sen',
        createdBy: admin._id
      },
      {
        name: 'Orthodontic & Invisalign Alignment Review',
        department: 'Dental',
        facility: facilities[2]._id,
        fees: 6000,
        description: '3D digital intraoral scan, malocclusion diagnostic review, and custom orthodontic plan.',
        serviceType: 'Consultation',
        estimatedDuration: '30 mins',
        isAvailable: true,
        doctorInCharge: 'Dr. Nimalka Sen',
        createdBy: admin._id
      },

      // Highland Regional Medical Center (Kandy)
      {
        name: 'Cardiology Evaluation & Stress Test',
        department: 'Cardiology',
        facility: facilities[3]._id,
        fees: 12500,
        description: 'Treadmill stress ECG, cardiovascular risk stratification, and preventive medication titration.',
        serviceType: 'Diagnostic',
        estimatedDuration: '50 mins',
        isAvailable: true,
        doctorInCharge: 'Dr. Rohana Wickrama',
        createdBy: admin._id
      },
      {
        name: 'General Consultation & Routine Vitals',
        department: 'General Consultation',
        facility: facilities[3]._id,
        fees: 2000,
        description: 'Standard outpatient physician consultation for viral infections, allergies, and general ailments.',
        serviceType: 'Consultation',
        estimatedDuration: '25 mins',
        isAvailable: true,
        doctorInCharge: 'Dr. Rohana Wickrama',
        createdBy: admin._id
      },
      {
        name: 'Pediatric Care & Wellness Exam',
        department: 'Pediatrics',
        facility: facilities[3]._id,
        fees: 3500,
        description: 'Developmental milestones assessment, pediatric physical exam, nutrition and immunization guidance.',
        serviceType: 'Outpatient',
        estimatedDuration: '30 mins',
        isAvailable: true,
        doctorInCharge: 'Dr. Anoma Jayawardena',
        createdBy: admin._id
      },

      // St. Jude Family Health Clinic (Kandy)
      {
        name: 'Family Wellness & General Practice',
        department: 'General Consultation',
        facility: facilities[4]._id,
        fees: 1800,
        description: 'Friendly family doctor consultation, chronic illness follow-up, blood pressure monitoring, and health coaching.',
        serviceType: 'Consultation',
        estimatedDuration: '20 mins',
        isAvailable: true,
        doctorInCharge: 'Dr. Jude Anthony',
        createdBy: admin._id
      },
      {
        name: 'Routine Dental Checkup & Cavity Fillings',
        department: 'Dental',
        facility: facilities[4]._id,
        fees: 3500,
        description: 'Composite tooth-colored cavity fillings, oral hygiene examination, and preventive sealants.',
        serviceType: 'Outpatient',
        estimatedDuration: '35 mins',
        isAvailable: true,
        doctorInCharge: 'Dr. Chathuri Alwis',
        createdBy: admin._id
      },

      // Southern Coast (Galle)
      {
        name: 'High-Resolution MRI & CT Diagnostic Scan',
        department: 'Radiology & Imaging',
        facility: facilities[5]._id,
        fees: 38000,
        description: 'Fast, comfortable 1.5T MRI / 128-slice CT scan with rapid radiologist reporting within 2 hours.',
        serviceType: 'Diagnostic',
        estimatedDuration: '45 mins',
        isAvailable: true,
        doctorInCharge: 'Dr. Priyantha Dissanayake',
        createdBy: admin._id
      },
      {
        name: 'Urgent Care Walk-in Service',
        department: 'Emergency Care',
        facility: facilities[5]._id,
        fees: 4500,
        description: 'Walk-in urgent medical care for minor fractures, acute lacerations, fever spikes, and dehydration.',
        serviceType: 'Emergency',
        estimatedDuration: 'Immediate',
        isAvailable: true,
        doctorInCharge: 'Dr. Priyantha Dissanayake',
        createdBy: admin._id
      },
      {
        name: 'Comprehensive Blood Pathology Panel',
        department: 'Laboratory & Diagnostics',
        facility: facilities[5]._id,
        fees: 3200,
        description: 'CBC, lipid profile, fasting blood glucose, liver and kidney function panel with same-day digital results.',
        serviceType: 'Diagnostic',
        estimatedDuration: '15 mins',
        isAvailable: true,
        doctorInCharge: 'Dr. Nilmini Perera',
        createdBy: admin._id
      }
    ]);

    console.log('[Seed] Creating Real-Time Operational Statuses...');
    await FacilityStatus.create([
      {
        facility: facilities[0]._id, // Apex Central (Colombo)
        status: 'Available',
        operatingHours: '24/7 All Units Operational',
        emergencyAvailable: true,
        currentWaitTimeMinutes: 10,
        icuCapacityAvailable: 12,
        notice: 'Emergency triage open. All surgical and outpatient departments running on schedule.',
        departmentAvailability: [
          { department: 'Emergency Care', isAvailable: true, waitMinutes: 5, notes: 'Immediate admission ready' },
          { department: 'General Consultation', isAvailable: true, waitMinutes: 15, notes: 'Walk-ins welcome' },
          { department: 'Orthopedics', isAvailable: true, waitMinutes: 20, notes: 'Physician in session' }
        ],
        updatedBy: staff._id
      },
      {
        facility: facilities[1]._id, // Lanka Heart (Colombo)
        status: 'Available',
        operatingHours: '24/7 Cardiac Emergency',
        emergencyAvailable: true,
        currentWaitTimeMinutes: 15,
        icuCapacityAvailable: 6,
        notice: 'Cardiac emergency triage operating smoothly. Catheterization lab on standby.',
        departmentAvailability: [
          { department: 'Cardiology', isAvailable: true, waitMinutes: 15, notes: 'Specialists attending' },
          { department: 'Emergency Care', isAvailable: true, waitMinutes: 5, notes: 'Priority cardiac reception' }
        ],
        updatedBy: manager._id
      },
      {
        facility: facilities[2]._id, // Pearl Bay Dental (Colombo)
        status: 'Available',
        operatingHours: '08:00 AM - 08:00 PM',
        emergencyAvailable: true,
        currentWaitTimeMinutes: 12,
        icuCapacityAvailable: 0,
        notice: 'Dental operatory suites 1-4 active. Emergency pain treatment available.',
        departmentAvailability: [
          { department: 'Dental', isAvailable: true, waitMinutes: 10, notes: 'Both endodontists available' }
        ],
        updatedBy: admin._id
      },
      {
        facility: facilities[3]._id, // Highland Regional (Kandy)
        status: 'Busy',
        operatingHours: '24/7 Inpatient & Outpatient',
        emergencyAvailable: true,
        currentWaitTimeMinutes: 40,
        icuCapacityAvailable: 2,
        notice: 'High patient inflow in outpatient clinics. Emergency ward remains fully accessible.',
        departmentAvailability: [
          { department: 'General Consultation', isAvailable: true, waitMinutes: 45, notes: 'Expected delay' },
          { department: 'Cardiology', isAvailable: true, waitMinutes: 30, notes: 'Appointments prioritized' },
          { department: 'Pediatrics', isAvailable: true, waitMinutes: 20, notes: 'Pediatrician on floor' }
        ],
        updatedBy: admin._id
      },
      {
        facility: facilities[4]._id, // St. Jude (Kandy)
        status: 'Available',
        operatingHours: '08:30 AM - 07:00 PM',
        emergencyAvailable: false,
        currentWaitTimeMinutes: 10,
        icuCapacityAvailable: 0,
        notice: 'Normal clinic consultations ongoing. Short waiting times.',
        departmentAvailability: [
          { department: 'General Consultation', isAvailable: true, waitMinutes: 10, notes: 'Dr. Anthony available' },
          { department: 'Dental', isAvailable: true, waitMinutes: 15, notes: 'Clinic room 2 open' }
        ],
        updatedBy: admin._id
      },
      {
        facility: facilities[5]._id, // Southern Coast (Galle)
        status: 'Available',
        operatingHours: '24/7 Urgent Care & Diagnostic',
        emergencyAvailable: true,
        currentWaitTimeMinutes: 15,
        icuCapacityAvailable: 4,
        notice: 'Imaging scanners calibrated. Walk-in urgent admissions open.',
        departmentAvailability: [
          { department: 'Emergency Care', isAvailable: true, waitMinutes: 10, notes: 'Fast-track urgent care' },
          { department: 'Radiology & Imaging', isAvailable: true, waitMinutes: 20, notes: 'MRI / CT running' },
          { department: 'Laboratory & Diagnostics', isAvailable: true, waitMinutes: 10, notes: 'Rapid lab active' }
        ],
        updatedBy: admin._id
      }
    ]);

    console.log('[Seed] Creating Sample Care Requests...');
    await CareRequest.create([
      {
        patient: patient._id,
        patientName: 'Elena Perera',
        patientContact: '+94 77 123 4567',
        serviceRequired: 'Urgent dental pain relief and root canal assessment',
        department: 'Dental',
        locationCity: 'Colombo',
        urgency: 'High',
        preferredFacilityType: 'Clinic',
        maxBudget: 20000,
        additionalNotes: 'Severe throbbing molar toothache for the past 24 hours. Prefer clinic near Kollupitiya/Colombo.',
        status: 'Matched',
        selectedFacility: facilities[2]._id
      },
      {
        patient: patient._id,
        patientName: 'Elena Perera',
        patientContact: 'patient@safecare.com',
        serviceRequired: 'Emergency cardiology chest discomfort checkup',
        department: 'Cardiology',
        locationCity: 'Colombo',
        urgency: 'Emergency',
        preferredFacilityType: 'Specialized Care',
        maxBudget: 35000,
        additionalNotes: 'Sudden onset chest tightness and shortness of breath upon exertion. Needs urgent attention.',
        status: 'Pending',
        selectedFacility: facilities[1]._id
      }
    ]);

    console.log('[Seed] Database successfully seeded with rich healthcare data!');
    console.log('--- DEMO CREDENTIALS ---');
    console.log('Admin:    admin@safecare.com    | Password: Password123!');
    console.log('Manager:  manager@safecare.com  | Password: Password123!');
    console.log('Staff:    staff@safecare.com    | Password: Password123!');
    console.log('Patient:  patient@safecare.com  | Password: Password123!');
    console.log('------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
