const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Belum login' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Tidak punya akses ke fitur ini' });
    }
    next();
  };
};

module.exports = roleMiddleware;