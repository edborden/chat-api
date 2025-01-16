'use strict'

const { test, trait, assert } = use('Test/Suite')('Auth')
const User = use('App/Models/User')

trait('Test/ApiClient')
trait('DatabaseTransactions')

const testUser = {
  email: 'test@example.com',
  password: 'password123',
  username: 'testuser'
}

test('can register a new user', async ({ client }) => {
  const response = await client
    .post('/api/v1/register')
    .send(testUser)
    .end()

  response.assertStatus(201)
  response.assertJSONSubset({
    data: {
      email: testUser.email,
      username: testUser.username
    }
  })
})

test('cannot register with existing email', async ({ client }) => {
  // First create a user
  await User.create(testUser)

  // Try to create another user with same email
  const response = await client
    .post('/api/v1/register')
    .send(testUser)
    .end()

  response.assertStatus(400)
})

test('can login with correct credentials', async ({ client, assert }) => {
  await User.create(testUser)

  const response = await client
    .post('/api/v1/login')
    .send({
      email: testUser.email,
      password: testUser.password
    })
    .end()

  response.assertStatus(200)
  response.assertJSONSubset({
    status: 'success'
  })
  // Ensure we got a token
  assert.isString(response.body.data.token)
})

test('cannot login with incorrect credentials', async ({ client }) => {
  await User.create(testUser)

  const response = await client
    .post('/api/v1/login')
    .send({
      email: testUser.email,
      password: 'wrongpassword'
    })
    .end()

  response.assertStatus(400)
  response.assertJSONSubset({
    status: 'error'
  })
})

test('can get profile with valid token', async ({ client }) => {
  const user = await User.create(testUser)
  const loginResponse = await client
    .post('/api/v1/login')
    .send({
      email: testUser.email,
      password: testUser.password
    })
    .end()

  const token = loginResponse.body.data.token

  const response = await client
    .get('/api/v1/profile')
    .header('Authorization', `Bearer ${token}`)
    .end()

  response.assertStatus(200)
  response.assertJSONSubset({
    status: 'success',
    data: {
      email: testUser.email,
      username: testUser.username
    }
  })
})

test('cannot get profile without token', async ({ client }) => {
  const response = await client
    .get('/api/v1/profile')
    .end()

  response.assertStatus(401)
})
