'use strict'

const { test, trait } = use('Test/Suite')('Auth V1')
const User = use('App/Models/User')

trait('Test/ApiClient')
trait('DatabaseTransactions')

const testUser = {
  email: 'test@example.com',
  password: 'Test123',
  first_name: 'John',
  last_name: 'Doe'
}

test('can register a new user', async ({ client, assert }) => {
  const response = await client
    .post('/api/v1/register')
    .send(testUser)
    .end()

  response.assertStatus(200)
  assert.equal(response.body.success_code, '200')
  assert.equal(response.body.success_title, 'Registration Successful')
  assert.equal(response.body.success_message, 'User registered successfully')
})

test('cannot register with existing email', async ({ client, assert }) => {
  // First registration
  await client.post('/api/v1/register').send(testUser).end()

  // Second registration with same email
  const response = await client
    .post('/api/v1/register')
    .send(testUser)
    .end()

  response.assertStatus(400)
  assert.equal(response.body.error_code, '400')
  assert.equal(response.body.error_title, 'Registration Failed')
  assert.equal(response.body.error_message, 'Email already exists')
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
  assert.exists(response.body.token)
})

test('cannot login with incorrect credentials', async ({ client, assert }) => {
  await User.create(testUser)

  const response = await client
    .post('/api/v1/login')
    .send({
      email: testUser.email,
      password: 'wrongpassword'
    })
    .end()

  response.assertStatus(401)
  assert.equal(response.body.error_code, '401')
  assert.equal(response.body.error_title, 'Login Failed')
  assert.equal(response.body.error_message, 'Invalid credentials')
})
