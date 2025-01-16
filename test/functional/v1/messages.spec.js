'use strict'

const { test, trait, assert } = use('Test/Suite')('Messages V1')
const User = use('App/Models/User')

trait('Test/ApiClient')
trait('DatabaseTransactions')

const testUsers = [
  {
    email: 'ppeck@giftogram.com',
    password: 'Test123',
    first_name: 'Preston',
    last_name: 'Peck'
  },
  {
    email: 'jgreen@giftogram.com',
    password: 'Test123',
    first_name: 'Jake',
    last_name: 'Green'
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
    .post('/api/v1/send_message')
    .send(messageData)
    .end()

  response.assertStatus(200)
  assert.equal(response.body.success_code, '200')
  assert.equal(response.body.success_title, 'Message Sent')
  assert.equal(response.body.success_message, 'Message was sent successfully')
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
    .post('/api/v1/send_message')
    .send(messageData)
    .end()

  response.assertStatus(404)
  assert.equal(response.body.error_code, '404')
  assert.equal(response.body.error_title, 'User Not Found')
  assert.equal(response.body.error_message, 'The recipient user does not exist')
})

test('can view messages between two users in chronological order', async ({ client, assert }) => {
  const userA = await User.create(testUsers[0])
  const userB = await User.create(testUsers[1])

  // Define messages to send
  const messages = [
    {
      sender_user_id: userA.id,
      receiver_user_id: userB.id,
      message: 'First message'
    },
    {
      sender_user_id: userB.id,
      receiver_user_id: userA.id,
      message: 'Second message'
    },
    {
      sender_user_id: userA.id,
      receiver_user_id: userB.id,
      message: 'Third message'
    }
  ]

  // Send each message with a small delay to ensure different timestamps
  for (const message of messages) {
    await client
      .post('/api/v1/send_message')
      .send(message)
      .end()
    
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // Get conversation
  const response = await client
    .get('/api/v1/view_messages')
    .query({
      user_id_a: userA.id,
      user_id_b: userB.id
    })
    .end()

  response.assertStatus(200)
  assert.isArray(response.body.messages)
  assert.lengthOf(response.body.messages, 3)
  
  // Verify messages are in chronological order
  response.body.messages.forEach((message, index) => {
    assert.exists(message.message_id)
    assert.exists(message.sender_user_id)
    assert.exists(message.message)
    assert.exists(message.epoch)

    // Verify message content matches original in order
    assert.equal(message.message, messages[index].message)
    assert.equal(message.sender_user_id, messages[index].sender_user_id)

    // Verify timestamps are in ascending order
    if (index > 0) {
      assert.isTrue(
        message.epoch >= response.body.messages[index - 1].epoch,
        'Messages should be in chronological order'
      )
    }
  })
})
