const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer'); 

// --- 1. CONFIGURATION (ENTER YOUR DETAILS HERE) ---
// ⚠️ REPLACE THE TEXT INSIDE THE QUOTES WITH YOUR ACTUAL DETAILS ⚠️
const MY_EMAIL = 'desaiayush487@gmail.com '; 
const MY_PASSWORD = 'zmtjjqkdiqfptcmq'; 

// --- 2. INTERNAL EMAIL FUNCTION ---
const sendEmailInternal = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: MY_EMAIL, pass: MY_PASSWORD },
    });

    await transporter.sendMail({
      from: `Dhandare Lab <${MY_EMAIL}>`,
      to: to,
      subject: subject,
      html: `<div style="padding: 20px; border: 1px solid #ddd;">
               <h2 style="color: blue;">Dhandare Lab</h2>
               <p>${text}</p>
             </div>`,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Email Failed: ${error.message}`);
  }
};

// --- 3. CONTROLLERS ---

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register & Send Email OTP
const registerUser = async (req, res) => {
  const { fullName, email, password, phone, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; 

    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      role: role || 'patient',
      otp,
      otpExpires,
      isVerified: false,
    });

    if (user) {
      // ✅ Using the internal function correctly here
      await sendEmailInternal(user.email, 'Verification OTP', `Your OTP is: ${otp}`);
      
      res.status(201).json({ 
        message: 'Registration successful. Please check your email for OTP.',
        email: user.email 
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Verify OTP
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (String(user.otp).trim() !== String(otp).trim() || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or Expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend OTP
const resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; 
    await user.save({ validateBeforeSave: false });

    await sendEmailInternal(user.email, 'New OTP Code', `Your new OTP is: ${otp}`);
    res.status(200).json({ message: "New OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Could not resend OTP" });
  }
};

// @desc    Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        return res.status(401).json({ message: 'Account not verified. Please check email for OTP.' });
      }
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    await sendEmailInternal(user.email, 'Password Reset Code', `Your Reset Code is: ${otp}`);
    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Reset OTP
const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (String(user.otp).trim() !== String(otp).trim() || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or Expired OTP" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, resetToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");
  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or Expired Token" });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password Updated Successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- FINAL EXPORT ---
module.exports = { 
  registerUser, 
  verifyOtp, 
  loginUser, 
  resendOtp, 
  forgotPassword, 
  verifyResetOtp, 
  resetPassword 
};