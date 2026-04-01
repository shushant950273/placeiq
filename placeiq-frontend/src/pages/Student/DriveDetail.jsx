import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Toast from '../../components/Toast';
import api from '../../api/axios';
import {
  ArrowLeft, MapPin, Calendar, Clock, DollarSign, Award,
  ArrowRight, CheckCircle, AlertCircle, Target, TrendingUp,
  Star, Users, Briefcase, ChevronRight, Info,
} from 'lucide-react';

/* ── helpers ──────────────────────────────────────── */
const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const StatusBadge = ({ status }) => {
  const map = {
    upcoming:  'bg-blue-100 text-blue-700 border-blue-200',
    ongoing:   'bg-yellow-100 text-yellow-700 border-yellow-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${map[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {status || 'upcoming'}
    </span>
  );
};

const DiffBadge = ({ d }) => {
  const map = { easy: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700', hard: 'bg-red-100 text-red-700' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${map[d] || 'bg-gray-100 text-gray-600'}`}>{d}</span>;
};

/* ── skeleton boxes ───────────────────────────────── */
const Skeleton = ({ h = 'h-8', w = 'w-full', cls = '' }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${h} ${w} ${cls}`} />
);

/* ── circular readiness ring ─────────────────────── */
const ReadinessRing = ({ score }) => {
  const R = 40;
  const C = 2 * Math.PI * R;
  const offset = C - (score / 100) * C;
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444';
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
      <circle cx="50" cy="50" r={R} fill="none" stroke="#e5e7eb" strokeWidth="10" />
      <circle
        cx="50" cy="50" r={R} fill="none"
        stroke={color} strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)' }}
      />
    </svg>
  );
};

/* ══════════════════════════════════════════════════ */
const DriveDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [drive,       setDrive]       = useState(null);
  const [readiness,   setReadiness]   = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [applying,    setApplying]    = useState(false);
  const [toast,       setToast]       = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [driveRes, readRes, expRes] = await Promise.allSettled([
          api.get(`/api/drives/${id}/`),
          api.get(`/api/student/readiness/${id}/`),
          api.get(`/api/experiences/feed/?company=${id}`),
        ]);

        if (driveRes.status === 'fulfilled') setDrive(driveRes.value.data);
        if (readRes.status  === 'fulfilled') setReadiness(readRes.value.data);
        if (expRes.status   === 'fulfilled') setExperiences(expRes.value.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  // Fetch experiences again filtered by drive company name once drive loads
  useEffect(() => {
    if (!drive?.company_name) return;
    api.get(`/api/experiences/feed/?company=${encodeURIComponent(drive.company_name)}`)
      .then(r => setExperiences(r.data || []))
      .catch(() => {});
  }, [drive?.company_name]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post(`/api/drives/${id}/apply/`);
      setDrive(prev => ({ ...prev, is_applied: true }));
      setToast({ type: 'success', message: '🎉 Application submitted successfully!' });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.error || 'Failed to apply. Please try again.' });
    } finally {
      setApplying(false);
    }
  };

  /* ── loading skeleton ─────────────────────────── */
  if (loading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-pulse">
          <div className="h-6 w-32 bg-gray-100 rounded-lg" />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-40 bg-gradient-to-r from-gray-200 to-gray-100" />
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-4 gap-6">
                {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
              </div>
              <div className="h-32 bg-gray-100 rounded-2xl" />
              <div className="h-14 bg-gray-100 rounded-xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!drive) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="text-gray-400" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Drive Not Found</h2>
          <p className="text-gray-500 mb-6">This drive may no longer be available.</p>
          <button onClick={() => navigate('/student/drives')} className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-[#152a45] transition-colors">
            Back to Drives
          </button>
        </div>
      </Layout>
    );
  }

  const isPastDeadline = drive.registration_deadline && new Date(drive.registration_deadline) < new Date();

  return (
    <Layout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Back Button ── */}
      <div className="max-w-5xl mx-auto pb-12 space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Back to Drives
        </button>

        {/* ── Hero Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2E75B6] p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #fff 0%, transparent 60%)' }} />
            <div className="relative z-10">
              <StatusBadge status={drive.status} />
              <h1 className="text-3xl font-black mt-3 mb-1 tracking-tight">{drive.company_name || 'Company'}</h1>
              <p className="text-lg text-blue-100 font-semibold">{drive.role_name}</p>
              {drive.job_type && (
                <span className="inline-block mt-2 text-xs font-bold bg-white/10 px-3 py-1 rounded-full">
                  {drive.job_type}
                </span>
              )}
            </div>
          </div>

          {/* ── Key Stats ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-b border-gray-100">
            {[
              { icon: <DollarSign size={18} className="text-green-600" />, bg: 'bg-green-50', label: 'CTC', value: `₹${drive.ctc} LPA` },
              { icon: <MapPin size={18} className="text-blue-600" />, bg: 'bg-blue-50', label: 'Location', value: drive.job_location || '—' },
              { icon: <Calendar size={18} className="text-purple-600" />, bg: 'bg-purple-50', label: 'Drive Date', value: fmt(drive.drive_date) },
              { icon: <Award size={18} className="text-orange-600" />, bg: 'bg-orange-50', label: 'Min GPA', value: `${drive.eligibility_gpa}+` },
            ].map(({ icon, bg, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-5 border-r last:border-r-0 border-gray-100">
                <div className={`${bg} p-2.5 rounded-xl shrink-0`}>{icon}</div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold">{label}</p>
                  <p className="font-bold text-gray-900 text-sm">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Readiness Widget ── */}
          {readiness && (
            <div className="m-6 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-gray-150 p-6 flex flex-col xl:flex-row items-center gap-6">
              {/* Ring */}
              <div className="relative shrink-0">
                <ReadinessRing score={readiness.score} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-gray-800">{readiness.score}<span className="text-sm">%</span></span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ready</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 w-full">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-1">
                  <Target size={18} className="text-primary" /> AI Readiness Analysis
                </h3>
                <p className="text-gray-600 font-medium mb-4 text-sm">{readiness.message}</p>

                {readiness.suggestions?.length > 0 ? (
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                      <TrendingUp size={13} /> Steps to Improve:
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {readiness.suggestions.map((s, i) => (
                        <li key={i} className="flex gap-2 text-xs bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm text-gray-700">
                          <AlertCircle size={14} className="text-blue-500 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-green-50 text-green-800 p-3 rounded-xl flex items-center gap-2 font-semibold text-sm">
                    <CheckCircle size={18} /> You perfectly match the requirements. Apply confidently!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Eligibility Info ── */}
          <div className="mx-6 mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
            <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <span className="font-bold">Eligibility: </span>
              Min GPA {drive.eligibility_gpa} · Max Backlogs {drive.max_backlogs ?? 0}
              {drive.eligible_branches && ` · Branches: ${drive.eligible_branches}`}
            </div>
          </div>

          {/* ── Apply Footer ── */}
          <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/60 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                <Clock size={13} /> Registration Deadline
              </p>
              <p className={`font-bold mt-0.5 ${isPastDeadline ? 'text-red-600' : 'text-gray-800'}`}>
                {drive.registration_deadline ? new Date(drive.registration_deadline).toLocaleString('en-IN') : '—'}
              </p>
            </div>

            {drive.is_applied ? (
              <div className="flex items-center gap-2 bg-green-100 text-green-700 font-bold px-6 py-3 rounded-xl">
                <CheckCircle size={20} /> Applied Successfully
              </div>
            ) : isPastDeadline ? (
              <div className="bg-red-50 text-red-600 font-bold px-6 py-3 rounded-xl border border-red-200 text-sm">
                Registration Closed
              </div>
            ) : (
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex items-center gap-2 bg-primary text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-[#152a45] hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed text-base"
              >
                {applying ? 'Submitting…' : 'Submit Application'}
                {!applying && <ArrowRight size={18} />}
              </button>
            )}
          </div>
        </div>

        {/* ── Experiences from this company ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Users size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-gray-900">Past Interview Experiences</h2>
            <span className="ml-auto text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
              {experiences.length} posted
            </span>
          </div>

          {experiences.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3 border-2 border-dashed border-gray-200">
                <Star className="text-gray-300" size={24} />
              </div>
              <p className="text-gray-400 font-medium">No experiences shared for this company yet.</p>
              <p className="text-xs text-gray-400 mt-1">Be the first to help your juniors after your interview!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {experiences.slice(0, 5).map(exp => (
                <div key={exp.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-bold text-gray-900">{exp.drive_details?.role_name || 'Role'}</p>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-0.5">Anonymous</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <DiffBadge d={exp.difficulty} />
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} size={13}
                            fill={i <= exp.overall_rating ? '#FBBF24' : 'none'}
                            stroke={i <= exp.overall_rating ? '#FBBF24' : '#D1D5DB'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Rounds</p>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg leading-relaxed">{exp.rounds_description}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Questions Asked</p>
                      <p className="text-gray-700 bg-blue-50/50 p-3 rounded-lg border-l-4 border-blue-300 leading-relaxed">{exp.questions_asked}</p>
                    </div>
                    {exp.tips && (
                      <p className="text-gray-700 bg-amber-50 border border-amber-100 p-3 rounded-lg italic text-xs font-medium">
                        💡 {exp.tips}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DriveDetail;
