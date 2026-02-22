import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import { LayoutGrid, Pencil, Trash2, X, Check, ChevronDown, ChevronRight, MapPin, TrainTrack, Plus, Save, GripVertical, MoreVertical } from 'lucide-react';
import { cn } from '../molecules/StationSearch';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const PRESET_FACILITIES = ['accessibility', 'parking', 'exits', 'wifi', 'restroom', 'elevator'];

/* ── this panel lets you edit a stations details ──────────── */
const StationEditPanel = ({ station, onClose }) => {
    const [name, setName] = useState(station.name);
    const [cx, setCx] = useState(String(station.coordinates.x));
    const [cy, setCy] = useState(String(station.coordinates.y));
    const [facilities, setFacilities] = useState([...(station.facilities || [])]);
    const [customFacility, setCustomFacility] = useState('');

    const toggleFacility = (f) => setFacilities(prev => prev.includes(f) ? prev.filter(v => v !== f) : [...prev, f]);
    const addCustom = () => {
        const t = customFacility.trim().toLowerCase();
        if (t && !facilities.includes(t)) { setFacilities(prev => [...prev, t]); setCustomFacility(''); }
    };

    const handleSave = () => {
        if (!name.trim()) return;
        useAdminStore.setState(state => ({
            stations: state.stations.map(s =>
                s.id === station.id
                    ? { ...s, name: name.trim(), coordinates: { x: parseInt(cx, 10) || 0, y: parseInt(cy, 10) || 0 }, facilities }
                    : s
            )
        }));
        onClose();
    };

    return (
        <div className="rounded-xl p-3 sm:p-4 space-y-3 animate-fade-in-up" style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.15)' }}>
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <Pencil className="w-3.5 h-3.5 text-green-400" /> Edit Station
                </h4>
                <button onClick={onClose} className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-500/10 transition-all" style={{ color: 'var(--text-muted)' }}><X className="w-4 h-4" /></button>
            </div>

            <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className="metro-input !pl-3 !py-2 text-sm" autoFocus />
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>X</label>
                    <input value={cx} onChange={e => setCx(e.target.value)} type="number" min="0" max="1000" className="metro-input !pl-3 !py-2 text-sm" />
                </div>
                <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Y</label>
                    <input value={cy} onChange={e => setCy(e.target.value)} type="number" min="0" max="750" className="metro-input !pl-3 !py-2 text-sm" />
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Facilities</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {PRESET_FACILITIES.map(f => (
                        <button key={f} type="button" onClick={() => toggleFacility(f)}
                            className={cn("text-[10px] px-2 py-1 rounded font-semibold transition-all border", facilities.includes(f) ? "bg-green-500/20 text-green-300 border-green-500/30" : "")}
                            style={!facilities.includes(f) ? { color: 'var(--text-muted)', background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' } : {}}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
                {facilities.filter(f => !PRESET_FACILITIES.includes(f)).length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {facilities.filter(f => !PRESET_FACILITIES.includes(f)).map(f => (
                            <span key={f} className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                {f}
                                <button onClick={() => setFacilities(prev => prev.filter(v => v !== f))} className="hover:text-red-400"><X className="w-2.5 h-2.5" /></button>
                            </span>
                        ))}
                    </div>
                )}
                <div className="flex gap-1.5">
                    <input value={customFacility} onChange={e => setCustomFacility(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }} placeholder="Custom..." className="metro-input !pl-3 !py-1.5 text-[11px] flex-1" />
                    <button onClick={addCustom} disabled={!customFacility.trim()} className="px-2 py-1.5 rounded text-[10px] font-semibold border flex items-center gap-1 transition-all" style={{ background: 'var(--bg-card)', color: 'var(--text-accent)', borderColor: 'var(--border-glass)' }}>
                        <Plus className="w-3 h-3" /> Add
                    </button>
                </div>
            </div>

            <div className="flex gap-2 pt-1">
                <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold bg-green-500 text-white hover:bg-green-600 transition-all shadow-lg shadow-green-500/20">
                    <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
                <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-semibold border transition-all" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-subtle)' }}>Cancel</button>
            </div>
        </div>
    );
};

/* ── a single station row that you can drag to reorder ─────── */
const SortableStationRow = ({ station, index, lineColor, isInterchange, isEditing, onEdit, onRemove, totalStations }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: station.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    // close the mobile menu when user taps somewhere else
    useEffect(() => {
        if (!mobileMenuOpen) return;
        const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMobileMenuOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [mobileMenuOpen]);

    if (isEditing) {
        return <StationEditPanel station={station} onClose={() => onEdit(null)} />;
    }

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl border group transition-all",
                isDragging
                    ? "shadow-2xl scale-[1.02] z-50 border-green-500/30"
                    : "hover:border-green-500/20"
            )}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                zIndex: isDragging ? 50 : 'auto',
                borderColor: isDragging ? undefined : 'var(--border-subtle)',
                background: 'var(--bg-card)',
            }}
            {...attributes}
        >
            {/* the 6 dots you grab to drag */}
            <button
                ref={setActivatorNodeRef}
                {...listeners}
                className={cn(
                    "shrink-0 cursor-grab active:cursor-grabbing touch-none p-0.5 rounded-md transition-all",
                    isDragging ? "bg-green-500/15" : "hover:bg-green-500/10"
                )}
                style={{ color: 'var(--text-muted)' }}
                aria-label="Drag to reorder"
            >
                <GripVertical className={cn("w-4 h-4 transition-opacity", isDragging ? "opacity-80" : "opacity-30 group-hover:opacity-70")} />
            </button>

            {/* station number in the line */}
            <span
                className="w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center text-white shrink-0 shadow-sm"
                style={{ background: lineColor, boxShadow: `0 2px 8px ${lineColor}40` }}
            >
                {index + 1}
            </span>

            {/* station name and info */}
            <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{station.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>
                        ({station.coordinates.x},{station.coordinates.y})
                    </span>
                    {isInterchange && (
                        <span className="text-[9px] font-bold text-purple-400">⇆ Interchange</span>
                    )}
                    {station.facilities && station.facilities.length > 0 && (
                        <span className="text-[9px] font-medium hidden sm:inline" style={{ color: 'var(--text-muted)' }}>
                            · {station.facilities.length} facilities
                        </span>
                    )}
                </div>
            </div>

            {/* buttons that appear on hover (desktop) */}
            <div className="hidden md:flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(station.id)} className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 hover:bg-green-500/10 text-green-400">
                    <Pencil className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => onRemove(station.id)} className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 hover:bg-red-500/10 text-red-400">
                    <Trash2 className="w-3 h-3" /> Remove
                </button>
            </div>

            {/* three dot menu for mobile */}
            <div className="md:hidden relative shrink-0" ref={menuRef}>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all" style={{ color: 'var(--text-muted)' }}>
                    <MoreVertical className="w-4 h-4" />
                </button>
                {mobileMenuOpen && (
                    <div className="absolute top-full right-0 mt-1 w-38 rounded-xl overflow-hidden shadow-2xl animate-fade-in-up z-50" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', boxShadow: '0 16px 32px rgba(0,0,0,0.25)' }}>
                        <button onClick={() => { onEdit(station.id); setMobileMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold transition-all text-left hover:bg-green-500/5" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                            <Pencil className="w-3 h-3 text-green-400" /> Edit Station
                        </button>
                        <button onClick={() => { onRemove(station.id); setMobileMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold transition-all text-left hover:bg-red-500/5 text-red-400">
                            <Trash2 className="w-3 h-3" /> Remove
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ── one metro line card with its stations ───────────────── */
const LineOverviewCard = ({ line, stations: allStations, interchanges, isExpanded, onToggle }) => {
    const { removeLine, removeStationFromLine, reorderStation } = useAdminStore();
    const [editingStation, setEditingStation] = useState(null);
    const [editingLine, setEditingLine] = useState(false);
    const [lineName, setLineName] = useState(line.name);
    const [lineColor, setLineColor] = useState(line.color);

    const lineStations = line.stations.map(id => allStations.find(s => s.id === id)).filter(Boolean);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
        useSensor(KeyboardSensor)
    );

    const saveLineEdit = () => {
        if (lineName.trim()) {
            useAdminStore.setState(state => ({
                lines: state.lines.map(l => l.id === line.id ? { ...l, name: lineName.trim(), color: lineColor } : l)
            }));
        }
        setEditingLine(false);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = line.stations.indexOf(active.id);
        const newIndex = line.stations.indexOf(over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
            reorderStation(line.id, oldIndex, newIndex);
        }
    };

    return (
        <div className="glass-card overflow-hidden transition-all" style={{ borderLeft: `3px solid ${line.color}` }}>
            {/* clickable header with line name and color */}
            <div className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 cursor-pointer select-none transition-all hover:bg-white/[0.02]" onClick={onToggle}>
                <div className="w-5 h-5 rounded-full shrink-0 shadow-md" style={{ backgroundColor: line.color, boxShadow: `0 0 12px ${line.color}40` }} />
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{line.name}</h3>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{lineStations.length} stations · {lineStations.filter(s => interchanges.includes(s.id)).length} interchanges</p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0" style={{ color: line.color, background: `${line.color}15`, border: `1px solid ${line.color}25` }}>{lineStations.length} stops</span>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center transition-transform" style={{ color: 'var(--text-muted)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>

            {/* this section opens up when you click the line */}
            {isExpanded && (
                <div className="pb-2 sm:pb-3">
                    {/* buttons to edit the line name, color, or delete it */}
                    <div className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 flex-wrap" style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                        {!editingLine ? (
                            <>
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: line.color }} />
                                <span className="text-xs font-bold flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{line.name}</span>
                                <button onClick={(e) => { e.stopPropagation(); setEditingLine(true); setLineName(line.name); setLineColor(line.color); }} className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 hover:bg-green-500/10 text-green-400 border border-green-500/15">
                                    <Pencil className="w-3 h-3" /> Edit Line
                                </button>
                                <button onClick={() => removeLine(line.id)} className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all border border-red-500/15 flex items-center gap-1.5">
                                    <Trash2 className="w-3 h-3" /> Delete
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 flex-wrap w-full animate-fade-in-up">
                                <input value={lineName} onChange={e => setLineName(e.target.value)} className="metro-input !pl-3 !py-1.5 text-sm flex-1 min-w-[120px]" autoFocus onKeyDown={e => { if (e.key === 'Enter') saveLineEdit(); if (e.key === 'Escape') setEditingLine(false); }} />
                                <input type="color" value={lineColor} onChange={e => setLineColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border bg-transparent shrink-0" style={{ borderColor: 'var(--border-glass)' }} />
                                <button onClick={saveLineEdit} className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-all shrink-0"><Check className="w-3.5 h-3.5" /></button>
                                <button onClick={() => setEditingLine(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/10 transition-all shrink-0" style={{ color: 'var(--text-muted)' }}><X className="w-3.5 h-3.5" /></button>
                            </div>
                        )}
                    </div>

                    {/* station list that you can reorder by dragging */}
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={line.stations} strategy={verticalListSortingStrategy}>
                            <div className="py-1">
                                {lineStations.length === 0 && (
                                    <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>No stations on this line yet.</p>
                                )}
                                {lineStations.map((st, idx) => (
                                    <SortableStationRow
                                        key={st.id}
                                        station={st}
                                        index={idx}
                                        lineColor={line.color}
                                        isInterchange={interchanges.includes(st.id)}
                                        isEditing={editingStation === st.id}
                                        onEdit={setEditingStation}
                                        onRemove={(stId) => removeStationFromLine(line.id, stId)}
                                        totalStations={lineStations.length}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            )}
        </div>
    );
};

/* ── the main overview page showing all lines and stations ── */
export const AdminOverview = () => {
    const { stations, lines } = useAdminStore();
    const [expandedLine, setExpandedLine] = useState(null);

    const interchanges = useMemo(() => {
        const counts = {};
        lines.forEach(l => l.stations.forEach(st => { counts[st] = (counts[st] || 0) + 1; }));
        return Object.keys(counts).filter(st => counts[st] > 1);
    }, [lines]);

    const orphanStations = useMemo(() => {
        const assigned = new Set();
        lines.forEach(l => l.stations.forEach(s => assigned.add(s)));
        return stations.filter(s => !assigned.has(s.id));
    }, [stations, lines]);

    return (
        <div className="animate-fade-in-up">
            {/* quick stats showing total stations and lines */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
                {[
                    { label: 'Stations', value: stations.length, icon: MapPin, color: '#16a34a' },
                    { label: 'Lines', value: lines.length, icon: TrainTrack, color: '#22d3ee' },
                    { label: 'Interchanges', value: interchanges.length, icon: LayoutGrid, color: '#a855f7' },
                    { label: 'Unassigned', value: orphanStations.length, icon: MapPin, color: orphanStations.length > 0 ? '#f59e0b' : '#34d399' },
                ].map(s => (
                    <div key={s.label} className="glass-card p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}>
                            <s.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: s.color }} />
                        </div>
                        <div>
                            <div className="text-lg sm:text-xl font-extrabold leading-none" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
                            <div className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* all the metro lines are listed here */}
            <div className="space-y-3 sm:space-y-4">
                <h3 className="text-xs sm:text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <TrainTrack className="w-4 h-4" /> All Lines & Stations
                </h3>

                {lines.map(line => (
                    <LineOverviewCard
                        key={line.id}
                        line={line}
                        stations={stations}
                        interchanges={interchanges}
                        isExpanded={expandedLine === line.id}
                        onToggle={() => setExpandedLine(expandedLine === line.id ? null : line.id)}
                    />
                ))}

                {lines.length === 0 && (
                    <div className="glass-card p-6 sm:p-8 text-center">
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No lines yet. Go to "Add Line" to create one.</p>
                    </div>
                )}

                {/* stations that are not part of any line yet */}
                {orphanStations.length > 0 && (
                    <div className="glass-card p-3 sm:p-4 mt-2 sm:mt-4" style={{ borderLeft: '3px solid #f59e0b' }}>
                        <h4 className="text-xs font-bold flex items-center gap-2 mb-2 sm:mb-3" style={{ color: '#f59e0b' }}>
                            <MapPin className="w-3.5 h-3.5" /> Unassigned Stations ({orphanStations.length})
                        </h4>
                        <div className="space-y-1">
                            {orphanStations.map(st => (
                                <div key={st.id} className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg text-xs group" style={{ color: 'var(--text-secondary)' }}>
                                    <span className="w-2 h-2 rounded-full bg-amber-400/60 shrink-0" />
                                    <span className="flex-1 font-medium truncate">{st.name}</span>
                                    <span className="font-mono text-[9px] hidden sm:inline" style={{ color: 'var(--text-muted)' }}>({st.coordinates.x},{st.coordinates.y})</span>
                                    <button onClick={() => useAdminStore.getState().removeStation(st.id)} className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center hover:bg-red-500/10 text-red-400 transition-all shrink-0"><Trash2 className="w-3 h-3" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
