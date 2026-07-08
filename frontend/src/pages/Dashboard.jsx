import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import API from '../config/api';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

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
  const [fileUploading, setFileUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [profileName, setProfileName] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchJobDesc, setMatchJobDesc] = useState('');

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

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileUploading(true);
    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(' ') + '\n';
        }
        setResumeText(text.trim());
      } else {
        const text = await file.text();
        setResumeText(text.trim());
      }
    } catch {
      setResumeText('');
      alert('Could not read file. Try a PDF or TXT file.');
    }
    setFileUploading(false);
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

  async function handleMatchScore() {
    setMatchLoading(true);
    setMatchResult(null);
    try {
      const res = await axios.post(`${API}/api/ai/match-score`, { resumeText, jobDescription: matchJobDesc }, { headers });
      setMatchResult(res.data);
    } catch (err) {
      toast(err.response?.data?.message || 'AI request failed.', 'error');
    } finally {
      setMatchLoading(false);
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

      {/* Jobseeker: Applications Kanban */}
      {activeTab === 'overview' && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">My Applications</h2>
          {applications.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
              <p className="text-4xl mb-3">📋</p>
              <p>No applications yet. <a href="/jobs" className="text-blue-600 hover:underline">Browse jobs</a> to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { key: 'pending', label: 'Applied', emoji: '📤', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
                { key: 'reviewed', label: 'Reviewed', emoji: '👀', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
                { key: 'interview', label: 'Interview', emoji: '🎤', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
                { key: 'offer', label: 'Offer', emoji: '🎉', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
                { key: 'rejected', label: 'Rejected', emoji: '❌', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
              ].map(col => {
                const colApps = applications.filter(a => a.status === col.key);
                return (
                  <div key={col.key} className={`${col.bg} border-2 ${col.border} rounded-xl p-3 min-h-32`}>
                    <div className={`flex items-center justify-between mb-3`}>
                      <span className={`text-xs font-bold uppercase tracking-wide ${col.text}`}>{col.emoji} {col.label}</span>
                      <span className="bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm">
                        {colApps.length}
                      </span>
                    </div>
                    {colApps.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">—</p>
                    ) : (
                      colApps.map(app => (
                        <div key={app._id} className="bg-white rounded-lg p-2.5 mb-2 shadow-sm border border-gray-100">
                          <p className="text-xs font-semibold text-gray-800 truncate">{app.job?.title}</p>
                          <p className="text-xs text-gray-500 truncate">{app.job?.company}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{app.job?.location}</p>
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
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
            <p className="text-sm text-gray-500 mb-4">Upload your resume or paste text to get AI-powered feedback.</p>
            <input ref={fileInputRef} type="file" accept=".pdf,.txt" className="hidden" onChange={handleFileUpload} />
            <div
              onClick={() => fileInputRef.current.click()}
              className="w-full border-2 border-dashed border-blue-800 rounded-lg p-6 text-center cursor-pointer hover:bg-blue-50 transition-colors mb-3"
            >
              {fileUploading ? (
                <p className="text-blue-900 text-sm font-medium">Reading file…</p>
              ) : resumeText ? (
                <p className="text-green-600 text-sm font-medium">✅ Resume loaded — click to replace</p>
              ) : (
                <>
                  <p className="text-2xl mb-1">📄</p>
                  <p className="text-blue-900 font-medium text-sm">Click to upload resume</p>
                  <p className="text-gray-500 text-xs mt-1">PDF or TXT supported</p>
                </>
              )}
            </div>
            <textarea
              rows={4}
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Or paste your resume text here…"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              onClick={() => handleAIAnalysis('resume')}
              disabled={aiLoading || fileUploading || !resumeText.trim()}
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

          {/* Job Match Score */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">🎯 Job Match Score</h2>
            <p className="text-sm text-gray-500 mb-4">Upload your resume + paste a job description — AI calculates your match %.</p>
            <textarea
              rows={3}
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Your resume text (upload above or paste here)..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none mb-3"
            />
            <textarea
              rows={3}
              value={matchJobDesc}
              onChange={e => setMatchJobDesc(e.target.value)}
              placeholder="Paste the job description you want to match against..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
            <button
              onClick={handleMatchScore}
              disabled={matchLoading || !resumeText.trim() || !matchJobDesc.trim()}
              className="mt-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg transition-colors text-sm"
            >
              {matchLoading ? 'Analyzing…' : 'Check Match Score'}
            </button>
            {matchResult && (
              <div className="mt-4 bg-gray-50 rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 ${matchResult.score >= 70 ? 'border-green-400 text-green-600' : matchResult.score >= 50 ? 'border-yellow-400 text-yellow-600' : 'border-red-400 text-red-600'}`}>
                    <span className="text-2xl font-bold">{matchResult.score}</span>
                    <span className="text-xs">/ 100</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Match Score</p>
                    <p className="text-sm text-gray-500">{matchResult.summary}</p>
                  </div>
                </div>
                {matchResult.matched_skills?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-green-700 mb-1.5">Matched Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.matched_skills.map(s => <span key={s} className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full">{s}</span>)}
                    </div>
                  </div>
                )}
                {matchResult.missing_skills?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-red-700 mb-1.5">Missing Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.missing_skills.map(s => <span key={s} className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full">{s}</span>)}
                    </div>
                  </div>
                )}
                {matchResult.tips?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1.5">Tips to Improve</p>
                    <ul className="space-y-1">
                      {matchResult.tips.map((t, i) => <li key={i} className="text-xs text-gray-600 flex gap-1.5"><span>•</span>{t}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
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
