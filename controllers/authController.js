const User = require('../models/User');
const pool = require('../dbConfig/db');
const authController = {
  async signup(req, res) {
    try {
      const { name, password, role } = req.body;
      
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
    const { name, password } = req.body;
    
    if (!name || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Name and password are required' 
      });
    }

    const user = await User.findUserByName(name);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
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
    await User.storeToken(user.id, token);

    // Fetch profile information
    const [profileRows] = await pool.execute('SELECT * FROM profile WHERE uid = ?', [user.uid]);
    const profile = profileRows[0] || {};

    res.json({ 
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          uid: user.uid
        },
        profile: {
          username: profile.username,
          uid: profile.uid,
          firstname: profile.firstname,
          lastname: profile.lastname,
          profilepicurl: profile.profilepicurl,
          role: profile.role,
          designation: profile.designation
          // Add other profile fields you want to return
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
      await User.clearToken(userId);
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
  }
};

module.exports = authController;