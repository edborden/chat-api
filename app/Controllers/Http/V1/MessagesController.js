'use strict'

const User = use('App/Models/User')
const Message = use('App/Models/Message')

class MessagesController {
  async create({ request, response }) {
    const { sender_user_id, receiver_user_id, message } = request.all()

    // Verify users exist
    const users = await User.query()
      .whereIn('id', [sender_user_id, receiver_user_id])
      .fetch()

    if (users.rows.length !== 2) {
      return response.status(404).json({
        error_code: '404',
        error_title: 'User(s) Not Found',
        error_message: `Could not find user(s): ${[sender_user_id, receiver_user_id].filter(id =>
          !users.rows.find(user => user.id === id)).join(',')}`
      })
    }

    // Create message
    await Message.create({
      sender_user_id,
      receiver_user_id,
      message
    })

    return response.status(200).json({
      success_code: '200',
      success_title: 'Message Sent',
      success_message: 'Message was sent successfully'
    })
  }

  async index({ request, response }) {
    const { user_id_a, user_id_b } = request.get()

    // Verify users exist
    const users = await User.query()
      .whereIn('id', [user_id_a, user_id_b])
      .fetch()

    if (users.rows.length !== 2) {
      return response.status(404).json({
        error_code: '404',
        error_title: 'User(s) Not Found',
        error_message: `Could not find user(s): ${[user_id_a, user_id_b].filter(id =>
          !users.rows.find(user => user.id === id)).join(',')}`
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
