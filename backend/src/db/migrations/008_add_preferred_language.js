// Note: this codebase has no separate `admins` table — admin.model.js reads
// from `users` filtered by role: 'admin'. So a single column covers both.
export async function up(knex) {
  await knex.schema.alterTable('users', (t) => {
    t.string('preferred_language', 5).notNullable().defaultTo('en');
  });
}

export async function down(knex) {
  await knex.schema.alterTable('users', (t) => {
    t.dropColumn('preferred_language');
  });
}
