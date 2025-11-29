const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: '토큰이 없습니다.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = { userId: decoded.userId };

    next();
  } catch (err) {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

module.exports = authMiddleware;
