import React from 'react';

/**
 * Shimmer skeleton components
 * Usage: <LoadingSkeleton count={3} />
 *        <CardSkeleton />
 *        <StatCardSkeleton count={4} />
 *        <TableSkeleton rows={5} cols={5} />
 */

const Shimmer = ({ className = '' }) => (
  <div className={`skeleton rounded-lg ${className}`} />
);

/* ── Generic list skeleton ─────────────────────────── */
export const LoadingSkeleton = ({ count = 3 }) => (
  <div className="space-y-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 flex gap-4 shadow-card">
        <Shimmer className="w-12 h-12 rounded-xl shrink-0" />
        <div className="flex-1 space-y-3 py-0.5">
          <Shimmer className="h-4 w-2/3" />
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-4/5" />
        </div>
      </div>
    ))}
  </div>
);

/* ── Stat card skeleton row ─────────────────────────── */
export const StatCardSkeleton = ({ count = 4 }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${count} gap-5`}>
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card space-y-4">
        <div className="flex justify-between items-start">
          <Shimmer className="w-11 h-11 rounded-xl" />
          <Shimmer className="w-16 h-5 rounded-full" />
        </div>
        <Shimmer className="h-7 w-16" />
        <Shimmer className="h-3 w-24" />
      </div>
    ))}
  </div>
);

/* ── Card skeleton ─────────────────────────────────── */
export const CardSkeleton = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-card space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex gap-3 items-center">
            <Shimmer className="w-12 h-12 rounded-xl" />
            <div className="space-y-2">
              <Shimmer className="h-4 w-28" />
              <Shimmer className="h-3 w-20" />
            </div>
          </div>
          <Shimmer className="h-5 w-16 rounded-full" />
        </div>
        <div className="space-y-2">
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-3/4" />
        </div>
        <Shimmer className="h-10 w-full rounded-xl" />
      </div>
    ))}
  </div>
);

/* ── Table skeleton ────────────────────────────────── */
export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-card">
    <div className="p-4 border-b border-slate-100 flex gap-4">
      <Shimmer className="h-4 w-32" />
      <Shimmer className="h-4 w-24 ml-auto" />
    </div>
    {[...Array(rows)].map((_, r) => (
      <div key={r} className="flex gap-4 px-6 py-4 border-b border-slate-50 last:border-0">
        {[...Array(cols)].map((_, c) => (
          <Shimmer key={c} className="h-4" style={{ flex: c === 0 ? '0 0 40px' : 1 }} />
        ))}
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
