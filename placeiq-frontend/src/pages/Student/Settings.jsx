import React, { useState } from 'react';
import Layout from '../../components/Layout';
import Toast from '../../components/Toast';
import api from '../../api/axios';
import { Lock, Eye, EyeOff, Shield, CheckCircle, Loader2 } from 'lucide-react';

/* ── Password strength meter ─────────────────────── */
const strengthLevel = (pwd) => {
  if (!pwd) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 6)  score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { level: 1, label: 'Weak',   color: 'bg-red-500'    };
  if (score <= 3) return { level: 2, label: 'Fair',   color: 'bg-yellow-400' };
  if (score <= 4) return { level: 3, label: 'Good',   color: 'bg-blue-500'   };
  return              { level: 4, label: 'Strong', color: 'bg-green-500'   };
};

/* ── Password field ─────────────────────────────── */
const PwField = ({ id, label, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════ */
const Settings = () => {
  const [form, setForm] = useState({
    current_password:  '',
    new_password:      '',
    confirm_password:  '',
  });
  const [saving, setSaving] = useState(false);
  const [toast,  setToast]  = useState(null);

  const strength = strengthLevel(form.new_password);

  const handleChange = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.current_password) return setToast({ type: 'error', message: 'Please enter your current password.' });
    if (form.new_password.length < 6) return setToast({ type: 'error', message: 'New password must be at least 6 characters.' });
    if (form.new_password !== form.confirm_password) return setToast({ type: 'error', message: 'Passwords do not match.' });

    setSaving(true);
    try {
      await api.post('/api/auth/change-password/', form);
      setToast({ type: 'success', message: '✅ Password changed successfully!' });
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      const msg = err.response?.data?.error || Object.values(err.response?.data || {}).flat().join(' ') || 'Failed to change password.';
      setToast({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-2xl mx-auto space-y-8 pb-12">
        {/* ── Page Header ── */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Account Settings</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage your account security and preferences.</p>
        </div>

        {/* ── Change Password Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Shield size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
              <p className="text-sm text-gray-400 font-medium">Update your login password securely.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <PwField
              id="current_password"
              label="Current Password"
              value={form.current_password}
              onChange={handleChange('current_password')}
              placeholder="Enter your current password"
            />

            <PwField
              id="new_password"
              label="New Password"
              value={form.new_password}
              onChange={handleChange('new_password')}
              placeholder="At least 6 characters"
            />

            {/* Strength meter */}
            {form.new_password && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength.level ? strength.color : 'bg-gray-100'}`}
                    />
                  ))}
                </div>
                <p className="text-xs font-semibold text-gray-500">
                  Strength: <span className={`font-bold ${strength.level >= 3 ? 'text-green-600' : strength.level === 2 ? 'text-yellow-600' : 'text-red-600'}`}>{strength.label}</span>
                </p>
              </div>
            )}

            <PwField
              id="confirm_password"
              label="Confirm New Password"
              value={form.confirm_password}
              onChange={handleChange('confirm_password')}
              placeholder="Re-enter new password"
            />

            {/* Match indicator */}
            {form.new_password && form.confirm_password && (
              <p className={`text-xs font-semibold flex items-center gap-1.5 ${form.new_password === form.confirm_password ? 'text-green-600' : 'text-red-500'}`}>
                <CheckCircle size={13} />
                {form.new_password === form.confirm_password ? 'Passwords match' : 'Passwords do not match'}
              </p>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-primary text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-[#152a45] hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <><Loader2 size={18} className="animate-spin" /> Changing...</>
                ) : (
                  <><Lock size={18} /> Change Password</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ── Security tip ── */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-3">
          <Shield size={20} className="text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-bold mb-1">Security Tips</p>
            <ul className="space-y-1 text-blue-700 font-medium list-disc list-inside">
              <li>Use at least 10 characters for a strong password</li>
              <li>Mix upper & lowercase letters, numbers, and symbols</li>
              <li>Never share your password with anyone</li>
              <li>Students: default password is your USN — change it now!</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
