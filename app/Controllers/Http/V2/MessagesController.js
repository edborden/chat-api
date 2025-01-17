'use strict'

const User = use('App/Models/User')
const Message = use('App/Models/Message')

class MessagesController {
  /**
   * Send a message to another user
   * @param {object} ctx - The context object
   * @param {object} ctx.request - The request object
   * @param {object} ctx.response - The response object
   * @param {object} ctx.auth - The auth object
   */
  async create({ request, response, auth }) {
    const { receiver_user_id, message } = request.all()
    const sender = await auth.getUser()

    // Verify receiver exists
    const receiver = await User.find(receiver_user_id)
    if (!receiver) {
      return response.status(404).json({
        error_code: '404',
        error_title: 'User Not Found',
        error_message: `Could not find user: ${receiver_user_id}`
      })
    }

    // Create message
    await Message.create({
      sender_user_id: sender.id,
      receiver_user_id,
      message
    })

    return response.status(200).json({
      success_code: '200',
      success_title: 'Message Sent',
      success_message: 'Message was sent successfully'
    })
  }

  /**
   * Get paginated messages between two users
   * @param {object} ctx - The context object
   * @param {object} ctx.request - The request object
   * @param {object} ctx.response - The response object
   * @param {object} ctx.auth - The auth object
   */
  async index({ request, response, auth }) {
    const { other_user_id, page, limit } = request.get()
    const user = await auth.getUser()

    // Validate required parameters
    if (!page) {
      return response.status(400).json({
        error_code: '400',
        error_message: 'Page number is required'
      })
    }

    if (!limit) {
      return response.status(400).json({
        error_code: '400',
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

    // Verify other user exists
    const otherUser = await User.find(other_user_id)
    if (!otherUser) {
      return response.status(404).json({
        error_code: '404',
        error_title: 'User Not Found',
        error_message: `Could not find user: ${other_user_id}`
      })
    }

    // Get messages between users
    const messages = await Message.query()
      .where(function () {
        this.where(function () {
          this.where('sender_user_id', user.id)
            .where('receiver_user_id', other_user_id)
        }).orWhere(function () {
          this.where('sender_user_id', other_user_id)
            .where('receiver_user_id', user.id)
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
