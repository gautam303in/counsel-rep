import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Building,
  CheckCircle2,
  FileCheck,
  Plus,
  Scale,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EthicalWall } from '../../types';

export const ConflictManagementView: React.FC = () => {
  const {
    ethicalWalls,
    addEthicalWall,
    toggleEthicalWall,
    parties,
    matters,
    clients,
    users,
    logAudit,
    currentUser,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    { type: string; name: string; matter: string; role: string; risk: 'HIGH' | 'MEDIUM' | 'CLEAR' }[]
  >([]);
  const [hasSearched, setHasSearched] = useState(false);

  // New Wall Modal
  const [showAddWallModal, setShowAddWallModal] = useState(false);
  const [selectedMatterId, setSelectedMatterId] = useState(matters[0]?.id || '');
  const [selectedUserId, setSelectedUserId] = useState(users[2]?.id || '');
  const [reason, setReason] = useState(
    'Prior direct representation of opposing party while at previous law firm (Model Rule 1.10)'
  );

  const handleRunSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const term = searchQuery.toLowerCase();
    const hits: typeof searchResults = [];

    // Search parties
    parties.forEach((p) => {
      if (
        p.name.toLowerCase().includes(term) ||
        (p.organization && p.organization.toLowerCase().includes(term))
      ) {
        const m = matters.find((item) => item.id === p.matterId);
        const isAdverse = p.role.includes('Opposing') || p.role.includes('Adverse');
        hits.push({
          type: 'Party / Entity',
          name: p.name,
          matter: m ? `[${m.matterNumber}] ${m.title}` : 'General Record',
          role: p.role,
          risk: isAdverse ? 'HIGH' : 'MEDIUM',
        });
      }
    });

    // Search clients
    clients.forEach((c) => {
      if (c.name.toLowerCase().includes(term)) {
        hits.push({
          type: 'Current Client',
          name: c.name,
          matter: 'Existing Institutional Account',
          role: 'Client',
          risk: 'HIGH',
        });
      }
    });

    setSearchResults(hits);
    setHasSearched(true);

    logAudit(
      'CONFLICT_CHECK_RUN',
      'System',
      'conflicts',
      `Conflict clearance query executed for "${searchQuery}" (${hits.length} hits identified).`
    );
  };

  const handleCreateWall = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMatter = matters.find((m) => m.id === selectedMatterId);
    const targetUser = users.find((u) => u.id === selectedUserId);
    if (!targetMatter || !targetUser) return;

    addEthicalWall({
      matterId: targetMatter.id,
      matterNumber: targetMatter.matterNumber,
      userId: targetUser.id,
      userName: targetUser.name,
      reason,
      active: true,
      screenedDate: new Date().toISOString().split('T')[0],
      authorizedBy: currentUser.name,
    });

    setShowAddWallModal(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-legal-heading text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            Conflict Management & Ethical Wall Architecture
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time adverse party clearing, ABA Model Rule 1.10 screening, and forensic audit logs
          </p>
        </div>

        <button
          onClick={() => setShowAddWallModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-slate-950 font-semibold text-xs rounded-lg hover:bg-amber-400 transition-colors shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Erect New Ethical Wall</span>
        </button>
      </div>

      {/* Real-time Conflict Search Engine Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Universal Conflict Clearance Query Engine
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Searches: Active Parties, Adverse Entities, Former Clients, Witnesses, Judges
          </span>
        </div>

        <form onSubmit={handleRunSearch} className="flex gap-2">
          <input
            type="text"
            required
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prospective party, corporation, executive or counsel (e.g. 'Synthex', 'Horizon', 'Vance')..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 text-slate-950 font-semibold text-xs rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Execute Conflict Check</span>
          </button>
        </form>

        {hasSearched && (
          <div className="pt-2 space-y-3">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Query Results for "{searchQuery}"</span>
              <span className="font-num text-amber-400">{searchResults.length} Matches Found</span>
            </div>

            {searchResults.length === 0 ? (
              <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-4 flex items-center gap-3 text-xs text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <strong>No Conflicts Detected:</strong> The queried entity "{searchQuery}" has no
                  active adverse engagements or prior representation conflicts on file. Ready for
                  formal partner intake clearance.
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((hit, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100">{hit.name}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                          {hit.type}
                        </span>
                        <span className="text-slate-400">· {hit.role}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{hit.matter}</div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        hit.risk === 'HIGH'
                          ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                          : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                      }`}
                    >
                      {hit.risk} Conflict Risk
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Ethical Walls Manager */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Active Ethical Screening Walls (Firm Security Ceiling)
          </h2>
          <span className="text-xs text-slate-400">
            System enforces isolation across search, documents, time entries, and AI processing
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ethicalWalls.map((wall) => (
            <div
              key={wall.id}
              className={`bg-slate-900/90 border rounded-xl p-5 space-y-3 transition-colors ${
                wall.active ? 'border-amber-900/60' : 'border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {wall.matterNumber}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                        wall.active
                          ? 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {wall.active ? 'SCREEN IN EFFECT' : 'INACTIVE'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 mt-1">
                    Screened Attorney: {wall.userName}
                  </h3>
                </div>

                <button
                  onClick={() => toggleEthicalWall(wall.id)}
                  className="text-xs text-slate-400 hover:text-slate-200 underline font-mono"
                >
                  {wall.active ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>

              <div className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                <span className="font-semibold text-slate-200">Legal Justification: </span>
                {wall.reason}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Authorized By: {wall.authorizedBy}</span>
                <span>Screened Since: {wall.screenedDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Erect New Wall Modal */}
      {showAddWallModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Erect New Ethical Screening Barrier
            </h3>
            <p className="text-xs text-slate-400">
              Isolates the designated individual from all matter records, searches, vault documents,
              financial items, and AI context.
            </p>

            <form onSubmit={handleCreateWall} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Target Matter to Screen
                </label>
                <select
                  value={selectedMatterId}
                  onChange={(e) => setSelectedMatterId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  {matters.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.matterNumber} — {m.title.slice(0, 35)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Screened Personnel
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  {users
                    .filter((u) => u.role !== 'CLIENT_CONTACT')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role.replace(/_/g, ' ')})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Model Rule 1.10 Ethical Wall Justification
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Attorney previously participated in opposing counsel discussions at prior firm..."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddWallModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-500 text-slate-950 font-medium text-xs rounded hover:bg-amber-400"
                >
                  Confirm & Seal Ethical Wall
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
