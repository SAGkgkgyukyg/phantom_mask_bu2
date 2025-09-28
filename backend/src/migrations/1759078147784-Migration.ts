import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1759078147784 implements MigrationInterface {
  name = 'Migration1759078147784';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "idx_users_name" ON "users" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_users_cash_balance" ON "users" ("cash_balance") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_purchase_histories_user_id" ON "purchase_histories" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_purchase_histories_pharmacy_id" ON "purchase_histories" ("pharmacy_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_purchase_histories_amount" ON "purchase_histories" ("transaction_amount") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_purchase_histories_transaction_date" ON "purchase_histories" ("transaction_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_purchase_histories_status" ON "purchase_histories" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_purchase_analysis" ON "purchase_histories" ("user_id", "transaction_date", "status", "transaction_amount") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_purchase_histories_user_date" ON "purchase_histories" ("user_id", "transaction_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_purchase_histories_date_user" ON "purchase_histories" ("transaction_date", "user_id", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_purchase_details_history_id" ON "purchase_details" ("purchase_history_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_purchase_details_mask_type_id" ON "purchase_details" ("mask_type_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_purchase_details_quantity_price" ON "purchase_details" ("quantity", "total_price") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_purchase_details_history_mask" ON "purchase_details" ("purchase_history_id", "mask_type_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_mask_types_brand" ON "mask_types" ("brand") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_mask_types_color" ON "mask_types" ("color") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_mask_types_display_name" ON "mask_types" ("display_name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_mask_types_brand_color" ON "mask_types" ("brand", "color") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_inventory_pharmacy_id" ON "inventory" ("pharmacy_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_inventory_mask_type_id" ON "inventory" ("mask_type_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_inventory_price" ON "inventory" ("price") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_inventory_quantity" ON "inventory" ("quantity") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_inventory_complete" ON "inventory" ("pharmacy_id", "mask_type_id", "quantity", "price") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_inventory_price_quantity" ON "inventory" ("price", "quantity") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_inventory_pharmacy_mask" ON "inventory" ("pharmacy_id", "mask_type_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_pharmacies_name" ON "pharmacies" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_pharmacy_hours_pharmacy_id" ON "pharmacy_hours" ("pharmacy_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_pharmacy_hours_weekday_id" ON "pharmacy_hours" ("weekday_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_pharmacy_hours_open_time" ON "pharmacy_hours" ("open_time") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_pharmacy_hours_close_time" ON "pharmacy_hours" ("close_time") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_pharmacy_hours_overnight" ON "pharmacy_hours" ("is_overnight") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_pharmacy_hours_schedule" ON "pharmacy_hours" ("pharmacy_id", "weekday_id", "open_time", "close_time") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_pharmacy_hours_weekday_time" ON "pharmacy_hours" ("weekday_id", "open_time", "close_time") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_pharmacy_hours_pharmacy_weekday" ON "pharmacy_hours" ("pharmacy_id", "weekday_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_weekdays_name" ON "weekdays" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_weekdays_short_name" ON "weekdays" ("short_name") `,
    );

    // CREATE INDEX idx_pharmacies_name_lower ON pharmacies (LOWER(name));
    // CREATE INDEX idx_mask_types_search_lower ON mask_types (LOWER(brand), LOWER(color), LOWER(display_name));
    // CREATE INDEX idx_inventory_active ON inventory (pharmacy_id, mask_type_id) WHERE quantity > 0;
    await queryRunner.query(
      `CREATE INDEX "idx_pharmacies_name_lower" ON "pharmacies" (LOWER(name)) `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_mask_types_search_lower" ON "mask_types" (LOWER(brand), LOWER(color), LOWER(display_name)) `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_inventory_active" ON "inventory" ("pharmacy_id", "mask_type_id") WHERE quantity > 0 `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_weekdays_short_name"`);
    await queryRunner.query(`DROP INDEX "public"."idx_weekdays_name"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_pharmacy_hours_pharmacy_weekday"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_pharmacy_hours_weekday_time"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_pharmacy_hours_schedule"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_pharmacy_hours_overnight"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_pharmacy_hours_close_time"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_pharmacy_hours_open_time"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_pharmacy_hours_weekday_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_pharmacy_hours_pharmacy_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_pharmacies_name"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_inventory_pharmacy_mask"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_inventory_price_quantity"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_inventory_complete"`);
    await queryRunner.query(`DROP INDEX "public"."idx_inventory_quantity"`);
    await queryRunner.query(`DROP INDEX "public"."idx_inventory_price"`);
    await queryRunner.query(`DROP INDEX "public"."idx_inventory_mask_type_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_inventory_pharmacy_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_mask_types_brand_color"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_mask_types_display_name"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_mask_types_color"`);
    await queryRunner.query(`DROP INDEX "public"."idx_mask_types_brand"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_purchase_details_history_mask"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_purchase_details_quantity_price"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_purchase_details_mask_type_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_purchase_details_history_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_purchase_histories_date_user"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_purchase_histories_user_date"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_purchase_analysis"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_purchase_histories_status"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_purchase_histories_transaction_date"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_purchase_histories_amount"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_purchase_histories_pharmacy_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_purchase_histories_user_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_users_cash_balance"`);
    await queryRunner.query(`DROP INDEX "public"."idx_users_name"`);
    await queryRunner.query(`DROP INDEX "public"."idx_pharmacies_name_lower"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_mask_types_search_lower"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_inventory_active"`);
  }
}
