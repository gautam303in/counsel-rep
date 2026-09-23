import React from 'react';
import { RbacManagementView } from './components/admin/RbacManagementView';
import { SuperAdminDashboard } from './components/admin/SuperAdminDashboard';
import { LoginModal } from './components/auth/LoginModal';
import { BillingCenterView } from './components/billing/BillingCenterView';
import { ClientsView } from './components/clients/ClientsView';
import { ConflictManagementView } from './components/conflicts/ConflictManagementView';
import { FirmDashboard } from './components/dashboard/FirmDashboard';
import { MattersDirectory } from './components/matters/MattersDirectory';
import { MatterWorkspace } from './components/matters/MatterWorkspace';
import { Sidebar } from './components/navigation/Sidebar';
import { TopBar } from './components/navigation/TopBar';
import { ClientPortalView } from './components/portal/ClientPortalView';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { TrustAccountingView } from './components/trust/TrustAccountingView';
import { FirmVaultView } from './components/vault/FirmVaultView';
import { UploadProgressDrawer } from './components/vault/UploadProgressDrawer';
import { AppProvider, useApp } from './context/AppContext';

const MainLayout: React.FC = () => {
  const { currentView, activeMatterId, isAuthenticated, theme } = useApp();

  const isDark = theme === 'dark';

  return (
    <div
      className={`h-screen w-screen p-2 sm:p-3 md:p-4 lg:p-5 flex items-center justify-center font-sans overflow-hidden select-none transition-colors duration-200 ${
        isDark ? 'bg-[#070c18]' : 'bg-[#e8edf5]'
      }`}
    >
      {/* Central Rounded Application Window */}
      <div
        className={`w-full h-full max-w-[1720px] rounded-[24px] md:rounded-[32px] overflow-hidden flex flex-row border transition-colors duration-200 shadow-2xl ${
          isDark
            ? 'bg-slate-900 border-slate-800/80 shadow-black/80'
            : 'bg-white border-slate-200 shadow-slate-400/40'
        }`}
      >
        {/* Left Curved Sidebar */}
        <Sidebar />

        {/* Main Content Pane */}
        <div
          className={`flex-1 flex flex-col min-w-0 overflow-hidden relative transition-colors duration-200 ${
            isDark ? 'bg-slate-950' : 'bg-[#fafcff]'
          }`}
        >
          {/* Top Control Bar */}
          <TopBar />

          {/* View Routing */}
          <main
            className={`flex-1 flex flex-col overflow-hidden relative transition-colors duration-200 ${
              isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#fafcff] text-slate-800'
            }`}
          >
            {currentView === 'super-admin' && <SuperAdminDashboard />}
            {currentView === 'dashboard' && <FirmDashboard />}
            {(currentView === 'matters' || currentView === 'matter-detail') && (
              activeMatterId ? <MatterWorkspace /> : <MattersDirectory />
            )}
            {currentView === 'clients' && <ClientsView />}
            {currentView === 'conflicts' && <ConflictManagementView />}
            {currentView === 'admin' && <RbacManagementView />}
            {currentView === 'vault' && <FirmVaultView />}
            {currentView === 'billing' && <BillingCenterView />}
            {currentView === 'trust' && <TrustAccountingView />}
            {(currentView === 'portal' || currentView === 'client-portal') && <ClientPortalView />}

            {/* Global Search Dialog (⌘K) */}
            <GlobalSearchModal />

            {/* Floating Uploading Drawer */}
            <UploadProgressDrawer />
          </main>
        </div>
      </div>

      {/* Login Gate Modal if logged out */}
      {!isAuthenticated && <LoginModal />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
