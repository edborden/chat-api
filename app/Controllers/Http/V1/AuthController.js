'use strict'

const User = use('App/Models/User')

class AuthController {
  async register({ request, response }) {
    const data = request.only(['email', 'password', 'first_name', 'last_name'])

    // Check if email already exists
    const existingUser = await User.findBy('email', data.email)
    if (existingUser) {
      return response.status(400).json({
        error_code: '400',
        error_title: 'Registration Failed',
        error_message: 'Email already exists'
      })
    }

    // Create user
    await User.create(data)

    return response.status(200).json({
      success_code: '200',
      success_title: 'Registration Successful',
      success_message: 'User registered successfully'
    })
  }

  async login({ request, response, auth }) {
    const { email, password } = request.only(['email', 'password'])

    try {
      const token = await auth.attempt(email, password)
      return response.json(token)
    } catch (error) {
      return response.status(401).json({
        error_code: '401',
        error_title: 'Login Failed',
        error_message: 'Invalid credentials'
      })
    }
  }
}

module.exports = AuthController
