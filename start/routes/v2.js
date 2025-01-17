'use strict'

const Route = use('Route')

Route.group(() => {
  // Auth routes
  Route.post('/register', 'V2/AuthController.register')
  Route.post('/login', 'V2/AuthController.login')
  Route.get('/profile', 'V2/AuthController.profile').middleware(['auth'])

  // User routes
  Route.get('/users', 'V2/UsersController.index')

  // Message routes
  Route.post('/message', 'V2/MessagesController.create')
  Route.get('/messages', 'V2/MessagesController.index')
}).prefix('api/v2')
