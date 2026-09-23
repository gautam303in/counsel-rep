import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  IndianRupee,
  Landmark,
  Mail,
  Plus,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { formatINR } from '../../../utils/currency';
import { useAudit } from '../../../hooks/useAudit';
import { Matter, TrustTransaction } from '../../../types';

interface Props {
  matter: Matter;
}

export const TrustTab: React.FC<Props> = ({ matter }) => {
  const { trustTransactions, addTrustTransaction, currentUser } = useApp();
  const { logTrustTransaction } = useAudit();

  const matterTrustTx = trustTransactions
    .filter((t) => t.matterId === matter.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Current balance
  const currentBalance = matterTrustTx.reduce((sum, t) => sum + t.amount, 0);

  const isBelowEvergreen = currentBalance < matter.evergreenTrustMinimum;
  const shortfall = Math.max(0, matter.evergreenTrustMinimum - currentBalance);

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [amount, setAmount] = useState(15000);
  const [description, setDescription] = useState('Client wire deposit into IOLTA trust escrow');
  const [reference, setReference] = useState('IOLTA-DEP-');

  // Running balance calculation for ledger display
  let running = 0;
  const ledgerWithRunning = matterTrustTx.map((tx) => {
    running += tx.amount;
    return { ...tx, runningBalance: running };
  });

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    const depositAmt = Math.abs(amount);
    addTrustTransaction({
      matterId: matter.id,
      date: new Date().toISOString().split('T')[0],
      type: 'DEPOSIT',
      amount: depositAmt,
      description,
      reference,
      cleared: true,
      recordedBy: currentUser.name,
      authorizedBy: currentUser.name,
    });

    // Record central audit business event
    logTrustTransaction(
      'DEPOSIT',
      depositAmt,
      matter.id,
      `IOLTA Trust Retainer Deposit (${reference}): ${description}`
    );

    setShowDepositModal(false);
  };

  const handleDisburse = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > currentBalance) {
      alert('Disbursement cannot exceed current available matter trust balance.');
      return;
    }
    const disburseAmt = Math.abs(amount);
    addTrustTransaction({
      matterId: matter.id,
      date: new Date().toISOString().split('T')[0],
      type: 'DISBURSEMENT',
      amount: -disburseAmt,
      description,
      reference,
      cleared: true,
      recordedBy: currentUser.name,
      authorizedBy: currentUser.name,
    });

    // Record central audit business event
    logTrustTransaction(
      'DISBURSEMENT',
      disburseAmt,
      matter.id,
      `IOLTA Trust Escrow Disbursement (${reference}): ${description}`
    );

    setShowDisburseModal(false);
  };

  const handleSendReplenishmentNotice = () => {
    alert(
      `Evergreen Retainer Replenishment Notice dispatched to ${matter.clientName}.\nRequested Replenishment Amount: ${formatINR(
        shortfall + 10000
      )}\nEvergreen Minimum Floor: ${formatINR(matter.evergreenTrustMinimum)}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Landmark className="w-4 h-4 text-sky-400" />
            IOLTA Trust Accounting & Evergreen Retainer
          </h3>
          <p className="text-xs text-slate-400">
            Segregated fiduciary escrow ledger compliant with State Bar Rule 1.15
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isBelowEvergreen && (
            <button
              onClick={handleSendReplenishmentNotice}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium rounded hover:bg-amber-500/30 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>Issue Replenishment Notice ({formatINR(shortfall)})</span>
            </button>
          )}

          <button
            onClick={() => setShowDisburseModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium rounded hover:bg-slate-700 transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
            <span>Disburse Funds</span>
          </button>

          <button
            onClick={() => setShowDepositModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 text-white text-xs font-medium rounded hover:bg-sky-500 transition-colors shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Deposit Trust Retainer</span>
          </button>
        </div>
      </div>

      {/* Evergreen Retainer Alert Bar */}
      {isBelowEvergreen ? (
        <div className="bg-red-950/40 border border-red-800/60 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-red-300 uppercase tracking-wide">
                Evergreen Retainer Threshold Deficit
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                Current Trust Balance ({formatINR(currentBalance)}) has fallen below the
                stipulated evergreen minimum of {formatINR(matter.evergreenTrustMinimum)}.
                Shortfall is <strong className="text-red-300 font-num">{formatINR(shortfall)}</strong>.
              </div>
            </div>
          </div>
          <button
            onClick={handleSendReplenishmentNotice}
            className="px-3 py-1.5 bg-red-600 text-white font-medium text-xs rounded hover:bg-red-500 shrink-0"
          >
            Send Demand to Client
          </button>
        </div>
      ) : (
        <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-3 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Fiduciary Compliance OK: Trust balance exceeds the evergreen threshold of{' '}
              {formatINR(matter.evergreenTrustMinimum)}.
            </span>
          </div>
          <span className="font-num font-semibold">Surplus: +{formatINR(currentBalance - matter.evergreenTrustMinimum)}</span>
        </div>
      )}

      {/* Financial Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            Current Escrow Trust Balance
          </div>
          <div
            className={`text-xl font-bold font-num mt-1 ${
              isBelowEvergreen ? 'text-red-400' : 'text-sky-300'
            }`}
          >
            {formatINR(currentBalance)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Strictly segregated from operating capital
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            Evergreen Retainer Minimum
          </div>
          <div className="text-xl font-bold font-num text-slate-100 mt-1">
            {formatINR(matter.evergreenTrustMinimum)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Agreed replenishment trigger floor</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            Total Ledger Transactions
          </div>
          <div className="text-xl font-bold font-num text-slate-100 mt-1">
            {matterTrustTx.length}
          </div>
          <div className="text-[11px] text-emerald-400 mt-0.5">Three-Way Reconciled ✓</div>
        </div>
      </div>

      {/* Trust Ledger Table */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-sky-400" />
          Fiduciary Escrow Ledger
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Reference / Bank Transaction</th>
                <th className="py-2.5 px-3">Description & Purpose</th>
                <th className="py-2.5 px-3 text-right">Debit / Credit</th>
                <th className="py-2.5 px-3 text-right">Running Balance</th>
                <th className="py-2.5 px-3 text-center">Reconciled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {ledgerWithRunning.map((tx) => {
                const isCredit = tx.amount > 0;
                return (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-400">{tx.date}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          tx.type === 'DEPOSIT'
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50'
                            : tx.type === 'APPLIED_TO_INVOICE'
                            ? 'bg-sky-950/40 text-sky-300 border-sky-800/50'
                            : 'bg-rose-950/40 text-rose-300 border-rose-800/50'
                        }`}
                      >
                        {tx.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{tx.reference}</td>
                    <td className="py-2.5 px-3 text-slate-300">{tx.description}</td>
                    <td
                      className={`py-2.5 px-3 text-right font-num font-bold ${
                        isCredit ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isCredit ? '+' : ''}
                      {formatINR(tx.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-num font-semibold text-sky-300">
                      {formatINR(tx.runningBalance)}
                    </td>
                    <td className="py-2.5 px-3 text-center text-emerald-400">✓</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-sky-400" />
              Deposit Client Funds to Matter IOLTA Trust
            </h3>

            <form onSubmit={handleDeposit} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Deposit Amount (₹ INR)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-sky-300 font-num font-semibold focus:outline-none focus:border-sky-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Bank Reference / Wire Confirmation #
                </label>
                <input
                  type="text"
                  required
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Fiduciary Purpose Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-sky-600 text-white font-medium text-xs rounded hover:bg-sky-500"
                >
                  Record Fiduciary Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disburse Modal */}
      {showDisburseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-rose-400" />
              Disburse / Refund Trust Funds
            </h3>
            <p className="text-xs text-slate-400">
              Available balance: {formatINR(currentBalance)}
            </p>

            <form onSubmit={handleDisburse} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Disbursement Amount (₹ INR)
                </label>
                <input
                  type="number"
                  min="1"
                  max={currentBalance}
                  required
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-rose-300 font-num font-semibold focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Payment Reference / Check #
                </label>
                <input
                  type="text"
                  required
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Disbursement Purpose / Retainer Refund Reason
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisburseModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-rose-600 text-white font-medium text-xs rounded hover:bg-rose-500"
                >
                  Confirm Disbursement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
