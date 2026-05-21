const generateBatchCode = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0');
  return `BTH-${year}-${month}${day}-${random}`;
};

module.exports = generateBatchCode;