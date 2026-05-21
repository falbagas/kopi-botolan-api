-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAJER', 'KOPERASI');

-- CreateEnum
CREATE TYPE "StatusPengiriman" AS ENUM ('PROSES', 'TERKIRIM', 'RETUR');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'KOPERASI',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "koperasi_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "koperasi" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "contact_person" TEXT,
    "phone" TEXT,
    "min_stock_alert" INTEGER NOT NULL DEFAULT 20,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "koperasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hpp_history" (
    "id" TEXT NOT NULL,
    "biaya_bahan" DECIMAL(65,30) NOT NULL,
    "biaya_produksi" DECIMAL(65,30) NOT NULL,
    "biaya_lain" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total_hpp" DECIMAL(65,30) NOT NULL,
    "berlaku_dari" TIMESTAMP(3) NOT NULL,
    "keterangan" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hpp_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "harga_jual" (
    "id" TEXT NOT NULL,
    "harga" DECIMAL(65,30) NOT NULL,
    "berlaku_dari" TIMESTAMP(3) NOT NULL,
    "koperasi_id" TEXT,
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "harga_jual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produksi_batch" (
    "id" TEXT NOT NULL,
    "batch_code" TEXT NOT NULL,
    "tanggal_produksi" TIMESTAMP(3) NOT NULL,
    "expired_date" TIMESTAMP(3) NOT NULL,
    "jumlah_botol" INTEGER NOT NULL,
    "catatan" TEXT,
    "hpp_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produksi_batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stok_freezer" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "jumlah_masuk" INTEGER NOT NULL,
    "jumlah_keluar" INTEGER NOT NULL DEFAULT 0,
    "stok_akhir" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stok_freezer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengiriman" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "koperasi_id" TEXT NOT NULL,
    "jumlah_botol" INTEGER NOT NULL,
    "tanggal_kirim" TIMESTAMP(3) NOT NULL,
    "status" "StatusPengiriman" NOT NULL DEFAULT 'PROSES',
    "catatan" TEXT,
    "dikirim_oleh" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pengiriman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stok_koperasi" (
    "id" TEXT NOT NULL,
    "koperasi_id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "pengiriman_id" TEXT,
    "stok_masuk" INTEGER NOT NULL DEFAULT 0,
    "stok_terjual" INTEGER NOT NULL DEFAULT 0,
    "stok_retur" INTEGER NOT NULL DEFAULT 0,
    "stok_akhir" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stok_koperasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penjualan" (
    "id" TEXT NOT NULL,
    "koperasi_id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "hpp_id" TEXT NOT NULL,
    "harga_jual_id" TEXT NOT NULL,
    "jumlah_terjual" INTEGER NOT NULL,
    "total_pendapatan" DECIMAL(65,30) NOT NULL,
    "total_hpp" DECIMAL(65,30) NOT NULL,
    "laba_kotor" DECIMAL(65,30) NOT NULL,
    "tanggal_jual" TIMESTAMP(3) NOT NULL,
    "dicatat_oleh" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "penjualan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "produksi_batch_batch_code_key" ON "produksi_batch"("batch_code");

-- CreateIndex
CREATE UNIQUE INDEX "stok_freezer_batch_id_key" ON "stok_freezer"("batch_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_koperasi_id_fkey" FOREIGN KEY ("koperasi_id") REFERENCES "koperasi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hpp_history" ADD CONSTRAINT "hpp_history_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "harga_jual" ADD CONSTRAINT "harga_jual_koperasi_id_fkey" FOREIGN KEY ("koperasi_id") REFERENCES "koperasi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produksi_batch" ADD CONSTRAINT "produksi_batch_hpp_id_fkey" FOREIGN KEY ("hpp_id") REFERENCES "hpp_history"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produksi_batch" ADD CONSTRAINT "produksi_batch_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stok_freezer" ADD CONSTRAINT "stok_freezer_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "produksi_batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengiriman" ADD CONSTRAINT "pengiriman_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "produksi_batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengiriman" ADD CONSTRAINT "pengiriman_koperasi_id_fkey" FOREIGN KEY ("koperasi_id") REFERENCES "koperasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengiriman" ADD CONSTRAINT "pengiriman_dikirim_oleh_fkey" FOREIGN KEY ("dikirim_oleh") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stok_koperasi" ADD CONSTRAINT "stok_koperasi_koperasi_id_fkey" FOREIGN KEY ("koperasi_id") REFERENCES "koperasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stok_koperasi" ADD CONSTRAINT "stok_koperasi_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "produksi_batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stok_koperasi" ADD CONSTRAINT "stok_koperasi_pengiriman_id_fkey" FOREIGN KEY ("pengiriman_id") REFERENCES "pengiriman"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penjualan" ADD CONSTRAINT "penjualan_koperasi_id_fkey" FOREIGN KEY ("koperasi_id") REFERENCES "koperasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penjualan" ADD CONSTRAINT "penjualan_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "produksi_batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penjualan" ADD CONSTRAINT "penjualan_hpp_id_fkey" FOREIGN KEY ("hpp_id") REFERENCES "hpp_history"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penjualan" ADD CONSTRAINT "penjualan_harga_jual_id_fkey" FOREIGN KEY ("harga_jual_id") REFERENCES "harga_jual"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penjualan" ADD CONSTRAINT "penjualan_dicatat_oleh_fkey" FOREIGN KEY ("dicatat_oleh") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
