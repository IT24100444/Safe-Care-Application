import ApiError from './ApiError.js'

export const timeToMinutes = (value) => {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value ?? '')) throw new ApiError(422, 'INVALID_TIME', 'Time must use HH:mm in 24-hour format')
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}
export function generateTimeSlots(startTime, endTime, duration) {
  const start = timeToMinutes(startTime); const end = timeToMinutes(endTime)
  if (!Number.isInteger(duration) || duration <= 0 || start >= end) throw new ApiError(422, 'INVALID_SCHEDULE_INTERVAL', 'Schedule interval and slot duration must be valid')
  const slots = []
  for (let value = start; value + duration <= end; value += duration) slots.push(`${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`)
  return slots
}
