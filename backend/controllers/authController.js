const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const loginAdmin = async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const admin = await Admin.findOne({ email });

    if (admin && (await bcrypt.compare(password, admin.password))) {
      return res.json({
        _id: admin.id,
        email: admin.email,
        token: generateToken(admin._id),
      });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error' });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password');

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    return res.json({
      _id: admin._id,
      email: admin.email,
      token: req.headers.authorization?.split(' ')[1],
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { loginAdmin, getAdminProfile };
