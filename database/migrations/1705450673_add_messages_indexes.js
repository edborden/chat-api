'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddMessagesIndexesSchema extends Schema {
  up () {
    this.table('messages', (table) => {
      // Add composite index for faster message lookups between users
      table.index(['sender_user_id', 'receiver_user_id', 'created_at'], 'idx_messages_users_time')
    })
  }

  down () {
    this.table('messages', (table) => {
      // Remove only the composite index since the foreign key indexes are managed by MySQL
      table.dropIndex(['sender_user_id', 'receiver_user_id', 'created_at'], 'idx_messages_users_time')
    })
  }
}

module.exports = AddMessagesIndexesSchema
