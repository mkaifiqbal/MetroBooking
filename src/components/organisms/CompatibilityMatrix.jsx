import React, { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { cn } from '../molecules/StationSearch';

const matrixData = [
  { source: 'v1.0', targets: { 'v1.0': 'blocked', 'v1.1': 'direct', 'v2.0': 'intermediate', 'v2.1': 'blocked' } },
  { source: 'v1.1', targets: { 'v1.0': 'blocked', 'v1.1': 'blocked', 'v2.0': 'direct', 'v2.1': 'intermediate' } },
  { source: 'v2.0', targets: { 'v1.0': 'blocked', 'v1.1': 'blocked', 'v2.0': 'blocked', 'v2.1': 'direct' } },
  { source: 'v2.1', targets: { 'v1.0': 'blocked', 'v1.1': 'blocked', 'v2.0': 'blocked', 'v2.1': 'blocked' } },
];
const versions = ['v1.0', 'v1.1', 'v2.0', 'v2.1'];

const getStatusDetails = (status) => {
  switch (status) {
    case 'direct': return { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', text: '#16a34a', label: 'Direct', tooltip: 'Direct upgrade allowed.' };
    case 'intermediate': return { bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.25)', text: '#ca8a04', label: 'Intermediate', tooltip: 'Requires intermediate stop.' };
    case 'blocked': return { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.15)', text: '#dc2626', label: 'Blocked', tooltip: 'Upgrade path not supported.' };
    default: return { bg: 'transparent', border: 'transparent', text: 'var(--text-muted)', label: '-', tooltip: '' };
  }
};

export const CompatibilityMatrix = () => {
  const [hoveredCell, setHoveredCell] = useState(null);

  return (
    <div className="glass-card p-6 animate-fade-in-up overflow-x-auto" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center gap-2 mb-5">
        <Settings2 className="w-5 h-5 text-green-400" />
        <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Compatibility Matrix</h2>
      </div>

      <table className="w-full border-collapse min-w-[400px]">
        <thead>
          <tr>
            <th className="p-2.5 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>Source \ Target</th>
            {versions.map(v => (<th key={v} className="p-2.5 text-center text-xs font-bold" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)' }}>{v}</th>))}
          </tr>
        </thead>
        <tbody>
          {matrixData.map(row => (
            <tr key={row.source}>
              <td className="p-2.5 text-xs font-bold" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)' }}>{row.source}</td>
              {versions.map(target => {
                const status = row.targets[target];
                const { bg, border, text, label, tooltip } = getStatusDetails(status);
                const cellKey = `${row.source}-${target}`;
                const isHovered = hoveredCell === cellKey;
                return (
                  <td key={cellKey} className="p-1.5 text-center relative" style={{ borderBottom: '1px solid var(--border-subtle)' }} onMouseEnter={() => setHoveredCell(cellKey)} onMouseLeave={() => setHoveredCell(null)}>
                    <div className="py-1.5 px-2 rounded-lg text-[10px] font-bold cursor-help transition-all duration-200" style={{ background: bg, border: `1px solid ${border}`, color: text, transform: isHovered ? 'scale(1.08)' : 'scale(1)' }}>
                      {label}
                    </div>
                    {isHovered && tooltip && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap z-20 pointer-events-none" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', boxShadow: 'var(--shadow-card)' }}>
                        {tooltip}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)' }} />
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex gap-4 text-[10px]" style={{ color: 'var(--text-muted)' }}>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded" style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.3)' }} />Direct</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded" style={{ background: 'rgba(234,179,8,0.2)', border: '1px solid rgba(234,179,8,0.3)' }} />Intermediate</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }} />Blocked</div>
      </div>
    </div>
  );
};