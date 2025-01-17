'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MessagesTableSchema extends Schema {
  up() {
    this.create('messages', table => {
      table.increments('message_id').primary()
      table
        .integer('sender_user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('receiver_user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.text('message').notNullable()
      table.timestamps()
    })
  }

  down() {
    this.drop('messages')
  }
}

module.exports = MessagesTableSchema
