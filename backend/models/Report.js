const mongoose = require('mongoose');

const ticketStatusSchema = new mongoose.Schema({
  status: { type: String, required: true },
  label: { type: String, required: true },
  description: { type: String },
  timestamp: { type: Date, default: Date.now },
  updatedBy: { type: String, default: 'System' }
});

const reportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ticketId: { type: String, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  damageType: { 
    type: String, 
    enum: ['pothole', 'crack', 'flooding', 'broken_barrier', 'landslide', 'other'],
    required: true 
  },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    required: true 
  },
  imageUrl: { type: String, required: true },
  imagePublicId: { type: String },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String },
    city: { type: String },
    state: { type: String }
  },
  aiAnalysis: {
    isValidDamage: { type: Boolean },
    confidence: { type: Number },
    detectedType: { type: String },
    reasoning: { type: String }
  },
  currentStatus: { 
    type: String, 
    enum: ['submitted', 'under_review', 'assigned', 'work_in_progress', 'resolved', 'rejected'],
    default: 'submitted'
  },
  ticketFlow: [ticketStatusSchema],
  pointsAwarded: { type: Number, default: 0 },
  emailSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-generate ticket ID
reportSchema.pre('save', async function(next) {
  if (!this.ticketId) {
    const count = await mongoose.model('Report').countDocuments();
    this.ticketId = `RD${String(count + 1001).padStart(5, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Report', reportSchema);
