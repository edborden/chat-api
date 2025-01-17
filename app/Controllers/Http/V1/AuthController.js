'use strict'

const User = use('App/Models/User')

class AuthController {
  async register({ request, response }) {
    try {
      const { email, password, first_name, last_name } = request.only([
        'email',
        'password',
        'first_name',
        'last_name'
      ])

      // Check if user already exists
      const existingUser = await User.findBy('email', email)
      if (existingUser) {
        return response.status(400).json({
          status: 'error',
          message: 'Email already registered'
        })
      }

      const user = await User.create({
        email,
        password,
        first_name,
        last_name
      })

      // For the registration response specifically
      const userData = user.toJSON()
      return response.status(201).json({
        data: {
          user_id: userData.id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name
        }
      })
    } catch (error) {
      console.error('Registration error:', error)
      return response.status(400).json({
        status: 'error',
        message: 'There was a problem creating the user, please try again later.'
      })
    }
  }

  async login({ request, response, auth }) {
    try {
      const { email, password } = request.only(['email', 'password'])
      
      // Generate token and get user
      const token = await auth.attempt(email, password)
      const user = await User.findBy('email', email)
      const userData = user.toJSON()
      
      return response.json({
        data: {
          user_id: userData.id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          token: token.token
        }
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
      const userData = user.toJSON()
      return response.json({
        status: 'success',
        data: {
          user_id: userData.id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name
        }
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
