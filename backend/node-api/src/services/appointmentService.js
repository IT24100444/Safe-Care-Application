import mongoose from 'mongoose'
import { APPOINTMENT_STATUSES, SLOT_RESERVING_STATUSES } from '../constants/domain.js'
import ApiError from '../utils/ApiError.js'
import { colomboToday } from './scheduleService.js'
import { generateTimeSlots } from '../utils/timeSlots.js'

const assertId = (value, label) => { if (!mongoose.isValidObjectId(value)) throw new ApiError(400, 'INVALID_ID', `${label} ID is invalid`) }
const identifier = (value) => String(value && typeof value === 'object' ? value.id ?? value._id : value)
const plain = (value) => value?.toObject ? value.toObject() : { ...value }
const ref = (value, fields) => value && typeof value === 'object' ? Object.fromEntries([['id', identifier(value)], ...fields.filter((key) => value[key] !== undefined).map((key) => [key, value[key]])]) : { id: String(value) }
const realDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value ?? '') && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value
const populated = (query) => query.populate([{ path: 'patientId', select: 'name email preferredLanguage' }, { path: 'doctorId', select: 'name specialization' }, { path: 'facilityId', select: 'name district' }, { path: 'scheduleId', select: 'date startTime endTime slotDurationMinutes' }])
export const appointmentView = (document, { includePatient = false } = {}) => {
  const value = plain(document)
  return { id: identifier(value), ...(includePatient ? { patient: ref(value.patientId, ['name','email','preferredLanguage']) } : {}), doctor: ref(value.doctorId, ['name','specialization']), facility: ref(value.facilityId, ['name','district']), schedule: ref(value.scheduleId, ['date','startTime','endTime','slotDurationMinutes']), appointmentDate: value.appointmentDate, appointmentTime: value.appointmentTime, preferredLanguage: value.preferredLanguage, status: value.status, createdAt: value.createdAt, updatedAt: value.updatedAt }
}
const duplicateConflict = (error) => { if (error?.code === 11000) throw new ApiError(409, 'SLOT_UNAVAILABLE', 'The selected appointment slot is no longer available'); throw error }

