import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Layers,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  AlertOctagon,
  Copy,
  Clock,
  User,
  Hash,
  Database,
  RotateCw,
} from 'lucide-react';
import { TrustCapsuleBlock, ChainVerification, Resource } from '../types';

interface TrustReplayTimelineProps {
  timeline: TrustCapsuleBlock[];
  resources: Resource[];
  selectedResourceId: string;
  onSelectResource: (id: string) => void;
  verification: ChainVerification | null;
  onVerifyChain: () => Promise<void>;
  loading: boolean;
}

export const TrustReplayTimeline: React.FC<TrustReplayTimelineProps> = ({
  timeline,
  resources,
  selectedResourceId,
  onSelectResource,
  verification,
  onVerifyChain,
  loading,
}) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const getEventBadge = (type: string) => {
    if (type.includes('INCIDENT') || type.includes('DAMAGE')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
          {type}
        </span>
      );
    }
    if (type.includes('CHECKED_OUT') || type.includes('RETURNED')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          {type}
        </span>
      );
    }
    if (type.includes('APPROVED') || type.includes('TOKEN')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30">
          {type}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-slate-800 text-slate-300 border border-slate-700">
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & Resource Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-sky-400" />
            Trust Capsule · Cryptographic Event Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Every custody action is serialized into SHA-256 blocks chained with predecessor hashes.
          </p>
        </div>

        {/* Filter and Verify actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedResourceId}
            onChange={(e) => onSelectResource(e.target.value)}
            className="bg-slate-950 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
          >
            {resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.asset_tag})
              </option>
            ))}
          </select>

          <button
            onClick={onVerifyChain}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white shadow-sm shadow-sky-500/25 flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Recomputing Hashes...' : 'Verify Chain Integrity'}
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verification && (
        <div
          className={`p-4 rounded-2xl border transition-all ${
            verification.status === 'VALID'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-start gap-3">
            {verification.status === 'VALID' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <h3 className="text-sm font-black tracking-wide uppercase">
                {verification.status === 'VALID'
                  ? 'Cryptographic Chain Validation Passed'
                  : 'INTEGRITY BREACH DETECTED: Tampered Blocks Detected'}
              </h3>
              <p className="text-xs opacity-90 leading-relaxed">{verification.message}</p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono font-semibold">
                <span>Total Blocks Verified: {verification.total_blocks_verified}</span>
                {verification.tampered_block_ids?.length > 0 && (
                  <span className="text-rose-400">
                    Tampered Block IDs: [{verification.tampered_block_ids.join(', ')}]
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blockchain Timeline Cards */}
      {timeline.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-xs space-y-2">
          <Database className="w-8 h-8 mx-auto text-slate-500" />
          <p className="font-semibold text-slate-300">No Trust Capsule blocks for this resource yet.</p>
          <p className="text-slate-400">Create a booking and complete handover to record cryptographic blocks.</p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
          {timeline.map((block, idx) => (
            <div
              key={block.entry_id}
              className="relative p-5 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-xl space-y-4"
            >
              {/* Timeline Node Bullet */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-6 w-4 h-4 rounded-full bg-slate-950 border-2 border-sky-400 shadow-md shadow-sky-500/50 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              </div>

              {/* Block Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20">
                    Block #{block.entry_id}
                  </span>
                  {getEventBadge(block.event_type)}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono text-slate-300">{block.actor_id}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(block.event_timestamp).toLocaleString()}</span>
                  </span>
                </div>
              </div>

              {/* Canonical Payload JSON */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Canonical State Payload:
                </span>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
                  {JSON.stringify(block.payload_json, null, 2)}
                </pre>
              </div>

              {/* Hash Chaining Display */}
              <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Prev Hash */}
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold">
                    <span>Previous Block Hash (Link):</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400 truncate">
                    {block.prev_hash}
                  </div>
                </div>

                {/* Entry Hash */}
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-sky-400 uppercase font-semibold">
                    <span>Block SHA-256 Hash:</span>
                    <button
                      onClick={() => handleCopy(block.entry_hash)}
                      className="hover:text-white flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedHash === block.entry_hash ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-sky-300 truncate">
                    {block.entry_hash}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
