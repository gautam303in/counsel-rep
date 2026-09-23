import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  Edit2,
  FileSpreadsheet,
  Filter,
  IndianRupee,
  Plus,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { formatCurrency } from '../../../services/financials';
import { Matter, TimeEntry, UTBMSCode } from '../../../types';

interface Props {
  matter: Matter;
}

const UTBMS_CODES: UTBMSCode[] = [
  'A101 - Plan and prepare for',
  'A102 - Research',
  'A103 - Draft/revise',
  'A104 - Review/analyze',
  'A105 - Communicate (in firm)',
  'A106 - Communicate (with client)',
  'A107 - Communicate (other)',
  'A108 - Attend proceeding',
  'L110 - Fact Investigation/Development',
  'L120 - Analysis/Strategy',
  'L240 - Dispositive Motions',
];

export const TimeTab: React.FC<Props> = ({ matter }) => {
  const {
    timeEntries,
    addTimeEntry,
    updateTimeEntryStatus,
    currentUser,
    users,
    startTimer,
    isTimerRunning,
  } = useApp();

  const matterTime = timeEntries.filter((t) => t.matterId === matter.id);

  const [showAddModal, setShowAddModal] = useState(false);
  const [hours, setHours] = useState(2.5);
  const [utbmsCode, setUtbmsCode] = useState<UTBMSCode>('A103 - Draft/revise');
  const [narrative, setNarrative] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAttorneyId, setSelectedAttorneyId] = useState(currentUser.id);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!narrative) return;
    const attorney = users.find((u) => u.id === selectedAttorneyId) || currentUser;
    const rate = attorney.billingRate || 550;
    const total = Math.round(hours * rate);

    addTimeEntry({
      matterId: matter.id,
      userId: attorney.id,
      date: entryDate,
      hours,
      rate,
      total,
      utbmsCode,
      narrative,
    });

    setShowAddModal(false);
    setNarrative('');
    setHours(2.5);
  };

  const handleApprove = (entryId: string) => {
    updateTimeEntryStatus(entryId, 'PARTNER_APPROVED');
  };

  const handleHold = (entryId: string) => {
    updateTimeEntryStatus(entryId, 'HELD');
  };

  const totalBillableTime = matterTime
    .filter((t) => t.status !== 'WRITTEN_OFF')
    .reduce((sum, t) => sum + (t.writtenDownAmount !== undefined ? t.writtenDownAmount : t.total), 0);

  const totalHours = matterTime
    .filter((t) => t.status !== 'WRITTEN_OFF')
    .reduce((sum, t) => sum + t.hours, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Time Recording & Attorney Hours
          </h3>
          <p className="text-xs text-slate-400">
            UTBMS standardized activity narratives, partner reviews, and rate cards
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isTimerRunning && (
            <button
              onClick={() => startTimer(matter.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-amber-300 border border-slate-700 text-xs font-medium rounded hover:bg-slate-700 transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Launch Timer on this Matter</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-slate-950 text-xs font-medium rounded hover:bg-amber-400 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manual Time Entry</span>
          </button>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Hours</div>
          <div className="text-base font-semibold font-num text-slate-100 mt-0.5">
            {totalHours.toFixed(1)} hrs
          </div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Recorded Value</div>
          <div className="text-base font-semibold font-num text-amber-300 mt-0.5">
            {formatCurrency(totalBillableTime)}
          </div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Average Blended Rate</div>
          <div className="text-base font-semibold font-num text-slate-200 mt-0.5">
            {totalHours > 0 ? formatCurrency(Math.round(totalBillableTime / totalHours)) : '₹0'}/hr
          </div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Entries Count</div>
          <div className="text-base font-semibold font-num text-slate-200 mt-0.5">
            {matterTime.length}
          </div>
        </div>
      </div>

      {/* Time Entries Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Timekeeper</th>
              <th className="py-2.5 px-3">UTBMS / Narrative</th>
              <th className="py-2.5 px-3 text-right">Hours</th>
              <th className="py-2.5 px-3 text-right">Rate</th>
              <th className="py-2.5 px-3 text-right">Total</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {matterTime.map((t) => {
              const attorney = users.find((u) => u.id === t.userId);
              const isPartner = currentUser.role.includes('PARTNER');
              return (
                <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-400">{t.date}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-200">{attorney?.name || 'Counsel'}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {attorney?.role.slice(0, 12)}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 max-w-md">
                    <span className="text-[10px] font-mono text-amber-400 block">{t.utbmsCode}</span>
                    <span className="text-slate-300 line-clamp-2">{t.narrative}</span>
                    {t.writtenDownAmount !== undefined && (
                      <span className="text-[10px] text-rose-400 block mt-0.5">
                        Written down from {formatCurrency(t.total)}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-num font-semibold text-slate-200">
                    {t.hours.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-num text-slate-400">₹{t.rate}/hr</td>
                  <td className="py-2.5 px-3 text-right font-num font-semibold text-amber-300">
                    {formatCurrency(t.writtenDownAmount !== undefined ? t.writtenDownAmount : t.total)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        t.status === 'INVOICED'
                          ? 'bg-slate-800 text-slate-400 border-slate-700'
                          : t.status === 'PARTNER_APPROVED'
                          ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/60'
                          : t.status === 'WRITTEN_OFF'
                          ? 'bg-rose-950/50 text-rose-400 border-rose-800/60'
                          : t.status === 'HELD'
                          ? 'bg-amber-950/50 text-amber-300 border-amber-800/60'
                          : 'bg-sky-950/50 text-sky-300 border-sky-800/60'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right space-x-1">
                    {isPartner && t.status === 'WIP' && (
                      <button
                        onClick={() => handleApprove(t.id)}
                        title="Partner Approve"
                        className="p-1 hover:bg-emerald-500/20 text-emerald-400 rounded transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isPartner && t.status !== 'INVOICED' && t.status !== 'HELD' && (
                      <button
                        onClick={() => handleHold(t.id)}
                        title="Hold from current billing cycle"
                        className="p-1 hover:bg-amber-500/20 text-amber-400 rounded transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Manual Time Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Manual Time Slip Intake
            </h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                    Timekeeper
                  </label>
                  <select
                    value={selectedAttorneyId}
                    onChange={(e) => setSelectedAttorneyId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                  >
                    {users
                      .filter((u) => u.billingRate > 0)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} (₹{u.billingRate}/hr)
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                    Hours (tenths)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={hours}
                    onChange={(e) => setHours(parseFloat(e.target.value) || 0.1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 font-num"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                    Estimated Value
                  </label>
                  <div className="w-full bg-slate-950/60 border border-slate-800 rounded px-3 py-1.5 text-xs text-amber-300 font-num font-semibold">
                    {formatCurrency(
                      Math.round(
                        hours *
                          (users.find((u) => u.id === selectedAttorneyId)?.billingRate || 550)
                      )
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  UTBMS Task Code
                </label>
                <select
                  value={utbmsCode}
                  onChange={(e) => setUtbmsCode(e.target.value as UTBMSCode)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  {UTBMS_CODES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Detailed Billing Narrative
                </label>
                <textarea
                  rows={3}
                  required
                  value={narrative}
                  onChange={(e) => setNarrative(e.target.value)}
                  placeholder="Detailed description of professional legal services rendered..."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
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
                  Post to WIP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
