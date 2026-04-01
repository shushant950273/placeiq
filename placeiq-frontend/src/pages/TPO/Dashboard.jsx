import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import { StatCardSkeleton } from '../../components/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  Users, UserCheck, Percent, Briefcase, PlusCircle,
  Building, FileDown, DollarSign, UserX, TrendingUp, Loader2, X
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { Link } from 'react-router-dom';

/* ── Custom chart tooltip ─────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 px-4 py-3 text-sm font-semibold">
      <p className="text-slate-500 dark:text-slate-400 mb-1 text-xs uppercase tracking-wide">{label}</p>
      <p className="text-slate-900 dark:text-slate-100 text-base font-black">{payload[0].value}
        <span className="text-xs text-slate-400 font-medium ml-1">{payload[0].name}</span>
      </p>
    </div>
  );
};

/* ── Fallback Dummy Data ──────────────────────────── */
const DUMMY_BRANCH_DATA = [
  { branch: "CSE", percentage: 45, placed: 28, total: 62 },
  { branch: "ISE", percentage: 38, placed: 21, total: 55 },
  { branch: "ECE", percentage: 29, placed: 14, total: 48 },
  { branch: "ME",  percentage: 18, placed: 7,  total: 40 },
  { branch: "CV",  percentage: 12, placed: 4,  total: 35 },
];

const DUMMY_COMPANY_DATA = [
  { company_name: "Infosys",  hired_count: 24 },
  { company_name: "TCS",      hired_count: 18 },
  { company_name: "Wipro",    hired_count: 15 },
  { company_name: "Accenture",hired_count: 12 },
  { company_name: "Cognizant",hired_count: 9  },
];

const DUMMY_STATS = {
  total_students: 240,
  placed_students: 142,
  placement_percentage: 59.2,
  active_drives: 3,
  average_ctc: 4.5,
};

const formatCollegeName = (name) => 
  name?.split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ') || 'Your College';

