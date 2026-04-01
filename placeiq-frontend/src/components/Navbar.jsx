import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Bell, Sun, Moon, Menu, CheckCheck, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/axios';

const Navbar = ({ isCollapsed, setIsCollapsed, setIsMobileOpen }) => {
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Notifications state
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  // User Dropdown state
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userRef = useRef(null);

  // Click outside listener
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Notifications logic
  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/api/notifications/unread-count/');
      setUnreadCount(res.data.unread_count);
    } catch { /* silent */ }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications/');
      setNotifications(res.data);
    } catch { /* silent */ }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUnreadCount();
      const interval = setInterval(() => {
        fetchUnreadCount();
        if (showNotifs) fetchNotifications();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [showNotifs]);

  const toggleNotifs = () => {
    if (!showNotifs) fetchNotifications();
    setShowNotifs(s => !s);
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read/`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    try {
      await Promise.all(unread.map(n => api.put(`/api/notifications/${n.id}/read/`)));
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  const initials = (user?.name || 'U').slice(0, 2).toUpperCase();

  // Basic breadcrumb generation based on route path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const pageTitle = pathParts.length > 1 
    ? pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1)
    : 'Dashboard';

  return (
    <header className="h-[56px] fixed top-0 right-0 left-0 bg-white dark:bg-[#161B22] border-b border-[#E5E7EB] dark:border-[#30363D] z-40 transition-colors flex items-center justify-between px-4 w-full">
      
      {/* ── Left Side ── */}
      <div className="flex items-center gap-3">
        {/* Mobile Toggle */}
        <button
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden p-2 rounded-md text-[#656D76] dark:text-[#8B949E] hover:bg-[#F3F4F6] dark:hover:bg-[#21262D] transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Desktop Breadcrumbs */}
        <div className="hidden md:flex items-center gap-2 text-[14px]">
          <span className="font-semibold text-[#1F2328] dark:text-[#E6EDF3]">PlaceIQ</span>
          <span className="text-[#656D76] dark:text-[#8B949E]">/</span>
          <span className="font-semibold text-[#656D76] dark:text-[#8B949E]">{pageTitle}</span>
        </div>
      </div>

      {/* ── Right Side ── */}
      <div className="flex items-center gap-1">
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md text-[#656D76] dark:text-[#8B949E] hover:bg-[#F3F4F6] dark:hover:bg-[#21262D] hover:text-[#1F2328] dark:hover:text-[#E6EDF3] transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={toggleNotifs}
            className="relative p-2 rounded-md text-[#656D76] dark:text-[#8B949E] hover:bg-[#F3F4F6] dark:hover:bg-[#21262D] hover:text-[#1F2328] dark:hover:text-[#E6EDF3] transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0969DA] ring-2 ring-white dark:ring-[#161B22]" />
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#161B22] rounded-xl shadow-lg border border-[#E5E7EB] dark:border-[#30363D] overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-[#E5E7EB] dark:border-[#30363D] flex items-center justify-between bg-[#F6F8FA] dark:bg-[#0D1117]">
                  <h3 className="font-semibold text-[14px] text-[#1F2328] dark:text-[#E6EDF3]">Notifications</h3>
                </div>
                
                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-[#656D76] dark:text-[#8B949E]">
                      <Bell size={20} className="mx-auto mb-2 opacity-30" />
                      <p className="text-[13px]">No unread notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E5E7EB] dark:divide-[#30363D]">
                      {notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => !n.is_read && markAsRead(n.id)}
                          className={`p-4 cursor-pointer flex gap-3 ${
                            n.is_read ? 'bg-white dark:bg-[#161B22]' : 'bg-[#EFF6FF]/50 dark:bg-[#1C2128]/50'
                          }`}
                        >
                          <div>
                            <p className={`text-[13px] ${n.is_read ? 'text-[#656D76] dark:text-[#8B949E]' : 'text-[#1F2328] dark:text-[#E6EDF3] font-semibold'}`}>
                              {n.title}
                            </p>
                            <p className={`text-[12px] mt-1 ${n.is_read ? 'text-[#656D76] dark:text-[#8B949E]' : 'text-[#656D76] dark:text-[#8B949E]'}`}>
                              {n.message}
                            </p>
                            <p className="text-[11px] text-[#656D76] dark:text-[#8B949E] mt-2">
                              {new Date(n.created_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="w-full p-2.5 text-[13px] font-semibold text-center border-t border-[#E5E7EB] dark:border-[#30363D] text-[#0969DA] dark:text-[#58A6FF] hover:bg-[#F3F4F6] dark:hover:bg-[#21262D] transition-colors flex items-center justify-center gap-1 bg-[#F6F8FA] dark:bg-[#161B22]"
                  >
                    <CheckCheck size={14} /> Mark all as read
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Dropdown */}
        <div className="relative ml-2" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 rounded-full bg-[#0969DA] flex items-center justify-center text-white font-bold text-xs ring-1 ring-black/10 transition-transform active:scale-95"
          >
            {initials}
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-[200px] bg-white dark:bg-[#161B22] rounded-xl shadow-lg border border-[#E5E7EB] dark:border-[#30363D] overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-[#E5E7EB] dark:border-[#30363D]">
                  <p className="text-[13px] text-[#656D76] dark:text-[#8B949E]">Signed in as</p>
                  <p className="text-[14px] font-bold text-[#1F2328] dark:text-[#E6EDF3] truncate mt-0.5">{user?.email || 'user@example.com'}</p>
                </div>
                <div className="py-1">
                  <Link to={`/${role}/profile`} className="flex items-center gap-2 px-4 py-2 text-[14px] font-medium text-[#1F2328] dark:text-[#E6EDF3] hover:bg-[#0969DA] hover:text-white dark:hover:bg-[#0969DA] transition-colors" onClick={() => setShowUserMenu(false)}>
                    <UserIcon size={16} /> Your Profile
                  </Link>
                  <Link disabled className="flex items-center gap-2 px-4 py-2 text-[14px] text-[#656D76] dark:text-[#8B949E] hover:bg-[#F3F4F6] dark:hover:bg-[#21262D] transition-colors pointer-events-none" onClick={() => setShowUserMenu(false)}>
                    <Settings size={16} /> Settings
                  </Link>
                </div>
                <div className="border-t border-[#E5E7EB] dark:border-[#30363D] py-1">
                  <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 text-[14px] font-medium text-[#D1242F] dark:text-[#F85149] hover:bg-[#FFEBE9] dark:hover:bg-[#D1242F]/10 transition-colors">
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
