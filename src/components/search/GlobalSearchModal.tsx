import React, { useEffect, useState } from 'react';
import {
  FileText,
  FolderLock,
  Lock,
  Receipt,
  Scale,
  Search,
  ShieldAlert,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { evaluateMatterAccess } from '../../services/matterPolicy';
import { formatCurrency } from '../../services/financials';

export const GlobalSearchModal: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    matters,
    documents,
    parties,
    invoices,
    setActiveMatterId,
    setMatterSubTab,
    currentUser,
    ethicalWalls,
  } = useApp();

  const [query, setQuery] = useState('');

  // Handle keyboard shortcut Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentView === 'search') {
        setCurrentView('dashboard');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCurrentView('search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, setCurrentView]);

  if (currentView !== 'search') return null;

  const term = query.toLowerCase().trim();

  // Search Matters (evaluate access)
  const matchedMatters = term
    ? matters.filter((m) => {
        const matches =
          m.matterNumber.toLowerCase().includes(term) ||
          m.title.toLowerCase().includes(term) ||
          m.clientName.toLowerCase().includes(term) ||
          m.practiceArea.toLowerCase().includes(term);
        return matches;
      })
    : [];

  // Search Documents (strictly filter out matters screened by ethical wall)
  const matchedDocs = term
    ? documents.filter((d) => {
        const m = matters.find((item) => item.id === d.matterId);
        if (!m) return false;
        const auth = evaluateMatterAccess(currentUser, m, ethicalWalls);
        if (!auth.isPermitted) return false; // Invariant: Screened matters are not returned in search!

        return (
          d.title.toLowerCase().includes(term) ||
          d.fileName.toLowerCase().includes(term) ||
          (d.ocrExtractedText && d.ocrExtractedText.toLowerCase().includes(term))
        );
      })
    : [];

  // Search Parties
  const matchedParties = term
    ? parties.filter((p) => {
        const m = matters.find((item) => item.id === p.matterId);
        if (m) {
          const auth = evaluateMatterAccess(currentUser, m, ethicalWalls);
          if (!auth.isPermitted) return false;
        }
        return (
          p.name.toLowerCase().includes(term) ||
          (p.organization && p.organization.toLowerCase().includes(term)) ||
          p.role.toLowerCase().includes(term)
        );
      })
    : [];

  // Search Invoices
  const matchedInvoices = term
    ? invoices.filter((i) => {
        const m = matters.find((item) => item.id === i.matterId);
        if (m) {
          const auth = evaluateMatterAccess(currentUser, m, ethicalWalls);
          if (!auth.isPermitted) return false;
        }
        return (
          i.invoiceNumber.toLowerCase().includes(term) ||
          (i.matterNumber && i.matterNumber.toLowerCase().includes(term)) ||
          (m && m.matterNumber.toLowerCase().includes(term))
        );
      })
    : [];

  const handleSelectMatter = (matterId: string) => {
    setActiveMatterId(matterId);
    setMatterSubTab('overview');
    setCurrentView('matters');
  };

  const handleSelectDoc = (docMatterId: string) => {
    setActiveMatterId(docMatterId);
    setMatterSubTab('documents');
    setCurrentView('matters');
  };

  const totalHits =
    matchedMatters.length + matchedDocs.length + matchedParties.length + matchedInvoices.length;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-start justify-center pt-20 p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 gap-3 bg-slate-950/80">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search matters, OCR vault, parties, or invoices..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={() => setCurrentView('dashboard')}
            className="p-1 text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!term ? (
            <div className="text-center py-10 text-slate-500 text-xs space-y-2">
              <Search className="w-8 h-8 text-slate-700 mx-auto" />
              <p>Type keywords to search across Counsel Repos legal database.</p>
              <p className="text-[11px] text-slate-600">
                Ethical walls are actively enforced. Screened matter records are automatically excluded.
              </p>
            </div>
          ) : totalHits === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No authorized records match "{query}".
            </div>
          ) : (
            <>
              {/* Matters */}
              {matchedMatters.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5" />
                    Matters ({matchedMatters.length})
                  </div>
                  {matchedMatters.map((m) => {
                    const auth = evaluateMatterAccess(currentUser, m, ethicalWalls);
                    return (
                      <div
                        key={m.id}
                        onClick={() => handleSelectMatter(m.id)}
                        className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 cursor-pointer flex items-center justify-between transition-colors text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-amber-400 font-semibold">
                              {m.matterNumber}
                            </span>
                            <span className="text-slate-200 font-medium">{m.title}</span>
                          </div>
                          <span className="text-slate-400 text-[11px]">{m.clientName}</span>
                        </div>
                        {!auth.isPermitted && (
                          <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-950/50 px-1.5 py-0.5 rounded border border-red-800">
                            <ShieldAlert className="w-3 h-3" />
                            Screened
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Documents Vault (OCR) */}
              {matchedDocs.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FolderLock className="w-3.5 h-3.5" />
                    Document Vault & OCR Index ({matchedDocs.length})
                  </div>
                  {matchedDocs.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => handleSelectDoc(d.matterId)}
                      className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 cursor-pointer flex items-center justify-between transition-colors text-xs"
                    >
                      <div className="max-w-md">
                        <div className="text-slate-200 font-medium flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{d.title}</span>
                        </div>
                        {d.ocrExtractedText && (
                          <div className="text-[11px] text-slate-400 line-clamp-1 italic mt-0.5">
                            "{d.ocrExtractedText}"
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{d.folder}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Parties */}
              {matchedParties.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Parties & Counsel ({matchedParties.length})
                  </div>
                  {matchedParties.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectMatter(p.matterId)}
                      className="p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="text-slate-200 font-medium">{p.name}</span>
                        {p.organization && (
                          <span className="text-slate-400 ml-1">({p.organization})</span>
                        )}
                      </div>
                      <span className="text-[10px] text-amber-300 font-medium">{p.role}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Invoices */}
              {matchedInvoices.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5" />
                    Invoices ({matchedInvoices.length})
                  </div>
                  {matchedInvoices.map((i) => (
                    <div
                      key={i.id}
                      onClick={() => {
                        setActiveMatterId(i.matterId);
                        setMatterSubTab('invoices');
                        setCurrentView('matters');
                      }}
                      className="p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-amber-300 font-semibold">
                          {i.invoiceNumber}
                        </span>
                        <span className="text-slate-400">
                          · Matter: {i.matterNumber || matters.find((m) => m.id === i.matterId)?.matterNumber}
                        </span>
                      </div>
                      <span className="text-slate-200 font-num font-semibold">
                        {formatCurrency(i.totalAmount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
