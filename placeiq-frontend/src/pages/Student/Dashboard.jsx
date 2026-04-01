import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import { StatCardSkeleton } from '../../components/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  Briefcase, FileCheck, CheckCircle, Zap,
  ArrowRight, Target, TrendingUp, AlertCircle,
  Sun, Moon, Sunset,
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ── Greeting by time ────────────────────────────── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning', icon: Sun,    color: 'text-amber-500' };
  if (h < 17) return { text: 'Good afternoon', icon: Sun,  color: 'text-orange-500' };
  return             { text: 'Good evening', icon: Moon,   color: 'text-violet-500' };
};

/* ── Animated gradient progress bar ─────────────── */
const ProfileProgressBar = ({ score }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 200);
    return () => clearTimeout(t);
  }, [score]);

  const color = score >= 80 ? 'from-emerald-400 to-teal-500' :
                score >= 50 ? 'from-blue-400 to-violet-500' :
                              'from-orange-400 to-rose-500';

  return (
    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
};

/* ── Upcoming drive mini card ────────────────────── */
const DriveRow = ({ drive, index }) => {
  const deadline = drive.registration_deadline
    ? Math.ceil((new Date(drive.registration_deadline) - new Date()) / 86400000)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.3 }}
    >
      <Link
        to={`/student/drives/${drive.id}`}
        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-100 hover:border-blue-200 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold shrink-0">
            {(drive.company_name || 'C').charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors leading-tight">
              {drive.company_name}
            </p>
            <p className="text-xs text-slate-400 font-medium">{drive.role_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {deadline !== null && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              deadline <= 3 ? 'bg-red-50 text-red-600' :
              deadline <= 7 ? 'bg-amber-50 text-amber-600' :
              'bg-emerald-50 text-emerald-600'
            }`}>
              {deadline <= 0 ? 'Due today' : `${deadline}d`}
            </span>
          )}
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            ₹{drive.ctc}L
          </span>
          <ArrowRight size={14} className="text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
      </Link>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════ */
const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading,       setLoading]       = useState(true);
  const [stats,         setStats]         = useState({ score: 0, suggestions: [] });
  const [applications,  setApplications]  = useState([]);
  const [upcomingDrives,setUpcomingDrives]= useState([]);

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
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-7xl mx-auto space-y-7 pb-10"
      >
        {/* ── Greeting Banner ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GreetIcon size={20} className={greeting.color} />
              <p className="text-sm font-semibold text-slate-400">{greeting.text}</p>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
              {user?.name || 'Student'} <span className="text-slate-300">👋</span>
            </h1>
            <p className="text-slate-400 mt-1 font-medium text-sm">Here's your placement progress at a glance.</p>
          </div>
          <Link
            to="/student/drives"
            className="flex items-center gap-2 btn-primary text-sm px-5 py-2.5 self-start md:self-auto"
          >
            <Zap size={15} /> Browse Drives
          </Link>
        </div>

        {/* ── Stat Cards ── */}
        {loading ? (
          <StatCardSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              index={0} icon={Briefcase} value={appliedCount}
              label="Drives Applied" color="blue"
              onClick={() => window.location.href = '/student/drives'}
            />
            <StatCard
              index={1} icon={FileCheck} value={shortlistedCount}
              label="Shortlisted" color="orange"
              onClick={() => window.location.href = '/student/applications'}
            />
            <StatCard
              index={2} icon={CheckCircle} value={selectedCount}
              label="Offers Received" color="green"
              onClick={() => window.location.href = '/student/applications'}
            />
            <StatCard
              index={3} icon={Target} value={stats.score}
              label="Profile Score" color="purple" suffix="%"
              onClick={() => window.location.href = '/student/profile'}
            />
          </div>
        )}

        {/* ── Bottom Grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

          {/* Profile completeness — 3 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="xl:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-card p-7"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Profile Completeness</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Complete your profile to get shortlisted faster</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-slate-900">{stats.score}<span className="text-lg text-slate-400">%</span></p>
              </div>
            </div>

            <ProfileProgressBar score={stats.score} />

            {/* Suggestions */}
            {stats.suggestions?.length > 0 ? (
              <div className="mt-6 space-y-2.5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp size={12} /> Steps to reach 100%
                </p>
                {stats.suggestions.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.07 }}
                    className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <AlertCircle size={14} className="text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 font-medium leading-snug">{s}</p>
                  </motion.div>
                ))}

                <Link
                  to="/student/profile"
                  className="flex items-center gap-1.5 text-xs font-bold text-accent hover:text-secondary transition-colors mt-2"
                >
                  <ArrowRight size={13} /> Complete my profile
                </Link>
              </div>
            ) : (
              <div className="mt-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <CheckCircle size={20} className="text-emerald-500 shrink-0" />
                <p className="text-sm font-bold text-emerald-800">🎉 Your profile is 100% complete!</p>
              </div>
            )}
          </motion.div>

          {/* Upcoming Drives — 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-card p-7 flex flex-col"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">Upcoming Drives</h2>
              <Link to="/student/drives" className="text-xs font-bold text-accent hover:text-secondary transition-colors flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3 animate-pulse">
                {[1,2,3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl skeleton" />)}
              </div>
            ) : upcomingDrives.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mb-3">
                  <Briefcase className="text-slate-300" size={24} />
                </div>
                <p className="text-sm text-slate-400 font-medium">No upcoming drives yet</p>
              </div>
            ) : (
              <div className="flex-1 space-y-2.5">
                {upcomingDrives.map((drive, i) => (
                  <DriveRow key={drive.id} drive={drive} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default StudentDashboard;
