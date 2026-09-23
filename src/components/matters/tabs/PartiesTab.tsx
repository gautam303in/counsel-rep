import React, { useState } from 'react';
import { CheckCircle2, Flag, Mail, Phone, Plus, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Matter, MatterParty } from '../../../types';

interface Props {
  matter: Matter;
}

export const PartiesTab: React.FC<Props> = ({ matter }) => {
  const { parties } = useApp();
  const matterParties = parties.filter((p) => p.matterId === matter.id);

  const [filterRole, setFilterRole] = useState<string>('ALL');

  const filteredParties = filterRole === 'ALL'
    ? matterParties
    : matterParties.filter((p) => p.role === filterRole);

  const rolesList = ['ALL', 'Client', 'Opposing Party', 'Co-Counsel', 'Opposing Counsel', 'Judge', 'Expert Witness'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            Matter Parties, Witnesses & Counsel
          </h3>
          <p className="text-xs text-slate-400">
            Factual entities, adverse parties, experts and conflict check verification records
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-md border border-slate-800">
          {rolesList.map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                filterRole === role
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredParties.map((party) => {
          const isConflictCleared = party.conflictStatus === 'CLEARED';
          return (
            <div
              key={party.id}
              className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold block">
                    {party.role}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-100 mt-0.5">{party.name}</h4>
                  {party.organization && (
                    <div className="text-xs text-slate-400">{party.organization}</div>
                  )}
                </div>

                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded border flex items-center gap-1 ${
                    isConflictCleared
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                      : 'bg-amber-950/40 text-amber-400 border-amber-800/60'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  {party.conflictStatus}
                </span>
              </div>

              {(party.email || party.phone) && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs text-slate-400">
                  {party.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-300 font-mono text-[11px] truncate">{party.email}</span>
                    </div>
                  )}
                  {party.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-300 font-mono text-[11px]">{party.phone}</span>
                    </div>
                  )}
                </div>
              )}

              {party.notes && (
                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/60 italic">
                  "{party.notes}"
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
