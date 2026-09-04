import { sendSuccess } from '../utils/apiResponse.js'

export function createAuthController(authService) {
  return {
    register: async (request, response) => sendSuccess(response, await authService.register(request.body), 201),
    login: async (request, response) => sendSuccess(response, await authService.login(request.body)),
    me: async (request, response) => sendSuccess(response, { user: authService.safeUser(request.user) }),
  }
}
