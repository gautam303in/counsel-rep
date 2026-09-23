import React, { useState } from 'react';
import { FileCheck, FileSpreadsheet, IndianRupee, Plus, Receipt } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { formatCurrency } from '../../../services/financials';
import { ExpenseEntry, Matter } from '../../../types';

interface Props {
  matter: Matter;
}

export const ExpensesTab: React.FC<Props> = ({ matter }) => {
  const { expenses, addExpense, currentUser } = useApp();
  const matterExpenses = expenses.filter((e) => e.matterId === matter.id);

  const [showAddModal, setShowAddModal] = useState(false);
  const [category, setCategory] = useState<ExpenseEntry['category']>('Court Filing Fees');
  const [amount, setAmount] = useState(450);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [billable, setBillable] = useState(true);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0) return;

    addExpense({
      matterId: matter.id,
      userId: currentUser.id,
      date,
      category,
      amount,
      description,
      billable,
    });

    setShowAddModal(false);
    setDescription('');
    setAmount(450);
  };

  const totalBillable = matterExpenses
    .filter((e) => e.billable)
    .reduce((sum, e) => sum + e.amount, 0);

  const unbilledTotal = matterExpenses
    .filter((e) => e.billable && e.status === 'UNBILLED')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-400" />
            Matter Expense Disbursements
          </h3>
          <p className="text-xs text-slate-400">
            Pass-through litigation costs, expert retainers, court transcripts, and filing receipts
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-slate-950 text-xs font-medium rounded hover:bg-amber-400 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            Total Billable Expenses
          </div>
          <div className="text-base font-semibold font-num text-slate-100 mt-0.5">
            {formatCurrency(totalBillable)}
          </div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            Unbilled in WIP
          </div>
          <div className="text-base font-semibold font-num text-amber-300 mt-0.5">
            {formatCurrency(unbilledTotal)}
          </div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            Disbursement Items
          </div>
          <div className="text-base font-semibold font-num text-slate-200 mt-0.5">
            {matterExpenses.length}
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Description</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
              <th className="py-2.5 px-3 text-center">Billable</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {matterExpenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-2.5 px-3 font-mono text-slate-400">{exp.date}</td>
                <td className="py-2.5 px-3 font-medium text-slate-200">{exp.category}</td>
                <td className="py-2.5 px-3 text-slate-300">{exp.description}</td>
                <td className="py-2.5 px-3 text-right font-num font-semibold text-slate-100">
                  {formatCurrency(exp.amount)}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      exp.billable
                        ? 'bg-emerald-950/40 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {exp.billable ? 'YES' : 'NON-BILL'}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      exp.status === 'INVOICED'
                        ? 'bg-slate-800 text-slate-400 border-slate-700'
                        : 'bg-amber-950/50 text-amber-300 border-amber-800/60'
                    }`}
                  >
                    {exp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-400" />
              Record Expense Disbursement
            </h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="Court Filing Fees">Court Filing Fees</option>
                    <option value="Expert Witness Fees">Expert Witness Fees</option>
                    <option value="Transcript / Court Reporter">Transcript / Court Reporter</option>
                    <option value="Travel">Travel</option>
                    <option value="Process Server">Process Server</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                    Amount (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 font-num"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Disbursement Purpose & Receipt Memo
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Official fee paid to Clerk of Court for ECF filing..."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="billableCheck"
                  checked={billable}
                  onChange={(e) => setBillable(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500"
                />
                <label htmlFor="billableCheck" className="text-xs text-slate-300">
                  Billable to client invoice
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-500 text-slate-950 font-medium text-xs rounded hover:bg-amber-400"
                >
                  Save Disbursement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
