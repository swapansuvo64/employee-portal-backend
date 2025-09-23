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
      console.log(token)
      
      // Verify JWT signature and expiration
      const decoded = User.verifyJWT(token);
      if (!decoded) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid or expired token' 
        });
      }

      // Check if token exists in either employeeToken or clientToken column
      const user = await User.findUserByToken(token);
      if (!user) {
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