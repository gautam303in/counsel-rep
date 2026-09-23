import React from 'react';
import {
  Building,
  Clock,
  Cloud,
  ExternalLink,
  Globe,
  HardDrive,
  IndianRupee,
  Key,
  LogOut,
  Monitor,
  Moon,
  RotateCcw,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
  Sun,
  Trash2,
  UploadCloud,
  Users,
} from 'lucide-react';
import { MainNavView, useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    currentUser,
    ethicalWalls,
    matters,
    currentTenant,
    theme,
    toggleTheme,
    logout,
  } = useApp();

  // Check if current user is screened from any matter
  const userScreens = ethicalWalls.filter((w) => w.active && w.userId === currentUser.id);

  const isDark = theme === 'dark';

  const navItems: Array<{
    id: MainNavView;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
  }> = [
    { id: 'dashboard', label: 'Practice Overview', icon: Cloud },
    { id: 'matters', label: 'My Repos & Matters', icon: HardDrive, badge: matters.length },
    { id: 'vault', label: 'Counsel Repos Vault', icon: Clock },
    { id: 'billing', label: 'Billing Center (₹ INR)', icon: Trash2 },
    { id: 'trust', label: 'IOLTA Trust Ledger', icon: Star },
    {
      id: 'conflicts',
      label: 'Conflict & Screens',
      icon: Users,
      badge: userScreens.length > 0 ? `${userScreens.length} Screen` : undefined,
    },
    { id: 'admin', label: 'Portal Admin & RBAC', icon: RotateCcw },
  ];

  return (
    <aside
      className={`w-64 border-r flex flex-col shrink-0 select-none z-20 relative font-sans transition-colors duration-200 ${
        isDark
          ? 'bg-[#0a1532] border-slate-800/80 text-slate-100'
          : 'bg-[#102347] border-slate-300 text-slate-100'
      }`}
    >
      {/* Brand Header: Counsel Repos */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          {/* Triangular Brand Mark */}
          <div className="w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 87.3 78" className="w-7 h-7 drop-shadow-sm">
              <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.9 2.5 3.2 3.3l12.3-21.3H1.45c0 1.6.4 3.1 1.2 4.5z" fill="#2563eb" />
              <path d="M43.65 25 29.1 0c-1.3.8-2.4 1.9-3.2 3.3L1.45 45.45c-.8 1.4-1.2 2.9-1.2 4.5h24.55z" fill="#60a5fa" />
              <path d="m73.55 76.8c1.3-.8 2.4-1.9 3.2-3.3l1.6-2.75c.8-1.4 1.2-2.9 1.2-4.5H54.4l5.3 9.2c1.3.9 2.6 1.3 4.1 1.35z" fill="#3b82f6" opacity="0.9" />
              <path d="M43.65 25 58.2 0c-1.6 0-3.2.4-4.6 1.25L32.4 20.35 43.65 25z" fill="#93c5fd" opacity="0.8" />
              <path d="M54.4 55.45H25.95l-12.3 21.35c1.4.8 2.9 1.2 4.55 1.2h50.85c1.6 0 3.1-.4 4.5-1.2z" fill="#2563eb" />
              <path d="m85.85 45.45-14.5-25.1c-.8-1.4-1.9-2.5-3.2-3.3L54.4 55.45h25.15c0-1.6-.4-3.1-1.2-4.5z" fill="#60a5fa" opacity="0.85" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white flex items-center gap-1">
              Counsel Repos
            </h1>
            <span className="text-[10px] text-blue-400 tracking-wider font-semibold uppercase">
              Legal DMS & Practice OS
            </span>
          </div>
        </div>

        {/* Active Firm / Tenant Subtitle */}
        <div className="mt-3 px-3 py-1.5 rounded-xl bg-blue-950/60 border border-blue-800/40 text-[11px] flex items-center justify-between">
          <span className="truncate font-semibold text-blue-200">{currentTenant.name}</span>
          <span className="text-[9px] font-bold text-blue-400 uppercase bg-blue-900/60 px-1.5 py-0.5 rounded">
            {currentTenant.plan}
          </span>
        </div>
      </div>

      {/* Upload New Files Pill Button */}
      <div className="px-6 py-2">
        <button
          onClick={() => {
            setCurrentView('vault');
          }}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 px-5 rounded-full shadow-lg shadow-blue-900/40 transition-all duration-200 flex items-center justify-center gap-2 active:scale-98"
        >
          <UploadCloud className="w-4 h-4 text-white" />
          <span>Upload New Files</span>
        </button>
      </div>

      {/* Primary Navigation Links */}
      <div className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
        {/* Super Admin Tab (If authorized) */}
        {currentUser.role === 'SUPER_ADMIN' && (
          <button
            onClick={() => setCurrentView('super-admin')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all mb-2 ${
              currentView === 'super-admin'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/40 border border-purple-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>SaaS Licensing Console</span>
            </div>
            <span className="text-[9px] bg-purple-900 text-purple-200 px-1.5 py-0.5 rounded font-bold uppercase">
              Master
            </span>
          </button>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentView === item.id ||
            (item.id === 'matters' && currentView === 'matter-detail');
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/30 text-white border border-blue-500/40 shadow-xs font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-blue-300 font-medium font-num">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Client Portal Mode Button */}
        <div className="pt-2">
          <button
            onClick={() => setCurrentView('client-portal')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
              currentView === 'client-portal' || currentView === 'portal'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-md'
                : 'text-emerald-400/90 hover:text-emerald-300 hover:bg-emerald-950/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Client Portal</span>
            </div>
            <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold px-1.5 py-0.5 rounded-full uppercase">
              Live
            </span>
          </button>
        </div>
      </div>

      {/* Ethical Wall Warning if screened */}
      {userScreens.length > 0 && (
        <div className="mx-4 mb-2 p-2.5 bg-amber-950/30 border border-amber-800/40 rounded-xl text-[11px] text-amber-200 leading-tight">
          <div className="flex items-center gap-1.5 font-semibold text-amber-400 mb-0.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Ethical Screening</span>
          </div>
          Screened from {userScreens.length} matter(s) under ABA 1.10.
        </div>
      )}

      {/* SaaS Licensing & Quota Strip */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/70 space-y-3">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
          <span>Licensing & Seats</span>
          <span className="text-blue-400 font-num font-bold">
            {currentTenant.seatsAllocated}/{currentTenant.maxSeats}
          </span>
        </div>

        {/* Seat Quota Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              currentTenant.seatsAllocated >= currentTenant.maxSeats ? 'bg-amber-500' : 'bg-blue-500'
            }`}
            style={{
              width: `${Math.min(
                100,
                (currentTenant.seatsAllocated / currentTenant.maxSeats) * 100
              )}%`,
            }}
          />
        </div>

        {/* Theme & Logout Controls */}
        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={`Toggle ${isDark ? 'Light' : 'Dark'} mode`}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px]">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px]">Dark Mode</span>
              </>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            title="Log out of system"
            className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[11px]">Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
