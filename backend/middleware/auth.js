const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const authenticate = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (req.header('Authorization') || '').replace(/^Bearer\s+/i, '');

    if (!token) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return res.status(401).json({ error: 'user not found' });
    }

    req.user = { id: user.id, username: user.username, email: user.email };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      res.clearCookie('token', { httpOnly: true });
      return res.status(401).json({ error: 'Token expired' });
    }
  }
};

const guestOnly = (req, res, next) => {
  const token =
    req.cookies?.token ||
    (req.header('Authorization') || '').replace(/^Bearer\s+/i, '');

  if (!token) {
    return next();
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return res.status(403).json({ error: 'Already authenticated' });
  } catch (err) {
    return next();
  }
};

module.exports = { authenticate, guestOnly };
