import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/Layout';
import DriveCard from '../../components/DriveCard';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import api from '../../api/axios';
import { Search, Briefcase } from 'lucide-react';
import { pageVariants, staggerContainer } from '../../utils/animations';

const FILTERS = ['All', 'Upcoming', 'Ongoing'];

const StudentDrives = () => {
  const [drives,  setDrives]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('All');

  useEffect(() => {
    api.get('/api/drives/')
      .then(res => setDrives(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredDrives = drives.filter(d => {
    const s = search.toLowerCase();
    const matchSearch = (d.company_name || '').toLowerCase().includes(s) ||
                        (d.role_name || '').toLowerCase().includes(s);
    const matchFilter = filter === 'All' || d.status?.toLowerCase() === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

  return (
    <Layout>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-7xl mx-auto pb-10 space-y-7"
      >
        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-[#E6EDF3]">
              Placement Drives
            </h1>
            <p className="text-slate-400 dark:text-[#8B949E] mt-1 font-medium text-sm">
              {loading
                ? 'Loading...'
                : `${filteredDrives.length} drive${filteredDrives.length !== 1 ? 's' : ''} matching your eligibility`}
            </p>
          </div>

          {/* Filter tabs with animated active pill */}
          <div className="flex gap-1 bg-slate-100 dark:bg-[#161B22] p-1 rounded-xl shrink-0 border border-transparent dark:border-[#30363D]">
            {FILTERS.map(f => (
              <motion.button
                key={f}
                whileTap={{ scale: 0.96 }}
                onClick={() => setFilter(f)}
                className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  filter === f
                    ? 'text-slate-900 dark:text-[#E6EDF3]'
                    : 'text-slate-500 dark:text-[#8B949E] hover:text-slate-700 dark:hover:text-[#E6EDF3]'
                }`}
              >
                {filter === f && (
                  <motion.div
                    layoutId="filterTab"
                    className="absolute inset-0 bg-white dark:bg-[#21262D] shadow-sm rounded-lg border border-slate-200/50 dark:border-[#30363D]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{f}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Search Bar ── */}
        <div className="relative max-w-xl">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#656D76] pointer-events-none" />
          <input
            type="text"
            placeholder="Search by company or role…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] text-slate-900 dark:text-[#E6EDF3] rounded-xl text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-[#656D76] focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-300 shadow-card focus:w-full hover:border-slate-300 dark:hover:border-[#484F58]"
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#656D76] hover:text-slate-600 dark:hover:text-[#8B949E] text-xs font-bold bg-slate-100 dark:bg-[#21262D] px-2 py-0.5 rounded-lg transition-colors"
              >
                Clear
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <CardSkeleton count={6} />
        ) : filteredDrives.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#161B22] rounded-2xl border border-dashed border-slate-200 dark:border-[#30363D] shadow-card"
          >
            <div className="w-20 h-20 bg-slate-50 dark:bg-[#21262D] rounded-2xl border-2 border-dashed border-slate-200 dark:border-[#30363D] flex items-center justify-center mb-5">
              <Briefcase className="text-slate-300 dark:text-[#656D76]" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-[#E6EDF3] mb-2">No Drives Found</h3>
            <p className="text-slate-400 dark:text-[#8B949E] font-medium text-sm max-w-xs text-center">
              {search
                ? `No results for "${search}". Try a different search term.`
                : 'No drives match your current filter or eligibility criteria.'
              }
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-4 text-accent dark:text-[#58A6FF] font-bold text-sm hover:text-secondary transition-colors"
              >
                Clear search
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filteredDrives.map((drive, i) => (
                <DriveCard key={drive.id} drive={drive} studentMode index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
};

export default StudentDrives;
