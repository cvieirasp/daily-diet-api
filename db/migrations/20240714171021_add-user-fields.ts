import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.uuid('session_id').after('id').index()
    table.timestamp('updated_at').defaultTo(knex.fn.now()).after('created_at')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('session_id')
    table.dropColumn('updated_at')
  })
}
