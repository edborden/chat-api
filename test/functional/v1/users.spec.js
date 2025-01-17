'use strict'

const { test, trait } = use('Test/Suite')('Users V1')
const User = use('App/Models/User')

trait('Test/ApiClient')
trait('DatabaseTransactions')

test('can list all users except requester', async ({ client }) => {
  // Create test users
  const users = await Promise.all([
    User.create({
      email: 'user1@example.com',
      password: 'test123',
      first_name: 'User',
      last_name: '1'
    }),
    User.create({
      email: 'user2@example.com',
      password: 'test123',
      first_name: 'User',
      last_name: '2'
    })
  ])

  const response = await client
    .get('/api/v1/users')
    .end()

  response.assertStatus(200)
})
