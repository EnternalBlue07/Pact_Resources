import React, { useState, useEffect } from 'react';
import {
  Navbar,
  DEMO_PERSONAS,
  Persona,
} from './components/Navbar';
import { CatalogGrid } from './components/CatalogGrid';
import { ZeroTrustModal } from './components/ZeroTrustModal';
import { CustodianStation } from './components/CustodianStation';
import { CheckInModal } from './components/CheckInModal';
import { ReturnModal } from './components/ReturnModal';
import { TrustReplayTimeline } from './components/TrustReplayTimeline';
import { TrustGraph } from './components/TrustGraph';
import { SecurityArena } from './components/SecurityArena';

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
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function App() {
  const [currentPersona, setCurrentPersona] = useState<Persona>(DEMO_PERSONAS[0]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'custodian' | 'ledger' | 'graph' | 'arena'>('catalog');

  // Data states
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals
  const [selectedBookingResource, setSelectedBookingResource] = useState<Resource | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);

  const [handoverBooking, setHandoverBooking] = useState<Booking | null>(null);
  const [returnBooking, setReturnBooking] = useState<Booking | null>(null);
  const [activeToken, setActiveToken] = useState<string | null>(null);

  // Audit state
  const [auditTimeline, setAuditTimeline] = useState<TrustCapsuleBlock[]>([]);
  const [selectedAuditResource, setSelectedAuditResource] = useState<string>('');
  const [chainVerification, setChainVerification] = useState<ChainVerification | null>(null);

  useEffect(() => {
    loadCatalog();
    loadBookings();
  }, [selectedCategory, searchQuery]);

  async function loadCatalog() {
    try {
      setLoading(true);
      const data = await fetchResources(selectedCategory, searchQuery);
      setResources(data);
      if (data.length > 0 && !selectedAuditResource) {
        setSelectedAuditResource(data[0].id);
        loadTimeline(data[0].id);
      }
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to load catalog');
    } finally {
      setLoading(false);
    }
  }

  async function loadBookings() {
    try {
      const data = await fetchBookings();
      setBookings(data);
    } catch (err: any) {
      console.error('Failed to load bookings:', err);
    }
  }

  async function loadTimeline(resourceId: string) {
    try {
      const timeline = await fetchAuditTimeline(resourceId);
      setAuditTimeline(timeline);
    } catch (err: any) {
      console.error('Failed to load audit timeline:', err);
    }
  }

  function showNotice(type: 'success' | 'error', message: string) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 6000);
  }

  // Booking Flow
  async function handleOpenBooking(res: Resource) {
    setSelectedBookingResource(res);
    try {
      const el = await checkEligibility(res.id, currentPersona.id);
      setEligibility(el);
    } catch (err: any) {
      showNotice('error', 'Eligibility check failed');
    }
  }

  async function handleSubmitBooking(hours: number, purpose: string) {
    if (!selectedBookingResource) return;
    try {
      setActionLoading(true);
      const now = new Date();
      const start = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
      const end = new Date(now.getTime() + (60 + hours * 60) * 60 * 1000).toISOString();

      await createBooking({
        resource_id: selectedBookingResource.id,
        requester_id: currentPersona.id,
        start_time: start,
        end_time: end,
        purpose,
      });

      showNotice('success', 'Booking requested successfully! Submitted for custodial review.');
      setSelectedBookingResource(null);
      await loadBookings();
      if (selectedAuditResource === selectedBookingResource.id) {
        await loadTimeline(selectedBookingResource.id);
      }
    } catch (err: any) {
      showNotice('error', err.message);
    } finally {
      setActionLoading(false);
    }
  }

  // Custodian Approvals & Handovers
  async function handleApprove(bookingId: string) {
    try {
      await approveBooking(bookingId, currentPersona.id);
      showNotice('success', 'Booking approved! Handover token can now be generated.');
      await loadBookings();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  }

  async function handleReject(bookingId: string) {
    const reason = prompt('Please enter justification for rejection:');
    if (!reason) return;
    try {
      await rejectBooking(bookingId, currentPersona.id, reason);
      showNotice('success', 'Booking rejected with documented reason.');
      await loadBookings();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  }

  async function handleGenerateToken(booking: Booking) {
    try {
      const res = await generateHandoverToken(booking.id, currentPersona.id);
      setActiveToken(res.handover_token);
      setHandoverBooking(booking);
      showNotice('success', `15-minute token generated: ${res.handover_token}`);
      await loadBookings();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  }

  async function handleConfirmCheckIn(token: string, notes: string, checklist: Record<string, boolean>) {
    if (!handoverBooking) return;
    try {
      setActionLoading(true);
      await verifyCheckIn({
        booking_id: handoverBooking.id,
        custodian_id: currentPersona.id,
        handover_token: token,
        baseline_condition_notes: notes,
        checklist,
      });
      showNotice('success', 'Dual-acknowledgement verified! Active physical custody granted.');
      setHandoverBooking(null);
      setActiveToken(null);
      await loadBookings();
      await loadCatalog();
      if (selectedAuditResource === handoverBooking.resource_id) {
        await loadTimeline(handoverBooking.resource_id);
      }
    } catch (err: any) {
      showNotice('error', err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleConfirmReturn(payload: {
    notes: string;
    flagDamage: boolean;
    incidentType?: string;
    severity?: string;
    description?: string;
  }) {
    if (!returnBooking) return;
    try {
      setActionLoading(true);
      await inspectReturn({
        booking_id: returnBooking.id,
        custodian_id: currentPersona.id,
        return_condition_notes: payload.notes,
        flag_incident: payload.flagDamage,
        incident_type: payload.incidentType,
        incident_severity: payload.severity,
        incident_description: payload.description,
        checklist: { powers_off: true, returned_clean: !payload.flagDamage },
      });

      showNotice(
        payload.flagDamage ? 'error' : 'success',
        payload.flagDamage
          ? 'Damage flagged! Incident opened & resource locked in maintenance.'
          : 'Return signed off! Equipment returned clean and custody closed.'
      );
      setReturnBooking(null);
      await loadBookings();
      await loadCatalog();
      if (selectedAuditResource === returnBooking.resource_id) {
        await loadTimeline(returnBooking.resource_id);
      }
    } catch (err: any) {
      showNotice('error', err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleVerifyChain() {
    try {
      setActionLoading(true);
      const res = await verifyAuditChain();
      setChainVerification(res);
      showNotice(res.status === 'VALID' ? 'success' : 'error', res.message);
    } catch (err: any) {
      showNotice('error', err.message);
    } finally {
      setActionLoading(false);
    }
  }

  const pendingRequestsCount = bookings.filter((b) => b.status === 'REQUESTED').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Navigation */}
      <Navbar
        currentPersona={currentPersona}
        onSelectPersona={(p) => {
          setCurrentPersona(p);
          // If booking modal is open, re-check eligibility with new persona
          if (selectedBookingResource) {
            checkEligibility(selectedBookingResource.id, p.id).then(setEligibility);
          }
        }}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        pendingCount={pendingRequestsCount}
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'catalog' && (
          <CatalogGrid
            resources={resources}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onRequestBooking={handleOpenBooking}
            loading={loading}
          />
        )}

        {activeTab === 'custodian' && (
          <CustodianStation
            bookings={bookings}
            resources={resources}
            currentPersona={currentPersona}
            onApprove={handleApprove}
            onReject={handleReject}
            onGenerateToken={handleGenerateToken}
            onOpenCheckIn={(b) => setHandoverBooking(b)}
            onOpenReturn={(b) => setReturnBooking(b)}
            activeToken={activeToken}
          />
        )}

        {activeTab === 'ledger' && (
          <TrustReplayTimeline
            timeline={auditTimeline}
            resources={resources}
            selectedResourceId={selectedAuditResource}
            onSelectResource={(id) => {
              setSelectedAuditResource(id);
              loadTimeline(id);
            }}
            verification={chainVerification}
            onVerifyChain={handleVerifyChain}
            loading={actionLoading}
          />
        )}

        {activeTab === 'graph' && (
          <TrustGraph resources={resources} bookings={bookings} />
        )}

        {activeTab === 'arena' && (
          <SecurityArena
            bookings={bookings}
            onRefreshData={async () => {
              await loadBookings();
              await loadCatalog();
              if (selectedAuditResource) {
                await loadTimeline(selectedAuditResource);
              }
            }}
          />
        )}
      </main>

      {/* Zero-Trust Booking Modal */}
      {selectedBookingResource && (
        <ZeroTrustModal
          resource={selectedBookingResource}
          persona={currentPersona}
          eligibility={eligibility}
          onClose={() => setSelectedBookingResource(null)}
          onSubmit={handleSubmitBooking}
          loading={actionLoading}
        />
      )}

      {/* Check-In Handover Modal */}
      {handoverBooking && (
        <CheckInModal
          booking={handoverBooking}
          resource={resources.find((r) => r.id === handoverBooking.resource_id)}
          activeToken={activeToken}
          onClose={() => setHandoverBooking(null)}
          onSubmit={handleConfirmCheckIn}
          loading={actionLoading}
        />
      )}

      {/* Return & Incident Modal */}
      {returnBooking && (
        <ReturnModal
          booking={returnBooking}
          resource={resources.find((r) => r.id === returnBooking.resource_id)}
          onClose={() => setReturnBooking(null)}
          onSubmit={handleConfirmReturn}
          loading={actionLoading}
        />
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`p-4 rounded-2xl border shadow-2xl flex items-start gap-3 ${
              notification.type === 'success'
                ? 'bg-slate-900/95 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-900/95 border-rose-500/50 text-rose-300'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs font-semibold leading-relaxed">
              {notification.message}
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Institutional Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 PACT · Proof, Authorization, Custody & Trust · CodeHack India Grand Finale</p>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>FastAPI Core: :8000</span>
            <span>·</span>
            <span>SHA-256 Engine: Armed</span>
            <span>·</span>
            <span>Zero-Trust Gate: Strict</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
