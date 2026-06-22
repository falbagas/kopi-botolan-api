-- CreateEnum
CREATE TYPE "JenisMutasiLaba" AS ENUM ('LABA_MASUK', 'PENARIKAN', 'KOREKSI');

-- CreateTable
CREATE TABLE "pemilik" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "persentase" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "saldo" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pemilik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pembagian_laba" (
    "id" TEXT NOT NULL,
    "periode_awal" TIMESTAMP(3) NOT NULL,
    "periode_akhir" TIMESTAMP(3) NOT NULL,
    "total_laba" DECIMAL(65,30) NOT NULL,
    "keterangan" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pembagian_laba_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mutasi_laba" (
    "id" TEXT NOT NULL,
    "pemilik_id" TEXT NOT NULL,
    "pembagian_laba_id" TEXT,
    "jenis" "JenisMutasiLaba" NOT NULL,
    "jumlah" DECIMAL(65,30) NOT NULL,
    "saldo_sebelum" DECIMAL(65,30) NOT NULL,
    "saldo_sesudah" DECIMAL(65,30) NOT NULL,
    "keterangan" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mutasi_laba_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pembagian_laba" ADD CONSTRAINT "pembagian_laba_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mutasi_laba" ADD CONSTRAINT "mutasi_laba_pemilik_id_fkey" FOREIGN KEY ("pemilik_id") REFERENCES "pemilik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mutasi_laba" ADD CONSTRAINT "mutasi_laba_pembagian_laba_id_fkey" FOREIGN KEY ("pembagian_laba_id") REFERENCES "pembagian_laba"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mutasi_laba" ADD CONSTRAINT "mutasi_laba_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
