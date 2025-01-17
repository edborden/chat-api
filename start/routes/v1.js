'use strict'

const Route = use('Route')

Route.group(() => {
  // Auth routes
  Route.post('/register', 'V1/AuthController.register')
  Route.post('/login', 'V1/AuthController.login')

  // Messages routes
  Route.post('/messages', 'V1/MessagesController.create')
  Route.get('/messages', 'V1/MessagesController.index')

  // Users routes
  Route.get('/users', 'V1/UsersController.index')
}).prefix('api/v1')
