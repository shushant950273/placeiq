import React from 'react';
import { CheckCircle } from 'lucide-react';

/**
 * Premium Badge with colored dot indicator
 * type: applied | shortlisted | selected | rejected | upcoming | ongoing | completed
 *       success | warning | blue | danger | default | red | yellow
 */

const config = {
  applied:     { dot: 'bg-blue-500',    bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200',   label: 'Applied' },
  shortlisted: { dot: 'bg-amber-400',   bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-amber-200',  label: 'Shortlisted' },
  selected:    { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700',border: 'border-emerald-200',label: 'Selected' },
  rejected:    { dot: 'bg-red-500',     bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-200',    label: 'Rejected' },
  upcoming:    { dot: 'bg-slate-400',   bg: 'bg-slate-50',   text: 'text-slate-600',  border: 'border-slate-200',  label: 'Upcoming' },
  ongoing:     { dot: 'bg-orange-400',  bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-200', label: 'Ongoing' },
  completed:   { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700',border: 'border-emerald-200',label: 'Completed', icon: true },
  // legacy aliases
  success:     { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700',border: 'border-emerald-200',label: null },
  warning:     { dot: 'bg-amber-400',   bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-amber-200',  label: null },
  blue:        { dot: 'bg-blue-500',    bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200',   label: null },
  danger:      { dot: 'bg-red-500',     bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-200',    label: null },
  red:         { dot: 'bg-red-500',     bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-200',    label: null },
  yellow:      { dot: 'bg-amber-400',   bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-amber-200',  label: null },
  default:     { dot: 'bg-slate-400',   bg: 'bg-slate-50',   text: 'text-slate-600',  border: 'border-slate-200',  label: null },
};

const Badge = ({ text, type = 'default' }) => {
  const key = (type || 'default').toLowerCase();
  const c   = config[key] || config.default;
  const displayText = c.label || text || type;

  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold
      border ${c.bg} ${c.text} ${c.border}
    `}>
      {c.icon
        ? <CheckCircle size={11} className="shrink-0" />
        : <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      }
      {displayText}
    </span>
  );
};

export default Badge;
