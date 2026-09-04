import { sendSuccess } from '../utils/apiResponse.js'

export const appointmentController = (service) => ({
  book: async (request, response) => sendSuccess(response, await service.book(request.body, request.user), 201),
  mine: async (request, response) => { const items = await service.mine(request.user.id ?? request.user._id, request.query); return sendSuccess(response, { items, count: items.length }) },
  doctorMine: async (request, response) => { const items = await service.doctorMine(request.user.id ?? request.user._id, request.query); return sendSuccess(response, { items, count: items.length }) },
  adminList: async (request, response) => { const items = await service.adminList(request.query); return sendSuccess(response, { items, count: items.length }) },
  get: async (request, response) => sendSuccess(response, await service.get(request.params.id, request.user)),
  cancel: async (request, response) => sendSuccess(response, await service.cancel(request.params.id, request.user)),
  reschedule: async (request, response) => sendSuccess(response, await service.reschedule(request.params.id, request.body, request.user)),
})
