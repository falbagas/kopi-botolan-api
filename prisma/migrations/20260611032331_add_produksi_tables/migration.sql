-- CreateTable
CREATE TABLE "bahan_baku" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "satuan" TEXT NOT NULL,
    "stok_awal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "stok_saat_ini" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bahan_baku_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rasa_kopi" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rasa_kopi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produksi" (
    "id" TEXT NOT NULL,
    "tanggal_produksi" TIMESTAMP(3) NOT NULL,
    "jam_mulai" TIMESTAMP(3) NOT NULL,
    "jam_selesai" TIMESTAMP(3) NOT NULL,
    "durasi_jam" INTEGER NOT NULL DEFAULT 0,
    "durasi_menit" INTEGER NOT NULL DEFAULT 0,
    "catatan" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produksi_botolan" (
    "id" TEXT NOT NULL,
    "produksi_id" TEXT NOT NULL,
    "rasa_kopi_id" TEXT NOT NULL,
    "jumlah_botol" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produksi_botolan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produksi_detail" (
    "id" TEXT NOT NULL,
    "produksi_id" TEXT NOT NULL,
    "bahan_baku_id" TEXT NOT NULL,
    "jumlah_pakai" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produksi_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bahan_baku_nama_key" ON "bahan_baku"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "rasa_kopi_nama_key" ON "rasa_kopi"("nama");

-- AddForeignKey
ALTER TABLE "produksi" ADD CONSTRAINT "produksi_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produksi_botolan" ADD CONSTRAINT "produksi_botolan_produksi_id_fkey" FOREIGN KEY ("produksi_id") REFERENCES "produksi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produksi_botolan" ADD CONSTRAINT "produksi_botolan_rasa_kopi_id_fkey" FOREIGN KEY ("rasa_kopi_id") REFERENCES "rasa_kopi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produksi_detail" ADD CONSTRAINT "produksi_detail_produksi_id_fkey" FOREIGN KEY ("produksi_id") REFERENCES "produksi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produksi_detail" ADD CONSTRAINT "produksi_detail_bahan_baku_id_fkey" FOREIGN KEY ("bahan_baku_id") REFERENCES "bahan_baku"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
