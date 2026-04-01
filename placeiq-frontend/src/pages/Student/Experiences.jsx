import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import Badge from '../../components/Badge';
import api from '../../api/axios';
import { Star, MessageSquare, Plus, X, ServerCrash } from 'lucide-react';
import Toast from '../../components/Toast';

const Experiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [eligibleDrives, setEligibleDrives] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [formData, setFormData] = useState({
    drive: '',
    difficulty: 'medium',
    rounds_description: '',
    questions_asked: '',
    tips: '',
    overall_rating: 4
  });

  const fetchContent = () => {
    setLoading(true);
    api.get('/api/experiences/feed/')
      .then(res => setExperiences(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const openShareModal = async () => {
    setShowModal(true);
    try {
      const resp = await api.get('/api/student/pipeline/');
      // Extract unique drives they applied for
      setEligibleDrives(resp.data.map(app => ({ id: app.drive_id, name: `${app.company} - ${app.drive_name}` })));
    } catch (e) {
      console.error('Failed to fetch user applications');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.drive) return setToast({ type: 'warning', message: 'Please select a drive you applied for.'});
    setSubmitting(true);
    try {
      await api.post('/api/experiences/', formData);
      setToast({ type: 'success', message: 'Experience submitted and sent to TPO for approval!' });
      setShowModal(false);
      setFormData({ drive: '', difficulty: 'medium', rounds_description: '', questions_asked: '', tips: '', overall_rating: 4 });
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.detail || error.response?.data?.[0] || 'Failed to submit experience.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="max-w-7xl mx-auto pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
               Interview Experiences
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Read anonymous insights from seniors and clear your rounds.</p>
          </div>
          <button onClick={openShareModal} className="bg-primary text-white shadow-lg px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:-translate-y-0.5 transition-all">
            <Plus size={20} /> Share Experience
          </button>
        </div>

        {loading ? <LoadingSkeleton count={3}/> : experiences.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
            <div className="bg-gray-50 p-6 rounded-full mb-4">
               <MessageSquare size={48} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Approved Experiences Yet</h3>
            <p className="text-gray-500 font-medium max-w-sm">When students submit their interview journeys, they will appear here after TPO approval.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {experiences.map(exp => (
              <div key={exp.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 leading-tight">
                      {exp.drive_details?.company_name || 'Company'}
                    </h3>
                    <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-wide">
                      {exp.drive_details?.role_name || 'Role'} • Anonymous
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge text={exp.difficulty.toUpperCase()} type={exp.difficulty === 'hard' ? 'red' : exp.difficulty === 'medium' ? 'yellow' : 'blue'} />
                    <div className="flex gap-1 text-yellow-400">
                      {[1,2,3,4,5].map((i) => <Star key={i} size={16} fill={i <= exp.overall_rating ? 'currentColor' : 'none'} color={i <= exp.overall_rating ? '#FBBF24' : '#E5E7EB'}/>)}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2 uppercase text-xs tracking-wider border-b pb-1">Rounds Info</h4>
                    <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed bg-gray-50/50 p-4 rounded-xl">{exp.rounds_description}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2 uppercase text-xs tracking-wider border-b pb-1">Questions Asked</h4>
                    <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed bg-blue-50/50 p-4 rounded-xl border-l-4 border-blue-400">{exp.questions_asked}</p>
                  </div>
                  {exp.tips && (
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2 uppercase text-xs tracking-wider">Secret Tips</h4>
                      <p className="text-gray-700 font-medium text-sm italic bg-amber-50/50 p-4 rounded-xl border border-amber-100">💡 "{exp.tips}"</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Share Experience Modal */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Share Interview Experience</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors"><X size={24} /></button>
              </div>
              
              <form onSubmit={handleCreateSubmit} className="p-6 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Select Company/Drive *</label>
                    <select 
                      required
                      className="w-full border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      value={formData.drive} 
                      onChange={(e) => setFormData({...formData, drive: e.target.value})}
                    >
                      <option value="">-- Choose what you applied to --</option>
                      {eligibleDrives.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Overall Difficulty *</label>
                    <select 
                      required
                      className="w-full border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      value={formData.difficulty} 
                      onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">How many rounds? Describe them briefly *</label>
                  <textarea 
                    required rows="3" placeholder="e.g., 3 Rounds: 1 Online Aptitude, 1 Tech Interview, 1 HR..."
                    className="w-full border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={formData.rounds_description} 
                    onChange={(e) => setFormData({...formData, rounds_description: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Exact Questions Asked *</label>
                  <textarea 
                    required rows="4" placeholder="1. Reverse a Linked List. 2. Difference between SQL vs NoSQL. 3..."
                    className="w-full border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={formData.questions_asked} 
                    onChange={(e) => setFormData({...formData, questions_asked: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Pro Tips for Juniors</label>
                  <input 
                    type="text" placeholder="Focus on dynamic programming! HR is very chill."
                    className="w-full border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={formData.tips} 
                    onChange={(e) => setFormData({...formData, tips: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Rate Your Overall Experience</label>
                  <div className="flex gap-4">
                    {[1,2,3,4,5].map(num => (
                      <button 
                        key={num} type="button" 
                        onClick={() => setFormData({...formData, overall_rating: num})}
                        className={`w-12 h-12 rounded-full font-bold transition-all ${formData.overall_rating === num ? 'bg-amber-400 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-50 rounded-xl">Cancel</button>
                  <button type="submit" disabled={submitting} className="bg-primary text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
                     {submitting ? 'Submitting...' : 'Submit Anonymously'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Experiences;
