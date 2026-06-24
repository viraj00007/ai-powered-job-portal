import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 text-center">
      <div>
        <p className="text-8xl font-black text-blue-100 select-none">404</p>
        <h1 className="text-3xl font-bold text-gray-800 mt-4 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex justify-center gap-4">
          <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors">
            Go Home
          </Link>
          <Link to="/jobs" className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-2.5 rounded-lg transition-colors">
            Browse Jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
