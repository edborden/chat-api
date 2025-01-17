'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddUsersCreatedAtIndexSchema extends Schema {
  up() {
    this.table('users', table => {
      // Add index for sorting by creation time
      table.index('created_at', 'idx_users_created_at')
    })
  }

  down() {
    this.table('users', table => {
      table.dropIndex('created_at', 'idx_users_created_at')
    })
  }
}

module.exports = AddUsersCreatedAtIndexSchema
