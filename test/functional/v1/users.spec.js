'use strict'

const { test, trait, assert } = use('Test/Suite')('Users V1')
const User = use('App/Models/User')

trait('Test/ApiClient')
trait('DatabaseTransactions')

const testUser = {
  email: 'info@giftogram.com',
  password: 'Test123',
  first_name: 'John',
  last_name: 'Doe'
}

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

test('can list all users except requester', async ({ client, assert }) => {
  // Create multiple users
  const users = await Promise.all(testUsers.map(user => User.create(user)))
  const requester = await User.create(testUser)

  const response = await client
    .get('/api/v1/list_all_users')
    .query({ requester_user_id: requester.id })
    .end()

  response.assertStatus(200)
  assert.isArray(response.body.users)
  assert.lengthOf(response.body.users, 2)
  
  // Verify user structure and data
  response.body.users.forEach((user, index) => {
    assert.equal(user.email, testUsers[index].email)
    assert.equal(user.first_name, testUsers[index].first_name)
    assert.equal(user.last_name, testUsers[index].last_name)
    assert.exists(user.user_id)
  })

  // Verify requester is not in the list
  const requesterInList = response.body.users.some(user => user.email === testUser.email)
  assert.isFalse(requesterInList)
})
