import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';
import { Resource, EligibilityResult } from '../types';
import { Persona } from './Navbar';

interface ZeroTrustModalProps {
  resource: Resource;
  persona: Persona;
  eligibility: EligibilityResult | null;
  onClose: () => void;
  onSubmit: (hours: number, purpose: string) => Promise<void>;
  loading: boolean;
}

export const ZeroTrustModal: React.FC<ZeroTrustModalProps> = ({
  resource,
  persona,
  eligibility,
  onClose,
  onSubmit,
  loading,
}) => {
  const [hours, setHours] = useState(Math.min(2, resource.max_duration_hours));
  const [purpose, setPurpose] = useState('');

  const quickPurposes = [
    'Academic thesis experimental sample analysis',
    'High-frequency S-parameter antenna measurement',
    'Precision CNC prototype fabrication for robotics team',
    'Multi-angle X-ray diffraction crystalline survey',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eligibility?.is_eligible) return;
    await onSubmit(hours, purpose || 'Academic research experimentation');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-black/80 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Zero-Trust Eligibility Gate
              </h2>
              <p className="text-xs text-slate-400">
                Rule-based credential evaluation before reservation
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
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Target Resource Summary */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                {resource.asset_tag}
              </span>
              <h3 className="text-sm font-bold text-white mt-1">{resource.name}</h3>
              <p className="text-xs text-slate-400">
                {resource.location} · Max duration {resource.max_duration_hours}h
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Evaluated Persona:</span>
              <span className="text-xs font-bold text-slate-200">{persona.name}</span>
              <span className="text-[10px] text-slate-400 block font-mono">{persona.id}</span>
            </div>
          </div>

          {/* Real-time Gate Verdict */}
          {eligibility ? (
            <div
              className={`p-4 rounded-xl border ${
                eligibility.is_eligible
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {eligibility.is_eligible ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    {eligibility.is_eligible
                      ? 'Zero-Trust Gate Passed: Qualified'
                      : 'Zero-Trust Gate Triggered: Unauthorized'}
                  </h4>
                  <p className="text-xs opacity-90 leading-relaxed">
                    {eligibility.explanation}
                  </p>
                </div>
              </div>

              {/* Concurrency Quota Metric */}
              <div className="mt-3 pt-3 border-t border-current/20 flex items-center justify-between text-xs">
                <span>Active Booking Concurrency Quota:</span>
                <span className="font-mono font-bold">
                  {eligibility.active_bookings_count} / {eligibility.max_quota} Active Slots
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-800 animate-pulse text-xs text-slate-400">
              Evaluating server-side credentials and concurrency limits...
            </div>
          )}

          {/* Booking Request Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Duration selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Booking Duration (Hours)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 4, resource.max_duration_hours]
                  .filter((v, i, a) => a.indexOf(v) === i && v <= resource.max_duration_hours)
                  .map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setHours(val)}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                        hours === val
                          ? 'bg-sky-500 text-white border-sky-400 shadow-sm shadow-sky-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      {val} {val === 1 ? 'Hour' : 'Hours'}
                    </button>
                  ))}
              </div>
            </div>

            {/* Purpose Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Research Justification & Purpose
              </label>
              <textarea
                rows={3}
                placeholder="Describe your research experiment or testing justification for the lab custodian..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 text-xs p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 placeholder-slate-500"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400 mr-1">Suggested:</span>
                {quickPurposes.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPurpose(qp)}
                    className="text-[10px] text-sky-400 hover:text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 truncate max-w-[200px]"
                  >
                    {qp}
                  </button>
                ))}
              </div>
            </div>

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
                disabled={loading || !eligibility?.is_eligible}
                className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  eligibility?.is_eligible && !loading
                    ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/25 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                {loading ? 'Submitting...' : 'Submit Cryptographic Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
