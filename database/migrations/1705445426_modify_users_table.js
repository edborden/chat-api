'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ModifyUsersTableSchema extends Schema {
  up () {
    this.table('users', (table) => {
      // Remove username column
      table.dropColumn('username')
      
      // Add first_name and last_name columns
      table.string('first_name', 80).notNullable()
      table.string('last_name', 80).notNullable()
    })
  }

  down () {
    this.table('users', (table) => {
      // Restore username column
      table.string('username', 80).notNullable().unique()
      
      // Remove first_name and last_name columns
      table.dropColumn('first_name')
      table.dropColumn('last_name')
    })
  }
}

module.exports = ModifyUsersTableSchema
