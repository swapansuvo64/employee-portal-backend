require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const profileRouter = require('./routes/profile');
const fileUploadRoutes = require('./routes/fileUploadRoutes');
const NewsUpdateController = require('./routes/newsUpdateRoutes');
const InsightController =require('./routes/insight');
const leave=require('./routes/leaveform')
const Complaint=require('./routes/Complaint')
const app = express();

// Middleware
app.use(cors({
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRouter);
app.use('/api/files', fileUploadRoutes);
app.use('/api/news', NewsUpdateController);
app.use('/api/insight',InsightController);
app.use('/api/leave',leave);
app.use('/api/complaint',Complaint);
// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Internal server error' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Endpoint not found' 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});