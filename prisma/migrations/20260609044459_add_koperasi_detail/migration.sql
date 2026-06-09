-- CreateTable
CREATE TABLE "jenis_kopi" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jenis_kopi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengiriman_detail" (
    "id" TEXT NOT NULL,
    "pengiriman_id" TEXT NOT NULL,
    "jenis_kopi_id" TEXT NOT NULL,
    "jumlah_botol" INTEGER NOT NULL,
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pengiriman_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pembayaran" (
    "id" TEXT NOT NULL,
    "koperasi_id" TEXT NOT NULL,
    "jumlah_botol" INTEGER NOT NULL,
    "tanggal_bayar" TIMESTAMP(3) NOT NULL,
    "keterangan" TEXT,
    "dicatat_oleh" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "jenis_kopi_nama_key" ON "jenis_kopi"("nama");

-- AddForeignKey
ALTER TABLE "pengiriman_detail" ADD CONSTRAINT "pengiriman_detail_pengiriman_id_fkey" FOREIGN KEY ("pengiriman_id") REFERENCES "pengiriman"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengiriman_detail" ADD CONSTRAINT "pengiriman_detail_jenis_kopi_id_fkey" FOREIGN KEY ("jenis_kopi_id") REFERENCES "jenis_kopi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_koperasi_id_fkey" FOREIGN KEY ("koperasi_id") REFERENCES "koperasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_dicatat_oleh_fkey" FOREIGN KEY ("dicatat_oleh") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
