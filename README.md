# Sequoia Print Website Backend

<table style="border-collapse: collapse; border: none;">
  <tr>
    <td>
      <a href="https://sequoia-print.com">
        <img src="https://voicemsgsequoia.s3.ap-south-1.amazonaws.com/logo1.png" alt="Sequoia Print Logo" width="500"/>
      </a>
    </td>
    <td>
      <h3>About Sequoia Print Website Backend</h3>
      <p>This <strong>backend</strong> is built with <strong>Node.js</strong> and <strong>Express.js</strong>, integrated with <strong>MySQL (AWS RDS)</strong> for relational data management. It is hosted on <strong>AWS EC2</strong> for scalable compute power, and user-uploaded photos are stored securely in <strong>AWS S3</strong>.</p>
    </td>
  </tr>
</table>

---

## 🛠️ Installation (Backend)

1. Install **Node.js** from [https://nodejs.org](https://nodejs.org)  
2. Clone the repository:
   ```bash
   git clone https://github.com/sequoiaprint/website-2.0-backend
   ```
3. Switch to the main branch (default is `master`):
   ```bash
   cd website-2.0-backend
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the server:
   ```bash
   node server.js
   ```

## 🏗️ Infrastructure Architecture

<table style="border-collapse: collapse; border: none;">
  <tr>
    <td align="center">
      <img src="https://cdn-icons-png.flaticon.com/512/873/873120.png" alt="AWS EC2" width="50"/><br/>
      <strong>AWS EC2</strong><br/>
      Compute hosting
    </td>
    <td align="center">
      <img src="https://cdn-icons-png.flaticon.com/512/873/873107.png" alt="AWS RDS" width="50"/><br/>
      <strong>AWS RDS</strong><br/>
      MySQL database
    </td>
    <td align="center">
      <img src="https://cdn-icons-png.flaticon.com/512/873/873086.png" alt="AWS S3" width="50"/><br/>
      <strong>AWS S3</strong><br/>
      File storage
    </td>
    <td align="center">
      <img src="https://cdn-icons-png.flaticon.com/512/919/919825.png" alt="Node.js" width="50"/><br/>
      <strong>Node.js</strong><br/>
      Runtime
    </td>
    <td align="center">
      <img src="https://cdn-icons-png.flaticon.com/512/873/873107.png" alt="Express" width="50"/><br/>
      <strong>Express</strong><br/>
      Server framework
    </td>
    <td align="center">
      <img src="https://cdn-icons-png.flaticon.com/512/919/919836.png" alt="MySQL" width="50"/><br/>
      <strong>MySQL</strong><br/>
      Database
    </td>
  </tr>
</table>

## ⚙️ Environment Configuration

<details>
<summary><strong>🔒 .env File Configuration</strong></summary>

Create a `.env` file in your project root with the following variables:

```ini
# Database Configuration
DB_HOST=your_rds_endpoint
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=your_database_name
DB_TIMEZONE=your_timezone

# Server Configuration
PORT=your_server_port
NODE_ENV=development_or_production

# Email Configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
EMAIL_USER=your_email_username
EMAIL_PASSWORD=your_email_password

# AWS Configuration
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=your_s3_bucket_name

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
```
</details>

<details>
<summary><strong>🛠️ Environment Setup in server.js</strong></summary>

```javascript
require('dotenv').config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  timezone: process.env.DB_TIMEZONE
};

// Server configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV;

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
};

// AWS configuration
const awsConfig = {
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  bucketName: process.env.S3_BUCKET_NAME
};

// JWT configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN
};
```
</details>

## 🔐 Multi-Login System

The backend supports a comprehensive multi-login system with different user roles:

### User Roles
1. **Admin** - Full system access
2. **Staff** - Limited administrative access
3. **Customer** - Regular user access
4. **Guest** - Limited access without account

### Authentication Flow
<details>
<summary><strong>🔑 JWT Authentication Implementation</strong></summary>

```javascript
// Middleware for authentication
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Usage in routes
app.get('/admin/dashboard', authenticateToken, authorize(['admin']), (req, res) => {
  // Admin-only content
});

app.get('/staff/orders', authenticateToken, authorize(['admin', 'staff']), (req, res) => {
  // Admin and staff content
});
```
</details>

<details>
<summary><strong>👥 User Model with Role Support</strong></summary>

```javascript
const { getPool } = require('../config/db');

class UserModel {
  static async findByEmail(email) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = :email',
      { email }
    );
    return rows[0];
  }

  static async createUser(userData) {
    const pool = getPool();
    const [result] = await pool.query(
      'INSERT INTO users SET ?', 
      userData
    );
    return result.insertId;
  }

  static async updateLoginTimestamp(userId) {
    const pool = getPool();
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [userId]
    );
  }

  static async getUserRole(userId) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );
    return rows[0]?.role;
  }
}

