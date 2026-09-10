export async function up(knex) {
  await knex.schema.alterTable('grievances', (t) => {
    t.decimal('latitude', 10, 7).nullable();
    t.decimal('longitude', 10, 7).nullable();
    t.decimal('location_accuracy', 10, 2).nullable();
  });
}

export async function down(knex) {
  await knex.schema.alterTable('grievances', (t) => {
    t.dropColumn('latitude');
    t.dropColumn('longitude');
    t.dropColumn('location_accuracy');
  });
}
