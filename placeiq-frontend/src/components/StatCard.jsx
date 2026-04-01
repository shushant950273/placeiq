import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cardVariants } from '../utils/animations';

/**
 * Premium animated stat card with count-up + stagger entrance
 * Props:
 *   icon      – Lucide icon component
 *   value     – numeric or string value
 *   label     – card label
 *   color     – 'blue'|'green'|'orange'|'purple'|'teal'|'rose'
 *   suffix    – optional suffix like '%' or ' LPA'
 *   trend     – optional badge text e.g. "+3 this week"
 *   onClick   – optional click handler
 *   index     – stagger index for entrance delay
 */

const colorMap = {
  blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',     icon: 'text-blue-600 dark:text-blue-400',    ring: 'ring-blue-100 dark:ring-blue-800',    hover: 'hover:border-blue-200 dark:hover:border-blue-700',   glow: 'group-hover:shadow-blue-500/20' },
  green:  { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-100 dark:ring-emerald-800', hover: 'hover:border-emerald-200 dark:hover:border-emerald-700', glow: 'group-hover:shadow-emerald-500/20' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', icon: 'text-orange-500 dark:text-orange-400', ring: 'ring-orange-100 dark:ring-orange-800',  hover: 'hover:border-orange-200 dark:hover:border-orange-700',  glow: 'group-hover:shadow-orange-500/20' },
  purple: { bg: 'bg-violet-50 dark:bg-violet-900/20', icon: 'text-violet-600 dark:text-violet-400', ring: 'ring-violet-100 dark:ring-violet-800',  hover: 'hover:border-violet-200 dark:hover:border-violet-700',  glow: 'group-hover:shadow-violet-500/20' },
  teal:   { bg: 'bg-teal-50 dark:bg-teal-900/20',     icon: 'text-teal-600 dark:text-teal-400',    ring: 'ring-teal-100 dark:ring-teal-800',    hover: 'hover:border-teal-200 dark:hover:border-teal-700',   glow: 'group-hover:shadow-teal-500/20' },
  rose:   { bg: 'bg-rose-50 dark:bg-rose-900/20',     icon: 'text-rose-500 dark:text-rose-400',    ring: 'ring-rose-100 dark:ring-rose-800',    hover: 'hover:border-rose-200 dark:hover:border-rose-700',   glow: 'group-hover:shadow-rose-500/20' },
};

/* ── Animated count-up number ── */
const CountUp = ({ target, duration = 1200 }) => {
  const [count, setCount] = useState(0);
  const numericTarget = parseFloat(String(target).replace(/[^\d.]/g, '')) || 0;
  const isNumeric = !isNaN(numericTarget) && numericTarget > 0;

  useEffect(() => {
    if (!isNumeric) return;
    let start = 0;
    const increment = numericTarget / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= numericTarget) {
        setCount(numericTarget);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [numericTarget, duration, isNumeric]);

  if (!isNumeric) return <>{target}</>;
  const displayed = numericTarget % 1 !== 0
    ? count.toFixed(1)
    : Math.floor(count);
  return <>{displayed}</>;
};

const StatCard = ({
  icon: Icon,
  value,
  label,
  color = 'blue',
  suffix = '',
  trend,
  onClick,
  index = 0,
}) => {
  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      transition={{ delay: index * 0.08 }}
      whileHover={{
        y: -4,
        boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
      }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`
        group relative bg-white dark:bg-[#161B22] rounded-2xl
        border border-slate-100 dark:border-[#30363D] p-5
        shadow-card hover:shadow-hover
        transition-shadow duration-300
        overflow-hidden
        ${onClick ? 'cursor-pointer' : ''}
        ${c.hover}
      `}
      style={{ transition: 'box-shadow 0.3s ease, border-color 0.3s ease' }}
    >
      {/* Subtle background glow on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-transparent to-current ${c.glow}`} />

      <div className="flex items-start justify-between mb-4 relative">
        {/* Icon with rotate-on-hover */}
        <div className={`p-2.5 rounded-xl ${c.bg} ring-4 ${c.ring} flex items-center justify-center`}>
          <Icon
            size={20}
            className={`${c.icon} transition-transform duration-300 group-hover:rotate-6`}
          />
        </div>

        {trend && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20, delay: index * 0.08 + 0.3 }}
            className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full"
          >
            {trend}
          </motion.span>
        )}
      </div>

      <div className="relative">
        <p className="text-2xl font-black text-slate-900 dark:text-[#E6EDF3] tracking-tight leading-none mb-1">
          <CountUp target={value} />{suffix}
        </p>
        <p className="text-xs font-semibold text-slate-400 dark:text-[#8B949E] uppercase tracking-widest">
          {label}
        </p>
      </div>
    </motion.div>
  );
};

export default StatCard;
