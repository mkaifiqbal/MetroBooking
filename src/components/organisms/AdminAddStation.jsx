import React, { useState, useRef, useCallback } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useAdminStore } from '../../store/useAdminStore';
import { Plus, X, MapPin, MousePointer2, ZoomIn, ZoomOut, Maximize2, Crosshair } from 'lucide-react';
import { cn } from '../molecules/StationSearch';

const PRESET_FACILITIES = ['accessibility', 'parking', 'exits', 'wifi', 'restroom', 'elevator'];

const CustomFacilityInput = ({ onAdd }) => {
    const [value, setValue] = useState('');
    const handleAdd = () => {
        const trimmed = value.trim().toLowerCase();
        if (trimmed) { onAdd(trimmed); setValue(''); }
    };
    return (
        <div className="flex gap-2">
            <input
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
                placeholder="Add custom facility..."
                className="metro-input !pl-4 !py-2 text-xs flex-1"
            />
            <button type="button" onClick={handleAdd} className="px-3 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1" style={{ background: 'var(--bg-input)', color: 'var(--text-accent)', borderColor: 'var(--border-glass)' }} disabled={!value.trim()}>
                <Plus className="w-3.5 h-3.5" /> Add
            </button>
        </div>
    );
};

// a map where you can zoom in, pan around, and click to place a station
const StationPreviewMap = ({ x, y, onCoordsChange, stations, lines }) => {
    const svgRef = useRef(null);
    const [pickMode, setPickMode] = useState(false);
    const px = parseInt(x, 10) || 0;
    const py = parseInt(y, 10) || 0;
    const hasCoords = x !== '' && y !== '';

    const handleMapClick = useCallback((e) => {
        if (!pickMode) return;
        const svg = svgRef.current;
        if (!svg) return;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());
        const newX = Math.round(Math.max(0, Math.min(1000, svgPt.x)));
        const newY = Math.round(Math.max(0, Math.min(750, svgPt.y)));
        onCoordsChange(newX, newY);
        setPickMode(false);
    }, [pickMode, onCoordsChange]);

    return (
        <div className="rounded-2xl overflow-hidden border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-glass)', boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <MapPin className="w-4 h-4" style={{ color: 'var(--text-accent)' }} />
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Position Preview</span>
                <div className="ml-auto flex items-center gap-2">
                    {hasCoords && (
                        <span className="text-[10px] font-mono px-2 py-1 rounded-md" style={{ color: 'var(--text-accent)', background: 'var(--bg-input)', border: '1px solid var(--border-glass)' }}>({px}, {py})</span>
                    )}
                </div>
            </div>

            {/* map preview */}
            <div className="relative" style={{ height: 'clamp(260px, 50vw, 380px)' }}>
                <TransformWrapper initialScale={1} minScale={0.5} maxScale={5} centerOnInit disabled={pickMode} panning={{ disabled: pickMode }}>
                    {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                            <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
                                {[
                                    { fn: zoomIn, icon: ZoomIn, label: 'Zoom in' },
                                    { fn: zoomOut, icon: ZoomOut, label: 'Zoom out' },
                                    { fn: resetTransform, icon: Maximize2, label: 'Reset' },
                                ].map(({ fn, icon: Ic, label }) => (
                                    <button key={label} onClick={() => fn()} className="w-8 h-8 flex items-center justify-center rounded-lg transition-all border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-glass)', color: 'var(--text-secondary)' }} aria-label={label}><Ic className="w-4 h-4" /></button>
                                ))}
                            </div>

                            <div className="absolute top-3 left-3 z-10">
                                <button
                                    onClick={() => setPickMode(!pickMode)}
                                    className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border", pickMode ? "bg-green-500 text-white border-green-400 shadow-lg shadow-green-500/30" : "")}
                                    style={!pickMode ? { background: 'var(--bg-card)', borderColor: 'var(--border-glass)', color: 'var(--text-secondary)' } : {}}
                                >
                                    <Crosshair className="w-3.5 h-3.5" />
                                    {pickMode ? 'Click to Place' : 'Pick on Map'}
                                </button>
                            </div>

                            {/* shows a message when pick mode is on */}
                            {pickMode && (
                                <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-green-500/90 text-white text-xs font-semibold animate-fade-in-up backdrop-blur-sm">
                                    <MousePointer2 className="w-3.5 h-3.5" />
                                    Click anywhere on the map to place the station
                                </div>
                            )}

                            <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%', height: '100%' }}>
                                <svg ref={svgRef} viewBox="0 0 1000 750" className={cn("w-full h-full", pickMode ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing")} onClick={handleMapClick}>
                                    <defs>
                                        <pattern id="as-grid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="0.8" fill="var(--map-grid-dot)" /></pattern>
                                        <pattern id="as-grid-lines" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                                            <line x1="0" y1="0" x2="0" y2="100" stroke="var(--map-grid-line)" strokeWidth="0.5" />
                                            <line x1="0" y1="0" x2="100" y2="0" stroke="var(--map-grid-line)" strokeWidth="0.5" />
                                        </pattern>
                                        <filter id="as-glow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                                        <radialGradient id="as-rg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#16a34a" stopOpacity="0.3" /><stop offset="100%" stopColor="#16a34a" stopOpacity="0" /></radialGradient>
                                    </defs>
                                    <rect width="1000" height="750" fill="url(#as-grid)" />
                                    <rect width="1000" height="750" fill="url(#as-grid-lines)" />

                                    {lines.map(line => {
                                        const pts = line.stations.map(id => stations.find(s => s.id === id)).filter(Boolean).map(s => `${s.coordinates.x},${s.coordinates.y}`).join(' ');
                                        return (
                                            <g key={line.id}>
                                                <polyline points={pts} fill="none" stroke={line.color} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" opacity={0.12} />
                                                <polyline points={pts} fill="none" stroke={line.color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" opacity={0.5} />
                                            </g>
                                        );
                                    })}

                                    {stations.map(st => (
                                        <g key={st.id}>
                                            <circle cx={st.coordinates.x} cy={st.coordinates.y} r={5} fill="var(--station-fill)" stroke="var(--text-muted)" strokeWidth={1.5} opacity={0.65} />
                                            <text x={st.coordinates.x} y={st.coordinates.y - 10} textAnchor="middle" style={{ fontSize: '8px', fill: 'var(--text-muted)', fontFamily: 'Inter', fontWeight: 600, opacity: 0.55 }}>{st.name}</text>
                                        </g>
                                    ))}

                                    {/* New station marker */}
                                    {hasCoords && (
                                        <g style={{ filter: 'url(#as-glow)' }}>
                                            <circle cx={px} cy={py} r={40} fill="url(#as-rg)" />
                                            <circle cx={px} cy={py} r={20} fill="none" stroke="#818cf8" strokeWidth={1} opacity={0.5}>
                                                <animate attributeName="r" values="12;24;12" dur="2s" repeatCount="indefinite" />
                                                <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                                            </circle>
                                            <line x1={px - 18} y1={py} x2={px - 8} y2={py} stroke="#818cf8" strokeWidth={1} opacity={0.5} />
                                            <line x1={px + 8} y1={py} x2={px + 18} y2={py} stroke="#818cf8" strokeWidth={1} opacity={0.5} />
                                            <line x1={px} y1={py - 18} x2={px} y2={py - 8} stroke="#818cf8" strokeWidth={1} opacity={0.5} />
                                            <line x1={px} y1={py + 8} x2={px} y2={py + 18} stroke="#818cf8" strokeWidth={1} opacity={0.5} />
                                            <circle cx={px} cy={py} r={7} fill="#16a34a" stroke="white" strokeWidth={2.5} />
                                            <rect x={px - 35} y={py - 28} width={70} height={15} rx={4} fill="rgba(22,163,74,0.9)" />
                                            <text x={px} y={py - 18} textAnchor="middle" style={{ fontSize: '8px', fill: 'white', fontWeight: 700, fontFamily: 'Inter' }}>New Station</text>
                                        </g>
                                    )}
                                </svg>
                            </TransformComponent>
                        </>
                    )}
                </TransformWrapper>
            </div>
        </div>
    );
};

export const AdminAddStation = () => {
    const { addStation, addStationToLine, stations, lines } = useAdminStore();
    const [name, setName] = useState('');
    const [x, setX] = useState('');
    const [y, setY] = useState('');
    const [facilities, setFacilities] = useState([]);
    const [selectedLineIds, setSelectedLineIds] = useState([]);
    const [justAdded, setJustAdded] = useState(null);

    const toggleFacility = (f) => setFacilities(prev => prev.includes(f) ? prev.filter(v => v !== f) : [...prev, f]);
    const toggleLine = (lineId) => setSelectedLineIds(prev => prev.includes(lineId) ? prev.filter(l => l !== lineId) : [...prev, lineId]);

    const handleCoordsChange = useCallback((newX, newY) => {
        setX(String(newX));
        setY(String(newY));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !x || !y) return;
        addStation(name, x, y, facilities);
        setTimeout(() => {
            const storeState = useAdminStore.getState();
            const newStation = storeState.stations[storeState.stations.length - 1];
            if (newStation) {
                selectedLineIds.forEach(lineId => addStationToLine(lineId, newStation.id));
                setJustAdded(newStation);
                setTimeout(() => setJustAdded(null), 3000);
            }
        }, 10);
        setName(''); setX(''); setY(''); setFacilities([]); setSelectedLineIds([]);
    };

    return (
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            <form onSubmit={handleSubmit} className="glass-card p-4 sm:p-6 animate-fade-in-up">
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-green-500/15 flex items-center justify-center border border-green-500/20 shrink-0">
                        <Plus className="w-4 h-4 text-green-400" />
                    </div>
                    Add New Station
                </h3>
                <div className="space-y-3 sm:space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Station Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Central Park" className="metro-input !pl-4" required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>X Coordinate</label>
                            <input value={x} onChange={e => setX(e.target.value)} placeholder="0-1000" type="number" min="0" max="1000" className="metro-input !pl-4" required />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Y Coordinate</label>
                            <input value={y} onChange={e => setY(e.target.value)} placeholder="0-750" type="number" min="0" max="750" className="metro-input !pl-4" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Add to Line(s)</label>
                        <div className="flex flex-wrap gap-2">
                            {lines.map(line => (
                                <button key={line.id} type="button" onClick={() => toggleLine(line.id)} className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all border flex items-center gap-1.5"
                                    style={selectedLineIds.includes(line.id)
                                        ? { background: `${line.color}20`, color: line.color, borderColor: `${line.color}40` }
                                        : { color: 'var(--text-muted)', background: 'var(--bg-input)', borderColor: 'var(--border-subtle)' }}>
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: line.color }} />{line.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Facilities</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {PRESET_FACILITIES.map(f => (
                                <button key={f} type="button" onClick={() => toggleFacility(f)} className={cn("text-xs px-3 py-1.5 rounded-lg font-semibold transition-all border", facilities.includes(f) ? "bg-green-500/20 text-green-300 border-green-500/30" : "")} style={!facilities.includes(f) ? { color: 'var(--text-muted)', background: 'var(--bg-input)', borderColor: 'var(--border-subtle)' } : {}}>
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                        <CustomFacilityInput onAdd={(f) => { if (f && !facilities.includes(f)) setFacilities(prev => [...prev, f]); }} />
                        {facilities.filter(f => !PRESET_FACILITIES.includes(f)).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {facilities.filter(f => !PRESET_FACILITIES.includes(f)).map(f => (
                                    <span key={f} className="text-[10px] font-semibold px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                        {f}
                                        <button type="button" onClick={() => setFacilities(prev => prev.filter(v => v !== f))} className="hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <button type="submit" className="btn-primary !py-2.5 sm:!py-3 text-sm w-full flex items-center justify-center gap-2"><MapPin className="w-4 h-4" /> Add Station</button>
                </div>
                {justAdded && (
                    <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 animate-fade-in-up">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-sm font-medium text-emerald-400">Added "{justAdded.name}" at ({justAdded.coordinates.x}, {justAdded.coordinates.y})</span>
                    </div>
                )}
            </form>

            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <StationPreviewMap x={x} y={y} onCoordsChange={handleCoordsChange} stations={stations} lines={lines} />
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4">
                    <div className="glass-card p-3 sm:p-4 text-center">
                        <div className="text-xl sm:text-2xl font-extrabold" style={{ color: 'var(--text-accent)' }}>{stations.length}</div>
                        <div className="text-[10px] sm:text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Stations</div>
                    </div>
                    <div className="glass-card p-3 sm:p-4 text-center">
                        <div className="text-xl sm:text-2xl font-extrabold" style={{ color: 'var(--text-accent)' }}>{lines.length}</div>
                        <div className="text-[10px] sm:text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Lines</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
