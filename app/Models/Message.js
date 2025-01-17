'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Message extends Model {
  static get primaryKey() {
    return 'message_id'
  }

  sender() {
    return this.belongsTo('App/Models/User', 'sender_user_id', 'id')
  }

  receiver() {
    return this.belongsTo('App/Models/User', 'receiver_user_id', 'id')
  }

  static get computed() {
    return ['epoch']
  }

  getEpoch({ created_at }) {
    return Math.floor(new Date(created_at).getTime() / 1000)
  }
}

module.exports = Message
