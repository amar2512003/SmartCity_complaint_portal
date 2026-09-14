export async function up(knex) {
  await knex.schema.alterTable('grievances', (t) => {
    t.text('resolution_photo').nullable();
    t.decimal('resolution_latitude', 10, 7).nullable();
    t.decimal('resolution_longitude', 10, 7).nullable();
    t.decimal('resolution_accuracy', 10, 2).nullable();
    t.text('resolution_address').nullable();
    t.decimal('resolution_distance_meters', 10, 2).nullable();
    t.timestamp('resolved_at').nullable();
    t.integer('resolved_by_admin_id').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
  });
}

export async function down(knex) {
  await knex.schema.alterTable('grievances', (t) => {
    t.dropColumn('resolution_photo');
    t.dropColumn('resolution_latitude');
    t.dropColumn('resolution_longitude');
    t.dropColumn('resolution_accuracy');
    t.dropColumn('resolution_address');
    t.dropColumn('resolution_distance_meters');
    t.dropColumn('resolved_at');
    t.dropColumn('resolved_by_admin_id');
  });
}
