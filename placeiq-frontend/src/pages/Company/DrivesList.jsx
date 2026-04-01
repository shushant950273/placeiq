import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { Briefcase, MapPin, Eye } from 'lucide-react';

const statusStyle = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'upcoming')  return 'bg-blue-100 text-blue-800 border-blue-200';
  if (s === 'ongoing')   return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  if (s === 'completed') return 'bg-green-100 text-green-800 border-green-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

const CompanyDrivesList = () => {
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/drives/')
      .then(res => setDrives(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Drives</h1>
          <p className="text-gray-500 mt-1 font-medium">Placement drives posted by the TPO for your company.</p>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}
          </div>
        ) : drives.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5 border-2 border-dashed border-gray-200">
              <Briefcase className="text-gray-300" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">No Drives Yet</h3>
            <p className="text-gray-400 font-medium max-w-sm">
              The TPO will post placement drives on your behalf. They will appear here once created.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/60 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">CTC</th>
                    <th className="px-6 py-4">Drive Date</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4 text-center">Applicants</th>
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
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} className="text-gray-400" />
                          {drive.job_location || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-gray-800 text-lg">{drive.applicants_count || 0}</span>
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
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CompanyDrivesList;
