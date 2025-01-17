'use strict'

const { test, trait, before, after } = use('Test/Suite')('Auth V2')
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

const testUser = {
  email: 'test@example.com',
  password: 'Test123',
  first_name: 'John',
  last_name: 'Doe'
}

test('can register a new user', async ({ client, assert }) => {
  // Clear any existing users
  await Database.table('users').delete()

  const response = await client
    .post('/api/v2/register')
    .send(testUser)
    .end()

  response.assertStatus(200)
  assert.equal(response.body.success_code, '200')
  assert.equal(response.body.success_title, 'Registration Successful')
  assert.equal(response.body.success_message, 'User registered successfully')
})

test('cannot register with existing email', async ({ client, assert }) => {
  // Clear any existing users
  await Database.table('users').delete()

  // First registration
  await client
    .post('/api/v2/register')
    .send(testUser)
    .end()

  // Second registration with same email
  const response = await client
    .post('/api/v2/register')
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
    .post('/api/v2/login')
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
    .post('/api/v2/login')
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

test('can get profile with valid token', async ({ client, assert }) => {
  await User.create(testUser)

  const loginResponse = await client
    .post('/api/v2/login')
    .send({
      email: testUser.email,
      password: testUser.password
    })
    .end()

  const token = loginResponse.body.token

  const response = await client
    .get('/api/v2/profile')
    .header('Authorization', `Bearer ${token}`)
    .end()

  response.assertStatus(200)
  assert.equal(response.body.email, testUser.email)
  assert.equal(response.body.first_name, testUser.first_name)
  assert.equal(response.body.last_name, testUser.last_name)
})

test('cannot get profile without token', async ({ client, assert }) => {
  const response = await client
    .get('/api/v2/profile')
    .end()

  response.assertStatus(401)
})
