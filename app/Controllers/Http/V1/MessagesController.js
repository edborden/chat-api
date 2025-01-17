'use strict'

const Message = use('App/Models/Message')
const User = use('App/Models/User')
const Database = use('Database')

class MessagesController {
  async send_message({ request, response }) {
    const { sender_user_id, receiver_user_id, message } = request.all()

    const { users: [sender, receiver], errorResponse } = await this._checkUsersExist([
      sender_user_id,
      receiver_user_id
    ])

    if (errorResponse) {
      return response.status(404).json(errorResponse)
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

  async view_messages({ request, response }) {
    const { user_id_a, user_id_b } = request.get()

    const { users: [userA, userB], errorResponse } = await this._checkUsersExist([
      user_id_a,
      user_id_b
    ])

    if (errorResponse) {
      return response.status(404).json(errorResponse)
    }

    // Get messages between these users in chronological order
    const messages = await Message
      .query()
      .where(function () {
        this.where(function () {
          this.where('sender_user_id', user_id_a)
          this.where('receiver_user_id', user_id_b)
        })
        .orWhere(function () {
          this.where('sender_user_id', user_id_b)
          this.where('receiver_user_id', user_id_a)
        })
      })
      .orderBy('created_at', 'asc')
      .fetch()

    return response.status(200).json({
      messages: messages.toJSON()
    })
  }

  /**
   * Check if users exist and return error response if they don't
   * @param {number[]} userIds - Array of user IDs to check
   * @returns {Promise<{users: Object[], errorResponse: Object|null}>}
   */
  async _checkUsersExist(userIds) {
    const users = await Promise.all(
      userIds.map(id => User.find(id))
    )

    const missingIds = userIds.filter((_, index) => !users[index])
    const errorResponse = missingIds.length > 0 ? {
      error_code: '404',
      error_title: 'User(s) Not Found',
      error_message: `Could not find user(s): ${missingIds.join(', ')}`
    } : null

    return { users, errorResponse }
  }
}

module.exports = MessagesController
