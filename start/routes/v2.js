'use strict'

const Route = use('Route')

Route.group(() => {
  // Auth routes (no auth required)
  Route.post('/register', 'V2/AuthController.register')
  Route.post('/login', 'V2/AuthController.login')

  // Protected routes (auth required)
  Route.get('/users', 'V2/UsersController.index').middleware(['auth'])
  Route.post('/message', 'V2/MessagesController.create').middleware(['auth'])
  Route.get('/messages', 'V2/MessagesController.index').middleware(['auth'])
}).prefix('api/v2')
