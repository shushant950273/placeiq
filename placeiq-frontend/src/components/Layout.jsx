import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    }
    return false;
  });
  
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed);
  }, [isCollapsed]);

  const sidebarWidth = isCollapsed ? 56 : 240;

  return (
    <div className="flex min-h-screen bg-[#F6F8FA] dark:bg-[#0D1117] transition-colors">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <motion.div
        animate={{ marginLeft: sidebarWidth }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex flex-col flex-1 w-full min-h-screen max-md:!ml-0"
      >
        <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} setIsMobileOpen={setIsMobileOpen} />

        {/* paddingTop = 56px to account for absolute fixed Navbar height */}
        <main className="flex-1 w-full pt-[56px]">
          <div className="p-4 md:p-8 relative">
            {children}
          </div>
        </main>
      </motion.div>
    </div>
  );
};

export default Layout;

