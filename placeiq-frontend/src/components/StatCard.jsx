import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Premium animated stat card with counter animation
 * Props:
 *   icon      - Lucide icon component
 *   value     - numeric or string value to display
 *   label     - card label
 *   color     - tailwind color scheme: 'blue'|'green'|'orange'|'purple'|'teal'|'rose'
 *   suffix    - optional suffix like '%' or 'LPA'
 *   trend     - optional trend text e.g. "+3 this week"
 *   href      - optional, makes card a click target (passed as onClick)
 *   onClick   - optional click handler
 *   index     - stagger index for entrance animation
 */

const colorMap = {
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   ring: 'ring-blue-100',  hover: 'hover:border-blue-200' },
  green:  { bg: 'bg-emerald-50',icon: 'text-emerald-600',ring: 'ring-emerald-100',hover: 'hover:border-emerald-200' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-500', ring: 'ring-orange-100', hover: 'hover:border-orange-200' },
  purple: { bg: 'bg-violet-50', icon: 'text-violet-600', ring: 'ring-violet-100', hover: 'hover:border-violet-200' },
  teal:   { bg: 'bg-teal-50',   icon: 'text-teal-600',   ring: 'ring-teal-100',  hover: 'hover:border-teal-200' },
  rose:   { bg: 'bg-rose-50',   icon: 'text-rose-500',   ring: 'ring-rose-100',  hover: 'hover:border-rose-200' },
};

/* Animated number counter */
const AnimatedNumber = ({ target, suffix = '', duration = 1200 }) => {
  const [display, setDisplay] = useState(0);
  const numericTarget = parseFloat(String(target).replace(/[^\d.]/g, '')) || 0;
  const isNumeric      = !isNaN(numericTarget) && numericTarget > 0;

  useEffect(() => {
    if (!isNumeric) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOut quad
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * numericTarget * 10) / 10);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [numericTarget, duration]);

  if (!isNumeric) return <>{target}{suffix}</>;
  return <>{display % 1 === 0 ? Math.round(display) : display.toFixed(1)}{suffix}</>;
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ y: -3, scale: 1.01 }}
      onClick={onClick}
      className={`
        bg-white rounded-2xl border border-slate-100 p-5
        shadow-card hover:shadow-hover
        transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${c.hover}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${c.bg} ring-4 ${c.ring} flex items-center justify-center`}>
          <Icon size={20} className={c.icon} />
        </div>
        {trend && (
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>

      <div>
        <p className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
          <AnimatedNumber target={value} suffix={suffix} />
        </p>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </motion.div>
  );
};

export default StatCard;
