import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Home, Briefcase, CheckSquare, MessageSquare, LogOut,
  Users, PlusCircle, User, Settings, GraduationCap, TrendingUp,
} from 'lucide-react';

const linkGroups = {
  student: [
    { label: 'Main', links: [
      { name: 'Dashboard',  path: '/student/dashboard',    icon: Home },
      { name: 'My Profile', path: '/student/profile',      icon: User },
      { name: 'Settings',   path: '/student/settings',     icon: Settings },
    ]},
    { label: 'Placement', links: [
      { name: 'Placement Drives', path: '/student/drives',       icon: Briefcase },
      { name: 'My Applications', path: '/student/applications',  icon: CheckSquare },
    ]},
    { label: 'Community', links: [
      { name: 'Experiences', path: '/student/experiences', icon: MessageSquare },
    ]},
  ],
  tpo: [
    { label: 'Main', links: [
      { name: 'Dashboard', path: '/tpo/dashboard', icon: TrendingUp },
      { name: 'My Profile', path: '/tpo/profile',  icon: User },
    ]},
    { label: 'Placement', links: [
      { name: 'Create Drive',  path: '/tpo/drives/create', icon: PlusCircle },
      { name: 'Manage Drives', path: '/tpo/drives',         icon: Briefcase },
    ]},
    { label: 'Community', links: [
      { name: 'Experiences', path: '/tpo/experiences', icon: MessageSquare },
      { name: 'Students',    path: '/tpo/students',    icon: Users },
    ]},
  ],
  company: [
    { label: 'Main', links: [
      { name: 'Dashboard', path: '/company/dashboard', icon: Home },
      { name: 'My Profile', path: '/company/profile',  icon: User },
    ]},
    { label: 'Placement', links: [
      { name: 'My Drives', path: '/company/drives', icon: Briefcase },
    ]},
  ],
};

