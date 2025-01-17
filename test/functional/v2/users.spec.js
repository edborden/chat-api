'use strict'

const { test, trait, beforeEach, afterEach } = use('Test/Suite')('Users V2')
const User = use('App/Models/User')
const Database = use('Database')

trait('Test/ApiClient')
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
  // Create 55 test users
  await createTestUsers(55)

  // Create requester user
  const requester = await User.create({
    email: 'requester@example.com',
    password: 'password123',
    first_name: 'Requester',
    last_name: 'User'
  })

  // Request first page with max limit
  const response1 = await client
    .get('/api/v2/users')
    .query({
      requester_user_id: requester.id,
      page: 1,
      limit: 50
    })
    .end()

  response1.assertStatus(200)
  assert.equal(response1.body.users.length, 50)
  assert.equal(response1.body.pagination.total, 55)
  assert.equal(response1.body.pagination.per_page, 50)
  assert.equal(response1.body.pagination.current_page, 1)
  assert.equal(response1.body.pagination.last_page, 2)
  assert.equal(response1.body.pagination.from, 1)
  assert.equal(response1.body.pagination.to, 50)

  // Request second page
  const response2 = await client
    .get('/api/v2/users')
    .query({
      requester_user_id: requester.id,
      page: 2,
      limit: 50
    })
    .end()

  response2.assertStatus(200)
  assert.equal(response2.body.users.length, 5)
  assert.equal(response2.body.pagination.total, 55)
  assert.equal(response2.body.pagination.per_page, 50)
  assert.equal(response2.body.pagination.current_page, 2)
  assert.equal(response2.body.pagination.last_page, 2)
  assert.equal(response2.body.pagination.from, 51)
  assert.equal(response2.body.pagination.to, 55)
})

test('users index enforces max limit of 50', async ({ client, assert }) => {
  const requester = await User.create({
    email: 'requester@example.com',
    password: 'password123',
    first_name: 'Requester',
    last_name: 'User'
  })

  const response = await client
    .get('/api/v2/users')
    .query({
      requester_user_id: requester.id,
      page: 1,
      limit: 100
    })
    .end()

  response.assertStatus(400)
  assert.equal(response.body.error_code, '400')
  assert.equal(response.body.error_title, 'Invalid Parameters')
  assert.equal(response.body.error_message, 'Limit cannot exceed 50 users per page')
})

test('users index requires pagination parameters', async ({ client, assert }) => {
  const requester = await User.create({
    email: 'requester@example.com',
    password: 'password123',
    first_name: 'Requester',
    last_name: 'User'
  })

  // Missing page
  const response1 = await client
    .get('/api/v2/users')
    .query({
      requester_user_id: requester.id,
      limit: 50
    })
    .end()

  response1.assertStatus(400)
  assert.equal(response1.body.error_code, '400')
  assert.equal(response1.body.error_title, 'Invalid Parameters')
  assert.equal(response1.body.error_message, 'Page number is required')

  // Missing limit
  const response2 = await client
    .get('/api/v2/users')
    .query({
      requester_user_id: requester.id,
      page: 1
    })
    .end()

  response2.assertStatus(400)
  assert.equal(response2.body.error_code, '400')
  assert.equal(response2.body.error_title, 'Invalid Parameters')
  assert.equal(response2.body.error_message, 'Limit is required')
})

test('users index handles empty results correctly', async ({ client, assert }) => {
  const requester = await User.create({
    email: 'requester@example.com',
    password: 'password123',
    first_name: 'Requester',
    last_name: 'User'
  })

  const response = await client
    .get('/api/v2/users')
    .query({
      requester_user_id: requester.id,
      page: 1,
      limit: 50
    })
    .end()

  response.assertStatus(200)
  assert.equal(response.body.users.length, 0)
  assert.equal(response.body.pagination.total, 0)
  assert.equal(response.body.pagination.per_page, 50)
  assert.equal(response.body.pagination.current_page, 1)
  assert.equal(response.body.pagination.last_page, 1)
  assert.equal(response.body.pagination.from, null)
  assert.equal(response.body.pagination.to, null)
})

test('users index returns users sorted by creation time', async ({ client, assert }) => {
  // Create users with delays to ensure different timestamps
  const user1 = await User.create({
    email: 'user1@example.com',
    password: 'password123',
    first_name: 'First1',
    last_name: 'Last1'
  })

  // Manually set created_at for each user to ensure different timestamps
  await Database.table('users')
    .where('id', user1.id)
    .update({ created_at: new Date('2025-01-17T10:00:00') })

  const user2 = await User.create({
    email: 'user2@example.com',
    password: 'password123',
    first_name: 'First2',
    last_name: 'Last2'
  })

  await Database.table('users')
    .where('id', user2.id)
    .update({ created_at: new Date('2025-01-17T10:01:00') })

  const requester = await User.create({
    email: 'requester@example.com',
    password: 'password123',
    first_name: 'Requester',
    last_name: 'User'
  })

  await Database.table('users')
    .where('id', requester.id)
    .update({ created_at: new Date('2025-01-17T10:02:00') })

  const response = await client
    .get('/api/v2/users')
    .query({
      requester_user_id: requester.id,
      page: 1,
      limit: 50
    })
    .end()

  response.assertStatus(200)
  assert.equal(response.body.users.length, 2)
  assert.equal(response.body.users[0].user_id, user2.id)
  assert.equal(response.body.users[1].user_id, user1.id)
})