export function appointmentService(AppointmentModel, DoctorModel, FacilityModel, ScheduleModel, { today = colomboToday } = {}) {
  async function validateSlot(data, fixedDoctorId) {
    for (const [value,label] of [[data.doctorId,'Doctor'],[data.facilityId,'Facility'],[data.scheduleId,'Schedule']]) assertId(value, label)
    if (fixedDoctorId && String(data.doctorId) !== String(fixedDoctorId)) throw new ApiError(422, 'DOCTOR_CHANGE_NOT_ALLOWED', 'Rescheduling to another doctor is not supported')
    const [doctor,facility,schedule] = await Promise.all([DoctorModel.findOne({ _id: data.doctorId, isActive: true }),FacilityModel.findOne({ _id: data.facilityId, isActive: true }),ScheduleModel.findOne({ _id: data.scheduleId, isActive: true })])
    if (!doctor) throw new ApiError(422, 'INVALID_DOCTOR_REFERENCE', 'Doctor must exist and be active')
    if (!facility) throw new ApiError(422, 'INVALID_FACILITY_REFERENCE', 'Facility must exist and be active')
    if (!(doctor.facilityIds ?? []).map(identifier).includes(String(data.facilityId))) throw new ApiError(422, 'FACILITY_NOT_ASSIGNED', 'Selected facility is not assigned to this doctor')
    if (!schedule) throw new ApiError(422, 'INVALID_SCHEDULE_REFERENCE', 'Schedule must exist and be active')
    if (identifier(schedule.doctorId) !== String(data.doctorId)) throw new ApiError(422, 'SCHEDULE_DOCTOR_MISMATCH', 'Schedule does not belong to the selected doctor')
    if (identifier(schedule.facilityId) !== String(data.facilityId)) throw new ApiError(422, 'SCHEDULE_FACILITY_MISMATCH', 'Schedule does not belong to the selected facility')
    if (!realDate(data.appointmentDate) || data.appointmentDate < today()) throw new ApiError(422, 'INVALID_APPOINTMENT_DATE', 'Appointment date must be a current or future real date')
    if (schedule.date !== data.appointmentDate) throw new ApiError(422, 'SCHEDULE_DATE_MISMATCH', 'Appointment date must match the selected schedule')
    if (!generateTimeSlots(schedule.startTime, schedule.endTime, schedule.slotDurationMinutes).includes(data.appointmentTime)) throw new ApiError(422, 'INVALID_APPOINTMENT_SLOT', 'Appointment time is not a valid slot in the selected schedule')
    return { doctor, facility, schedule }
  }
  async function assertFree(data, excludedId) { const found = await AppointmentModel.findOne({ doctorId: data.doctorId, appointmentDate: data.appointmentDate, appointmentTime: data.appointmentTime, isSlotReserved: true, ...(excludedId ? { _id: { $ne: excludedId } } : {}) }); if (found) throw new ApiError(409, 'SLOT_UNAVAILABLE', 'The selected appointment slot is no longer available') }
  async function owned(id, actor) {
    assertId(id, 'Appointment'); const value = await populated(AppointmentModel.findById(id)); if (!value) throw new ApiError(404, 'NOT_FOUND', 'Appointment not found')
    if (actor.role === 'PATIENT' && identifier(value.patientId) !== identifier(actor)) throw new ApiError(403, 'FORBIDDEN', 'You cannot access this appointment')
    if (actor.role === 'DOCTOR') { const doctor = await DoctorModel.findOne({ userId: identifier(actor), isActive: true }); if (!doctor || identifier(value.doctorId) !== identifier(doctor)) throw new ApiError(403, 'FORBIDDEN', 'You cannot access this appointment') }
    return value
  }
  return {
    async book(data, patient) { await validateSlot(data); await assertFree(data); try { return appointmentView(await AppointmentModel.create({ doctorId: data.doctorId, facilityId: data.facilityId, scheduleId: data.scheduleId, appointmentDate: data.appointmentDate, appointmentTime: data.appointmentTime, preferredLanguage: data.preferredLanguage, patientId: identifier(patient), status: 'CONFIRMED', isSlotReserved: true })) } catch (error) { duplicateConflict(error) } },
    async mine(patientId, query) { const filter = { patientId }; if (query.status) filter.status = query.status; if (query.upcoming === 'true') { filter.appointmentDate = { $gte: today() }; filter.status = { $in: SLOT_RESERVING_STATUSES } } return (await populated(AppointmentModel.find(filter))).map((value) => appointmentView(value)) },
    async doctorMine(userId, query) { const doctor = await DoctorModel.findOne({ userId, isActive: true }); if (!doctor) throw new ApiError(404, 'DOCTOR_PROFILE_NOT_FOUND', 'No active doctor profile is linked to this account'); const filter = { doctorId: identifier(doctor) }; if (query.status) filter.status = query.status; if (query.date) filter.appointmentDate = query.date; return (await populated(AppointmentModel.find(filter))).map((value) => appointmentView(value, { includePatient: true })) },
    async adminList(query) { const filter = {}; for (const [input,field] of [['doctor','doctorId'],['facility','facilityId']]) if (query[input]) { assertId(query[input], input); filter[field] = query[input] } if (query.date) filter.appointmentDate = query.date; if (query.status) filter.status = query.status; return (await populated(AppointmentModel.find(filter))).map((value) => appointmentView(value, { includePatient: true })) },
    async get(id, actor) { return appointmentView(await owned(id, actor), { includePatient: actor.role !== 'PATIENT' }) },
    async cancel(id, actor) { const current = await owned(id, actor); if (!['PATIENT','ADMIN'].includes(actor.role)) throw new ApiError(403, 'FORBIDDEN', 'You cannot cancel this appointment'); if (current.status === 'CANCELLED') throw new ApiError(409, 'ALREADY_CANCELLED', 'Appointment is already cancelled'); if (current.status === 'COMPLETED') throw new ApiError(409, 'APPOINTMENT_COMPLETED', 'A completed appointment cannot be cancelled'); const value = await AppointmentModel.findOneAndUpdate({ _id: id, status: { $in: SLOT_RESERVING_STATUSES } }, { status: 'CANCELLED', isSlotReserved: false }, { new: true, runValidators: true }); if (!value) throw new ApiError(409, 'APPOINTMENT_NOT_ACTIVE', 'Appointment is not active'); return appointmentView(value) },
    async reschedule(id, data, patient) { const current = await owned(id, patient); if (patient.role !== 'PATIENT') throw new ApiError(403, 'FORBIDDEN', 'Only the patient may reschedule this appointment'); if (!SLOT_RESERVING_STATUSES.includes(current.status)) throw new ApiError(409, 'APPOINTMENT_NOT_ACTIVE', 'Only an active appointment can be rescheduled'); const doctorId = identifier(current.doctorId); const next = { ...data, doctorId }; await validateSlot(next, doctorId); await assertFree(next, id); try { const value = await AppointmentModel.findOneAndUpdate({ _id: id, patientId: identifier(patient), status: { $in: SLOT_RESERVING_STATUSES } }, { doctorId, facilityId: data.facilityId, scheduleId: data.scheduleId, appointmentDate: data.appointmentDate, appointmentTime: data.appointmentTime, preferredLanguage: data.preferredLanguage ?? current.preferredLanguage, status: 'CONFIRMED', isSlotReserved: true }, { new: true, runValidators: true }); if (!value) throw new ApiError(409, 'APPOINTMENT_NOT_ACTIVE', 'Appointment is no longer active'); return appointmentView(value) } catch (error) { duplicateConflict(error) } },
    statuses: APPOINTMENT_STATUSES,
  }
}
