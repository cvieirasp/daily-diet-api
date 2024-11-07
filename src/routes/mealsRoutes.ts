import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../db'
import { validateSession } from '../middlewares/validate-session'

export const mealsRoutes = async (app: FastifyInstance) => {
  app.get('/', { preHandler: [validateSession] }, async (request, reply) => {
    try {
      const { user } = request

      const meals = await knex('meals')
        .where('user_id', user?.id)
        .orderBy('meal_date', 'desc')

      return reply.status(200).send(meals)
    } catch (err) {
      console.error(err)
      return reply.status(500).send({ message: 'Internal server error' })
    }
  })

  app.get('/:id', { preHandler: [validateSession] }, async (request, reply) => {
    const paramsSchema = z.object({ id: z.string().uuid() })

    try {
      const { id } = paramsSchema.parse(request.params)
      const meal = await knex('meals').where('id', id).first()

      if (!meal) {
        return reply.status(404).send({ message: 'Meal not found' })
      }

      return reply.status(200).send(meal)
    } catch (err) {
      console.error(err)
      return reply.status(500).send({ message: 'Internal server error' })
    }
  })

  app.post('/', { preHandler: [validateSession] }, async (request, reply) => {
    const createMealSchema = z.object({
      name: z.string().min(1, 'Must not be an empty value').max(255),
      description: z.string().min(1, 'Must not be an empty value').max(1000),
      meal_date: z.coerce.date(),
      on_diet: z.boolean(),
    })

    try {
      const { user } = request
      const bodyParse = createMealSchema.safeParse(request.body)

      if (!bodyParse.success) {
        return reply.status(400).send({
          message: `Param ${bodyParse.error.issues[0].path[0]}: ${bodyParse.error.issues[0].message}`,
        })
      }

      const { name, description, meal_date, on_diet } = bodyParse.data

      const meal = await knex('meals').insert(
        {
          id: randomUUID(),
          user_id: user?.id,
          name,
          description,
          meal_date: meal_date.toISOString(),
          on_diet,
        },
        '*',
      )

      return reply.status(201).send(meal[0])
    } catch (err) {
      console.error(err)
      return reply.status(500).send({ message: 'Internal server error' })
    }
  })

  app.patch(
    '/:id',
    { preHandler: [validateSession] },
    async (request, reply) => {
      const updateMealSchema = z.object({
        name: z.string().max(255).or(z.undefined()).nullable(),
        description: z.string().max(1000).or(z.undefined()).nullable(),
        meal_date: z.coerce.date().or(z.undefined()).nullable(),
        on_diet: z.boolean().or(z.undefined()).nullable(),
      })

      const paramsSchema = z.object({ id: z.string().uuid() })

      try {
        const { id } = paramsSchema.parse(request.params)

        const meal = await knex('meals').where('id', id).first()

        if (!meal) {
          return reply.status(404).send({ message: 'Meal not found' })
        }

        const bodyParse = updateMealSchema.safeParse(request.body)

        if (!bodyParse.success) {
          return reply.status(400).send({
            message: `Param ${bodyParse.error.issues[0].path[0]}: ${bodyParse.error.issues[0].message}`,
          })
        }

        const { name, description, meal_date, on_diet } = bodyParse.data

        await knex('meals')
          .where({ id })
          .update({
            name: name ?? meal.name,
            description: description ?? meal.description,
            meal_date: meal_date?.toISOString(),
            on_diet: on_diet ?? meal.on_diet,
          })

        return reply.status(204).send()
      } catch (err) {
        console.error(err)
        return reply.status(500).send({ message: 'Internal server error' })
      }
    },
  )

  app.delete(
    '/:id',
    { preHandler: [validateSession] },
    async (request, reply) => {
      const paramsSchema = z.object({ id: z.string().uuid() })

      try {
        const { id } = paramsSchema.parse(request.params)

        const meal = await knex('meals').where('id', id).first()

        if (!meal) {
          return reply.status(404).send({ message: 'Meal not found' })
        }

        await knex('meals').where('id', id).delete()

        return reply.status(204).send()
      } catch (err) {
        console.error(err)
        return reply.status(500).send({ message: 'Internal server error' })
      }
    },
  )

  app.get(
    '/summary',
    { preHandler: [validateSession] },
    async (request, reply) => {
      try {
        const { user } = request

        let totalMeals = 0
        let totalDietMeals = 0
        let totalNotDietMeals = 0
        let bestDietSequence: string[] = []

        const meals = await knex('meals')
          .where('user_id', user?.id)
          .orderBy('meal_date', 'asc')

        let mealsSequence: string[] = []

        for (const meal of meals) {
          totalMeals++
          if (meal.on_diet) {
            totalDietMeals++
            mealsSequence.push(meal.name)
          } else {
            totalNotDietMeals++
            if (mealsSequence.length > bestDietSequence.length) {
              bestDietSequence = [...mealsSequence]
              mealsSequence = []
            }
          }
        }

        const summary = {
          totalMeals,
          totalDietMeals,
          totalNotDietMeals,
          bestDietSequence,
        }

        return reply.status(200).send(summary)
      } catch (err) {
        console.error(err)
        return reply.status(500).send({ message: 'Internal server error' })
      }
    },
  )
}
