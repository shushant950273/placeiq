import React, { useEffect, useState, useRef, useCallback } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import {
  Search, Upload, Users, CheckCircle, XCircle,
  AlertCircle, X, FileText, TrendingUp, Award
} from 'lucide-react';

// ── Debounce hook ──────────────────────────────────────────
function useDebounce(value, ms) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}

// ── Status badge ───────────────────────────────────────────
const StatusBadge = ({ placed }) =>
  placed ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
      <CheckCircle size={12} /> Placed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
      <XCircle size={12} /> Seeking
    </span>
  );

// ── Upload result toast panel ──────────────────────────────
const UploadResult = ({ result, onClose }) => (
  <div className={`rounded-2xl border p-5 flex gap-4 ${result.success_count > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
    <div className="shrink-0 mt-0.5">
      {result.success_count > 0
        ? <CheckCircle size={20} className="text-green-600" />
        : <AlertCircle size={20} className="text-red-500" />
      }
    </div>
    <div className="flex-1">
      <p className="font-bold text-gray-800 mb-1">
        {result.success_count > 0
          ? `✅ ${result.success_count} student${result.success_count !== 1 ? 's' : ''} uploaded successfully!`
          : 'Upload completed with errors.'}
      </p>
      {result.failed_rows?.length > 0 && (
        <div className="mt-2">
          <p className="text-sm font-semibold text-red-700 mb-1">{result.failed_rows.length} row(s) failed:</p>
          <ul className="text-xs text-red-600 space-y-1 max-h-28 overflow-y-auto">
            {result.failed_rows.map((r, i) => (
              <li key={i} className="bg-red-100 px-2 py-1 rounded">
                {r.row?.email || `Row ${i + 1}`} — {r.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0">
      <X size={18} />
    </button>
  </div>
);

// ── Main Component ─────────────────────────────────────────
const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);

  const debouncedSearch = useDebounce(search, 300);

  // ── Fetch students (client-side filtering) ───────────────
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/student/list/');
      setStudents(res.data || []);
    } catch (err) {
      console.error('Fetch students error:', err);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // ── Client-side filter ────────────────────────────────────
  const filtered = debouncedSearch.trim()
    ? students.filter(s =>
        s.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        s.usn?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        s.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : students;

  // ── Stats ─────────────────────────────────────────────────
  const placedCount = students.filter(s => s.is_placed).length;
  const avgGpa = students.length
    ? (students.reduce((sum, s) => sum + parseFloat(s.gpa || 0), 0) / students.length).toFixed(2)
    : '0.00';

  // ── CSV Upload ────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadResult(null);
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/api/student/bulk-upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResult(res.data);
      if (res.data.success_count > 0) fetchStudents(); // Refresh list
    } catch (err) {
      setUploadResult({ success_count: 0, failed_rows: [{ row: {}, reason: err.response?.data?.error || 'Upload failed.' }] });
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Students Management</h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1 font-medium">
              {loading ? 'Loading...' : `Showing ${filtered.length} of ${students.length} students`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Search by Name or USN..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700/60 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/30 outline-none w-64 text-sm"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Upload CSV */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-primary transition-all shadow-sm disabled:opacity-60"
            >
              {uploading ? (
                <span className="flex items-center gap-2"><span className="animate-spin">⟳</span> Uploading...</span>
              ) : (
                <><Upload size={16} /> Upload CSV</>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Upload Result Panel */}
        {uploadResult && (
          <UploadResult result={uploadResult} onClose={() => setUploadResult(null)} />
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 flex items-center gap-3">
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
            <button onClick={fetchStudents} className="ml-auto text-sm font-bold underline hover:no-underline">Retry</button>
          </div>
        )}

        {/* Stat Cards */}
        {!loading && students.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/60 shadow-sm p-5 flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl"><Users size={22} className="text-blue-600 dark:text-blue-400" /></div>
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">Total Students</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{students.length}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/60 shadow-sm p-5 flex items-center gap-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl"><CheckCircle size={22} className="text-green-600 dark:text-green-400" /></div>
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">Placed</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">
                  {placedCount}
                  <span className="text-sm font-semibold text-gray-400 dark:text-slate-500 ml-1">
                    ({students.length > 0 ? ((placedCount / students.length) * 100).toFixed(0) : 0}%)
                  </span>
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/60 shadow-sm p-5 flex items-center gap-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl"><TrendingUp size={22} className="text-purple-600 dark:text-purple-400" /></div>
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">Avg. GPA</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{avgGpa}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-12 bg-gray-100 rounded-xl" />
            {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-50 rounded-xl border border-gray-100" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-5 border-2 border-dashed border-gray-200 dark:border-slate-600">
              <Users className="text-gray-300 dark:text-slate-500" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-700 dark:text-white mb-2">
              {search ? 'No Students Match Your Search' : 'No Students Found'}
            </h3>
            <p className="text-gray-400 dark:text-slate-400 font-medium max-w-sm">
              {search
                ? `No results for "${search}". Try a different name or USN.`
                : 'No students registered yet. Ask students to register or upload a CSV file using the button above.'
              }
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="mt-4 text-secondary dark:text-blue-400 font-bold text-sm hover:underline">
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-700/60 text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">USN</th>
                    <th className="px-6 py-4">Branch</th>
                    <th className="px-6 py-4 text-center">GPA</th>
                    <th className="px-6 py-4 text-center">Backlogs</th>
                    <th className="px-6 py-4">Skills</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                  {filtered.map((student, index) => (
                    <tr key={student.id || index} className="hover:bg-gray-50/60 dark:hover:bg-slate-700/30 transition-colors">

                      {/* Name + Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 dark:bg-blue-900/40 flex items-center justify-center text-primary dark:text-blue-400 font-black text-sm shrink-0">
                            {student.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-slate-100 leading-tight">{student.name || '—'}</p>
                            <p className="text-xs text-gray-400 dark:text-slate-400">{student.email || ''}</p>
                          </div>
                        </div>
                      </td>

                      {/* USN */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-semibold text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700/60 px-2 py-0.5 rounded">
                          {student.usn || '—'}
                        </span>
                      </td>

                      {/* Branch */}
                      <td className="px-6 py-4 text-gray-600 dark:text-slate-300 font-medium text-sm">
                        {student.branch || '—'}
                      </td>

                      {/* GPA */}
                      <td className="px-6 py-4 text-center">
                        <span className={`font-black text-base ${parseFloat(student.gpa) >= 7.5 ? 'text-green-600 dark:text-green-400' : parseFloat(student.gpa) >= 6.0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500 dark:text-red-400'}`}>
                          {student.gpa ?? '—'}
                        </span>
                      </td>

                      {/* Backlogs */}
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold text-sm ${student.backlogs > 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-slate-400'}`}>
                          {student.backlogs ?? 0}
                        </span>
                      </td>

                      {/* Skills */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(student.skills || []).length > 0 ? (
                            <>
                              {student.skills.slice(0, 2).map((skill, i) => (
                                <span key={i} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50 px-2 py-0.5 rounded-full font-medium">
                                  {skill}
                                </span>
                              ))}
                              {student.skills.length > 2 && (
                                <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-300 px-2 py-0.5 rounded-full font-medium">
                                  +{student.skills.length - 2}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-slate-500 italic">None added</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge placed={student.is_placed} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="px-6 py-3 bg-gray-50/50 dark:bg-slate-800/80 border-t border-gray-100 dark:border-slate-700/60 text-xs text-gray-400 dark:text-slate-500 font-medium">
              Showing {filtered.length} of {students.length} student{students.length !== 1 ? 's' : ''}
              {search && ` matching "${search}"`}
            </div>
          </div>
        )}

        {/* CSV Format Hint */}
        <div className="flex gap-3 bg-blue-50/60 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl p-5">
          <FileText size={18} className="text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-bold mb-1">CSV Upload Format</p>
            <p className="font-mono text-xs bg-white/80 dark:bg-slate-800/80 inline-block px-3 py-1.5 rounded-lg border border-blue-100 dark:border-slate-700">
              email, name, usn, branch, semester, gpa, backlogs
            </p>
            <p className="mt-1.5 text-blue-500 dark:text-blue-400/80 font-medium">Each row creates one student account. USN is used as the default password.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Students;
