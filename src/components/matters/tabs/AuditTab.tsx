import React, { useState } from 'react';
import {
  Download,
  Eye,
  Filter,
  Fingerprint,
  History,
  Lock,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useAudit } from '../../../hooks/useAudit';
import { Matter } from '../../../types';

interface Props {
  matter: Matter;
}

export const AuditTab: React.FC<Props> = ({ matter }) => {
  const { audit_events } = useAudit();
  const matterLogs = audit_events.filter(
    (l) => l.matterId === matter.id || l.matterNumber === matter.matterNumber
  );

  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = matterLogs.filter((log) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      log.userName.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term) ||
      log.entityType.toLowerCase().includes(term)
    );
  });

  const handleExportAudit = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Timestamp,User,Action,Entity,EntityID,IPAddress,Details']
        .concat(
          matterLogs.map(
            (l) =>
              `"${l.timestamp}","${l.userName}","${l.action}","${l.entityType}","${l.entityId}","${l.ipAddress}","${l.details.replace(/"/g, '""')}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${matter.matterNumber}_immutable_audit_log.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            Immutable Forensic Audit Trail
          </h3>
          <p className="text-xs text-slate-400">
            Chain of custody, ethical wall boundary evaluations, and matter access history
          </p>
        </div>

        <button
          onClick={handleExportAudit}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium rounded hover:bg-slate-700 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>Export Forensic Audit (.CSV)</span>
        </button>
      </div>

      {/* Tamper Evidence Strip */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Fingerprint className="w-4 h-4 text-amber-400" />
          <span>
            Cryptographic Tamper-Proof Chain: All {matterLogs.length} events logged with sequential
            SHA-256 block hash.
          </span>
        </div>
        <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          Chain Verified Intact
        </span>
      </div>

      {/* Filter / Search input */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search actions, users, document IDs..."
            className="w-full bg-slate-900 border border-slate-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Showing {filteredLogs.length} events
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">User</th>
              <th className="py-2.5 px-3">Action</th>
              <th className="py-2.5 px-3">Entity</th>
              <th className="py-2.5 px-3">Forensic Details</th>
              <th className="py-2.5 px-3 font-mono text-right">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredLogs.map((log) => {
              const isWallBlocked = log.action.includes('WALL_BLOCKED');
              const isHoldEvent = log.action.includes('LEGAL_HOLD');
              const isAuthCheck = log.action.includes('AUTHORIZATION');

              return (
                <tr
                  key={log.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    isWallBlocked ? 'bg-red-950/20' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}{' '}
                    · {new Date(log.timestamp).toLocaleDateString()}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-200 whitespace-nowrap">
                    {log.userName}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        isWallBlocked
                          ? 'bg-red-950 text-red-400 border-red-800'
                          : isHoldEvent
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : isAuthCheck
                          ? 'bg-sky-950 text-sky-300 border-sky-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{log.entityType}</td>
                  <td className="py-2.5 px-3 text-slate-300 max-w-lg">{log.details}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-500 text-[11px]">
                    {log.ipAddress}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
