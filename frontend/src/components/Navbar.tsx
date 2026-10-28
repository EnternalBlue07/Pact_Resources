import React from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  Lock,
  Terminal,
  Share2,
  UserCheck,
  Radio,
} from 'lucide-react';
import { UserRole } from '../types';

export interface Persona {
  id: string;
  name: string;
  role: UserRole;
  dept: string;
  avatarColor: string;
}

export const DEMO_PERSONAS: Persona[] = [
  {
    id: 'u-student-01',
    name: 'Aarav Sharma',
    role: 'REQUESTER',
    dept: 'Mechanical Engineering',
    avatarColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  },
  {
    id: 'u-custodian-01',
    name: 'Prof. Rajesh Rao',
    role: 'CUSTODIAN',
    dept: 'Electrical Engineering',
    avatarColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    id: 'u-admin-01',
    name: 'Dr. Anita Kapoor',
    role: 'ADMINISTRATOR',
    dept: 'Central Facilities',
    avatarColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  {
    id: 'u-auditor-01',
    name: 'Inspector Vikram Menon',
    role: 'AUDITOR',
    dept: 'Campus Compliance',
    avatarColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
];

interface NavbarProps {
  currentPersona: Persona;
  onSelectPersona: (p: Persona) => void;
  activeTab: 'catalog' | 'custodian' | 'ledger' | 'graph' | 'arena';
  onChangeTab: (tab: 'catalog' | 'custodian' | 'ledger' | 'graph' | 'arena') => void;
  pendingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPersona,
  onSelectPersona,
  activeTab,
  onChangeTab,
  pendingCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 shadow-lg shadow-sky-500/20 text-white">
              <ShieldCheck className="w-6 h-6" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider text-white">PACT</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-sky-500/10 text-sky-400 border border-sky-500/25">
                  CodeHack 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-tight">
                Proof Before Access · Evidence After Return
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onChangeTab('catalog')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Catalog
            </button>

            <button
              onClick={() => onChangeTab('custodian')}
              className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'custodian'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Custodian Desk
              {pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onChangeTab('ledger')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ledger'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Trust Capsule
            </button>

            <button
              onClick={() => onChangeTab('graph')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'graph'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              Trust Graph
            </button>

            <button
              onClick={() => onChangeTab('arena')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'arena'
                  ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                  : 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Security Arena
            </button>
          </nav>

          {/* Right Controls: Persona & Live Badge */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
              <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
              <span>Zero-Trust Live</span>
            </div>

            {/* Persona Selector */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border ${currentPersona.avatarColor}`}
              >
                {currentPersona.name[0]}
              </div>
              <div className="hidden sm:block text-left mr-1">
                <div className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                  {currentPersona.name}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  {currentPersona.role}
                </div>
              </div>
              <select
                aria-label="Active Persona"
                value={currentPersona.id}
                onChange={(e) => {
                  const found = DEMO_PERSONAS.find((p) => p.id === e.target.value);
                  if (found) onSelectPersona(found);
                }}
                className="bg-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
              >
                {DEMO_PERSONAS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-800/80 overflow-x-auto gap-2 text-xs">
          <button
            onClick={() => onChangeTab('catalog')}
            className={`px-3 py-1 rounded-lg shrink-0 font-medium ${
              activeTab === 'catalog' ? 'bg-sky-500 text-white' : 'text-slate-400'
            }`}
          >
            Catalog
          </button>
          <button
            onClick={() => onChangeTab('custodian')}
            className={`px-3 py-1 rounded-lg shrink-0 font-medium ${
              activeTab === 'custodian' ? 'bg-sky-500 text-white' : 'text-slate-400'
            }`}
          >
            Desk {pendingCount > 0 && `(${pendingCount})`}
          </button>
          <button
            onClick={() => onChangeTab('ledger')}
            className={`px-3 py-1 rounded-lg shrink-0 font-medium ${
              activeTab === 'ledger' ? 'bg-sky-500 text-white' : 'text-slate-400'
            }`}
          >
            Ledger
          </button>
          <button
            onClick={() => onChangeTab('graph')}
            className={`px-3 py-1 rounded-lg shrink-0 font-medium ${
              activeTab === 'graph' ? 'bg-sky-500 text-white' : 'text-slate-400'
            }`}
          >
            Graph
          </button>
          <button
            onClick={() => onChangeTab('arena')}
            className={`px-3 py-1 rounded-lg shrink-0 font-medium ${
              activeTab === 'arena' ? 'bg-rose-500 text-white' : 'text-rose-400'
            }`}
          >
            Arena
          </button>
        </div>
      </div>
    </header>
  );
};
