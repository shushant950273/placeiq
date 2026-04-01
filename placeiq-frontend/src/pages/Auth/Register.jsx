import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Eye, EyeOff, Loader2, User as UserIcon, Mail, Lock, Building, Briefcase } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ROLES = [
  { value: 'student', label: 'Student',   desc: 'Apply tracks & drives', icon: UserIcon },
  { value: 'tpo',     label: 'TPO',       desc: 'Manage & analytics', icon: Briefcase },
  { value: 'company', label: 'Company',   desc: 'Post & pick talent', icon: Building },
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'student', college_name: '',
  });
  const [showPassword,  setShowPassword]  = useState(false);
  const [error,         setError]         = useState('');
  const [loading,       setLoading]       = useState(false);

  const { register } = useAuth();
  const navigate     = useNavigate();

  const change = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const getPasswordStrength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s += 1;
    if (/[A-Z]/.test(pw)) s += 1;
    if (/[0-9]/.test(pw)) s += 1;
    if (/[^a-zA-Z0-9]/.test(pw)) s += 1;
    return s;
  };

  const strength = getPasswordStrength(formData.password);
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = formData.password.length === 0 ? 'bg-slate-200' :
                        strength === 0 ? 'bg-red-400' :
                        strength === 1 ? 'bg-orange-400' :
                        strength === 2 ? 'bg-amber-400' :
                        strength === 3 ? 'bg-blue-400' : 'bg-emerald-500';
  
  const widthPercentage = formData.password ? Math.max((strength / 4) * 100, 15) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password || (formData.role === 'tpo' && !formData.college_name)) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.email?.[0] || err.response?.data?.error || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative z-0 overflow-hidden py-12">
      {/* Background gradients */}
      <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[480px]"
      >
        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 sm:p-10">
          
          {/* Logo & Branding */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
              <GraduationCap size={30} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">PlaceIQ</h1>
            <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-widest">Create your account</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, mb: 0 }}
                animate={{ opacity: 1, height: 'auto', mb: 24 }}
                exit={{ opacity: 0, height: 0, mb: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3.5">
                  <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <p className="text-red-700 text-sm font-semibold">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">I am a…</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ROLES.map(({ value, label, desc, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: value }))}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      formData.role === value
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={20} className={`mb-1.5 ${formData.role === value ? 'text-blue-600' : 'text-slate-400'}`} />
                    <p className="text-sm font-bold">{label}</p>
                    <p className={`font-semibold mt-0.5 text-[10px] leading-tight text-center ${formData.role === value ? 'text-blue-500/80' : 'text-slate-400'}`}>
                      {desc}
                    </p>
                    <AnimatePresence>
                      {formData.role === value && (
                        <motion.div
                          layoutId="roleActive"
                          className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none"
                          initial={false}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </AnimatePresence>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 mt-2">Full Name</label>
              <div className="relative group">
                <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                <input type="text" name="name" required value={formData.name} onChange={change}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                <input type="email" name="email" required value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value.trim() }))}
                  placeholder="you@college.edu"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                <input type={showPassword ? 'text' : 'password'} name="password" required value={formData.password} onChange={change}
                  placeholder="Min. 6 characters"
                  className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:text-slate-600 transition-colors p-1" tabIndex={-1}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Strength Indicator */}
              <div className="mt-2.5">
                <div className="flex gap-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercentage}%`, backgroundColor: strengthColor }}
                    transition={{ ease: "easeInOut", duration: 0.3 }}
                    className={`h-full ${strengthColor}`}
                  />
                </div>
                {formData.password && (
                  <p className={`text-[10px] font-bold uppercase tracking-widest mt-1.5 text-right ${formData.password.length < 6 ? 'text-red-500' : 'text-slate-400'}`}>
                    {formData.password.length < 6 ? 'Too Short' : strengthLabels[strength]}
                  </p>
                )}
              </div>
            </div>

            {/* College (TPO only) */}
            <AnimatePresence>
              {formData.role === 'tpo' && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">College Name</label>
                  <div className="relative group">
                    <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                    <input type="text" name="college_name" required value={formData.college_name} onChange={change}
                      placeholder="e.g. University Institute of Technology"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {loading ? <><Loader2 size={20} className="animate-spin" /> Creating Account…</> : 'Create Account'}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-bold hover:text-indigo-600 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
