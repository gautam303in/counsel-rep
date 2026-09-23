import React, { useState } from 'react';
import {
  AlertCircle,
  CheckSquare,
  FileSpreadsheet,
  FileText,
  IndianRupee,
  MinusCircle,
  PauseCircle,
  Percent,
  PlayCircle,
  Receipt,
  Square,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { formatCurrency } from '../../../services/financials';
import { ExpenseEntry, Matter, TimeEntry } from '../../../types';

interface Props {
  matter: Matter;
}

export const WIPTab: React.FC<Props> = ({ matter }) => {
  const {
    timeEntries,
    expenses,
    updateTimeEntryStatus,
    createInvoiceFromWip,
    currentUser,
    users,
    setMatterSubTab,
  } = useApp();

  // Unbilled time entries for this matter
  const unbilledTime = timeEntries.filter(
    (t) => t.matterId === matter.id && !t.invoiceId && t.status !== 'WRITTEN_OFF'
  );

  // Unbilled billable expenses
  const unbilledExpenses = expenses.filter(
    (e) => e.matterId === matter.id && e.billable && !e.invoiceId && e.status === 'UNBILLED'
  );

  const [selectedTimeIds, setSelectedTimeIds] = useState<string[]>(
    unbilledTime.filter((t) => t.status !== 'HELD').map((t) => t.id)
  );
  const [selectedExpIds, setSelectedExpIds] = useState<string[]>(
    unbilledExpenses.map((e) => e.id)
  );

  // Write-down modal state
  const [writeDownEntry, setWriteDownEntry] = useState<TimeEntry | null>(null);
  const [writeDownAmount, setWriteDownAmount] = useState<number>(0);
  const [writeDownReason, setWriteDownReason] = useState<string>('Partner pre-billing adjustment');

  // Write-off modal state
  const [writeOffEntry, setWriteOffEntry] = useState<TimeEntry | null>(null);
  const [writeOffReason, setWriteOffReason] = useState<string>(
    'Non-billable administrative redundancy'
  );

  const toggleSelectAllTime = () => {
    if (selectedTimeIds.length === unbilledTime.length) {
      setSelectedTimeIds([]);
    } else {
      setSelectedTimeIds(unbilledTime.map((t) => t.id));
    }
  };

  const toggleSelectTime = (id: string) => {
    setSelectedTimeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectExp = (id: string) => {
    setSelectedExpIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedTimeTotal = unbilledTime
    .filter((t) => selectedTimeIds.includes(t.id))
    .reduce((sum, t) => sum + (t.writtenDownAmount !== undefined ? t.writtenDownAmount : t.total), 0);

  const selectedExpTotal = unbilledExpenses
    .filter((e) => selectedExpIds.includes(e.id))
    .reduce((sum, e) => sum + e.amount, 0);

  const totalSelectedWip = selectedTimeTotal + selectedExpTotal;

  const handleGenerateInvoice = () => {
    if (selectedTimeIds.length === 0 && selectedExpIds.length === 0) {
      alert('Please select at least one time or expense entry to bill.');
      return;
    }
    const inv = createInvoiceFromWip(matter.id, selectedTimeIds, selectedExpIds);
    alert(
      `Single-Matter Invoice ${inv.invoiceNumber} successfully created and issued for $${inv.totalAmount.toLocaleString()}!\nInvariant preserved: Exactly one matter per invoice.`
    );
    setMatterSubTab('invoices');
  };

  const handleApplyWriteDown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!writeDownEntry) return;
    updateTimeEntryStatus(
      writeDownEntry.id,
      writeDownEntry.status,
      writeDownAmount,
      writeDownReason
    );
    setWriteDownEntry(null);
  };

  const handleConfirmWriteOff = () => {
    if (!writeOffEntry) return;
    updateTimeEntryStatus(writeOffEntry.id, 'WRITTEN_OFF', 0, writeOffReason);
    setWriteOffEntry(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & 1-Click Invoice Action */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            Work In Progress (WIP) Review & Billing Preparation
          </h3>
          <p className="text-xs text-slate-400">
            Audit time slips, apply partner write-downs, hold items, and issue matter invoice
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">
              Selected to Bill
            </div>
            <div className="text-lg font-bold font-num text-amber-300">
              {formatCurrency(totalSelectedWip)}
            </div>
          </div>

          <button
            onClick={handleGenerateInvoice}
            disabled={totalSelectedWip === 0}
            className="px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-md hover:bg-emerald-500 transition-colors shadow-lg disabled:opacity-50 flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Matter Invoice</span>
          </button>
        </div>
      </div>

      {/* Unbilled Time Entries Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAllTime}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
            >
              {selectedTimeIds.length === unbilledTime.length && unbilledTime.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-amber-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-600" />
              )}
              <span>Select All Time ({unbilledTime.length})</span>
            </button>
          </div>
          <span className="text-xs text-slate-400 font-num">
            Time Total: {formatCurrency(selectedTimeTotal)}
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 w-8"></th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Timekeeper</th>
                <th className="py-2.5 px-3">UTBMS / Narrative</th>
                <th className="py-2.5 px-3 text-right">Hours</th>
                <th className="py-2.5 px-3 text-right">Rate</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Partner Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {unbilledTime.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-6 text-slate-500 text-xs">
                    No unbilled time entries in WIP for this matter.
                  </td>
                </tr>
              ) : (
                unbilledTime.map((t) => {
                  const isSelected = selectedTimeIds.includes(t.id);
                  const attorney = users.find((u) => u.id === t.userId);
                  const effectiveAmount =
                    t.writtenDownAmount !== undefined ? t.writtenDownAmount : t.total;

                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <button onClick={() => toggleSelectTime(t.id)}>
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600" />
                          )}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{t.date}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-200">
                        {attorney?.name}
                      </td>
                      <td className="py-2.5 px-3 max-w-sm">
                        <div className="text-[10px] font-mono text-amber-400">{t.utbmsCode}</div>
                        <div className="text-slate-300 line-clamp-1">{t.narrative}</div>
                        {t.writtenDownAmount !== undefined && (
                          <div className="text-[10px] text-rose-400 font-mono">
                            Written down from {formatCurrency(t.total)}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-num text-slate-200">
                        {t.hours.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-num text-slate-400">
                        ₹{t.rate}/hr
                      </td>
                      <td className="py-2.5 px-3 text-right font-num font-semibold text-amber-300">
                        {formatCurrency(effectiveAmount)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                            t.status === 'PARTNER_APPROVED'
                              ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/60'
                              : t.status === 'HELD'
                              ? 'bg-amber-950/50 text-amber-300 border-amber-800/60'
                              : 'bg-sky-950/50 text-sky-300 border-sky-800/60'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            setWriteDownEntry(t);
                            setWriteDownAmount(effectiveAmount * 0.8);
                          }}
                          title="Write-Down Amount"
                          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-amber-300 rounded transition-colors"
                        >
                          <MinusCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            updateTimeEntryStatus(
                              t.id,
                              t.status === 'HELD' ? 'WIP' : 'HELD'
                            );
                          }}
                          title={t.status === 'HELD' ? 'Unhold (Include)' : 'Hold from billing'}
                          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-sky-300 rounded transition-colors"
                        >
                          <PauseCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setWriteOffEntry(t)}
                          title="Write-Off Entry Completely"
                          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unbilled Expenses Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-amber-400" />
            Unbilled Billable Disbursements ({unbilledExpenses.length})
          </span>
          <span className="text-xs text-slate-400 font-num">
            Expense Total: {formatCurrency(selectedExpTotal)}
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 w-8"></th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {unbilledExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-slate-500 text-xs">
                    No unbilled disbursements.
                  </td>
                </tr>
              ) : (
                unbilledExpenses.map((e) => {
                  const isSelected = selectedExpIds.includes(e.id);
                  return (
                    <tr
                      key={e.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <button onClick={() => toggleSelectExp(e.id)}>
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600" />
                          )}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{e.date}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-200">{e.category}</td>
                      <td className="py-2.5 px-3 text-slate-300">{e.description}</td>
                      <td className="py-2.5 px-3 text-right font-num font-semibold text-slate-100">
                        {formatCurrency(e.amount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Write-Down Modal */}
      {writeDownEntry && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <MinusCircle className="w-4 h-4 text-amber-400" />
              Partner Write-Down Adjustment
            </h3>
            <p className="text-xs text-slate-400">
              Original billed amount: {formatCurrency(writeDownEntry.total)} ({writeDownEntry.hours} hrs @ ₹{writeDownEntry.rate}/hr)
            </p>

            <form onSubmit={handleApplyWriteDown} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Adjusted Billable Amount (₹ INR)
                </label>
                <input
                  type="number"
                  min="0"
                  max={writeDownEntry.total}
                  required
                  value={writeDownAmount}
                  onChange={(e) => setWriteDownAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-amber-300 focus:outline-none focus:border-amber-500/50 font-num font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Write-Down Justification Reason
                </label>
                <input
                  type="text"
                  required
                  value={writeDownReason}
                  onChange={(e) => setWriteDownReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWriteDownEntry(null)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-500 text-slate-950 font-medium text-xs rounded hover:bg-amber-400"
                >
                  Apply Write-Down
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Write-Off Modal */}
      {writeOffEntry && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Confirm Time Entry Write-Off
            </h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to write off {formatCurrency(writeOffEntry.total)} recorded by{' '}
              {users.find((u) => u.id === writeOffEntry.userId)?.name}? This permanently removes the
              item from billable WIP and logs an audit record.
            </p>

            <div>
              <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                Write-Off Audit Reason
              </label>
              <input
                type="text"
                required
                value={writeOffReason}
                onChange={(e) => setWriteOffReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWriteOffEntry(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWriteOff}
                className="px-3 py-1.5 bg-rose-600 text-white font-medium text-xs rounded hover:bg-rose-500"
              >
                Confirm Write-Off
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
