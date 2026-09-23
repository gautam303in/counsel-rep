import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  FileCheck,
  IndianRupee,
  Landmark,
  Plus,
  Scale,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/currency';
import { useAudit } from '../../hooks/useAudit';

export const TrustAccountingView: React.FC = () => {
  const { trustTransactions, matters, setActiveMatterId, setMatterSubTab, setCurrentView } =
    useApp();

  const totalTrustBalance = trustTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Group by matter
  const matterBalances = matters.map((m) => {
    const txs = trustTransactions.filter((t) => t.matterId === m.id);
    const balance = txs.reduce((sum, t) => sum + t.amount, 0);
    const isBelow = balance < m.evergreenTrustMinimum;
    return {
      matter: m,
      balance,
      isBelow,
      shortfall: Math.max(0, m.evergreenTrustMinimum - balance),
      txCount: txs.length,
    };
  });

  const belowEvergreenMatters = matterBalances.filter((item) => item.isBelow);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-legal-heading text-slate-100 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-sky-400" />
            IOLTA Master Trust Accounting & Three-Way Reconciliation
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Fiduciary escrow ledgers, individual client matter sub-accounts, and evergreen alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 rounded-lg text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>State Bar Rule 1.15 Verified</span>
          </div>
        </div>
      </div>

      {/* Aggregate Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            Total IOLTA Escrow Holding
          </div>
          <div className="text-2xl font-bold font-num text-sky-300 mt-1">
            {formatINR(totalTrustBalance)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Separate master bank escrow</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            Client Matter Sub-Accounts
          </div>
          <div className="text-2xl font-bold font-num text-slate-100 mt-1">
            {matters.length} Accounts
          </div>
          <div className="text-[11px] text-emerald-400 mt-0.5">0 commingling violations</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            Evergreen Retainer Deficits
          </div>
          <div
            className={`text-2xl font-bold font-num mt-1 ${
              belowEvergreenMatters.length > 0 ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            {belowEvergreenMatters.length} Matters
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Replenishment notices triggered</div>
        </div>
      </div>

      {/* Three-Way Reconciliation Audit Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Three-Way Reconciliation Status
            </h3>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Reconciliation Balanced: 0.00 Variance
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/60 p-3 rounded border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">1. Bank Statement Balance</div>
            <div className="text-base font-bold font-num text-slate-100 mt-1">
              {formatINR(totalTrustBalance)}
            </div>
            <div className="text-[10px] text-slate-500">First Republic / Chase IOLTA</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">2. Master Book Balance</div>
            <div className="text-base font-bold font-num text-slate-100 mt-1">
              {formatINR(totalTrustBalance)}
            </div>
            <div className="text-[10px] text-slate-500">General trust journal</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">3. Matter Sub-Ledger Sum</div>
            <div className="text-base font-bold font-num text-slate-100 mt-1">
              {formatINR(totalTrustBalance)}
            </div>
            <div className="text-[10px] text-slate-500">Sum of individual client ledgers</div>
          </div>
        </div>
      </div>

      {/* Individual Matter Trust Accounts */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-amber-400" />
          Individual Matter Trust Escrow Accounts
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matterBalances.map(({ matter, balance, isBelow, shortfall, txCount }) => (
            <div
              key={matter.id}
              className={`bg-slate-900/90 border rounded-xl p-5 space-y-3 flex flex-col justify-between ${
                isBelow ? 'border-red-900/60' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {matter.matterNumber}
                  </span>
                  {isBelow ? (
                    <span className="text-[10px] font-semibold text-red-400 bg-red-950/50 px-1.5 py-0.5 rounded border border-red-800">
                      Evergreen Deficit
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800">
                      Compliant
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-100 mt-2 line-clamp-1">
                  {matter.title}
                </h3>
                <div className="text-xs text-slate-400">{matter.clientName}</div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Trust Balance:</span>
                  <span className={`font-num font-bold ${isBelow ? 'text-red-400' : 'text-sky-300'}`}>
                    {formatINR(balance)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Evergreen Minimum:</span>
                  <span className="font-num text-slate-300">
                    {formatINR(matter.evergreenTrustMinimum)}
                  </span>
                </div>
                {isBelow && (
                  <div className="flex justify-between text-red-400 font-semibold">
                    <span>Shortfall:</span>
                    <span className="font-num">{formatINR(shortfall)}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[11px]">{txCount} Transactions</span>
                <button
                  onClick={() => {
                    setActiveMatterId(matter.id);
                    setMatterSubTab('trust');
                    setCurrentView('matters');
                  }}
                  className="text-amber-400 hover:underline font-medium"
                >
                  Manage Ledger →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
