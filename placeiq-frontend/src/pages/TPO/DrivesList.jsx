import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import {
  Briefcase, Building, PlusCircle, Users, ChevronDown,
  Settings, Edit3, CheckCircle, Loader2, AlertCircle
} from 'lucide-react';

const STATUS_OPTIONS = ['upcoming', 'ongoing', 'completed'];

const STATUS_STYLES = {
  upcoming:  'bg-blue-100 text-blue-800 border-blue-200',
  ongoing:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
};

import { createPortal } from 'react-dom';

const StatusDropdown = ({ drive, onStatusChange }) => {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const ref = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { 
      if (ref.current && !ref.current.contains(e.target) && 
          dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false); 
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX
      });
    }
    setOpen(!open);
  };

  const handleSelect = async (newStatus) => {
    if (newStatus === drive.status) { setOpen(false); return; }
    setUpdating(true);
    setOpen(false);
    try {
      await api.patch(`/api/drives/${drive.id}/status/`, { status: newStatus });
      onStatusChange(drive.id, newStatus);
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <div className="relative inline-block" ref={ref}>
        <button
          onClick={handleToggle}
          disabled={updating}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all hover:opacity-80
            ${STATUS_STYLES[drive.status] || 'bg-gray-100 text-gray-700 border-gray-200'}
            ${updating ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
        >
          {updating
            ? <Loader2 size={12} className="animate-spin" />
            : <span className="capitalize">{drive.status || 'upcoming'}</span>
          }
          <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && createPortal(
        <div 
          ref={dropdownRef}
          style={{ top: coords.top, left: coords.left }}
          className="absolute z-[9999] bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] rounded-xl shadow-xl overflow-hidden min-w-[140px]"
        >
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => handleSelect(s)}
              className={`w-full text-left px-4 py-2.5 text-sm font-semibold flex items-center gap-2 transition-colors hover:bg-gray-50 dark:hover:bg-[#21262D]
                ${s === drive.status ? 'text-primary dark:text-[#58A6FF] bg-blue-50/60 dark:bg-[#1C2128]' : 'text-gray-700 dark:text-[#E6EDF3]'}`}
            >
              {s === drive.status && <CheckCircle size={14} className="text-primary dark:text-[#58A6FF]" />}
              <span className="capitalize">{s}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
};

const TPODrivesList = () => {
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/api/drives/')
      .then(res => setDrives(res.data || []))
      .catch(err => {
        console.error('Error fetching drives:', err);
        setError('Failed to load drives. Please try refreshing.');
      })
      .finally(() => setLoading(false));
  }, []);

  // Called by StatusDropdown after successful PATCH
  const handleStatusChange = (driveId, newStatus) => {
    setDrives(prev => prev.map(d => d.id === driveId ? { ...d, status: newStatus } : d));
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manage Placement Drives</h1>
            <p className="text-gray-500 mt-1 font-medium">
              {drives.length > 0 ? `${drives.length} drive${drives.length !== 1 ? 's' : ''} total` : 'No drives yet'}
            </p>
          </div>

          <Link
            to="/tpo/drives/create"
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-[#152a45] transition-all shadow-md font-semibold group w-fit"
          >
            <PlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            Create Drive
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 flex items-center gap-3">
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-14 bg-gray-100 rounded-xl" />
            {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-50 rounded-xl border border-gray-100" />)}
          </div>
        ) : drives.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-dashed border-gray-200">
              <Briefcase className="text-gray-300" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">No Drives Yet</h3>
            <p className="text-gray-400 font-medium mb-6">Create the first placement drive to get started.</p>
            <Link to="/tpo/drives/create" className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#152a45] transition-colors">
              Create Drive
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">CTC</th>
                    <th className="px-6 py-4">Drive Date</th>
                    <th className="px-6 py-4 text-center">Applicants</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {drives.map((drive) => (
                    <tr key={drive.id} className="hover:bg-gray-50/60 transition-colors group">

                      {/* Company */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                            <Building size={15} className="text-primary" />
                          </div>
                          <span className="font-bold text-gray-800 truncate max-w-[140px]">
                            {drive.company_name || 'Unknown'}
                          </span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-700">{drive.role_name || 'N/A'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{drive.job_location || ''}</p>
                      </td>

                      {/* CTC */}
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-lg text-sm">
                          ₹{drive.ctc} LPA
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                        {drive.drive_date
                          ? new Date(drive.drive_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>

                      {/* Applicants */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Users size={14} className="text-gray-400" />
                          <span className="font-bold text-gray-800 text-base">
                            {drive.applicants_count ?? 0}
                          </span>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-6 py-4">
                        <StatusDropdown drive={drive} onStatusChange={handleStatusChange} />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/tpo/drives/${drive.id}/shortlist`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg text-xs font-bold hover:bg-secondary hover:text-white transition-all"
                          >
                            <Settings size={13} />
                            Manage
                          </button>
                          <button
                            onClick={() => navigate(`/tpo/drives/${drive.id}/edit`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-200 transition-all"
                          >
                            <Edit3 size={13} />
                            Edit
                          </button>
                        </div>
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

export default TPODrivesList;
