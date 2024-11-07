import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { usersRoutes } from './routes/usersRoutes'
import { mealsRoutes } from './routes/mealsRoutes'

const app = fastify({ logger: true })

app.register(cookie)
app.register(usersRoutes, { prefix: 'api/users' })
app.register(mealsRoutes, { prefix: 'api/meals' })

export default app
