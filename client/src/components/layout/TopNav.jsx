import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { useNavigate } from 'react-router-dom';

export const TopNav = ({ openMobile, isSidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markRead } = useNotifications();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNewPatientClick = () => {
    if (user?.role === 'receptionist' || user?.role === 'admin') {
      navigate('/receptionist/patients/new');
    } else {
      navigate('/patient/appointments');
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-surface-container-lowest/95 backdrop-blur-xl border-b border-surface-container shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 transition-all duration-300 ${
        isSidebarCollapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-64'
      }`}
    >
      <div className="h-16 w-full px-space-base sm:px-space-xl flex items-center justify-between gap-space-sm sm:gap-space-base">
        {/* Left Side: Mobile Menu & Clinic Branch Selector */}
        <div className="flex items-center gap-space-sm sm:gap-space-base shrink-0">
          <button
            onClick={openMobile}
            className="p-1.5 -ml-1 rounded-lg text-outline-variant hover:text-on-surface lg:hidden"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>

          <img
            alt="MedAssist Logo"
            className="h-7 w-auto object-contain hidden sm:block"
            src="https://lh3.googleusercontent.com/aida/AEtjO1UJzR6Eo_HbuckN2eHoUiv6Ct_FbuVmq0na4U4rJqaUWViwQFVYggDLEjRw6IB4vzoEKnGwvSdsT2idhUv1DpTogtKaA3B56-53kBYSKx8d0UjQ9m3iMdkl5kKjUmurivxUpHQoWE16kkLFIYKM_sUqmx4asJZm-xoinH4x5mETo-Rjd4AVGDuxzMVoZYqv5T50WbXLSmGxcjVIwf3gITuQ4P5hBYnztnAHwzJhIvAGKyn21t5jICCoM5ot"
            onError={(e) => { e.target.style.display = 'none'; }}
          />

          <div className="h-6 w-px bg-outline-variant/40 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-space-xs cursor-pointer group">
            <span className="material-symbols-outlined text-primary text-[20px]">domain</span>
            <div className="flex flex-col">
              <span className="font-semibold text-xs text-on-surface leading-tight group-hover:text-primary transition-colors">
                Yashoda Hospitals • Somajiguda
              </span>
              <span className="hidden xl:inline text-[11px] text-outline leading-tight">
                Pulmonary Medicine &amp; Sleep Disorders
              </span>
            </div>
            <span className="material-symbols-outlined text-outline text-[16px]">unfold_more</span>
          </div>
        </div>

        {/* Center: Global ⌘K Search Bar */}
        <div className="flex-1 max-w-lg mx-2 sm:mx-space-base">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search patients, MRN, doctors, lab orders..."
              className="w-full h-9 pl-9 pr-14 rounded-lg bg-surface-container-low text-on-surface text-xs placeholder:text-outline border border-outline-variant/40 focus:outline-none focus:border-secondary focus:bg-surface-container-lowest transition-all"
            />
            <kbd className="absolute right-2.5 px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono text-[10px] border border-outline-variant/40">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Side: Fast Actions & Profile */}
        <div className="flex items-center gap-space-sm sm:gap-space-md">
          {/* New Patient Button */}
          <button
            onClick={handleNewPatientClick}
            className="h-9 px-space-sm sm:px-space-md rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="hidden sm:inline">New Patient</span>
          </button>

          {/* Notifications Button */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant transition-colors"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-error text-on-error text-[10px] flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Menu */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest rounded-xl shadow-modal border border-surface-container-high py-2 z-50 animate-slide-up">
                <div className="px-4 py-2 border-b border-surface-container flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-on-surface">Clinical Notifications</h4>
                    <p className="text-[10px] text-outline">{unreadCount} unread items</p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markRead('all')}
                      className="text-[11px] text-primary hover:underline font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-surface-container-low">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-outline">No active notifications</div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => !item.isRead && markRead(item._id)}
                        className={`p-3 hover:bg-surface-container-low flex items-start gap-3 cursor-pointer transition-colors ${
                          !item.isRead ? 'bg-primary-fixed/20' : ''
                        }`}
                      >
                        <div className="p-1.5 bg-surface-container rounded-lg shrink-0 mt-0.5 text-primary">
                          <span className="material-symbols-outlined text-[16px]">
                            {item.type === 'lab' ? 'biotech' : item.type === 'appointment' ? 'calendar_today' : 'notifications'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-on-surface truncate">{item.title}</p>
                          <p className="text-xs text-on-surface-variant line-clamp-2 mt-0.5">{item.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-outline-variant/40 hidden sm:block" />

          {/* User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <div
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-space-sm cursor-pointer p-1 rounded-lg hover:bg-surface-container-low transition-colors"
            >
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-xs font-semibold text-on-surface leading-tight">
                  {user?.name || 'Dr. B.R.S. Chandrashekhar'}
                </span>
                <span className="hidden xl:inline text-[11px] text-outline leading-tight capitalize">
                  {user?.role?.replace('_', ' ')} • Pulmonary Specialist
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs shadow-xs">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
                )}
              </div>
            </div>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-modal border border-surface-container-high py-1.5 z-50 animate-slide-up">
                <div className="px-4 py-2 border-b border-surface-container">
                  <p className="text-xs font-semibold text-on-surface">{user?.name}</p>
                  <p className="text-[11px] text-outline truncate">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-left text-xs text-error hover:bg-error-container/40 flex items-center gap-2 transition-colors font-semibold"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
