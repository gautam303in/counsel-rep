import React, { useState } from 'react';
import {
  Building,
  IndianRupee,
  Landmark,
  Mail,
  Phone,
  Plus,
  Scale,
  Search,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateMatterFinancials, formatCurrency } from '../../services/financials';
import { Client } from '../../types';

export const ClientsView: React.FC = () => {
  const {
    clients,
    matters,
    timeEntries,
    expenses,
    invoices,
    payments,
    trustTransactions,
    setActiveMatterId,
    setCurrentView,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.primaryContactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-legal-heading text-slate-100 flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-400" />
            Corporate Clients & Institutional Accounts
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Client relationship dossiers, billing agreements, and aggregated account balances
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by client name, industry, or contact..."
          className="w-full bg-slate-900 border border-slate-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      {/* Client Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredClients.map((client) => {
          const clientMatters = matters.filter((m) => m.clientId === client.id);

          // Aggregate financials across all matters of this client
          let totalWip = 0;
          let totalBilled = 0;
          let totalPaid = 0;
          let totalTrust = 0;

          clientMatters.forEach((m) => {
            const f = calculateMatterFinancials(
              m.id,
              timeEntries,
              expenses,
              invoices,
              payments,
              trustTransactions
            );
            totalWip += f.unbilledWip;
            totalBilled += f.billed;
            totalPaid += f.paid;
            totalTrust += f.trustBalance;
          });

          const totalAr = Math.max(0, totalBilled - totalPaid);

          return (
            <div
              key={client.id}
              className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-amber-400 tracking-wider">
                    {client.industry} · Tier: {client.billingTier}
                  </span>
                  <h3 className="text-base font-bold text-slate-100 mt-0.5">{client.name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">{client.address}</div>
                </div>

                <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/60">
                  <ShieldCheck className="w-3 h-3" />
                  Conflict Cleared
                </span>
              </div>

              {/* Primary Contact */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-semibold">{client.primaryContactName}</span>
                  <span className="text-[10px] text-slate-500">({client.primaryContactTitle})</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{client.primaryContactEmail}</span>
                </div>
              </div>

              {/* Aggregate Financial Metrics */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-950/40 border border-slate-800/60 rounded p-2">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                    Unbilled WIP
                  </div>
                  <div className="text-sm font-semibold font-num text-amber-300 mt-0.5">
                    {formatCurrency(totalWip)}
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-800/60 rounded p-2">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                    Outstanding A/R
                  </div>
                  <div className="text-sm font-semibold font-num text-rose-300 mt-0.5">
                    {formatCurrency(totalAr)}
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-800/60 rounded p-2">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                    Escrow Trust
                  </div>
                  <div className="text-sm font-semibold font-num text-sky-300 mt-0.5">
                    {formatCurrency(totalTrust)}
                  </div>
                </div>
              </div>

              {/* Active Matters List */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Active Client Matters ({clientMatters.length})
                </div>
                {clientMatters.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setActiveMatterId(m.id);
                      setCurrentView('matters');
                    }}
                    className="flex items-center justify-between p-2 rounded bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/50 cursor-pointer transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-amber-400">{m.matterNumber}</span>
                      <span className="font-medium text-slate-200 truncate max-w-[280px]">
                        {m.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">
                      {m.practiceArea}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
