'use strict'

const Route = use('Route')

Route.group(() => {
  Route.post('/register', 'V2/AuthController.register')
  Route.post('/login', 'V2/AuthController.login')
  Route.get('/profile', 'V2/AuthController.profile').middleware(['auth'])
  // V2 routes will go here
}).prefix('api/v2')
