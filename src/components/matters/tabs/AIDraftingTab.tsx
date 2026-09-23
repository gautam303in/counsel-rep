import React, { useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Copy,
  Download,
  FileCheck,
  FileText,
  FolderPlus,
  Loader2,
  Quote,
  Scale,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { generateLegalDraft } from '../../../services/aiService';
import { AIDraftRequest, AIDraftResult, Matter } from '../../../types';

interface Props {
  matter: Matter;
}

export const AIDraftingTab: React.FC<Props> = ({ matter }) => {
  const { documents, addDocument, logAudit, currentUser } = useApp();
  const matterDocs = documents.filter((d) => d.matterId === matter.id);

  const [documentType, setDocumentType] = useState<AIDraftRequest['documentType']>(
    'Motion for Summary Judgment'
  );
  const [jurisdiction, setJurisdiction] = useState(
    matter.courtVenue || 'United States District Court, N.D. Cal.'
  );
  const [clientPosition, setClientPosition] = useState(
    `Plaintiff ${matter.clientName} maintains that Defendant engaged in willful, unauthorized misappropriation of proprietary autonomous lidar firmware algorithms.`
  );
  const [keyLegalArguments, setKeyLegalArguments] = useState(
    `Defendant's principal engineer copied 4.2 GB of core repository files immediately prior to resignation. Claim 1 and Claim 8 of Patent 11,892,104 are literally infringed as proven by side-by-side decompilation. Summary judgment is mandated under Rule 56.`
  );
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(
    matterDocs.slice(0, 2).map((d) => d.id)
  );
  const [includeWatermark, setIncludeWatermark] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [draftResult, setDraftResult] = useState<AIDraftResult | null>(null);
  const [committedToVault, setCommittedToVault] = useState(false);

  const toggleDocSelection = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((dId) => dId !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setCommittedToVault(false);
    try {
      const result = await generateLegalDraft(
        {
          documentType,
          matterId: matter.id,
          jurisdiction,
          clientPosition,
          keyLegalArguments,
          selectedDocumentIds: selectedDocIds,
          includeWatermark,
        },
        matterDocs,
        matter.title,
        matter.clientName
      );
      setDraftResult(result);
      logAudit(
        'AI_DRAFT_REQUESTED',
        'AI',
        result.id,
        `Generated ${documentType} with ${result.citations.length} citations and ${result.tokenCount} tokens for ${matter.matterNumber}.`,
        matter.id,
        matter.matterNumber
      );
    } catch (err) {
      console.error(err);
      alert('Failed to generate draft. Please verify configuration.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCommitToVault = () => {
    if (!draftResult) return;

    addDocument({
      matterId: matter.id,
      folder: 'Drafts',
      title: draftResult.title,
      fileName: `${draftResult.documentType.replace(/\s+/g, '_')}_Draft_v1.0.docx`,
      fileType: 'docx',
      fileSize: `${Math.round(draftResult.content.length / 100) / 10} KB`,
      createdBy: `${currentUser.name} (AlphaCounsel AI)`,
      isHeld: matter.hasActiveHold,
      ocrExtractedText: draftResult.content.slice(0, 500) + '...',
      tags: ['AI Draft', draftResult.documentType, 'Partner Review'],
      confidentialityLevel: 'Firm Confidential',
    });

    setCommittedToVault(true);
    logAudit(
      'AI_DRAFT_COMMITTED',
      'Document',
      draftResult.id,
      `Committed AI draft "${draftResult.title}" into Matter Vault as v1.0.`,
      matter.id,
      matter.matterNumber
    );
  };

  const handleCopy = () => {
    if (draftResult) {
      navigator.clipboard.writeText(draftResult.content);
      alert('Draft copied to clipboard.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            AI Drafting Studio & Citation Mapping
          </h3>
          <p className="text-xs text-slate-400">
            Jurisdictional brief synthesis, grounded against authorized Matter Vault records
          </p>
        </div>

        {draftResult && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium rounded hover:bg-slate-700 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Text</span>
            </button>
            <button
              onClick={handleCommitToVault}
              disabled={committedToVault}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                committedToVault
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                  : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
              }`}
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>{committedToVault ? 'Committed to Vault (v1.0)' : 'Save to Vault'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Configuration Parameters & Vault Grounding */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
            Drafting Specifications
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
              Instrument Type
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 font-medium"
            >
              <option value="Motion for Summary Judgment">Motion for Summary Judgment</option>
              <option value="Demand Letter">Demand Letter</option>
              <option value="Non-Disclosure Agreement">Non-Disclosure Agreement</option>
              <option value="Engagement Letter">Engagement Letter</option>
              <option value="Client Legal Opinion">Client Legal Opinion</option>
              <option value="Notice of Deposition">Notice of Deposition</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
              Court / Jurisdiction
            </label>
            <input
              type="text"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
              Client Posture & Position
            </label>
            <textarea
              rows={2}
              value={clientPosition}
              onChange={(e) => setClientPosition(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
              Substantive Legal Arguments & Statutes
            </label>
            <textarea
              rows={3}
              value={keyLegalArguments}
              onChange={(e) => setKeyLegalArguments(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none"
            />
          </div>

          {/* Vault Document Selection for Context Injection */}
          <div>
            <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Authorized Vault Documents for Grounding</span>
              <span className="font-num text-amber-400">
                {selectedDocIds.length} of {matterDocs.length} Selected
              </span>
            </label>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {matterDocs.map((doc) => {
                const isChecked = selectedDocIds.includes(doc.id);
                return (
                  <div
                    key={doc.id}
                    onClick={() => toggleDocSelection(doc.id)}
                    className={`p-2 rounded border text-xs cursor-pointer flex items-start gap-2.5 transition-colors ${
                      isChecked
                        ? 'bg-amber-500/10 border-amber-500/30 text-slate-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500/30"
                    />
                    <div className="overflow-hidden flex-1">
                      <div className="font-semibold truncate">{doc.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {doc.folder} · {doc.currentVersion}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Watermark Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span className="text-xs text-slate-300">
              Apply Privileged & Confidential Watermark
            </span>
            <button
              onClick={() => setIncludeWatermark(!includeWatermark)}
              className="text-amber-400"
            >
              {includeWatermark ? (
                <ToggleRight className="w-6 h-6" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-slate-600" />
              )}
            </button>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2.5 bg-amber-500 text-slate-950 font-semibold text-xs rounded-md hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing Legal Brief & Citations...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Grounded Instrument</span>
              </>
            )}
          </button>
        </div>

        {/* Right 7 Cols: Draft Preview & Interactive Citation Inspector */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-lg p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Draft Instrument Preview
                </h4>
              </div>
              {draftResult && (
                <span className="text-[11px] font-mono text-slate-400">
                  {draftResult.tokenCount} Tokens · {draftResult.citations.length} Citations
                </span>
              )}
            </div>

            {isGenerating ? (
              <div className="h-96 flex flex-col items-center justify-center space-y-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                <p className="text-xs">
                  Reviewing statutory precedents and analyzing {selectedDocIds.length} vault documents...
                </p>
              </div>
            ) : draftResult ? (
              <div className="space-y-4">
                {/* Draft Document Box */}
                <div
                  className={`bg-slate-950 border border-slate-800 rounded-lg p-5 font-legal-heading text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto relative ${
                    draftResult.watermark ? 'watermark-draft' : ''
                  }`}
                >
                  {draftResult.content}
                </div>

                {/* Citation Mapping Drawer */}
                {draftResult.citations.length > 0 && (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-2">
                    <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Quote className="w-3.5 h-3.5" />
                      Verified Evidentiary Citations
                    </div>
                    <div className="space-y-1.5">
                      {draftResult.citations.map((cite) => (
                        <div
                          key={cite.citationNumber}
                          className="p-2 rounded bg-slate-900 border border-slate-800 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-slate-300 font-medium">
                            <span className="text-amber-300">
                              [Citation {cite.citationNumber}]: {cite.sourceDocTitle}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Doc ID: {cite.sourceDocId}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 italic">
                            "{cite.quotedText}"
                          </div>
                          <div className="text-[10px] text-emerald-400">{cite.relevance}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-96 border border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-500">
                <FileText className="w-8 h-8 text-slate-600" />
                <p className="text-xs font-medium text-slate-400">No Draft Generated Yet</p>
                <p className="text-[11px] max-w-sm text-slate-500">
                  Configure the instrument specifications on the left and click "Generate Grounded
                  Instrument" to synthesize a court-ready draft with citations.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
