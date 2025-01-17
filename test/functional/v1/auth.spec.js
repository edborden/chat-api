'use strict'

const { test, trait, before, after } = use('Test/Suite')('Auth V1')
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

test('can register a new user', async ({ client, assert }) => {
  // Clear any existing users
  await Database.table('users').delete()

  const response = await client
    .post('/api/v1/register')
    .send({
      email: 'test@example.com',
      password: 'Test123',
      first_name: 'John',
      last_name: 'Doe'
    })
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
    .post('/api/v1/register')
    .send({
      email: 'test@example.com',
      password: 'Test123',
      first_name: 'John',
      last_name: 'Doe'
    })
    .end()

  // Second registration with same email
  const response = await client
    .post('/api/v1/register')
    .send({
      email: 'test@example.com',
      password: 'Test123',
      first_name: 'John',
      last_name: 'Doe'
    })
    .end()

  response.assertStatus(400)
  assert.equal(response.body.error_code, '400')
  assert.equal(response.body.error_title, 'Registration Failed')
  assert.equal(response.body.error_message, 'Email already exists')
})

test('can login with correct credentials', async ({ client, assert }) => {
  await User.create({
    email: 'test@example.com',
    password: 'Test123',
    first_name: 'John',
    last_name: 'Doe'
  })

  const response = await client
    .post('/api/v1/login')
    .send({
      email: 'test@example.com',
      password: 'Test123'
    })
    .end()

  response.assertStatus(200)
  assert.exists(response.body.token)
})

test('cannot login with incorrect credentials', async ({ client, assert }) => {
  await User.create({
    email: 'test@example.com',
    password: 'Test123',
    first_name: 'John',
    last_name: 'Doe'
  })

  const response = await client
    .post('/api/v1/login')
    .send({
      email: 'test@example.com',
      password: 'wrongpassword'
    })
    .end()

  response.assertStatus(401)
  assert.equal(response.body.error_code, '401')
  assert.equal(response.body.error_title, 'Login Failed')
  assert.equal(response.body.error_message, 'Invalid credentials')
})
