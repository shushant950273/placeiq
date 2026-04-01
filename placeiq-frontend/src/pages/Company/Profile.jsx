import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { Building2, Globe, MapPin, Users, Info, ChevronDown, Save, Loader2 } from 'lucide-react';
import Toast from '../../components/Toast';

const INDUSTRY_OPTIONS = ['IT', 'Finance', 'Core', 'Consulting', 'Other'];
const EMPLOYEE_OPTIONS = ['<100', '100-1000', '1000-10000', '10000+'];
const EMPLOYEE_LABELS = {
  '<100': 'Less than 100', '100-1000': '100 – 1,000',
  '1000-10000': '1,000 – 10,000', '10000+': 'More than 10,000',
};

const CompanyProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    login_email: '',
    registered_name: '',
    company_full_name: '',
    industry: '',
    headquarters: '',
    website: '',
    about: '',
    employee_count: '',
  });

  useEffect(() => {
    api.get('/api/auth/company/profile/')
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
      const res = await api.put('/api/auth/company/profile/', form);
      setForm(prev => ({ ...prev, ...res.data }));
      setToast({ type: 'success', message: 'Profile saved!' });
    } catch (err) {
      const msg = err.response?.data ? Object.values(err.response.data).flat().join(' ') : 'Failed to save.';
      setToast({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  const initials = (form.registered_name || form.company_full_name || 'C').slice(0, 2).toUpperCase();

  return (
    <Layout>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Company Profile</h1>
          <p className="text-gray-500 mt-1 font-medium">Keep your company information up to date.</p>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-gray-100 rounded-2xl" />
            <div className="h-72 bg-gray-100 rounded-2xl" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">

            {/* Avatar + Read-only Account Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row items-start gap-8">
              <div className="shrink-0 flex flex-col items-center gap-3">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#1E3A5F] to-[#2E75B6] flex items-center justify-center text-white text-4xl font-black shadow-lg">
                  {initials}
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-white bg-[#2E75B6] px-3 py-1 rounded-full">
                  COMPANY
                </span>
                {form.industry && (
                  <p className="text-xs font-semibold text-gray-400">{form.industry}</p>
                )}
              </div>

              <div className="flex-1 w-full space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Login Email</label>
                  <input
                    type="email" readOnly
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-100 text-gray-500 cursor-not-allowed"
                    value={form.login_email}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Registered Name
                    <span className="ml-2 text-xs font-normal text-gray-400">(used for drive matching — cannot be changed here)</span>
                  </label>
                  <input
                    type="text" readOnly
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-100 text-gray-700 cursor-not-allowed font-semibold"
                    value={form.registered_name}
                  />
                </div>
              </div>
            </div>

            {/* Warning Box */}
            <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <Info size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 font-medium">
                <strong>Important:</strong> The TPO creates placement drives using your company name.
                Your <strong>Registered Name</strong> above must match exactly what the TPO types when creating a drive.
                Contact your TPO if there is a mismatch.
              </p>
            </div>

            {/* Company Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Building2 size={20} className="text-primary" /> Company Identity
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Company Full Name</label>
                  <input
                    name="company_full_name" type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={form.company_full_name || ''} onChange={handleChange}
                    placeholder="e.g. Infosys Limited"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Industry</label>
                  <div className="relative">
                    <select
                      name="industry"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all"
                      value={form.industry || ''} onChange={handleChange}
                    >
                      <option value="">-- Select Industry --</option>
                      {INDUSTRY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Users size={15} className="text-gray-400" /> Employee Count
                  </label>
                  <div className="relative">
                    <select
                      name="employee_count"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all"
                      value={form.employee_count || ''} onChange={handleChange}
                    >
                      <option value="">-- Select Size --</option>
                      {EMPLOYEE_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{EMPLOYEE_LABELS[opt]}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <MapPin size={15} className="text-gray-400" /> Headquarters
                  </label>
                  <input
                    name="headquarters" type="text"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={form.headquarters || ''} onChange={handleChange}
                    placeholder="e.g. Bangalore, India"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Globe size={15} className="text-gray-400" /> Website
                  </label>
                  <input
                    name="website" type="url"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={form.website || ''} onChange={handleChange}
                    placeholder="https://company.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">About Company</label>
                  <textarea
                    name="about" rows={4}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                    value={form.about || ''} onChange={handleChange}
                    placeholder="Brief description of your company, culture, and what you do..."
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
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

export default CompanyProfile;
