import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { Star, MessageSquare, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Toast from '../../components/Toast';

/* ── Difficulty badge ───────────────────────────── */
const DiffBadge = ({ d }) => {
  const map = {
    easy:   'bg-green-100  text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard:   'bg-red-100    text-red-700',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${map[d] || 'bg-gray-100 text-gray-600'}`}>
      {d}
    </span>
  );
};

/* ══════════════════════════════════════════════════ */
const TPOExperiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [toast,       setToast]       = useState(null);
  const [actionId,    setActionId]    = useState(null); // id being approved/rejected

  const fetchPending = () => {
    setLoading(true);
    api.get('/api/experiences/pending/')
      .then(res => setExperiences(res.data || []))
      .catch(err => {
        console.error(err);
        setToast({ type: 'error', message: 'Failed to load pending experiences.' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      await api.put(`/api/experiences/${id}/approve/`);
      setExperiences(prev => prev.filter(exp => exp.id !== id));
      setToast({ type: 'success', message: '✅ Experience approved and published to student feed!' });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.error || 'Failed to approve experience.' });
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    setActionId(id);
    try {
      await api.delete(`/api/experiences/${id}/reject/`);
      setExperiences(prev => prev.filter(exp => exp.id !== id));
      setToast({ type: 'success', message: 'Experience rejected and removed from queue.' });
    } catch (err) {
      // If backend returns 204 no content — axios may throw; handle gracefully
      if (err.response?.status === 204 || err.response?.status === 404) {
        setExperiences(prev => prev.filter(exp => exp.id !== id));
        setToast({ type: 'success', message: 'Experience rejected and removed.' });
      } else {
        setToast({ type: 'error', message: 'Failed to reject experience.' });
      }
    } finally {
      setActionId(null);
    }
  };

  return (
    <Layout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Experience Moderation Queue</h1>
          <p className="text-gray-500 mt-2 font-medium">
            Review and approve anonymous student interview experiences before they appear in the college feed.
          </p>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-8 space-y-4">
                <div className="h-6 bg-gray-100 rounded-lg w-1/3" />
                <div className="h-4 bg-gray-100 rounded-lg w-1/4" />
                <div className="h-20 bg-gray-100 rounded-xl" />
                <div className="h-20 bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : experiences.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
            <div className="bg-green-50 p-6 rounded-full mb-4">
              <CheckCircle size={48} className="text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Queue is Empty</h3>
            <p className="text-gray-500 font-medium max-w-sm">
              No pending experiences to review. All caught up!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-gray-500 font-medium">
              {experiences.length} experience{experiences.length !== 1 ? 's' : ''} awaiting review
            </p>
            {experiences.map(exp => {
              const isActing = actionId === exp.id;
              return (
                <div key={exp.id} className="bg-white rounded-2xl shadow-sm border border-orange-100 p-8 hover:shadow-md transition-shadow">
                  {/* ── Header ── */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 leading-tight">
                        {exp.drive_details?.company_name || 'Company'}
                      </h3>
                      <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-wide">
                        {exp.drive_details?.role_name || 'Role'}
                        <span className="ml-2 text-blue-500">• Anonymous Submission</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <DiffBadge d={exp.difficulty} />
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} size={15}
                            fill={i <= exp.overall_rating ? '#FBBF24' : 'none'}
                            stroke={i <= exp.overall_rating ? '#FBBF24' : '#D1D5DB'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── Content ── */}
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">
                        Rounds Description
                      </h4>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-xl">
                        {exp.rounds_description}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">
                        Questions Asked
                      </h4>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed bg-blue-50/50 p-4 rounded-xl border-l-4 border-blue-300">
                        {exp.questions_asked}
                      </p>
                    </div>
                    {exp.tips && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                          Tips for Juniors
                        </h4>
                        <p className="text-gray-700 font-medium text-sm italic bg-amber-50 p-4 rounded-xl border border-amber-100">
                          💡 "{exp.tips}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ── Action Buttons ── */}
                  <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-4">
                    <button
                      onClick={() => handleReject(exp.id)}
                      disabled={isActing}
                      className="px-6 py-2.5 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-60"
                    >
                      {isActing ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={18} />}
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(exp.id)}
                      disabled={isActing}
                      className="px-8 py-2.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-60"
                    >
                      {isActing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={18} />}
                      Approve & Publish
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TPOExperiences;
