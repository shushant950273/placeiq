import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { pageVariants } from '../../utils/animations';

/* ── Animated field wrapper ── */
const fieldVariants = {
  initial: { opacity: 0, y: 14 },
  animate: (delay) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const Login = () => {
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const role = await login(email, password);
      setTimeout(() => {
        if (role === 'tpo')        navigate('/tpo/dashboard');
        else if (role === 'student') navigate('/student/dashboard');
        else                         navigate('/company/dashboard');
      }, 100);
    } catch {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0D1117] p-6 relative overflow-hidden"
    >
      {/* ── Animated background blobs ── */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-purple-500/5 dark:bg-purple-500/5 blur-[100px] pointer-events-none"
      />

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="bg-white dark:bg-[#161B22] rounded-3xl border border-slate-100 dark:border-[#30363D] shadow-2xl p-8 sm:p-10">

          {/* Logo & Branding — stagger delay 0.1 */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col items-center mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4"
            >
              <GraduationCap size={30} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-[#E6EDF3] tracking-tight">PlaceIQ</h1>
            <p className="text-sm font-semibold text-slate-400 dark:text-[#8B949E] mt-1 uppercase tracking-widest">
              Intelligence Platform
            </p>
          </motion.div>

          {/* Heading — delay 0.15 */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mb-8 text-center"
          >
            <h2 className="text-2xl font-bold text-slate-800 dark:text-[#E6EDF3] tracking-tight">Welcome back</h2>
            <p className="text-slate-500 dark:text-[#8B949E] text-sm mt-1.5 font-medium">Sign in to your placement portal</p>
          </motion.div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-3.5">
                  <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
                  <p className="text-red-700 dark:text-red-400 text-sm font-semibold">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email field — delay 0.2 */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <label className="block text-xs font-bold text-slate-500 dark:text-[#8B949E] uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value.trim())}
                  placeholder="you@college.edu"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#30363D] text-slate-900 dark:text-[#E6EDF3] rounded-xl text-sm font-medium focus:bg-white dark:focus:bg-[#161B22] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all duration-200 outline-none placeholder:text-slate-400 dark:placeholder:text-[#656D76]"
                />
              </div>
            </motion.div>

            {/* Password field — delay 0.27 */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.27, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <label className="block text-xs font-bold text-slate-500 dark:text-[#8B949E] uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#30363D] text-slate-900 dark:text-[#E6EDF3] rounded-xl text-sm font-medium focus:bg-white dark:focus:bg-[#161B22] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all duration-200 outline-none placeholder:text-slate-400 dark:placeholder:text-[#656D76]"
                />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:text-slate-600 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </motion.button>
              </div>
            </motion.div>

            {/* Submit button — delay 0.34 */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.34, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.button
                whileHover={{
                  scale: 1.02,
                  y: -2,
                  boxShadow: '0 8px 30px rgba(59,130,246,0.45)',
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign In to Dashboard'
                )}
              </motion.button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="mt-8 pt-6 border-t border-slate-100 dark:border-[#30363D] text-center"
          >
            <p className="text-sm text-slate-500 dark:text-[#8B949E] font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 dark:text-[#58A6FF] font-bold hover:text-indigo-600 dark:hover:text-blue-400 transition-colors">
                Register here
              </Link>
            </p>
          </motion.div>

        </div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
