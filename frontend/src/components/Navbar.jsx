import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function Navbar() {
  const navigate = useNavigate();
  const toast = useToast();
  const token = localStorage.getItem('token');
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem('token');
    toast('Logged out successfully', 'info');
    navigate('/login');
    setMenuOpen(false);
  }

  return (
    <nav className="bg-[#0a1628] shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-white">Hire</span><span className="text-yellow-400">AI</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/jobs" className="text-blue-100 hover:text-white font-medium transition-colors">Jobs</Link>
            {token ? (
              <>
                <Link to="/post-job" className="text-blue-100 hover:text-white font-medium transition-colors">Post a Job</Link>
                <Link to="/dashboard" className="text-blue-100 hover:text-white font-medium transition-colors">Dashboard</Link>
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-blue-100 hover:text-white font-medium transition-colors">Login</Link>
                <Link to="/signup" className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 px-4 py-2 rounded-lg font-bold transition-colors">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-lg text-white hover:bg-blue-800" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-[#0d1f3c] border-t border-[#1a3a5c] px-4 py-3 flex flex-col gap-3">
          <Link to="/jobs" onClick={() => setMenuOpen(false)} className="text-white font-medium py-2">Jobs</Link>
          {token ? (
            <>
              <Link to="/post-job" onClick={() => setMenuOpen(false)} className="text-white font-medium py-2">Post a Job</Link>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-white font-medium py-2">Dashboard</Link>
              <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium text-left">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-white font-medium py-2">Login</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="bg-yellow-400 text-blue-900 px-4 py-2 rounded-lg font-bold text-center">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
