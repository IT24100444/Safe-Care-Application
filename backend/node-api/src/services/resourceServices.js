import mongoose from 'mongoose'
import ApiError from '../utils/ApiError.js'

const assertId = (id) => { if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'INVALID_ID', 'Resource ID is invalid') }
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const plain = (document) => document?.toObject ? document.toObject() : { ...document }
const identifier = (value) => String(value.id ?? value._id)
const serviceView = (document) => { const value = plain(document); return { id: identifier(value), name: value.name, category: value.category, description: value.description ?? '', isActive: value.isActive, createdAt: value.createdAt, updatedAt: value.updatedAt } }
const facilityView = (document) => { const value = plain(document); return { id: identifier(value), name: value.name, facilityType: value.facilityType, district: value.district, address: value.address, contactNumber: value.contactNumber ?? '', supportedLanguages: value.supportedLanguages ?? [], healthServices: (value.healthServices ?? []).filter((item) => item && item.isActive !== false).map((item) => ({ id: identifier(item), name: item.name, category: item.category })), emergencyAvailable: value.emergencyAvailable, description: value.description ?? '', isActive: value.isActive, createdAt: value.createdAt, updatedAt: value.updatedAt } }

export const healthServiceService = (Model) => ({
  async create(data) { try { return serviceView(await Model.create({ ...data, isActive: true })) } catch (error) { if (error?.code === 11000) throw new ApiError(409, 'DUPLICATE_SERVICE', 'A health service with this name already exists'); throw error } },
  async list(query) { const filter = { isActive: true }; if (query.category) filter.category = query.category; if (query.search) filter.name = { $regex: escapeRegex(query.search), $options: 'i' }; return (await Model.find(filter)).map(serviceView) },
  async get(id) { assertId(id); const item = await Model.findOne({ _id: id, isActive: true }); if (!item) throw new ApiError(404, 'NOT_FOUND', 'Health service not found'); return serviceView(item) },
  async update(id, data) { assertId(id); try { const item = await Model.findOneAndUpdate({ _id: id, isActive: true }, data, { new: true, runValidators: true }); if (!item) throw new ApiError(404, 'NOT_FOUND', 'Health service not found'); return serviceView(item) } catch (error) { if (error?.code === 11000) throw new ApiError(409, 'DUPLICATE_SERVICE', 'A health service with this name already exists'); throw error } },
  async deactivate(id) { assertId(id); const item = await Model.findOneAndUpdate({ _id: id, isActive: true }, { isActive: false }, { new: true }); if (!item) throw new ApiError(404, 'NOT_FOUND', 'Health service not found'); return serviceView(item) },
})

async function assertActiveServices(ServiceModel, ids = []) { ids.forEach(assertId); if (await ServiceModel.countDocuments({ _id: { $in: ids }, isActive: true }) !== new Set(ids).size) throw new ApiError(422, 'INVALID_SERVICE_REFERENCE', 'All health services must exist and be active') }

export const facilityService = (Model, ServiceModel) => ({
  async create(data) { await assertActiveServices(ServiceModel, data.healthServices); return facilityView(await Model.create({ ...data, supportedLanguages: [...new Set(data.supportedLanguages)], isActive: true })) },
  async list(query) { const filter = { isActive: true }; for (const key of ['district', 'facilityType']) if (query[key]) filter[key] = query[key]; if (query.language) filter.supportedLanguages = query.language; if (query.healthService) { assertId(query.healthService); filter.healthServices = query.healthService } if (query.emergencyAvailable !== undefined) filter.emergencyAvailable = query.emergencyAvailable === 'true'; const items = await Model.find(filter).populate({ path: 'healthServices', select: 'name category isActive', match: { isActive: true } }); return items.map(facilityView) },
  async get(id) { assertId(id); const item = await Model.findOne({ _id: id, isActive: true }).populate({ path: 'healthServices', select: 'name category isActive', match: { isActive: true } }); if (!item) throw new ApiError(404, 'NOT_FOUND', 'Facility not found'); return facilityView(item) },
  async update(id, data) { assertId(id); if (data.healthServices) await assertActiveServices(ServiceModel, data.healthServices); if (data.supportedLanguages) data.supportedLanguages = [...new Set(data.supportedLanguages)]; const item = await Model.findOneAndUpdate({ _id: id, isActive: true }, data, { new: true, runValidators: true }); if (!item) throw new ApiError(404, 'NOT_FOUND', 'Facility not found'); return facilityView(item) },
  async deactivate(id) { assertId(id); const item = await Model.findOneAndUpdate({ _id: id, isActive: true }, { isActive: false }, { new: true }); if (!item) throw new ApiError(404, 'NOT_FOUND', 'Facility not found'); return facilityView(item) },
})
