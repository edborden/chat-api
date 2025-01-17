'use strict'

const Route = use('Route')

Route.group(() => {
  // Auth routes
  Route.post('/register', 'V1/AuthController.register')
  Route.post('/login', 'V1/AuthController.login')

  // Message routes
  Route.get('/view_messages', 'V1/MessagesController.view_messages')
  Route.post('/send_message', 'V1/MessagesController.send_message')
  
  // User routes
  Route.get('/list_all_users', 'V1/UsersController.list_all_users')
}).prefix('api/v1')
