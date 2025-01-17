'use strict'

const { test, trait, before, after } = use('Test/Suite')('Users V1')
const User = use('App/Models/User')
const Database = use('Database')

trait('Test/ApiClient')
trait('DatabaseTransactions')

before(async () => {
  // Clear users table before each test suite
  await Database.table('users').delete()
})

after(async () => {
  // Clear users table after each test suite
  await Database.table('users').delete()
})

test('can list all users except requester', async ({ client, assert }) => {
  // Clear any existing users
  await Database.table('users').delete()

  // Create test users
  const user1 = await User.create({
    email: 'user1@example.com',
    password: 'password123',
    first_name: 'First1',
    last_name: 'Last1'
  })

  const user2 = await User.create({
    email: 'user2@example.com',
    password: 'password123',
    first_name: 'First2',
    last_name: 'Last2'
  })

  const requester = await User.create({
    email: 'requester@example.com',
    password: 'password123',
    first_name: 'Requester',
    last_name: 'User'
  })

  const response = await client
    .get('/api/v1/list_all_users')
    .query({
      requester_user_id: requester.id
    })
    .end()

  response.assertStatus(200)
  assert.equal(response.body.users.length, 2)
  assert.deepEqual(response.body.users, [
    {
      user_id: user1.id,
      email: user1.email,
      first_name: user1.first_name,
      last_name: user1.last_name
    },
    {
      user_id: user2.id,
      email: user2.email,
      first_name: user2.first_name,
      last_name: user2.last_name
    }
  ])
})
