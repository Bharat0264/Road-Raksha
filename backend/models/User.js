const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  mobile: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  password: { type: String, required: true },
  points: { type: Number, default: 0 },
  badges: [{ 
    name: String, 
    icon: String, 
    earnedAt: { type: Date, default: Date.now } 
  }],
  resetOTP: String,
  resetOTPExpiry: Date,
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
