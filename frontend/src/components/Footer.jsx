import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 pt-14 pb-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-white text-xl font-bold">JobPortal AI</Link>
            <p className="mt-3 text-sm leading-relaxed">
              AI-powered job search platform helping thousands of professionals find their dream roles.
            </p>
          </div>
          <div>
            <p className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Job Seekers</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
              <li><Link to="/signup" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Employers</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/post-job" className="hover:text-white transition-colors">Post a Job</Link></li>
              <li><Link to="/signup" className="hover:text-white transition-colors">Employer Signup</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Manage Listings</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">AI Tools</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Resume Analyzer</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Cover Letter Gen</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>© 2024 JobPortal AI. All rights reserved.</p>
          <div className="flex gap-5">
            {['🐦 Twitter', '💼 LinkedIn', '🐙 GitHub'].map(s => (
              <span key={s} className="cursor-pointer hover:text-white transition-colors">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
