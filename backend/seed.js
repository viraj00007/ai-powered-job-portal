require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Job = require('./src/models/Job');

const jobs = [
  { title: 'Frontend Developer', company: 'TechCorp', location: 'Remote', type: 'Full-time', salary: '₹8L-₹15L/yr', category: 'Engineering', description: 'Build modern web apps using React and Tailwind CSS. Join our growing team and work on exciting products used by millions.', requirements: ['3+ years React experience', 'Strong CSS/Tailwind skills', 'REST API experience', 'Git proficiency'] },
  { title: 'Backend Engineer', company: 'StartupXYZ', location: 'Mumbai, MH', type: 'Full-time', salary: '₹12L-₹22L/yr', category: 'Engineering', description: 'Design and build scalable Node.js APIs backed by MongoDB. Own features end-to-end on a small high-impact team.', requirements: ['Node.js & Express', 'MongoDB / NoSQL', 'REST & GraphQL APIs', '3+ years experience'] },
  { title: 'UI/UX Designer', company: 'DesignStudio', location: 'Bengaluru, KA', type: 'Contract', salary: '₹60-₹90k/mo', category: 'Design', description: 'Create beautiful, accessible user experiences for our enterprise product suite. Collaborate closely with engineering.', requirements: ['Figma proficiency', 'User research skills', 'Design systems experience', 'Portfolio required'] },
  { title: 'Data Scientist', company: 'AI Labs', location: 'Remote', type: 'Full-time', salary: '₹18L-₹30L/yr', category: 'Data', description: 'Apply ML to real-world business problems. Work with petabytes of data to build models that power our core product.', requirements: ['Python & pandas', 'Machine learning (sklearn, PyTorch)', 'SQL proficiency', 'Statistics background'] },
  { title: 'DevOps Engineer', company: 'CloudBase', location: 'Hyderabad, TS', type: 'Full-time', salary: '₹14L-₹24L/yr', category: 'Engineering', description: 'Build and maintain CI/CD pipelines, Kubernetes clusters, and AWS infrastructure for a fast-growing SaaS.', requirements: ['AWS / GCP', 'Kubernetes & Docker', 'Terraform', 'Linux systems knowledge'] },
  { title: 'Product Manager', company: 'ProductCo', location: 'Pune, MH', type: 'Full-time', salary: '₹16L-₹28L/yr', category: 'Product', description: 'Drive product strategy and roadmap for our B2B platform. Work with customers, designers, and engineers daily.', requirements: ['3+ years PM experience', 'Data-driven mindset', 'Excellent communication', 'B2B SaaS background'] },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected');

  let employer = await User.findOne({ role: 'employer' });
  if (!employer) {
    employer = await User.create({ name: 'Admin Employer', email: 'employer@jobportal.com', password: 'admin1234', role: 'employer' });
    console.log('Created employer account');
  }

  await Job.deleteMany({});
  await Job.insertMany(jobs.map(j => ({ ...j, postedBy: employer._id })));
  console.log(`Seeded ${jobs.length} jobs`);
  await mongoose.disconnect();
}

seed().catch(e => { console.error(e.message); process.exit(1); });
