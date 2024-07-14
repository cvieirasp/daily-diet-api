import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

const envSchema = z.object({
  DATABASE_URL: z.string(),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
})

const envParse = envSchema.safeParse(process.env)

if (!envParse.success) {
  console.error(
    'Invalid environment variables. Please check your ".env" file.',
    envParse.error.format(),
  )
  throw new Error(
    'Invalid environment variables. Please check your ".env" file.',
  )
}

const env = envParse.data

export default env
