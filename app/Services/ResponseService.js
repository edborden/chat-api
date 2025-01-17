'use strict'

class ResponseService {
  static success(response, { code = '200', title, message, data = null }) {
    const payload = {
      success_code: code,
      success_title: title,
      success_message: message
    }

    if (data) {
      Object.assign(payload, data)
    }

    return response.status(parseInt(code)).json(payload)
  }

  static error(response, { code = '400', title, message }) {
    return response.status(parseInt(code)).json({
      error_code: code,
      error_title: title,
      error_message: message
    })
  }

  static paginatedResponse(response, { data, page, limit, total }) {
    const lastPage = Math.max(Math.ceil(total / limit), 1)
    const from = total ? (page - 1) * limit + 1 : null
    const to = total ? Math.min(page * limit, total) : null

    return response.status(200).json({
      ...data,
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

  static validatePagination(response, { page, limit, maxLimit = 50 }) {
    if (!page) {
      return this.error(response, {
        title: 'Invalid Parameters',
        message: 'Page number is required'
      })
    }

    if (!limit) {
      return this.error(response, {
        title: 'Invalid Parameters',
        message: 'Limit is required'
      })
    }

    if (limit > maxLimit) {
      return this.error(response, {
        title: 'Invalid Parameters',
        message: `Limit cannot exceed ${maxLimit} items per page`
      })
    }

    return null
  }
}

module.exports = ResponseService
