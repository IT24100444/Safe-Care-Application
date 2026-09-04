/**
 * Demo data seed script — npm run seed:demo
 *
 * Creates clearly labeled DEMO records for development and integration testing.
 * Idempotent: uses upsert on stable demo identifiers so it can be run repeatedly.
 *
 * SAFETY:
 *   - Refuses to run when NODE_ENV=production
 *   - Never drops or deletes existing non-demo data
 *   - Uses obvious "Demo" / "Sample" / "Test" names
 *   - Passwords are development-only defaults
 */
import bcrypt from 'bcryptjs'
import { connectDatabase, disconnectDatabase } from '../src/config/database.js'
import { getConfig } from '../src/config/env.js'
import User from '../src/models/User.js'
import HealthService from '../src/models/HealthService.js'
import HealthcareFacility from '../src/models/HealthcareFacility.js'
import Doctor from '../src/models/Doctor.js'
import DoctorSchedule from '../src/models/DoctorSchedule.js'
import Appointment from '../src/models/Appointment.js'

const HASH_COST = 10
const DEMO_PASSWORD = 'Demo1234'  // development-only — never for production

// ─── Helpers ───────────────────────────────────────────────────────────
function futureDate(daysFromNow) {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString().slice(0, 10)
}

async function upsert(Model, filter, data) {
  const result = await Model.findOneAndUpdate(filter, { $setOnInsert: data }, { upsert: true, new: true, rawResult: true })
  return { doc: result.value ?? result, created: result.lastErrorObject?.updatedExisting === false }
}

