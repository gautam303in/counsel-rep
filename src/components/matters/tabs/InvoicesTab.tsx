import React, { useState } from 'react';
import {
  ArrowDownToLine,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileCode,
  FileText,
  IndianRupee,
  Lock,
  Plus,
  Printer,
  Receipt,
  Scale,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { formatINR } from '../../../utils/currency';
import { Invoice, Matter } from '../../../types';

interface Props {
  matter: Matter;
}

export const InvoicesTab: React.FC<Props> = ({ matter }) => {
  const { invoices, applyTrustToInvoice, clients, setMatterSubTab } = useApp();
  const matterInvoices = invoices.filter((inv) => inv.matterId === matter.id);

  const client = clients.find((c) => c.id === matter.clientId);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showLedesModal, setShowLedesModal] = useState<Invoice | null>(null);

  const totalBilled = matterInvoices
    .filter((i) => i.status !== 'VOID' && i.status !== 'DRAFT')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const totalPaid = matterInvoices
    .filter((i) => i.status !== 'VOID')
    .reduce((sum, i) => sum + i.amountPaid, 0);

  const totalAr = Math.max(0, totalBilled - totalPaid);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-400" />
            Matter Invoices & Statements
          </h3>
          <p className="text-xs text-slate-400">
            Single-matter billing invariant: Each invoice is strictly tied to {matter.matterNumber}
          </p>
        </div>

        <button
          onClick={() => setMatterSubTab('wip')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-slate-950 text-xs font-medium rounded hover:bg-amber-400 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Invoice from WIP</span>
        </button>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Billed</div>
          <div className="text-base font-semibold font-num text-slate-100 mt-0.5">
            {formatINR(totalBilled)}
          </div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Collected</div>
          <div className="text-base font-semibold font-num text-emerald-400 mt-0.5">
            {formatINR(totalPaid)}
          </div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            Outstanding A/R
          </div>
          <div className="text-base font-semibold font-num text-rose-300 mt-0.5">
            {formatINR(totalAr)}
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">Invoice Number</th>
              <th className="py-2.5 px-3">Issued Date</th>
              <th className="py-2.5 px-3">Due Date</th>
              <th className="py-2.5 px-3 text-right">Time Fees</th>
              <th className="py-2.5 px-3 text-right">Expenses</th>
              <th className="py-2.5 px-3 text-right">Total</th>
              <th className="py-2.5 px-3 text-right">Balance Due</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {matterInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-2.5 px-3 font-mono font-semibold text-amber-300">
                  {inv.invoiceNumber}
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
                        : inv.status === 'ISSUED'
                        ? 'bg-amber-950/50 text-amber-300 border-amber-800/60'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right space-x-1.5">
                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    title="View Formal PDF Invoice"
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-amber-300 rounded transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setShowLedesModal(inv)}
                    title="View LEDES-1998B Format"
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-sky-300 rounded transition-colors"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formal PDF Invoice View Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-semibold text-slate-100">
                  Invoice {selectedInvoice.invoiceNumber}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 text-slate-200 text-xs rounded hover:bg-slate-700"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-slate-400 hover:text-slate-200 text-sm ml-2"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 bg-white text-slate-900 p-8 rounded-lg font-sans">
              {/* Invoice Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-5">
                <div>
                  <h2 className="font-legal-heading text-xl font-bold tracking-tight text-slate-900">
                    VANCE & STERLING LLP
                  </h2>
                  <p className="text-xs text-slate-500">ATTORNEYS AT LAW</p>
                  <p className="text-xs text-slate-600 mt-1">
                    555 California Street, 42nd Floor
                    <br />
                    San Francisco, CA 94104
                    <br />
                    T: +1 (415) 792-8000 · tax-id: 94-2891044
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold font-legal-heading text-amber-700">
                    INVOICE
                  </div>
                  <div className="text-xs font-mono font-semibold text-slate-700 mt-1">
                    #{selectedInvoice.invoiceNumber}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Date: {selectedInvoice.issuedDate}
                  </div>
                  <div className="text-xs text-slate-500">Due: {selectedInvoice.dueDate}</div>
                </div>
              </div>

              {/* Client & Matter Details */}
              <div className="grid grid-cols-2 gap-4 text-xs py-2">
                <div>
                  <div className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                    Billed To
                  </div>
                  <div className="font-bold text-slate-900 mt-0.5">{matter.clientName}</div>
                  <div className="text-slate-600 mt-0.5">
                    Attn: {client?.primaryContactName}
                    <br />
                    {client?.address}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                    Matter Reference
                  </div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    [{matter.matterNumber}] {matter.title}
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    Practice Area: {matter.practiceArea}
                    <br />
                    Court Docket: {matter.caseDocketNumber || 'Private Forum'}
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="pt-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-300 text-slate-700 uppercase tracking-wider text-[10px]">
                      <th className="py-2 px-1">Date</th>
                      <th className="py-2 px-2">Description / Timekeeper</th>
                      <th className="py-2 px-1 text-right">Hours</th>
                      <th className="py-2 px-1 text-right">Rate</th>
                      <th className="py-2 px-1 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedInvoice.lines.map((line) => (
                      <tr key={line.id}>
                        <td className="py-2 px-1 font-mono text-slate-600">{line.date}</td>
                        <td className="py-2 px-2">
                          <div className="font-medium text-slate-900">{line.description}</div>
                          {line.attorneyName && (
                            <div className="text-[11px] text-slate-500">
                              {line.attorneyName} {line.utbmsCode ? `· ${line.utbmsCode}` : ''}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-1 text-right font-num text-slate-700">
                          {line.hours ? line.hours.toFixed(1) : '—'}
                        </td>
                        <td className="py-2 px-1 text-right font-num text-slate-700">
                          {line.rate ? `₹${line.rate}` : '—'}
                        </td>
                        <td className="py-2 px-1 text-right font-num font-semibold text-slate-900">
                          {formatCurrency(line.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="border-t-2 border-slate-300 pt-4 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Professional Fees:</span>
                    <span className="font-num">{formatCurrency(selectedInvoice.subtotalTime)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Expenses & Costs:</span>
                    <span className="font-num">
                      {formatINR(selectedInvoice.subtotalExpenses)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200 text-sm">
                    <span>Total Amount:</span>
                    <span className="font-num font-semibold">
                      {formatINR(selectedInvoice.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Amount Paid / Credits:</span>
                    <span className="font-num">
                      −{formatINR(selectedInvoice.amountPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-rose-700 pt-1 border-t border-slate-200">
                    <span>Balance Due:</span>
                    <span className="font-num">
                      {formatINR(selectedInvoice.balanceDue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Remittance Instructions */}
              <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-3">
                <span className="font-semibold text-slate-700">Remittance: </span>
                Wire transfers payable to Vance & Sterling LLP Master Operating Account #00921448,
                Routing #121000358. Or apply from client pre-funded IOLTA Trust Account upon authorization.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEDES 1998B Modal */}
      {showLedesModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-sky-400" />
                LEDES-1998B Electronic Data Format
              </h3>
              <button
                onClick={() => setShowLedesModal(null)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Electronic legal electronic data exchange standard file format for enterprise e-billing
              software (TyMetrix, CounselLink, Brightflag).
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono text-emerald-300 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {showLedesModal.ledesFormatString ||
                `INVOICE|${showLedesModal.invoiceNumber}|20260915|${showLedesModal.totalAmount}.00|INR\nLINE|FEE|20260905|EV|850.00|10.5|8925.00|L240`}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowLedesModal(null)}
                className="px-3 py-1.5 bg-amber-500 text-slate-950 font-medium text-xs rounded hover:bg-amber-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
