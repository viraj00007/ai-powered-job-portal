import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import API from '../config/api';

const CATEGORIES = ['All', 'Engineering', 'Design', 'Data', 'Product', 'Marketing', 'Finance'];
const JOB_TYPES = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="flex gap-3 mt-3">
            <div className="h-4 bg-gray-100 rounded w-20" />
            <div className="h-4 bg-gray-100 rounded w-24" />
            <div className="h-4 bg-gray-100 rounded w-20" />
          </div>
        </div>
        <div className="h-6 w-16 bg-gray-100 rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-4/5" />
      </div>
    </div>
  );
}

export default function JobListing() {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState('');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All');
  const [activeType, setActiveType] = useState('All');

  useEffect(() => {
    axios.get(`${API}/api/jobs`)
      .then(res => setJobs(res.data))
      .catch(() => setJobs(SAMPLE_JOBS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    const l = location.toLowerCase();
    const matchesSearch = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.description?.toLowerCase().includes(q);
    const matchesLocation = !l || j.location.toLowerCase().includes(l);
    const matchesCategory = activeCategory === 'All' || j.category === activeCategory;
    const matchesType = activeType === 'All' || j.type === activeType;
    return matchesSearch && matchesLocation && matchesCategory && matchesType;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Browse Jobs</h1>
        <p className="text-gray-500">
          {loading ? 'Loading…' : `${filtered.length} position${filtered.length !== 1 ? 's' : ''} available`}
        </p>
      </div>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Job title, skill, or company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative w-full sm:w-52">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📍</span>
          <input
            type="text"
            placeholder="Location..."
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap mb-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              activeCategory === cat
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Type chips */}
      <div className="flex gap-2 flex-wrap mb-8">
        {JOB_TYPES.map(type => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              activeType === type
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Job list */}
      {loading ? (
        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-gray-500 text-lg">No jobs found. Try different filters.</p>
          <button onClick={() => { setSearch(''); setLocation(''); setActiveCategory('All'); setActiveType('All'); }} className="mt-4 text-blue-600 hover:underline text-sm">Clear all filters</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(job => <JobCard key={job._id || job.id} job={job} />)}
        </div>
      )}
    </div>
  );
}

function JobCard({ job }) {
  const isNew = job.createdAt && (Date.now() - new Date(job.createdAt).getTime()) < 1000 * 60 * 60 * 48;

  return (
    <Link
      to={`/jobs/${job._id || job.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-blue-300 transition-all group animate-fade-in"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{job.title}</h2>
            {isNew && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">NEW</span>}
          </div>
          <p className="text-blue-600 font-medium mt-0.5">{job.company}</p>
          <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">📍 {job.location}</span>
            <span className="flex items-center gap-1">💼 {job.type}</span>
            {job.salary && <span className="flex items-center gap-1">💰 {job.salary}</span>}
          </div>
        </div>
        <span className="shrink-0 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100">
          {job.category || 'Tech'}
        </span>
      </div>
      <p className="text-gray-500 text-sm mt-4 line-clamp-2 leading-relaxed">{job.description}</p>
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recently posted'}
        </span>
        <span className="text-blue-600 text-sm font-medium group-hover:underline">View details →</span>
      </div>
    </Link>
  );
}

const SAMPLE_JOBS = [
  { id: '1', title: 'Frontend Developer', company: 'TechCorp', location: 'Remote', type: 'Full-time', salary: '₹8L-₹15L/yr', category: 'Engineering', description: 'Build modern web apps using React and Tailwind CSS.' },
  { id: '2', title: 'Backend Engineer', company: 'StartupXYZ', location: 'Mumbai, MH', type: 'Full-time', salary: '₹12L-₹22L/yr', category: 'Engineering', description: 'Design and build scalable Node.js APIs backed by MongoDB.' },
  { id: '3', title: 'UI/UX Designer', company: 'DesignStudio', location: 'Bengaluru, KA', type: 'Contract', salary: '₹60-₹90k/mo', category: 'Design', description: 'Create beautiful user experiences for our enterprise product.' },
];
