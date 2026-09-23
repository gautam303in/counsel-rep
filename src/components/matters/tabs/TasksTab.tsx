import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Gavel,
  Plus,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Matter, MatterTask } from '../../../types';

interface Props {
  matter: Matter;
}

export const TasksTab: React.FC<Props> = ({ matter }) => {
  const { tasks, addTask, users } = useApp();
  const matterTasks = tasks.filter((t) => t.matterId === matter.id);

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('2026-10-30');
  const [assignedTo, setAssignedTo] = useState(users[3]?.id || 'usr-4');
  const [category, setCategory] = useState<MatterTask['category']>('Filing');
  const [courtMandated, setCourtMandated] = useState(true);
  const [priority, setPriority] = useState<MatterTask['priority']>('High');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    addTask({
      matterId: matter.id,
      title,
      dueDate,
      assignedToUserId: assignedTo,
      category,
      status: 'PENDING',
      courtMandated,
      priority,
    });
    setShowAddModal(false);
    setTitle('');
  };

  // Generate and download .ics calendar file for court deadlines
  const handleExportICS = () => {
    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//AlphaCounsel//Legal Calendar//EN\nCALSCALE:GREGORIAN\n`;
    matterTasks.forEach((task) => {
      const dtFormatted = task.dueDate.replace(/-/g, '');
      icsContent += `BEGIN:VEVENT\nSUMMARY:${task.courtMandated ? '[COURT DEADLINE] ' : ''}${task.title}\nDESCRIPTION:Matter: ${matter.matterNumber} - ${matter.title}\\nCategory: ${task.category}\\nPriority: ${task.priority}\nDTSTART;VALUE=DATE:${dtFormatted}\nDTEND;VALUE=DATE:${dtFormatted}\nSTATUS:CONFIRMED\nEND:VEVENT\n`;
    });
    icsContent += `END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${matter.matterNumber}_court_deadlines.ics`;
    link.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Gavel className="w-4 h-4 text-amber-400" />
            Court Deadlines & Case Tasks
          </h3>
          <p className="text-xs text-slate-400">
            Statutory limitations, filing milestones, and docket deadlines
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportICS}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium rounded hover:bg-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export .ICS Calendar</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-slate-950 text-xs font-medium rounded hover:bg-amber-400 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Deadline</span>
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {matterTasks.map((t) => {
          const assignee = users.find((u) => u.id === t.assignedToUserId);
          const isOverdue = new Date(t.dueDate).getTime() < Date.now();
          return (
            <div
              key={t.id}
              className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${
                    t.priority === 'High' ? 'bg-rose-500' : 'bg-amber-400'
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-100">{t.title}</span>
                    {t.courtMandated && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-950/50 text-rose-300 border border-rose-800/60 uppercase">
                        Court Mandate
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="font-mono text-slate-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Due: {t.dueDate}
                    </span>
                    <span>·</span>
                    <span>{t.category}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                      Assigned: {assignee?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded border ${
                  t.status === 'COMPLETED'
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                    : isOverdue
                    ? 'bg-rose-950/40 text-rose-400 border-rose-800/60'
                    : 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                }`}
              >
                {t.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100">Add Court Deadline / Task</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Serve Expert Rebuttal Disclosures"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                    Assignee
                  </label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role.slice(0, 10)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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
                    <option value="Filing">Filing</option>
                    <option value="Court Hearing">Court Hearing</option>
                    <option value="Statutory Deadline">Statutory Deadline</option>
                    <option value="Discovery Response">Discovery Response</option>
                    <option value="Drafting">Drafting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="courtMandate"
                  checked={courtMandated}
                  onChange={(e) => setCourtMandated(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500/30"
                />
                <label htmlFor="courtMandate" className="text-xs text-slate-300 font-medium">
                  Statutory or Court-Mandated Order (ECF Filing)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
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
                  Schedule Deadline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
