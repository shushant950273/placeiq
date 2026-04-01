import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Toast from '../../components/Toast';
import api from '../../api/axios';
import { Building, MapPin, DollarSign, Award, FileCheck, Loader2 } from 'lucide-react';

const DriveCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name_input: '',
    role_name: '',
    ctc: '',
    job_location: '',
    eligibility_gpa: '',
    eligible_branches: [],
    max_backlogs: 0,
    drive_date: '',
    registration_deadline: '',
    rounds_count: 1,
  });
  const [toast, setToast] = useState(null);

  const branches = ['CSE', 'ISE', 'ECE', 'ME', 'CV', 'EEE', 'MBA'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/drives/', formData);
      setToast({ message: 'Placement Drive created successfully!', type: 'success' });
      setTimeout(() => navigate('/tpo/drives'), 1500);
    } catch (err) {
      const errData = err.response?.data;
      let msg = 'Failed to create drive. Check all fields.';
      if (typeof errData === 'object') {
        msg = Object.values(errData).flat().join(' ');
      }
      setToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const toggleBranch = (b) => {
    setFormData(prev => ({
      ...prev,
      eligible_branches: prev.eligible_branches.includes(b)
        ? prev.eligible_branches.filter(x => x !== b)
        : [...prev.eligible_branches, b]
    }));
  };

  return (
    <Layout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Placement Drive</h1>
        <p className="text-gray-500 mt-1">Post a new drive on behalf of a company. Students will be notified.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Company & Job Info */}
          <div className="border-b border-gray-100 pb-8">
            <h2 className="text-lg font-bold text-primary flex items-center mb-6">
              <Building className="mr-2" size={20} /> Company & Job Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Company Name <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-400 ml-2 font-normal">(Must match registered company account name exactly)</span>
                </label>
                <input
                  required type="text"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/40 focus:outline-none bg-gray-50 focus:bg-white"
                  value={formData.company_name_input}
                  onChange={e => setFormData({ ...formData, company_name_input: e.target.value })}
                  placeholder="e.g. Infosys, TCS, Wipro"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Role / Job Title <span className="text-red-500">*</span></label>
                <input
                  required type="text"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/40 focus:outline-none bg-gray-50 focus:bg-white"
                  value={formData.role_name}
                  onChange={e => setFormData({ ...formData, role_name: e.target.value })}
                  placeholder="e.g. Software Development Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">CTC (LPA) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    required type="number" step="0.1"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/40 focus:outline-none bg-gray-50 focus:bg-white"
                    value={formData.ctc}
                    onChange={e => setFormData({ ...formData, ctc: e.target.value })}
                    placeholder="12.5"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Job Location <span className="text-red-500">*</span></label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    required type="text"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/40 focus:outline-none bg-gray-50 focus:bg-white"
                    value={formData.job_location}
                    onChange={e => setFormData({ ...formData, job_location: e.target.value })}
                    placeholder="e.g. Bangalore, India"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Eligibility */}
          <div className="border-b border-gray-100 pb-8">
            <h2 className="text-lg font-bold text-primary flex items-center mb-6">
              <Award className="mr-2" size={20} /> Eligibility Criteria
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Minimum GPA <span className="text-red-500">*</span></label>
                <input
                  required type="number" step="0.1" min="0" max="10"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/40 focus:outline-none bg-gray-50 focus:bg-white"
                  value={formData.eligibility_gpa}
                  onChange={e => setFormData({ ...formData, eligibility_gpa: e.target.value })}
                  placeholder="e.g. 7.0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Max Active Backlogs</label>
                <input
                  type="number" min="0"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/40 focus:outline-none bg-gray-50 focus:bg-white"
                  value={formData.max_backlogs}
                  onChange={e => setFormData({ ...formData, max_backlogs: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Eligible Branches <span className="text-xs text-gray-400 ml-1 font-normal">(leave all unchecked for open to all)</span></label>
              <div className="flex flex-wrap gap-3">
                {branches.map(b => (
                  <label key={b} className={`flex items-center space-x-2 px-4 py-2 rounded-xl border cursor-pointer transition-colors select-none
                    ${formData.eligible_branches.includes(b)
                      ? 'bg-secondary text-white border-secondary shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formData.eligible_branches.includes(b)}
                      onChange={() => toggleBranch(b)}
                    />
                    <span className="font-semibold text-sm">{b}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Timelines */}
          <div className="pb-4">
            <h2 className="text-lg font-bold text-primary flex items-center mb-6">
              <FileCheck className="mr-2" size={20} /> Timelines
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Drive Date <span className="text-red-500">*</span></label>
                <input
                  required type="date"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/40 focus:outline-none bg-gray-50 focus:bg-white cursor-pointer"
                  value={formData.drive_date}
                  onChange={e => setFormData({ ...formData, drive_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Registration Deadline <span className="text-red-500">*</span></label>
                <input
                  required type="datetime-local"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/40 focus:outline-none bg-gray-50 focus:bg-white cursor-pointer"
                  value={formData.registration_deadline}
                  onChange={e => setFormData({ ...formData, registration_deadline: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/tpo/drives')}
              className="px-6 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-[#152a45] text-white font-bold py-2.5 px-8 rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Publishing...</> : 'Publish Drive'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default DriveCreate;
