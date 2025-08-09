const User = require('../models/User');

const authMiddleware = {
  async authenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          success: false,
          message: 'Authentication token required' 
        });
      }

      const token = authHeader.split(' ')[1];
      
      // Verify JWT signature and expiration
      const decoded = User.verifyJWT(token);
      if (!decoded) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid or expired token' 
        });
      }

      // Verify token exists in database and matches
      const user = await User.findUserById(decoded.id);
      if (!user || user.token !== token) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid token' 
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error' 
      });
    }
  },

  authorize(roles = []) {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          success: false,
          message: 'Unauthorized access' 
        });
      }
      next();
    };
  }
};

module.exports = authMiddleware;