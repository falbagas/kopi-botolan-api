-- CreateTable
CREATE TABLE "bahan_hpp" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "satuan" TEXT NOT NULL,
    "harga_per_unit" DECIMAL(65,30) NOT NULL,
    "berat_per_unit" DECIMAL(65,30) NOT NULL,
    "harga_per_gram" DECIMAL(65,30) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bahan_hpp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resep_hpp" (
    "id" TEXT NOT NULL,
    "rasa_kopi_id" TEXT NOT NULL,
    "total_hpp" DECIMAL(65,30) NOT NULL,
    "is_aktif" BOOLEAN NOT NULL DEFAULT false,
    "catatan" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resep_hpp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resep_hpp_detail" (
    "id" TEXT NOT NULL,
    "resep_id" TEXT NOT NULL,
    "bahan_hpp_id" TEXT NOT NULL,
    "jumlah_pakai" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "resep_hpp_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bahan_hpp_nama_key" ON "bahan_hpp"("nama");

-- AddForeignKey
ALTER TABLE "resep_hpp" ADD CONSTRAINT "resep_hpp_rasa_kopi_id_fkey" FOREIGN KEY ("rasa_kopi_id") REFERENCES "rasa_kopi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resep_hpp" ADD CONSTRAINT "resep_hpp_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resep_hpp_detail" ADD CONSTRAINT "resep_hpp_detail_resep_id_fkey" FOREIGN KEY ("resep_id") REFERENCES "resep_hpp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resep_hpp_detail" ADD CONSTRAINT "resep_hpp_detail_bahan_hpp_id_fkey" FOREIGN KEY ("bahan_hpp_id") REFERENCES "bahan_hpp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
