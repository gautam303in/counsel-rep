import React, { useState } from 'react';
import {
  ArrowDownToLine,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  FileText,
  Filter,
  IndianRupee,
  Landmark,
  Receipt,
  Scale,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/currency';
import { Invoice } from '../../types';

export const BillingCenterView: React.FC = () => {
  const {
    invoices,
    timeEntries,
    expenses,
    matters,
    setActiveMatterId,
    setMatterSubTab,
    setCurrentView,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Firm-wide aggregates
  const totalBilled = invoices
    .filter((i) => i.status !== 'VOID' && i.status !== 'DRAFT')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const totalCollected = invoices
    .filter((i) => i.status !== 'VOID')
    .reduce((sum, i) => sum + i.amountPaid, 0);

  const totalAr = Math.max(0, totalBilled - totalCollected);

  const unbilledWipTotal =
    timeEntries
      .filter((t) => !t.invoiceId && t.status !== 'WRITTEN_OFF')
      .reduce((s, t) => s + (t.writtenDownAmount !== undefined ? t.writtenDownAmount : t.total), 0) +
    expenses
      .filter((e) => e.billable && !e.invoiceId && e.status === 'UNBILLED')
      .reduce((s, e) => s + e.amount, 0);

  const realizationRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 100;

  const filteredInvoices =
    filterStatus === 'ALL' ? invoices : invoices.filter((i) => i.status === filterStatus);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-legal-heading text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            Firm Billing Operations & A/R Realization
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Single-matter invoice lifecycle, WIP pre-bills, realization rates, and LEDES e-billing
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            Total Unbilled WIP
          </div>
          <div className="text-2xl font-bold font-num text-amber-300 mt-1">
            {formatINR(unbilledWipTotal)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across all open matters</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            Total Issued Invoices
          </div>
          <div className="text-2xl font-bold font-num text-slate-100 mt-1">
            {formatINR(totalBilled)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Strict single-matter invariant</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            Outstanding Firm A/R
          </div>
          <div className="text-2xl font-bold font-num text-rose-300 mt-1">
            {formatINR(totalAr)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Pending collections</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            Collection Realization
          </div>
          <div className="text-2xl font-bold font-num text-emerald-400 mt-1">
            {realizationRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Collected ÷ Billed</div>
        </div>
      </div>

      {/* Strict Billing Invariant Notice */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2.5">
          <Receipt className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Strict Billing Architecture:</strong> Invoices adhere to the single-matter
            invariant (1 Invoice = 1 Matter). Consolidated statements may present invoices together,
            but WIP entries are never commingled.
          </span>
        </div>
      </div>

      {/* Invoice Ledger Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            All Issued & Draft Invoices
          </h2>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-md border border-slate-800 text-xs">
            {['ALL', 'ISSUED', 'PART_PAID', 'PAID'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3">Matter Reference</th>
                <th className="py-2.5 px-3">Issued Date</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3 text-right">Time Fees</th>
                <th className="py-2.5 px-3 text-right">Disbursements</th>
                <th className="py-2.5 px-3 text-right">Total</th>
                <th className="py-2.5 px-3 text-right">Balance Due</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInvoices.map((inv) => {
                const m = matters.find((item) => item.id === inv.matterId);
                return (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-amber-300">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-2.5 px-3">
                      <div
                        onClick={() => {
                          if (m) {
                            setActiveMatterId(m.id);
                            setMatterSubTab('invoices');
                            setCurrentView('matters');
                          }
                        }}
                        className="font-semibold text-slate-200 hover:underline cursor-pointer"
                      >
                        {m?.title || 'Matter Reference'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {inv.matterNumber}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{inv.issuedDate}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{inv.dueDate}</td>
                    <td className="py-2.5 px-3 text-right font-num text-slate-300">
                      {formatINR(inv.subtotalTime)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-num text-slate-300">
                      {formatINR(inv.subtotalExpenses)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-num font-semibold text-slate-100">
                      {formatINR(inv.totalAmount)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-num font-bold text-rose-300">
                      {formatINR(inv.balanceDue)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/60'
                            : inv.status === 'PART_PAID'
                            ? 'bg-sky-950/50 text-sky-300 border-sky-800/60'
                            : 'bg-amber-950/50 text-amber-300 border-amber-800/60'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          if (m) {
                            setActiveMatterId(m.id);
                            setMatterSubTab('invoices');
                            setCurrentView('matters');
                          }
                        }}
                        className="text-xs text-amber-400 hover:underline font-medium"
                      >
                        Manage →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
