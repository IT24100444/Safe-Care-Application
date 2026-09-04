import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'safecare_super_secret_jwt_key_2026_healthcare_mgmt_system',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'patient', phone = '' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Create user (password is encrypted by User pre-save hook)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      phone
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        assignedFacility: user.assignedFacility
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user & include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        assignedFacility: user.assignedFacility
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('assignedFacility');
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get demo credentials for instant evaluation
// @route   GET /api/auth/demo-accounts
// @access  Public
export const getDemoAccounts = (req, res) => {
  res.status(200).json({
    success: true,
    accounts: [
      {
        role: 'admin',
        title: 'System Administrator',
        email: 'admin@safecare.com',
        description: 'Full CRUD access to all facilities, services, statuses, and requests'
      },
      {
        role: 'manager',
        title: 'Facility Manager',
        email: 'manager@safecare.com',
        description: 'Can manage own hospital/clinic, update services and facility availability'
      },
      {
        role: 'staff',
        title: 'Healthcare Staff',
        email: 'staff@safecare.com',
        description: 'Can update live operational status, wait times, and emergency flags'
      },
      {
        role: 'patient',
        title: 'Patient / Citizen',
        email: 'patient@safecare.com',
        description: 'Can browse facilities, services, create care requests, and get AI recommendations'
      }
    ],
    defaultPassword: 'Password123!'
  });
};
