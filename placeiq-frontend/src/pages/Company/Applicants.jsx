import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { ArrowLeft, Users, GraduationCap } from 'lucide-react';

/* ── Status badge colours ── */
const statusConfig = {
  applied:     { label: 'Applied',     cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  shortlisted: { label: 'Shortlisted', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  selected:    { label: 'Selected',    cls: 'bg-green-100 text-green-700 border-green-200' },
  rejected:    { label: 'Rejected',    cls: 'bg-red-100 text-red-700 border-red-200' },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[(status || '').toLowerCase()] || statusConfig.applied;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

/* ── Loading Skeleton ── */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[1,2,3,4,5,6].map(i => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-gray-100 rounded-lg" />
      </td>
    ))}
  </tr>
);

/* ── Main Page ── */
const CompanyApplicants = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [applicants, setApplicants] = useState([]);
  const [drive, setDrive]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driveRes, appRes] = await Promise.all([
          api.get(`/api/drives/${id}/`),
          api.get(`/api/drives/${id}/applicants/`),
        ]);
        setDrive(driveRes.data);
        setApplicants(appRes.data || []);
      } catch (err) {
        setError('Failed to load applicants. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const driveName = drive?.role_name || `Drive #${id}`;
  const companyName = drive?.company_name || '';

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">

        {/* Back + Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <button
              onClick={() => navigate('/company/drives')}
              className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors"
            >
              <ArrowLeft size={16} />
              Back to My Drives
            </button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {loading ? 'Loading…' : driveName}
              </h1>
              {companyName && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  {companyName}
                </span>
              )}
            </div>
            <p className="text-gray-500 font-medium">All students who applied to this drive.</p>
          </div>

          {/* Applicant count badge */}
          {!loading && (
            <div className="flex items-center gap-2 px-5 py-3 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Users size={20} className="text-primary" />
              <span className="text-2xl font-black text-gray-900">{applicants.length}</span>
              <span className="text-sm font-semibold text-gray-400">
                {applicants.length === 1 ? 'Applicant' : 'Applicants'}
              </span>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl font-medium">
            {error}
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Empty State */}
          {!loading && !error && applicants.length === 0 && (
            <div className="p-16 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5 border-2 border-dashed border-gray-200">
                <GraduationCap className="text-gray-300" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-1">No Applicants Yet</h3>
              <p className="text-gray-400 font-medium max-w-sm">
                No students have applied to this drive yet. Check back after the drive goes live.
              </p>
            </div>
          )}

          {/* Table */}
          {(loading || applicants.length > 0) && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/60 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-4">#</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Branch</th>
                    <th className="px-6 py-4 text-center">GPA</th>
                    <th className="px-6 py-4 text-center">Backlogs</th>
                    <th className="px-6 py-4">Applied Date</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading
                    ? [1,2,3,4].map(i => <SkeletonRow key={i} />)
                    : applicants.map((app, idx) => (
                      <tr key={app.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4 text-gray-400 font-semibold text-sm">{idx + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-sm font-black shrink-0">
                              {(app.student_name || '?').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-gray-900">{app.student_name || '—'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium text-sm">
                          {app.student_branch || '—'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`font-bold ${parseFloat(app.student_gpa) >= 7 ? 'text-green-700' : 'text-orange-600'}`}>
                            {app.student_gpa ? parseFloat(app.student_gpa).toFixed(2) : '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`font-bold ${(app.student_backlogs || 0) === 0 ? 'text-gray-700' : 'text-red-600'}`}>
                            {app.student_backlogs ?? '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm font-medium">
                          {app.applied_at
                            ? new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={app.status} />
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CompanyApplicants;
