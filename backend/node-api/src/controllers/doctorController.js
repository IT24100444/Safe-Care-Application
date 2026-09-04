import { sendSuccess } from '../utils/apiResponse.js'

export const doctorController = (service) => ({
  create: async (request, response) => sendSuccess(response, await service.create(request.body), 201),
  list: async (request, response) => { const items = await service.list(request.query); return sendSuccess(response, { items, count: items.length }) },
  get: async (request, response) => sendSuccess(response, await service.get(request.params.id)),
  own: async (request, response) => sendSuccess(response, await service.getOwn(request.user.id ?? request.user._id)),
  update: async (request, response) => sendSuccess(response, await service.update(request.params.id, request.body)),
  deactivate: async (request, response) => sendSuccess(response, await service.deactivate(request.params.id)),
})
export const scheduleController = (service, doctors) => ({
  create: async (request, response) => sendSuccess(response, await service.create(request.body), 201),
  list: async (request, response) => { const items = await service.list(request.query); return sendSuccess(response, { items, count: items.length }) },
  mine: async (request, response) => { const doctor = await doctors.resolveOwn(request.user.id ?? request.user._id); const items = await service.list({}, doctor.id ?? doctor._id); return sendSuccess(response, { items, count: items.length }) },
  get: async (request, response) => sendSuccess(response, await service.get(request.params.id)),
  update: async (request, response) => sendSuccess(response, await service.update(request.params.id, request.body)),
  deactivate: async (request, response) => sendSuccess(response, await service.deactivate(request.params.id)),
  availability: async (request, response) => sendSuccess(response, await service.availability(request.params.doctorId, request.query.date)),
})
