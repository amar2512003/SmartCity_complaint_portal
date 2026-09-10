export async function up(knex) {
  await knex.schema.alterTable('grievances', (t) => {
    t.string('municipal_body').nullable();
    t.string('municipal_district').nullable();
  });
}

export async function down(knex) {
  await knex.schema.alterTable('grievances', (t) => {
    t.dropColumn('municipal_body');
    t.dropColumn('municipal_district');
  });
}
