-- CreateEnum
CREATE TYPE "KategoriMenu" AS ENUM ('MAKANAN', 'MINUMAN');

-- CreateEnum
CREATE TYPE "MetodeBayar" AS ENUM ('CASH', 'QRIS');

-- CreateTable
CREATE TABLE "menu" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "harga" DECIMAL(65,30) NOT NULL,
    "kategori" "KategoriMenu" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaksi" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metode_bayar" "MetodeBayar" NOT NULL,
    "total_harga" DECIMAL(65,30) NOT NULL,
    "nama_pembeli" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaksi_detail" (
    "id" TEXT NOT NULL,
    "transaksi_id" TEXT NOT NULL,
    "menu_id" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "harga_satuan" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "transaksi_detail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_detail" ADD CONSTRAINT "transaksi_detail_transaksi_id_fkey" FOREIGN KEY ("transaksi_id") REFERENCES "transaksi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_detail" ADD CONSTRAINT "transaksi_detail_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
