import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import {
  UploadCloud,
  FolderUp,
  FileUp,
  CheckCircle2,
  Folder,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAudit } from '../../hooks/useAudit';
import { scanDroppedItems, scanInputFiles, ScannedUploadItem } from '../../utils/fileUpload';
import { UploadTask } from './UploadProgressDrawer';
import { VaultDocument } from '../../types';

interface VaultDropzoneProps {
  currentFolder?: string;
  onUploadStart?: (tasks: UploadTask[]) => void;
  onUploadProgress?: (taskId: string, progress: number) => void;
  onUploadComplete?: (task: UploadTask, doc: VaultDocument) => void;
  compact?: boolean;
}

export const VaultDropzone: React.FC<VaultDropzoneProps> = ({
  currentFolder = 'Discovery',
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  compact = false,
}) => {
  const { matters, activeMatterId, addDocument, currentUser } = useApp();
  const { logDocumentAction } = useAudit();

  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedMatterId, setSelectedMatterId] = useState<string>(
    activeMatterId || matters[0]?.id || ''
  );
  const [targetCategory, setTargetCategory] = useState<string>(
    currentFolder === 'ALL' ? 'Discovery' : currentFolder
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const activeMatter =
    matters.find((m) => m.id === selectedMatterId) || matters[0];

  const processScannedItems = async (items: ScannedUploadItem[]) => {
    if (items.length === 0) return;

    // Create initial upload tasks
    const newTasks: UploadTask[] = items.map((item, idx) => ({
      id: `up-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      name: item.relativePath || item.file.name,
      folder: item.folderName !== 'Root' ? item.folderName : targetCategory,
      size: item.sizeFormatted,
      status: 'uploading',
      progress: 10,
    }));

    if (onUploadStart) {
      onUploadStart(newTasks);
    }

    // Process each upload with simulated asynchronous progress
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const task = newTasks[i];
      const assignedFolder =
        item.folderName && item.folderName !== 'Root'
          ? item.folderName
          : targetCategory;

      const ext = item.file.name.split('.').pop()?.toLowerCase();
      let fileType: VaultDocument['fileType'] = 'pdf';
      if (ext === 'docx') fileType = 'docx';
      else if (ext === 'xlsx' || ext === 'xls') fileType = 'xlsx';
      else if (ext === 'txt') fileType = 'txt';

      const docTitle = item.file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');

      // Simulate progress ticks
      await new Promise((r) => setTimeout(r, 120));
      if (onUploadProgress) onUploadProgress(task.id, 50);

      await new Promise((r) => setTimeout(r, 150));
      if (onUploadProgress) onUploadProgress(task.id, 90);

      // Add to context
      addDocument({
        matterId: activeMatter.id,
        folder: assignedFolder as any,
        title: docTitle,
        fileName: item.file.name,
        fileType,
        fileSize: item.sizeFormatted,
        createdBy: currentUser.name,
        isHeld: activeMatter.hasActiveHold,
        legalHoldId: activeMatter.hasActiveHold ? 'lh-1' : undefined,
        ocrExtractedText: `INGESTION RECORD: ${item.file.name} uploaded to ${assignedFolder} in matter ${activeMatter.matterNumber}. Forensic metadata indexed.`,
        tags: [assignedFolder, 'Direct Intake', item.file.type || 'Document'],
        confidentialityLevel: 'Firm Confidential',
      });

      // Audit event
      logDocumentAction(
        'DOCUMENT_UPLOADED',
        task.id,
        docTitle,
        activeMatter.id,
        activeMatter.matterNumber,
        {
          fileName: item.file.name,
          folder: assignedFolder,
          fileSize: item.sizeFormatted,
          relativeHierarchy: item.relativePath,
        }
      );

      if (onUploadProgress) onUploadProgress(task.id, 100);
      if (onUploadComplete) {
        onUploadComplete(
          { ...task, status: 'complete', progress: 100 },
          {
            id: task.id,
            matterId: activeMatter.id,
            folder: assignedFolder as any,
            title: docTitle,
            fileName: item.file.name,
            fileType,
            fileSize: item.sizeFormatted,
            createdAt: new Date().toISOString().split('T')[0],
            createdBy: currentUser.name,
            currentVersion: '1.0',
            versions: [],
            isHeld: activeMatter.hasActiveHold,
            tags: [assignedFolder],
            confidentialityLevel: 'Firm Confidential',
          }
        );
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer) {
      const scanned = await scanDroppedItems(e.dataTransfer, targetCategory);
      if (scanned.length > 0) {
        await processScannedItems(scanned);
      }
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const scanned = scanInputFiles(e.target.files, targetCategory);
      await processScannedItems(scanned);
      e.target.value = '';
    }
  };

  const handleFolderChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const scanned = scanInputFiles(e.target.files, targetCategory);
      await processScannedItems(scanned);
      e.target.value = '';
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Hidden file & folder inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
      />
      {/* Folder input with webkitdirectory */}
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderChange}
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
      />

      {/* Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl transition-all p-6 text-center select-none ${
          isDragOver
            ? 'border-blue-500 bg-blue-950/40 shadow-lg shadow-blue-500/20 scale-[1.008]'
            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/80'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          {/* Animated Cloud Icon */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              isDragOver
                ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-600/50 animate-bounce'
                : 'bg-blue-950/80 border border-blue-800/60 text-blue-400 group-hover:scale-105'
            }`}
          >
            {isDragOver ? (
              <FolderUp className="w-7 h-7" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          {/* Heading and Details */}
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              {isDragOver
                ? 'Release to upload files and folders into Counsel Repos'
                : 'Drag & Drop files or entire folders here to upload'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
              Drop individual documents or complete directory hierarchies. All contents will be
              ingested, tagged, and indexed for search automatically.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-95"
            >
              <FileUp className="w-4 h-4" />
              <span>Browse Files</span>
            </button>

            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 shadow-xs transition-all active:scale-95"
            >
              <FolderUp className="w-4 h-4 text-amber-400" />
              <span>Upload Entire Folder</span>
            </button>
          </div>

          {/* Target Matter and Category Selectors Strip */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-medium text-slate-500 uppercase">Target Matter:</span>
              <select
                value={selectedMatterId}
                onChange={(e) => setSelectedMatterId(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                {matters.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-slate-100">
                    [{m.matterNumber}] {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-medium text-slate-500 uppercase">Default Folder:</span>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                {['Pleadings', 'Discovery', 'Contracts', 'Exhibits', 'Correspondence', 'Drafts'].map(
                  (cat) => (
                    <option key={cat} value={cat} className="bg-slate-900 text-slate-100">
                      {cat}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
