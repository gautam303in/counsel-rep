import React, { useState } from 'react';
import { Calendar, Clock, FileText, Filter, Milestone, Plus, Tag } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { ChronologyEvent, Matter } from '../../../types';

interface Props {
  matter: Matter;
}

export const ChronologyTab: React.FC<Props> = ({ matter }) => {
  const { chronology, addChronology, documents } = useApp();
  const matterEvents = chronology
    .filter((e) => e.matterId === matter.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ChronologyEvent['category']>('Factual Event');
  const [significance, setSignificance] = useState<ChronologyEvent['significance']>('Major');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    addChronology({
      matterId: matter.id,
      title,
      date,
      category,
      significance,
      description,
      author: 'Lead Counsel',
    });
    setShowAddModal(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Milestone className="w-4 h-4 text-amber-400" />
            Evidentiary & Procedural Chronology
          </h3>
          <p className="text-xs text-slate-400">
            Factual timeline of pivotal events, pleadings, and sworn depositions
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-slate-950 text-xs font-medium rounded hover:bg-amber-400 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Chronology Event</span>
        </button>
      </div>

      {/* Timeline Stream */}
      <div className="relative border-l border-slate-800 ml-4 pl-6 space-y-6 py-2">
        {matterEvents.map((evt) => {
          const linkedDoc = documents.find((d) => d.id === evt.linkedDocumentId);
          return (
            <div key={evt.id} className="relative group">
              {/* Node Indicator */}
              <div
                className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                  evt.significance === 'Critical'
                    ? 'bg-rose-500 ring-4 ring-rose-500/20'
                    : evt.significance === 'Major'
                    ? 'bg-amber-400 ring-2 ring-amber-400/20'
                    : 'bg-slate-400'
                }`}
              />

              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-mono text-amber-300 font-semibold">{evt.date}</span>
                      <span>·</span>
                      <span className="text-slate-300">{evt.category}</span>
                      <span>·</span>
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                          evt.significance === 'Critical'
                            ? 'text-rose-400 bg-rose-950/40 border border-rose-800/40'
                            : 'text-amber-400 bg-amber-950/40 border border-amber-800/40'
                        }`}
                      >
                        {evt.significance}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-100">{evt.title}</h4>
                  </div>
                  <span className="text-[10px] text-slate-500">By {evt.author}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{evt.description}</p>

                {linkedDoc && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-xs text-amber-300">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Linked Vault Document:</span>
                    <span className="underline cursor-pointer hover:text-amber-200">
                      {linkedDoc.title}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100">Add Chronology Event</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Defendant served First Set of Requests for Production"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    Significance
                  </label>
                  <select
                    value={significance}
                    onChange={(e) => setSignificance(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="Critical">Critical</option>
                    <option value="Major">Major</option>
                    <option value="Routine">Routine</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="Pleading">Pleading</option>
                  <option value="Discovery">Discovery</option>
                  <option value="Hearing">Hearing</option>
                  <option value="Factual Event">Factual Event</option>
                  <option value="Deposition">Deposition</option>
                  <option value="Settlement">Settlement</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Evidentiary Summary
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the legal significance and impact on claims..."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
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
                  Save to Chronology
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
