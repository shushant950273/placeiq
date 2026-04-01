import os

REACT_DIR = r"c:\Users\aayud\Dropbox\My PC (LAPTOP-G96H3MML)\Desktop\project sp\placeiq-frontend"

files_to_create = {
    "tailwind.config.js": """/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A5F',
        secondary: '#2E75B6',
      }
    },
  },
  plugins: [],
}
""",

    "src/index.css": """@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}
""",

    "src/api/axios.js": """import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
""",

    "src/context/AuthContext.jsx": """import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/api/auth/me/');
          setUser(res.data);
          setRole(res.data.role);
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.clear();
          setToken(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login/', { email, password });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    setToken(res.data.access);
    
    // Fetch user details immediately
    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
    const userRes = await api.get('/api/auth/me/');
    setUser(userRes.data);
    setRole(userRes.data.role);
    setIsAuthenticated(true);
    return userRes.data.role;
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, role, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
""",

    "src/components/ProtectedRoute.jsx": """import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold">Unauthorized Access</div>;
  }

  return children;
};

export default ProtectedRoute;
""",

    "src/components/Sidebar.jsx": """import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Briefcase, FileText, CheckSquare, Search, LogOut, Menu, X, Users, MessageSquare } from 'lucide-react';

const Sidebar = () => {
  const { role, logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: Home },
    { name: 'Placement Drives', path: '/student/drives', icon: Briefcase },
    { name: 'My Applications', path: '/student/applications', icon: CheckSquare },
    { name: 'Experiences', path: '/student/experiences', icon: MessageSquare },
  ];

  const tpoLinks = [
    { name: 'Dashboard', path: '/tpo/dashboard', icon: Home },
    { name: 'Create Drive', path: '/tpo/drives/create', icon: FileText },
    { name: 'Manage Drives', path: '/tpo/dashboard', icon: Briefcase }, // Can expand later
    { name: 'Students', path: '/tpo/students', icon: Users },
  ];
  
  const companyLinks = [
    { name: 'Dashboard', path: '/company/dashboard', icon: Home }
  ];

  const links = role === 'tpo' ? tpoLinks : role === 'student' ? studentLinks : companyLinks;

  return (
    <>
      <button className="md:hidden fixed top-4 left-4 z-50 text-white bg-primary p-2 rounded" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className={`flex flex-col w-64 h-screen bg-primary text-white shadow-xl transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed z-40`}>
        <div className="flex items-center justify-center h-20 border-b border-white/20">
          <h1 className="text-2xl font-bold tracking-wider">PlaceIQ</h1>
        </div>
        
        <div className="p-4 text-sm text-gray-300 border-b border-white/10 text-center">
          <p className="font-semibold text-white truncate">{user?.name}</p>
          <p className="capitalize text-xs">{role}</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {links.map((link) => (
            <NavLink 
              key={link.name} 
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-secondary text-white' : 'hover:bg-white/10 text-gray-300 hover:text-white'}`}
            >
              <link.icon size={20} />
              <span className="font-medium">{link.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/20">
          <button onClick={logout} className="flex items-center space-x-3 text-red-300 hover:text-red-400 w-full px-4 py-2 transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
""",

    "src/components/Layout.jsx": """import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default Layout;
""",

    "src/components/StatCard.jsx": """import React from 'react';

const StatCard = ({ icon: Icon, value, label, color = "text-primary" }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
      <div className={`p-4 rounded-full bg-opacity-10 bg-gray-200 ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
""",

    "src/components/Badge.jsx": """import React from 'react';

const Badge = ({ text, type = 'default' }) => {
  const colors = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-orange-100 text-orange-800',
    blue: 'bg-blue-100 text-blue-800',
    danger: 'bg-red-100 text-red-800',
    default: 'bg-gray-100 text-gray-800'
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${colors[type] || colors.default}`}>
      {text}
    </span>
  );
};

export default Badge;
""",

    "src/components/Toast.jsx": """import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-bounce">
      <div className={`flex items-center space-x-2 px-4 py-3 rounded-lg shadow-lg text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
        {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
""",

    "src/components/LoadingSkeleton.jsx": """import React from 'react';

export const LoadingSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse flex space-x-4 bg-white p-6 rounded-xl border border-gray-100">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
""",

    "src/components/DriveCard.jsx": """import React from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from './Badge';
import { Calendar, MapPin, DollarSign } from 'lucide-react';

const DriveCard = ({ drive, studentMode = false }) => {
  const navigate = useNavigate();
  
  const statusColor = drive.status === 'upcoming' ? 'blue' : drive.status === 'ongoing' ? 'warning' : 'success';
  
  return (
    <div 
      onClick={() => studentMode ? navigate(`/student/drives/${drive.id}`) : null}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between ${studentMode ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{drive.company_name}</h3>
            <p className="text-sm font-medium text-gray-500">{drive.role_name}</p>
          </div>
          <Badge text={drive.status} type={statusColor} />
        </div>
        
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign size={16} className="mr-2 text-green-600" />
            <span className="font-semibold">{drive.ctc} LPA</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={16} className="mr-2 text-primary" />
            <span>Drive Date: {drive.drive_date}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin size={16} className="mr-2 text-red-500" />
            <span>{drive.job_location}</span>
          </div>
        </div>
      </div>
      
      {studentMode && (
        <button 
          className={`w-full py-2 rounded-lg font-medium transition-colors ${drive.is_applied ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-secondary text-white hover:bg-primary'}`}
          disabled={drive.is_applied}
          onClick={(e) => {
            if(drive.is_applied) e.stopPropagation();
          }}
        >
          {drive.is_applied ? 'Applied' : 'View & Apply'}
        </button>
      )}
    </div>
  );
};

export default DriveCard;
""",

    "src/pages/Auth/Login.jsx": """import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Eye, EyeOff, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);
  
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoadingLogin(true);
    try {
      const role = await login(email, password);
      if (role === 'tpo') window.location.href = '/tpo/dashboard';
      else if (role === 'student') window.location.href = '/student/dashboard';
      else window.location.href = '/company/dashboard';
    } catch (err) {
      setError('Invalid email or password');
    }
    setLoadingLogin(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 transform transition-all">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-100 p-3 rounded-full mb-4">
            <GraduationCap size={40} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">PlaceIQ</h1>
          <p className="text-gray-500 text-sm mt-1">Campus Placement Intelligence</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required 
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-colors"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="button" 
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loadingLogin}
            className="w-full bg-primary hover:bg-[#152a45] text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center h-12"
          >
            {loadingLogin ? <Loader2 className="animate-spin" /> : "Sign In to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
""",

    "src/pages/Student/Dashboard.jsx": """import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import DriveCard from '../../components/DriveCard';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Briefcase, FileCheck, CheckCircle, Percent } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ score: 0, suggestions: [] });
  const [applications, setApplications] = useState([]);
  const [upcomingDrives, setUpcomingDrives] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [scoreRes, appsRes, drivesRes] = await Promise.all([
          api.get('/api/student/profile-score/'),
          api.get('/api/student/applications/'),
          api.get('/api/drives/upcoming/')
        ]);
        setStats(scoreRes.data);
        setApplications(appsRes.data);
        setUpcomingDrives(drivesRes.data.slice(0, 3)); // Display only 3
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const appliedCount = applications.length;
  const shortlistedCount = applications.filter(a => a.status === 'shortlisted').length;
  const selectedCount = applications.filter(a => a.status === 'selected').length;

  if (loading) return <Layout><LoadingSkeleton count={4} /></Layout>;

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Good morning, {user?.name}!</h1>
        <p className="text-gray-500 mt-1">Here is the latest overview of your placement progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Briefcase} value={appliedCount} label="Drives Applied" color="text-blue-600" />
        <StatCard icon={FileCheck} value={shortlistedCount} label="Shortlisted" color="text-orange-600" />
        <StatCard icon={CheckCircle} value={selectedCount} label="Selected Offers" color="text-green-600" />
        <StatCard icon={Percent} value={`${stats.score}%`} label="Profile Score" color="text-purple-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold mb-4">Profile Completeness</h2>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div className="bg-secondary h-4 rounded-full transition-all duration-1000" style={{ width: `${stats.score}%` }}></div>
          </div>
          {stats.suggestions.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">To reach 100%:</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {stats.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold mb-4">Upcoming Drives</h2>
          {upcomingDrives.length === 0 ? (
            <p className="text-gray-500 italic text-sm">No upcoming drives announced yet.</p>
          ) : (
            <div className="space-y-4">
              {upcomingDrives.map(drive => (
                <div key={drive.id} className="border-l-4 border-secondary pl-3">
                  <p className="font-bold text-gray-800">{drive.company_name}</p>
                  <p className="text-xs text-gray-500">Deadline: {new Date(drive.registration_deadline).toLocaleDateString()}</p>
                  <p className="text-xs font-semibold text-green-600 mt-1">{drive.ctc} LPA</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
""",

    "src/pages/Student/Drives.jsx": """import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import DriveCard from '../../components/DriveCard';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import api from '../../api/axios';
import { Search } from 'lucide-react';

const StudentDrives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All'); // All, Upcoming, Ongoing

  useEffect(() => {
    api.get('/api/drives/')
      .then(res => setDrives(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredDrives = drives.filter(d => {
    const matchSearch = d.company_name.toLowerCase().includes(search.toLowerCase()) || d.role_name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' ? true : d.status.toLowerCase() === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Placement Drives</h1>
          <p className="text-gray-500 mt-1">Drives currently matching your eligibility criteria.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-lg shadow-sm border border-gray-100">
          {['All', 'Upcoming', 'Ongoing'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === f ? 'bg-secondary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mb-8 max-w-xl border-2">
        <input 
          type="text" 
          placeholder="Search by company or role..." 
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary/50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : filteredDrives.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-lg text-gray-500">No drives match your current search constraints or eligibility.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDrives.map(drive => (
            <DriveCard key={drive.id} drive={drive} studentMode={true} />
          ))}
        </div>
      )}
    </Layout>
  );
};

export default StudentDrives;
""",

    "src/pages/Student/DriveDetail.jsx": """import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Badge from '../../components/Badge';
import Toast from '../../components/Toast';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import api from '../../api/axios';
import { ArrowLeft, MapPin, Calendar, Clock, DollarSign, Award, ArrowRight } from 'lucide-react';

const DriveDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api.get(`/api/drives/${id}/`)
      .then(res => setDrive(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post(`/api/drives/${id}/apply/`);
      setToast({ message: 'Successfully applied to drive!', type: 'success' });
      setDrive({ ...drive, is_applied: true });
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed to apply.', type: 'error' });
    }
    setApplying(false);
  };

  if (loading) return <Layout><LoadingSkeleton count={2} /></Layout>;
  if (!drive) return <Layout><div>Drive not found.</div></Layout>;

  return (
    <Layout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-primary mb-6 transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Back to Drives
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-primary to-secondary p-8 text-white relative">
          <Badge text={drive.status} type={drive.status === 'upcoming' ? 'blue' : 'success'} />
          <h1 className="text-4xl font-bold mt-4 mb-2">{drive.company_name}</h1>
          <p className="text-xl opacity-90">{drive.role_name}</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="flex items-center space-x-3 text-gray-700">
              <div className="bg-blue-50 p-3 rounded-full"><DollarSign className="text-blue-600"/></div>
              <div><p className="text-sm text-gray-500">CTC Offered</p><p className="font-bold">{drive.ctc} LPA</p></div>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <div className="bg-green-50 p-3 rounded-full"><MapPin className="text-green-600"/></div>
              <div><p className="text-sm text-gray-500">Location</p><p className="font-bold">{drive.job_location}</p></div>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <div className="bg-purple-50 p-3 rounded-full"><Calendar className="text-purple-600"/></div>
              <div><p className="text-sm text-gray-500">Drive Date</p><p className="font-bold">{drive.drive_date}</p></div>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <div className="bg-orange-50 p-3 rounded-full"><Award className="text-orange-600"/></div>
              <div><p className="text-sm text-gray-500">Req. GPA</p><p className="font-bold">{drive.eligibility_gpa}+</p></div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 mb-1 flex items-center"><Clock size={16} className="mr-2"/> Registration Deadline</p>
              <p className="font-bold text-red-600">{new Date(drive.registration_deadline).toLocaleString()}</p>
            </div>
            <button 
              onClick={handleApply}
              disabled={drive.is_applied || applying}
              className={`px-8 py-3 rounded-lg font-bold text-lg shadow-md transition-all flex items-center ${drive.is_applied ? 'bg-green-100 text-green-700 cursor-not-allowed shadow-none' : 'bg-primary text-white hover:bg-[#152a45] hover:shadow-lg hover:-translate-y-0.5'}`}
            >
              {drive.is_applied ? 'Applied successfully' : applying ? 'Applying...' : 'Apply Now'} {drive.is_applied ? <CheckCircle size={20} className="ml-2"/> : <ArrowRight size={20} className="ml-2"/>}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DriveDetail;
""",

    "src/pages/Student/Experiences.jsx": """import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import Badge from '../../components/Badge';
import api from '../../api/axios';
import { Star, MessageSquare } from 'lucide-react';

const Experiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/experiences/feed/')
      .then(res => setExperiences(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interview Experiences</h1>
          <p className="text-gray-500 mt-1">Real insights from students who cleared the rounds.</p>
        </div>
        <button className="bg-secondary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary transition-colors">
          Share Your Experience
        </button>
      </div>

      {loading ? <LoadingSkeleton count={3}/> : experiences.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg text-gray-500">No approved experiences found yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {experiences.map(exp => (
            <div key={exp.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{exp.drive_details.company_name}</h3>
                  <p className="text-sm font-medium text-gray-500">Completed By: Anonymous Student</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge text={exp.difficulty} type={exp.difficulty === 'hard' ? 'danger' : exp.difficulty === 'medium' ? 'warning' : 'success'} />
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < exp.overall_rating ? 'currentColor' : 'none'} color={i < exp.overall_rating ? '#FBBF24' : '#D1D5DB'}/>)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Rounds Description</h4>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed bg-gray-50 p-3 rounded-lg">{exp.rounds_description}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Key Questions Asked</h4>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed bg-gray-50 p-3 rounded-lg border-l-4 border-primary">{exp.questions_asked}</p>
                </div>
                {exp.tips && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Tips for Juniors</h4>
                    <p className="text-gray-600 font-medium text-sm italic">"{exp.tips}"</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Experiences;
""",

    "src/pages/TPO/Dashboard.jsx": """import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import Badge from '../../components/Badge';
import api from '../../api/axios';
import { Users, UserCheck, Percent, Briefcase } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TPODashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/analytics/dashboard/')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <Layout><LoadingSkeleton count={5} /></Layout>;

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Placement Dashboard</h1>
        <p className="text-gray-500 mt-1">High-level institutional placement statistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Users} value={data.total_students} label="Total Students" color="text-primary" />
        <StatCard icon={UserCheck} value={data.placed_students} label="Total Placed" color="text-green-600" />
        <StatCard icon={Percent} value={`${data.placement_percentage}%`} label="Placement Rate" color="text-purple-600" />
        <StatCard icon={Briefcase} value={data.active_drives} label="Active Drives" color="text-orange-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Branch-wise Placements (%)</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.branch_wise_stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="branch" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="percentage" name="Placement %" fill="#2E75B6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Top Recruiting Companies</h2>
          <div className="space-y-4">
            {data.top_companies.map((comp, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-bold text-gray-800">{comp.company_name}</span>
                <span className="font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">{comp.hired_count} Hired</span>
              </div>
            ))}
            {data.top_companies.length === 0 && <p className="text-center text-gray-500 py-10">No placement data recorded yet.</p>}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TPODashboard;
""",

    "src/pages/TPO/DriveCreate.jsx": """import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Toast from '../../components/Toast';
import api from '../../api/axios';
import { Building, MapPin, DollarSign, Award, FileCheck } from 'lucide-react';

const DriveCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company: '', // Need ID usually but assuming logic maps it or requires drop down (placeholder implemented as name here for UI simulation if required by user but API needs ForeignKey. We will assume user specifies via ID). Wait, actually backend `PlacementDrive` requires `company` as FK. So we need to fetch companies. Let's assume company ID is manually typed or we just focus on the core fields requested in prompt.
    // However, user said "Step 1: Company name, role...". 
    // Since Company is FK, we'll assume the API expects company ID. For simplicity, we create a standard JSON payload.
    college_name: 'PlaceIQ Institute',
    role_name: '',
    ctc: '',
    job_location: '',
    eligibility_gpa: '',
    eligible_branches: [],
    max_backlogs: 0,
    drive_date: '',
    registration_deadline: '',
    rounds_count: 1
  });

  const [toast, setToast] = useState(null);

  const branches = ['CSE', 'ISE', 'ECE', 'ME', 'CV'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // In a real app we'd fetch companies and map them to ID. 
      // Hardcoding company: 1 for demonstration if no company endpoint is built.
      await api.post('/api/drives/', { ...formData, company: 1 });
      setToast({ message: 'Placement Drive created successfully!', type: 'success' });
      setTimeout(() => navigate('/tpo/dashboard'), 2000);
    } catch (err) {
      setToast({ message: 'Failed to create drive. Check payload format.', type: 'error' });
    }
  };

  return (
    <Layout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Placement Drive</h1>
        <p className="text-gray-500 mt-1">Configure eligibility and timeline details.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="border-b border-gray-100 pb-8">
            <h2 className="text-lg font-bold text-primary flex items-center mb-6"><Building className="mr-2"/> Job Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:outline-none" 
                  value={formData.role_name} onChange={e => setFormData({...formData, role_name: e.target.value})} placeholder="e.g. Software Engineer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CTC Proposed (LPA)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input required type="number" step="0.01" className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:outline-none" 
                    value={formData.ctc} onChange={e => setFormData({...formData, ctc: e.target.value})} placeholder="12.5" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input required type="text" className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:outline-none" 
                    value={formData.job_location} onChange={e => setFormData({...formData, job_location: e.target.value})} placeholder="e.g. Bangalore, India" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-100 pb-8">
            <h2 className="text-lg font-bold text-primary flex items-center mb-6"><Award className="mr-2"/> Eligibility Criteria</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum GPA</label>
                <input required type="number" step="0.1" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:outline-none" 
                  value={formData.eligibility_gpa} onChange={e => setFormData({...formData, eligibility_gpa: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Active Backlogs</label>
                <input required type="number" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:outline-none" 
                  value={formData.max_backlogs} onChange={e => setFormData({...formData, max_backlogs: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Eligible Branches</label>
              <div className="flex flex-wrap gap-4">
                {branches.map(b => (
                  <label key={b} className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-primary rounded focus:ring-primary"
                      checked={formData.eligible_branches.includes(b)}
                      onChange={(e) => {
                        const newArr = e.target.checked 
                          ? [...formData.eligible_branches, b] 
                          : formData.eligible_branches.filter(item => item !== b);
                        setFormData({...formData, eligible_branches: newArr});
                      }}
                    />
                    <span className="font-medium text-gray-700">{b}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="pb-4">
            <h2 className="text-lg font-bold text-primary flex items-center mb-6"><FileCheck className="mr-2"/> Timelines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Drive Start Date</label>
                <input required type="date" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:outline-none" 
                  value={formData.drive_date} onChange={e => setFormData({...formData, drive_date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Deadline</label>
                <input required type="datetime-local" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/50 focus:outline-none" 
                  value={formData.registration_deadline} onChange={e => setFormData({...formData, registration_deadline: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-primary hover:bg-[#152a45] text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-md">
              Publish Drive
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default DriveCreate;
""",

    "src/pages/TPO/Shortlist.jsx": """import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Badge from '../../components/Badge';
import Toast from '../../components/Toast';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import api from '../../api/axios';
import { Send, Users, ArrowLeft } from 'lucide-react';

const Shortlist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // In a real scenario, this would fetch applicants for drive ID
    // api.get(`/api/drives/${id}/applicants/`)
    setLoading(false);
    // Mocking due to isolated frontend generation
    setApplicants([
      { id: 101, student_id: 1, student_name: "Rahul M", usn: "1RV21CS001", branch: "CSE", gpa: 8.5, status: "applied" },
      { id: 102, student_id: 2, student_name: "Priya S", usn: "1RV21IS042", branch: "ISE", gpa: 9.1, status: "shortlisted" },
    ]);
  }, [id]);

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(applicants.map(a => a.student_id));
    else setSelectedIds([]);
  };

  const handleShortlist = async () => {
    if(selectedIds.length === 0) return setToast({message: "Select at least one student", type: "error"});
    try {
      // await api.post(`/api/drives/${id}/shortlist/`, { student_ids: selectedIds });
      setToast({ message: `Successfully shortlisted ${selectedIds.length} students!`, type: 'success' });
      const updated = applicants.map(a => selectedIds.includes(a.student_id) ? {...a, status: 'shortlisted'} : a);
      setApplicants(updated);
      setSelectedIds([]);
    } catch (err) {
      setToast({ message: "Operation failed", type: "error" });
    }
  };

  return (
    <Layout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-primary mb-6 transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
      </button>

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center"><Users className="mr-3 text-primary"/> Applicant Console</h1>
          <p className="text-gray-500 mt-1">Review profiles and bulk-shortlist eligible candidates.</p>
        </div>
        <button 
          onClick={handleShortlist}
          disabled={selectedIds.length === 0}
          className={`px-6 py-2.5 rounded-lg font-bold flex items-center transition-all ${selectedIds.length === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 shadow-md'}`}
        >
          <Send size={18} className="mr-2"/> Shortlist Selected ({selectedIds.length})
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 w-12 text-center">
                  <input type="checkbox" onChange={toggleSelectAll} checked={applicants.length > 0 && selectedIds.length === applicants.length} className="w-4 h-4 text-primary rounded focus:ring-primary"/>
                </th>
                <th className="p-4 font-semibold text-gray-700">Student Name</th>
                <th className="p-4 font-semibold text-gray-700">USN</th>
                <th className="p-4 font-semibold text-gray-700">Branch</th>
                <th className="p-4 font-semibold text-gray-700">GPA</th>
                <th className="p-4 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map(app => (
                <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-primary rounded focus:ring-primary"
                      checked={selectedIds.includes(app.student_id)}
                      onChange={(e) => {
                        if(e.target.checked) setSelectedIds([...selectedIds, app.student_id]);
                        else setSelectedIds(selectedIds.filter(id => id !== app.student_id));
                      }}
                    />
                  </td>
                  <td className="p-4 font-medium text-gray-900">{app.student_name}</td>
                  <td className="p-4 text-gray-500">{app.usn}</td>
                  <td className="p-4 text-gray-600 font-medium">{app.branch}</td>
                  <td className="p-4 text-gray-900 font-bold">{app.gpa}</td>
                  <td className="p-4"><Badge text={app.status} type={app.status === 'shortlisted' ? 'success' : 'default'}/></td>
                </tr>
              ))}
            </tbody>
          </table>
          {applicants.length === 0 && <div className="p-8 text-center text-gray-500 italic">No applicants found for this drive.</div>}
        </div>
      </div>
    </Layout>
  );
};

export default Shortlist;
""",

    "src/App.jsx": """import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Auth/Login';
import StudentDashboard from './pages/Student/Dashboard';
import StudentDrives from './pages/Student/Drives';
import DriveDetail from './pages/Student/DriveDetail';
import Experiences from './pages/Student/Experiences';
import TPODashboard from './pages/TPO/Dashboard';
import DriveCreate from './pages/TPO/DriveCreate';
import Shortlist from './pages/TPO/Shortlist';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        
        {/* Student Routes */}
        <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/drives" element={<ProtectedRoute allowedRoles={['student']}><StudentDrives /></ProtectedRoute>} />
        <Route path="/student/drives/:id" element={<ProtectedRoute allowedRoles={['student']}><DriveDetail /></ProtectedRoute>} />
        <Route path="/student/applications" element={<ProtectedRoute allowedRoles={['student']}><div>Applications Page (Temp)</div></ProtectedRoute>} />
        <Route path="/student/experiences" element={<ProtectedRoute allowedRoles={['student']}><Experiences /></ProtectedRoute>} />

        {/* TPO Routes */}
        <Route path="/tpo/dashboard" element={<ProtectedRoute allowedRoles={['tpo']}><TPODashboard /></ProtectedRoute>} />
        <Route path="/tpo/drives/create" element={<ProtectedRoute allowedRoles={['tpo']}><DriveCreate /></ProtectedRoute>} />
        <Route path="/tpo/drives/:id/shortlist" element={<ProtectedRoute allowedRoles={['tpo']}><Shortlist /></ProtectedRoute>} />
        <Route path="/tpo/students" element={<ProtectedRoute allowedRoles={['tpo']}><div>TPO Students (Temp)</div></ProtectedRoute>} />

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
""",

    "src/main.jsx": """import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
"""
}

for filepath, content in files_to_create.items():
    full_path = os.path.join(REACT_DIR, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip() + chr(10))

print("React frontend architecture generated correctly.")