const SidebarContent = ({ role, user, logout, onClose, isCollapsed }) => {
  const location = useLocation();
  const groups   = linkGroups[role] || [];
  const initials = (user?.name || 'U').slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-[#0D1117]">

      {/* ── Logo ── */}
      <div className={`flex items-center h-14 shrink-0 border-b border-[#E5E7EB] dark:border-[#30363D] ${isCollapsed ? 'justify-center' : 'px-4 gap-2'}`}>
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="w-6 h-6 rounded bg-[#0969DA] flex items-center justify-center shrink-0 cursor-pointer"
        >
          <GraduationCap size={16} className="text-white" strokeWidth={2.5} />
        </motion.div>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="font-bold text-[15px] tracking-tight text-[#1F2328] dark:text-[#E6EDF3]"
          >
            PlaceIQ
          </motion.span>
        )}
      </div>

      {/* ── User Avatar ── */}
      <div className={`flex items-center border-b border-[#E5E7EB] dark:border-[#30363D] py-4 ${isCollapsed ? 'justify-center px-1' : 'px-4 gap-3'}`}>
        <motion.div
          whileHover={{ scale: 1.08, ring: '2px' }}
          className="w-8 h-8 rounded-full bg-[#0969DA] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm hover:ring-2 hover:ring-blue-400 hover:ring-offset-2 transition-all duration-200 cursor-default"
        >
          {initials}
        </motion.div>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="overflow-hidden whitespace-nowrap"
          >
            <p className="font-bold text-[14px] leading-tight text-[#1F2328] dark:text-[#E6EDF3] truncate">{user?.name || 'User'}</p>
            <p className="text-[12px] text-[#656D76] dark:text-[#8B949E] capitalize font-medium">{role || 'Role'}</p>
          </motion.div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-hide">
        {groups.map((group, gIdx) => (
          <div key={gIdx} className={gIdx > 0 ? 'mt-4' : ''}>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-[11px] font-semibold text-[#9CA3AF] dark:text-[#8B949E] uppercase tracking-wider px-3 mb-1.5 mt-2"
              >
                {group.label}
              </motion.div>
            )}

            <div className="space-y-0.5">
              {group.links.map((link) => {
                const Icon = link.icon;
                const isActive =
                  location.pathname === link.path ||
                  (link.path !== '/tpo/drives' &&
                    location.pathname.startsWith(link.path + '/'));

                const baseClasses = `relative flex items-center gap-2.5 rounded-md text-[14px] font-medium overflow-hidden ${
                  isCollapsed ? 'justify-center py-2 px-0' : 'px-3 py-1.5'
                }`;

                const stateClasses = isActive
                  ? 'bg-[#EFF6FF] dark:bg-[#1C2128] text-[#0969DA] dark:text-[#58A6FF]'
                  : 'text-[#374151] dark:text-[#E6EDF3] hover:bg-[#F3F4F6] dark:hover:bg-[#161B22] hover:text-[#111827] dark:hover:text-white';

                const iconClasses = isActive
                  ? 'text-[#0969DA] dark:text-[#58A6FF]'
                  : 'text-[#6B7280] dark:text-[#8B949E] group-hover:text-[#111827] dark:group-hover:text-white';

                return (
                  <NavLink key={link.name} to={link.path} onClick={onClose} className="block w-full">
                    <motion.div
                      whileHover={{ x: isCollapsed ? 0 : 3 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className={`${baseClasses} ${stateClasses} group`}
                    >
                      {/* Active indicator — animated left bar */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            exit={{ scaleY: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#0969DA] dark:bg-[#58A6FF] rounded-r"
                          />
                        )}
                      </AnimatePresence>

                      <Icon
                        size={16}
                        className={`shrink-0 ${iconClasses} transition-colors duration-150`}
                        strokeWidth={isActive ? 2.5 : 2}
                      />

                      {!isCollapsed && (
                        <motion.span
                          animate={{
                            opacity: isCollapsed ? 0 : 1,
                            width:   isCollapsed ? 0 : 'auto',
                          }}
                          transition={{ duration: 0.2 }}
                          className="truncate whitespace-nowrap overflow-hidden"
                        >
                          {link.name}
                        </motion.span>
                      )}
                    </motion.div>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Sign Out ── */}
      <div className="p-2 border-t border-[#E5E7EB] dark:border-[#30363D] shrink-0">
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={logout}
          className={`flex items-center text-[#6B7280] dark:text-[#8B949E] hover:text-[#D1242F] dark:hover:text-[#F85149] hover:bg-[#FFEBE9] dark:hover:bg-[#D1242F]/10 rounded-md transition-colors w-full group ${
            isCollapsed ? 'justify-center py-2 px-0' : 'gap-2.5 px-3 py-1.5 text-[14px] font-medium'
          }`}
        >
          <LogOut size={16} className="shrink-0 group-hover:-translate-x-0.5 transition-transform duration-150" />
          {!isCollapsed && (
            <motion.span
              animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
              transition={{ duration: 0.2 }}
            >
              Sign Out
            </motion.span>
          )}
        </motion.button>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════ */
const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { role, logout, user } = useAuth();
  const sidebarWidth = isCollapsed ? 56 : 240;

  return (
    <>
      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 bg-[#1F2328]/50 z-40 backdrop-blur-sm dark:bg-[#010409]/80"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="md:hidden fixed inset-y-0 left-0 z-50 w-64 shadow-2xl border-r border-[#E5E7EB] dark:border-[#30363D]"
          >
            <SidebarContent role={role} user={user} logout={logout} onClose={() => setIsMobileOpen(false)} isCollapsed={false} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar ── */}
      <motion.aside
        initial={{ width: sidebarWidth }}
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex fixed inset-y-0 left-0 z-40 flex-col border-r border-[#E5E7EB] dark:border-[#30363D] bg-white dark:bg-[#0D1117] overflow-hidden"
      >
        <SidebarContent role={role} user={user} logout={logout} onClose={() => {}} isCollapsed={isCollapsed} />
      </motion.aside>

      {/* ── Desktop collapse toggle ── */}
      <motion.button
        animate={{ left: isCollapsed ? 44 : 228 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        className="hidden md:flex fixed top-1/2 -translate-y-1/2 z-50 w-6 h-6 bg-white dark:bg-[#0D1117] border border-[#E5E7EB] dark:border-[#30363D] rounded-full shadow-sm items-center justify-center hover:bg-[#F3F4F6] dark:hover:bg-[#161B22] text-[#656D76] dark:text-[#8B949E] transition-colors leading-none select-none"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <span className="mb-0.5 font-bold text-lg leading-none">{isCollapsed ? '›' : '‹'}</span>
      </motion.button>
    </>
  );
};

export default Sidebar;
