import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/Layout';
import Toast from '../../components/Toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  User, Mail, Building, BookOpen, GraduationCap,
  Link as LinkIcon, Save, X, Plus, AlertCircle,
  CheckCircle, Zap, ExternalLink,
} from 'lucide-react';
import { pageVariants } from '../../utils/animations';

/* ── Input wrapper ─────────────────────────────── */
const Field = ({ label, icon: Icon, children }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 dark:text-[#8B949E] uppercase tracking-widest mb-1.5">{label}</label>
    <div className="relative">
      {Icon && <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
      {children}
    </div>
  </div>
);

const inputCls = (hasIcon = true, disabled = false) =>
  `w-full py-3 rounded-xl border text-sm font-medium transition-all duration-200
   ${hasIcon ? 'pl-10 pr-4' : 'px-4'}
   ${disabled
     ? 'border-slate-100 dark:border-[#30363D] bg-slate-50 dark:bg-[#21262D] text-slate-400 dark:text-[#656D76] cursor-not-allowed'
     : 'border-slate-200 dark:border-[#30363D] bg-slate-50 dark:bg-[#0D1117] text-slate-800 dark:text-[#E6EDF3] focus:bg-white dark:focus:bg-[#161B22] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] outline-none'
   }`;

/* ── Tag chip ──────────────────────────────────── */
const TagChip = ({ label, onRemove, color = 'blue' }) => {
  const c = {
    blue:   'bg-blue-50   text-blue-700   border-blue-200   dark:bg-blue-900/30  dark:text-blue-400  dark:border-blue-700',
    indigo: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-700',
  }[color];
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${c}`}
    >
      {label}
      <button type="button" onClick={onRemove} className="opacity-60 hover:opacity-100 transition-opacity hover:text-red-500">
        <X size={12} />
      </button>
    </motion.span>
  );
};

/* ── Section card ──────────────────────────────── */
const Section = ({ title, icon: Icon, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    className="bg-white dark:bg-[#161B22] rounded-2xl border border-slate-100 dark:border-[#30363D] shadow-card p-7"
  >
    <h2 className="flex items-center gap-2.5 text-base font-bold text-slate-900 dark:text-[#E6EDF3] mb-6">
      <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
        <Icon size={15} className="text-accent" />
      </div>
      {title}
    </h2>
    {children}
  </motion.div>
);

/* ── Animated circular score ───────────────────── */
const CircularScore = ({ score }) => {
  const R   = 44;
  const C   = 2 * Math.PI * R;
  const off = C - (score / 100) * C;
  const col = score >= 80 ? '#10B981' : score >= 50 ? '#3B82F6' : '#F59E0B';

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg width="144" height="144" viewBox="0 0 100 100" className="-rotate-90 absolute inset-0">
        <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
        <motion.circle
          cx="50" cy="50" r={R} fill="none"
          stroke={col} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: off }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 8px ${col}80)` }}
        />
      </svg>
      <div className="text-center relative z-10">
        <motion.p
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
          className="text-4xl font-black text-white leading-none"
        >
          {score}
        </motion.p>
        <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-0.5">Score</p>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════ */
const Profile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState(null);
  const [stats,   setStats]   = useState({ score: 0, suggestions: [] });
  const [newSkill,setNewSkill]= useState('');
  const [newCert, setNewCert] = useState('');
  const [dirty,   setDirty]   = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', college_name: '', usn: '',
    branch: 'CSE', semester: '1', gpa: '0.0', backlogs: '0',
    skills: [], certifications: [],
    resume_url: '', linkedin_url: '', github_url: '',
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const [profileRes, scoreRes] = await Promise.all([
          api.get('/api/student/profile/'),
          api.get('/api/student/profile-score/'),
        ]);
        const p = profileRes.data;
        setFormData({
          name: p.name || '', email: p.email || '', college_name: p.college_name || '',
          usn: p.usn || '', branch: p.branch || 'CSE', semester: p.semester || '1',
          gpa: p.gpa || '0.0', backlogs: p.backlogs || '0',
          skills: p.skills || [], certifications: p.certifications || [],
          resume_url: p.resume_url || '', linkedin_url: p.linkedin_url || '', github_url: p.github_url || '',
        });
        setStats(scoreRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const change = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setDirty(true);
  };

  const addTag = (field, value, setter) => {
    const v = value.trim();
    if (!v || formData[field].includes(v)) return;
    setFormData(prev => ({ ...prev, [field]: [...prev[field], v] }));
    setter('');
    setDirty(true);
  };

  const removeTag = (field, idx) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }));
    setDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        semester: parseInt(formData.semester) || 1,
        gpa: parseFloat(formData.gpa) || 0,
        backlogs: parseInt(formData.backlogs) || 0,
      };
      await api.put('/api/student/profile/', payload);
      setToast({ type: 'success', message: 'Profile updated successfully!' });
      setDirty(false);
      if (typeof setUser === 'function') setUser(prev => ({ ...prev, name: formData.name }));
      const scoreRes = await api.get('/api/student/profile-score/');
      setStats(scoreRes.data);
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to save profile. Please check all fields.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-5">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-52 skeleton rounded-2xl" />)}
          </div>
          <div className="h-96 skeleton rounded-2xl" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <div className="fixed top-5 right-5 z-[200]">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
          </div>
        )}
      </AnimatePresence>

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-5xl mx-auto pb-24"
      >
        <div className="mb-7">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-[#E6EDF3]">My Profile</h1>
          <p className="text-slate-400 dark:text-[#8B949E] mt-1 font-medium text-sm">
            Keep your profile updated to attract recruiters.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ── Left: Form ── */}
          <form id="profile-form" onSubmit={handleSubmit} className="xl:col-span-2 space-y-5">

            <Section title="Personal Information" icon={User} delay={0}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Full Name" icon={User}>
                  <input type="text" name="name" value={formData.name} onChange={change('name')} required className={inputCls()} />
                </Field>
                <Field label="Email" icon={Mail}>
                  <input type="email" value={formData.email} disabled className={inputCls(true, true)} />
                </Field>
                <Field label="College" icon={Building}>
                  <input type="text" name="college_name" value={formData.college_name} onChange={change('college_name')} className={inputCls()} />
                </Field>
                <Field label="USN" icon={BookOpen}>
                  <input type="text" name="usn" value={formData.usn} onChange={change('usn')} required className={inputCls()} />
                </Field>
                <Field label="Branch">
                  <select name="branch" value={formData.branch} onChange={change('branch')} className={inputCls(false)}>
                    {['CSE', 'ISE', 'ECE', 'ME', 'CV', 'EEE'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </Field>
                <Field label="Semester">
                  <select name="semester" value={formData.semester} onChange={change('semester')} className={inputCls(false)}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </Field>
                <Field label="CGPA">
                  <input type="number" name="gpa" value={formData.gpa} onChange={change('gpa')} min="0" max="10" step="0.01" className={inputCls(false)} />
                </Field>
                <Field label="Active Backlogs">
                  <input type="number" name="backlogs" value={formData.backlogs} onChange={change('backlogs')} min="0" className={inputCls(false)} />
                </Field>
              </div>
            </Section>

            <Section title="Technical Skills" icon={Zap} delay={0.05}>
              <div className="flex flex-wrap gap-2 mb-5 min-h-[2.5rem]">
                <AnimatePresence mode="popLayout">
                  {formData.skills.map((s, i) => (
                    <TagChip key={s + i} label={s} color="blue" onRemove={() => removeTag('skills', i)} />
                  ))}
                </AnimatePresence>
                {formData.skills.length === 0 && (
                  <span className="text-xs text-slate-400 dark:text-[#656D76] italic">No skills added yet</span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text" value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('skills', newSkill, setNewSkill); }}}
                  placeholder="React, Python, AWS…"
                  className="flex-1 input-field text-sm"
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addTag('skills', newSkill, setNewSkill)}
                  className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#21262D] hover:bg-slate-200 dark:hover:bg-[#30363D] text-slate-700 dark:text-[#E6EDF3] px-4 py-2.5 rounded-xl font-bold text-sm transition-colors"
                >
                  <Plus size={15} /> Add
                </motion.button>
              </div>
            </Section>

            <Section title="Certifications" icon={GraduationCap} delay={0.1}>
              <div className="flex flex-wrap gap-2 mb-5 min-h-[2.5rem]">
                <AnimatePresence mode="popLayout">
                  {formData.certifications.map((c, i) => (
                    <TagChip key={c + i} label={c} color="indigo" onRemove={() => removeTag('certifications', i)} />
                  ))}
                </AnimatePresence>
                {formData.certifications.length === 0 && (
                  <span className="text-xs text-slate-400 dark:text-[#656D76] italic">No certifications added yet</span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text" value={newCert}
                  onChange={e => setNewCert(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('certifications', newCert, setNewCert); }}}
                  placeholder="AWS Solutions Architect…"
                  className="flex-1 input-field text-sm"
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addTag('certifications', newCert, setNewCert)}
                  className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#21262D] hover:bg-slate-200 dark:hover:bg-[#30363D] text-slate-700 dark:text-[#E6EDF3] px-4 py-2.5 rounded-xl font-bold text-sm transition-colors"
                >
                  <Plus size={15} /> Add
                </motion.button>
              </div>
            </Section>

            <Section title="Professional Links" icon={LinkIcon} delay={0.15}>
              <div className="space-y-4">
                <Field label="Resume / Drive URL" icon={LinkIcon}>
                  <input type="url" name="resume_url" value={formData.resume_url} onChange={change('resume_url')} placeholder="https://drive.google.com/…" className={inputCls()} />
                </Field>
                <Field label="LinkedIn" icon={ExternalLink}>
                  <input type="url" name="linkedin_url" value={formData.linkedin_url} onChange={change('linkedin_url')} placeholder="https://linkedin.com/in/…" className={inputCls()} />
                </Field>
                <Field label="GitHub" icon={ExternalLink}>
                  <input type="url" name="github_url" value={formData.github_url} onChange={change('github_url')} placeholder="https://github.com/…" className={inputCls()} />
                </Field>
              </div>
            </Section>
          </form>

          {/* ── Right: Profile Strength ── */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="sticky top-6 bg-gradient-to-br from-primary via-[#1a4a7a] to-secondary rounded-2xl shadow-xl p-7 text-white"
            >
              <h2 className="font-bold text-base text-white/90 mb-6 flex items-center gap-2">
                <Zap size={16} className="text-blue-300" /> Profile Strength
              </h2>

              <div className="flex justify-center mb-6">
                <CircularScore score={stats.score} />
              </div>

              {/* Animated progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-semibold text-white/60 mb-2">
                  <span>Completeness</span>
                  <span>{stats.score}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.score}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                  />
                </div>
              </div>

              {stats.suggestions?.length > 0 ? (
                <div className="bg-white/10 rounded-xl p-4 border border-white/15 space-y-3">
                  <p className="text-xs font-bold text-blue-200 uppercase tracking-widest">Unlock 100%</p>
                  {stats.suggestions.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.08 }}
                      className="flex gap-2 text-xs text-white/80 font-medium leading-snug"
                    >
                      <AlertCircle size={13} className="text-blue-300 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, type: 'spring' }}
                  className="bg-emerald-500/20 rounded-xl p-4 border border-emerald-400/30 flex items-center gap-3"
                >
                  <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                  <p className="text-sm font-bold text-white">Profile is 100% complete! 🎉</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Sticky Save Bar ── */}
      <AnimatePresence>
        {dirty && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 md:left-60 z-50 p-4 bg-white/90 dark:bg-[#161B22]/90 backdrop-blur-xl border-t border-slate-200 dark:border-[#30363D] shadow-xl flex items-center justify-between gap-4"
          >
            <p className="text-sm font-semibold text-slate-600 dark:text-[#8B949E]">You have unsaved changes.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDirty(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-500 dark:text-[#8B949E] hover:bg-slate-100 dark:hover:bg-[#21262D] rounded-xl transition-colors"
              >
                Discard
              </button>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(59,130,246,0.4)' }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                form="profile-form"
                disabled={saving}
                className="btn-primary flex items-center gap-2 px-6 py-2 text-sm"
              >
                {saving
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                  : <><Save size={15} /> Save Profile</>
                }
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Profile;
