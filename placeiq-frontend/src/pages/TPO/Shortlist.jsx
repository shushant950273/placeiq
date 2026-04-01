import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Toast from '../../components/Toast';
import Badge from '../../components/Badge';
import api from '../../api/axios';
import {
  ArrowLeft, Users, Send, CheckSquare, Square,
  GraduationCap, ChevronDown, ChevronUp, Loader2
} from 'lucide-react';

/* ── Status badge ──────────────────────────────── */
const StatusChip = ({ status }) => {
  const map = {
    applied:     'bg-blue-100   text-blue-700   border-blue-200',
    shortlisted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    selected:    'bg-green-100  text-green-700  border-green-200',
    rejected:    'bg-red-100    text-red-700    border-red-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${map[(status||'').toLowerCase()] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {status || 'applied'}
    </span>
  );
};

/* ══════════════════════════════════════════════════ */
const Shortlist = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [applicants,   setApplicants]   = useState([]);
  const [drive,        setDrive]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [selectedIds,  setSelectedIds]  = useState(new Set());
  const [shortlisting, setShortlisting] = useState(false);
  const [toast,        setToast]        = useState(null);
  const [filter,       setFilter]       = useState('all'); // all | applied | shortlisted

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [driveRes, appRes] = await Promise.all([
          api.get(`/api/drives/${id}/`),
          api.get(`/api/drives/${id}/applicants/`),
        ]);
        setDrive(driveRes.data);
        setApplicants(appRes.data || []);
      } catch (err) {
        setToast({ type: 'error', message: 'Failed to load applicants.' });
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  /* ── Selection helpers ───────────────────────── */
  const toggleOne = (studentId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(studentId) ? next.delete(studentId) : next.add(studentId);
      return next;
    });
  };

  const filteredApplicants = applicants.filter(a => {
    if (filter === 'all') return true;
    return (a.status || '').toLowerCase() === filter;
  });

  const allSelectable = filteredApplicants.filter(a => a.status !== 'shortlisted');
  const allChecked = allSelectable.length > 0 && allSelectable.every(a => selectedIds.has(a.student));
  const indeterminate = !allChecked && allSelectable.some(a => selectedIds.has(a.student));

  const toggleAll = () => {
    if (allChecked) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allSelectable.map(a => a.student)));
    }
  };

  /* ── Shortlist action ────────────────────────── */
  const handleShortlist = async () => {
    if (selectedIds.size === 0) {
      return setToast({ type: 'error', message: 'Select at least one student to shortlist.' });
    }
    setShortlisting(true);
    try {
      await api.post(`/api/drives/${id}/shortlist/`, {
        student_ids: [...selectedIds],
      });
      setToast({ type: 'success', message: `${selectedIds.size} student(s) shortlisted successfully!` });
      // Optimistically update status in local list
      setApplicants(prev =>
        prev.map(a => selectedIds.has(a.student) ? { ...a, status: 'shortlisted' } : a)
      );
      setSelectedIds(new Set());
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Shortlisting failed.' });
    } finally {
      setShortlisting(false);
    }
  };

  /* ── GPA color ───────────────────────────────── */
  const gpaColor = (gpa) =>
    parseFloat(gpa) >= 8.0 ? 'text-green-700' :
    parseFloat(gpa) >= 7.0 ? 'text-yellow-700' : 'text-red-600';

  return (
    <Layout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto pb-12 space-y-6">
        {/* ── Back + Header ── */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors mb-2">
              <ArrowLeft size={16} /> Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="text-primary" size={28} /> Applicant Console
            </h1>
            {drive && (
              <p className="text-gray-500 mt-1 font-medium">
                {drive.company_name} — {drive.role_name}
              </p>
            )}
          </div>

          {/* Shortlist button */}
          <button
            onClick={handleShortlist}
            disabled={selectedIds.size === 0 || shortlisting}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
              selectedIds.size === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 hover:-translate-y-0.5 shadow-green-200'
            }`}
          >
            {shortlisting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Shortlist Selected ({selectedIds.size})
          </button>
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex gap-2">
          {['all', 'applied', 'shortlisted'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                filter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? `All (${applicants.length})` :
               f === 'applied' ? `Applied (${applicants.filter(a => (a.status||'').toLowerCase() === 'applied').length})` :
               `Shortlisted (${applicants.filter(a => (a.status||'').toLowerCase() === 'shortlisted').length})`}
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="animate-pulse p-8 space-y-4">
              {[1,2,3,4].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl" />)}
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-gray-200">
                <GraduationCap className="text-gray-300" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-1">No Applicants Found</h3>
              <p className="text-gray-400 font-medium">No students match the current filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/60 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <th className="px-5 py-4 w-12">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        ref={el => { if (el) el.indeterminate = indeterminate; }}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded text-primary cursor-pointer"
                      />
                    </th>
                    <th className="px-5 py-4">#</th>
                    <th className="px-5 py-4">Student Name</th>
                    <th className="px-5 py-4">Branch</th>
                    <th className="px-5 py-4 text-center">GPA</th>
                    <th className="px-5 py-4 text-center">Backlogs</th>
                    <th className="px-5 py-4">Applied On</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredApplicants.map((app, idx) => {
                    const isShortlisted = (app.status || '').toLowerCase() === 'shortlisted';
                    const checked = selectedIds.has(app.student);
                    return (
                      <tr
                        key={app.id}
                        onClick={() => !isShortlisted && toggleOne(app.student)}
                        className={`hover:bg-gray-50/70 transition-colors cursor-pointer ${checked ? 'bg-blue-50/40' : ''}`}
                      >
                        <td className="px-5 py-4">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={isShortlisted}
                            onChange={() => toggleOne(app.student)}
                            onClick={e => e.stopPropagation()}
                            className="w-4 h-4 rounded text-primary cursor-pointer disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="px-5 py-4 text-gray-400 font-semibold text-sm">{idx + 1}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-sm font-black shrink-0">
                              {(app.student_name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{app.student_name || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-600 font-medium text-sm">{app.student_branch || '—'}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`font-bold ${gpaColor(app.student_gpa)}`}>
                            {app.student_gpa ? parseFloat(app.student_gpa).toFixed(2) : '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`font-bold ${(app.student_backlogs || 0) > 0 ? 'text-red-600' : 'text-gray-700'}`}>
                            {app.student_backlogs ?? 0}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-sm font-medium">
                          {app.applied_at ? new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="px-5 py-4">
                          <StatusChip status={app.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Summary footer ── */}
        {!loading && applicants.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-500 font-medium px-1">
            <span>{applicants.length} total applicant{applicants.length !== 1 ? 's' : ''}</span>
            <span className="text-green-600 font-bold">
              {applicants.filter(a => (a.status||'').toLowerCase() === 'shortlisted').length} shortlisted
            </span>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Shortlist;
