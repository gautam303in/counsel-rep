import React, { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Building,
  Check,
  ChevronDown,
  Clock,
  HelpCircle,
  LogOut,
  Moon,
  Pause,
  Play,
  Save,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Trash2,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/financials';
import { UTBMSCode } from '../../types';

const UTBMS_OPTIONS: UTBMSCode[] = [
  'A101 - Plan and prepare for',
  'A102 - Research',
  'A103 - Draft/revise',
  'A104 - Review/analyze',
  'A105 - Communicate (in firm)',
  'A106 - Communicate (with client)',
  'A107 - Communicate (other)',
  'A108 - Attend proceeding',
  'L110 - Fact Investigation/Development',
  'L120 - Analysis/Strategy',
  'L240 - Dispositive Motions',
];

export const TopBar: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    users,
    isTimerRunning,
    timerSeconds,
    timerMatterId,
    timerNarrative,
    timerUtbms,
    startTimer,
    pauseTimer,
    setTimerMatterId,
    setTimerNarrative,
    setTimerUtbms,
    saveTimerEntry,
    discardTimer,
    matters,
    setCurrentView,
    ethicalWalls,
    currentTenant,
    theme,
    toggleTheme,
    logout,
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showTimerDetails, setShowTimerDetails] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);

  // Format seconds into HH:MM:SS
  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const selectedMatter = matters.find((m) => m.id === timerMatterId);

  // Ethical wall alerts for current user
  const activeScreenedMatters = ethicalWalls
    .filter((w) => w.active && w.userId === currentUser.id)
    .map((w) => w.matterNumber);

  const isDark = theme === 'dark';

  return (
    <header
      className={`h-16 border-b px-4 md:px-6 flex items-center justify-between z-30 shrink-0 select-none font-sans transition-colors duration-200 ${
        isDark
          ? 'bg-slate-900 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      {/* Left Area: Search Input + Tenant Badge */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Tenant Pill */}
        <div
          onClick={() => {
            if (currentUser.role === 'SUPER_ADMIN') {
              setCurrentView('super-admin');
            } else {
              setCurrentView('admin');
            }
          }}
          title="Current Tenant Firm · Click to manage"
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border transition-colors ${
            isDark
              ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-blue-500/50'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-blue-400'
          }`}
        >
          <Building className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="truncate max-w-[130px]">{currentTenant.name}</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 font-bold uppercase">
            {currentTenant.plan}
          </span>
        </div>

        {/* Global Search Pill */}
        <button
          onClick={() => setCurrentView('search')}
          className={`flex items-center gap-3 px-4 py-1.5 rounded-full border text-xs transition-all w-full max-w-sm shadow-inner ${
            isDark
              ? 'bg-slate-950/80 hover:bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-700'
          }`}
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="truncate font-normal">Search Counsel Repos...</span>
          <span className="text-[10px] text-slate-500 font-mono ml-auto bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-700/50 shadow-xs">
            ⌘K
          </span>
        </button>

        {activeScreenedMatters.length > 0 && (
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/50 border border-amber-800/60 text-[11px] text-amber-300 font-medium whitespace-nowrap">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Screened: {activeScreenedMatters.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Right Controls: Timer Pill + Super Admin Badge + Theme Toggle + User + Logout */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Practice Live Billing Timer */}
        <div className="relative hidden sm:block">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all ${
              isTimerRunning
                ? 'bg-blue-950/70 border-blue-500/60 text-blue-300 shadow-sm shadow-blue-900/30'
                : timerSeconds > 0
                ? isDark
                  ? 'bg-slate-950 border-slate-700 text-slate-200'
                  : 'bg-slate-100 border-slate-300 text-slate-800'
                : isDark
                ? 'bg-slate-950/80 border-slate-800 text-slate-400'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${isTimerRunning ? 'text-blue-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="font-num tracking-wide font-semibold text-xs">
              {formatTimer(timerSeconds)}
            </span>

            {isTimerRunning ? (
              <button
                onClick={pauseTimer}
                title="Pause Timer"
                className="p-1 hover:bg-blue-900/50 rounded-full text-blue-300 transition-colors"
              >
                <Pause className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={() => startTimer(timerMatterId)}
                title="Start Timer"
                className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Play className="w-3 h-3" />
              </button>
            )}

            <button
              onClick={() => setShowTimerDetails(!showTimerDetails)}
              className="text-[11px] text-slate-400 hover:text-slate-200 border-l border-slate-800 pl-2 flex items-center gap-1"
            >
              <span className="truncate max-w-[75px] font-medium">
                {selectedMatter ? selectedMatter.matterNumber : 'Matter'}
              </span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {timerSeconds > 0 && (
              <div className="flex items-center gap-1 border-l border-slate-800 pl-1.5">
                <button
                  onClick={saveTimerEntry}
                  title="Commit to WIP"
                  className="p-1 hover:bg-emerald-950/80 text-emerald-400 rounded-full transition-colors"
                >
                  <Save className="w-3 h-3" />
                </button>
                <button
                  onClick={discardTimer}
                  title="Discard Timer"
                  className="p-1 hover:bg-red-950/80 text-slate-500 hover:text-red-400 rounded-full transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Timer Details Popover */}
          {showTimerDetails && (
            <div
              className={`absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-2xl p-4 z-50 space-y-3 border ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-100'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-semibold">Active Time Entry</span>
                <span className="text-[11px] text-blue-400 font-num font-semibold">
                  WIP: {formatCurrency(Math.round((timerSeconds / 3600) * currentUser.billingRate))}
                </span>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Target Matter
                </label>
                <select
                  value={timerMatterId}
                  onChange={(e) => setTimerMatterId(e.target.value)}
                  className={`w-full rounded-xl px-2.5 py-1.5 text-xs focus:outline-none border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-200'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  {matters.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.matterNumber} — {m.title.slice(0, 32)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  UTBMS Task Code
                </label>
                <select
                  value={timerUtbms}
                  onChange={(e) => setTimerUtbms(e.target.value as UTBMSCode)}
                  className={`w-full rounded-xl px-2.5 py-1.5 text-xs focus:outline-none border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-200'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  {UTBMS_OPTIONS.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Billing Narrative
                </label>
                <textarea
                  rows={2}
                  value={timerNarrative}
                  onChange={(e) => setTimerNarrative(e.target.value)}
                  placeholder="Describe legal work performed..."
                  className={`w-full rounded-xl p-2 text-xs focus:outline-none resize-none border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-200'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowTimerDetails(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    saveTimerEntry();
                    setShowTimerDetails(false);
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl transition-colors shadow-sm"
                >
                  Commit Entry
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Super Admin Console Button */}
        {currentUser.role === 'SUPER_ADMIN' && (
          <button
            onClick={() => setCurrentView('super-admin')}
            title="Super Admin Licensing Engine"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-full text-xs font-semibold transition-all shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">SaaS Licensing</span>
          </button>
        )}

        {/* Light / Dark Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} theme`}
          className={`p-2 rounded-full border transition-all ${
            isDark
              ? 'bg-slate-950 border-slate-800 text-amber-300 hover:bg-slate-800'
              : 'bg-slate-100 border-slate-200 text-blue-600 hover:bg-slate-200'
          }`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => setHasNotifications(false)}
          title="Notifications"
          className={`relative p-2 rounded-full transition-colors ${
            isDark
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          {hasNotifications && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-slate-900" />
          )}
        </button>

        {/* Settings Icon */}
        <button
          onClick={() => setCurrentView('admin')}
          title="RBAC & Firm Settings"
          className={`p-2 rounded-full transition-colors ${
            isDark
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Pill & Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className={`flex items-center gap-2 pl-2.5 pr-1 py-1 rounded-full border transition-colors group ${
              isDark
                ? 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <div className="text-left hidden sm:block">
              <span className="text-xs font-semibold block leading-tight">
                {currentUser.name.split(' ')[0]}
              </span>
              <span className="text-[9px] uppercase font-bold text-blue-400 block leading-tight">
                {currentUser.role.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {currentUser.name[0]}
            </div>
          </button>

          {/* User Selector Dropdown */}
          {showUserDropdown && (
            <div
              className={`absolute right-0 top-full mt-2 w-72 rounded-2xl shadow-2xl p-2 z-50 space-y-1 border ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-100'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="px-3 py-2 border-b border-slate-800">
                <div className="text-xs font-bold">{currentUser.name}</div>
                <div className="text-[11px] text-slate-400">
                  {currentUser.role.replace(/_/g, ' ')} · {formatCurrency(currentUser.billingRate)}/hr
                </div>
                <div className="text-[10px] text-blue-400 font-mono mt-0.5">
                  Tenant: {currentTenant.name}
                </div>
              </div>

              <div className="py-1">
                <div className="px-3 py-1 text-[10px] uppercase font-semibold text-slate-500">
                  Switch Active Persona
                </div>
                {users.map((u) => {
                  const isSelected = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                        isSelected
                          ? 'bg-blue-950/60 text-blue-300 font-semibold border border-blue-800/50'
                          : isDark
                          ? 'hover:bg-slate-800/80 text-slate-300'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div>
                        <div>{u.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {u.role.replace(/_/g, ' ')} · {formatCurrency(u.billingRate)}/hr
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                    </button>
                  );
                })}
              </div>

              {/* Logout Button in User Dropdown */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of Counsel Repos</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Distinct Logout Button in TopBar */}
        <button
          onClick={logout}
          title="Sign Out / Log Out"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
            isDark
              ? 'bg-slate-950 hover:bg-rose-950/60 border-slate-800 hover:border-rose-800 text-slate-400 hover:text-rose-300'
              : 'bg-slate-100 hover:bg-rose-50 border-slate-200 hover:border-rose-300 text-slate-600 hover:text-rose-600'
          }`}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Log Out</span>
        </button>
      </div>
    </header>
  );
};
