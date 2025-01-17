'use strict'

const { test, trait, beforeEach, afterEach } = use('Test/Suite')('Users V2')
const User = use('App/Models/User')
const Database = use('Database')

trait('Test/ApiClient')
trait('Auth/Client')
trait('DatabaseTransactions')

beforeEach(async () => {
  // Clear users table before each test
  await Database.table('users').delete()
})

afterEach(async () => {
  // Clear users table after each test
  await Database.table('users').delete()
})

const createTestUsers = async (count) => {
  const users = []
  for (let i = 0; i < count; i++) {
    users.push({
      email: `test${i}@example.com`,
      password: 'password123',
      first_name: `First${i}`,
      last_name: `Last${i}`
    })
  }
  return Database.table('users').insert(users)
}

test('users index returns paginated results', async ({ client, assert }) => {
  // Create test users
  const testUser = await User.create({
    email: 'test@example.com',
    password: 'test123',
    first_name: 'Test',
    last_name: 'User'
  })

  // Create 5 additional users
  const users = Array.from({ length: 5 }, (_, i) => ({
    email: `user${i + 1}@example.com`,
    password: 'password123',
    first_name: `User`,
    last_name: `${i + 1}`
  }))

  for (const user of users) {
    await User.create(user)
  }

  const response = await client
    .get('/api/v2/users')
    .loginVia(testUser)
    .query({ page: 1, limit: 3 })
    .end()

  response.assertStatus(200)
  assert.equal(response.body.users.length, 3)
  assert.exists(response.body.pagination)
  assert.equal(response.body.pagination.total, 5) // 5 users excluding the authenticated user
  assert.equal(response.body.pagination.per_page, 3)
  assert.equal(response.body.pagination.current_page, 1)
  assert.equal(response.body.pagination.last_page, 2)
})

test('users index enforces max limit of 50', async ({ client, assert }) => {
  const testUser = await User.create({
    email: 'test@example.com',
    password: 'test123',
    first_name: 'Test',
    last_name: 'User'
  })

  const response = await client
    .get('/api/v2/users')
    .loginVia(testUser)
    .query({ page: 1, limit: 51 })
    .end()

  response.assertStatus(400)
  assert.equal(response.body.error_code, '400')
  assert.exists(response.body.error_title)
  assert.exists(response.body.error_message)
})

test('users index requires pagination parameters', async ({ client, assert }) => {
  const testUser = await User.create({
    email: 'test@example.com',
    password: 'test123',
    first_name: 'Test',
    last_name: 'User'
  })

  // Test missing page
  const noPageResponse = await client
    .get('/api/v2/users')
    .loginVia(testUser)
    .query({ limit: 10 })
    .end()

  noPageResponse.assertStatus(400)
  assert.equal(noPageResponse.body.error_code, '400')
  assert.exists(noPageResponse.body.error_message)

  // Test missing limit
  const noLimitResponse = await client
    .get('/api/v2/users')
    .loginVia(testUser)
    .query({ page: 1 })
    .end()

  noLimitResponse.assertStatus(400)
  assert.equal(noLimitResponse.body.error_code, '400')
  assert.exists(noLimitResponse.body.error_message)
})

test('users index handles empty results correctly', async ({ client, assert }) => {
  const testUser = await User.create({
    email: 'test@example.com',
    password: 'test123',
    first_name: 'Test',
    last_name: 'User'
  })

  const response = await client
    .get('/api/v2/users')
    .loginVia(testUser)
    .query({ page: 2, limit: 10 })
    .end()

  response.assertStatus(200)
  assert.equal(response.body.users.length, 0)
  assert.equal(response.body.pagination.total, 0) // No other users in the system
  assert.equal(response.body.pagination.current_page, 2)
  assert.equal(response.body.pagination.from, null)
  assert.equal(response.body.pagination.to, null)
})

test('users index returns users sorted by creation time', async ({ client, assert }) => {
  const testUser = await User.create({
    email: 'test@example.com',
    password: 'test123',
    first_name: 'Test',
    last_name: 'User'
  })

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

  const response = await client
    .get('/api/v2/users')
    .loginVia(testUser)
    .query({ page: 1, limit: 10 })
    .end()

  response.assertStatus(200)
  assert.equal(response.body.users.length, 2)
  
  // Verify the order is newest first
  assert.equal(response.body.users[0].user_id, user2.id)
  assert.equal(response.body.users[1].user_id, user1.id)
})

test('cannot access users without authentication', async ({ client, assert }) => {
  const response = await client
    .get('/api/v2/users')
    .query({ page: 1, limit: 10 })
    .end()

  response.assertStatus(401)
})
