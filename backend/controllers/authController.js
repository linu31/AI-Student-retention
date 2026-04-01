const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const generateToken = (id, email, name) => {
  return jwt.sign(
    { id, email, name },
    process.env.JWT_SECRET || 'your-secret-key-change-this',
    { expiresIn: '7d' }
  );
};

const authController = {
  // Check if admin exists (for initial setup)
  async checkAdminExists(req, res) {
    try {
      const count = await Admin.countDocuments();
      res.json({ exists: count > 0 });
    } catch (error) {
      console.error('Check admin error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  // Signup - Only allowed if no admin exists
  async signup(req, res) {
    try {
      const { email, password, name } = req.body;

      // Check if admin already exists
      const adminCount = await Admin.countDocuments();
      if (adminCount > 0) {
        return res.status(400).json({ 
          error: 'Admin already exists. Only one admin account is allowed.' 
        });
      }

      // Check if email already exists
      const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
      if (existingAdmin) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Create new admin
      const admin = new Admin({
        email: email.toLowerCase(),
        password,
        name: name || 'Admin'
      });

      await admin.save();

      // Generate token
      const token = generateToken(admin._id, admin.email, admin.name);

      res.status(201).json({
        success: true,
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Signup failed' });
    }
  },

  // Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Check if admin exists
      const admin = await Admin.findOne({ email: email.toLowerCase() });
      if (!admin) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const isPasswordValid = await admin.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate token
      const token = generateToken(admin._id, admin.email, admin.name);

      res.json({
        success: true,
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  },

  // Get current admin
  async getCurrentAdmin(req, res) {
    try {
      const admin = await Admin.findById(req.user.id).select('-password');
      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      res.json(admin);
    } catch (error) {
      console.error('Get admin error:', error);
      res.status(500).json({ error: 'Failed to get admin' });
    }
  }
};

module.exports = authController;