import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { Briefcase, Loader2, Users, CreditCard, Calendar, MapPin, Award } from 'lucide-react';
import Toast from '../../components/Toast';

const DriveCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    role_name: '',
    ctc: '',
    drive_date: '',
    registration_deadline: '',
    job_location: '',
    eligibility_gpa: '',
    description: '',
    requirements: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/drives/', formData);
      setToast({ type: 'success', message: 'Drive created successfully!' });
      setTimeout(() => navigate('/company/drives'), 1000);
    } catch (err) {
      console.error('Error creating drive:', err.response?.data || err);
      setToast({ type: 'error', message: err.response?.data?.error || err.response?.data?.detail || 'Failed to create drive. Check the fields.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Layout>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <Briefcase className="text-primary" size={32} />
            Post New Drive
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Create a new placement drive and start tracking applications.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-gray-50/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Users size={16} className="text-gray-400" />
                  Job Role / Title *
                </label>
                <input 
                  type="text" 
                  name="role_name"
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50 focus:bg-white text-gray-900"
                  placeholder="e.g. Software Development Engineer"
                  value={formData.role_name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <CreditCard size={16} className="text-gray-400" />
                  CTC (LPA) *
                </label>
                <input 
                  type="number" step="0.1"
                  name="ctc"
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50 focus:bg-white text-gray-900"
                  placeholder="e.g. 12.5"
                  value={formData.ctc}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <MapPin size={16} className="text-gray-400" />
                  Job Location
                </label>
                <input 
                  type="text" 
                  name="job_location"
                  placeholder="e.g. Bangalore"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50 focus:bg-white text-gray-900"
                  value={formData.job_location}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Award size={16} className="text-gray-400" />
                  Minimum Eligibility GPA *
                </label>
                <input 
                  type="number" step="0.1"
                  name="eligibility_gpa"
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50 focus:bg-white text-gray-900"
                  placeholder="e.g. 7.5"
                  value={formData.eligibility_gpa}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={16} className="text-gray-400" />
                  Drive Date *
                </label>
                <input 
                  type="date" 
                  name="drive_date"
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50 focus:bg-white text-gray-900 cursor-pointer"
                  value={formData.drive_date}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={16} className="text-red-400" />
                  Registration Deadline
                </label>
                <input 
                  type="datetime-local" 
                  name="registration_deadline"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50 focus:bg-white text-gray-900 cursor-pointer"
                  value={formData.registration_deadline}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Job Description *</label>
              <textarea 
                name="description"
                required 
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50 focus:bg-white text-gray-900 resize-none"
                placeholder="Brief description of the role and internal responsibilities..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Internal Notes / Expected Rounds</label>
              <textarea 
                name="requirements"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50 focus:bg-white text-gray-900 resize-none"
                placeholder="Any special requirements, backlogs limit..."
                value={formData.requirements}
                onChange={handleChange}
              />
            </div>

            <div className="pt-6 border-t border-gray-200 flex justify-end gap-3 rounded-b-2xl">
              <button 
                type="button" 
                onClick={() => navigate('/company/dashboard')}
                className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="bg-primary hover:bg-[#152a45] text-white font-bold py-3 px-8 rounded-xl transition-all flex justify-center items-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : "Publish Official Drive"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default DriveCreate;
