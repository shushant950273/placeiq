import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { Briefcase, CheckCircle, Clock, XCircle, Target, ChevronRight } from 'lucide-react';

/* ── Pipeline stages definition ─────────────────── */
const STAGES = ['Applied', 'Shortlisted', 'Technical', 'HR', 'Offer'];

/*
 * Map application_status → how many stages are "done"
 * applied      → 1 (only Applied done)
 * shortlisted  → 2 (Applied + Shortlisted done)
 * selected     → 5 (all done — offer)
 * rejected     → mark up to current with red
 */
const statusToStageIndex = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'applied':     return 0;
    case 'shortlisted': return 1;
    case 'selected':    return 4;
    case 'rejected':    return -1; // special
    default:            return 0;
  }
};

/* ── Status badge for card header ─────────────────── */
const AppStatusBadge = ({ status }) => {
  const map = {
    applied:     'bg-blue-50   text-blue-700   border-blue-200',
    shortlisted: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    selected:    'bg-green-50  text-green-700  border-green-200',
    rejected:    'bg-red-50    text-red-700    border-red-200',
  };
  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border capitalize ${map[(status||'').toLowerCase()] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
      {status || 'Applied'}
    </span>
  );
};

/* ══════════════════════════════════════════════════ */
const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    api.get('/api/student/applications/')
      .then(res => setApplications(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Applications</h1>
          <p className="text-gray-500 mt-1 font-medium">Track your placement journey end-to-end.</p>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-100 rounded-lg w-1/3" />
                    <div className="h-4 bg-gray-100 rounded-lg w-1/4" />
                  </div>
                </div>
                <div className="h-20 bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5 border-2 border-dashed border-gray-200">
              <Target className="text-gray-300" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-500 font-medium mb-6 max-w-sm">
              You haven't applied to any drives yet. Start your placement journey!
            </p>
            <Link
              to="/student/drives"
              className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-[#152a45] transition-colors shadow-lg"
            >
              Browse Eligible Drives
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => {
              const status      = (app.status || 'applied').toLowerCase();
              const isRejected  = status === 'rejected';
              const isSelected  = status === 'selected';
              const doneUpTo    = statusToStageIndex(status); // index of last DONE stage (0-based)
              const drive       = app.drive_details || {};
              const appliedDate = fmt(app.applied_at);

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
                >
                  {/* ── Card Header ── */}
                  <div className="p-6 border-b border-gray-100 bg-gray-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#2E75B6] flex items-center justify-center text-white text-xl font-black shadow-sm shrink-0">
                        {(drive.company_name || 'C').charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">
                          {drive.company_name || '—'}
                        </h2>
                        <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5 mt-0.5">
                          <Briefcase size={13} />
                          {drive.role_name || '—'}
                          {appliedDate && (
                            <span className="text-gray-400">• Applied {appliedDate}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <AppStatusBadge status={app.status} />
                      {drive.id && (
                        <Link
                          to={`/student/drives/${drive.id}`}
                          className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
                        >
                          View Drive <ChevronRight size={13} />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* ── Horizontal Stepper ── */}
                  <div className="px-8 py-6">
                    {/* Desktop: horizontal */}
                    <div className="relative hidden md:flex items-start justify-between">
                      {/* Background track */}
                      <div className="absolute top-5 left-6 right-6 h-[2px] bg-gray-100" />

                      {STAGES.map((stage, idx) => {
                        let nodeState; // 'done' | 'active' | 'rejected' | 'future'

                        if (isRejected) {
                          if (idx <= doneUpTo + 1) nodeState = idx <= doneUpTo ? 'done' : 'rejected';
                          else nodeState = 'future';
                        } else if (isSelected) {
                          nodeState = 'done';
                        } else {
                          if (idx <= doneUpTo) nodeState = 'done';
                          else if (idx === doneUpTo + 1) nodeState = 'active';
                          else nodeState = 'future';
                        }

                        const nodeStyle = {
                          done:     'bg-green-500 ring-green-100 text-white',
                          active:   'bg-blue-500 ring-blue-100 text-white animate-pulse',
                          rejected: 'bg-red-500 ring-red-100 text-white',
                          future:   'bg-gray-100 ring-gray-50 text-gray-400',
                        }[nodeState];

                        const lineColor = (idx > 0 && idx <= doneUpTo) ? 'bg-green-400' :
                                          (idx > 0 && idx === doneUpTo + 1 && !isRejected) ? 'bg-blue-300' : 'bg-gray-100';

                        return (
                          <div key={stage} className="flex flex-col items-center flex-1 relative z-10">
                            {/* Line segment before node */}
                            {idx > 0 && (
                              <div className={`absolute top-5 right-1/2 left-[-50%] h-[2px] ${lineColor} transition-all duration-500`} />
                            )}

                            {/* Node */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ring-4 transition-all duration-300 z-10 ${nodeStyle}`}>
                              {nodeState === 'done'     && <CheckCircle size={16} />}
                              {nodeState === 'active'   && <Clock size={16} />}
                              {nodeState === 'rejected' && <XCircle size={16} />}
                              {nodeState === 'future'   && <span className="text-xs font-bold">{idx + 1}</span>}
                            </div>

                            {/* Label */}
                            <p className={`mt-3 text-xs font-bold uppercase tracking-wide text-center ${
                              nodeState === 'done'     ? 'text-green-600' :
                              nodeState === 'active'   ? 'text-blue-600' :
                              nodeState === 'rejected' ? 'text-red-600' :
                              'text-gray-400'
                            }`}>
                              {stage}
                            </p>

                            {/* Sub-label */}
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {nodeState === 'done'     ? '✓ Done' :
                               nodeState === 'active'   ? 'In Progress' :
                               nodeState === 'rejected' ? '✗ Rejected' :
                               'Pending'}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Mobile: vertical */}
                    <div className="flex flex-col gap-2 md:hidden">
                      {STAGES.map((stage, idx) => {
                        let nodeState;
                        if (isRejected) {
                          if (idx <= doneUpTo) nodeState = 'done';
                          else if (idx === doneUpTo + 1) nodeState = 'rejected';
                          else nodeState = 'future';
                        } else if (isSelected) {
                          nodeState = 'done';
                        } else {
                          if (idx <= doneUpTo) nodeState = 'done';
                          else if (idx === doneUpTo + 1) nodeState = 'active';
                          else nodeState = 'future';
                        }

                        const dotStyle = {
                          done:     'bg-green-500 text-white',
                          active:   'bg-blue-500 text-white',
                          rejected: 'bg-red-500 text-white',
                          future:   'bg-gray-100 text-gray-400',
                        }[nodeState];

                        return (
                          <div key={stage} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${dotStyle}`}>
                              {nodeState === 'done'     ? <CheckCircle size={14} /> :
                               nodeState === 'rejected' ? <XCircle size={14} /> :
                               nodeState === 'active'   ? <Clock size={14} /> :
                               <span className="text-xs font-bold">{idx + 1}</span>}
                            </div>
                            <span className={`text-sm font-semibold ${nodeState === 'future' ? 'text-gray-400' : 'text-gray-900'}`}>
                              {stage}
                            </span>
                            {nodeState === 'active' && (
                              <span className="text-xs text-blue-600 font-bold ml-auto">In Progress</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Rejection banner ── */}
                  {isRejected && (
                    <div className="mx-6 mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium flex items-center gap-2">
                      <XCircle size={16} className="shrink-0" />
                      Your application was not selected for this drive. Keep going — more opportunities await!
                    </div>
                  )}

                  {/* ── Selected banner ── */}
                  {isSelected && (
                    <div className="mx-6 mb-5 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-bold flex items-center gap-2">
                      <CheckCircle size={16} className="shrink-0" />
                      🎉 Congratulations! You have been selected for {drive.company_name}.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyApplications;
