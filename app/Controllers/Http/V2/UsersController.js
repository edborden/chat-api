'use strict'

const User = use('App/Models/User')

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

    // Validate required parameters
    if (!page) {
      return response.status(400).json({
        error_code: '400',
        error_title: 'Invalid Parameters',
        error_message: 'Page number is required'
      })
    }

    if (!limit) {
      return response.status(400).json({
        error_code: '400',
        error_title: 'Invalid Parameters',
        error_message: 'Limit is required'
      })
    }

    // Enforce max limit of 50 users per page
    if (limit > 50) {
      return response.status(400).json({
        error_code: '400',
        error_title: 'Invalid Parameters',
        error_message: 'Limit cannot exceed 50 users per page'
      })
    }

    // Get paginated users, excluding the authenticated user
    const users = await User
      .query()
      .where('id', '!=', user.id)
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    // Transform response to match expected format
    const { data, ...pagination } = users.toJSON()

    // Handle empty results with proper pagination metadata
    const total = pagination.total || 0
    const lastPage = Math.max(Math.ceil(total / limit), 1)
    const from = total ? (page - 1) * limit + 1 : null
    const to = total ? Math.min(page * limit, total) : null

    return response.status(200).json({
      users: data.map(user => ({
        user_id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        created_at: user.created_at
      })),
      pagination: {
        total,
        per_page: parseInt(limit),
        current_page: parseInt(page),
        last_page: lastPage,
        from,
        to
      }
    })
  }
}

module.exports = UsersController
