import React from 'react';
import {
  Search,
  Filter,
  Cpu,
  Layers,
  MapPin,
  Clock,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Sparkles,
} from 'lucide-react';
import { Resource, ResourceCategory, ResourceStatus } from '../types';

interface CatalogGridProps {
  resources: Resource[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory?: ResourceCategory;
  onSelectCategory: (cat?: ResourceCategory) => void;
  onRequestBooking: (resource: Resource) => void;
  loading: boolean;
}

export const CatalogGrid: React.FC<CatalogGridProps> = ({
  resources,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onRequestBooking,
  loading,
}) => {
  const getStatusBadge = (status: ResourceStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AVAILABLE
          </span>
        );
      case 'IN_USE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            IN USE
          </span>
        );
      case 'UNDER_MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Wrench className="w-3 h-3 text-rose-400" />
            MAINTENANCE LOCK
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400">
            {status}
          </span>
        );
    }
  };

  const availableCount = resources.filter((r) => r.status === 'AVAILABLE').length;
  const inUseCount = resources.filter((r) => r.status === 'IN_USE').length;
  const maintenanceCount = resources.filter((r) => r.status === 'UNDER_MAINTENANCE').length;

  return (
    <div className="space-y-6">
      {/* Hero Banner / Problem Context */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950 p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Unlock Underused Equipment & Spaces · Zero-Trust Access Pipeline
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Institutional Resource Catalog
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Eliminating the laboratory trust deficit through cryptographic custody, verified prerequisite checks,
            and immutable audit trails. Every booking is backed by SHA-256 verifiable Trust Capsules.
          </p>

          {/* Real-time Fleet Metrics */}
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
              <span className="text-slate-400">Total Assets:</span>
              <span className="text-white font-bold">{resources.length}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
              <span className="text-emerald-400 font-bold">{availableCount}</span>
              <span className="text-slate-400">Ready to Book</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
              <span className="text-amber-400 font-bold">{inUseCount}</span>
              <span className="text-slate-400">Active Custody</span>
            </div>
            {maintenanceCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <span className="text-rose-400 font-bold">{maintenanceCount}</span>
                <span className="text-slate-400">Incident Maintenance</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by equipment name, asset tag, department, or location..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950 text-slate-100 text-sm pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 placeholder-slate-500"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onSelectCategory(undefined)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === undefined
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/80'
            }`}
          >
            All Resources
          </button>
          <button
            onClick={() => onSelectCategory('EQUIPMENT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === 'EQUIPMENT'
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/80'
            }`}
          >
            Equipment
          </button>
          <button
            onClick={() => onSelectCategory('SPACE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === 'SPACE'
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/80'
            }`}
          >
            Specialized Spaces
          </button>
        </div>
      </div>

      {/* Catalog Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 rounded-xl bg-slate-900 border border-slate-800" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No resources found</h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search query or switching categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => {
            const isAvailable = res.status === 'AVAILABLE';
            return (
              <div
                key={res.id}
                className="group relative flex flex-col justify-between rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/90 hover:shadow-xl hover:shadow-sky-950/20 transition-all duration-200 overflow-hidden"
              >
                {/* Header row inside card */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-mono text-[11px] font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20">
                      {res.asset_tag}
                    </span>
                    {getStatusBadge(res.status)}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                      {res.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{res.location} · {res.department}</span>
                    </p>
                  </div>

                  {/* Requirements badge pills */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/70">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                        Zero-Trust Policy:
                      </span>
                      <span>Max {res.max_duration_hours}h / booking</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {res.requirements && res.requirements.length > 0 ? (
                        res.requirements.map((req, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60"
                          >
                            🔒 {req.qualification_key.replace('_', ' ')}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">
                          Open campus access (No prerequisite)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-5 py-3.5 bg-slate-950/50 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Slot lock: 15-min token</span>
                  </div>

                  <button
                    onClick={() => onRequestBooking(res)}
                    disabled={!isAvailable}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isAvailable
                        ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-sm shadow-sky-500/25 active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                    }`}
                  >
                    {isAvailable ? 'Check & Reserve' : 'Unavailable'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
