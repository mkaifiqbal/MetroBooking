import React, { useState, useMemo } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, TrainTrack, Plus, X, Palette } from 'lucide-react';
import { cn } from '../molecules/StationSearch';




const StationRow = ({ id, station, isInterchange, onRemove, lineId }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, borderColor: 'var(--border-subtle)', background: 'var(--bg-input)' }} className="flex items-center gap-2 p-2.5 mb-1.5 rounded-lg border group hover:border-indigo-500/30 transition-all">
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing" style={{ color: 'var(--text-muted)' }}><GripVertical className="w-4 h-4" /></button>
      <div className="flex-1 flex justify-between items-center min-w-0">
        <span className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{station?.name || 'Unknown'}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {isInterchange && <span className="text-[9px] font-bold bg-purple-500/15 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20">⇆</span>}
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>{id}</span>
          <button onClick={() => onRemove(lineId, id)} className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:text-red-400 hover:bg-red-500/10 transition-all" style={{ color: 'var(--text-muted)' }} aria-label="Remove"><X className="w-3 h-3" /></button>
        </div>
      </div>
    </div>
  );
};
const AddFacilityIcon = () => <Plus className="w-3.5 h-3.5" />;

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
        <AddFacilityIcon /> Add
      </button>
    </div>
  );
};

