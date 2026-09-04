import mongoose from 'mongoose'
import { ROLES } from '../constants/roles.js'
import ApiError from '../utils/ApiError.js'

const assertId = (id, label = 'Resource') => { if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'INVALID_ID', `${label} ID is invalid`) }
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const plain = (value) => value?.toObject ? value.toObject() : { ...value }
const identifier = (value) => String(value?.id ?? value?._id)
const referenceView = (value, fields) => Object.fromEntries([['id', identifier(value)], ...fields.filter((key) => value[key] !== undefined).map((key) => [key, value[key]])])
const populatedDoctor = (query) => query.populate([
  { path: 'facilityIds', select: 'name facilityType district address isActive', match: { isActive: true } },
  { path: 'healthServiceIds', select: 'name category isActive', match: { isActive: true } },
])
export const doctorView = (document) => {
  const value = plain(document)
  return { id: identifier(value), name: value.name, specialization: value.specialization, qualification: value.qualification ?? '', supportedLanguages: value.supportedLanguages ?? [], consultationType: value.consultationType, facilities: (value.facilityIds ?? []).filter((item) => item?.isActive !== false).map((item) => referenceView(item, ['name','facilityType','district','address'])), healthServices: (value.healthServiceIds ?? []).filter((item) => item?.isActive !== false).map((item) => referenceView(item, ['name','category'])), bio: value.bio ?? '', isActive: value.isActive }
}
async function assertActiveReferences(Model, ids = [], code, label) {
  ids.forEach((id) => assertId(id, label)); if (await Model.countDocuments({ _id: { $in: ids }, isActive: true }) !== new Set(ids.map(String)).size) throw new ApiError(422, code, `All ${label.toLowerCase()} references must exist and be active`)
}
export function doctorService(DoctorModel, FacilityModel, HealthServiceModel, UserModel) {
  async function validate(data, currentId) {
    if (data.facilityIds) await assertActiveReferences(FacilityModel, data.facilityIds, 'INVALID_FACILITY_REFERENCE', 'Facility')
    if (data.healthServiceIds) await assertActiveReferences(HealthServiceModel, data.healthServiceIds, 'INVALID_SERVICE_REFERENCE', 'Health service')
    if (data.userId) {
      assertId(data.userId, 'User'); const user = await UserModel.findById(data.userId)
      if (!user || user.role !== ROLES.DOCTOR) throw new ApiError(422, 'INVALID_DOCTOR_USER', 'Linked user must exist and have the DOCTOR role')
      const linked = await DoctorModel.findOne({ userId: data.userId, ...(currentId ? { _id: { $ne: currentId } } : {}) })
      if (linked) throw new ApiError(409, 'DOCTOR_USER_ALREADY_LINKED', 'This user is already linked to a doctor profile')
    }
  }
  return {
    async create(data) { await validate(data); try { return doctorView(await DoctorModel.create({ ...data, facilityIds: [...new Set(data.facilityIds)], healthServiceIds: [...new Set(data.healthServiceIds)], supportedLanguages: [...new Set(data.supportedLanguages)], consultationType: 'IN_PERSON', isActive: true })) } catch (error) { if (error?.code === 11000) throw new ApiError(409, 'DOCTOR_USER_ALREADY_LINKED', 'This user is already linked to a doctor profile'); throw error } },
    async list(query) { const filter = { isActive: true }; if (query.specialization) filter.specialization = query.specialization; if (query.facility) { assertId(query.facility, 'Facility'); filter.facilityIds = query.facility } if (query.healthService) { assertId(query.healthService, 'Health service'); filter.healthServiceIds = query.healthService } if (query.language) filter.supportedLanguages = query.language; if (query.name) filter.name = { $regex: escapeRegex(query.name), $options: 'i' }; return (await populatedDoctor(DoctorModel.find(filter))).map(doctorView) },
    async get(id) { assertId(id, 'Doctor'); const value = await populatedDoctor(DoctorModel.findOne({ _id: id, isActive: true })); if (!value) throw new ApiError(404, 'NOT_FOUND', 'Doctor not found'); return doctorView(value) },
    async getOwn(userId) { const value = await populatedDoctor(DoctorModel.findOne({ userId, isActive: true })); if (!value) throw new ApiError(404, 'DOCTOR_PROFILE_NOT_FOUND', 'No active doctor profile is linked to this account'); return doctorView(value) },
    async resolveOwn(userId) { const value = await DoctorModel.findOne({ userId, isActive: true }); if (!value) throw new ApiError(404, 'DOCTOR_PROFILE_NOT_FOUND', 'No active doctor profile is linked to this account'); return value },
    async update(id, data) { assertId(id, 'Doctor'); await validate(data, id); for (const key of ['facilityIds','healthServiceIds','supportedLanguages']) if (data[key]) data[key] = [...new Set(data[key].map(String))]; try { const value = await DoctorModel.findOneAndUpdate({ _id: id, isActive: true }, data, { new: true, runValidators: true }); if (!value) throw new ApiError(404, 'NOT_FOUND', 'Doctor not found'); return doctorView(value) } catch (error) { if (error?.code === 11000) throw new ApiError(409, 'DOCTOR_USER_ALREADY_LINKED', 'This user is already linked to a doctor profile'); throw error } },
    async deactivate(id) { assertId(id, 'Doctor'); const value = await DoctorModel.findOneAndUpdate({ _id: id, isActive: true }, { isActive: false }, { new: true }); if (!value) throw new ApiError(404, 'NOT_FOUND', 'Doctor not found'); return doctorView(value) },
  }
}
