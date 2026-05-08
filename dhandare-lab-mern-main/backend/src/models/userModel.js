const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['patient', 'admin', 'frontdesk', 'labtech'], default: 'patient' },
  createdAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date }, // <--- Added missing comma here
  
  // These are the new lines required for the password reset logic:
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
});

// ✅ FIX: Removed 'next' parameter completely
userSchema.pre('save', async function () {
  // If password is not modified, simply return to exit
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);