module.exports = UserModel;
```
</details>

<details>
<summary><strong>🔐 Login Controller</strong></summary>

```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');

class AuthController {
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      await UserModel.updateLoginTimestamp(user.id);

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          name: user.name 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async register(req, res) {
    try {
      const { name, email, password, role = 'customer' } = req.body;

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const userId = await UserModel.createUser({
        name,
        email,
        password: hashedPassword,
        role,
        created_at: new Date()
      });

      // Generate token
      const token = jwt.sign(
        { id: userId, email, role, name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        token,
        user: { id: userId, name, email, role }
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = AuthController;
```
</details>

## 🗄️ Database Configuration

### Database Connection Setup

<details>
<summary><strong>🔌 MySQL Connection Pool Configuration</strong></summary>

Create `config/db.js` with the following configuration:

```javascript
const mysql = require('mysql2/promise');
let pool;

async function initializePool() {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: process.env.DB_TIMEZONE,
    namedPlaceholders: true
  });
  return pool;
}

function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  return pool;
}

module.exports = { initializePool, getPool };
```
</details>

<details>
<summary><strong>🚀 Initializing Database Connection</strong></summary>

In your `server.js`:

```javascript
const { initializePool } = require('./config/db');

// Initialize database connection
initializePool()
  .then(() => console.log('Database connected successfully'))
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
```
</details>

## 🔧 CORS Configuration

<details>
<summary><strong>🌐 CORS Setup</strong></summary>

```javascript
const app = express();

// Enable CORS with specific configuration
app.use(cors({
  origin: [
    'https://sequoia-print.com',         // Production domain
    'https://web.sequoia-print.com',     // Alternate domain
    'http://localhost:3000'              // Local development
  ],
  credentials: true,                     // Allow credentials
  allowedHeaders: [                      // Permitted headers
    'Content-Type', 
    'Authorization', 
    'visitor-id'                        // Custom header
  ],
  methods: [                            // Allowed methods
    'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'
  ],
  optionsSuccessStatus: 200             // Legacy support
}));

// Handle preflight requests
app.options('*', cors());

// Enable JSON parsing
app.use(express.json());
```
</details>

## 📦 Model Implementation Example

<details>
<summary><strong>🛠️ Sample Model Usage</strong></summary>

Create `models/userModel.js` as an example:

```javascript
const { getPool } = require('../config/db');

class UserModel {
  static async getUserById(userId) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at, last_login FROM users WHERE id = :userId',
      { userId }
    );
    return rows[0];
  }

  static async createUser(userData) {
    const pool = getPool();
    const [result] = await pool.query(
      'INSERT INTO users SET ?', 
      userData
    );
    return result.insertId;
  }

  static async updateUser(userId, updates) {
    const pool = getPool();
    const [result] = await pool.query(
      'UPDATE users SET ? WHERE id = ?',
      [updates, userId]
    );
    return result.affectedRows;
  }

  static async deleteUser(userId) {
    const pool = getPool();
    const [result] = await pool.query(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );
    return result.affectedRows;
  }
}

module.exports = UserModel;
```
</details>

<details>
<summary><strong>🔍 Using Models in Controllers</strong></summary>

Example controller usage (`controllers/Controllers.js`):

```javascript
const UserModel = require('../models/userModel');

class UserController {
  static async getUser(req, res) {
    try {
      const user = await UserModel.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createUser(req, res) {
    try {
      const userId = await UserModel.createUser(req.body);
      res.status(201).json({ id: userId });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = UserController;
```
</details>

## 📊 Services Overview

<div style="position: relative; width: 500px; height: 500px; 
    box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); 
    margin-top: 1.6em; margin-bottom: 0.9em; 
    overflow: hidden; border-radius: 8px; will-change: transform;">
  
  <iframe loading="lazy" 
    style="position: absolute; width: 100%; height: 100%; 
    top: 0; left: 0; border: none; padding: 0; margin: 0;" 
    src="https://www.canva.com/design/DAGxV9zEMo4/u6RBV3mvXNoTMSid3i9FUA/view?embed" 
    allowfullscreen>
  </iframe>
</div>

<a href="https://www.canva.com/design/DAGxV9zEMo4/u6RBV3mvXNoTMSid3i9FUA/view?utm_content=DAGxV9zEMo4&utm_campaign=designshare&utm_medium=embeds&utm_source=link" 
   target="_blank" rel="noopener">
   View Our Services
</a>


