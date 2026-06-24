import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const STATS = [
  { end: 500, suffix: '+', label: 'Jobs Available' },
  { end: 120, suffix: '+', label: 'Companies Hiring' },
  { end: 10,  suffix: 'K+', label: 'Job Seekers' },
  { end: 98,  suffix: '%', label: 'Success Rate' },
];

const CATEGORIES = [
  { label: 'Engineering', icon: '⚙️' },
  { label: 'Design', icon: '🎨' },
  { label: 'Data', icon: '📊' },
  { label: 'Product', icon: '🚀' },
  { label: 'Marketing', icon: '📣' },
  { label: 'Finance', icon: '💰' },
];

function useCountUp(end, duration = 1500, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

function StatCard({ end, suffix, label, animate }) {
  const count = useCountUp(end, 1200, animate);
  return (
    <div className="text-center animate-count">
      <p className="text-4xl font-bold text-white">{count}{suffix}</p>
      <p className="text-blue-200 mt-1 text-sm">{label}</p>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    navigate(`/jobs${search ? `?q=${encodeURIComponent(search)}` : ''}`);
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-blue-500 bg-opacity-40 border border-blue-400 text-blue-100 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
            AI-Powered Job Search
          </span>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Find Your Dream Job <br />
            <span className="text-yellow-300">Powered by AI</span>
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Upload your resume, get instant AI feedback, and receive tailored cover letters — all in one place.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-10">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Job title, skill, or company..."
              className="flex-1 px-5 py-3.5 rounded-xl text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-yellow-300 shadow-lg"
            />
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3.5 rounded-xl transition-colors shadow-lg whitespace-nowrap"
            >
              Search Jobs
            </button>
          </form>

          <div className="flex justify-center gap-4 flex-wrap text-blue-200 text-sm">
            {['React Developer', 'Data Scientist', 'UI Designer', 'DevOps'].map(tag => (
              <button
                key={tag}
                onClick={() => navigate(`/jobs?q=${encodeURIComponent(tag)}`)}
                className="hover:text-white hover:underline transition-colors"
              >
                🔥 {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Animated Stats */}
      <section ref={statsRef} className="bg-blue-700 py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(s => (
            <StatCard key={s.label} {...s} animate={statsVisible} />
          ))}
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Browse by Category</h2>
            <p className="text-gray-500">Explore opportunities across all domains</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.label}
                to={`/jobs?category=${encodeURIComponent(cat.label)}`}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 hover:shadow-md transition-all group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">How It Works</h2>
            <p className="text-gray-500">Get hired in 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative text-center">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full border-t-2 border-dashed border-blue-200" />
                )}
                <div className="relative inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white text-2xl rounded-2xl mb-5 shadow-lg">
                  {step.icon}
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">AI Features Built For You</h2>
            <p className="text-gray-500">Leverage the power of AI to stand out</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-20 px-4 text-center text-white">
        <h2 className="text-4xl font-bold mb-4">Ready to get hired?</h2>
        <p className="text-blue-100 mb-8 max-w-xl mx-auto">Join thousands of job seekers already using AI to land their dream roles faster.</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/signup" className="bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
            Get Started Free
          </Link>
          <Link to="/jobs" className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white hover:text-blue-700 transition-colors">
            Browse Jobs
          </Link>
        </div>
      </section>
    </div>
  );
}

const STEPS = [
  { icon: '📝', title: 'Create Account', desc: 'Sign up in seconds — free forever. Choose between job seeker or employer.' },
  { icon: '🔍', title: 'Find Jobs', desc: 'Browse listings filtered by category, location, and salary range.' },
  { icon: '🤖', title: 'Apply with AI', desc: 'Generate a tailored cover letter with one click and submit your application.' },
];

const FEATURES = [
  { icon: '🤖', title: 'Resume Analyzer', desc: 'Get instant AI feedback on your resume with scores, strengths, and improvements.' },
  { icon: '✉️', title: 'Cover Letter Generator', desc: 'Generate personalized cover letters tailored to each job in seconds.' },
  { icon: '📊', title: 'ATS Optimization', desc: 'Ensure your resume passes Applicant Tracking Systems with keyword suggestions.' },
];
