import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import clsx from 'clsx';

import { APP_ROLES, ROLE_LABELS, ROLE_HOME_PATHS } from '../../constants/roles.js';

export const Sidebar = ({ isCollapsed, toggleCollapsed, isMobileOpen, closeMobile }) => {
  const { user, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [roleSwitchOpen, setRoleSwitchOpen] = useState(false);

  const handleSwitchRole = async (acc) => {
    try {
      await login(acc.demoEmail, acc.demoPassword);
      setRoleSwitchOpen(false);
      navigate(ROLE_HOME_PATHS[acc.id] || '/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-on-background/50 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={clsx(
          'fixed left-0 top-0 bottom-0 h-screen bg-inverse-surface text-inverse-on-surface z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header - Pinned at top */}
        <div className="h-16 px-space-base flex items-center justify-between border-b border-outline/20 shrink-0">
          <div className="flex items-center gap-space-sm overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[20px]">local_hospital</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-semibold text-surface-container-lowest text-sm tracking-tight leading-none">
                  MedAssist
                </span>
                <span className="text-[11px] text-outline-variant leading-none mt-1">
                  Clinical Ops OS
                </span>
              </div>
            )}
          </div>
          <button
            onClick={toggleCollapsed}
            className="text-outline-variant hover:text-surface-container-lowest transition-colors hidden lg:block p-1"
          >
            <span className="material-symbols-outlined text-[18px]">dock_to_left</span>
          </button>
        </div>


        {/* Navigation Items based on Role - Scrollable Body */}
        <nav className="flex-1 overflow-y-auto px-space-sm py-space-md space-y-space-md">
            {/* Clinical Care Section */}
            {user?.role === 'doctor' && (
              <div className="space-y-1">
                {!isCollapsed && (
                  <div className="px-space-sm py-1 text-[11px] uppercase tracking-wider text-outline-variant font-semibold">
                    Clinical Care
                  </div>
                )}
                <NavLink
                  to="/doctor/dashboard"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center justify-between px-space-sm py-2 rounded-lg transition-colors text-xs font-medium',
                      isActive
                        ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                        : 'text-outline-variant hover:bg-surface-container-highest/10 hover:text-surface-container-lowest'
                    )
                  }
                  title="Schedule & Queue"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px]">calendar_clock</span>
                    {!isCollapsed && <span>Schedule &amp; Queue</span>}
                  </div>
                  {!isCollapsed && (
                    <span className="px-1.5 py-0.5 rounded-full bg-secondary text-on-secondary text-[10px] font-semibold">
                      Live
                    </span>
                  )}
                </NavLink>

                <NavLink
                  to="/doctor/queue"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center justify-between px-space-sm py-2 rounded-lg transition-colors text-xs font-medium',
                      isActive
                        ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                        : 'text-outline-variant hover:bg-surface-container-highest/10 hover:text-surface-container-lowest'
                    )
                  }
                  title="Waiting Room Queue"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px]">sensor_occupied</span>
                    {!isCollapsed && <span>Waiting Room</span>}
                  </div>
                </NavLink>

                <NavLink
                  to="/doctor/patients"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center px-space-sm py-2 rounded-lg transition-colors text-xs font-medium',
                      isActive
                        ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                        : 'text-outline-variant hover:bg-surface-container-highest/10 hover:text-surface-container-lowest'
                    )
                  }
                  title="Patient Directory"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px]">folder_shared</span>
                    {!isCollapsed && <span>Patient Directory</span>}
                  </div>
                </NavLink>
              </div>
            )}

            {/* Diagnostics & Lab */}
            {(user?.role === 'lab_technician' || user?.role === 'doctor') && (
              <div className="space-y-1">
                {!isCollapsed && (
                  <div className="px-space-sm py-1 text-[11px] uppercase tracking-wider text-outline-variant font-semibold">
                    Diagnostics &amp; Orders
                  </div>
                )}
                <NavLink
                  to="/lab/queue"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center justify-between px-space-sm py-2 rounded-lg transition-colors text-xs font-medium',
                      isActive
                        ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                        : 'text-outline-variant hover:bg-surface-container-highest/10 hover:text-surface-container-lowest'
                    )
                  }
                  title="Lab & Pathology"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px]">biotech</span>
                    {!isCollapsed && <span>Lab &amp; Pathology</span>}
                  </div>
                  {!isCollapsed && (
                    <span className="px-1.5 py-0.5 rounded-full bg-error-container text-on-error-container text-[10px] font-semibold">
                      Queue
                    </span>
                  )}
                </NavLink>
              </div>
            )}

            {/* Operations & Reception */}
            {user?.role === 'receptionist' && (
              <div className="space-y-1">
                {!isCollapsed && (
                  <div className="px-space-sm py-1 text-[11px] uppercase tracking-wider text-outline-variant font-semibold">
                    Operations &amp; Reception
                  </div>
                )}
                <NavLink
                  to="/receptionist/dashboard"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center px-space-sm py-2 rounded-lg transition-colors text-xs font-medium',
                      isActive
                        ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                        : 'text-outline-variant hover:bg-surface-container-highest/10 hover:text-surface-container-lowest'
                    )
                  }
                  title="Reception Queue"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px]">sensor_occupied</span>
                    {!isCollapsed && <span>Reception Queue</span>}
                  </div>
                </NavLink>

                <NavLink
                  to="/receptionist/booking"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center px-space-sm py-2 rounded-lg transition-colors text-xs font-medium',
                      isActive
                        ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                        : 'text-outline-variant hover:bg-surface-container-highest/10 hover:text-surface-container-lowest'
                    )
                  }
                  title="Scheduler & Calendar"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
                    {!isCollapsed && <span>Scheduler &amp; Slots</span>}
                  </div>
                </NavLink>

                <NavLink
                  to="/receptionist/patients/new"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center px-space-sm py-2 rounded-lg transition-colors text-xs font-medium',
                      isActive
                        ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                        : 'text-outline-variant hover:bg-surface-container-highest/10 hover:text-surface-container-lowest'
                    )
                  }
                  title="Patient Registration"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    {!isCollapsed && <span>Patient Registration</span>}
                  </div>
                </NavLink>

                <NavLink
                  to="/receptionist/billing"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center px-space-sm py-2 rounded-lg transition-colors text-xs font-medium',
                      isActive
                        ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                        : 'text-outline-variant hover:bg-surface-container-highest/10 hover:text-surface-container-lowest'
                    )
                  }
                  title="Billing & Claims"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                    {!isCollapsed && <span>Billing &amp; Invoices</span>}
                  </div>
                </NavLink>
              </div>
            )}

            {/* Governance & Administration */}
            {user?.role === 'admin' && (
              <div className="space-y-1">
                {!isCollapsed && (
                  <div className="px-space-sm py-1 text-[11px] uppercase tracking-wider text-outline-variant font-semibold">
                    Governance &amp; Admin
                  </div>
                )}
                <NavLink
                  to="/admin/dashboard"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center px-space-sm py-2 rounded-lg transition-colors text-xs font-medium',
                      isActive
                        ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                        : 'text-outline-variant hover:bg-surface-container-highest/10 hover:text-surface-container-lowest'
                    )
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px]">monitoring</span>
                    {!isCollapsed && <span>Clinic Overview</span>}
                  </div>
                </NavLink>

                <NavLink
                  to="/admin/staff"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center px-space-sm py-2 rounded-lg transition-colors text-xs font-medium',
                      isActive
                        ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                        : 'text-outline-variant hover:bg-surface-container-highest/10 hover:text-surface-container-lowest'
                    )
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px]">group</span>
                    {!isCollapsed && <span>Staff Management</span>}
                  </div>
                </NavLink>

                <NavLink
                  to="/admin/services"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center px-space-sm py-2 rounded-lg transition-colors text-xs font-medium',
                      isActive
                        ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                        : 'text-outline-variant hover:bg-surface-container-highest/10 hover:text-surface-container-lowest'
                    )
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px]">settings</span>
                    {!isCollapsed && <span>Services &amp; Catalogs</span>}
                  </div>
                </NavLink>

                <NavLink
                  to="/admin/audit"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center px-space-sm py-2 rounded-lg transition-colors text-xs font-medium',
                      isActive
                        ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                        : 'text-outline-variant hover:bg-surface-container-highest/10 hover:text-surface-container-lowest'
                    )
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    {!isCollapsed && <span>Audit Trail</span>}
                  </div>
                </NavLink>

                {!isCollapsed && (
                  <div className="pt-2 px-space-sm py-1 text-[11px] uppercase tracking-wider text-outline-variant font-semibold">
                    Clinical Workspaces
                  </div>
                )}
                <NavLink
                  to="/doctor/dashboard"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center px-space-sm py-2 rounded-lg transition-colors text-xs font-medium',
                      isActive
                        ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                        : 'text-outline-variant hover:bg-surface-container-highest/10 hover:text-surface-container-lowest'
                    )
                  }
                  title="Doctor Desk"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px]">stethoscope</span>
                    {!isCollapsed && <span>Doctor Desk</span>}
                  </div>
                </NavLink>

                <NavLink
                  to="/receptionist/dashboard"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center px-space-sm py-2 rounded-lg transition-colors text-xs font-medium',
                      isActive
                        ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                        : 'text-outline-variant hover:bg-surface-container-highest/10 hover:text-surface-container-lowest'
                    )
                  }
                  title="Reception Desk"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px]">desk</span>
                    {!isCollapsed && <span>Reception Desk</span>}
                  </div>
                </NavLink>
              </div>
            )}

            {/* Patient Portal Links */}
            {user?.role === 'patient' && (
              <div className="space-y-1">
                {!isCollapsed && (
                  <div className="px-space-sm py-1 text-[11px] uppercase tracking-wider text-outline-variant font-semibold">
                    My Health Portal
                  </div>
                )}
                <NavLink
                  to="/patient/dashboard"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center px-space-sm py-2 rounded-lg transition-colors text-xs font-medium',
                      isActive
                        ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                        : 'text-outline-variant hover:bg-surface-container-highest/10 hover:text-surface-container-lowest'
                    )
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px]">favorite</span>
                    {!isCollapsed && <span>Health Overview</span>}
                  </div>
                </NavLink>

                <NavLink
                  to="/patient/appointments"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center px-space-sm py-2 rounded-lg transition-colors text-xs font-medium',
                      isActive
                        ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                        : 'text-outline-variant hover:bg-surface-container-highest/10 hover:text-surface-container-lowest'
                    )
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    {!isCollapsed && <span>My Appointments</span>}
                  </div>
                </NavLink>

                <NavLink
                  to="/patient/prescriptions"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center px-space-sm py-2 rounded-lg transition-colors text-xs font-medium',
                      isActive
                        ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                        : 'text-outline-variant hover:bg-surface-container-highest/10 hover:text-surface-container-lowest'
                    )
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px]">prescriptions</span>
                    {!isCollapsed && <span>Prescriptions &amp; AI Guide</span>}
                  </div>
                </NavLink>

                <NavLink
                  to="/patient/lab-reports"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center px-space-sm py-2 rounded-lg transition-colors text-xs font-medium',
                      isActive
                        ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                        : 'text-outline-variant hover:bg-surface-container-highest/10 hover:text-surface-container-lowest'
                    )
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px]">biotech</span>
                    {!isCollapsed && <span>Lab Reports</span>}
                  </div>
                </NavLink>

                <NavLink
                  to="/patient/invoices"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center px-space-sm py-2 rounded-lg transition-colors text-xs font-medium',
                      isActive
                        ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                        : 'text-outline-variant hover:bg-surface-container-highest/10 hover:text-surface-container-lowest'
                    )
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                    {!isCollapsed && <span>Billing Statements</span>}
                  </div>
                </NavLink>
              </div>
            )}
          </nav>

        {/* Footer info & Switch Role Drawer - Pinned at bottom */}
        <div className="p-space-base border-t border-outline/20 space-y-space-sm shrink-0">

          {/* Quick Role Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setRoleSwitchOpen(!roleSwitchOpen)}
              className="w-full flex items-center justify-between px-space-sm py-space-xs bg-surface-container-lowest/5 hover:bg-surface-container-lowest/10 rounded-lg text-outline-variant hover:text-surface-container-lowest transition-colors text-left"
              title="Switch Role Demo"
            >
              <div className="flex items-center gap-space-xs truncate">
                <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                {!isCollapsed && (
                  <span className="text-xs font-medium truncate">
                    Switch Role ({ROLE_LABELS[user?.role] || user?.role})
                  </span>
                )}
              </div>
              {!isCollapsed && <span className="material-symbols-outlined text-[16px]">expand_more</span>}
            </button>

            {roleSwitchOpen && (
              <div className="absolute bottom-12 left-0 w-56 bg-inverse-surface border border-outline/30 rounded-xl shadow-modal p-1.5 z-50 animate-slide-up">
                <p className="px-2 py-1 text-[10px] font-bold text-outline-variant uppercase tracking-wider">
                  Select User Role
                </p>
                {APP_ROLES.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => handleSwitchRole(acc)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                      user?.role === acc.id
                        ? 'bg-primary text-on-primary font-semibold'
                        : 'text-outline-variant hover:text-surface-container-lowest hover:bg-surface-container-highest/10'
                    }`}
                  >
                    <span>{acc.label}</span>
                    {user?.role === acc.id && <span className="text-[10px]">Active</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
