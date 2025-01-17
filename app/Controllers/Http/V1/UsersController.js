'use strict'

const User = use('App/Models/User')

class UsersController {
  async listAll({ request, response }) {
    const { requester_user_id } = request.get()

    // Verify requester exists
    const requester = await User.find(requester_user_id)
    if (!requester) {
      return response.status(404).json({
        error_code: '404',
        error_title: 'User Not Found',
        error_message: 'Requester user does not exist'
      })
    }

    // Get all users except requester
    const users = await User
      .query()
      .where('id', '!=', requester_user_id)
      .select(['id', 'email', 'first_name', 'last_name'])
      .fetch()

    // Map the results to match the expected response format
    const mappedUsers = users.toJSON().map(user => ({
      user_id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name
    }))

    return response.status(200).json({
      users: mappedUsers
    })
  }
}

module.exports = UsersController
