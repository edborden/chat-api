'use strict'

const User = use('App/Models/User')

class AuthController {
  async register({ request, response }) {
    try {
      const { email, password, username } = request.only([
        'email',
        'password',
        'username'
      ])

      const user = await User.create({
        email,
        password,
        username
      })

      return response.status(201).json({
        message: 'User successfully created',
        data: user
      })
    } catch (error) {
      return response.status(400).json({
        status: 'error',
        message: 'There was a problem creating the user, please try again later.'
      })
    }
  }

  async login({ request, response, auth }) {
    try {
      const { email, password } = request.only(['email', 'password'])
      
      const token = await auth.attempt(email, password)
      
      return response.json({
        status: 'success',
        data: token
      })
    } catch (error) {
      return response.status(400).json({
        status: 'error',
        message: 'Invalid credentials'
      })
    }
  }

  async profile({ response, auth }) {
    try {
      const user = await auth.getUser()
      return response.json({
        status: 'success',
        data: user
      })
    } catch (error) {
      return response.status(401).json({
        status: 'error',
        message: 'You are not authorized!'
      })
    }
  }
}

module.exports = AuthController
