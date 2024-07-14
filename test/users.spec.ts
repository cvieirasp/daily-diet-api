import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { knex } from '../src/db'
import app from '../src/app'

describe('Users routes', () => {
  beforeAll(async () => {
    await app.ready()
    await knex('users').delete()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be return status 400 if name is empty', async () => {
    const response = await request(app.server)
      .post('/api/users')
      .send({
        name: '',
        email: 'john.doe@mail.com',
      })
      .expect(400)

    expect(response.body.message).toBe('Param name: Must not be an empty value')
  })

  it('should be return status 400 if email is invalid', async () => {
    const response = await request(app.server)
      .post('/api/users')
      .send({
        name: 'John Doe',
        email: 'invalid email',
      })
      .expect(400)

    expect(response.body.message).toBe('Param email: Invalid email')
  })

  it('should be return status 400 if email already exists', async () => {
    await request(app.server)
      .post('/api/users')
      .send({
        name: 'John Doe',
        email: 'john.doe@mail.com',
      })
      .expect(201)

    const response = await request(app.server)
      .post('/api/users')
      .send({
        name: 'John Doe',
        email: 'john.doe@mail.com',
      })
      .expect(400)

    expect(response.body.message).toBe('User with email already exists')
  })

  it('should be return status 500 if throw a error', async () => {
    const db = await import('../src/db')
    vi.spyOn(db, 'knex').mockImplementationOnce(() => {
      throw new Error('Test Error')
    })

    const response = await request(app.server).post('/api/users').send({
      name: 'John Doe',
      email: 'john.doe@mail.com',
    })

    expect(response.status).toBe(500)
    expect(response.body.message).toEqual('Internal server error')
  })

  it('should create a new user with session and return status 201', async () => {
    const response = await request(app.server)
      .post('/api/users')
      .send({
        name: 'Test Name',
        email: 'new@mail.com',
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
