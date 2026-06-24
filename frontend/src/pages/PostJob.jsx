import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import API from '../config/api';

const TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
const CATEGORIES = ['Engineering', 'Design', 'Data', 'Product', 'Marketing', 'Finance', 'Sales', 'Operations'];

export default function PostJob() {
  const navigate = useNavigate();
  const toast = useToast();
  const token = localStorage.getItem('token');

  const [form, setForm] = useState({
    title: '', company: '', location: '', type: 'Full-time',
    category: 'Engineering', salary: '', description: '',
  });
  const [requirements, setRequirements] = useState(['']);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function updateReq(i, val) {
    const r = [...requirements];
    r[i] = val;
    setRequirements(r);
  }

  function addReq() { setRequirements([...requirements, '']); }
  function removeReq(i) { setRequirements(requirements.filter((_, idx) => idx !== i)); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token) { navigate('/login'); return; }
    setLoading(true);
    try {
      await axios.post(
        `${API}/api/jobs`,
        { ...form, requirements: requirements.filter(r => r.trim()) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast('Job posted successfully! 🎉', 'success');
      navigate('/dashboard');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to post job.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Post a Job</h1>
        <p className="text-gray-500 mt-1">Fill in the details to attract the right candidates</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
        {/* Basic Info */}
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required
              placeholder="e.g. Senior React Developer"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
            <input name="company" value={form.company} onChange={handleChange} required
              placeholder="e.g. TechCorp India"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input name="location" value={form.location} onChange={handleChange} required
              placeholder="e.g. Bengaluru, KA or Remote"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
            <input name="salary" value={form.salary} onChange={handleChange}
              placeholder="e.g. ₹12L-₹20L/yr"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
            <select name="type" value={form.type} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select name="category" value={form.category} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
          <textarea name="description" value={form.description} onChange={handleChange} required rows={5}
            placeholder="Describe the role, responsibilities, and what makes your company great..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Requirements</label>
          <div className="space-y-2">
            {requirements.map((req, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={req}
                  onChange={e => updateReq(i, e.target.value)}
                  placeholder={`Requirement ${i + 1}`}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {requirements.length > 1 && (
                  <button type="button" onClick={() => removeReq(i)}
                    className="px-3 py-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">✕</button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addReq}
            className="mt-2 text-sm text-blue-600 hover:underline font-medium">
            + Add requirement
          </button>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
            {loading ? 'Posting…' : 'Post Job'}
          </button>
          <button type="button" onClick={() => navigate(-1)}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
