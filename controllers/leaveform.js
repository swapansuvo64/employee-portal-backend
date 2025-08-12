const LeaveForm = require('../models/leaveform');
const pool = require('../dbConfig/db'); // needed to fetch profile info
const sendEmail = require('../middleware/sendEmail');

const leaveFormController = {
  createLeaveForm: async (req, res) => {
    try {
      const { type, startDate, endDate, reason, urls, createdBy } = req.body;

      if (!type || !startDate || !endDate || !reason || !createdBy) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      // Fetch user's name from profile table
      const [userRows] = await pool.execute(
        `SELECT firstname, lastname, email FROM profile WHERE uid = ?`,
        [createdBy]
      );

      if (!userRows.length) {
        return res.status(404).json({ success: false, message: 'User profile not found' });
      }

      const { firstname, lastname, email } = userRows[0];

      // Insert leave form
      const result = await LeaveForm.create({ type, startDate, endDate, reason, urls, createdBy });

      // Send Email Notification with full name and description
      await sendEmail({
        to: 'swapansuvo648@gmail.com', // recipient email
        subject: `New Leave Form Submitted by ${firstname} ${lastname}`,
        html: `
          <h2>Leave Request Details</h2>
          <p><b>Submitted By:</b> ${firstname} ${lastname}</p>
          <p><b>Type:</b> ${type}</p>
          <p><b>Start Date:</b> ${startDate}</p>
          <p><b>End Date:</b> ${endDate}</p>
          <p><b>Description:</b> ${reason}</p>
          ${urls ? `<p><b>Attachment:</b> <a href="${urls}" target="_blank">View</a></p>` : ''}
        `
      });

      res.status(201).json({
        success: true,
        message: 'Leave form created successfully and email sent',
        insertId: result.insertId
      });
    } catch (err) {
      console.error('Error creating leave form:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  getAllLeaveForms: async (req, res) => {
    try {
      const rows = await LeaveForm.getAll();
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('Error fetching leave forms:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = leaveFormController;
