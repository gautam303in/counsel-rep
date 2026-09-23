import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  X,
  Pause,
  Play,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  FileCode,
  Folder,
} from 'lucide-react';

export interface UploadTask {
  id: string;
  name: string;
  folder?: string;
  size: string;
  status: 'uploading' | 'complete' | 'failed';
  progress: number;
}

interface Props {
  tasks?: UploadTask[];
  onRetry?: (id: string) => void;
  onRemove?: (id: string) => void;
  onClose?: () => void;
}

export const UploadProgressDrawer: React.FC<Props> = ({
  tasks,
  onRetry,
  onRemove,
  onClose,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [internalFiles, setInternalFiles] = useState<UploadTask[]>([
    {
      id: 'f1',
      name: 'Brief gobalgabul rev_2.pdf',
      folder: 'Pleadings',
      size: '1.2 MB',
      status: 'complete',
      progress: 100,
    },
    {
      id: 'f2',
      name: 'Discovery Archive.zip',
      folder: 'Discovery',
      size: '8.4 MB',
      status: 'complete',
      progress: 100,
    },
    {
      id: 'f3',
      name: 'Corporate M&A Disclosure.docx',
      folder: 'Contracts',
      size: '4.8 MB',
      status: 'complete',
      progress: 100,
    },
  ]);

  const activeFiles = tasks && tasks.length > 0 ? tasks : internalFiles;

  if (!internalIsOpen || activeFiles.length === 0) return null;

  const handleRetry = (id: string) => {
    if (onRetry) {
      onRetry(id);
    } else {
      setInternalFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: 'uploading', progress: 60 } : f))
      );
    }
  };

  const handleRemove = (id: string) => {
    if (onRemove) {
      onRemove(id);
    } else {
      setInternalFiles((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const handleClose = () => {
    setInternalIsOpen(false);
    if (onClose) onClose();
  };

  const totalProgress = Math.round(
    activeFiles.reduce((sum, f) => sum + f.progress, 0) / activeFiles.length
  );

  return (
    <div className="fixed bottom-6 right-8 z-50 w-96 bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-800 overflow-hidden font-sans select-none transition-all duration-300 text-slate-100 ring-1 ring-white/10">
      {/* Drawer Header */}
      <div className="px-4 py-3 bg-slate-900/90 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white">
            Uploading {activeFiles.length} item{activeFiles.length > 1 ? 's' : ''}
          </span>
          <span className="text-xs font-bold text-blue-400 font-num">{totalProgress}%</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Drawer Body */}
      {!isMinimized && (
        <div className="p-3 space-y-2.5 max-h-64 overflow-y-auto bg-slate-950/80 divide-y divide-slate-800/40">
          {activeFiles.map((file) => (
            <div
              key={file.id}
              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                file.status === 'failed'
                  ? 'bg-rose-950/40 border-rose-900/60 text-rose-200'
                  : 'bg-slate-900/80 border-slate-800/80 text-slate-200'
              }`}
            >
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center gap-1.5">
                  {file.folder && (
                    <span className="text-[10px] text-blue-400 flex items-center gap-0.5 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-800/40">
                      <Folder className="w-2.5 h-2.5" />
                      {file.folder}
                    </span>
                  )}
                  <span className="truncate font-medium text-xs text-white" title={file.name}>
                    {file.name}
                  </span>
                </div>

                {file.status === 'uploading' && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-num">{file.progress}%</span>
                  </div>
                )}

                {file.status === 'failed' && (
                  <div className="text-[10px] text-rose-400 font-semibold mt-0.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Upload Failed
                  </div>
                )}

                {file.status === 'complete' && (
                  <div className="text-[10px] text-emerald-400 font-num mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{file.size} · Upload Complete</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {file.status === 'failed' && (
                  <button
                    onClick={() => handleRetry(file.id)}
                    className="px-2 py-0.5 text-[10px] font-bold text-blue-300 hover:text-white bg-blue-950 border border-blue-800 rounded-md hover:bg-blue-900 transition-colors"
                  >
                    Retry
                  </button>
                )}
                <button
                  onClick={() => handleRemove(file.id)}
                  className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-colors"
                  title="Remove"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
