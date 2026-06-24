import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import API from '../config/api';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [postedJobs, setPostedJobs] = useState([]);
  const [applicantsMap, setApplicantsMap] = useState({});
  const [expandedJob, setExpandedJob] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [profileName, setProfileName] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const toast = useToast();

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    axios.get(`${API}/api/auth/me`, { headers })
      .then(res => {
        setUser(res.data);
        setProfileName(res.data.name);
        if (res.data.role === 'employer') {
          // load jobs posted by this employer
          axios.get(`${API}/api/jobs`, { headers })
            .then(r => setPostedJobs(r.data.filter(j => j.postedBy?._id === res.data._id || j.postedBy === res.data._id)));
        } else {
          axios.get(`${API}/api/applications`, { headers })
            .then(r => setApplications(r.data))
            .catch(() => {});
        }
      })
      .catch(() => navigate('/login'));
  }, [token, navigate]);

  async function loadApplicants(jobId) {
    if (expandedJob === jobId) { setExpandedJob(null); return; }
    setExpandedJob(jobId);
    if (applicantsMap[jobId]) return;
    const res = await axios.get(`${API}/api/applications/job/${jobId}`, { headers });
    setApplicantsMap(prev => ({ ...prev, [jobId]: res.data }));
  }

  async function updateStatus(appId, status, jobId) {
    await axios.patch(`${API}/api/applications/${appId}/status`, { status }, { headers });
    setApplicantsMap(prev => ({
      ...prev,
      [jobId]: prev[jobId].map(a => a._id === appId ? { ...a, status } : a),
    }));
  }

  async function saveProfile() {
    setProfileSaving(true);
    try {
      const res = await axios.patch(`${API}/api/auth/me`, { name: profileName }, { headers });
      setUser(res.data);
      toast('Profile updated!', 'success');
    } catch {
      toast('Failed to update profile.', 'error');
    } finally {
      setProfileSaving(false);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    toast('Copied to clipboard!', 'info');
  }

  async function handleAIAnalysis(type) {
    setAiLoading(true);
    setAiResult(null);
    try {
      const endpoint = type === 'resume' ? '/api/ai/analyze-resume' : '/api/ai/cover-letter';
      const payload = type === 'resume' ? { resumeText } : { resumeText, jobDescription };
      const res = await axios.post(`${API}${endpoint}`, payload, { headers });
      setAiResult({ type, content: res.data.result });
    } catch (err) {
      toast(err.response?.data?.message || 'AI request failed.', 'error');
    } finally {
      setAiLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isEmployer = user.role === 'employer';

  const tabs = isEmployer
    ? ['applicants', 'ai-tools', 'profile']
    : ['overview', 'ai-tools', 'profile'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user.name} 👋</p>
        </div>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium capitalize">
          {user.role}
        </span>
      </div>

      {/* Employer: Post Job CTA */}
      {isEmployer && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-blue-800">Ready to hire?</p>
            <p className="text-sm text-blue-600">Post a new job listing in under 2 minutes.</p>
          </div>
          <Link to="/post-job" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors whitespace-nowrap">
            + Post a Job
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {isEmployer ? [
          { label: 'Jobs Posted', value: postedJobs.length },
          { label: 'Total Applicants', value: Object.values(applicantsMap).flat().length },
          { label: 'Interviews', value: Object.values(applicantsMap).flat().filter(a => a.status === 'interview').length },
          { label: 'Offers Made', value: Object.values(applicantsMap).flat().filter(a => a.status === 'offer').length },
        ] : [
          { label: 'Applications', value: applications.length },
          { label: 'Interviews', value: applications.filter(a => a.status === 'interview').length },
          { label: 'Offers', value: applications.filter(a => a.status === 'offer').length },
          { label: 'Saved Jobs', value: 0 },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab
                ? 'bg-white border border-b-white border-gray-200 text-blue-600 -mb-px'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'overview' ? 'My Applications' : tab === 'applicants' ? 'Who Applied' : tab === 'ai-tools' ? 'AI Tools' : 'Profile'}
          </button>
        ))}
      </div>

      {/* Jobseeker: Applications tab */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">My Applications</h2>
          </div>
          {applications.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📋</p>
              <p>No applications yet. <a href="/jobs" className="text-blue-600 hover:underline">Browse jobs</a> to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {applications.map(app => (
                <div key={app._id} className="flex items-center justify-between p-5">
                  <div>
                    <p className="font-medium text-gray-800">{app.job?.title}</p>
                    <p className="text-sm text-gray-500">{app.job?.company} · {app.job?.location}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Employer: Who Applied tab */}
      {activeTab === 'applicants' && (
        <div className="space-y-4">
          {postedJobs.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
              <p className="text-4xl mb-3">💼</p>
              <p>No jobs posted yet.</p>
            </div>
          ) : (
            postedJobs.map(job => (
              <div key={job._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => loadApplicants(job._id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{job.title}</p>
                    <p className="text-sm text-gray-500">{job.location} · {job.type} · {job.salary}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {applicantsMap[job._id]?.length ?? '—'} applied
                    </span>
                    <span className="text-gray-400 text-lg">{expandedJob === job._id ? '▲' : '▼'}</span>
                  </div>
                </button>

                {expandedJob === job._id && (
                  <div className="border-t border-gray-100">
                    {!applicantsMap[job._id] ? (
                      <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : applicantsMap[job._id].length === 0 ? (
                      <p className="text-center text-gray-400 py-8">No applicants yet.</p>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {applicantsMap[job._id].map(app => (
                          <div key={app._id} className="flex items-center justify-between px-5 py-4">
                            <div>
                              <p className="font-medium text-gray-800">{app.applicant?.name}</p>
                              <p className="text-sm text-gray-500">{app.applicant?.email}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Applied {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            <select
                              value={app.status}
                              onChange={e => updateStatus(app._id, e.target.value, job._id)}
                              className={`text-xs font-medium px-3 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusColor(app.status)}`}
                            >
                              {['pending', 'reviewed', 'interview', 'offer', 'rejected'].map(s => (
                                <option key={s} value={s} className="bg-white text-gray-800 capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-lg">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <span className="inline-block mt-1 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full capitalize">{user.role}</span>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={user.email} disabled
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-400 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
              <p className="text-gray-600 text-sm">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
            <button
              onClick={saveProfile}
              disabled={profileSaving || profileName === user.name}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              {profileSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* AI Tools tab */}
      {activeTab === 'ai-tools' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">🤖 Resume Analyzer</h2>
            <p className="text-sm text-gray-500 mb-4">Paste your resume and get AI-powered feedback.</p>
            <textarea
              rows={6}
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              onClick={() => handleAIAnalysis('resume')}
              disabled={aiLoading || !resumeText.trim()}
              className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg transition-colors text-sm"
            >
              {aiLoading ? 'Analyzing…' : 'Analyze Resume'}
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">✉️ Cover Letter Generator</h2>
            <p className="text-sm text-gray-500 mb-4">Paste your resume and a job description to generate a tailored cover letter.</p>
            <textarea
              rows={4}
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Resume text..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
            />
            <textarea
              rows={4}
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Job description..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              onClick={() => handleAIAnalysis('cover-letter')}
              disabled={aiLoading || !resumeText.trim() || !jobDescription.trim()}
              className="mt-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg transition-colors text-sm"
            >
              {aiLoading ? 'Generating…' : 'Generate Cover Letter'}
            </button>
          </div>

          {aiResult && (
            <div className={`rounded-xl border p-6 ${aiResult.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">
                  {aiResult.type === 'resume' ? '📊 Resume Analysis' : aiResult.type === 'cover-letter' ? '📝 Generated Cover Letter' : '⚠️ Error'}
                </h3>
                {aiResult.type !== 'error' && (
                  <button
                    onClick={() => copyToClipboard(aiResult.content)}
                    className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 px-3 py-1 rounded-lg transition-colors"
                  >
                    📋 Copy
                  </button>
                )}
              </div>
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{aiResult.content}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function statusColor(status) {
  const map = {
    pending: 'bg-yellow-50 text-yellow-700',
    reviewed: 'bg-blue-50 text-blue-700',
    interview: 'bg-purple-50 text-purple-700',
    offer: 'bg-green-50 text-green-700',
    rejected: 'bg-red-50 text-red-700',
  };
  return map[status] || 'bg-gray-50 text-gray-600';
}
