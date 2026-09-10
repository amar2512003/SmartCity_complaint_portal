export async function up(knex) {
  await knex.schema.alterTable('grievances', (t) => {
    t.text('photo').nullable();
  });
}

export async function down(knex) {
  await knex.schema.alterTable('grievances', (t) => {
    t.dropColumn('photo');
  });
}
