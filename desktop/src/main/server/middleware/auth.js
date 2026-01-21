const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const auth = (roles = []) => {
  return (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
      logger.warn('Authentication attempt without token');
      return res.status(401).json({ message: 'No token provided' });
    }


    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET||"classicBingoSecret");
      req.user = decoded;
      if (roles.length && !roles.includes(decoded.role)) {
        logger.warn(`Unauthorized access attempt by user ${decoded.username}`);
        return res.status(403).json({ message: 'Access denied' });
      }
      next();
    } catch (error) {
      logger.error('Invalid token:', error);
      res.status(400).json({ message: 'Invalid token' });
    }
  };
};

module.exports = auth;