import mongoose from 'mongoose'
import { APPOINTMENT_STATUSES, LANGUAGES } from '../constants/domain.js'

const schema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  facilityId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthcareFacility', required: true },
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorSchedule', required: true },
  appointmentDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  appointmentTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  preferredLanguage: { type: String, enum: LANGUAGES, required: true },
  status: { type: String, enum: APPOINTMENT_STATUSES, default: 'CONFIRMED', required: true },
  isSlotReserved: { type: Boolean, default: true, required: true, select: false },
}, { timestamps: true, versionKey: false })
schema.index({ doctorId: 1, appointmentDate: 1, appointmentTime: 1 }, { unique: true, partialFilterExpression: { isSlotReserved: true }, name: 'unique_reserved_doctor_slot' })
schema.index({ doctorId: 1, appointmentDate: 1, status: 1 })
schema.index({ facilityId: 1, appointmentDate: 1, status: 1 })
export default mongoose.model('Appointment', schema)
