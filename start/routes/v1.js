'use strict'

const Route = use('Route')

Route.group(() => {
  // Auth routes
  Route.post('/register', 'V1/AuthController.register')
  Route.post('/login', 'V1/AuthController.login')
  Route.get('/profile', 'V1/AuthController.profile').middleware(['auth'])

  // Message routes
  Route.get('/view_messages', 'V1/MessagesController.viewMessages')
  Route.post('/send_message', 'V1/MessagesController.sendMessage')
  
  // User routes
  Route.get('/list_all_users', 'V1/UsersController.listAll')
}).prefix('api/v1')
