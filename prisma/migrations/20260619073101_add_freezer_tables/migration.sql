-- CreateEnum
CREATE TYPE "JenisMutasi" AS ENUM ('MASUK_PRODUKSI', 'KELUAR_KOPERASI', 'PINDAH_KELUAR', 'PINDAH_MASUK');

-- CreateTable
CREATE TABLE "freezer" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "lokasi" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "freezer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stok_freezer_v2" (
    "id" TEXT NOT NULL,
    "freezer_id" TEXT NOT NULL,
    "rasa_kopi_id" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stok_freezer_v2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mutasi_freezer" (
    "id" TEXT NOT NULL,
    "freezer_id" TEXT NOT NULL,
    "freezer_tujuan_id" TEXT,
    "rasa_kopi_id" TEXT NOT NULL,
    "jenis" "JenisMutasi" NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "keterangan" TEXT,
    "produksi_id" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mutasi_freezer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "freezer_nama_key" ON "freezer"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "stok_freezer_v2_freezer_id_rasa_kopi_id_key" ON "stok_freezer_v2"("freezer_id", "rasa_kopi_id");

-- AddForeignKey
ALTER TABLE "stok_freezer_v2" ADD CONSTRAINT "stok_freezer_v2_freezer_id_fkey" FOREIGN KEY ("freezer_id") REFERENCES "freezer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stok_freezer_v2" ADD CONSTRAINT "stok_freezer_v2_rasa_kopi_id_fkey" FOREIGN KEY ("rasa_kopi_id") REFERENCES "rasa_kopi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mutasi_freezer" ADD CONSTRAINT "mutasi_freezer_freezer_id_fkey" FOREIGN KEY ("freezer_id") REFERENCES "freezer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mutasi_freezer" ADD CONSTRAINT "mutasi_freezer_freezer_tujuan_id_fkey" FOREIGN KEY ("freezer_tujuan_id") REFERENCES "freezer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mutasi_freezer" ADD CONSTRAINT "mutasi_freezer_rasa_kopi_id_fkey" FOREIGN KEY ("rasa_kopi_id") REFERENCES "rasa_kopi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mutasi_freezer" ADD CONSTRAINT "mutasi_freezer_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