const AddStationForm = () => {
  const { addStation, addStationToLine, lines } = useAdminStore();
  const [name, setName] = useState('');
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [selectedLineIds, setSelectedLineIds] = useState([]);

  const toggleFacility = (f) => setFacilities(prev => prev.includes(f) ? prev.filter(v => v !== f) : [...prev, f]);
  const toggleLine = (lineId) => setSelectedLineIds(prev => prev.includes(lineId) ? prev.filter(l => l !== lineId) : [...prev, lineId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !x || !y) return;
    // make a unique id for the new station
    const newId = `s${Date.now()}`;
    // add the station to the store first
    addStation(name, x, y, facilities);
    // since addStation uses Date.now() we use the same id here
    // now add this station to all the lines the user picked
    setTimeout(() => {
      const storeState = useAdminStore.getState();
      const newStation = storeState.stations[storeState.stations.length - 1];
      if (newStation) {
        selectedLineIds.forEach(lineId => {
          addStationToLine(lineId, newStation.id);
        });
      }
    }, 10);
    setName(''); setX(''); setY(''); setFacilities([]); setSelectedLineIds([]);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-5 animate-fade-in-up">
      <h3 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Plus className="w-4 h-4 text-indigo-400" />Add New Station</h3>
      <div className="space-y-3">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Station name" className="metro-input !pl-4" required />
        <div className="grid grid-cols-2 gap-3">
          <input value={x} onChange={e => setX(e.target.value)} placeholder="X coordinate" type="number" className="metro-input !pl-4" required />
          <input value={y} onChange={e => setY(e.target.value)} placeholder="Y coordinate" type="number" className="metro-input !pl-4" required />
        </div>

        {/* pick which metro lines this station belongs to */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Add to Line(s)</p>
          <div className="flex flex-wrap gap-2">
            {lines.map(line => (
              <button
                key={line.id}
                type="button"
                onClick={() => toggleLine(line.id)}
                className={cn("text-xs px-3 py-1.5 rounded-lg font-semibold transition-all border flex items-center gap-1.5", selectedLineIds.includes(line.id) ? "border-opacity-50" : "border-slate-700/50 hover:border-slate-600")}
                style={selectedLineIds.includes(line.id) ? { background: `${line.color}20`, color: line.color, borderColor: `${line.color}40` } : { color: 'var(--text-muted)', background: 'var(--bg-input)' }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: line.color }} />
                {line.name}
              </button>
            ))}
          </div>
        </div>

        {/* checkboxes for things like parking, wifi, etc */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Facilities</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {['accessibility', 'parking', 'exits', 'wifi', 'restroom', 'elevator'].map(f => (
              <button key={f} type="button" onClick={() => toggleFacility(f)} className={cn("text-xs px-3 py-1.5 rounded-lg font-semibold transition-all border", facilities.includes(f) ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" : "")} style={!facilities.includes(f) ? { color: 'var(--text-muted)', background: 'var(--bg-input)', borderColor: 'var(--border-subtle)' } : {}}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <CustomFacilityInput onAdd={(f) => { if (f && !facilities.includes(f)) setFacilities(prev => [...prev, f]); }} />
          {facilities.filter(f => !['accessibility', 'parking', 'exits', 'wifi', 'restroom', 'elevator'].includes(f)).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {facilities.filter(f => !['accessibility', 'parking', 'exits', 'wifi', 'restroom', 'elevator'].includes(f)).map(f => (
                <span key={f} className="text-[10px] font-semibold px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  {f}
                  <button type="button" onClick={() => setFacilities(prev => prev.filter(v => v !== f))} className="hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>
        <button type="submit" className="btn-primary !py-2.5 text-sm">Add Station</button>
      </div>
    </form>
  );
};

const AddLineForm = () => {
  const { addLine, stations } = useAdminStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [selectedStations, setSelectedStations] = useState([]);

  const toggleStation = (id) => setSelectedStations(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || selectedStations.length < 2) return;
    addLine(name, color, selectedStations);
    setName(''); setColor('#6366f1'); setSelectedStations([]);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <h3 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Palette className="w-4 h-4 text-cyan-400" />Add New Line</h3>
      <div className="space-y-3">
        <div className="flex gap-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Line name" className="metro-input !pl-4 flex-1" required />
          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border-2 bg-transparent" style={{ borderColor: 'var(--border-glass)' }} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Select Stations (min 2)</p>
          <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
            {stations.map(s => (
              <button key={s.id} type="button" onClick={() => toggleStation(s.id)} className={cn("w-full text-left text-sm px-3 py-2 rounded-lg transition-all border", selectedStations.includes(s.id) ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/25" : "border-transparent")} style={!selectedStations.includes(s.id) ? { color: 'var(--text-secondary)' } : {}}>
                {selectedStations.includes(s.id) && <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 mr-2" />}
                {s.name}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" disabled={selectedStations.length < 2} className="btn-primary !py-2.5 text-sm">Create Line</button>
      </div>
    </form>
  );
};

export const AdminLineManager = () => {
  const { lines, stations, reorderStation, removeStationFromLine } = useAdminStore();
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const interchanges = useMemo(() => {
    const counts = {};
    lines.forEach(l => l.stations.forEach(st => { counts[st] = (counts[st] || 0) + 1; }));
    return Object.keys(counts).filter(st => counts[st] > 1);
  }, [lines]);

  const handleDragEnd = (event, lineId) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const line = lines.find(l => l.id === lineId);
    reorderStation(lineId, line.stations.indexOf(active.id), line.stations.indexOf(over.id));
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center border border-indigo-500/20">
          <TrainTrack className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Network Management</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Manage stations, lines, and routes</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-8">
        <AddStationForm />
        <AddLineForm />
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {lines.map(line => (
          <div key={line.id} className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: line.color }} />
              <h3 className="text-sm font-bold flex-1" style={{ color: 'var(--text-primary)' }}>{line.name}</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>{line.stations.length} stops</span>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={e => handleDragEnd(e, line.id)}>
              <SortableContext items={line.stations} strategy={verticalListSortingStrategy}>
                <div className="min-h-[100px] max-h-[250px] overflow-y-auto pr-1">
                  {line.stations.map(stId => (
                    <StationRow key={stId} id={stId} station={stations.find(s => s.id === stId)} isInterchange={interchanges.includes(stId)} onRemove={removeStationFromLine} lineId={line.id} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        ))}
      </div>
    </div>
  );
};