const express = require('express');
const nodemailer = require('nodemailer');
const Application = require('../models/Application');
const auth = require('../middleware/auth');

function sendStatusEmail(to, name, jobTitle, company, status) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  const messages = {
    reviewed: 'Your application has been reviewed by the employer.',
    interview: 'Congratulations! You have been shortlisted for an interview.',
    offer: 'Amazing news! You have received a job offer.',
    rejected: 'Unfortunately, your application was not selected this time. Keep going!',
    pending: 'Your application status has been updated.',
  };
  const colors = { reviewed: '#2563eb', interview: '#7c3aed', offer: '#16a34a', rejected: '#dc2626', pending: '#d97706' };
  transporter.sendMail({
    from: `"HireAI" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Application Update — ${jobTitle} at ${company}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
      <h2 style="color:#2563eb;margin-bottom:4px;">HireAI</h2>
      <p style="color:#6b7280;font-size:13px;margin-bottom:24px;">Application Status Update</p>
      <p>Hi <strong>${name}</strong>,</p>
      <p>${messages[status] || messages.pending}</p>
      <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="margin:0 0 8px 0;color:#374151;"><strong>Role:</strong> ${jobTitle}</p>
        <p style="margin:0 0 8px 0;color:#374151;"><strong>Company:</strong> ${company}</p>
        <p style="margin:0;"><strong>Status:</strong> <span style="color:${colors[status] || '#374151'};font-weight:bold;text-transform:capitalize;">${status}</span></p>
      </div>
      <a href="https://ai-powered-job-portal-two.vercel.app/dashboard" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:bold;margin-top:8px;">View Dashboard →</a>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px;">This is an automated notification from HireAI.</p>
    </div>`,
  }).catch(err => console.error('Email send error:', err.message));
}

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
    ).populate('applicant', 'name email').populate('job', 'title company');
    if (!app) return res.status(404).json({ message: 'Application not found' });
    sendStatusEmail(
      app.applicant?.email,
      app.applicant?.name,
      app.job?.title,
      app.job?.company,
      status
    );
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