/* ══════════════════════════════════════════════════ */
const TPODashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isUsingDummy, setIsUsingDummy] = useState(false);

  useEffect(() => {
    api.get('/api/analytics/dashboard/')
      .then((res) => {
        const d = res.data;
        if (!d || d.total_students === 0) {
          setData(DUMMY_STATS);
          setIsUsingDummy(true);
          setShowBanner(true);
        } else {
          setData(d);
        }
      })
      .catch(err => {
        console.error(err);
        setData(DUMMY_STATS);
        setIsUsingDummy(true);
        setShowBanner(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadNAAC = async () => {
    // ... logic unchanged
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/analytics/naac-report/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Server error');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'NAAC_Placement_Report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Could not generate report. Make sure reportlab is installed.');
    } finally {
      setDownloading(false);
    }
  };

  const rawBranch = data?.branch_wise_stats || [];
  const cleanBranch = rawBranch.filter(
    b => b.branch && b.branch !== 'Unknown' && b.branch !== 'unknown'
  );
  
  const branchData = cleanBranch.length > 0 ? cleanBranch : DUMMY_BRANCH_DATA;
  
  const rawCompany = data?.top_companies || [];
  const companyData = rawCompany.length > 0 ? rawCompany : DUMMY_COMPANY_DATA;

  // Pie Chart Data
  const pieData = [
    { name: 'Placed', value: data?.placed_students || 0, color: '#3B82F6' },
    { name: 'Unplaced', value: Math.max(0, (data?.total_students || 0) - (data?.placed_students || 0)), color: '#E2E8F0' },
  ];

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-7xl mx-auto space-y-7 pb-10"
      >
        {/* ── Banner ── */}
        <AnimatePresence>
          {showBanner && isUsingDummy && (
            <motion.div
              initial={{ opacity: 0, height: 0, mb: 0 }}
              animate={{ opacity: 1, height: 'auto', mb: 16 }}
              exit={{ opacity: 0, height: 0, mb: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-amber-50 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700/50 text-amber-800 dark:text-amber-200 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className="text-xl">📊</span>
                  Showing sample data. Add students and drives to see real statistics.
                </div>
                <button onClick={() => setShowBanner(false)} className="text-amber-600 hover:text-amber-900 dark:hover:text-amber-100 transition-colors">
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Header banner ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-[#1a4a7a] to-secondary px-7 py-6 text-white shadow-xl dark:border dark:border-white/10">
          <div className="absolute inset-0 bg-dot-grid opacity-25 pointer-events-none mix-blend-overlay" />
          <div className="absolute right-0 bottom-0 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-blue-200/70 text-xs font-bold uppercase tracking-widest mb-2">TPO Analytics Dashboard</p>
              <h1 className="text-3xl font-black tracking-tight mb-1">
                {formatCollegeName(user?.college_name)}
              </h1>
              <p className="text-blue-200/70 font-medium text-sm">Institutional placement intelligence & tracking.</p>
            </div>

            <div className="flex gap-3 shrink-0 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleDownloadNAAC}
                disabled={downloading}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all backdrop-blur-sm disabled:opacity-60"
              >
                {downloading ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} className="text-red-300" />}
                NAAC Report
              </motion.button>
              <Link to="/tpo/drives/create">
                <motion.div
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 bg-white text-primary px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                >
                  <PlusCircle size={16} /> Create Drive
                </motion.div>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        {loading ? (
          <StatCardSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard index={0} icon={Users}     value={data?.total_students || 0}   label="Total Students"  color="blue"   onClick={() => window.location.href='/tpo/students'} />
            <StatCard index={1} icon={UserCheck}  value={data?.placed_students || 0}  label="Placed"          color="green"  />
            <StatCard index={2} icon={UserX}      value={Math.max(0, (data?.total_students||0)-(data?.placed_students||0))} label="Unplaced" color="rose" />
            <StatCard index={3} icon={Percent}    value={data?.placement_percentage||0} label="% Rate"       color="purple" suffix="%" />
            <StatCard index={4} icon={DollarSign} value={data?.average_ctc||0}        label="Avg CTC"         color="teal"   suffix=" LPA" />
            <StatCard index={5} icon={Briefcase}  value={data?.active_drives||0}      label="Active Drives"   color="orange" onClick={() => window.location.href='/tpo/drives'} />
          </div>
        )}

        {/* ── Charts ── */}
        {!loading && data && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Pie Chart: Placed vs Not Placed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-7 shadow-sm text-center col-span-1"
            >
              <div className="flex items-center gap-2 mb-2 justify-center">
                <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                  <Percent size={16} className="text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Placement Ratio</h2>
              </div>
              
              <div className="relative h-60 mt-4 flex justify-center">
                <ResponsiveContainer width={240} height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                      animationDuration={1500}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                  <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{(data?.placement_percentage || 0).toFixed(0)}%</span>
                  <span className="text-xs font-semibold text-slate-400">Placed</span>
                </div>
              </div>
            </motion.div>

            {/* Branch-wise placements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-7 shadow-sm col-span-1 lg:col-span-2"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <TrendingUp size={16} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Branch-wise Placement Rate</h2>
                  <p className="text-xs text-slate-400 font-medium">Percentage of students placed per branch</p>
                </div>
              </div>
              
              {cleanBranch.length === 0 && (
                <div className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full mb-3 inline-block font-semibold">
                  Sample data — add placements to see real stats
                </div>
              )}

              <div className="h-60 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={branchData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700/50" />
                    <XAxis dataKey="branch" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} dy={8} />
                    <YAxis domain={[0, 100]} tickFormatter={v => v + '%'} axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} formatter={(val) => val + '%'} contentStyle={{ borderRadius: 8 }} />
                    <Bar animationDuration={1200} animationEasing="ease-out" dataKey="percentage" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Top hiring companies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-7 shadow-sm col-span-1 lg:col-span-3"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
                  <Building size={16} className="text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Top Hiring Companies</h2>
                  <p className="text-xs text-slate-400 font-medium">Students hired per company this cycle</p>
                </div>
              </div>
              
              {rawCompany.length === 0 && (
                <div className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full mb-3 inline-block font-semibold">
                  Sample data — add placements to see real stats
                </div>
              )}

              <div className="h-72 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={companyData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700/50" />
                    <XAxis dataKey="company_name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area animationDuration={1500} type="monotone" dataKey="hired_count" name="Hired" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#areaGradient)" dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default TPODashboard;
