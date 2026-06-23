-- AlterTable
ALTER TABLE "pemilik" ADD COLUMN     "persentase_koperasi" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "persentase_pos" DECIMAL(65,30) NOT NULL DEFAULT 0;
