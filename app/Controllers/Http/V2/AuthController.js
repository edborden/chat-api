'use strict'

const User = use('App/Models/User')
const ResponseService = use('App/Services/ResponseService')

class AuthController {
  async register({ request, response }) {
    const data = request.only(['email', 'password', 'first_name', 'last_name'])

    // Check if email already exists
    const existingUser = await User.findBy('email', data.email)
    if (existingUser) {
      return ResponseService.error(response, {
        code: '400',
        title: 'Registration Failed',
        message: 'Email already exists'
      })
    }

    // Create user
    await User.create(data)

    return ResponseService.success(response, {
      title: 'Registration Successful',
      message: 'User registered successfully'
    })
  }

  async login({ request, response, auth }) {
    const { email, password } = request.only(['email', 'password'])

    try {
      const token = await auth.attempt(email, password)
      return response.json(token)
    } catch (error) {
      return ResponseService.error(response, {
        code: '401',
        title: 'Login Failed',
        message: 'Invalid credentials'
      })
    }
  }
}

module.exports = AuthController
