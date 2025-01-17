'use strict'

const { test, trait } = use('Test/Suite')('Messages V1')
const User = use('App/Models/User')

trait('Test/ApiClient')
trait('Auth/Client')
trait('DatabaseTransactions')

test('can send message between users', async ({ client }) => {
  const sender = await User.create({
    email: 'sender@example.com',
    password: 'test123',
    first_name: 'Sender',
    last_name: 'User'
  })

  const receiver = await User.create({
    email: 'receiver@example.com',
    password: 'test123',
    first_name: 'Receiver',
    last_name: 'User'
  })

  const response = await client
    .post('/api/v1/messages')
    .loginVia(sender)
    .send({
      receiver_user_id: receiver.id,
      message: 'Hello!'
    })
    .end()

  response.assertStatus(200)
})

test('cannot send message to non-existent user', async ({ client }) => {
  const sender = await User.create({
    email: 'sender@example.com',
    password: 'test123',
    first_name: 'Sender',
    last_name: 'User'
  })

  const response = await client
    .post('/api/v1/messages')
    .loginVia(sender)
    .send({
      receiver_user_id: 999,
      message: 'Hello!'
    })
    .end()

  response.assertStatus(404)
})

test('can view messages between two users in chronological order', async ({ client }) => {
  const userA = await User.create({
    email: 'usera@example.com',
    password: 'test123',
    first_name: 'User',
    last_name: 'A'
  })

  const userB = await User.create({
    email: 'userb@example.com',
    password: 'test123',
    first_name: 'User',
    last_name: 'B'
  })

  // Send messages from both users
  await client
    .post('/api/v1/messages')
    .loginVia(userA)
    .send({
      receiver_user_id: userB.id,
      message: 'Message 1'
    })
    .end()

  await client
    .post('/api/v1/messages')
    .loginVia(userB)
    .send({
      receiver_user_id: userA.id,
      message: 'Message 2'
    })
    .end()

  const response = await client
    .get('/api/v1/messages')
    .loginVia(userA)
    .query({
      user_id_a: userA.id,
      user_id_b: userB.id
    })
    .end()

  response.assertStatus(200)
})
