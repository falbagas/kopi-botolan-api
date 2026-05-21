const calcLaba = (jumlah, hargaJual, hpp) => {
  const totalPendapatan = jumlah * Number(hargaJual);
  const totalHpp = jumlah * Number(hpp);
  const labaKotor = totalPendapatan - totalHpp;
  return { totalPendapatan, totalHpp, labaKotor };
};

module.exports = calcLaba;