import React, { useState } from 'react';
import Papa from 'papaparse';
import { useAdminStore } from '../../store/useAdminStore';
import { UploadCloud, AlertCircle, CheckCircle2, FileSpreadsheet, TrainTrack, MapPin } from 'lucide-react';
import { cn } from '../molecules/StationSearch';

const TABS = [
  { id: 'stations', label: 'Stations', icon: MapPin },
  { id: 'lines', label: 'Lines', icon: TrainTrack },
];

export const AdminBulkImport = () => {
  const { stations, lines, importBulkData } = useAdminStore();
  const [activeTab, setActiveTab] = useState('stations');
  const [file, setFile] = useState(null);
  const [stationPreview, setStationPreview] = useState([]);
  const [linePreview, setLinePreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const resetState = () => {
    setFile(null);
    setStationPreview([]);
    setLinePreview([]);
    setErrors([]);
    setProgress(0);
  };

  /* ── Station CSV validation ─────────────────────── */
  const validateStationData = (data) => {
    const newErrors = [];
    const validData = [];
    const existingIds = new Set(stations.map(s => s.id));
    const importIds = new Set();

    data.forEach((row, index) => {
      const rowNum = index + 1;
      if (!row.id || !row.name || !row.x || !row.y) { newErrors.push(`Row ${rowNum}: Missing required fields (id, name, x, y).`); return; }
      if (importIds.has(row.id)) { newErrors.push(`Row ${rowNum}: Duplicate ID '${row.id}'.`); return; }
      importIds.add(row.id);
      if (existingIds.has(row.id)) { newErrors.push(`Row ${rowNum}: ID '${row.id}' already exists.`); return; }
      validData.push({
        id: row.id,
        name: row.name,
        coordinates: { x: parseInt(row.x, 10), y: parseInt(row.y, 10) },
        facilities: row.facilities ? row.facilities.split('|') : []
      });
    });
    setErrors(newErrors);
    setStationPreview(validData);
    setLinePreview([]);
  };

  /* ── Line CSV validation ────────────────────────── */
  const validateLineData = (data) => {
    const newErrors = [];
    const validData = [];
    const existingLineIds = new Set(lines.map(l => l.id));
    const allStationIds = new Set(stations.map(s => s.id));
    // include any stations from preview too in case user is importing both at once
    stationPreview.forEach(s => allStationIds.add(s.id));
    const importIds = new Set();

    data.forEach((row, index) => {
      const rowNum = index + 1;
      if (!row.id || !row.name || !row.color || !row.stations) {
        newErrors.push(`Row ${rowNum}: Missing required fields (id, name, color, stations).`);
        return;
      }
      if (importIds.has(row.id)) { newErrors.push(`Row ${rowNum}: Duplicate line ID '${row.id}'.`); return; }
      importIds.add(row.id);
      if (existingLineIds.has(row.id)) { newErrors.push(`Row ${rowNum}: Line ID '${row.id}' already exists.`); return; }

      const stationIds = row.stations.split('|').map(s => s.trim()).filter(Boolean);
      const missingStations = stationIds.filter(s => !allStationIds.has(s));
      if (missingStations.length > 0) {
        newErrors.push(`Row ${rowNum}: Station(s) not found: ${missingStations.join(', ')}. Make sure stations are imported first.`);
        return;
      }

      // make sure the color looks like a proper hex code (e.g. #ff0000)
      const colorHex = row.color.trim();
      if (!/^#[0-9a-fA-F]{6}$/.test(colorHex)) {
        newErrors.push(`Row ${rowNum}: Invalid color '${colorHex}'. Use #hex format (e.g. #3b82f6).`);
        return;
      }

      validData.push({
        id: row.id,
        name: row.name,
        color: colorHex,
        stations: stationIds
      });
    });
    setErrors(newErrors);
    setLinePreview(validData);
  };

  /* ── File upload handler ────────────────────────── */
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setErrors([]);
    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (activeTab === 'stations') {
          validateStationData(results.data);
        } else {
          validateLineData(results.data);
        }
      },
    });
  };

  /* ── Commit import ──────────────────────────────── */
  const handleCommit = () => {
    setIsProcessing(true);
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        const newStations = stationPreview.length > 0 ? [...stations, ...stationPreview] : stations;
        const newLines = linePreview.length > 0 ? [...lines, ...linePreview] : lines;
        importBulkData(newStations, newLines);
        setIsProcessing(false);
        resetState();
      }
    }, 400);
  };

  const hasPreview = stationPreview.length > 0 || linePreview.length > 0;
  const isClean = errors.length === 0;

  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
        <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Bulk Import</h2>
      </div>

      {/* switch between stations and lines import */}
      <div className="flex gap-1 p-1 rounded-lg border mb-4" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); resetState(); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold transition-all",
              activeTab === tab.id ? "bg-indigo-500 text-white shadow-sm" : ""
            )}
            style={activeTab !== tab.id ? { color: 'var(--text-muted)' } : {}}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* the file picker area */}
      <div className="border-2 border-dashed rounded-xl p-5 text-center hover:border-indigo-500/20 transition-all relative cursor-pointer" style={{ borderColor: 'var(--border-glass)', background: 'var(--bg-input)' }}>
        <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" key={activeTab} />
        <UploadCloud className="w-7 h-7 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
        <p className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>
          Click or drag CSV file
        </p>
        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
          {activeTab === 'stations'
            ? 'Headers: id, name, x, y, facilities (pipe-separated)'
            : 'Headers: id, name, color (#hex), stations (pipe-separated station IDs)'
          }
        </p>
      </div>

      {/* show any validation errors here */}
      {errors.length > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-2 text-red-500 font-bold text-sm mb-2"><AlertCircle className="w-4 h-4" />Errors ({errors.length})</div>
          <ul className="text-xs text-red-400 list-disc pl-4 space-y-0.5 max-h-24 overflow-y-auto">{errors.map((err, i) => <li key={i}>{err}</li>)}</ul>
        </div>
      )}

      {/* preview table for station data */}
      {stationPreview.length > 0 && isClean && (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm mb-3"><CheckCircle2 className="w-4 h-4" />Ready: {stationPreview.length} stations</div>
          <div className="max-h-36 overflow-y-auto rounded-lg border mb-3" style={{ borderColor: 'var(--border-subtle)' }}>
            <table className="w-full text-xs text-left">
              <thead><tr style={{ background: 'var(--bg-secondary)' }}><th className="px-3 py-2 font-medium" style={{ color: 'var(--text-muted)' }}>ID</th><th className="px-3 py-2 font-medium" style={{ color: 'var(--text-muted)' }}>Name</th><th className="px-3 py-2 font-medium" style={{ color: 'var(--text-muted)' }}>Coords</th></tr></thead>
              <tbody>{stationPreview.slice(0, 5).map(row => (<tr key={row.id} style={{ borderTop: '1px solid var(--border-subtle)' }}><td className="px-3 py-2 font-mono" style={{ color: 'var(--text-muted)' }}>{row.id}</td><td className="px-3 py-2 font-medium" style={{ color: 'var(--text-primary)' }}>{row.name}</td><td className="px-3 py-2" style={{ color: 'var(--text-muted)' }}>{row.coordinates.x}, {row.coordinates.y}</td></tr>))}</tbody>
            </table>
            {stationPreview.length > 5 && <div className="text-center text-[10px] py-1.5" style={{ color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>+{stationPreview.length - 5} more</div>}
          </div>
        </div>
      )}

      {/* preview table for line data */}
      {linePreview.length > 0 && isClean && (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm mb-3"><CheckCircle2 className="w-4 h-4" />Ready: {linePreview.length} lines</div>
          <div className="max-h-36 overflow-y-auto rounded-lg border mb-3" style={{ borderColor: 'var(--border-subtle)' }}>
            <table className="w-full text-xs text-left">
              <thead><tr style={{ background: 'var(--bg-secondary)' }}><th className="px-3 py-2 font-medium" style={{ color: 'var(--text-muted)' }}>ID</th><th className="px-3 py-2 font-medium" style={{ color: 'var(--text-muted)' }}>Name</th><th className="px-3 py-2 font-medium" style={{ color: 'var(--text-muted)' }}>Color</th><th className="px-3 py-2 font-medium" style={{ color: 'var(--text-muted)' }}>Stations</th></tr></thead>
              <tbody>{linePreview.slice(0, 5).map(row => (<tr key={row.id} style={{ borderTop: '1px solid var(--border-subtle)' }}><td className="px-3 py-2 font-mono" style={{ color: 'var(--text-muted)' }}>{row.id}</td><td className="px-3 py-2 font-medium" style={{ color: 'var(--text-primary)' }}>{row.name}</td><td className="px-3 py-2"><span className="w-4 h-4 rounded-full inline-block align-middle" style={{ background: row.color }} /></td><td className="px-3 py-2" style={{ color: 'var(--text-muted)' }}>{row.stations.length} stops</td></tr>))}</tbody>
            </table>
            {linePreview.length > 5 && <div className="text-center text-[10px] py-1.5" style={{ color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>+{linePreview.length - 5} more</div>}
          </div>
        </div>
      )}

      {/* progress bar and import button */}
      {hasPreview && isClean && (
        <div className="mt-1">
          {isProcessing && (
            <div className="w-full rounded-full h-1.5 mb-3 overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
              <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}
          <button onClick={handleCommit} disabled={isProcessing} className="btn-primary !py-2.5 text-sm">
            {isProcessing
              ? 'Processing...'
              : `Import ${stationPreview.length > 0 ? `${stationPreview.length} Stations` : ''}${stationPreview.length > 0 && linePreview.length > 0 ? ' & ' : ''}${linePreview.length > 0 ? `${linePreview.length} Lines` : ''}`
            }
          </button>
        </div>
      )}
    </div>
  );
};