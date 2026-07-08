const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/market/jobs?query=developer&location=india
router.get('/jobs', async (req, res) => {
  try {
    const { query = 'developer', location = 'india', page = '1' } = req.query;

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
    });

    if (!data.data) return res.json({ jobs: [] });

    const jobs = data.data.map(job => ({
      id: job.job_id,
      title: job.job_title,
      company: job.employer_name,
      location: job.job_city ? `${job.job_city}, ${job.job_country}` : job.job_country,
      type: job.job_employment_type,
      salary: job.job_min_salary
        ? `$${job.job_min_salary}–$${job.job_max_salary}`
        : 'Not disclosed',
      description: job.job_description?.slice(0, 300) + '...',
      applyLink: job.job_apply_link,
      logo: job.employer_logo,
      posted: job.job_posted_at_datetime_utc,
    }));

    res.json({ jobs });
  } catch (err) {
    console.error('JSearch error:', err.message);
    console.error('JSearch full error:', err.response?.data || err.stack);
    res.status(200).json({ jobs: [], error: err.message });
  }
});

module.exports = router;
