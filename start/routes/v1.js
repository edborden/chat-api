'use strict'

const Route = use('Route')

Route.group(() => {
  // Auth routes
  Route.post('register', 'V1/AuthController.register')
  Route.post('login', 'V1/AuthController.login')
  Route.get('profile', 'V1/AuthController.profile').middleware('auth')
}).prefix('api/v1')
