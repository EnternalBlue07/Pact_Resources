import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  KeyRound,
  ShieldAlert,
  Clock,
  UserCheck,
  ClipboardCheck,
  RotateCcw,
  AlertTriangle,
  FileText,
  Search,
} from 'lucide-react';
import { Booking, Resource } from '../types';
import { Persona } from './Navbar';

interface CustodianStationProps {
  bookings: Booking[];
  resources: Resource[];
  currentPersona: Persona;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onGenerateToken: (b: Booking) => Promise<void>;
  onOpenCheckIn: (b: Booking) => void;
  onOpenReturn: (b: Booking) => void;
  activeToken: string | null;
}

export const CustodianStation: React.FC<CustodianStationProps> = ({
  bookings,
  resources,
  currentPersona,
  onApprove,
  onReject,
  onGenerateToken,
  onOpenCheckIn,
  onOpenReturn,
  activeToken,
}) => {
  const [filter, setFilter] = useState<'REQUESTED' | 'APPROVED' | 'CHECKED_OUT' | 'INCIDENT_OR_CLOSED'>('REQUESTED');

  const getResource = (resId: string) => resources.find((r) => r.id === resId);

  const pendingRequests = bookings.filter((b) => b.status === 'REQUESTED');
  const approvedBookings = bookings.filter((b) => b.status === 'APPROVED' || b.status === 'HANDOVER_PENDING');
  const checkedOutBookings = bookings.filter((b) => b.status === 'CHECKED_OUT');
  const incidentOrClosed = bookings.filter((b) => b.status === 'INCIDENT_OPEN' || b.status === 'CLOSED');

  return (
    <div className="space-y-6">
      {/* Station Title & Sub-navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-sky-400" />
            Custodian & Custody Management Desk
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Authorize requests, verify time-limited handover tokens, and certify return condition.
          </p>
        </div>

        {/* Tab Switchers */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilter('REQUESTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === 'REQUESTED'
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending Requests
            {pendingRequests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === 'APPROVED'
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Check-in / Handover
            {approvedBookings.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-sky-500/30 text-sky-300 text-[10px] font-bold">
                {approvedBookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilter('CHECKED_OUT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === 'CHECKED_OUT'
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Custody
            {checkedOutBookings.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                {checkedOutBookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilter('INCIDENT_OR_CLOSED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === 'INCIDENT_OR_CLOSED'
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Incidents & Closed
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      {filter === 'REQUESTED' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              No pending requests. All requests have been reviewed!
            </div>
          ) : (
            pendingRequests.map((b) => {
              const res = getResource(b.resource_id);
              return (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20">
                        {res?.asset_tag || b.resource_id}
                      </span>
                      <h3 className="text-sm font-bold text-white">{res?.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        PENDING APPROVAL
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">
                      <span className="text-slate-400">Requester:</span>{' '}
                      <span className="font-semibold text-slate-200">{b.requester_id}</span>
                    </p>

                    <p className="text-xs text-slate-300 italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      "{b.purpose}"
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400">
                      <span>Start: {new Date(b.start_time).toLocaleTimeString()}</span>
                      <span>End: {new Date(b.end_time).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onApprove(b.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm shadow-emerald-500/25 flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve Request
                    </button>
                    <button
                      onClick={() => onReject(b.id)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {filter === 'APPROVED' && (
        <div className="space-y-4">
          {approvedBookings.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              No approved bookings awaiting handover.
            </div>
          ) : (
            approvedBookings.map((b) => {
              const res = getResource(b.resource_id);
              return (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20">
                        {res?.asset_tag || b.resource_id}
                      </span>
                      <h3 className="text-sm font-bold text-white">{res?.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        HANDOVER READY
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">
                      Approved for <span className="font-semibold text-slate-200">{b.requester_id}</span>
                    </p>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="text-[11px] font-semibold text-sky-400 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5" />
                        Dual-Acknowledgement Handover Protocol
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Requester generates 15-min digital token. Custodian enters token to record baseline condition and transfer physical custody.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                    <button
                      onClick={() => onGenerateToken(b)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white shadow-sm shadow-sky-500/25 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <KeyRound className="w-4 h-4" />
                      1. Requester Token
                    </button>
                    <button
                      onClick={() => onOpenCheckIn(b)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      2. Custodian Check-in
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {filter === 'CHECKED_OUT' && (
        <div className="space-y-4">
          {checkedOutBookings.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              No equipment currently in active checkout.
            </div>
          ) : (
            checkedOutBookings.map((b) => {
              const res = getResource(b.resource_id);
              return (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20">
                        {res?.asset_tag || b.resource_id}
                      </span>
                      <h3 className="text-sm font-bold text-white">{res?.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        IN ACTIVE CUSTODY
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">
                      In possession of: <span className="font-semibold text-slate-200">{b.requester_id}</span>
                    </p>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Expected return by: {new Date(b.end_time).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Return inspection trigger */}
                  <div className="shrink-0">
                    <button
                      onClick={() => onOpenReturn(b)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm shadow-amber-500/25 flex items-center gap-1.5 transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Inspect & Process Return
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {filter === 'INCIDENT_OR_CLOSED' && (
        <div className="space-y-4">
          {incidentOrClosed.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              No historical incident or closed records.
            </div>
          ) : (
            incidentOrClosed.map((b) => {
              const res = getResource(b.resource_id);
              const isIncident = b.status === 'INCIDENT_OPEN';
              return (
                <div
                  key={b.id}
                  className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isIncident
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : 'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20">
                        {res?.asset_tag || b.resource_id}
                      </span>
                      <h3 className="text-sm font-bold text-white">{res?.name}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isIncident
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      User: <span className="font-medium text-slate-200">{b.requester_id}</span> · Purpose: "{b.purpose}"
                    </p>
                    {isIncident && (
                      <p className="text-xs text-rose-300 font-medium">
                        ⚠️ Incident Flagged: Physical damage/discrepancy detected during return inspection. Resource is locked in maintenance.
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
