import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { User, Building, Phone, Globe, BookOpen, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Toast from '../../components/Toast';

const TPOProfile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    college_name: '',
    department: '',
    contact_number: '',
    college_website: '',
  });

  useEffect(() => {
    api.get('/api/auth/tpo/profile/')
      .then(res => setForm(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/api/auth/tpo/profile/', form);
      setForm(res.data);
      setToast({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      const msg = err.response?.data ? Object.values(err.response.data).flat().join(' ') : 'Failed to save.';
      setToast({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  const initials = (form.name || 'T').slice(0, 2).toUpperCase();

  return (
    <Layout>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage your TPO account and institution details.</p>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-gray-100 rounded-2xl" />
            <div className="h-64 bg-gray-100 rounded-2xl" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">

            {/* Avatar + Basic Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row items-start gap-8">
              {/* Avatar */}
              <div className="shrink-0 flex flex-col items-center gap-3">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-primary/30">
                  {initials}
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-white bg-primary px-3 py-1 rounded-full">
                  TPO
                </span>
                <p className="text-xs text-gray-400 text-center">{form.college_name || 'No college set'}</p>
              </div>

              {/* Name & Email */}
              <div className="flex-1 w-full space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <User size={15} className="text-gray-400" /> Full Name
                  </label>
                  <input
                    name="name" type="text" required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={form.name} onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email" readOnly
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-100 text-gray-500 cursor-not-allowed"
                    value={form.email}
                  />
                </div>
              </div>
            </div>

            {/* Institution Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Building size={20} className="text-primary" />
                Institution Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">College Name</label>
                  <input
                    name="college_name" type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={form.college_name || ''} onChange={handleChange}
                    placeholder="e.g. RV College of Engineering"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <BookOpen size={15} className="text-gray-400" /> Department
                  </label>
                  <input
                    name="department" type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={form.department || ''} onChange={handleChange}
                    placeholder="e.g. Training & Placement Cell"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Phone size={15} className="text-gray-400" /> Contact Number
                  </label>
                  <input
                    name="contact_number" type="tel"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={form.contact_number || ''} onChange={handleChange}
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Globe size={15} className="text-gray-400" /> College Website
                  </label>
                  <input
                    name="college_website" type="url"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={form.college_website || ''} onChange={handleChange}
                    placeholder="https://example.edu.in"
                  />
                </div>
              </div>
            </div>

            {/* Save */}
            <div className="flex justify-end">
              <button
                type="submit" disabled={saving}
                className="flex items-center gap-2 bg-primary hover:bg-[#152a45] text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving
                  ? <><Loader2 size={18} className="animate-spin" /> Saving...</>
                  : <><Save size={18} /> Save Profile</>
                }
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default TPOProfile;
