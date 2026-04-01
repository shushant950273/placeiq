import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { Briefcase, CheckCircle, Clock, XCircle, Target, ChevronRight } from 'lucide-react';
import { pageVariants, staggerContainer, listItem } from '../../utils/animations';

/* ── Pipeline stages ───────────────────────────── */
const STAGES = ['Applied', 'Shortlisted', 'Technical', 'HR', 'Offer'];

const statusToStageIndex = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'applied':     return 0;
    case 'shortlisted': return 1;
    case 'selected':    return 4;
    case 'rejected':    return -1;
    default:            return 0;
  }
};

/* ── Status badge ───────────────────────────────── */
const AppStatusBadge = ({ status }) => {
  const map = {
    applied:     'bg-blue-50   text-blue-700   border-blue-200   dark:bg-blue-900/30  dark:text-blue-400  dark:border-blue-700',
    shortlisted: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
    selected:    'bg-green-50  text-green-700  border-green-200  dark:bg-green-900/30  dark:text-green-400  dark:border-green-700',
    rejected:    'bg-red-50    text-red-700    border-red-200    dark:bg-red-900/30    dark:text-red-400    dark:border-red-700',
  };
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      className={`px-3 py-1.5 rounded-full text-xs font-bold border capitalize ${map[(status || '').toLowerCase()] || 'bg-gray-50 text-gray-600 border-gray-200'}`}
    >
      {status || 'Applied'}
    </motion.span>
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
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-6xl mx-auto space-y-6 pb-12"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-[#E6EDF3]">
            My Applications
          </h1>
          <p className="text-slate-500 dark:text-[#8B949E] mt-1 font-medium">
            Track your placement journey end-to-end.
          </p>
        </motion.div>

        {loading ? (
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-[#161B22] rounded-2xl border border-slate-100 dark:border-[#30363D] p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-100 dark:bg-[#21262D] rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-slate-100 dark:bg-[#21262D] rounded-lg w-1/3" />
                    <div className="h-4 bg-slate-100 dark:bg-[#21262D] rounded-lg w-1/4" />
                  </div>
                </div>
                <div className="h-20 bg-slate-100 dark:bg-[#21262D] rounded-xl" />
              </div>
            ))}
          </div>

        ) : applications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#161B22] rounded-2xl shadow-sm border border-slate-100 dark:border-[#30363D] p-16 text-center flex flex-col items-center"
          >
            <div className="w-20 h-20 bg-slate-50 dark:bg-[#21262D] rounded-full flex items-center justify-center mb-5 border-2 border-dashed border-slate-200 dark:border-[#30363D]">
              <Target className="text-slate-300 dark:text-[#656D76]" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-[#E6EDF3] mb-2">No Applications Yet</h3>
            <p className="text-slate-500 dark:text-[#8B949E] font-medium mb-6 max-w-sm">
              You haven't applied to any drives yet. Start your placement journey!
            </p>
            <Link
              to="/student/drives"
              className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-[#152a45] transition-colors shadow-lg"
            >
              Browse Eligible Drives
            </Link>
          </motion.div>

        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            {applications.map((app, appIdx) => {
              const status      = (app.status || 'applied').toLowerCase();
              const isRejected  = status === 'rejected';
              const isSelected  = status === 'selected';
              const doneUpTo    = statusToStageIndex(status);
              const drive       = app.drive_details || {};
              const appliedDate = fmt(app.applied_at);

              return (
                <motion.div
                  key={app.id}
                  variants={listItem}
                  whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="bg-white dark:bg-[#161B22] rounded-2xl shadow-sm border border-slate-100 dark:border-[#30363D] overflow-hidden"
                >
                  {/* ── Card Header ── */}
                  <div className="p-6 border-b border-slate-100 dark:border-[#30363D] bg-slate-50/40 dark:bg-[#21262D]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#2E75B6] flex items-center justify-center text-white text-xl font-black shadow-sm shrink-0">
                        {(drive.company_name || 'C').charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-[#E6EDF3] leading-tight">
                          {drive.company_name || '—'}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-[#8B949E] font-medium flex items-center gap-1.5 mt-0.5">
                          <Briefcase size={13} />
                          {drive.role_name || '—'}
                          {appliedDate && (
                            <span className="text-slate-400 dark:text-[#656D76]">• Applied {appliedDate}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <AppStatusBadge status={app.status} />
                      {drive.id && (
                        <Link
                          to={`/student/drives/${drive.id}`}
                          className="text-xs font-bold text-primary dark:text-[#58A6FF] hover:underline flex items-center gap-0.5"
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
                      <div className="absolute top-5 left-6 right-6 h-[2px] bg-slate-100 dark:bg-[#30363D]" />

                      {/* Animated progress line */}
                      {!isRejected && (
                        <motion.div
                          className="absolute top-5 left-6 h-[2px] bg-emerald-400 origin-left"
                          initial={{ scaleX: 0 }}
                          animate={{
                            scaleX: isSelected
                              ? 1
                              : doneUpTo / (STAGES.length - 1),
                          }}
                          transition={{ delay: 0.3 + appIdx * 0.1, duration: 0.6, ease: 'easeOut' }}
                          style={{
                            right: '1.5rem',
                            left: '1.5rem',
                            transformOrigin: 'left',
                          }}
                        />
                      )}

                      {STAGES.map((stage, idx) => {
                        let nodeState; // 'done' | 'active' | 'rejected' | 'future'

                        if (isRejected) {
                          if (idx <= doneUpTo + 1) nodeState = idx <= doneUpTo ? 'done' : 'rejected';
                          else nodeState = 'future';
                        } else if (isSelected) {
                          nodeState = 'done';
                        } else {
                          if (idx <= doneUpTo)       nodeState = 'done';
                          else if (idx === doneUpTo + 1) nodeState = 'active';
                          else                        nodeState = 'future';
                        }

                        const nodeStyle = {
                          done:     'bg-emerald-500 ring-emerald-100 dark:ring-emerald-800/60 text-white',
                          active:   'bg-blue-500 ring-blue-100 dark:ring-blue-800/60 text-white',
                          rejected: 'bg-red-500 ring-red-100 dark:ring-red-800/60 text-white',
                          future:   'bg-slate-100 dark:bg-[#21262D] ring-slate-50 dark:ring-[#30363D] text-slate-400 dark:text-[#656D76]',
                        }[nodeState];

                        return (
                          <div key={stage} className="flex flex-col items-center flex-1 relative z-10">
                            {/* Node */}
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                delay: 0.4 + appIdx * 0.1 + idx * 0.08,
                                type: 'spring',
                                stiffness: 400,
                                damping: 20,
                              }}
                              className={`w-10 h-10 rounded-full flex items-center justify-center ring-4 z-10 ${nodeStyle} relative`}
                            >
                              {/* Pulsing ring for active step */}
                              {nodeState === 'active' && (
                                <motion.div
                                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
                                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                                  className="absolute inset-0 rounded-full bg-blue-400/30"
                                />
                              )}
                              {nodeState === 'done'     && <CheckCircle size={16} />}
                              {nodeState === 'active'   && <Clock size={16} />}
                              {nodeState === 'rejected' && <XCircle size={16} />}
                              {nodeState === 'future'   && <span className="text-xs font-bold">{idx + 1}</span>}
                            </motion.div>

                            {/* Label */}
                            <p className={`mt-3 text-xs font-bold uppercase tracking-wide text-center ${
                              nodeState === 'done'     ? 'text-emerald-600 dark:text-emerald-400' :
                              nodeState === 'active'   ? 'text-blue-600 dark:text-blue-400' :
                              nodeState === 'rejected' ? 'text-red-600 dark:text-red-400' :
                              'text-slate-400 dark:text-[#656D76]'
                            }`}>
                              {stage}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-[#656D76] mt-0.5">
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
                          if (idx <= doneUpTo)           nodeState = 'done';
                          else if (idx === doneUpTo + 1) nodeState = 'rejected';
                          else                           nodeState = 'future';
                        } else if (isSelected) {
                          nodeState = 'done';
                        } else {
                          if (idx <= doneUpTo)           nodeState = 'done';
                          else if (idx === doneUpTo + 1) nodeState = 'active';
                          else                           nodeState = 'future';
                        }

                        const dotStyle = {
                          done:     'bg-emerald-500 text-white',
                          active:   'bg-blue-500 text-white',
                          rejected: 'bg-red-500 text-white',
                          future:   'bg-slate-100 dark:bg-[#21262D] text-slate-400 dark:text-[#656D76]',
                        }[nodeState];

                        return (
                          <div key={stage} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${dotStyle}`}>
                              {nodeState === 'done'     ? <CheckCircle size={14} /> :
                               nodeState === 'rejected' ? <XCircle size={14} /> :
                               nodeState === 'active'   ? <Clock size={14} /> :
                               <span className="text-xs font-bold">{idx + 1}</span>}
                            </div>
                            <span className={`text-sm font-semibold ${nodeState === 'future' ? 'text-slate-400 dark:text-[#656D76]' : 'text-slate-900 dark:text-[#E6EDF3]'}`}>
                              {stage}
                            </span>
                            {nodeState === 'active' && (
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-bold ml-auto">In Progress</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Banners ── */}
                  {isRejected && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mx-6 mb-5 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-sm text-red-700 dark:text-red-400 font-medium flex items-center gap-2"
                    >
                      <XCircle size={16} className="shrink-0" />
                      Your application was not selected for this drive. Keep going — more opportunities await!
                    </motion.div>
                  )}

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5, type: 'spring' }}
                      className="mx-6 mb-5 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl text-sm text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-2"
                    >
                      <CheckCircle size={16} className="shrink-0" />
                      🎉 Congratulations! You have been selected for {drive.company_name}.
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
};

export default MyApplications;
