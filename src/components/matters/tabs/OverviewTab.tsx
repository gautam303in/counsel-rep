import React from 'react';
import {
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  Gavel,
  IndianRupee,
  Lock,
  Scale,
  ShieldAlert,
  UserCheck,
  Users,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Matter, MatterStatus } from '../../../types';
import { MatterFinancialStrip } from '../MatterFinancialStrip';

interface Props {
  matter: Matter;
}

const STATUS_STEPS: MatterStatus[] = [
  'INTAKE',
  'CONFLICT_CHECK',
  'APPROVAL',
  'MATTER_OPEN',
  'ACTIVE',
  'CLOSED',
  'ARCHIVED',
];

export const OverviewTab: React.FC<Props> = ({ matter }) => {
  const { users, clients, ethicalWalls } = useApp();

  const client = clients.find((c) => c.id === matter.clientId);
  const leadPartner = users.find((u) => u.id === matter.leadPartnerId);
  const assignedTeam = users.filter((u) => matter.assignedUserIds.includes(u.id));

  // Check if any ethical walls screen personnel from this matter
  const activeWalls = ethicalWalls.filter((w) => w.active && w.matterId === matter.id);

  const currentStepIndex = STATUS_STEPS.indexOf(matter.status);

  return (
    <div className="space-y-6">
      {/* Matter Financial Strip */}
      <MatterFinancialStrip matter={matter} />

      {/* Lifecycle Status Stepper */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4">
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-3">
          Matter Lifecycle Status
        </div>
        <div className="flex items-center justify-between relative overflow-x-auto pb-2">
          {STATUS_STEPS.map((step, idx) => {
            const isComplete = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step} className="flex flex-col items-center min-w-[90px] relative z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20'
                      : isComplete
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {isComplete ? '✓' : idx + 1}
                </div>
                <span
                  className={`text-[11px] mt-1.5 font-medium tracking-tight whitespace-nowrap ${
                    isCurrent ? 'text-amber-400 font-semibold' : isComplete ? 'text-slate-200' : 'text-slate-400'
                  }`}
                >
                  {step.replace(/_/g, ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Core Matter Attributes & Legal Team */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Case Dossier */}
        <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              Case Dossier & Court Docket
            </h3>
            {matter.hasActiveHold && (
              <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60 font-medium">
                <Lock className="w-3 h-3 text-amber-400" />
                Legal Hold Active
              </span>
            )}
          </div>

          <div className="text-xs text-slate-300 leading-relaxed">{matter.description}</div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80 text-xs">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Court / Venue</div>
              <div className="font-medium text-slate-200 mt-0.5">{matter.courtVenue || 'Private Forum'}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Presiding Judge</div>
              <div className="font-medium text-slate-200 mt-0.5">{matter.judge || 'Arbitrator Panel'}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Docket Number</div>
              <div className="font-mono text-slate-200 mt-0.5">{matter.caseDocketNumber || 'N/A'}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Fee Arrangement</div>
              <div className="font-medium text-amber-300 mt-0.5">{matter.feeArrangement}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Budget Cap</div>
              <div className="font-num text-slate-100 mt-0.5">
                {matter.budgetCap ? `₹${matter.budgetCap.toLocaleString('en-IN')}` : 'Uncapped'}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Evergreen Minimum</div>
              <div className="font-num text-sky-300 mt-0.5">
                ₹{matter.evergreenTrustMinimum.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Legal Team & Ethical Walls */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              Legal Team
            </h3>
            <span className="text-[10px] text-slate-400 font-num">{assignedTeam.length} Assigned</span>
          </div>

          <div className="space-y-3">
            {leadPartner && (
              <div className="p-2.5 rounded bg-slate-950/60 border border-amber-500/20">
                <div className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold mb-1">
                  Lead Trial Partner
                </div>
                <div className="text-xs font-medium text-slate-100">{leadPartner.name}</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {leadPartner.email} · ₹{leadPartner.billingRate}/hr
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Assigned Personnel</div>
              {assignedTeam
                .filter((u) => u.id !== matter.leadPartnerId)
                .map((user) => (
                  <div key={user.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/50">
                    <div>
                      <div className="font-medium text-slate-200">{user.name}</div>
                      <div className="text-[10px] text-slate-400">{user.role.replace(/_/g, ' ')}</div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">₹{user.billingRate}/hr</span>
                  </div>
                ))}
            </div>

            {/* Ethical Walls for this matter */}
            {activeWalls.length > 0 && (
              <div className="p-2.5 bg-red-950/30 border border-red-800/40 rounded text-[11px] text-red-300">
                <div className="flex items-center gap-1.5 font-semibold text-red-400 mb-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Ethical Wall In Effect</span>
                </div>
                {activeWalls.map((w) => (
                  <div key={w.id}>
                    Screened: <span className="font-medium text-white">{w.userName}</span> ({w.reason.slice(0, 60)}...)
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
