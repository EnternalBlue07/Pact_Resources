import React, { useState } from 'react';
import {
  X,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Camera,
  ShieldAlert,
} from 'lucide-react';
import { Booking, Resource } from '../types';

interface ReturnModalProps {
  booking: Booking;
  resource?: Resource;
  onClose: () => void;
  onSubmit: (payload: {
    notes: string;
    flagDamage: boolean;
    incidentType?: string;
    severity?: string;
    description?: string;
  }) => Promise<void>;
  loading: boolean;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  booking,
  resource,
  onClose,
  onSubmit,
  loading,
}) => {
  const [flagDamage, setFlagDamage] = useState(false);
  const [returnNotes, setReturnNotes] = useState('Returned in operational condition, clean bed and lens.');
  const [severity, setSeverity] = useState('HIGH');
  const [incidentType, setIncidentType] = useState('PHYSICAL_DAMAGE');
  const [damageDesc, setDamageDesc] = useState('Physical scratch detected on objective lens; sample stage misaligned.');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      notes: flagDamage ? damageDesc : returnNotes,
      flagDamage,
      incidentType: flagDamage ? incidentType : undefined,
      severity: flagDamage ? severity : undefined,
      description: flagDamage ? damageDesc : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-black/80 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg border ${
                flagDamage
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}
            >
              {flagDamage ? <ShieldAlert className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Return Inspection & Custody Release
              </h2>
              <p className="text-xs text-slate-400">
                Certify physical equipment return and document condition
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Summary */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="font-mono text-sky-400 font-bold">{resource?.asset_tag}</span>
              <p className="font-bold text-white mt-0.5">{resource?.name}</p>
            </div>
            <div className="text-right">
              <span className="text-slate-400">Borrower:</span>
              <p className="font-semibold text-slate-200">{booking.requester_id}</p>
            </div>
          </div>

          {/* Condition Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Physical Return Condition
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFlagDamage(false)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  !flagDamage
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Clean Return
                </div>
                <p className="text-[11px] mt-1 opacity-80">
                  Equipment intact, zero damage, ready for next user.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFlagDamage(true)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  flagDamage
                    ? 'bg-rose-500/15 border-rose-500 text-rose-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Damage / Fault Flagged
                </div>
                <p className="text-[11px] mt-1 opacity-80">
                  Discrepancy found; locks asset into maintenance.
                </p>
              </button>
            </div>
          </div>

          {/* Form fields based on mode */}
          {!flagDamage ? (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Return Inspection Notes
              </label>
              <textarea
                rows={3}
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 text-xs p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          ) : (
            <div className="space-y-4 p-4 rounded-xl bg-rose-950/20 border border-rose-500/30">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-rose-300 uppercase tracking-wider mb-1.5">
                    Incident Type
                  </label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 text-xs p-2 rounded-lg border border-rose-500/40 focus:outline-none"
                  >
                    <option value="PHYSICAL_DAMAGE">Physical Damage</option>
                    <option value="MISSING_PARTS">Missing Cable/Accessories</option>
                    <option value="CONTAMINATION">Chemical Contamination</option>
                    <option value="OVERDUE_VIOLATION">Unapproved Overdue Holding</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-rose-300 uppercase tracking-wider mb-1.5">
                    Severity Level
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 text-xs p-2 rounded-lg border border-rose-500/40 focus:outline-none"
                  >
                    <option value="LOW">Low (Minor cosmetic)</option>
                    <option value="MEDIUM">Medium (Needs calibration)</option>
                    <option value="HIGH">High (Part replacement needed)</option>
                    <option value="CRITICAL">Critical (Total inoperability)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-rose-300 uppercase tracking-wider mb-1.5">
                  Detailed Discrepancy Description
                </label>
                <textarea
                  rows={2}
                  value={damageDesc}
                  onChange={(e) => setDamageDesc(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 text-xs p-2.5 rounded-lg border border-rose-500/40 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  required
                />
              </div>

              {/* Simulated Photographic Evidence */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-rose-400" />
                  <span>Forensic Evidence: evidence_photo_1793.jpg attached</span>
                </div>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono">
                  SHA-256 Signed
                </span>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                flagDamage
                  ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/25'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25'
              }`}
            >
              {loading
                ? 'Processing...'
                : flagDamage
                ? 'Escalate Incident & Lock Asset'
                : 'Sign Off Clean Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
