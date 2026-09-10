export async function up(knex) {
  await knex.schema.createTable('email_otps', (t) => {
    t.increments('id').primary();
    t.string('email').notNullable().index();
    t.string('name').notNullable();
    t.string('password_hash').notNullable();
    t.string('otp_hash').notNullable();
    t.string('purpose').notNullable().defaultTo('signup');
    t.timestamp('expires_at').notNullable();
    t.integer('attempts').notNullable().defaultTo(0);
    t.timestamps(true, true);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('email_otps');
}
