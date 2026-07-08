import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import API from '../config/api';

const QUESTION_TYPES = ['Behavioral', 'Technical', 'Situational', 'Culture Fit', 'Behavioral', 'Technical', 'Situational', 'Culture Fit'];

export default function InterviewPrep() {
  const [jobDescription, setJobDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  async function generate() {
    if (!token) { navigate('/login'); return; }
    if (!jobDescription.trim()) return;
    setLoading(true);
    setQuestions([]);
    setExpanded(null);
    try {
      const res = await axios.post(
        `${API}/api/ai/interview-prep`,
        { jobDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const qs = res.data.questions || [];
      setQuestions(qs);
      if (qs.length) setExpanded(0);
    } catch (err) {
      toast(err.response?.data?.message || 'AI request failed. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function copy(text) {
    navigator.clipboard.writeText(text);
    toast('Copied to clipboard!', 'info');
  }

  function copyAll() {
    const text = questions.map((q, i) => `Q${i + 1}. ${q.question}\n\nAnswer: ${q.answer}`).join('\n\n---\n\n');
    navigator.clipboard.writeText(text);
    toast('All Q&As copied!', 'info');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-white bg-opacity-20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wide">
            🤖 AI Powered
          </span>
          <h1 className="text-4xl font-bold mb-2">Interview Prep</h1>
          <p className="text-purple-100 text-lg">Paste a job description — get 8 likely interview questions with model answers</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Input Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Job Description</label>
          <textarea
            rows={6}
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here — role, responsibilities, required skills, company info..."
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
          <button
            onClick={generate}
            disabled={loading || !jobDescription.trim()}
            className="mt-4 w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating questions…
              </>
            ) : '✨ Generate Interview Questions'}
          </button>
        </div>

        {/* Questions */}
        {questions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">{questions.length} questions — click to expand answers</p>
              <button
                onClick={copyAll}
                className="text-xs text-purple-600 hover:text-purple-800 border border-purple-200 hover:border-purple-400 px-3 py-1.5 rounded-lg transition-colors"
              >
                📋 Copy All
              </button>
            </div>

            <div className="space-y-3">
              {questions.map((q, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <button
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="flex-shrink-0 w-7 h-7 bg-purple-100 text-purple-700 rounded-full text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="font-medium text-gray-800 text-sm leading-snug">{q.question}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full hidden sm:block">
                        {QUESTION_TYPES[i]}
                      </span>
                      <span className="text-gray-400 text-sm">{expanded === i ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {expanded === i && (
                    <div className="px-5 pb-5 border-t border-gray-100">
                      <div className="mt-3 bg-purple-50 rounded-xl p-4 relative">
                        <p className="text-sm text-gray-700 leading-relaxed pr-16">{q.answer}</p>
                        <button
                          onClick={() => copy(q.answer)}
                          className="absolute top-3 right-3 text-xs text-purple-600 hover:text-purple-800 border border-purple-200 hover:border-purple-400 px-2.5 py-1 rounded-lg transition-colors bg-white"
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="mt-6 w-full border-2 border-dashed border-purple-200 hover:border-purple-400 text-purple-600 hover:text-purple-700 font-medium py-3 rounded-xl transition-colors text-sm disabled:opacity-50"
            >
              ↻ Regenerate with different questions
            </button>
          </div>
        )}

        {/* Empty state before generating */}
        {questions.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">🎯</p>
            <p className="font-medium text-gray-500">Paste a job description above and hit Generate</p>
            <p className="text-sm mt-1">AI will create 8 interview questions tailored to the role</p>
          </div>
        )}
      </div>
    </div>
  );
}
