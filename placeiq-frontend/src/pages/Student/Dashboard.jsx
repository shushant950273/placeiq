import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import { StatCardSkeleton } from '../../components/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  Briefcase, FileCheck, CheckCircle, Zap,
  ArrowRight, Target, TrendingUp, AlertCircle,
  Sun, Moon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { pageVariants, staggerContainer, listItem } from '../../utils/animations';

/* ── Greeting by time ───────────────────────────── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning',   icon: Sun,  color: 'text-amber-500' };
  if (h < 17) return { text: 'Good afternoon', icon: Sun,  color: 'text-orange-500' };
  return             { text: 'Good evening',   icon: Moon, color: 'text-violet-500' };
};

/* ── Animated progress bar using Framer Motion ── */
const ProfileProgressBar = ({ score }) => {
  const color = score >= 80 ? 'from-emerald-400 to-teal-500'
              : score >= 50 ? 'from-blue-400 to-violet-500'
                            : 'from-orange-400 to-rose-500';

  return (
    <div className="w-full bg-slate-100 dark:bg-[#21262D] rounded-full h-3 overflow-hidden shadow-inner">
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
      />
    </div>
  );
};

/* ── Upcoming drive row ─────────────────────────── */
const DriveRow = ({ drive, index }) => {
  const deadline = drive.registration_deadline
    ? Math.ceil((new Date(drive.registration_deadline) - new Date()) / 86400000)
    : null;

  return (
    <motion.div variants={listItem}>
      <Link
        to={`/student/drives/${drive.id}`}
        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#161B22] hover:bg-blue-50/60 dark:hover:bg-[#1C2128] border border-slate-100 dark:border-[#30363D] hover:border-blue-200 dark:hover:border-blue-700 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold shrink-0 group-hover:scale-105 transition-transform duration-200">
            {(drive.company_name || 'C').charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-[#E6EDF3] group-hover:text-primary dark:group-hover:text-[#58A6FF] transition-colors leading-tight">
              {drive.company_name}
            </p>
            <p className="text-xs text-slate-400 dark:text-[#8B949E] font-medium">{drive.role_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {deadline !== null && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              deadline <= 3 ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
              deadline <= 7 ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                              'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
            }`}>
              {deadline <= 0 ? 'Due today' : `${deadline}d`}
            </span>
          )}
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
            ₹{drive.ctc}L
          </span>
          <ArrowRight
            size={14}
            className="text-slate-300 dark:text-[#656D76] group-hover:text-primary dark:group-hover:text-[#58A6FF] group-hover:translate-x-0.5 transition-all duration-200"
          />
        </div>
      </Link>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════ */
const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading,        setLoading]        = useState(true);
  const [stats,          setStats]          = useState({ score: 0, suggestions: [] });
  const [applications,   setApplications]   = useState([]);
  const [upcomingDrives, setUpcomingDrives] = useState([]);

  const greeting = getGreeting();
  const GreetIcon = greeting.icon;

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [scoreRes, appsRes, drivesRes] = await Promise.all([
          api.get('/api/student/profile-score/'),
          api.get('/api/student/applications/'),
          api.get('/api/drives/upcoming/'),
        ]);
        setStats(scoreRes.data);
        setApplications(appsRes.data || []);
        setUpcomingDrives((drivesRes.data || []).slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const appliedCount     = applications.length;
  const shortlistedCount = applications.filter(a => a.status === 'shortlisted').length;
  const selectedCount    = applications.filter(a => a.status === 'selected').length;

  return (
    <Layout>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-7xl mx-auto space-y-7 pb-10"
      >
        {/* ── Greeting Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GreetIcon size={20} className={greeting.color} />
              <p className="text-sm font-semibold text-slate-400 dark:text-[#8B949E]">{greeting.text}</p>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-[#E6EDF3] leading-tight">
              {user?.name || 'Student'} <span className="text-slate-300">👋</span>
            </h1>
            <p className="text-slate-400 dark:text-[#8B949E] mt-1 font-medium text-sm">
              Here's your placement progress at a glance.
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.03, boxShadow: '0 4px 20px rgba(59,130,246,0.4)' }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/student/drives"
              className="flex items-center gap-2 btn-primary text-sm px-5 py-2.5 self-start md:self-auto"
            >
              <Zap size={15} /> Browse Drives
            </Link>
          </motion.div>
        </motion.div>

        {/* ── Stat Cards (staggered) ── */}
        {loading ? (
          <StatCardSkeleton count={4} />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            <StatCard index={0} icon={Briefcase}   value={appliedCount}     label="Drives Applied"   color="blue"   onClick={() => window.location.href = '/student/drives'} />
            <StatCard index={1} icon={FileCheck}    value={shortlistedCount} label="Shortlisted"      color="orange" onClick={() => window.location.href = '/student/applications'} />
            <StatCard index={2} icon={CheckCircle}  value={selectedCount}    label="Offers Received"  color="green"  onClick={() => window.location.href = '/student/applications'} />
            <StatCard index={3} icon={Target}       value={stats.score}      label="Profile Score"    color="purple" suffix="%" onClick={() => window.location.href = '/student/profile'} />
          </motion.div>
        )}

        {/* ── Bottom Grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

          {/* Profile completeness — 3 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="xl:col-span-3 bg-white dark:bg-[#161B22] rounded-2xl border border-slate-100 dark:border-[#30363D] shadow-card p-7"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-[#E6EDF3]">Profile Completeness</h2>
                <p className="text-xs text-slate-400 dark:text-[#8B949E] font-medium mt-0.5">
                  Complete your profile to get shortlisted faster
                </p>
              </div>
              <div className="text-right">
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="text-3xl font-black text-slate-900 dark:text-[#E6EDF3]"
                >
                  {stats.score}<span className="text-lg text-slate-400">%</span>
                </motion.p>
              </div>
            </div>

            <ProfileProgressBar score={stats.score} />

            {/* Profile suggestions — staggered list */}
            {stats.suggestions?.length > 0 ? (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="mt-6 space-y-2.5"
              >
                <p className="text-xs font-bold text-slate-500 dark:text-[#8B949E] uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp size={12} /> Steps to reach 100%
                </p>
                {stats.suggestions.map((s, i) => (
                  <motion.div
                    key={i}
                    variants={listItem}
                    className="flex items-start gap-2.5 p-3 bg-slate-50 dark:bg-[#21262D] rounded-xl border border-slate-100 dark:border-[#30363D]"
                  >
                    <AlertCircle size={14} className="text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 dark:text-[#8B949E] font-medium leading-snug">{s}</p>
                  </motion.div>
                ))}
                <Link
                  to="/student/profile"
                  className="flex items-center gap-1.5 text-xs font-bold text-accent hover:text-secondary transition-colors mt-2"
                >
                  <ArrowRight size={13} /> Complete my profile
                </Link>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4"
              >
                <CheckCircle size={20} className="text-emerald-500 shrink-0" />
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">
                  🎉 Your profile is 100% complete!
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Upcoming Drives — 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="xl:col-span-2 bg-white dark:bg-[#161B22] rounded-2xl border border-slate-100 dark:border-[#30363D] shadow-card p-7 flex flex-col"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-[#E6EDF3]">Upcoming Drives</h2>
              <Link
                to="/student/drives"
                className="text-xs font-bold text-accent hover:text-secondary dark:text-[#58A6FF] transition-colors flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 bg-slate-100 dark:bg-[#21262D] rounded-xl" />
                ))}
              </div>
            ) : upcomingDrives.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-[#21262D] border-2 border-dashed border-slate-200 dark:border-[#30363D] flex items-center justify-center mb-3">
                  <Briefcase className="text-slate-300 dark:text-[#656D76]" size={24} />
                </div>
                <p className="text-sm text-slate-400 dark:text-[#8B949E] font-medium">No upcoming drives yet</p>
              </div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="flex-1 space-y-2.5"
              >
                {upcomingDrives.map((drive, i) => (
                  <DriveRow key={drive.id} drive={drive} index={i} />
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default StudentDashboard;
