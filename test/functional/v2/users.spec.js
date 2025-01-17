'use strict'

const { test, trait } = use('Test/Suite')('Users V2')
const User = use('App/Models/User')

trait('Test/ApiClient')
trait('Auth/Client')
trait('DatabaseTransactions')

const testUser = {
  email: 'test@example.com',
  password: 'test123',
  first_name: 'Test',
  last_name: 'User'
}

const createTestUsers = async (count) => {
  return Promise.all(
    Array.from({ length: count }, (_, i) => 
      User.create({
        email: `user${i + 1}@example.com`,
        password: 'password123',
        first_name: 'User',
        last_name: `${i + 1}`
      })
    )
  )
}

const makeRequest = async (client, authUser, params) => {
  return client
    .get('/api/v2/users')
    .loginVia(authUser)
    .query(params)
    .end()
}

test('users index returns paginated results', async ({ client, assert }) => {
  const [authUser] = await Promise.all([
    User.create(testUser),
    createTestUsers(5)
  ])

  const response = await makeRequest(client, authUser, { page: 1, limit: 3 })

  response.assertStatus(200)
  assert.equal(response.body.users.length, 3)
  assert.exists(response.body.pagination)
  assert.equal(response.body.pagination.total, 5)
  assert.equal(response.body.pagination.per_page, 3)
  assert.equal(response.body.pagination.current_page, 1)
  assert.equal(response.body.pagination.last_page, 2)
})

test('users index enforces max limit of 50', async ({ client, assert }) => {
  const authUser = await User.create(testUser)

  const response = await makeRequest(client, authUser, { page: 1, limit: 51 })

  response.assertStatus(400)
  assert.equal(response.body.error_code, '400')
  assert.exists(response.body.error_title)
  assert.exists(response.body.error_message)
})

test('users index requires pagination parameters', async ({ client, assert }) => {
  const authUser = await User.create(testUser)

  // Test missing page
  const noPageResponse = await makeRequest(client, authUser, { limit: 10 })

  noPageResponse.assertStatus(400)
  assert.equal(noPageResponse.body.error_code, '400')
  assert.exists(noPageResponse.body.error_message)

  // Test missing limit
  const noLimitResponse = await makeRequest(client, authUser, { page: 1 })

  noLimitResponse.assertStatus(400)
  assert.equal(noLimitResponse.body.error_code, '400')
  assert.exists(noLimitResponse.body.error_message)
})

test('users index handles empty results correctly', async ({ client, assert }) => {
  const authUser = await User.create(testUser)

  const response = await makeRequest(client, authUser, { page: 1, limit: 10 })

  response.assertStatus(200)
  assert.equal(response.body.users.length, 0)
  assert.exists(response.body.pagination)
  assert.equal(response.body.pagination.total, 0)
  assert.equal(response.body.pagination.per_page, 10)
  assert.equal(response.body.pagination.current_page, 1)
  assert.equal(response.body.pagination.last_page, 1)
})

test('users index returns users sorted by creation time', async ({ client, assert }) => {
  const authUser = await User.create(testUser)

  // Create users with different creation times
  const users = [
    {
      email: 'user1@example.com',
      password: 'password123',
      first_name: 'User',
      last_name: '1'
    },
    {
      email: 'user2@example.com',
      password: 'password123',
      first_name: 'User',
      last_name: '2'
    }
  ]

  // Create users with explicit timestamps
  const now = new Date()
  const user1 = await User.create({
    ...users[0],
    created_at: new Date(now.getTime() - 1000) // 1 second ago
  })
  const user2 = await User.create({
    ...users[1],
    created_at: new Date(now.getTime()) // now
  })

  const response = await makeRequest(client, authUser, { page: 1, limit: 10 })

  response.assertStatus(200)
  assert.equal(response.body.users.length, 2)
  // Verify the order is newest first
  assert.equal(response.body.users[0].user_id, user2.id)
  assert.equal(response.body.users[1].user_id, user1.id)
})

test('cannot access users without authentication', async ({ client, assert }) => {
  const response = await client.get('/api/v2/users').query({ page: 1, limit: 10 }).end()

  response.assertStatus(401)
})
