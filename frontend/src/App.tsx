import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  Layers,
  Zap,
  ArrowRight,
  UserCheck,
  Lock,
  RefreshCw,
  QrCode,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import {
  fetchResources,
  checkEligibility,
  createBooking,
  fetchBookings,
  approveBooking,
  rejectBooking,
  generateHandoverToken,
  verifyCheckIn,
  inspectReturn,
  fetchAuditTimeline,
  verifyAuditChain,
} from './api/client';
import {
  Resource,
  Booking,
  EligibilityResult,
  TrustCapsuleBlock,
  ChainVerification,
  ResourceCategory,
} from './types';

// Pre-seeded Demo Personas
const DEMO_USERS = [
  { id: 'u-student-01', name: 'Aarav Sharma (Student/Requester)', role: 'REQUESTER', dept: 'Mechanical Engineering' },
  { id: 'u-custodian-01', name: 'Prof. Rajesh Rao (Custodian)', role: 'CUSTODIAN', dept: 'Electrical Engineering' },
  { id: 'u-admin-01', name: 'Dr. Anita Kapoor (Administrator)', role: 'ADMINISTRATOR', dept: 'Central Facilities' },
  { id: 'u-auditor-01', name: 'Inspector Vikram Menon (Auditor)', role: 'AUDITOR', dept: 'Campus Compliance' },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(DEMO_USERS[0]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'custodian' | 'replay' | 'arena'>('catalog');

  // Data states
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Booking Modal State
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [bookingHours, setBookingHours] = useState(2);
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handover & Return Modal State
  const [handoverBooking, setHandoverBooking] = useState<Booking | null>(null);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [custodianTokenInput, setCustodianTokenInput] = useState('');
  const [baselineNotes, setBaselineNotes] = useState('All cables intact, clean lens, powers on.');
  const [returnNotes, setReturnNotes] = useState('Returned in operational condition, clean bed.');
  const [flagDamage, setFlagDamage] = useState(false);
  const [damageDesc, setDamageDesc] = useState('');

  // Audit State
  const [auditTimeline, setAuditTimeline] = useState<TrustCapsuleBlock[]>([]);
  const [selectedAuditResource, setSelectedAuditResource] = useState<string>('');
  const [chainVerification, setChainVerification] = useState<ChainVerification | null>(null);

  // Security Arena Log
  const [arenaLogs, setArenaLogs] = useState<string[]>([]);

  useEffect(() => {
    loadCatalog();
    loadBookings();
  }, [selectedCategory, search]);

  async function loadCatalog() {
    try {
      setLoading(true);
      const data = await fetchResources(selectedCategory, search);
      setResources(data);
      if (data.length > 0 && !selectedAuditResource) {
        setSelectedAuditResource(data[0].id);
        loadTimeline(data[0].id);
      }
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  }

  async function loadBookings() {
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch (err: any) {
      console.error(err);
    }
  }

  async function loadTimeline(resId: string) {
    try {
      const timeline = await fetchAuditTimeline(resId);
      setAuditTimeline(timeline);
    } catch (err: any) {
      console.error(err);
    }
  }

  function showNotice(type: 'success' | 'error', message: string) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }

  async function openBookingModal(resource: Resource) {
    setSelectedResource(resource);
    setBookingPurpose('');
    try {
      const result = await checkEligibility(resource.id, currentUser.id);
      setEligibility(result);
    } catch (err: any) {
      showNotice('error', 'Eligibility check failed');
    }
  }

  async function handleCreateBooking() {
    if (!selectedResource) return;
    try {
      setIsSubmitting(true);
      const now = new Date();
      const start = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
      const end = new Date(now.getTime() + (60 + bookingHours * 60) * 60 * 1000).toISOString();

      await createBooking({
        resource_id: selectedResource.id,
        requester_id: currentUser.id,
        start_time: start,
        end_time: end,
        purpose: bookingPurpose || 'Academic lab experimentation',
      });

      showNotice('success', 'Booking requested successfully! Waiting for custodian approval.');
      setSelectedResource(null);
      loadBookings();
      if (selectedAuditResource === selectedResource.id) {
        loadTimeline(selectedResource.id);
      }
    } catch (err: any) {
      showNotice('error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleApprove(bookingId: string) {
    try {
      await approveBooking(bookingId, currentUser.id);
      showNotice('success', 'Booking approved! Requester can now generate check-in token.');
      loadBookings();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  }

  async function handleReject(bookingId: string) {
    const reason = prompt('Please enter justification for rejection:');
    if (!reason) return;
    try {
      await rejectBooking(bookingId, currentUser.id, reason);
      showNotice('success', 'Booking rejected with documented reason.');
      loadBookings();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  }

  async function handleGenerateToken(booking: Booking) {
    try {
      const res = await generateHandoverToken(booking.id, currentUser.id);
      setActiveToken(res.handover_token);
      setHandoverBooking(booking);
      showNotice('success', `Handover token generated: ${res.handover_token} (Valid for 15 mins)`);
      loadBookings();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  }

  async function handleCheckIn(bookingId: string) {
    try {
      await verifyCheckIn({
        booking_id: bookingId,
        custodian_id: currentUser.id,
        handover_token: custodianTokenInput.trim(),
        baseline_condition_notes: baselineNotes,
        checklist: { powers_on: true, cables_intact: true, clean_condition: true },
      });
      showNotice('success', 'Dual-acknowledgement verified! Active custody established.');
      setHandoverBooking(null);
      setActiveToken(null);
      setCustodianTokenInput('');
      loadBookings();
      loadCatalog();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  }

  async function handleReturn(bookingId: string) {
    try {
      await inspectReturn({
        booking_id: bookingId,
        custodian_id: currentUser.id,
        return_condition_notes: flagDamage ? damageDesc : returnNotes,
        flag_incident: flagDamage,
        incident_type: flagDamage ? 'PHYSICAL_DAMAGE' : undefined,
        incident_severity: flagDamage ? 'HIGH' : undefined,
        incident_description: flagDamage ? damageDesc : undefined,
        checklist: { powers_off: true, returned_clean: !flagDamage },
      });
      showNotice(
        flagDamage ? 'error' : 'success',
        flagDamage ? 'Damage flagged! Incident opened for administrative review.' : 'Return verified clean! Custody closed.'
      );
      setFlagDamage(false);
      setDamageDesc('');
      loadBookings();
      loadCatalog();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  }

  async function handleVerifyLedger() {
    try {
      const res = await verifyAuditChain();
      setChainVerification(res);
      showNotice(res.status === 'VALID' ? 'success' : 'error', res.message);
    } catch (err: any) {
      showNotice('error', err.message);
    }
  }

  // Security Arena Simulations
  async function simulateReplayAttack() {
    setArenaLogs((prev) => [`[${new Date().toLocaleTimeString()}] 🚀 Initiating Token Replay Attack...`, ...prev]);
    try {
      const activeOrPending = bookings.find((b) => b.status === 'CHECKED_OUT' || b.status === 'CLOSED');
      if (!activeOrPending) {
        setArenaLogs((prev) => [`[${new Date().toLocaleTimeString()}] ⚠️ No completed check-ins found. Complete a checkout first.`, ...prev]);
        return;
      }
      await verifyCheckIn({
        booking_id: activeOrPending.id,
        custodian_id: 'u-custodian-01',
        handover_token: 'PACT-HK-948210',
        baseline_condition_notes: 'Replay attempt',
      });
      setArenaLogs((prev) => [`[${new Date().toLocaleTimeString()}] ❌ ATTACK SUCCEEDED (Security Failure)`, ...prev]);
    } catch (err: any) {
      setArenaLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] 🛡️ DEFENSE TRIGGERED: Server rejected replay! "${err.message}"`,
        ...prev,
      ]);
    }
  }

  async function simulateDoubleBookingRace() {
    setArenaLogs((prev) => [`[${new Date().toLocaleTimeString()}] 🚀 Simulating Concurrent Overlapping Booking Race...`, ...prev]);
    const approved = bookings.find((b) => b.status === 'APPROVED');
    if (!approved) {
      setArenaLogs((prev) => [`[${new Date().toLocaleTimeString()}] ⚠️ Please approve at least one booking first to test overlap conflict.`, ...prev]);
      return;
    }
    try {
      await createBooking({
        resource_id: approved.resource_id,
        requester_id: 'u-student-01',
        start_time: approved.start_time,
        end_time: approved.end_time,
        purpose: 'Malicious race overlap payload',
      });
      setArenaLogs((prev) => [`[${new Date().toLocaleTimeString()}] ❌ DOUBLE BOOKING OCCURRED (Security Failure)`, ...prev]);
    } catch (err: any) {
      setArenaLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] 🛡️ DEFENSE TRIGGERED: 409 Conflict Caught! "${err.message}"`,
        ...prev,
      ]);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-sky-500 p-2 rounded-lg text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight flex items-center gap-2">
                PACT
                <span className="text-xs bg-sky-500/20 text-sky-300 font-semibold px-2 py-0.5 rounded border border-sky-400/30">
                  CodeHack India 2026
                </span>
              </h1>
              <p className="text-xs text-slate-400">Proof Before Access. Evidence After Return.</p>
            </div>
          </div>

          {/* Persona Switcher */}
          <div className="flex items-center gap-3">
            <UserCheck className="w-4 h-4 text-sky-400" />
            <span className="text-xs text-slate-300 hidden sm:inline">Active Persona:</span>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const u = DEMO_USERS.find((x) => x.id === e.target.value);
                if (u) setCurrentUser(u);
              }}
              className="bg-slate-800 text-xs text-white border border-slate-700 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {DEMO_USERS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} [{u.role}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 border-t border-slate-800/80">
          {[
            { id: 'catalog', label: 'Equipment & Space Catalog', icon: Search },
            { id: 'custodian', label: 'Custodian & Handover Hub', icon: Layers },
            { id: 'replay', label: 'Trust Replay Ledger', icon: Clock },
            { id: 'arena', label: 'Security Arena', icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                  active
                    ? 'border-sky-400 text-sky-400 bg-slate-800/50'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm flex items-center gap-2 border animate-bounce ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          {notification.message}
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* ===================== TAB 1: CATALOG ===================== */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search equipment, labs, tags..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {[
                  { label: 'All Assets', value: undefined },
                  { label: 'Precision Equipment', value: 'EQUIPMENT' },
                  { label: 'Research Spaces', value: 'SPACE' },
                ].map((f) => (
                  <button
                    key={f.label}
                    onClick={() => setSelectedCategory(f.value as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === f.value
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resource Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                        {res.asset_tag}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          res.status === 'AVAILABLE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : res.status === 'IN_USE'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {res.status}
                      </span>
                    </div>

                    <h3 className="font-semibold text-slate-900 text-base">{res.name}</h3>
                    <p className="text-xs text-slate-500">
                      📍 {res.location} • {res.department}
                    </p>

                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-700 mb-1.5">Zero-Trust Prerequisites:</p>
                      {res.requirements.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">No special certifications required</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {res.requirements.map((req) => (
                            <span
                              key={req.qualification_key}
                              className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono"
                            >
                              🔒 {req.qualification_key}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Max: {res.max_duration_hours}h loan</span>
                    <button
                      onClick={() => openBookingModal(res)}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      Verify & Reserve <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 2: CUSTODIAN & HANDOVER HUB ===================== */}
        {activeTab === 'custodian' && (
          <div className="space-y-8">
            {/* Pending Approvals */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-sky-500" />
                    Custodial Approval Requests
                  </h2>
                  <p className="text-xs text-slate-500">Review pending booking requests submitted by student researchers.</p>
                </div>
                <button
                  onClick={loadBookings}
                  className="px-3 py-1.5 border border-slate-200 text-xs rounded-lg hover:bg-slate-50 flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>

              {bookings.filter((b) => b.status === 'REQUESTED').length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 italic">No pending requests right now.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {bookings
                    .filter((b) => b.status === 'REQUESTED')
                    .map((b) => {
                      const res = resources.find((r) => r.id === b.resource_id);
                      return (
                        <div key={b.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-slate-900">{res?.name || b.resource_id}</span>
                              <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded border border-amber-200">
                                PENDING APPROVAL
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">Requester ID: {b.requester_id}</p>
                            <p className="text-xs text-slate-500 italic">"{b.purpose}"</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(b.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(b.id)}
                              className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold rounded-lg"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Active Bookings & Handover Workstation */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-sky-500" />
                Active Lifecycle & Handover Check-In Station
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="py-3 px-4">Booking ID</th>
                      <th className="py-3 px-4">Resource</th>
                      <th className="py-3 px-4">Borrower</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Custodian / Borrower Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map((b) => {
                      const res = resources.find((r) => r.id === b.resource_id);
                      return (
                        <tr key={b.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-mono font-medium text-slate-700">{b.id.slice(0, 8)}...</td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{res?.name || b.resource_id}</td>
                          <td className="py-3 px-4 text-slate-600">{b.requester_id}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold ${
                                b.status === 'CHECKED_OUT'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : b.status === 'APPROVED'
                                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                  : b.status === 'INCIDENT_OPEN'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            {/* If Approved, Borrower can generate token */}
                            {b.status === 'APPROVED' && (
                              <button
                                onClick={() => handleGenerateToken(b)}
                                className="px-2.5 py-1 bg-sky-600 text-white rounded text-xs font-medium hover:bg-sky-700"
                              >
                                🔑 Generate Token
                              </button>
                            )}

                            {/* Custodian can verify token */}
                            {b.status === 'HANDOVER_PENDING' && (
                              <button
                                onClick={() => setHandoverBooking(b)}
                                className="px-2.5 py-1 bg-amber-600 text-white rounded text-xs font-medium hover:bg-amber-700"
                              >
                                🤝 Verify Check-In
                              </button>
                            )}

                            {/* If Checked out, return inspection */}
                            {b.status === 'CHECKED_OUT' && (
                              <button
                                onClick={() => setHandoverBooking(b)}
                                className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700"
                              >
                                📦 Inspect Return
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 3: TRUST REPLAY LEDGER ===================== */}
        {activeTab === 'replay' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-sky-500" />
                  Trust Replay: Cryptographic Audit Ledger
                </h2>
                <p className="text-xs text-slate-500">Every lifecycle decision chained via cryptographic SHA-256 hashes.</p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedAuditResource}
                  onChange={(e) => {
                    setSelectedAuditResource(e.target.value);
                    loadTimeline(e.target.value);
                  }}
                  className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50"
                >
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.asset_tag})
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleVerifyLedger}
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" /> Verify Chain Integrity
                </button>
              </div>
            </div>

            {/* Verification Status Banner */}
            {chainVerification && (
              <div
                className={`p-4 rounded-xl border flex items-center gap-3 ${
                  chainVerification.status === 'VALID'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {chainVerification.status === 'VALID' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                )}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider">{chainVerification.status}</h4>
                  <p className="text-xs">{chainVerification.message}</p>
                </div>
              </div>
            )}

            {/* Timeline Blocks */}
            <div className="relative border-l-2 border-sky-200 ml-4 pl-6 space-y-6">
              {auditTimeline.map((block, idx) => (
                <div key={block.entry_id} className="relative bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div className="absolute -left-[31px] top-5 w-4 h-4 rounded-full bg-sky-500 border-4 border-white shadow-sm" />
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                      Block #{block.entry_id} • {block.event_type}
                    </span>
                    <span className="text-slate-400 font-mono">{new Date(block.event_timestamp).toLocaleString()}</span>
                  </div>

                  <p className="text-xs text-slate-600">
                    <strong>Actor:</strong> {block.actor_id}
                  </p>

                  <div className="bg-slate-900 text-slate-200 p-3 rounded-lg text-xs font-mono overflow-x-auto space-y-1">
                    <p className="text-slate-400">
                      <span className="text-sky-400">prev_hash:</span> {block.prev_hash}
                    </p>
                    <p className="text-emerald-400">
                      <span className="text-sky-400">entry_hash:</span> {block.entry_hash}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 4: SECURITY ARENA ===================== */}
        {activeTab === 'arena' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Security Arena: Diagnostic Attack Simulation
              </h2>
              <p className="text-xs text-slate-500">
                Controlled test environment allowing hackathon judges to verify server-side defense mechanisms live.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Simulation Dispatchers */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800">Dispatch Red-Team Attack Payloads</h3>

                <div className="space-y-3">
                  <div className="p-4 border border-slate-100 rounded-lg bg-slate-50 space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-xs text-slate-900">1. Token Replay Attack</h4>
                      <button
                        onClick={simulateReplayAttack}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-medium"
                      >
                        Run Attack
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Attempts to check out physical equipment using an already-spent or expired token.
                    </p>
                  </div>

                  <div className="p-4 border border-slate-100 rounded-lg bg-slate-50 space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-xs text-slate-900">2. Double-Booking Race Condition</h4>
                      <button
                        onClick={simulateDoubleBookingRace}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-medium"
                      >
                        Run Attack
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Dispatches concurrent overlapping requests for an already-approved resource slot (Expects 409 Conflict).
                    </p>
                  </div>
                </div>
              </div>

              {/* Real-time Defense Terminal */}
              <div className="bg-slate-900 text-slate-200 p-6 rounded-xl shadow-sm flex flex-col h-96">
                <h3 className="text-xs font-mono font-bold text-sky-400 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Live Defense Audit Stream
                </h3>
                <div className="flex-1 overflow-y-auto font-mono text-xs space-y-2">
                  {arenaLogs.length === 0 ? (
                    <p className="text-slate-500 italic">No attack payloads dispatched yet. Click a simulation to test.</p>
                  ) : (
                    arenaLogs.map((log, i) => (
                      <p key={i} className="leading-relaxed">
                        {log}
                      </p>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===================== MODAL: ZERO-TRUST BOOKING ===================== */}
      {selectedResource && eligibility && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedResource.name}</h3>
                <p className="text-xs text-slate-500">{selectedResource.location}</p>
              </div>
              <button onClick={() => setSelectedResource(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {/* Zero-Trust Gate Evaluation Banner */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                eligibility.is_eligible
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {eligibility.is_eligible ? <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" /> : <Lock className="w-5 h-5 text-rose-600 mt-0.5" />}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider">
                  {eligibility.is_eligible ? 'Zero-Trust Gate Passed' : 'Zero-Trust Gate Locked'}
                </h4>
                <p className="text-xs mt-0.5">{eligibility.explanation}</p>
              </div>
            </div>

            {eligibility.is_eligible && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Reservation Duration (Hours):</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedResource.max_duration_hours}
                    value={bookingHours}
                    onChange={(e) => setBookingHours(parseInt(e.target.value) || 1)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Academic / Research Purpose:</label>
                  <textarea
                    rows={3}
                    placeholder="Describe specific lab experiment or research project..."
                    value={bookingPurpose}
                    onChange={(e) => setBookingPurpose(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedResource(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateBooking}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                  >
                    {isSubmitting ? 'Submitting...' : 'Confirm Request'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== MODAL: HANDOVER & CHECK-IN ===================== */}
      {handoverBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {handoverBooking.status === 'HANDOVER_PENDING' ? 'Dual-Ack Check-In Handshake' : 'Return Inspection'}
                </h3>
                <p className="text-xs text-slate-500">Booking: {handoverBooking.id}</p>
              </div>
              <button onClick={() => setHandoverBooking(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {handoverBooking.status === 'HANDOVER_PENDING' ? (
              <div className="space-y-4 text-xs">
                {activeToken && (
                  <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-center space-y-1">
                    <span className="text-xs text-sky-600 font-semibold uppercase">Requester Token</span>
                    <div className="text-2xl font-mono font-bold tracking-widest text-sky-900">{activeToken}</div>
                    <p className="text-xs text-slate-400">Presents to custodian at physical lab</p>
                  </div>
                )}

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Enter Borrower Token:</label>
                  <input
                    type="text"
                    placeholder="PACT-HK-XXXXXX"
                    value={custodianTokenInput}
                    onChange={(e) => setCustodianTokenInput(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Baseline Pre-Use Condition Notes:</label>
                  <textarea
                    rows={2}
                    value={baselineNotes}
                    onChange={(e) => setBaselineNotes(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <button
                  onClick={() => handleCheckIn(handoverBooking.id)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs shadow-sm"
                >
                  Verify Handshake & Authorize Checkout
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Return Inspection Notes:</label>
                  <textarea
                    rows={2}
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="flagDamage"
                    checked={flagDamage}
                    onChange={(e) => setFlagDamage(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <label htmlFor="flagDamage" className="font-semibold text-rose-700 cursor-pointer">
                    Flag Damage / Missing Component Incident
                  </label>
                </div>

                {flagDamage && (
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Discrepancy Description:</label>
                    <textarea
                      rows={2}
                      placeholder="Detail physical damage, bent connector, crack..."
                      value={damageDesc}
                      onChange={(e) => setDamageDesc(e.target.value)}
                      className="w-full p-2 border border-rose-200 rounded-lg text-sm"
                    />
                  </div>
                )}

                <button
                  onClick={() => handleReturn(handoverBooking.id)}
                  className={`w-full py-2.5 text-white rounded-lg font-semibold text-xs shadow-sm ${
                    flagDamage ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {flagDamage ? 'Escalate Incident to Administrator' : 'Confirm Clean Return & Close Custody'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

