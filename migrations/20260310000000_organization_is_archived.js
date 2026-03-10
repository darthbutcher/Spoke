exports.up = function(knex) {
  return knex.schema.table("organization", table => {
    table
      .boolean("is_archived")
      .notNullable()
      .defaultTo(false);
  });
};

exports.down = function(knex) {
  return knex.schema.table("organization", table => {
    table.dropColumn("is_archived");
  });
};
