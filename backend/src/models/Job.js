const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  company:      { type: String, required: true, trim: true },
  location:     { type: String, required: true },
  type:         { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'], default: 'Full-time' },
  category:     { type: String, default: 'Tech' },
  salary:       { type: String },
  description:  { type: String, required: true },
  requirements: [{ type: String }],
  postedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
