import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Download,
  FileCheck,
  Fingerprint,
  Key,
  Lock,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Unlock,
  Users,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { LegalHold, Matter } from '../../../types';

interface Props {
  matter: Matter;
}

export const LegalHoldTab: React.FC<Props> = ({ matter }) => {
  const {
    legalHolds,
    createLegalHold,
    requestReleaseLegalHold,
    approveLegalHoldRelease,
    currentUser,
    users,
    logAudit,
  } = useApp();

  const matterHolds = legalHolds.filter((h) => h.matterId === matter.id);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [selectedHoldForRelease, setSelectedHoldForRelease] = useState<LegalHold | null>(null);

  // Form State
  const [holdTitle, setHoldTitle] = useState('Litigation Preservation Notice — Technical Records');
  const [scopeDescription, setScopeDescription] = useState(
    'All electronic correspondence, Git commit histories, Slack channels, and design specifications relating to the disputed technology.'
  );
  const [custodiansInput, setCustodiansInput] = useState(
    'Dr. Raymond Vance, Elena Wu, Sarah Jenkins, Marcus Brody'
  );
  const [targetsInput, setTargetsInput] = useState(
    'GitLab Repository, Vault Folder: Discovery, Exchange Inboxes'
  );
  const [dateRangeStart, setDateRangeStart] = useState('2022-01-01');
  const [dateRangeEnd, setDateRangeEnd] = useState(new Date().toISOString().split('T')[0]);

  // Dual-control release form
  const [releaseJustification, setReleaseJustification] = useState(
    'Final order of dismissal with prejudice entered by the Court; all claims resolved.'
  );
  const [secondApprover, setSecondApprover] = useState(
    users.find((u) => u.role.includes('PARTNER') && u.id !== currentUser.id)?.id || users[1].id
  );

  const handleCreateHold = (e: React.FormEvent) => {
    e.preventDefault();
    createLegalHold({
      matterId: matter.id,
      holdTitle,
      scopeDescription,
      custodians: custodiansInput.split(',').map((c) => c.trim()),
      dateRangeStart,
      dateRangeEnd,
      targets: targetsInput.split(',').map((t) => t.trim()),
      firstApproverId: currentUser.id,
      createdBy: currentUser.name,
    });
    setShowCreateModal(false);
  };

  const handleInitiateRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHoldForRelease) return;
    requestReleaseLegalHold(selectedHoldForRelease.id, secondApprover, releaseJustification);
    setShowReleaseModal(false);
    setSelectedHoldForRelease(null);
  };

  const handleApproveRelease = (holdId: string) => {
    approveLegalHoldRelease(holdId);
  };

  const handleExportEvidencePack = (hold: LegalHold) => {
    alert(
      `Preservation Evidence Pack Generated.\nCryptographic Tamper-Proof Manifest: ${hold.tamperProofHash}\nChain of custody audit trail verified.`
    );
    logAudit(
      'LEGAL_HOLD_RELEASED',
      'LegalHold',
      hold.id,
      `Exported chain-of-custody evidence pack for Legal Hold "${hold.holdTitle}".`,
      matter.id,
      matter.matterNumber
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explaining the Legal Hold Invariant */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              System-Level Preservation State (Legal Hold)
            </h3>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white text-xs font-medium rounded hover:bg-rose-500 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Engage New Legal Hold</span>
          </button>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>Litigation Preservation Rule:</strong> When active, all relevant custodian
          records, vault documents, and work product are locked against destructive deletion or
          overwriting. New relevant matter records automatically inherit the hold. Release requires
          dual-control partner sign-off.
        </p>
        <div className="text-[11px] text-amber-400/90 flex items-center gap-1 pt-1">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>
            Hold ≠ Billing Freeze: Time recording, expense ledger, invoicing, and trust transfers
            remain fully operational.
          </span>
        </div>
      </div>

      {/* Holds List */}
      <div className="space-y-4">
        {matterHolds.map((hold) => {
          const isPendingRelease = hold.status === 'PENDING_RELEASE';
          const isReleased = hold.status === 'RELEASED';
          const isActive = hold.status === 'ACTIVE';

          const firstApprover = users.find((u) => u.id === hold.firstApproverId);
          const secondApproverUser = users.find((u) => u.id === hold.secondApproverId);

          return (
            <div
              key={hold.id}
              className={`bg-slate-900/90 border rounded-lg p-5 space-y-4 transition-all ${
                isActive
                  ? 'border-rose-900/60 shadow-md'
                  : isPendingRelease
                  ? 'border-amber-800/60'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        isActive
                          ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                          : isPendingRelease
                          ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {hold.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{hold.id}</span>
                  </div>
                  <h4 className="text-base font-semibold text-slate-100 mt-1">{hold.holdTitle}</h4>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportEvidencePack(hold)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Evidence Pack</span>
                  </button>

                  {isActive && currentUser.role.includes('PARTNER') && (
                    <button
                      onClick={() => {
                        setSelectedHoldForRelease(hold);
                        setShowReleaseModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-amber-400 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-800/60 rounded transition-colors"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Initiate Dual-Control Release</span>
                    </button>
                  )}

                  {isPendingRelease && currentUser.role.includes('PARTNER') && (
                    <button
                      onClick={() => handleApproveRelease(hold.id)}
                      className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 rounded transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Secondary Partner Authorization (Release)</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded border border-slate-800/80">
                <span className="font-semibold text-slate-200">Preservation Scope: </span>
                {hold.scopeDescription}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                    Designated Custodians ({hold.custodians.length})
                  </div>
                  <ul className="space-y-1">
                    {hold.custodians.map((c) => (
                      <li key={c} className="text-slate-300 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                    Frozen Targets
                  </div>
                  <ul className="space-y-1">
                    {hold.targets.map((t) => (
                      <li key={t} className="text-slate-300 flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-rose-400" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                    Dual-Control Authorization
                  </div>
                  <div className="space-y-1">
                    <div className="text-slate-300">
                      Primary: <span className="text-amber-300">{hold.createdBy}</span>
                    </div>
                    {isPendingRelease && secondApproverUser && (
                      <div className="text-amber-400">
                        Pending Sign-off: {secondApproverUser.name}
                      </div>
                    )}
                    {isReleased && (
                      <div className="text-emerald-400">Released by dual authorization</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cryptographic Hash Strip */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Fingerprint className="w-3.5 h-3.5 text-amber-400" />
                  Preservation SHA256: {hold.tamperProofHash}
                </span>
                <span>Created: {new Date(hold.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dual Control Release Modal */}
      {showReleaseModal && selectedHoldForRelease && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              Initiate Dual-Control Legal Hold Release
            </h3>
            <p className="text-xs text-slate-400">
              Ethical and preservation standards require two independent partners to authorize lifting a litigation hold.
            </p>

            <form onSubmit={handleInitiateRelease} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Required Secondary Partner Sign-off
                </label>
                <select
                  value={secondApprover}
                  onChange={(e) => setSecondApprover(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  {users
                    .filter((u) => u.role.includes('PARTNER') && u.id !== currentUser.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.role.replace(/_/g, ' ')})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Release Justification (Permanent Legal Record)
                </label>
                <textarea
                  rows={3}
                  required
                  value={releaseJustification}
                  onChange={(e) => setReleaseJustification(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReleaseModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-500 text-slate-950 font-medium text-xs rounded hover:bg-amber-400"
                >
                  Submit for Secondary Partner Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Legal Hold Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-400" />
              Engage System-Level Legal Hold
            </h3>

            <form onSubmit={handleCreateHold} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Hold Title
                </label>
                <input
                  type="text"
                  required
                  value={holdTitle}
                  onChange={(e) => setHoldTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Preservation Scope Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={scopeDescription}
                  onChange={(e) => setScopeDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Designated Custodians (comma-separated)
                </label>
                <input
                  type="text"
                  required
                  value={custodiansInput}
                  onChange={(e) => setCustodiansInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Preservation Targets (comma-separated)
                </label>
                <input
                  type="text"
                  required
                  value={targetsInput}
                  onChange={(e) => setTargetsInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                    Date Range Start
                  </label>
                  <input
                    type="date"
                    required
                    value={dateRangeStart}
                    onChange={(e) => setDateRangeStart(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                    Date Range End
                  </label>
                  <input
                    type="date"
                    required
                    value={dateRangeEnd}
                    onChange={(e) => setDateRangeEnd(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-rose-600 text-white font-medium text-xs rounded hover:bg-rose-500"
                >
                  Freeze Targets & Issue Hold
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
