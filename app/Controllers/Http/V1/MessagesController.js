'use strict'

const User = use('App/Models/User')
const Message = use('App/Models/Message')
const ResponseService = use('App/Services/ResponseService')

class MessagesController {
  async create({ request, response }) {
    const { sender_user_id, receiver_user_id, message } = request.all()

    // Verify users exist
    const users = await User.query()
      .whereIn('id', [sender_user_id, receiver_user_id])
      .fetch()

    if (users.rows.length !== 2) {
      const missingUsers = [sender_user_id, receiver_user_id].filter(id =>
        !users.rows.find(user => user.id === id)
      ).join(',')

      return ResponseService.error(response, {
        code: '404',
        title: 'User(s) Not Found',
        message: `Could not find user(s): ${missingUsers}`
      })
    }

    // Create message
    await Message.create({
      sender_user_id,
      receiver_user_id,
      message
    })

    return ResponseService.success(response, {
      title: 'Message Sent',
      message: 'Message was sent successfully'
    })
  }

  async index({ request, response }) {
    const { user_id_a, user_id_b } = request.get()

    // Verify users exist
    const users = await User.query()
      .whereIn('id', [user_id_a, user_id_b])
      .fetch()

    if (users.rows.length !== 2) {
      const missingUsers = [user_id_a, user_id_b].filter(id =>
        !users.rows.find(user => user.id === id)
      ).join(',')

      return ResponseService.error(response, {
        code: '404',
        title: 'User(s) Not Found',
        message: `Could not find user(s): ${missingUsers}`
      })
    }

    // Get messages between users
    const messages = await Message.query()
      .where(function () {
        this.where(function () {
          this.where('sender_user_id', user_id_a)
            .where('receiver_user_id', user_id_b)
        }).orWhere(function () {
          this.where('sender_user_id', user_id_b)
            .where('receiver_user_id', user_id_a)
        })
      })
      .orderBy('created_at', 'asc')
      .fetch()

    return response.json({
      messages: messages.toJSON()
    })
  }
}

module.exports = MessagesController
