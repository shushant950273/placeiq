import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Users, CheckCircle, TrendingUp, Building2, Eye } from 'lucide-react';

const statusStyle = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'upcoming')  return 'bg-blue-100 text-blue-800 border-blue-200';
  if (s === 'ongoing')   return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  if (s === 'completed') return 'bg-green-100 text-green-800 border-green-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

const CompanyDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/drives/')
      .then(res => setDrives(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalApplicants = drives.reduce((acc, d) => acc + (d.applicants_count || 0), 0);
  const totalHired      = drives.reduce((acc, d) => acc + (d.hired_count || 0), 0);
  const totalDrives     = drives.length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <Building2 className="text-primary" size={32} />
            Company Dashboard
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Welcome back, <span className="text-primary font-bold">{user?.name}</span>. Here's your placement activity.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
            <div className="p-4 rounded-xl bg-blue-50 text-blue-600 ring-4 ring-blue-50/50">
              <Briefcase size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Total Drives</p>
              <p className="text-3xl font-black text-gray-900 mt-0.5">{loading ? '—' : totalDrives}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
            <div className="p-4 rounded-xl bg-orange-50 text-orange-600 ring-4 ring-orange-50/50">
              <Users size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Total Applicants</p>
              <p className="text-3xl font-black text-gray-900 mt-0.5">{loading ? '—' : totalApplicants}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
            <div className="p-4 rounded-xl bg-green-50 text-green-600 ring-4 ring-green-50/50">
              <CheckCircle size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Total Hired</p>
              <p className="text-3xl font-black text-gray-900 mt-0.5">{loading ? '—' : totalHired}</p>
            </div>
          </div>
        </div>

        {/* Drives Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-3">
            <TrendingUp className="text-primary" size={20} />
            <h2 className="text-xl font-bold text-gray-900">Drives Posted For Your Company</h2>
          </div>

          {loading ? (
            <div className="animate-pulse p-8 space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl" />)}
            </div>
          ) : drives.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5 border-2 border-dashed border-gray-200">
                <Briefcase className="text-gray-300" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-1">No Drives Yet</h3>
              <p className="text-gray-400 font-medium max-w-sm">
                The TPO will post placement drives on your behalf. They will appear here once created.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/60 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">CTC</th>
                    <th className="px-6 py-4">Drive Date</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4 text-center">Applicants</th>
                    <th className="px-6 py-4 text-center">Hired</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {drives.map((drive) => (
                    <tr key={drive.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{drive.role_name || 'N/A'}</p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">Min GPA: {drive.eligibility_gpa}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded text-sm">
                          ₹{drive.ctc} LPA
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium text-sm">
                        {drive.drive_date ? new Date(drive.drive_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{drive.job_location || '—'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-gray-800 text-lg">{drive.applicants_count || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-green-700 text-lg">{drive.hired_count || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${statusStyle(drive.status)}`}>
                          {drive.status || 'Upcoming'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/company/drives/${drive.id}/applicants`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-lg transition-all duration-200"
                        >
                          <Eye size={13} />
                          View Applicants
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CompanyDashboard;