// ─── Main ──────────────────────────────────────────────────────────────
async function seed() {
  const config = getConfig({ requireDatabase: true })

  if (config.nodeEnv === 'production') {
    console.error('❌  Refusing to seed demo data in production environment.')
    process.exitCode = 1
    return
  }

  await connectDatabase(config.mongoUri)
  console.info('🌱 Seeding demo data...\n')

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, HASH_COST)
  const counts = { created: 0, existing: 0 }
  const track = (result) => { result.created ? counts.created++ : counts.existing++; return result.doc }

  // ── 1. Health Services ─────────────────────────────────────────────
  const services = []
  for (const svc of [
    { name: 'Demo General Medicine', category: 'General', description: 'Demo general practitioner consultations' },
    { name: 'Demo Pediatrics', category: 'Specialist', description: 'Demo child healthcare services' },
    { name: 'Demo Dental Care', category: 'Dental', description: 'Demo dental examination and treatment' },
    { name: 'Demo Mental Health', category: 'Mental Health', description: 'Demo psychiatric and counselling services' },
    { name: 'Demo Cardiology', category: 'Specialist', description: 'Demo heart and cardiovascular care' },
  ]) {
    services.push(track(await upsert(HealthService, { name: svc.name }, { ...svc, isActive: true })))
  }
  console.info(`  HealthServices: ${services.length} (${services.map(s => s.name).join(', ')})`)

  // ── 2. Facilities ──────────────────────────────────────────────────
  const facilities = []
  for (const fac of [
    { name: 'Demo Colombo Medical Centre', facilityType: 'MEDICAL_CENTRE', district: 'Colombo', address: '123 Demo Galle Road, Colombo 03', contactNumber: '+94-11-2000001', supportedLanguages: ['en', 'si', 'ta'], healthServices: [services[0]._id, services[1]._id, services[4]._id], emergencyAvailable: true, description: 'Demo multi-specialty medical centre in Colombo' },
    { name: 'Sample Kandy Family Clinic', facilityType: 'CLINIC', district: 'Kandy', address: '45 Demo Peradeniya Road, Kandy', contactNumber: '+94-81-2000002', supportedLanguages: ['en', 'si'], healthServices: [services[0]._id, services[1]._id], emergencyAvailable: false, description: 'Demo family clinic in Kandy' },
    { name: 'Test Southern Hospital', facilityType: 'HOSPITAL', district: 'Galle', address: '78 Demo Wakwella Road, Galle', contactNumber: '+94-91-2000003', supportedLanguages: ['en', 'si', 'ta'], healthServices: [services[0]._id, services[2]._id, services[3]._id], emergencyAvailable: true, description: 'Demo hospital in Southern Province' },
    { name: 'Demo Jaffna Dental Clinic', facilityType: 'DENTAL_CLINIC', district: 'Jaffna', address: '12 Demo Hospital Road, Jaffna', contactNumber: '+94-21-2000004', supportedLanguages: ['en', 'ta'], healthServices: [services[2]._id], emergencyAvailable: false, description: 'Demo dental clinic in Jaffna' },
  ]) {
    facilities.push(track(await upsert(HealthcareFacility, { name: fac.name }, { ...fac, isActive: true })))
  }
  console.info(`  Facilities:     ${facilities.length} (${facilities.map(f => f.name).join(', ')})`)

  // ── 3. Users (Admin, Doctors, Patient) ─────────────────────────────
  const adminUser = track(await upsert(User, { email: 'demo-admin@careroute.test' }, {
    name: 'Demo Admin', email: 'demo-admin@careroute.test', passwordHash,
    role: 'ADMIN', preferredLanguage: 'en', isActive: true,
  }))
  console.info(`  Admin user:     ${adminUser.email}`)

  const doctorUsers = []
  for (const doc of [
    { name: 'Demo Dr. Perera', email: 'demo-dr-perera@careroute.test' },
    { name: 'Demo Dr. Silva', email: 'demo-dr-silva@careroute.test' },
    { name: 'Demo Dr. Fernando', email: 'demo-dr-fernando@careroute.test' },
  ]) {
    doctorUsers.push(track(await upsert(User, { email: doc.email }, {
      ...doc, passwordHash, role: 'DOCTOR', preferredLanguage: 'en', isActive: true,
    })))
  }
  console.info(`  Doctor users:   ${doctorUsers.length} (${doctorUsers.map(d => d.email).join(', ')})`)

  const patientUser = track(await upsert(User, { email: 'demo-patient@careroute.test' }, {
    name: 'Demo Patient Kumara', email: 'demo-patient@careroute.test', passwordHash,
    role: 'PATIENT', preferredLanguage: 'si', isActive: true,
  }))
  console.info(`  Patient user:   ${patientUser.email}`)

  // ── 4. Doctor profiles ─────────────────────────────────────────────
  const doctors = []
  const doctorProfiles = [
    { userId: doctorUsers[0]._id, name: 'Demo Dr. Perera', specialization: 'GENERAL_PRACTITIONER', qualification: 'MBBS (Demo)', facilityIds: [facilities[0]._id, facilities[1]._id], healthServiceIds: [services[0]._id], supportedLanguages: ['en', 'si'], consultationType: 'IN_PERSON', bio: 'Demo general practitioner with broad experience' },
    { userId: doctorUsers[1]._id, name: 'Demo Dr. Silva', specialization: 'PEDIATRICIAN', qualification: 'MBBS, MD Paediatrics (Demo)', facilityIds: [facilities[0]._id, facilities[1]._id], healthServiceIds: [services[1]._id], supportedLanguages: ['en', 'si', 'ta'], consultationType: 'IN_PERSON', bio: 'Demo pediatrician specializing in child healthcare' },
    { userId: doctorUsers[2]._id, name: 'Demo Dr. Fernando', specialization: 'DENTIST', qualification: 'BDS (Demo)', facilityIds: [facilities[2]._id, facilities[3]._id], healthServiceIds: [services[2]._id], supportedLanguages: ['en', 'ta'], consultationType: 'IN_PERSON', bio: 'Demo dental surgeon' },
  ]
  for (const profile of doctorProfiles) {
    doctors.push(track(await upsert(Doctor, { userId: profile.userId }, { ...profile, isActive: true })))
  }
  console.info(`  Doctor profiles: ${doctors.length}`)

  // ── 5. Doctor Schedules (future dates) ─────────────────────────────
  const scheduleData = [
    { doctorId: doctors[0]._id, facilityId: facilities[0]._id, date: futureDate(1), startTime: '09:00', endTime: '12:00', slotDurationMinutes: 20 },
    { doctorId: doctors[0]._id, facilityId: facilities[0]._id, date: futureDate(2), startTime: '14:00', endTime: '17:00', slotDurationMinutes: 20 },
    { doctorId: doctors[0]._id, facilityId: facilities[1]._id, date: futureDate(3), startTime: '09:00', endTime: '11:00', slotDurationMinutes: 30 },
    { doctorId: doctors[1]._id, facilityId: facilities[0]._id, date: futureDate(1), startTime: '10:00', endTime: '13:00', slotDurationMinutes: 30 },
    { doctorId: doctors[1]._id, facilityId: facilities[1]._id, date: futureDate(2), startTime: '09:00', endTime: '12:00', slotDurationMinutes: 30 },
    { doctorId: doctors[2]._id, facilityId: facilities[2]._id, date: futureDate(1), startTime: '08:00', endTime: '12:00', slotDurationMinutes: 30 },
    { doctorId: doctors[2]._id, facilityId: facilities[3]._id, date: futureDate(3), startTime: '13:00', endTime: '16:00', slotDurationMinutes: 45 },
  ]
  let schedulesCreated = 0
  for (const sched of scheduleData) {
    const result = await upsert(DoctorSchedule,
      { doctorId: sched.doctorId, facilityId: sched.facilityId, date: sched.date, startTime: sched.startTime },
      { ...sched, isActive: true })
    track(result)
    if (result.created) schedulesCreated++
  }
  console.info(`  Schedules:      ${scheduleData.length} total, ${schedulesCreated} newly created`)

  // ── 6. Optional demo appointment ──────────────────────────────────
  const demoAppointment = track(await upsert(Appointment,
    { patientId: patientUser._id, doctorId: doctors[0]._id, appointmentDate: futureDate(1), appointmentTime: '09:00' },
    {
      patientId: patientUser._id, doctorId: doctors[0]._id, facilityId: facilities[0]._id,
      scheduleId: (await DoctorSchedule.findOne({ doctorId: doctors[0]._id, date: futureDate(1) }))?._id,
      appointmentDate: futureDate(1), appointmentTime: '09:00',
      preferredLanguage: 'si', status: 'CONFIRMED', isSlotReserved: true,
    }
  ))
  console.info(`  Appointment:    ${demoAppointment.appointmentDate} @ ${demoAppointment.appointmentTime}`)

  // ── Summary ────────────────────────────────────────────────────────
  console.info(`\n✅ Seed complete. Created: ${counts.created}, Already existing: ${counts.existing}`)
  console.info('\n📋 Demo credentials (development only):')
  console.info(`   Admin:   demo-admin@careroute.test / ${DEMO_PASSWORD}`)
  console.info(`   Doctor:  demo-dr-perera@careroute.test / ${DEMO_PASSWORD}`)
  console.info(`   Doctor:  demo-dr-silva@careroute.test / ${DEMO_PASSWORD}`)
  console.info(`   Doctor:  demo-dr-fernando@careroute.test / ${DEMO_PASSWORD}`)
  console.info(`   Patient: demo-patient@careroute.test / ${DEMO_PASSWORD}`)
}

seed()
  .catch((error) => { console.error(`\n❌ Seed failed: ${error.message}`); process.exitCode = 1 })
  .finally(disconnectDatabase)
