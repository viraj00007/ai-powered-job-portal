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
          <Link to="/" className="text-xl font-bold text-blue-600">
            JobPortal AI
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
