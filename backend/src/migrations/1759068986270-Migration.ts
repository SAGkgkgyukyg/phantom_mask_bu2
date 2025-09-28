import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1759068986270 implements MigrationInterface {
    name = 'Migration1759068986270'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_histories" DROP CONSTRAINT "purchase_histories_user_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "purchase_histories" DROP CONSTRAINT "purchase_histories_pharmacy_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "purchase_details" DROP CONSTRAINT "purchase_details_purchase_history_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "purchase_details" DROP CONSTRAINT "purchase_details_mask_type_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "inventory" DROP CONSTRAINT "inventory_pharmacy_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "inventory" DROP CONSTRAINT "inventory_mask_type_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "pharmacy_hours" DROP CONSTRAINT "pharmacy_hours_pharmacy_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "pharmacy_hours" DROP CONSTRAINT "pharmacy_hours_weekday_id_fkey"`);
        await queryRunner.query(`CREATE TYPE "public"."purchase_histories_status_enum" AS ENUM('done', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "purchase_histories" ADD "status" "public"."purchase_histories_status_enum" NOT NULL DEFAULT 'done'`);
        await queryRunner.query(`ALTER TABLE "purchase_histories" ADD CONSTRAINT "FK_f32ad3061ae2566ab96e055ad1b" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_histories" ADD CONSTRAINT "FK_705f9e60b5f6a55805c32a80cdc" FOREIGN KEY ("pharmacy_id") REFERENCES "pharmacies"("pharmacy_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_details" ADD CONSTRAINT "FK_0929db7b3bed39a6c9a3e496dc8" FOREIGN KEY ("purchase_history_id") REFERENCES "purchase_histories"("purchase_history_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_details" ADD CONSTRAINT "FK_8ebbaf44963414fea9303791ec0" FOREIGN KEY ("mask_type_id") REFERENCES "mask_types"("mask_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory" ADD CONSTRAINT "FK_d4756128aeecf7c86d51b650494" FOREIGN KEY ("pharmacy_id") REFERENCES "pharmacies"("pharmacy_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory" ADD CONSTRAINT "FK_e38f9dc5edece975a1e93fd21f5" FOREIGN KEY ("mask_type_id") REFERENCES "mask_types"("mask_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pharmacy_hours" ADD CONSTRAINT "FK_e2b3632f2daf2ac5a94938cc199" FOREIGN KEY ("pharmacy_id") REFERENCES "pharmacies"("pharmacy_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pharmacy_hours" ADD CONSTRAINT "FK_e31aefdba45bee884a979c979ce" FOREIGN KEY ("weekday_id") REFERENCES "weekdays"("weekday_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pharmacy_hours" DROP CONSTRAINT "FK_e31aefdba45bee884a979c979ce"`);
        await queryRunner.query(`ALTER TABLE "pharmacy_hours" DROP CONSTRAINT "FK_e2b3632f2daf2ac5a94938cc199"`);
        await queryRunner.query(`ALTER TABLE "inventory" DROP CONSTRAINT "FK_e38f9dc5edece975a1e93fd21f5"`);
        await queryRunner.query(`ALTER TABLE "inventory" DROP CONSTRAINT "FK_d4756128aeecf7c86d51b650494"`);
        await queryRunner.query(`ALTER TABLE "purchase_details" DROP CONSTRAINT "FK_8ebbaf44963414fea9303791ec0"`);
        await queryRunner.query(`ALTER TABLE "purchase_details" DROP CONSTRAINT "FK_0929db7b3bed39a6c9a3e496dc8"`);
        await queryRunner.query(`ALTER TABLE "purchase_histories" DROP CONSTRAINT "FK_705f9e60b5f6a55805c32a80cdc"`);
        await queryRunner.query(`ALTER TABLE "purchase_histories" DROP CONSTRAINT "FK_f32ad3061ae2566ab96e055ad1b"`);
        await queryRunner.query(`ALTER TABLE "purchase_histories" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."purchase_histories_status_enum"`);
        await queryRunner.query(`ALTER TABLE "pharmacy_hours" ADD CONSTRAINT "pharmacy_hours_weekday_id_fkey" FOREIGN KEY ("weekday_id") REFERENCES "weekdays"("weekday_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pharmacy_hours" ADD CONSTRAINT "pharmacy_hours_pharmacy_id_fkey" FOREIGN KEY ("pharmacy_id") REFERENCES "pharmacies"("pharmacy_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory" ADD CONSTRAINT "inventory_mask_type_id_fkey" FOREIGN KEY ("mask_type_id") REFERENCES "mask_types"("mask_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory" ADD CONSTRAINT "inventory_pharmacy_id_fkey" FOREIGN KEY ("pharmacy_id") REFERENCES "pharmacies"("pharmacy_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_details" ADD CONSTRAINT "purchase_details_mask_type_id_fkey" FOREIGN KEY ("mask_type_id") REFERENCES "mask_types"("mask_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_details" ADD CONSTRAINT "purchase_details_purchase_history_id_fkey" FOREIGN KEY ("purchase_history_id") REFERENCES "purchase_histories"("purchase_history_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_histories" ADD CONSTRAINT "purchase_histories_pharmacy_id_fkey" FOREIGN KEY ("pharmacy_id") REFERENCES "pharmacies"("pharmacy_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_histories" ADD CONSTRAINT "purchase_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
