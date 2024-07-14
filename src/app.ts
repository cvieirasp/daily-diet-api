import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { usersRoutes } from './routes/usersRoutes'

const app = fastify({ logger: true })

app.register(cookie)
app.register(usersRoutes, { prefix: 'api/users' })

export default app
