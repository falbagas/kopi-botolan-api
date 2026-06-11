-- AlterTable
ALTER TABLE "koperasi" ADD COLUMN     "harga_jual_botol" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "potongan_persen" DECIMAL(65,30) NOT NULL DEFAULT 10;
