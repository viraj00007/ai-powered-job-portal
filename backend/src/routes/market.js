const express = require('express');
const axios = require('axios');
const router = express.Router();

const REMOTIVE_CATEGORIES = {
  developer: 'software-dev',
  designer: 'design',
  'data scientist': 'data',
  'product manager': 'product',
  devops: 'devops-sysadmin',
  marketing: 'marketing',
  finance: 'finance-legal',
  android: 'software-dev',
  ios: 'software-dev',
};

async function fetchFromRemotive(query) {
  const category = REMOTIVE_CATEGORIES[query.toLowerCase()] || 'software-dev';
  const { data } = await axios.get('https://remotive.com/api/remote-jobs', {
    params: { category, limit: 20 },
  });
  return (data.jobs || []).map(job => ({
    id: String(job.id),
    title: job.title,
    company: job.company_name,
    location: 'Remote',
    type: job.job_type || 'Full-time',
    salary: job.salary || 'Not disclosed',
    description: job.description?.replace(/<[^>]*>/g, '').slice(0, 300) + '...',
    applyLink: job.url,
    logo: job.company_logo,
    posted: job.publication_date,
  }));
}

async function fetchFromJSearch(query, location, page) {
  const { data } = await axios.get('https://jsearch.p.rapidapi.com/search', {
    params: {
      query: `${query} in ${location}`,
      page,
      num_pages: '1',
      date_posted: 'week',
    },
    headers: {
      'x-rapidapi-host': 'jsearch.p.rapidapi.com',
      'x-rapidapi-key': process.env.JSEARCH_API_KEY,
    },
    timeout: 10000,
  });
  if (!data.data?.length) return null;
  return data.data.map(job => ({
    id: job.job_id,
    title: job.job_title,
    company: job.employer_name,
    location: job.job_city ? `${job.job_city}, ${job.job_country}` : job.job_country,
    type: job.job_employment_type,
    salary: job.job_min_salary ? `$${job.job_min_salary}–$${job.job_max_salary}` : 'Not disclosed',
    description: job.job_description?.slice(0, 300) + '...',
    applyLink: job.job_apply_link,
    logo: job.employer_logo,
    posted: job.job_posted_at_datetime_utc,
  }));
}

// GET /api/market/jobs?query=developer&location=india
router.get('/jobs', async (req, res) => {
  const { query = 'developer', location = 'india', page = '1' } = req.query;

  // Try JSearch first, fall back to Remotive if quota exceeded or error
  try {
    const jobs = await fetchFromJSearch(query, location, page);
    if (jobs && jobs.length > 0) return res.json({ jobs, source: 'jsearch' });
    throw new Error('No results from JSearch');
  } catch (err) {
    console.log('JSearch failed, using Remotive fallback:', err.message);
  }

  try {
    const jobs = await fetchFromRemotive(query);
    return res.json({ jobs, source: 'remotive' });
  } catch (err) {
    console.error('Remotive error:', err.message);
    return res.json({ jobs: [] });
  }
});

module.exports = router;
