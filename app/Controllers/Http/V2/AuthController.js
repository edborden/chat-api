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
          error_code: '400',
          error_title: 'Registration Failed',
          error_message: 'Email already exists'
        })
      }

      const user = await User.create({
        email,
        password,
        first_name,
        last_name
      })

      return response.status(200).json({
        success_code: '200',
        success_title: 'Registration Successful',
        success_message: 'User registered successfully'
      })
    } catch (error) {
      console.error('Registration error:', error)
      return response.status(400).json({
        error_code: '400',
        error_title: 'Registration Failed',
        error_message: 'There was a problem creating the user, please try again later.'
      })
    }
  }

  async login({ request, response, auth }) {
    try {
      const { email, password } = request.only(['email', 'password'])
      
      // Generate token
      const token = await auth.attempt(email, password)
      
      return response.json({
        token: token.token
      })
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
