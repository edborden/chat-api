'use strict'

const { test, trait, assert } = use('Test/Suite')('Auth V2')
const User = use('App/Models/User')

trait('Test/ApiClient')
trait('DatabaseTransactions')

const testUser = {
  email: 'info@giftogram.com',
  password: 'Test123',
  first_name: 'John',
  last_name: 'Doe'
}

test('can register a new user', async ({ client, assert }) => {
  const response = await client
    .post('/api/v2/register')
    .send(testUser)
    .end()

  response.assertStatus(201)
  assert.exists(response.body.data.user_id)
  assert.equal(response.body.data.email, testUser.email)
  assert.equal(response.body.data.first_name, testUser.first_name)
  assert.equal(response.body.data.last_name, testUser.last_name)
})

test('cannot register with existing email', async ({ client }) => {
  // First create a user
  await User.create(testUser)

  // Try to create another user with same email
  const response = await client
    .post('/api/v2/register')
    .send(testUser)
    .end()

  response.assertStatus(400)
})

test('can login with correct credentials', async ({ client, assert }) => {
  await User.create(testUser)

  const response = await client
    .post('/api/v2/login')
    .send({
      email: testUser.email,
      password: testUser.password
    })
    .end()

  response.assertStatus(200)
  response.assertJSONSubset({
    status: 'success'
  })
  assert.isString(response.body.data.token)
})

test('cannot login with incorrect credentials', async ({ client }) => {
  await User.create(testUser)

  const response = await client
    .post('/api/v2/login')
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

test('can get profile with valid token', async ({ client, assert }) => {
  const user = await User.create(testUser)
  const loginResponse = await client
    .post('/api/v2/login')
    .send({
      email: testUser.email,
      password: testUser.password
    })
    .end()

  const token = loginResponse.body.data.token

  const response = await client
    .get('/api/v2/profile')
    .header('Authorization', `Bearer ${token}`)
    .end()

  response.assertStatus(200)
  assert.exists(response.body.data.user_id)
  assert.equal(response.body.data.email, testUser.email)
  assert.equal(response.body.data.first_name, testUser.first_name)
  assert.equal(response.body.data.last_name, testUser.last_name)
})

test('cannot get profile without token', async ({ client }) => {
  const response = await client
    .get('/api/v2/profile')
    .end()

  response.assertStatus(401)
})
