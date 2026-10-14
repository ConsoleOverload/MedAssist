import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { TopNav } from './TopNav.jsx';

export const AppShell = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface relative">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        toggleCollapsed={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        closeMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Workspace Offset by Sidebar Width */}
      <div
        className={`min-h-screen flex flex-col transition-all duration-300 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <TopNav openMobile={() => setIsMobileOpen(true)} isSidebarCollapsed={isCollapsed} />

        <main className="w-full pt-16 flex-1 bg-surface min-h-[calc(100vh-4rem)]">
          <div className="w-full max-w-[1600px] mx-auto px-space-base sm:px-space-xl py-space-lg">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
