'use strict'

const User = use('App/Models/User')

class UsersController {
  async index({ response }) {
    const users = await User.all()
    return response.json({
      users: users.toJSON()
    })
  }
}

module.exports = UsersController
