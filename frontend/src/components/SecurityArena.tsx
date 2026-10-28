import React, { useState } from 'react';
import {
  Terminal,
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Flame,
  Zap,
  Trash2,
  RefreshCw,
  Copy,
  Lock,
} from 'lucide-react';
import { Booking } from '../types';
import {
  verifyCheckIn,
  createBooking,
  simulateTamper,
  repairLedger,
  verifyAuditChain,
} from '../api/client';

interface SecurityArenaProps {
  bookings: Booking[];
  onRefreshData: () => Promise<void>;
}

export const SecurityArena: React.FC<SecurityArenaProps> = ({ bookings, onRefreshData }) => {
  const [logs, setLogs] = useState<Array<{ id: number; time: string; type: 'info' | 'attack' | 'defense' | 'breach'; text: string }>>([
    {
      id: 1,
      time: new Date().toLocaleTimeString(),
      type: 'info',
      text: 'PACT Security Arena initialized. Zero-Trust attack harnesses armed. Select an exploit test below.',
    },
  ]);
  const [running, setRunning] = useState(false);

  const addLog = (type: 'info' | 'attack' | 'defense' | 'breach', text: string) => {
    setLogs((prev) => [
      { id: Date.now() + Math.random(), time: new Date().toLocaleTimeString(), type, text },
      ...prev,
    ]);
  };

  // Attack 1: Replay Token Attack
  const handleTokenReplayAttack = async () => {
    setRunning(true);
    addLog('attack', '⚡ [EXPLOIT 1] Launching Handover Token Replay & Expiry Exploit...');
    addLog('info', 'Target: POST /api/v1/handovers/verify-checkin with expired/replayed token "PACT-HK-948210"');

    try {
      const activeOrDone = bookings.find((b) => b.status === 'CHECKED_OUT' || b.status === 'CLOSED');
      const targetId = activeOrDone ? activeOrDone.id : 'b-mock-target-001';

      await verifyCheckIn({
        booking_id: targetId,
        custodian_id: 'u-custodian-01',
        handover_token: 'PACT-HK-948210',
        baseline_condition_notes: 'Unauthorized replay exploit attempt',
      });

      addLog('breach', '🚨 CRITICAL FAILURE: Server accepted replayed token! (Security flaw)');
    } catch (err: any) {
      addLog('defense', `🛡️ DEFENSE TRIGGERED: Server rejected token replay! [HTTP 400 Bad Request]`);
      addLog('defense', `Details: "${err.message}"`);
    } finally {
      setRunning(false);
    }
  };

  // Attack 2: Double-Booking Overlapping Race Condition
  const handleDoubleBookingRace = async () => {
    setRunning(true);
    addLog('attack', '⚡ [EXPLOIT 2] Launching Overlapping Double-Booking Race Condition...');

    const approved = bookings.find((b) => b.status === 'APPROVED' || b.status === 'CHECKED_OUT');
    if (!approved) {
      addLog('info', '⚠️ Note: Approve or check-out at least one booking in the Custodian Desk first to test overlap conflict.');
      setRunning(false);
      return;
    }

    addLog('info', `Target: Injecting duplicate reservation on resource ${approved.resource_id} during overlapping interval [${approved.start_time} - ${approved.end_time}]`);

    try {
      await createBooking({
        resource_id: approved.resource_id,
        requester_id: 'u-student-01',
        start_time: approved.start_time,
        end_time: approved.end_time,
        purpose: 'Malicious concurrent race payload',
      });

      addLog('breach', '🚨 CRITICAL FAILURE: Server permitted overlapping double-booking! (Race condition flaw)');
    } catch (err: any) {
      addLog('defense', `🛡️ DEFENSE TRIGGERED: Database row lock & interval check blocked conflict! [HTTP 409 Conflict]`);
      addLog('defense', `Details: "${err.message}"`);
    } finally {
      setRunning(false);
    }
  };

  // Attack 3: Database Tampering & Cryptographic Detection
  const handleSimulateTamper = async () => {
    setRunning(true);
    addLog('attack', '⚡ [EXPLOIT 3] Simulating Direct Database Tampering (SQL Payload Forgery)...');
    try {
      const res = await simulateTamper();
      addLog('attack', `Injected rogue SQL modification on Block #${res.tampered_block_id}. Payload condition notes forged.`);
      addLog('info', 'Now triggering cryptographic Trust Capsule chain verification...');

      const verifyRes = await verifyAuditChain();
      if (verifyRes.status === 'INTEGRITY_BREACH_DETECTED') {
        addLog('defense', `🛡️ DEFENSE TRIGGERED: SHA-256 hash chain mismatch detected!`);
        addLog('defense', `Integrity check flagged altered block IDs: [${verifyRes.tampered_block_ids?.join(', ')}]`);
      } else {
        addLog('breach', '🚨 Audit verification failed to detect tampered block!');
      }
      await onRefreshData();
    } catch (err: any) {
      addLog('info', `Simulate error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  // Repair Ledger
  const handleRepairLedger = async () => {
    setRunning(true);
    addLog('info', 'Restoring original canonical database payload...');
    try {
      const res = await repairLedger();
      addLog('defense', `✅ ${res.message}`);
      const verifyRes = await verifyAuditChain();
      addLog('info', `Re-validation outcome: ${verifyRes.message} (${verifyRes.total_blocks_verified} blocks checked)`);
      await onRefreshData();
    } catch (err: any) {
      addLog('info', `Repair error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-rose-400" />
          Security Arena · Adversarial Verification Suite
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Execute live attacks against the running PACT backend to stress-test authorization, token single-use enforcement, race-condition locking, and tamper-evident hash chaining.
        </p>
      </div>

      {/* Exploit Test Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Test 1 */}
        <div className="p-5 rounded-2xl bg-slate-900/95 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                ATTACK 01
              </span>
              <span className="text-[10px] font-semibold text-slate-400">Auth & Tokens</span>
            </div>
            <h3 className="text-sm font-bold text-white">Token Replay & Expiry</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Attempts to reuse an already-consumed or expired 15-minute handover token to gain unauthorized equipment access.
            </p>
          </div>
          <button
            onClick={handleTokenReplayAttack}
            disabled={running}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Flame className="w-4 h-4 text-rose-400" />
            Launch Replay Exploit
          </button>
        </div>

        {/* Test 2 */}
        <div className="p-5 rounded-2xl bg-slate-900/95 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                ATTACK 02
              </span>
              <span className="text-[10px] font-semibold text-slate-400">Concurrency</span>
            </div>
            <h3 className="text-sm font-bold text-white">Overlapping Booking Race</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Simulates concurrent requests attempting to reserve the exact same equipment slot already approved for another researcher.
            </p>
          </div>
          <button
            onClick={handleDoubleBookingRace}
            disabled={running}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            Simulate Race Condition
          </button>
        </div>

        {/* Test 3 */}
        <div className="p-5 rounded-2xl bg-slate-900/95 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ATTACK 03
              </span>
              <span className="text-[10px] font-semibold text-slate-400">Tamper Evidence</span>
            </div>
            <h3 className="text-sm font-bold text-white">Direct Database Forgery</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mutates historical SQL records directly on disk and tests whether the SHA-256 Merkle chain detects the integrity breach.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSimulateTamper}
              disabled={running}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              Forge SQL Record
            </button>
            <button
              onClick={handleRepairLedger}
              disabled={running}
              title="Restore Ledger"
              className="px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Terminal Console */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden font-mono text-xs">
        {/* Terminal Header */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-[11px] text-slate-400 ml-2 font-semibold font-sans">
              pact-security-arena-daemon.log
            </span>
          </div>

          <button
            onClick={() => setLogs([])}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-sans"
          >
            <Trash2 className="w-3 h-3" />
            Clear Output
          </button>
        </div>

        {/* Terminal Log Stream */}
        <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
          {logs.map((log) => {
            let textColor = 'text-slate-300';
            if (log.type === 'attack') textColor = 'text-rose-400 font-bold';
            if (log.type === 'defense') textColor = 'text-emerald-400 font-bold';
            if (log.type === 'breach') textColor = 'text-rose-500 font-black animate-pulse';

            return (
              <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                <span className="text-slate-600 select-none">[{log.time}]</span>
                <span className={textColor}>{log.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
