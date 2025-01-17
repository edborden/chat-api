'use strict'

const { test, trait, beforeEach, afterEach } = use('Test/Suite')('Messages V2')
const User = use('App/Models/User')
const Database = use('Database')

trait('Test/ApiClient')
trait('DatabaseTransactions')

beforeEach(async () => {
  // Clear users and messages tables before each test
  await Database.table('messages').delete()
  await Database.table('users').delete()
})

afterEach(async () => {
  // Clear users and messages tables after each test
  await Database.table('messages').delete()
  await Database.table('users').delete()
})

const testUsers = [
  {
    email: 'user1@example.com',
    password: 'Test123',
    first_name: 'User',
    last_name: 'One'
  },
  {
    email: 'user2@example.com',
    password: 'Test123',
    first_name: 'User',
    last_name: 'Two'
  }
]

test('can send message between users', async ({ client, assert }) => {
  const sender = await User.create(testUsers[0])
  const receiver = await User.create(testUsers[1])

  const messageData = {
    sender_user_id: sender.id,
    receiver_user_id: receiver.id,
    message: 'Example text'
  }

  const response = await client
    .post('/api/v2/message')
    .send(messageData)
    .end()

  response.assertStatus(200)
  assert.equal(response.body.success_code, '200')
  assert.equal(response.body.success_title, 'Message Sent')
  assert.equal(response.body.success_message, 'Message was sent successfully')

  // Verify message was saved in database
  const messages = await Database.table('messages')
  assert.equal(messages.length, 1)
  assert.equal(messages[0].sender_user_id, sender.id)
  assert.equal(messages[0].receiver_user_id, receiver.id)
  assert.equal(messages[0].message, 'Example text')
})

test('cannot send message to non-existent user', async ({ client, assert }) => {
  const sender = await User.create(testUsers[0])
  const nonExistentUserId = 99999 // An ID that doesn't exist

  const messageData = {
    sender_user_id: sender.id,
    receiver_user_id: nonExistentUserId,
    message: 'Example text'
  }

  const response = await client
    .post('/api/v2/message')
    .send(messageData)
    .end()

  response.assertStatus(404)
  assert.equal(response.body.error_code, '404')
  assert.equal(response.body.error_title, 'User(s) Not Found')
  assert.equal(response.body.error_message, `Could not find user(s): ${nonExistentUserId}`)

  // Verify no message was saved
  const messages = await Database.table('messages')
  assert.equal(messages.length, 0)
})

test('can view paginated messages between two users in chronological order', async ({ client, assert }) => {
  const userA = await User.create(testUsers[0])
  const userB = await User.create(testUsers[1])

  // Create 6 messages to test pagination
  const messages = Array.from({ length: 6 }, (_, i) => ({
    sender_user_id: i % 2 === 0 ? userA.id : userB.id,
    receiver_user_id: i % 2 === 0 ? userB.id : userA.id,
    message: `Message ${i + 1}`
  }))

  // Send each message with a small delay to ensure different timestamps
  for (const message of messages) {
    await client
      .post('/api/v2/message')
      .send(message)
      .end()
    
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // Get first page of conversation (3 messages per page)
  const firstPageResponse = await client
    .get('/api/v2/messages')
    .query({ 
      user_id_a: userA.id, 
      user_id_b: userB.id,
      page: 1,
      limit: 3
    })
    .end()

  firstPageResponse.assertStatus(200)
  assert.equal(firstPageResponse.body.messages.length, 3)
  assert.equal(firstPageResponse.body.messages[0].message, 'Message 1')
  assert.equal(firstPageResponse.body.messages[2].message, 'Message 3')
  
  // Verify pagination metadata
  assert.equal(firstPageResponse.body.pagination.total, 6)
  assert.equal(firstPageResponse.body.pagination.per_page, 3)
  assert.equal(firstPageResponse.body.pagination.current_page, 1)
  assert.equal(firstPageResponse.body.pagination.last_page, 2)
  assert.equal(firstPageResponse.body.pagination.from, 1)
  assert.equal(firstPageResponse.body.pagination.to, 3)

  // Get second page
  const secondPageResponse = await client
    .get('/api/v2/messages')
    .query({ 
      user_id_a: userA.id, 
      user_id_b: userB.id,
      page: 2,
      limit: 3
    })
    .end()

  secondPageResponse.assertStatus(200)
  assert.equal(secondPageResponse.body.messages.length, 3)
  assert.equal(secondPageResponse.body.messages[0].message, 'Message 4')
  assert.equal(secondPageResponse.body.messages[2].message, 'Message 6')

  // Verify second page pagination metadata
  assert.equal(secondPageResponse.body.pagination.current_page, 2)
  assert.equal(secondPageResponse.body.pagination.from, 4)
  assert.equal(secondPageResponse.body.pagination.to, 6)
})

test('cannot view messages with non-existent user', async ({ client, assert }) => {
  const userA = await User.create(testUsers[0])
  const nonExistentUserId = 99999 // An ID that doesn't exist

  const response = await client
    .get('/api/v2/messages')
    .query({ 
      user_id_a: userA.id, 
      user_id_b: nonExistentUserId,
      page: 1,
      limit: 10
    })
    .end()

  response.assertStatus(404)
  assert.equal(response.body.error_code, '404')
  assert.equal(response.body.error_title, 'User(s) Not Found')
  assert.equal(response.body.error_message, `Could not find user(s): ${nonExistentUserId}`)
})

test('messages index requires pagination parameters', async ({ client, assert }) => {
  const userA = await User.create(testUsers[0])
  const userB = await User.create(testUsers[1])

  // Test missing page
  const noPageResponse = await client
    .get('/api/v2/messages')
    .query({ 
      user_id_a: userA.id, 
      user_id_b: userB.id,
      limit: 10
    })
    .end()

  noPageResponse.assertStatus(400)
  assert.equal(noPageResponse.body.error_code, '400')
  assert.equal(noPageResponse.body.error_message, 'Page number is required')

  // Test missing limit
  const noLimitResponse = await client
    .get('/api/v2/messages')
    .query({ 
      user_id_a: userA.id, 
      user_id_b: userB.id,
      page: 1
    })
    .end()

  noLimitResponse.assertStatus(400)
  assert.equal(noLimitResponse.body.error_code, '400')
  assert.equal(noLimitResponse.body.error_message, 'Limit is required')
})

test('messages index enforces max limit of 50', async ({ client, assert }) => {
  const userA = await User.create(testUsers[0])
  const userB = await User.create(testUsers[1])

  const response = await client
    .get('/api/v2/messages')
    .query({ 
      user_id_a: userA.id, 
      user_id_b: userB.id,
      page: 1,
      limit: 51
    })
    .end()

  response.assertStatus(400)
  assert.equal(response.body.error_code, '400')
  assert.equal(response.body.error_title, 'Invalid Parameters')
  assert.equal(response.body.error_message, 'Limit cannot exceed 50 messages per page')
})
