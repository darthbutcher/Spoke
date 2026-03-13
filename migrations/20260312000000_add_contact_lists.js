exports.up = function(knex) {
  return knex.schema
    .createTable("contact_list", table => {
      table.increments("id").primary();
      table
        .integer("organization_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("organization");
      table.text("name").notNullable();
      table.text("description").defaultTo("");
      table.text("file_name").defaultTo("");
      table.integer("contact_count").notNullable().defaultTo(0);
      table.text("custom_fields").defaultTo("[]");
      table
        .integer("created_by")
        .unsigned()
        .references("id")
        .inTable("user");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.index("organization_id");
    })
    .createTable("contact_list_entry", table => {
      table.increments("id").primary();
      table
        .integer("contact_list_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("contact_list")
        .onDelete("CASCADE");
      table.text("first_name").defaultTo("");
      table.text("last_name").defaultTo("");
      table.text("cell").notNullable();
      table.text("zip").defaultTo("");
      table.text("external_id").defaultTo("");
      table.text("custom_fields").defaultTo("{}");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.index("contact_list_id");
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists("contact_list_entry")
    .dropTableIfExists("contact_list");
};
