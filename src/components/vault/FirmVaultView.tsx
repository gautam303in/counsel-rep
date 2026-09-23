import React, { useState } from 'react';
import {
  Download,
  Eye,
  FileCode,
  FileSpreadsheet,
  FileText,
  Filter,
  Folder,
  FolderLock,
  FolderPlus,
  FolderUp,
  Grid,
  Image,
  LayoutGrid,
  Link2,
  List,
  Lock,
  MoreHorizontal,
  Plus,
  Search,
  Share2,
  ShieldCheck,
  Tag,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAudit } from '../../hooks/useAudit';
import { evaluateMatterAccess } from '../../services/matterPolicy';
import { formatCurrency } from '../../services/financials';
import { VaultDocument } from '../../types';
import { VaultDropzone } from './VaultDropzone';
import { UploadProgressDrawer, UploadTask } from './UploadProgressDrawer';

export const FirmVaultView: React.FC = () => {
  const {
    documents,
    matters,
    currentUser,
    ethicalWalls,
    logAudit,
    setActiveMatterId,
    setCurrentView,
    setMatterSubTab,
  } = useApp();
  const { logDocumentAction } = useAudit();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('ALL');
  const [activePreviewDoc, setActivePreviewDoc] = useState<VaultDocument | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderList, setFolderList] = useState<string[]>([
    'ALL',
    'Pleadings',
    'Discovery',
    'Contracts',
    'Exhibits',
    'Drafts',
  ]);

  // Filter documents through the Matter Access Policy below the UI layer!
  const permittedDocs = documents.filter((doc) => {
    const matter = matters.find((m) => m.id === doc.matterId);
    if (!matter) return false;
    const auth = evaluateMatterAccess(currentUser, matter, ethicalWalls);
    return auth.isPermitted;
  });

  const filteredDocs = permittedDocs.filter((doc) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      doc.title.toLowerCase().includes(term) ||
      doc.fileName.toLowerCase().includes(term) ||
      (doc.ocrExtractedText && doc.ocrExtractedText.toLowerCase().includes(term)) ||
      doc.tags.some((t) => t.toLowerCase().includes(term));
    const matchesFolder = selectedFolder === 'ALL' || doc.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const handleDownload = (doc: VaultDocument) => {
    const m = matters.find((item) => item.id === doc.matterId);
    logDocumentAction(
      'DOCUMENT_DOWNLOADED_WATERMARKED',
      doc.id,
      doc.title,
      doc.matterId,
      m?.matterNumber,
      { fileName: doc.fileName, fileSize: doc.fileSize }
    );
    alert(`Downloading "${doc.fileName}" with cryptographic forensic watermark.`);
  };

  const handlePreview = (doc: VaultDocument) => {
    setActivePreviewDoc(doc);
    const m = matters.find((item) => item.id === doc.matterId);
    logDocumentAction(
      'DOCUMENT_VIEWED',
      doc.id,
      doc.title,
      doc.matterId,
      m?.matterNumber,
      { fileName: doc.fileName }
    );
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const trimmed = newFolderName.trim();
    if (!folderList.includes(trimmed)) {
      setFolderList((prev) => [...prev, trimmed]);
    }
    setSelectedFolder(trimmed);
    setNewFolderName('');
    setShowNewFolderModal(false);
  };

  const handleUploadStart = (tasks: UploadTask[]) => {
    setUploadTasks((prev) => [...tasks, ...prev]);
  };

  const handleUploadProgress = (taskId: string, progress: number) => {
    setUploadTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, progress } : t))
    );
  };

  const handleUploadComplete = (task: UploadTask) => {
    setUploadTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: 'complete', progress: 100 } : t))
    );
  };

  // Helper for file type icons matching screenshot in dark scheme
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      return (
        <div className="w-6 h-6 rounded bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
          <FileSpreadsheet className="w-3.5 h-3.5" />
        </div>
      );
    }
    if (ext === 'pdf') {
      return (
        <div className="w-6 h-6 rounded bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400 shrink-0">
          <FileText className="w-3.5 h-3.5" />
        </div>
      );
    }
    if (ext === 'jpg' || ext === 'png' || ext === 'jpeg' || ext === 'webp') {
      return (
        <div className="w-6 h-6 rounded bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400 shrink-0">
          <Image className="w-3.5 h-3.5" />
        </div>
      );
    }
    return (
      <div className="w-6 h-6 rounded bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400 shrink-0">
        <FileText className="w-3.5 h-3.5" />
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-7 bg-slate-950 text-slate-100 font-sans">
      {/* Top Header: Counsel Repos */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white tracking-tight">Counsel Repos</h1>
          <button
            onClick={() => setShowNewFolderModal(true)}
            title="Create New Folder Category"
            className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 transition-colors shadow-xs active:scale-95"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>

        {/* View Switchers (Grid / List in dark scheme) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* QUICK ACCESS FOLDER CARDS in Dark Scheme */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Quick Access
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Blue Folder Card */}
          <div
            onClick={() => setSelectedFolder('Pleadings')}
            className="relative bg-blue-600 text-white rounded-2xl p-5 shadow-lg shadow-blue-600/30 cursor-pointer hover:bg-blue-500 transition-all duration-200 group flex flex-col justify-between h-36 select-none overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold tracking-wider uppercase text-blue-200 mb-2">
                  Shared With
                </div>
                {/* Overlapping Collaborator Avatars */}
                <div className="flex items-center -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-900 border-2 border-blue-600 flex items-center justify-center text-[10px] font-bold">
                    AK
                  </div>
                  <div className="w-6 h-6 rounded-full bg-sky-300 text-slate-900 border-2 border-blue-600 flex items-center justify-center text-[10px] font-bold">
                    SV
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald-300 text-slate-900 border-2 border-blue-600 flex items-center justify-center text-[10px] font-bold">
                    JD
                  </div>
                  <div className="w-6 h-6 rounded-full bg-purple-300 text-slate-900 border-2 border-blue-600 flex items-center justify-center text-[10px] font-bold">
                    EL
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-semibold text-blue-200 uppercase tracking-wide">
                Folder
              </div>
              <div className="text-sm font-bold text-white group-hover:translate-x-0.5 transition-transform truncate">
                Legal Filings & Pleadings
              </div>
            </div>
          </div>

          {/* Card 2: Dark Slate Folder Card */}
          <div
            onClick={() => setSelectedFolder('Discovery')}
            className="relative bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl p-5 hover:bg-slate-850 hover:border-slate-700 cursor-pointer transition-all duration-200 group flex flex-col justify-between h-36 select-none shadow-xs"
          >
            <div>
              <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-2">
                Shared With
              </div>
              <div className="flex items-center -space-x-2">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">
                  MC
                </div>
                <div className="w-6 h-6 rounded-full bg-rose-500 text-white border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">
                  RA
                </div>
                <div className="w-6 h-6 rounded-full bg-teal-500 text-slate-900 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">
                  PL
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                Folder
              </div>
              <div className="text-sm font-bold text-blue-400 group-hover:translate-x-0.5 transition-transform truncate">
                Discovery & Depositions
              </div>
            </div>
          </div>

          {/* Card 3: Dark Slate Folder Card */}
          <div
            onClick={() => setSelectedFolder('Contracts')}
            className="relative bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl p-5 hover:bg-slate-850 hover:border-slate-700 cursor-pointer transition-all duration-200 group flex flex-col justify-between h-36 select-none shadow-xs"
          >
            <div>
              <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-2">
                Shared With
              </div>
              <div className="flex items-center -space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">
                  VS
                </div>
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">
                  TC
                </div>
                <div className="w-6 h-6 rounded-full bg-purple-500 text-white border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">
                  JS
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-700 text-white border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">
                  +3
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                Folder
              </div>
              <div className="text-sm font-bold text-blue-400 group-hover:translate-x-0.5 transition-transform truncate">
                Contracts & Retainers
              </div>
            </div>
          </div>

          {/* Card 4: Document Summary Card */}
          <div
            onClick={() => {
              if (filteredDocs[0]) setActivePreviewDoc(filteredDocs[0]);
            }}
            className="relative bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 cursor-pointer transition-all duration-200 group flex flex-col justify-between h-36 shadow-xs select-none"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800/50">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-100 line-clamp-1">
                  Project Summary For Client
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                J
              </div>
            </div>

            <div className="text-[10px] text-slate-500">
              <div className="uppercase font-semibold tracking-wider">Last Modified</div>
              <div className="text-slate-300 font-medium mt-0.5">Sep 9, 2026 - 4:30 AM</div>
            </div>
          </div>
        </div>
      </div>

      {/* ALL FILES DATA TABLE in Dark Scheme */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            All Files
          </div>
          <div className="text-xs text-slate-500 font-medium font-num">
            {filteredDocs.length} items found
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['ALL', 'Pleadings', 'Discovery', 'Contracts', 'Exhibits', 'Drafts'].map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFolder(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedFolder === f
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Table View */}
        {viewMode === 'list' ? (
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-4">Owners</th>
                  <th className="py-3 px-4">Last Modified</th>
                  <th className="py-3 px-4">File Size / Value</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {filteredDocs.map((doc, idx) => {
                  const m = matters.find((item) => item.id === doc.matterId);
                  const isSelected = selectedDocId === doc.id || (!selectedDocId && idx === 3);

                  return (
                    <tr
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`cursor-pointer transition-colors group ${
                        isSelected
                          ? 'bg-blue-950/40 text-blue-200 font-medium'
                          : 'hover:bg-slate-800/50 text-slate-300'
                      }`}
                    >
                      {/* Name Column */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          {getFileIcon(doc.fileName)}
                          <div className="min-w-0">
                            <span className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate block">
                              {doc.title}
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate">
                              {doc.fileName} · {m?.matterNumber}
                            </span>
                          </div>
                          {doc.isHeld && (
                            <span
                              title="Legal Hold Active"
                              className="px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60 text-[10px] font-bold ml-1"
                            >
                              HOLD
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Owners Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center -space-x-1.5">
                          <div className="w-6 h-6 rounded-full bg-slate-800 text-white border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">
                            {(doc.createdBy || 'VS').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">
                            GC
                          </div>
                        </div>
                      </td>

                      {/* Last Modified */}
                      <td className="py-3.5 px-4 text-slate-400 font-medium whitespace-nowrap">
                        {doc.createdAt} - 4:30 AM
                      </td>

                      {/* File Size / Financial Value */}
                      <td className="py-3.5 px-4 text-slate-300 font-num whitespace-nowrap font-medium">
                        {doc.fileSize}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePreviewDoc(doc);
                            }}
                            title="Preview Document & OCR"
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(doc);
                            }}
                            title="Download Watermarked File"
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Link2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Document Options for: ${doc.title}`);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View Mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer bg-slate-900 flex flex-col justify-between h-44 ${
                  selectedDocId === doc.id
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-800 hover:border-slate-700 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  {getFileIcon(doc.fileName)}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePreviewDoc(doc);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-200"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <div className="text-xs font-bold text-white truncate mb-1">
                    {doc.title}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{doc.fileName}</div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80 pt-2 font-num">
                  <span>{doc.fileSize}</span>
                  <span>{doc.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Forensic OCR Document Preview Modal in Dark Scheme */}
      {activePreviewDoc && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 text-slate-100">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                {getFileIcon(activePreviewDoc.fileName)}
                <div>
                  <h3 className="text-base font-bold text-white">
                    {activePreviewDoc.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {activePreviewDoc.fileName} · {activePreviewDoc.fileSize} · {activePreviewDoc.confidentialityLevel}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActivePreviewDoc(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  OCR Text Content:
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/60 font-semibold">
                  Indexed for Search
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap">
                {activePreviewDoc.ocrExtractedText || 'No extracted OCR text available.'}
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Folder Category
                  </div>
                  <div className="font-semibold text-slate-200 mt-0.5">
                    {activePreviewDoc.folder}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Upload & Custodian
                  </div>
                  <div className="font-semibold text-slate-200 mt-0.5">
                    {activePreviewDoc.createdBy || 'Authorized Partner'} on {activePreviewDoc.createdAt}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Cryptographic forensic watermarking active.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePreviewDoc(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownload(activePreviewDoc)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Watermarked PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
