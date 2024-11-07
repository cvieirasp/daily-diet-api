import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../db'

export async function validateSession(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { sessionId } = request.cookies

    if (!sessionId) {
      reply.code(401).send({ message: 'Unauthorized' })
    }

    const user = await knex('users').where({ session_id: sessionId }).first()

    if (!user) {
      reply.code(401).send({ message: 'Unauthorized' })
    }

    request.user = {
      id: user!.id,
      name: user!.name,
      email: user!.email,
      session_id: user!.session_id,
    }
  } catch (err) {
    console.error(err)
    reply.code(500).send({ message: 'Internal server error' })
  }
}
