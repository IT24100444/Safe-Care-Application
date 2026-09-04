import mongoose from 'mongoose'
import { SLOT_DURATIONS } from '../constants/domain.js'
import ApiError from '../utils/ApiError.js'
import { generateTimeSlots, timeToMinutes } from '../utils/timeSlots.js'

const assertId = (id, label = 'Resource') => { if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'INVALID_ID', `${label} ID is invalid`) }
const plain = (value) => value?.toObject ? value.toObject() : { ...value }
const identifier = (value) => String(value && typeof value === 'object' ? value.id ?? value._id : value)
const isDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value ?? '') && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0,10) === value
export const colomboToday = (now = new Date()) => {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}
const ref = (value, fields) => value && typeof value === 'object' && (value._id || value.id) ? Object.fromEntries([['id', identifier(value)], ...fields.filter((key) => value[key] !== undefined).map((key) => [key, value[key]])]) : { id: String(value) }
export const scheduleView = (document) => { const value = plain(document); return { id: identifier(value), doctor: ref(value.doctorId, ['name','specialization']), facility: ref(value.facilityId, ['name','district']), date: value.date, startTime: value.startTime, endTime: value.endTime, slotDurationMinutes: value.slotDurationMinutes, isActive: value.isActive } }
const populated = (query) => query.populate([{ path: 'doctorId', select: 'name specialization isActive' }, { path: 'facilityId', select: 'name district isActive' }])
export function scheduleService(ScheduleModel, DoctorModel, FacilityModel, AppointmentModel, { today = colomboToday } = {}) {
  async function validate(data, currentId) {
    assertId(data.doctorId, 'Doctor'); assertId(data.facilityId, 'Facility')
    const [doctor, facility] = await Promise.all([DoctorModel.findOne({ _id: data.doctorId, isActive: true }), FacilityModel.findOne({ _id: data.facilityId, isActive: true })])
    if (!doctor) throw new ApiError(422, 'INVALID_DOCTOR_REFERENCE', 'Doctor must exist and be active')
    if (!facility) throw new ApiError(422, 'INVALID_FACILITY_REFERENCE', 'Facility must exist and be active')
    if (!(doctor.facilityIds ?? []).map((value) => identifier(value)).includes(String(data.facilityId))) throw new ApiError(422, 'FACILITY_NOT_ASSIGNED', 'Selected facility is not assigned to this doctor')
    if (!isDate(data.date)) throw new ApiError(422, 'INVALID_DATE', 'Date must be a real date in YYYY-MM-DD format')
    if (data.date < today()) throw new ApiError(422, 'PAST_SCHEDULE', 'Schedules cannot be created in the past')
    const start = timeToMinutes(data.startTime); const end = timeToMinutes(data.endTime)
    if (start >= end) throw new ApiError(422, 'INVALID_SCHEDULE_INTERVAL', 'End time must be later than start time')
    if (!SLOT_DURATIONS.includes(Number(data.slotDurationMinutes))) throw new ApiError(422, 'INVALID_SLOT_DURATION', 'Slot duration is not supported')
    const overlap = await ScheduleModel.findOne({ doctorId: data.doctorId, date: data.date, isActive: true, startTime: { $lt: data.endTime }, endTime: { $gt: data.startTime }, ...(currentId ? { _id: { $ne: currentId } } : {}) })
    if (overlap) throw new ApiError(409, 'SCHEDULE_OVERLAP', 'This doctor already has an overlapping schedule during that time')
  }
  return {
    async create(data) { await validate(data); return scheduleView(await ScheduleModel.create({ ...data, slotDurationMinutes: Number(data.slotDurationMinutes), isActive: true })) },
    async list(query, ownDoctorId) { const filter = { isActive: true }; if (ownDoctorId) filter.doctorId = ownDoctorId; else if (query.doctor) { assertId(query.doctor, 'Doctor'); filter.doctorId = query.doctor } if (query.facility) { assertId(query.facility, 'Facility'); filter.facilityId = query.facility } if (query.date) { if (!isDate(query.date)) throw new ApiError(422, 'INVALID_DATE', 'Date must use YYYY-MM-DD'); filter.date = query.date } return (await populated(ScheduleModel.find(filter))).map(scheduleView) },
    async get(id) { assertId(id, 'Schedule'); const value = await populated(ScheduleModel.findOne({ _id: id, isActive: true })); if (!value) throw new ApiError(404, 'NOT_FOUND', 'Schedule not found'); return scheduleView(value) },
    async update(id, data) { assertId(id, 'Schedule'); const existing = await ScheduleModel.findOne({ _id: id, isActive: true }); if (!existing) throw new ApiError(404, 'NOT_FOUND', 'Schedule not found'); const merged = { ...plain(existing), ...data }; await validate(merged, id); const value = await ScheduleModel.findOneAndUpdate({ _id: id, isActive: true }, data, { new: true, runValidators: true }); return scheduleView(value) },
    async deactivate(id) { assertId(id, 'Schedule'); const value = await ScheduleModel.findOneAndUpdate({ _id: id, isActive: true }, { isActive: false }, { new: true }); if (!value) throw new ApiError(404, 'NOT_FOUND', 'Schedule not found'); return scheduleView(value) },
    async availability(doctorId, date) { assertId(doctorId, 'Doctor'); if (!isDate(date)) throw new ApiError(422, 'INVALID_DATE', 'A real date in YYYY-MM-DD format is required'); const doctor = await DoctorModel.findOne({ _id: doctorId, isActive: true }); if (!doctor) throw new ApiError(404, 'NOT_FOUND', 'Doctor not found'); const [schedules,appointments] = await Promise.all([populated(ScheduleModel.find({ doctorId, date, isActive: true })), AppointmentModel ? AppointmentModel.find({ doctorId, appointmentDate: date, isSlotReserved: true }) : []]); const occupied = new Set(appointments.map((item) => item.appointmentTime)); return { doctor: { id: identifier(doctor), name: doctor.name }, date, schedules: schedules.filter((item) => item.facilityId?.isActive !== false).map((item) => { const allSlots = generateTimeSlots(item.startTime, item.endTime, item.slotDurationMinutes); const availableSlots = allSlots.filter((slot) => !occupied.has(slot)); return { ...scheduleView(item), availableSlots, totalSlots: allSlots.length, availableCount: availableSlots.length } }) } },
  }
}
