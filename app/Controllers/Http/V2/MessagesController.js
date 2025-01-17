'use strict'

const Message = use('App/Models/Message')
const User = use('App/Models/User')

class MessagesController {
  async create({ request, response }) {
    const { sender_user_id, receiver_user_id, message } = request.all()

    // Check if users exist
    const users = await Promise.all([
      User.find(sender_user_id),
      User.find(receiver_user_id)
    ])

    const missingIds = [sender_user_id, receiver_user_id].filter((_, index) => !users[index])
    if (missingIds.length > 0) {
      return response.status(404).json({
        error_code: '404',
        error_title: 'User(s) Not Found',
        error_message: `Could not find user(s): ${missingIds.join(', ')}`
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
    const { user_id_a, user_id_b, page, limit } = request.get()

    // Validate required parameters
    if (!page) {
      return response.status(400).json({
        error_code: '400',
        error_title: 'Invalid Parameters',
        error_message: 'Page number is required'
      })
    }

    if (!limit) {
      return response.status(400).json({
        error_code: '400',
        error_title: 'Invalid Parameters',
        error_message: 'Limit is required'
      })
    }

    // Enforce max limit of 50 messages per page
    if (limit > 50) {
      return response.status(400).json({
        error_code: '400',
        error_title: 'Invalid Parameters',
        error_message: 'Limit cannot exceed 50 messages per page'
      })
    }

    // Check if users exist
    const users = await Promise.all([
      User.find(user_id_a),
      User.find(user_id_b)
    ])

    const missingIds = [user_id_a, user_id_b].filter((_, index) => !users[index])
    if (missingIds.length > 0) {
      return response.status(404).json({
        error_code: '404',
        error_title: 'User(s) Not Found',
        error_message: `Could not find user(s): ${missingIds.join(', ')}`
      })
    }

    // Get messages between these users in chronological order with pagination
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
      .paginate(page, limit)

    // Transform response to match expected format
    const { data, ...pagination } = messages.toJSON()

    // Handle empty results with proper pagination metadata
    const total = pagination.total || 0
    const lastPage = Math.max(Math.ceil(total / limit), 1)
    const from = total ? (page - 1) * limit + 1 : null
    const to = total ? Math.min(page * limit, total) : null

    return response.status(200).json({
      messages: data,
      pagination: {
        total,
        per_page: parseInt(limit),
        current_page: parseInt(page),
        last_page: lastPage,
        from,
        to
      }
    })
  }
}

module.exports = MessagesController
