import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function Navbar() {
  const navigate = useNavigate();
  const toast = useToast();
  const token = localStorage.getItem('token');

  function handleLogout() {
    localStorage.removeItem('token');
    toast('Logged out successfully', 'info');
    navigate('/login');
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-blue-600">Hire</span><span className="text-yellow-400">AI</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/jobs" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Jobs
            </Link>
            {token ? (
              <>
                <Link to="/post-job" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Post a Job
                </Link>
                <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
