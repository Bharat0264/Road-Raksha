const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');
const { sendAuthorityEmail, sendUserConfirmation } = require('../utils/email');
const { analyzeImageWithAI, getBadgesForPoints, calculatePoints } = require('../utils/ai');

const TICKET_FLOW_INIT = (ticketId) => [
  { status: 'submitted', label: 'Report Submitted', description: 'Your damage report has been successfully submitted.', timestamp: new Date() },
];

// Submit a new report
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, damageType, severity, lat, lng, address, city, state } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Image is required' });

    const imageUrl = req.file.path;
    const imagePublicId = req.file.filename;

    // AI Analysis
    const aiAnalysis = await analyzeImageWithAI(imageUrl);

    if (!aiAnalysis.isValidDamage) {
      return res.status(422).json({ 
        message: 'The uploaded image does not appear to show road damage. Please upload a clear photo of the damaged road.',
        aiAnalysis 
      });
    }

    const points = calculatePoints(severity);
    const report = await Report.create({
      user: req.user._id,
      title, description, damageType, severity,
      imageUrl, imagePublicId,
      location: { lat: parseFloat(lat), lng: parseFloat(lng), address, city, state },
      aiAnalysis,
      currentStatus: 'submitted',
      ticketFlow: TICKET_FLOW_INIT(),
      pointsAwarded: points,
    });

    // Update user points & badges
    const user = await User.findById(req.user._id);
    user.points += points;
    const newBadges = getBadgesForPoints(user.points, user.badges);
    user.badges.push(...newBadges);
    await user.save();

    // Send emails
    try {
      await sendAuthorityEmail(report, user);
      await sendUserConfirmation(report, user);
      report.emailSent = true;
      await report.save();
    } catch (emailErr) {
      console.error('Email error:', emailErr);
    }

    const populated = await Report.findById(report._id).populate('user', 'name email mobile');
    res.status(201).json({ report: populated, newBadges, pointsEarned: points });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get all reports for current user
router.get('/my', auth, async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all reports (for map - nearby)
router.get('/nearby', auth, async (req, res) => {
  try {
    const reports = await Report.find({ currentStatus: { $ne: 'resolved' } })
      .select('location damageType severity currentStatus createdAt title imageUrl')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single report by ticket ID
router.get('/ticket/:ticketId', auth, async (req, res) => {
  try {
    const report = await Report.findOne({ ticketId: req.params.ticketId }).populate('user', 'name email');
    if (!report) return res.status(404).json({ message: 'Ticket not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get report by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('user', 'name email');
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update ticket status (admin/authority simulation)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, description } = req.body;
    const statusLabels = {
      under_review: 'Under Review',
      assigned: 'Assigned to Team',
      work_in_progress: 'Work In Progress',
      resolved: 'Resolved',
      rejected: 'Rejected'
    };

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.currentStatus = status;
    report.ticketFlow.push({
      status,
      label: statusLabels[status] || status,
      description: description || `Status updated to ${statusLabels[status]}`,
      timestamp: new Date(),
    });
    await report.save();
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Dashboard stats
router.get('/stats/dashboard', auth, async (req, res) => {
  try {
    const total = await Report.countDocuments({ user: req.user._id });
    const resolved = await Report.countDocuments({ user: req.user._id, currentStatus: 'resolved' });
    const pending = await Report.countDocuments({ user: req.user._id, currentStatus: { $in: ['submitted', 'under_review', 'assigned', 'work_in_progress'] } });
    const recentReports = await Report.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(3);
    const user = await User.findById(req.user._id).select('points badges');
    res.json({ total, resolved, pending, points: user.points, badges: user.badges, recentReports });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
