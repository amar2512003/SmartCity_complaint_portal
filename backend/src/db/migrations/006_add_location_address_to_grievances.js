export async function up(knex) {
  await knex.schema.alterTable('grievances', (t) => {
    t.text('location_address').nullable();
  });
}

export async function down(knex) {
  await knex.schema.alterTable('grievances', (t) => {
    t.dropColumn('location_address');
  });
}
