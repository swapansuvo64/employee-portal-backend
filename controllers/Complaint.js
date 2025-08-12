const Complaints = require('../models/Complaint');
const pool = require('../dbConfig/db');
const sendEmail = require('../middleware/sendEmail');

const complaintController = {
createComplaint: async (req, res) => {
    try {
      const { title, category, priority, description, urls, createdBy, isAnonymous } = req.body;

      if (!title || !category || !description) {
        return res.status(400).json({ success: false, message: 'Title, category and description are required' });
      }

      // Convert isAnonymous to boolean (handles "1", "true", 1, etc.)
      const isAnonymousBool = Boolean(Number(isAnonymous)) || isAnonymous === 'true' || isAnonymous === true;

      let userInfo = { firstname: 'Anonymous', lastname: '', email: '' };
      
      // Only fetch user details if not anonymous and createdBy is provided
      if (!isAnonymousBool && createdBy) {
        const [userRows] = await pool.execute(
          `SELECT firstname, lastname, email FROM profile WHERE uid = ?`,
          [createdBy]
        );

        if (userRows.length) {
          userInfo = userRows[0];
        }
      }

      // Insert complaint
      const result = await Complaints.create({ 
        title, 
        category, 
        priority, 
        description, 
        urls, 
        createdBy: isAnonymousBool ? null : createdBy,
        isAnonymous: isAnonymousBool 
      });

      // Send Email Notification (without name if anonymous)
      await sendEmail({
        to: 'swapansuvo648@gmail.com',
        subject: `New Complaint Submitted ${!isAnonymousBool ? `by ${userInfo.firstname} ${userInfo.lastname}` : 'Anonymously'}`,
        html: `
          <h2>Complaint Details</h2>
          ${!isAnonymousBool ? `<p><b>Submitted By:</b> ${userInfo.firstname} ${userInfo.lastname}</p>` : ''}
          <p><b>Title:</b> ${title}</p>
          <p><b>Category:</b> ${category}</p>
          <p><b>Priority:</b> ${priority || 'Low'}</p>
          <p><b>Description:</b> ${description}</p>
          ${urls ? `<p><b>Attachment:</b> <a href="${urls}" target="_blank">View</a></p>` : ''}
        `
      });

      res.status(201).json({
        success: true,
        message: 'Complaint submitted successfully',
        insertId: result.insertId,
        isAnonymous: isAnonymousBool
      });
    } catch (err) {
      console.error('Error submitting complaint:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  getAllComplaints: async (req, res) => {
    try {
      const rows = await Complaints.getAll();
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('Error fetching complaints:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = complaintController;