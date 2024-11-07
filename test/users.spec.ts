import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import request from 'supertest'
import app from '../src/app'
import { knex } from '../src/db'

const clearDB = async () => {
  await knex('users').where('email', 'user@mail.com').del()
}

describe('Users routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await clearDB()
  })

  it('should be return status 400 if name is empty', async () => {
    const response = await request(app.server)
      .post('/api/users')
      .send({
        name: '',
        email: 'user@mail.com',
      })
      .expect(400)

    expect(response.body.message).toBe('Param name: Must not be an empty value')
  })

  it('should be return status 400 if email is invalid', async () => {
    const response = await request(app.server)
      .post('/api/users')
      .send({
        name: 'User',
        email: 'invalid_email',
      })
      .expect(400)

    expect(response.body.message).toBe('Param email: Invalid email')
  })

  it('should be return status 400 if email already exists', async () => {
    await request(app.server)
      .post('/api/users')
      .send({
        name: 'User',
        email: 'user@mail.com',
      })
      .expect(201)

    const response = await request(app.server)
      .post('/api/users')
      .send({
        name: 'User',
        email: 'user@mail.com',
      })
      .expect(400)

    expect(response.body.message).toBe('User with email already exists')
  })

  it('should be return status 500 if throw a error', async () => {
    const db = await import('../src/db')
    vi.spyOn(db, 'knex').mockImplementationOnce(() => {
      throw new Error('Error creating user...')
    })

    const response = await request(app.server).post('/api/users').send({
      name: 'User',
      email: 'user@mail.com',
    })

    expect(response.status).toBe(500)
    expect(response.body.message).toEqual('Internal server error')
  })

  it('should create a new user with session and return status 201', async () => {
    const response = await request(app.server)
      .post('/api/users')
      .send({
        name: 'New User',
        email: 'user@mail.com',
      })
      .expect(201)

    const cookies = response.get('Set-Cookie')

    expect(cookies).toEqual(
      expect.arrayContaining([expect.stringContaining('sessionId')]),
    )

    const sessionId = cookies
      ?.find((cookie) => cookie.includes('sessionId'))
      ?.split(';')[0]
      .split('=')[1]

    expect(response.body).toEqual({
      session_id: sessionId,
    })
  })
})
