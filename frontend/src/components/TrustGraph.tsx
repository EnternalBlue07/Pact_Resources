import React, { useState } from 'react';
import {
  Share2,
  ShieldCheck,
  FileText,
  KeyRound,
  RotateCcw,
  Lock,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Resource, Booking } from '../types';

interface TrustGraphProps {
  resources: Resource[];
  bookings: Booking[];
}

interface GraphNode {
  id: string;
  label: string;
  subtitle: string;
  category: 'RESOURCE' | 'POLICY' | 'REQUEST' | 'APPROVAL' | 'HANDOVER' | 'EVIDENCE' | 'CAPSULE';
  x: number;
  y: number;
  description: string;
  status: 'ACTIVE' | 'VERIFIED' | 'CHAINED';
}

export const TrustGraph: React.FC<TrustGraphProps> = ({ resources, bookings }) => {
  const [selectedNode, setSelectedNode] = useState<string>('node-capsule');

  const sampleResource = resources[0] || {
    name: 'JEOL Field Emission TEM',
    asset_tag: 'PACT-EQ-TEM-001',
    department: 'Materials Science',
    location: 'Advanced Characterization Cleanroom',
  };

  const sampleBooking = bookings[0] || {
    id: 'b-demo-01',
    requester_id: 'u-student-01',
    purpose: 'Nanocrystalline lattice defect imaging',
    status: 'CHECKED_OUT',
  };

  const nodes: GraphNode[] = [
    {
      id: 'node-resource',
      label: 'Resource Asset',
      subtitle: sampleResource.asset_tag,
      category: 'RESOURCE',
      x: 100,
      y: 120,
      description: `Physical institutional asset registered under zero-trust governance: ${sampleResource.name}.`,
      status: 'ACTIVE',
    },
    {
      id: 'node-policy',
      label: 'Zero-Trust Gate',
      subtitle: 'Safety & Quota Rules',
      category: 'POLICY',
      x: 350,
      y: 60,
      description: 'Requires verified safety qualification and strictly enforces max-2 active concurrency quota.',
      status: 'VERIFIED',
    },
    {
      id: 'node-request',
      label: 'Booking Intent',
      subtitle: sampleBooking.requester_id,
      category: 'REQUEST',
      x: 350,
      y: 200,
      description: `Formal access reservation with documented research justification: "${sampleBooking.purpose}".`,
      status: 'ACTIVE',
    },
    {
      id: 'node-approval',
      label: 'Custodian Sign-off',
      subtitle: 'Prof. Rajesh Rao',
      category: 'APPROVAL',
      x: 600,
      y: 120,
      description: 'Custodial review verifies experiment safety, slot availability, and grants temporary reservation.',
      status: 'VERIFIED',
    },
    {
      id: 'node-handover',
      label: '15-Min Token',
      subtitle: 'Single-Use OTP',
      category: 'HANDOVER',
      x: 820,
      y: 60,
      description: 'Cryptographic single-use token binding physical custody transfer to the verified requester.',
      status: 'ACTIVE',
    },
    {
      id: 'node-evidence',
      label: 'Condition Baseline',
      subtitle: 'Pre & Post Inspection',
      category: 'EVIDENCE',
      x: 820,
      y: 200,
      description: 'Dual-sign-off checklist capturing physical integrity, cable status, and defect reporting.',
      status: 'VERIFIED',
    },
    {
      id: 'node-capsule',
      label: 'Trust Capsule',
      subtitle: 'SHA-256 Chained Block',
      category: 'CAPSULE',
      x: 1050,
      y: 130,
      description: 'Tamper-evident hash-chained audit ledger entry mathematically sealing the transaction.',
      status: 'CHAINED',
    },
  ];

  const edges = [
    { from: 'node-resource', to: 'node-policy' },
    { from: 'node-resource', to: 'node-request' },
    { from: 'node-policy', to: 'node-approval' },
    { from: 'node-request', to: 'node-approval' },
    { from: 'node-approval', to: 'node-handover' },
    { from: 'node-handover', to: 'node-evidence' },
    { from: 'node-evidence', to: 'node-capsule' },
  ];

  const activeNodeData = nodes.find((n) => n.id === selectedNode) || nodes[6];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Share2 className="w-5 h-5 text-sky-400" />
          Trust Graph · Topological Custody Architecture
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Interactive map visualizing the complete provenance web connecting resources, policies, tokens, evidence, and cryptographic blocks.
        </p>
      </div>

      {/* Main Interactive Graph Canvas & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SVG Graph Viewport */}
        <div className="lg:col-span-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-2xl relative overflow-x-auto min-h-[440px] flex items-center justify-center">
          <svg className="w-[1200px] h-[340px]" viewBox="0 0 1200 340">
            <defs>
              <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Render Connecting Edges */}
            {edges.map((e, idx) => {
              const start = nodes.find((n) => n.id === e.from)!;
              const end = nodes.find((n) => n.id === e.to)!;
              const isHighlighted = selectedNode === e.from || selectedNode === e.to;

              return (
                <g key={idx}>
                  <line
                    x1={start.x + 60}
                    y1={start.y + 35}
                    x2={end.x + 60}
                    y2={end.y + 35}
                    stroke={isHighlighted ? '#38bdf8' : '#1e293b'}
                    strokeWidth={isHighlighted ? 3 : 1.5}
                    strokeDasharray={isHighlighted ? '6 3' : 'none'}
                    className="transition-all duration-300"
                  />
                  {isHighlighted && (
                    <circle
                      r="4"
                      fill="#38bdf8"
                      className="animate-ping"
                      cx={(start.x + end.x) / 2 + 60}
                      cy={(start.y + end.y) / 2 + 35}
                    />
                  )}
                </g>
              );
            })}

            {/* Render Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNode === node.id;
              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node.id)}
                  className="cursor-pointer group"
                  transform={`translate(${node.x}, ${node.y})`}
                >
                  {/* Card Background */}
                  <rect
                    width="140"
                    height="70"
                    rx="12"
                    fill={isSelected ? '#0f172a' : '#090d16'}
                    stroke={isSelected ? '#38bdf8' : '#1e293b'}
                    strokeWidth={isSelected ? '2' : '1'}
                    filter={isSelected ? 'url(#glow)' : undefined}
                    className="transition-all duration-200"
                  />

                  {/* Status Indicator Pill */}
                  <circle
                    cx="120"
                    cy="16"
                    r="4"
                    fill={node.status === 'CHAINED' ? '#38bdf8' : '#10b981'}
                    className={isSelected ? 'animate-pulse' : ''}
                  />

                  {/* Node Title */}
                  <text
                    x="14"
                    y="28"
                    fill="#f8fafc"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="Inter, sans-serif"
                  >
                    {node.label}
                  </text>

                  {/* Node Subtitle */}
                  <text
                    x="14"
                    y="46"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="Inter, sans-serif"
                    className="truncate"
                  >
                    {node.subtitle}
                  </text>

                  {/* Category Chip */}
                  <text
                    x="14"
                    y="58"
                    fill="#0284c7"
                    fontSize="7.5"
                    fontWeight="bold"
                    letterSpacing="0.5"
                    fontFamily="ui-monospace, monospace"
                  >
                    {node.category}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Node Details Inspector */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                {activeNodeData.category}
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {activeNodeData.status}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">{activeNodeData.label}</h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">{activeNodeData.subtitle}</p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              {activeNodeData.description}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/20 text-xs text-sky-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Cryptographic Integrity
            </div>
            <p className="text-[11px] text-slate-400">
              This node's state is sealed in the Trust Capsule and verified across all historical state blocks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
