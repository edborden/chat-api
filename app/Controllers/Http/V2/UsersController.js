'use strict'

const User = use('App/Models/User')
const ResponseService = use('App/Services/ResponseService')

class UsersController {
  /**
   * List all users with pagination, sorted by creation time (newest first)
   * @param {object} ctx - The context object
   * @param {object} ctx.request - The request object
   * @param {object} ctx.response - The response object
   * @param {object} ctx.auth - The auth object
   */
  async index({ request, response, auth }) {
    const { page, limit } = request.get()
    const user = await auth.getUser()

    // Validate pagination parameters
    const validationError = ResponseService.validatePagination(response, { page, limit })
    if (validationError) return validationError

    // Get paginated users, excluding the authenticated user
    const users = await User.query()
      .where('id', '!=', user.id)
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    // Transform response to match expected format
    const { data, ...pagination } = users.toJSON()
    const transformedUsers = data.map(user => ({
      user_id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      created_at: user.created_at
    }))

    return ResponseService.paginatedResponse(response, {
      data: { users: transformedUsers },
      page,
      limit,
      total: pagination.total || 0
    })
  }
}

module.exports = UsersController
