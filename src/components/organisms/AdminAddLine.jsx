import React, { useState, useRef, useCallback } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useAdminStore } from '../../store/useAdminStore';
import { Palette, Plus, Eye, MousePointer2, ZoomIn, ZoomOut, Maximize2, Crosshair } from 'lucide-react';
import { cn } from '../molecules/StationSearch';

export const AdminAddLine = () => {
    const { addLine, stations, lines } = useAdminStore();
    const [name, setName] = useState('');
    const [color, setColor] = useState('#16a34a');
    const [selectedStations, setSelectedStations] = useState([]);
    const [justAdded, setJustAdded] = useState(null);
    const [hoveredStation, setHoveredStation] = useState(null);
    const [selectMode, setSelectMode] = useState(false);

    const toggleStation = (id) => setSelectedStations(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || selectedStations.length < 2) return;
        addLine(name, color, selectedStations);
        setJustAdded({ name, color, count: selectedStations.length });
        setTimeout(() => setJustAdded(null), 3000);
        setName(''); setColor('#16a34a'); setSelectedStations([]);
    };

    // build the line path to show on the map
    const previewStations = selectedStations.map(id => stations.find(s => s.id === id)).filter(Boolean);
    const previewPoints = previewStations.map(st => `${st.coordinates.x},${st.coordinates.y}`).join(' ');

    return (
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            {/* the form to fill in line name, color and pick stations */}
            <form onSubmit={handleSubmit} className="glass-card p-4 sm:p-6 animate-fade-in-up">
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-cyan-500/15 flex items-center justify-center border border-cyan-500/20 shrink-0">
                        <Palette className="w-4 h-4 text-cyan-400" />
                    </div>
                    Add New Line
                </h3>

                <div className="space-y-3 sm:space-y-4">
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Line Name</label>
                            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Green Line" className="metro-input !pl-4" required />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Color</label>
                            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border-2 bg-transparent" style={{ borderColor: 'var(--border-glass)' }} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                            Select Stations <span className="font-normal normal-case">({selectedStations.length} selected, min 2)</span>
                        </label>
                        <div className="max-h-40 sm:max-h-52 overflow-y-auto space-y-0.5 sm:space-y-1 pr-1 rounded-xl p-1.5 sm:p-2 border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-input)' }}>
                            {stations.map(s => {
                                const isSelected = selectedStations.includes(s.id);
                                const orderNum = isSelected ? selectedStations.indexOf(s.id) + 1 : null;
                                return (
                                    <button key={s.id} type="button" onClick={() => toggleStation(s.id)}
                                        className={cn("w-full text-left text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-all border flex items-center gap-2", isSelected ? "border-green-500/25" : "border-transparent")}
                                        style={isSelected ? { background: `${color}12`, color: color } : { color: 'var(--text-secondary)' }}
                                    >
                                        {isSelected ? (
                                            <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white shrink-0" style={{ background: color }}>{orderNum}</span>
                                        ) : (
                                            <span className="w-5 h-5 rounded-full border shrink-0" style={{ borderColor: 'var(--border-subtle)' }} />
                                        )}
                                        <span className="font-medium">{s.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button type="submit" disabled={selectedStations.length < 2} className="btn-primary !py-2.5 sm:!py-3 text-sm w-full flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> Create Line ({selectedStations.length} stops)
                    </button>
                </div>

                {justAdded && (
                    <div className="mt-4 p-3 rounded-xl border flex items-center gap-2 animate-fade-in-up" style={{ background: `${justAdded.color}10`, borderColor: `${justAdded.color}25` }}>
                        <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: justAdded.color }} />
                        <span className="text-sm font-medium" style={{ color: justAdded.color }}>Created "{justAdded.name}" with {justAdded.count} stations</span>
                    </div>
                )}
            </form>

            {/* map showing how the new line will look */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="rounded-2xl overflow-hidden border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-glass)', boxShadow: 'var(--shadow-card)' }}>
                    {/* title and icon */}
                    <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                        <Eye className="w-4 h-4" style={{ color: 'var(--text-accent)' }} />
                        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Line Preview</span>
                        <div className="ml-auto flex items-center gap-2">
                            {name && <span className="text-xs font-bold px-2 py-1 rounded-md" style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}>{name}</span>}
                            {selectedStations.length > 0 && <span className="text-[10px] font-semibold px-2 py-1 rounded-md bg-green-500/10 text-green-400 border border-green-500/20">{selectedStations.length} stops</span>}
                        </div>
                    </div>

                    {/* the interactive map */}
                    <div className="relative" style={{ height: 'clamp(260px, 50vw, 380px)' }}>
                        <TransformWrapper initialScale={1} minScale={0.5} maxScale={5} centerOnInit disabled={selectMode} panning={{ disabled: selectMode }}>
                            {({ zoomIn, zoomOut, resetTransform }) => (
                                <>
                                    {/* zoom in/out and reset buttons */}
                                    <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
                                        {[
                                            { fn: zoomIn, icon: ZoomIn, label: 'Zoom in' },
                                            { fn: zoomOut, icon: ZoomOut, label: 'Zoom out' },
                                            { fn: resetTransform, icon: Maximize2, label: 'Reset' },
                                        ].map(({ fn, icon: Ic, label }) => (
                                            <button key={label} onClick={() => fn()} className="w-8 h-8 flex items-center justify-center rounded-lg transition-all border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-glass)', color: 'var(--text-secondary)' }} aria-label={label}><Ic className="w-4 h-4" /></button>
                                        ))}
                                    </div>

                                    {/* toggle to click on stations to add them */}
                                    <div className="absolute top-3 left-3 z-10">
                                        <button
                                            onClick={() => setSelectMode(!selectMode)}
                                            className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border", selectMode ? "bg-cyan-500 text-white border-cyan-400 shadow-lg shadow-cyan-500/30" : "")}
                                            style={!selectMode ? { background: 'var(--bg-card)', borderColor: 'var(--border-glass)', color: 'var(--text-secondary)' } : {}}
                                        >
                                            <Crosshair className="w-3.5 h-3.5" />
                                            {selectMode ? 'Click Stations' : 'Select on Map'}
                                        </button>
                                    </div>

                                    {/* message shown when select mode is on */}
                                    {selectMode && (
                                        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-cyan-500/90 text-white text-xs font-semibold animate-fade-in-up backdrop-blur-sm">
                                            <MousePointer2 className="w-3.5 h-3.5" />
                                            Click on stations to add or remove them from the line
                                        </div>
                                    )}

                                    <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%', height: '100%' }}>
                                        <svg viewBox="0 0 1000 750" className={cn("w-full h-full", selectMode ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing")}>
                                            <defs>
                                                <pattern id="al-grid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="0.8" fill="var(--map-grid-dot)" /></pattern>
                                                <pattern id="al-grid-lines" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                                                    <line x1="0" y1="0" x2="0" y2="100" stroke="var(--map-grid-line)" strokeWidth="0.5" />
                                                    <line x1="0" y1="0" x2="100" y2="0" stroke="var(--map-grid-line)" strokeWidth="0.5" />
                                                </pattern>
                                                <filter id="al-glow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                                            </defs>
                                            <rect width="1000" height="750" fill="url(#al-grid)" />
                                            <rect width="1000" height="750" fill="url(#al-grid-lines)" />

                                            {/* all current lines drawn on the map */}
                                            {lines.map(line => {
                                                const pts = line.stations.map(id => stations.find(s => s.id === id)).filter(Boolean).map(s => `${s.coordinates.x},${s.coordinates.y}`).join(' ');
                                                return (
                                                    <g key={line.id}>
                                                        <polyline points={pts} fill="none" stroke={line.color} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" opacity={0.1} />
                                                        <polyline points={pts} fill="none" stroke={line.color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" opacity={0.45} />
                                                    </g>
                                                );
                                            })}

                                            {/* the line being created shown in dashed style */}
                                            {previewStations.length >= 2 && (
                                                <g style={{ filter: 'url(#al-glow)' }}>
                                                    <polyline points={previewPoints} fill="none" stroke={color} strokeWidth={16} strokeLinejoin="round" strokeLinecap="round" opacity={0.15} style={{ filter: 'blur(6px)' }} />
                                                    <polyline points={previewPoints} fill="none" stroke={color} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" opacity={0.95} />
                                                    <polyline points={previewPoints} fill="none" stroke="white" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" strokeDasharray="8 10" opacity={0.4}>
                                                        <animate attributeName="stroke-dashoffset" from="0" to="36" dur="1.5s" repeatCount="indefinite" />
                                                    </polyline>
                                                </g>
                                            )}

                                            {/* station dots - click them in select mode to add to line */}
                                            {stations.map(st => {
                                                const isSelected = selectedStations.includes(st.id);
                                                const orderNum = isSelected ? selectedStations.indexOf(st.id) + 1 : null;
                                                const isHovered = hoveredStation === st.id;
                                                const r = isSelected ? 9 : (isHovered ? 7 : 5);

                                                return (
                                                    <g
                                                        key={st.id}
                                                        className={selectMode ? 'cursor-pointer' : ''}
                                                        onClick={selectMode ? (e) => { e.stopPropagation(); toggleStation(st.id); } : undefined}
                                                        onMouseEnter={() => setHoveredStation(st.id)}
                                                        onMouseLeave={() => setHoveredStation(null)}
                                                    >
                                                        {/* ring that appears when you hover */}
                                                        {isHovered && !isSelected && selectMode && (
                                                            <circle cx={st.coordinates.x} cy={st.coordinates.y} r={14} fill="none" stroke={color} strokeWidth={1} opacity={0.4} strokeDasharray="3 2">
                                                                <animate attributeName="r" values="10;16;10" dur="1.5s" repeatCount="indefinite" />
                                                            </circle>
                                                        )}

                                                        {/* glowing ring on selected stations */}
                                                        {isSelected && (
                                                            <circle cx={st.coordinates.x} cy={st.coordinates.y} r={16} fill="none" stroke={color} strokeWidth={1.5} opacity={0.3}>
                                                                <animate attributeName="r" values="11;18;11" dur="2s" repeatCount="indefinite" />
                                                                <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                                                            </circle>
                                                        )}

                                                        {/* the station dot itself */}
                                                        <circle
                                                            cx={st.coordinates.x} cy={st.coordinates.y} r={r}
                                                            fill={isSelected ? color : (isHovered && selectMode ? 'var(--text-primary)' : 'var(--station-fill)')}
                                                            stroke={isSelected ? 'white' : (isHovered && selectMode ? color : 'var(--text-muted)')}
                                                            strokeWidth={isSelected ? 2.5 : 1.5}
                                                            opacity={isSelected || (isHovered && selectMode) ? 1 : 0.6}
                                                            style={{ transition: 'all 0.2s ease' }}
                                                        />

                                                        {/* shows the order number of this station */}
                                                        {isSelected && (
                                                            <text x={st.coordinates.x} y={st.coordinates.y + 3.5} textAnchor="middle" style={{ fontSize: '8px', fill: 'white', fontWeight: 800, fontFamily: 'Inter', pointerEvents: 'none' }}>{orderNum}</text>
                                                        )}

                                                        {/* station name label */}
                                                        <text
                                                            x={st.coordinates.x} y={st.coordinates.y - (isSelected ? 16 : 10)}
                                                            textAnchor="middle"
                                                            style={{
                                                                fontSize: isSelected ? '10px' : (isHovered ? '9px' : '8px'),
                                                                fill: isSelected ? color : (isHovered ? 'var(--text-primary)' : 'var(--text-muted)'),
                                                                fontWeight: isSelected || isHovered ? 700 : 600,
                                                                fontFamily: 'Inter',
                                                                opacity: isSelected || isHovered ? 1 : 0.55,
                                                                pointerEvents: 'none'
                                                            }}
                                                        >
                                                            {st.name}
                                                        </text>
                                                    </g>
                                                );
                                            })}
                                        </svg>
                                    </TransformComponent>
                                </>
                            )}
                        </TransformWrapper>
                    </div>
                </div>

                {/* shows which lines already exist in the network */}
                <div className="mt-3 sm:mt-4 glass-card p-3 sm:p-4">
                    <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Existing Lines</h4>
                    <div className="space-y-2">
                        {lines.map(line => (
                            <div key={line.id} className="flex items-center gap-2 text-xs">
                                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: line.color }} />
                                <span className="font-medium flex-1" style={{ color: 'var(--text-secondary)' }}>{line.name}</span>
                                <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{line.stations.length} stops</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
