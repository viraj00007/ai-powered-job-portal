const express = require('express');
const Application = require('../models/Application');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/applications  — returns the logged-in user's applications
router.get('/', auth, async (req, res) => {
  try {
    const apps = await Application.find({ applicant: req.user.id })
      .populate('job', 'title company location type')
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/applications/job/:jobId  — employer sees applicants for a job
router.get('/job/:jobId', auth, async (req, res) => {
  try {
    const apps = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email')
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/applications/:id/status  — employer updates status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!app) return res.status(404).json({ message: 'Application not found' });
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
