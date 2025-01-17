'use strict'

const User = use('App/Models/User')
const Message = use('App/Models/Message')
const ResponseService = use('App/Services/ResponseService')

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
      return ResponseService.error(response, {
        code: '404',
        title: 'User Not Found',
        message: `Could not find user: ${receiver_user_id}`
      })
    }

    // Create message
    await Message.create({
      sender_user_id: sender.id,
      receiver_user_id,
      message
    })

    return ResponseService.success(response, {
      title: 'Message Sent',
      message: 'Message was sent successfully'
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

    // Validate pagination parameters
    const validationError = ResponseService.validatePagination(response, { page, limit })
    if (validationError) return validationError

    // Verify other user exists
    const otherUser = await User.find(other_user_id)
    if (!otherUser) {
      return ResponseService.error(response, {
        code: '404',
        title: 'User Not Found',
        message: `Could not find user: ${other_user_id}`
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

    return ResponseService.paginatedResponse(response, {
      data: { messages: data },
      page,
      limit,
      total: pagination.total || 0
    })
  }
}

module.exports = MessagesController
