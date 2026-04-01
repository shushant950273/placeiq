import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, DollarSign, CheckCircle, ArrowRight, Clock, Zap } from 'lucide-react';

/* ── Deadline countdown helpers ─────────────────────── */
const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const DeadlinePill = ({ dateStr }) => {
  const days = daysUntil(dateStr);
  if (days === null) return null;

  if (days < 0)  return <span className="text-[11px] font-bold text-slate-400">Closed</span>;
  if (days === 0) return <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><Clock size={11} /> Due Today</span>;
  if (days <= 3)  return <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><Clock size={11} /> {days}d left</span>;
  if (days <= 7)  return <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"><Clock size={11} /> {days}d left</span>;
  return <span className="text-[11px] font-semibold text-slate-400">{new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>;
};

/* ── Company avatar color ──────────────────────────── */
const avatarGradients = [
  'from-blue-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-rose-600',
  'from-cyan-500 to-blue-600',
  'from-rose-500 to-pink-600',
];

const getGradient = (name = '') => {
  const idx = name.charCodeAt(0) % avatarGradients.length;
  return avatarGradients[idx];
};

/* ══════════════════════════════════════════════════ */
const DriveCard = ({ drive, studentMode = false, index = 0 }) => {
  const navigate = useNavigate();
  const grad     = useMemo(() => getGradient(drive.company_name), [drive.company_name]);

  const handleClick = () => {
    if (studentMode) navigate(`/student/drives/${drive.id}`);
  };

  const applyClick = (e) => {
    e.stopPropagation();
    navigate(`/student/drives/${drive.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
      whileHover={{ y: -5, scale: 1.01 }}
      onClick={handleClick}
      className={`
        bg-white rounded-2xl border border-slate-100 shadow-card
        flex flex-col
        transition-all duration-300 hover:shadow-hover hover:border-blue-100
        ${studentMode ? 'cursor-pointer' : ''}
      `}
    >
      {/* ── Card Header ── */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between mb-4 gap-2">
          <div className="flex items-center gap-3">
            {/* Company avatar */}
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0`}>
              {(drive.company_name || 'C').charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-[15px] leading-tight">{drive.company_name}</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{drive.role_name}</p>
            </div>
          </div>

          {/* Status badge */}
          <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${
            drive.status === 'upcoming'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : drive.status === 'ongoing'
              ? 'bg-orange-50 text-orange-700 border-orange-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              drive.status === 'upcoming' ? 'bg-blue-500' :
              drive.status === 'ongoing'  ? 'bg-orange-500' : 'bg-emerald-500'
            }`} />
            {drive.status || 'Upcoming'}
          </span>
        </div>

        {/* ── Info chips ── */}
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <DollarSign size={12} /> ₹{drive.ctc} LPA
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
            <Calendar size={12} /> {drive.drive_date
              ? new Date(drive.drive_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
              : '—'}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <MapPin size={12} /> {drive.job_location || '—'}
          </span>
        </div>
      </div>

      {/* ── Deadline row ── */}
      {drive.registration_deadline && (
        <div className="mx-5 mb-4 flex items-center justify-between py-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Registration deadline</span>
          <DeadlinePill dateStr={drive.registration_deadline} />
        </div>
      )}

      {/* ── CTA button ── */}
      {studentMode && (
        <div className="px-5 pb-5 mt-auto">
          {drive.is_applied ? (
            <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm">
              <CheckCircle size={16} /> Applied Successfully
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={applyClick}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white shadow-btn transition-all"
              style={{ background: 'linear-gradient(135deg, #2E75B6 0%, #3B82F6 100%)' }}
            >
              <Zap size={15} /> View & Apply
              <ArrowRight size={14} className="ml-auto opacity-60" />
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default DriveCard;
