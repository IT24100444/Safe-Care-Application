import mongoose from 'mongoose'
import { ROLE_VALUES, ROLES } from '../constants/roles.js'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254, unique: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ROLE_VALUES, default: ROLES.PATIENT, required: true },
  preferredLanguage: { type: String, enum: ['en', 'si', 'ta'], default: 'en', required: true },
  isActive: { type: Boolean, default: true, required: true },
}, { timestamps: true, versionKey: false })

userSchema.set('toJSON', { transform(document, returned) { returned.id = returned._id.toString(); delete returned._id; delete returned.passwordHash; return returned } })

export default mongoose.model('User', userSchema)
