const User = require('../models/User');
const pool = require('../dbConfig/db');
const authPool = require('../dbConfig/authdDb');

const authController = {
  async signup(req, res) {
    try {
      const { name, password, role } = req.body;
      console.log(req.body);
      
      if (!name || !password || !role) {
        return res.status(400).json({ 
          success: false,
          message: 'Name, password, and role are required' 
        });
      }

      const existingUser = await User.findUserByName(name);
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: 'Name already exists' 
        });
      }

      const userId = await User.createUser(name, password, role);
      res.status(201).json({ 
        success: true,
        message: 'User created successfully', 
        data: { userId } 
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error' 
      });
    }
  },

  async login(req, res) {
    try {
      const { name, password, platform = 'employee' } = req.body;
      
      if (!name || !password) {
        return res.status(400).json({ 
          success: false,
          message: 'Name and password are required' 
        });
      }

      // Validate platform
      if (!['employee', 'client'].includes(platform)) {
        return res.status(400).json({
          success: false,
          message: 'Platform must be either "employee" or "client"'
        });
      }

      const user = await User.findUserByName(name);
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid credentials' 
        });
      }

      // Check if user has a password hash
      if (!user.password) {
        console.error('User found but no password hash exists:', user);
        return res.status(401).json({ 
          success: false,
          message: 'Invalid credentials - no password set' 
        });
      }

      const isMatch = await User.comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid credentials' 
        });
      }

      const token = User.generateJWT(user.id, user.role);
      await User.storeToken(user.id, token, platform);

      // Fetch profile information - handle potential database connection issues
      let profile = {};
      try {
        // Check if pool connection is available
        if (pool && typeof pool.execute === 'function') {
          const [profileRows] = await pool.execute('SELECT * FROM profile WHERE uid = ?', [user.uid]);
          profile = profileRows[0] || {};
        } else {
          console.warn('Profile pool connection not available, skipping profile fetch');
        }
      } catch (profileError) {
        console.error('Error fetching profile:', profileError);
        // Continue without profile data - don't fail the login
      }

      res.json({ 
        success: true,
        message: 'Login successful',
        data: {
          token,
          platform,
          user: {
            id: user.id,
            name: user.name,
            role: user.role,
            uid: user.uid
          },
          profile: {
            username: profile.username || user.name,
            uid: profile.uid || user.uid,
            firstname: profile.firstname || '',
            lastname: profile.lastname || '',
            profilepicurl: profile.profilepicurl || '',
            role: profile.role || user.role,
            designation: profile.designation || ''
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error' 
      });
    }
  },

  async logout(req, res) {
    try {
      const userId = req.user.id;
      const platform = req.body.platform || 'employee';
      
      await User.clearToken(userId, platform);
      res.json({ 
        success: true,
        message: 'Logout successful' 
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error' 
      });
    }
  },

  async getProfile(req, res) {
    try {
      const user = await User.findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error' 
      });
    }
  },

  async deleteUser(req, res) {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({ success: false, message: 'UID is required' });
    }

    let connectionAuth;
    let connectionMain;

    try {
      connectionAuth = await authPool.getConnection();
      connectionMain = await pool.getConnection();

      await connectionAuth.beginTransaction();
      await connectionMain.beginTransaction();

      // Delete from Profile table
      await connectionMain.execute('DELETE FROM profile WHERE uid = ?', [uid]);

      // Delete from User table
      await connectionAuth.execute('DELETE FROM User WHERE uid = ?', [uid]);

      await connectionAuth.commit();
      await connectionMain.commit();

      res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
      if (connectionAuth) await connectionAuth.rollback();
      if (connectionMain) await connectionMain.rollback();
      console.error(err);
      res.status(500).json({ success: false, message: 'Error deleting user', error: err.message });
    } finally {
      if (connectionAuth) connectionAuth.release();
      if (connectionMain) connectionMain.release();
    }
  }
};

module.exports = authController;