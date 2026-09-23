import React from 'react';
import { AlertCircle, ArrowUpRight, IndianRupee, Lock, ShieldAlert, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateMatterFinancials } from '../../services/financials';
import { formatINR } from '../../utils/currency';
import { Matter } from '../../types';

interface Props {
  matter: Matter;
  showDetailsButton?: boolean;
}

export const MatterFinancialStrip: React.FC<Props> = ({ matter, showDetailsButton = true }) => {
  const { timeEntries, expenses, invoices, payments, trustTransactions, setMatterSubTab } = useApp();

  const snap = calculateMatterFinancials(
    matter.id,
    timeEntries,
    expenses,
    invoices,
    payments,
    trustTransactions
  );

  // Check if trust balance is below evergreen threshold
  const isBelowEvergreen = snap.trustBalance < matter.evergreenTrustMinimum;

  return (
    <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 shadow-xs">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400">
            <IndianRupee className="w-3 h-3" />
          </div>
          <h4 className="text-xs font-bold text-slate-200 tracking-wide uppercase">
            Matter Financial Ledger
          </h4>
          <span className="text-[11px] text-slate-500 font-normal">
            Single-source-of-truth
          </span>
        </div>
        {isBelowEvergreen && (
          <div className="flex items-center gap-1.5 text-[11px] text-rose-300 bg-rose-950/60 border border-rose-800/60 px-2.5 py-0.5 rounded-full font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Below Evergreen Minimum ({formatINR(matter.evergreenTrustMinimum)})</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {/* Unbilled WIP */}
        <div
          onClick={() => setMatterSubTab('wip')}
          className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 cursor-pointer hover:border-slate-700 hover:shadow-xs transition-all"
        >
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 font-semibold">
            Unbilled WIP
          </div>
          <div className="text-sm font-bold font-num text-amber-400">
            {formatINR(snap.unbilledWip)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Time + Expenses</div>
        </div>

        {/* Billed */}
        <div
          onClick={() => setMatterSubTab('invoices')}
          className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 cursor-pointer hover:border-slate-700 hover:shadow-xs transition-all"
        >
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 font-semibold">
            Billed
          </div>
          <div className="text-sm font-bold font-num text-slate-100">
            {formatINR(snap.billed)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Issued Invoices</div>
        </div>

        {/* Paid */}
        <div
          onClick={() => setMatterSubTab('payments')}
          className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 cursor-pointer hover:border-slate-700 hover:shadow-xs transition-all"
        >
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 font-semibold">
            Paid
          </div>
          <div className="text-sm font-bold font-num text-emerald-400">
            {formatINR(snap.paid)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Receipts</div>
        </div>

        {/* Outstanding A/R */}
        <div
          onClick={() => setMatterSubTab('invoices')}
          className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 cursor-pointer hover:border-slate-700 hover:shadow-xs transition-all"
        >
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 font-semibold">
            Outstanding A/R
          </div>
          <div className="text-sm font-bold font-num text-rose-400">
            {formatINR(snap.outstandingAr)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Billed − Paid</div>
        </div>

        {/* Trust / Retainer */}
        <div
          onClick={() => setMatterSubTab('trust')}
          className={`bg-slate-900 border rounded-xl p-2.5 cursor-pointer hover:border-slate-700 hover:shadow-xs transition-all ${
            isBelowEvergreen ? 'border-rose-900/60 ring-1 ring-rose-900/40' : 'border-slate-800'
          }`}
        >
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 font-semibold">
            Trust / Retainer
          </div>
          <div className={`text-sm font-bold font-num ${isBelowEvergreen ? 'text-rose-400' : 'text-blue-400'}`}>
            {formatINR(snap.trustBalance)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">IOLTA Balance</div>
        </div>

        {/* Realization Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 font-semibold">
            Realization
          </div>
          <div className="text-sm font-bold font-num text-slate-200">
            {snap.realizationRate}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Billed ÷ Recorded</div>
        </div>

        {/* Collection Realization Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 font-semibold">
            Collection
          </div>
          <div className="text-sm font-bold font-num text-emerald-400">
            {snap.collectionRealizationRate}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Collected ÷ Billed</div>
        </div>
      </div>
    </div>
  );
};
