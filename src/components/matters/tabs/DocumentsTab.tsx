import React, { useState } from 'react';
import {
  Clock,
  Download,
  Eye,
  FileCheck,
  FileCode,
  FileText,
  Folder,
  FolderLock,
  History,
  Lock,
  Plus,
  Share2,
  ShieldAlert,
  Tag,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Matter, VaultDocument } from '../../../types';

interface Props {
  matter: Matter;
}

const FOLDERS: VaultDocument['folder'][] = [
  'Pleadings',
  'Discovery',
  'Correspondence',
  'Contracts',
  'Exhibits',
  'Drafts',
];

export const DocumentsTab: React.FC<Props> = ({ matter }) => {
  const { documents, addDocument, logAudit, currentUser } = useApp();
  const matterDocs = documents.filter((d) => d.matterId === matter.id);

  const [selectedFolder, setSelectedFolder] = useState<VaultDocument['folder'] | 'ALL'>('ALL');
  const [activeDocPreview, setActiveDocPreview] = useState<VaultDocument | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [shareLinkInfo, setShareLinkInfo] = useState<{ docTitle: string; url: string } | null>(null);

  // Upload Form
  const [title, setTitle] = useState('');
  const [fileName, setFileName] = useState('');
  const [folder, setFolder] = useState<VaultDocument['folder']>('Pleadings');
  const [confidentiality, setConfidentiality] = useState<VaultDocument['confidentialityLevel']>('Firm Confidential');
  const [ocrText, setOcrText] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const filteredDocs = selectedFolder === 'ALL'
    ? matterDocs
    : matterDocs.filter((d) => d.folder === selectedFolder);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addDocument({
      matterId: matter.id,
      folder,
      title,
      fileName: fileName || `${title.replace(/\s+/g, '_')}.pdf`,
      fileType: 'pdf',
      fileSize: '3.4 MB',
      createdBy: currentUser.name,
      isHeld: matter.hasActiveHold, // Invariant: New content inherits hold!
      legalHoldId: matter.hasActiveHold ? 'lh-1' : undefined,
      ocrExtractedText: ocrText || `VERIFIED RECORD: Document ${title} indexed for full-text search.`,
      tags: tags.length > 0 ? tags : ['Vault Intake'],
      confidentialityLevel: confidentiality,
    });

    setShowUploadModal(false);
    setTitle('');
    setFileName('');
    setOcrText('');
    setTagsInput('');
  };

  const handleDownload = (doc: VaultDocument, watermarked: boolean) => {
    logAudit(
      watermarked ? 'DOCUMENT_DOWNLOADED_WATERMARKED' : 'DOCUMENT_VIEWED',
      'Document',
      doc.id,
      `User ${currentUser.name} downloaded ${watermarked ? 'WATERMARKED' : 'ORIGINAL'} copy of "${doc.title}".`,
      matter.id,
      matter.matterNumber
    );
    alert(
      `Downloading "${doc.fileName}" ${
        watermarked ? 'with mandatory [PRIVILEGED & CONFIDENTIAL] forensic watermark' : ''
      }.\nAudit event permanently recorded.`
    );
  };

  const handleCreateShareLink = (doc: VaultDocument) => {
    const token = Math.random().toString(36).substring(2, 10);
    const link = `https://vault.alphacounsel.law/s/${matter.matterNumber}/${doc.id}?exp=72h&auth=${token}`;
    setShareLinkInfo({ docTitle: doc.title, url: link });
    logAudit(
      'DOCUMENT_VIEWED',
      'Document',
      doc.id,
      `Expiring share link generated (72hr validity) for "${doc.title}".`,
      matter.id,
      matter.matterNumber
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <FolderLock className="w-4 h-4 text-amber-400" />
            Matter Document Vault
          </h3>
          <p className="text-xs text-slate-400">
            Immutable document versioning, OCR index, and legal hold lock enforcement
          </p>
        </div>

        <div className="flex items-center gap-2">
          {matter.hasActiveHold && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-950/40 border border-rose-800/50 rounded text-xs text-rose-300 font-medium">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>Legal Hold Active: Destructive operations blocked</span>
            </div>
          )}
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-slate-950 text-xs font-medium rounded hover:bg-amber-400 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Folders Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedFolder('ALL')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            selectedFolder === 'ALL'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
        >
          <Folder className="w-3.5 h-3.5" />
          <span>All Folders ({matterDocs.length})</span>
        </button>

        {FOLDERS.map((fld) => {
          const count = matterDocs.filter((d) => d.folder === fld).length;
          return (
            <button
              key={fld}
              onClick={() => setSelectedFolder(fld)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                selectedFolder === fld
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>
                {fld} ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 space-y-3 hover:border-slate-700 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-400/90 uppercase tracking-wider font-semibold">
                      {doc.folder} · {doc.currentVersion}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-100 line-clamp-1 group-hover:text-amber-300 transition-colors">
                      {doc.title}
                    </h4>
                  </div>
                </div>

                {doc.isHeld && (
                  <span
                    title="Document is frozen under active Legal Hold"
                    className="p-1 rounded bg-rose-950/60 text-rose-400 border border-rose-800/60"
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                <span>{doc.fileName}</span>
                <span>{doc.fileSize}</span>
              </div>

              {doc.ocrExtractedText && (
                <div className="bg-slate-950/60 border border-slate-800/80 rounded p-2 text-[11px] text-slate-400 line-clamp-2 italic">
                  "{doc.ocrExtractedText}"
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {doc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <button
                onClick={() => setActiveDocPreview(doc)}
                className="flex items-center gap-1 text-slate-300 hover:text-amber-300 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>OCR & Versions</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCreateShareLink(doc)}
                  title="Generate Expiring Share Link"
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDownload(doc, true)}
                  title="Download with Privileged Watermark"
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-amber-300 rounded transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* OCR & Version History Modal */}
      {activeDocPreview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-400 uppercase tracking-wider font-semibold">
                    {activeDocPreview.folder}
                  </span>
                  {activeDocPreview.isHeld && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Preservation Hold Frozen
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-slate-100 mt-1">
                  {activeDocPreview.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveDocPreview(null)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* OCR Full Text Preview */}
              <div>
                <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-amber-400" />
                  Full-Text OCR Extracted Index
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono text-slate-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {activeDocPreview.ocrExtractedText || 'No OCR text extracted.'}
                </div>
              </div>

              {/* Version History */}
              <div>
                <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  Immutable Version Log
                </div>
                <div className="space-y-1.5">
                  {activeDocPreview.versions.map((ver) => (
                    <div
                      key={ver.versionNumber}
                      className="flex items-center justify-between p-2.5 rounded bg-slate-950/60 border border-slate-800 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-amber-300">{ver.versionNumber}</span>
                        <span className="text-slate-400 ml-2 font-mono">
                          {new Date(ver.uploadedAt).toLocaleString()}
                        </span>
                        {ver.notes && (
                          <div className="text-[11px] text-slate-400 mt-0.5">{ver.notes}</div>
                        )}
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">{ver.fileSize}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Watermark Notice */}
              <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-md text-xs text-amber-300/90 leading-relaxed">
                <strong>Forensic Watermarking Enabled:</strong> Any export from this vault contains
                an invisible cryptographic tracking tag matching user identity (
                {currentUser.name}) and matter timestamp to preserve chain of custody.
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => handleCreateShareLink(activeDocPreview)}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 bg-slate-800 rounded"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Create Expiring Share</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(activeDocPreview, true)}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-950 px-3 py-1.5 bg-amber-500 rounded hover:bg-amber-400"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Watermarked PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Link Modal */}
      {shareLinkInfo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-400" />
              Expiring Secure Document Share
            </h3>
            <p className="text-xs text-slate-400">
              72-Hour tokenized link with client & opposing counsel audit log.
            </p>

            <div>
              <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                Document
              </label>
              <div className="text-xs font-semibold text-slate-200">{shareLinkInfo.docTitle}</div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                Secure Vault URL
              </label>
              <input
                type="text"
                readOnly
                value={shareLinkInfo.url}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-emerald-300 select-all"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShareLinkInfo(null)}
                className="px-3 py-1.5 bg-amber-500 text-slate-950 font-medium text-xs rounded hover:bg-amber-400"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100">Upload to Matter Vault</h3>
            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Reply Declaration of Expert Lindqvist"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                    Folder
                  </label>
                  <select
                    value={folder}
                    onChange={(e) => setFolder(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                  >
                    {FOLDERS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                    Confidentiality
                  </label>
                  <select
                    value={confidentiality}
                    onChange={(e) => setConfidentiality(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="Firm Confidential">Firm Confidential</option>
                    <option value="Highly Confidential - Attorneys Eyes Only">
                      Highly Confidential (AEO)
                    </option>
                    <option value="Public">Public</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. Motion, Infringement, Exhibit"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                  OCR Text Extract
                </label>
                <textarea
                  rows={3}
                  value={ocrText}
                  onChange={(e) => setOcrText(e.target.value)}
                  placeholder="Extracted textual content for full-text search and AI citations..."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-500 text-slate-950 font-medium text-xs rounded hover:bg-amber-400"
                >
                  Ingest & Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
