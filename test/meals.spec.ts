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

let sessionId: string | undefined

const clearMeals = async () => {
  await knex('meals').del()
}

const clearDB = async () => {
  await clearMeals()
  await knex('users').where('email', 'john.doe@mail.com').del()
}

const createUser = async () => {
  const response = await request(app.server)
    .post('/api/users')
    .send({
      name: 'John Doe',
      email: 'john.doe@mail.com',
    })
    .expect(201)

  const cookies = response.get('Set-Cookie')

  expect(cookies).toEqual(
    expect.arrayContaining([expect.stringContaining('sessionId')]),
  )

  sessionId = cookies
    ?.find((cookie) => cookie.includes('sessionId'))
    ?.split(';')[0]
    .split('=')[1]
}

type mealModel = {
  name: string
  description: string
  meal_date: string
  on_diet: boolean
}

const createMeal = async ({
  name,
  description,
  meal_date,
  on_diet,
}: mealModel) => {
  const response = await request(app.server)
    .post('/api/meals')
    .send({
      name,
      description,
      meal_date,
      on_diet,
    })
    .set('Cookie', `sessionId=${sessionId}`)

  return response.body
}

describe('Meals routes', () => {
  beforeAll(async () => {
    await clearDB()
    await app.ready()
    await createUser()
  })

  afterAll(async () => {
    await clearDB()
    await app.close()
  })

  beforeEach(async () => {
    await clearMeals()
  })

  // Create meal tests

  it('should be return status 401 if user is not authorized to create a meal', async () => {
    const response = await request(app.server)
      .post('/api/meals')
      .send({
        name: 'Minha refeição favorita',
        description: 'Descrição da minha refeição favorita',
        meal_date: '2024-01-01T10:00:00.000Z',
        on_diet: true,
      })
      .expect(401)

    expect(response.body.message).toBe('Unauthorized')
  })

  it('should be return status 401 if user is not found on meal creating', async () => {
    const response = await request(app.server)
      .post('/api/meals')
      .send({
        name: 'Minha refeição favorita',
        description: 'Descrição da minha refeição favorita',
        meal_date: '2024-01-01T10:00:00.000Z',
        on_diet: true,
      })
      .set('Cookie', 'sessionId=00000000-0000-0000-0000-000000000000')
      .expect(401)

    expect(response.body.message).toBe('Unauthorized')
  })

  it('should be return status 400 if name is empty', async () => {
    const response = await request(app.server)
      .post('/api/meals')
      .send({
        name: '',
        description: 'Descrição da minha refeição favorita',
        meal_date: '2024-01-01T10:00:00.000Z',
        on_diet: true,
      })
      .set('Cookie', `sessionId=${sessionId}`)
      .expect(400)

    expect(response.body.message).toBe('Param name: Must not be an empty value')
  })

  it('should be return status 400 if description is empty', async () => {
    const response = await request(app.server)
      .post('/api/meals')
      .send({
        name: 'Minha refeição favorita',
        description: '',
        meal_date: '2024-01-01T10:00:00.000Z',
        on_diet: true,
      })
      .set('Cookie', `sessionId=${sessionId}`)
      .expect(400)

    expect(response.body.message).toBe(
      'Param description: Must not be an empty value',
    )
  })

  it('should be return status 400 if meal_date is is an invalid date', async () => {
    const response = await request(app.server)
      .post('/api/meals')
      .send({
        name: 'Minha refeição favorita',
        description: 'Descrição da minha refeição favorita',
        meal_date: 'invalid_date',
        on_diet: true,
      })
      .set('Cookie', `sessionId=${sessionId}`)
      .expect(400)

    expect(response.body.message).toBe('Param meal_date: Invalid date')
  })

  it('should be return status 400 if on_diet is an invalid boolean', async () => {
    const response = await request(app.server)
      .post('/api/meals')
      .send({
        name: 'Minha refeição favorita',
        description: 'Descrição da minha refeição favorita',
        meal_date: '2024-01-01T10:00:00.000Z',
        on_diet: 'invalid_boolean',
      })
      .set('Cookie', `sessionId=${sessionId}`)
      .expect(400)

    expect(response.body.message).toBe(
      'Param on_diet: Expected boolean, received string',
    )
  })

  it('should be return status 500 if throw a error on meal creating', async () => {
    const db = await import('../src/db')
    vi.spyOn(db, 'knex').mockImplementationOnce(() => {
      throw new Error('Error creating meal...')
    })

    const response = await request(app.server)
      .post('/api/meals')
      .send({
        name: 'Minha refeição favorita',
        description: 'Descrição da minha refeição favorita',
        meal_date: '2024-01-01T10:00:00.000Z',
        on_diet: true,
      })
      .set('Cookie', `sessionId=${sessionId}`)

    expect(response.status).toBe(500)
    expect(response.body.message).toEqual('Internal server error')
  })

  it('should create a new meal with user reference and return status 201', async () => {
    const response = await request(app.server)
      .post('/api/meals')
      .send({
        name: 'Minha refeição favorita',
        description: 'Descrição da minha refeição favorita',
        meal_date: '2024-01-01T10:00:00.000Z',
        on_diet: true,
      })
      .set('Cookie', `sessionId=${sessionId}`)
      .expect(201)

    expect(response.body).toEqual({
      id: expect.any(String),
      user_id: expect.any(String),
      name: 'Minha refeição favorita',
      description: 'Descrição da minha refeição favorita',
      meal_date: '2024-01-01T10:00:00.000Z',
      on_diet: true,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    })
  })

  // Update meal tests

  it('should be return status 401 if user is not authorized to update a meal', async () => {
    const response = await request(app.server)
      .patch('/api/meals/00000000-0000-0000-0000-000000000000')
      .send({
        name: 'Minha refeição favorita',
        description: 'Descrição da minha refeição favorita',
        meal_date: '2024-01-01T10:00:00.000Z',
        on_diet: true,
      })
      .expect(401)

    expect(response.body.message).toBe('Unauthorized')
  })

  it('should be return status 401 if user is not found on meal update', async () => {
    const response = await request(app.server)
      .patch('/api/meals/00000000-0000-0000-0000-000000000000')
      .send({
        name: 'Minha refeição favorita',
        description: 'Descrição da minha refeição favorita',
        meal_date: '2024-01-01T10:00:00.000Z',
        on_diet: true,
      })
      .set('Cookie', 'sessionId=00000000-0000-0000-0000-000000000000')
      .expect(401)

    expect(response.body.message).toBe('Unauthorized')
  })

  it('should be return status 404 if meal is not found on meal updating', async () => {
    const response = await request(app.server)
      .patch('/api/meals/00000000-0000-0000-0000-000000000000')
      .send({
        name: 'Minha refeição favorita',
        description: 'Descrição da minha refeição favorita',
        meal_date: '2024-01-01T10:00:00.000Z',
        on_diet: true,
      })
      .set('Cookie', `sessionId=${sessionId}`)
      .expect(404)

    expect(response.body.message).toBe('Meal not found')
  })

  it('should be return status 500 if throw a error on meal updating', async () => {
    const db = await import('../src/db')
    vi.spyOn(db, 'knex').mockImplementationOnce(() => {
      throw new Error('Error updating meal...')
    })

    const response = await request(app.server)
      .patch('/api/meals/00000000-0000-0000-0000-000000000000')
      .send({
        name: 'Minha refeição favorita',
        description: 'Descrição da minha refeição favorita',
        meal_date: '2024-01-01T10:00:00.000Z',
        on_diet: true,
      })
      .set('Cookie', `sessionId=${sessionId}`)

    expect(response.status).toBe(500)
    expect(response.body.message).toEqual('Internal server error')
  })

  it('should update a existing meal from user and return status 204', async () => {
    const createdMeal = await createMeal({
      name: 'Lunch',
      description: 'Descrição do almoço',
      meal_date: '2024-01-01T12:00:00.000Z',
      on_diet: false,
    })

    await request(app.server)
      .patch(`/api/meals/${createdMeal.id}`)
      .send({
        name: 'Minha refeição favorita - updated',
        description: 'Descrição da minha refeição favorita - updated',
        meal_date: '2024-01-01T05:00:00.000Z',
        on_diet: true,
      })
      .set('Cookie', `sessionId=${sessionId}`)
      .expect(204)
  })

  // Delete meal tests

  it('should be return status 401 if user is not authorized to delete a meal', async () => {
    const response = await request(app.server)
      .delete('/api/meals/00000000-0000-0000-0000-000000000000')
      .expect(401)

    expect(response.body.message).toBe('Unauthorized')
  })

  it('should be return status 401 if user is not found on meal deleting', async () => {
    const response = await request(app.server)
      .delete('/api/meals/00000000-0000-0000-0000-000000000000')
      .set('Cookie', 'sessionId=00000000-0000-0000-0000-000000000000')
      .expect(401)

    expect(response.body.message).toBe('Unauthorized')
  })

  it('should be return status 404 if meal is not found on meal deleting', async () => {
    const response = await request(app.server)
      .delete('/api/meals/00000000-0000-0000-0000-000000000000')
      .set('Cookie', `sessionId=${sessionId}`)
      .expect(404)

    expect(response.body.message).toBe('Meal not found')
  })

  it('should be return status 500 if throw a error on meal deleting', async () => {
    const db = await import('../src/db')
    vi.spyOn(db, 'knex').mockImplementationOnce(() => {
      throw new Error('Error deleting meal...')
    })

    const response = await request(app.server)
      .delete('/api/meals/00000000-0000-0000-0000-000000000000')
      .set('Cookie', `sessionId=${sessionId}`)

    expect(response.status).toBe(500)
    expect(response.body.message).toEqual('Internal server error')
  })

  it('should delete a existing meal from user and return status 204', async () => {
    const createdMeal = await createMeal({
      name: 'Lunch',
      description: 'Descrição do almoço',
      meal_date: '2024-01-01T12:00:00.000Z',
      on_diet: false,
    })

    await request(app.server)
      .delete(`/api/meals/${createdMeal.id}`)
      .set('Cookie', `sessionId=${sessionId}`)
      .expect(204)
  })

  // List meals tests

  it('should be return status 401 if user is not authorized to list meals', async () => {
    const response = await request(app.server).get('/api/meals').expect(401)
    expect(response.body.message).toBe('Unauthorized')
  })

  it('should be return status 401 if user is not found on meal listing', async () => {
    const response = await request(app.server)
      .get('/api/meals')
      .set('Cookie', 'sessionId=00000000-0000-0000-0000-000000000000')
      .expect(401)

    expect(response.body.message).toBe('Unauthorized')
  })

  it('should be return status 500 if throw a error on meal listing', async () => {
    const db = await import('../src/db')
    vi.spyOn(db, 'knex').mockImplementationOnce(() => {
      throw new Error('Error listing meals...')
    })

    const response = await request(app.server)
      .get('/api/meals')
      .set('Cookie', `sessionId=${sessionId}`)

    expect(response.status).toBe(500)
    expect(response.body.message).toEqual('Internal server error')
  })

  it('should return a list of meals and status 200', async () => {
    await createMeal({
      name: 'Breakfast',
      description: 'Descrição do café da manhã',
      meal_date: '2024-01-01T08:00:00.000Z',
      on_diet: true,
    })
    await createMeal({
      name: 'Lunch',
      description: 'Descrição do almoço',
      meal_date: '2024-01-01T12:00:00.000Z',
      on_diet: false,
    })
    await createMeal({
      name: 'Dinner',
      description: 'Descrição do jantar',
      meal_date: '2024-01-01T18:00:00.000Z',
      on_diet: true,
    })

    const response = await request(app.server)
      .get('/api/meals')
      .set('Cookie', `sessionId=${sessionId}`)
      .expect(200)

    console.log(response.body)

    expect(response.body).toHaveLength(3)
    expect(response.body[0].name).toBe('Dinner')
    expect(response.body[1].name).toBe('Lunch')
    expect(response.body[2].name).toBe('Breakfast')
  })

  // Get meal tests

  it('should be return status 401 if user is not authorized to search for a meal', async () => {
    const response = await request(app.server)
      .get('/api/meals/00000000-0000-0000-0000-000000000000')
      .expect(401)

    expect(response.body.message).toBe('Unauthorized')
  })

  it('should be return status 401 if user is not found on meal searching', async () => {
    const response = await request(app.server)
      .get('/api/meals/00000000-0000-0000-0000-000000000000')
      .set('Cookie', 'sessionId=00000000-0000-0000-0000-000000000000')
      .expect(401)

    expect(response.body.message).toBe('Unauthorized')
  })

  it('should be return status 404 if meal is not found', async () => {
    const response = await request(app.server)
      .get('/api/meals/00000000-0000-0000-0000-000000000000')
      .set('Cookie', `sessionId=${sessionId}`)
      .expect(404)

    expect(response.body.message).toBe('Meal not found')
  })

  it('should be return status 500 if throw a error on meal searching', async () => {
    const db = await import('../src/db')
    vi.spyOn(db, 'knex').mockImplementationOnce(() => {
      throw new Error('Error getting meal...')
    })

    const response = await request(app.server)
      .get('/api/meals/00000000-0000-0000-0000-000000000000')
      .set('Cookie', `sessionId=${sessionId}`)

    expect(response.status).toBe(500)
    expect(response.body.message).toEqual('Internal server error')
  })

  it('should return a meal and status 200', async () => {
    const createdMeal = await createMeal({
      name: 'Lunch',
      description: 'Descrição do almoço',
      meal_date: '2024-01-01T12:00:00.000Z',
      on_diet: false,
    })

    await request(app.server)
      .get(`/api/meals/${createdMeal.id}`)
      .set('Cookie', `sessionId=${sessionId}`)
      .expect(200)
  })

  // Summary meals tests
  it('should be return status 401 if user is not authorized to get meal summary', async () => {
    const response = await request(app.server)
      .get('/api/meals/summary')
      .expect(401)

    expect(response.body.message).toBe('Unauthorized')
  })

  it('should be return status 401 if user is not found on meal summarizing', async () => {
    const response = await request(app.server)
      .get('/api/meals/summary')
      .set('Cookie', 'sessionId=00000000-0000-0000-0000-000000000000')
      .expect(401)

    expect(response.body.message).toBe('Unauthorized')
  })

  it('should be return status 500 if throw a error on meal summarizing', async () => {
    const db = await import('../src/db')
    vi.spyOn(db, 'knex').mockImplementationOnce(() => {
      throw new Error('Error summarizing meal...')
    })

    const response = await request(app.server)
      .get('/api/meals/summary')
      .set('Cookie', `sessionId=${sessionId}`)

    expect(response.status).toBe(500)
    expect(response.body.message).toEqual('Internal server error')
  })

  it('should return a meal summary and status 200', async () => {
    await createMeal({
      name: 'Sanduíche de atum com pão integral',
      description: 'Descrição do Sanduíche de atum com pão integral',
      meal_date: '2024-01-01T06:00:00.000Z',
      on_diet: true,
    })
    await createMeal({
      name: 'Hambúrguer com batata frita e refrigerante',
      description: 'Descrição do Hambúrguer com batata frita e refrigerante',
      meal_date: '2024-01-01T09:00:00.000Z',
      on_diet: false,
    })
    await createMeal({
      name: 'Salada com frango grelhado',
      description: 'Descrição da Salada com frango grelhado',
      meal_date: '2024-01-01T12:00:00.000Z',
      on_diet: true,
    })
    await createMeal({
      name: 'Frango com brócolis e arroz integral',
      description: 'Descrição do Frango com brócolis e arroz integral',
      meal_date: '2024-01-01T15:00:00.000Z',
      on_diet: true,
    })
    await createMeal({
      name: 'Pizza com muita mussarela e pepperoni',
      description: 'Descrição da Pizza com muita mussarela e pepperoni',
      meal_date: '2024-01-01T18:00:00.000Z',
      on_diet: false,
    })

    const response = await request(app.server)
      .get('/api/meals/summary')
      .set('Cookie', `sessionId=${sessionId}`)
      .expect(200)

    expect(response.body).toEqual({
      totalMeals: 5,
      totalDietMeals: 3,
      totalNotDietMeals: 2,
      bestDietSequence: [
        'Salada com frango grelhado',
        'Frango com brócolis e arroz integral',
      ],
    })
  })
})
