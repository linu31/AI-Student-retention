const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const adminSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  createdAt: Date
});

const Admin = mongoose.model('Admin', adminSchema);

async function createAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ai_based_retention');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = new Admin({
      email: 'admin@retention.com',
      password: hashedPassword,
      name: 'Admin User',
      createdAt: new Date()
    });
    
    await admin.save();
    console.log('Admin created successfully!');
    console.log('Email: admin@retention.com');
    console.log('Password: admin123');
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();