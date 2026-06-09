-- DropForeignKey
ALTER TABLE "pengiriman" DROP CONSTRAINT "pengiriman_batch_id_fkey";

-- AlterTable
ALTER TABLE "pengiriman" ALTER COLUMN "batch_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "pengiriman" ADD CONSTRAINT "pengiriman_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "produksi_batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
