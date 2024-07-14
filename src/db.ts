import { knex as setupKnex, Knex } from 'knex'
import env from './env'

const config: Knex.Config = {
  client: 'pg',
  connection: env.DATABASE_URL,
  useNullAsDefault: true,
  migrations: {
    directory: './db/migrations',
    extension: 'ts',
  },
}

const knex = setupKnex(config)

export { config, knex }
