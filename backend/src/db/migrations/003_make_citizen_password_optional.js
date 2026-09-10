export async function up(knex) {
  await knex.schema.alterTable('users', (t) => t.string('password_hash').nullable().alter());
  await knex.schema.alterTable('email_otps', (t) => t.string('password_hash').nullable().alter());
}

export async function down(knex) {
  await knex.schema.alterTable('email_otps', (t) => t.string('password_hash').notNullable().alter());
  await knex.schema.alterTable('users', (t) => t.string('password_hash').notNullable().alter());
}
