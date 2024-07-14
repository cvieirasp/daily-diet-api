import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../db'

export const usersRoutes = async (app: FastifyInstance) => {
  app.post('/', async (request, reply) => {
    const createUserSchema = z.object({
      name: z.string().min(1, 'Must not be an empty value').max(255),
      email: z.string().email().max(255),
    })

    try {
      const bodyParse = createUserSchema.safeParse(request.body)

      if (!bodyParse.success) {
        return reply.status(400).send({
          message: `Param ${bodyParse.error.issues[0].path[0]}: ${bodyParse.error.issues[0].message}`,
        })
      }

      const { name, email } = bodyParse.data

      // Validar se existe email cadastrado
      const userExists = await knex('users').where({ email }).first()
      if (userExists) {
        return reply
          .status(400)
          .send({ message: 'User with email already exists' })
      }

      const user = await knex('users').insert(
        {
          id: randomUUID(),
          name,
          email,
        },
        '*',
      )

      return reply.status(201).send({ user: user[0] })
    } catch (err) {
      console.error(err)
      return reply.status(500).send({ message: 'Internal server error' })
    }
  })
}
