import { useState, useEffect } from 'react';
import axios from 'axios';
import API from '../config/api';

const CATEGORIES = ['Developer', 'Designer', 'Data Scientist', 'Product Manager', 'DevOps', 'Marketing', 'Finance', 'Android', 'iOS'];
const LOCATIONS = ['India', 'Remote', 'USA', 'UK', 'Canada', 'Australia'];

export default function LiveJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('Developer');
  const [location, setLocation] = useState('India');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [query, location]);

  async function fetchJobs() {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/market/jobs`, {
        params: { query, location }
      });
      setJobs(res.data.jobs || []);
    } catch {
      setJobs([]);
    }
    setLoading(false);
  }

  const filtered = search.trim()
    ? jobs.filter(j =>
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.company.toLowerCase().includes(search.toLowerCase())
      )
    : jobs;

  function timeAgo(dateStr) {
    if (!dateStr) return 'Recently';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block bg-white bg-opacity-20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wide">
            🔴 Live Market
          </span>
          <h1 className="text-4xl font-bold mb-2">Live Job Openings</h1>
          <p className="text-blue-100 mb-6">Real-time jobs from top companies across the market</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or company..."
              className="flex-1 px-4 py-3 rounded-xl text-gray-800 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Category chips */}
        <div className="flex gap-2 flex-wrap mb-4">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setQuery(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                query === c
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Location chips */}
        <div className="flex gap-2 flex-wrap mb-6">
          {LOCATIONS.map(l => (
            <button
              key={l}
              onClick={() => setLocation(l)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                location === l
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-green-400'
              }`}
            >
              📍 {l}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-4">
            {filtered.length} live openings for <strong>{query}</strong> in <strong>{location}</strong>
          </p>
        )}

        {/* Job cards */}
        {loading ? (
          <div className="grid gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium">No jobs found. Try a different category or location.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map(job => (
              <div key={job.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex gap-4 items-start">
                  {job.logo ? (
                    <img src={job.logo} alt={job.company} className="w-12 h-12 rounded-xl object-contain border border-gray-100 p-1" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                      {job.company?.[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-base">{job.title}</h3>
                        <p className="text-gray-500 text-sm">{job.company}</p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(job.posted)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">📍 {job.location}</span>
                      {job.type && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{job.type}</span>}
                      {job.salary !== 'Not disclosed' && <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">💰 {job.salary}</span>}
                    </div>
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{job.description}</p>
                    <div className="mt-3">
                      <a
                        href={job.applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
                      >
                        Apply Now →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
