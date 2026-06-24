import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API from '../config/api';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${API}/api/jobs/${id}`)
      .then(res => setJob(res.data))
      .catch(() => {
        const fallback = SAMPLE_JOBS.find(j => j.id === id);
        if (fallback) setJob(fallback);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleApply() {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    setApplying(true);
    setError('');
    try {
      await axios.post(
        `${API}/api/jobs/${id}/apply`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplied(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Application failed. Please try again.');
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-32 text-gray-500">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-lg">Job not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 hover:underline text-sm mb-6 flex items-center gap-1"
      >
        ← Back to jobs
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{job.title}</h1>
            <p className="text-blue-600 text-lg font-semibold mt-1">{job.company}</p>
          </div>
          <span className="shrink-0 bg-blue-50 text-blue-700 font-medium px-4 py-1.5 rounded-full text-sm">
            {job.category || 'Tech'}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
          <span className="flex items-center gap-1">📍 {job.location}</span>
          <span className="flex items-center gap-1">💼 {job.type}</span>
          {job.salary && <span className="flex items-center gap-1">💰 {job.salary}</span>}
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Job Description</h2>
        <p className="text-gray-600 leading-relaxed whitespace-pre-line mb-8">{job.description}</p>

        {job.requirements?.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Requirements</h2>
            <ul className="space-y-2 mb-8">
              {job.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-600">
                  <span className="text-blue-500 mt-0.5">✓</span> {r}
                </li>
              ))}
            </ul>
          </>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {applied ? (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-6 py-4 text-center font-medium">
            ✅ Application submitted! You'll hear back soon.
          </div>
        ) : (
          <button
            onClick={handleApply}
            disabled={applying}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-10 py-3 rounded-lg transition-colors"
          >
            {applying ? 'Submitting…' : 'Apply Now'}
          </button>
        )}
      </div>
    </div>
  );
}

const SAMPLE_JOBS = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'TechCorp',
    location: 'Remote',
    type: 'Full-time',
    salary: '$80k-$110k',
    category: 'Engineering',
    description: 'Build modern web apps using React and Tailwind CSS. Join our growing team and work on exciting products used by millions.',
    requirements: ['3+ years of React experience', 'Strong CSS/Tailwind skills', 'Experience with REST APIs', 'Git proficiency'],
  },
];
