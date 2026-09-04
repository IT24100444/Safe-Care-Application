import mongoose from 'mongoose'
import { CONSULTATION_TYPES, LANGUAGES, SPECIALIZATIONS } from '../constants/domain.js'

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  specialization: { type: String, enum: SPECIALIZATIONS, required: true },
  qualification: { type: String, trim: true, maxlength: 240, default: '' },
  facilityIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HealthcareFacility' }],
  healthServiceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HealthService' }],
  supportedLanguages: [{ type: String, enum: LANGUAGES }],
  consultationType: { type: String, enum: CONSULTATION_TYPES, default: 'IN_PERSON' },
  bio: { type: String, trim: true, maxlength: 2000, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false })
schema.index({ specialization: 1, isActive: 1 })
schema.index({ facilityIds: 1, isActive: 1 })
schema.index({ healthServiceIds: 1, isActive: 1 })
export default mongoose.model('Doctor', schema)
