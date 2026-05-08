const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  verifyOtp, 
  loginUser, 
  resendOtp,
  forgotPassword, 
  verifyResetOtp, 
  resetPassword 
} = require('../controllers/authController');

// Registration & Login
router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/login', loginUser);
router.post('/resend-otp', resendOtp);

// Password Reset Flow
router.post("/forgotpassword", forgotPassword);       // Step 1: Send OTP
router.post("/verify-reset-otp", verifyResetOtp);     // Step 2: Verify OTP
router.put("/resetpassword/:resetToken", resetPassword); // Step 3: New Password

module.exports = router;