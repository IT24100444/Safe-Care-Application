import mongoose from 'mongoose'
import { SLOT_DURATIONS } from '../constants/domain.js'

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/
const schema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  facilityId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthcareFacility', required: true },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  startTime: { type: String, required: true, match: timePattern },
  endTime: { type: String, required: true, match: timePattern },
  slotDurationMinutes: { type: Number, enum: SLOT_DURATIONS, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false })
schema.index({ doctorId: 1, date: 1, isActive: 1 })
schema.index({ facilityId: 1, date: 1, isActive: 1 })
export default mongoose.model('DoctorSchedule', schema)
