const Profile = require('../models/Profile');
const authMiddleware = require('../middleware/authMiddleware');

class ProfileController {
  static async getProfile(req, res) {
    try {
      const { uid } = req.params;
     // console.log('Fetching profile for UID:', uid);
      const profile = await Profile.getByUid(uid);
      
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Error getting profile:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getAllProfiles(req, res) {
    try {
      const profiles = await Profile.getAll();
     // console.log(profiles)
      res.json({
        success: true,
        data: profiles
      });
    } catch (error) {
      console.error('Error getting all profiles:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

static async updateProfile(req, res) {
    try {
        const { uid } = req.params;
        const updateData = req.body;
        console.log('Update data received:', updateData);

        if (!uid) {
            return res.status(400).json({
                success: false,
                message: 'UID is required'
            });
        }

        const existingProfile = await Profile.getByUid(uid);
        if (!existingProfile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        const updatedProfile = await Profile.update(uid, updateData);
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedProfile
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

  static async deleteProfile(req, res) {
    try {
      const { uid } = req.params;

      const existingProfile = await Profile.getByUid(uid);
      if (!existingProfile) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found'
        });
      }

      await Profile.delete(uid);
      res.json({
        success: true,
        message: 'Profile deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting profile:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }



//-----------------------------------Schedule Management-----------------------------------
  static async updateWorkSchedule(req, res) {
  try {
    const { id, uid } = req.params;
    const updateData = req.body;

    if (!id || !uid) {
      return res.status(400).json({
        success: false,
        message: 'Both ID and UID are required'
      });
    }

    const updatedSchedule = await Profile.updateWorkSchedule(id, uid, updateData);
    
    res.json({
      success: true,
      data: updatedSchedule
    });
  } catch (error) {
    console.error('Error updating work schedule:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update work schedule'
    });
  }
}

static async deleteWorkSchedule(req, res) {
  try {
    const { id, uid } = req.params;

    if (!id || !uid) {
      return res.status(400).json({
        success: false,
        message: 'Both ID and UID are required'
      });
    }

    await Profile.deleteWorkSchedule(id, uid);
    
    res.json({
      success: true,
      message: 'Work schedule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting work schedule:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete work schedule'
    });
  }
}

static async createWorkSchedule  (req, res)  {
  try {
    const { uid } = req.params; 
    const schedule = await Profile.createWorkSchedule(uid, req.body);
    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


}

module.exports = ProfileController;