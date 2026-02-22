import React, { useState, useMemo } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useAdminStore } from '../../store/useAdminStore';
import { useBookingStore } from '../../store/useBookingStore';
import { useThemeStore } from '../../store/useThemeStore';
import { Dot, Accessibility, CarFront, LogOut, X, ZoomIn, ZoomOut, Maximize2, MapPin, Layers, ChevronDown } from 'lucide-react';
import { cn } from '../molecules/StationSearch';

export const NetworkMap = () => {
  const stations = useAdminStore((s) => s.stations);
  const lines = useAdminStore((s) => s.lines);
  const { currentRoute, setSource, setDestination } = useBookingStore();
  const theme = useThemeStore((s) => s.theme);
  const [selectedStation, setSelectedStation] = useState(null);
  const [hoveredStation, setHoveredStation] = useState(null);
  const [legendOpen, setLegendOpen] = useState(false);

  // figure out which parts of the map should be highlighted when a route is selected
  const routeEdges = useMemo(() => {
    if (!currentRoute) return null;
    const edges = new Set();
    // go through each segment and save pairs of connected stations
    currentRoute.segments.forEach(seg => {
      const segStations = seg.stations;
      for (let i = 0; i < segStations.length - 1; i++) {
        // store both directions so we can look it up either way
        const a = segStations[i], b = segStations[i + 1];
        edges.add(`${a}|${b}`);
        edges.add(`${b}|${a}`);
      }
    });
    return edges;
  }, [currentRoute]);

  const isStationInRoute = (stationId) => {
    if (!currentRoute) return true;
    return currentRoute.segments.some(seg => seg.stations.includes(stationId));
  };

  const interchanges = useMemo(() => {
    const counts = {};
    lines.forEach(line => { line.stations.forEach(st => { counts[st] = (counts[st] || 0) + 1; }); });
    return Object.keys(counts).filter(st => counts[st] > 1);
  }, [lines]);

  const getStationLines = (stationId) => lines.filter(l => l.stations.includes(stationId));

  const getLabelAnchor = (station) => {
    const x = station.coordinates.x, y = station.coordinates.y;
    if (x < 400) return { anchor: 'start', dx: 18, dy: -12 };
    if (x > 600) return { anchor: 'end', dx: -18, dy: -12 };
    if (y < 300) return { anchor: 'middle', dx: 0, dy: -18 };
    return { anchor: 'middle', dx: 0, dy: 24 };
  };

  const isDark = theme === 'dark';
  const stationFillDefault = isDark ? '#1e293b' : '#ffffff';
  const stationFillHover = isDark ? '#f0f4ff' : '#334155';
  const labelFillDefault = isDark ? 'rgba(148,163,184,0.7)' : 'rgba(51,65,85,0.7)';
  const labelFillActive = isDark ? '#f0f4ff' : '#0f172a';

  return (
    <div className="relative w-full h-[280px] lg:h-[600px] rounded-2xl overflow-hidden glass-card metro-map-bg">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center border border-green-500/20">
          <MapPin className="w-4 h-4 text-green-400" />
        </div>
        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)', opacity: 0.8 }}>Network Map</span>
      </div>

      {/* clickable button that shows/hides the line legend */}
      <div className="absolute bottom-3 left-3 z-10">
        <button
          onClick={() => setLegendOpen(prev => !prev)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-glass)', color: 'var(--text-secondary)' }}
        >
          <div className="w-3.5 h-3.5 flex items-center justify-center">
            <Dot className="text-green-400 scale-250" />
          </div>

          Lines ({lines.length})

          <ChevronDown className={cn("w-3 h-3 transition-transform", legendOpen && "rotate-180")} />
        </button>
        {legendOpen && (
          <div className="mt-1.5 p-2 rounded-lg border max-h-48 overflow-y-auto flex flex-col gap-1" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-glass)', backdropFilter: 'blur(12px)' }}>
            {lines.map(line => {
              const hasRouteSegments = currentRoute && currentRoute.segments.some(seg => seg.lineId === line.id);
              return (
                <div key={line.id} className={cn("flex items-center gap-2 px-2 py-1 rounded-md text-[11px] font-semibold transition-all", currentRoute && !hasRouteSegments ? "opacity-30" : "opacity-100")} style={{ color: line.color }}>
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: line.color }} />
                  {line.name}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TransformWrapper initialScale={1} minScale={0.5} maxScale={4} centerOnInit>
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
              {[{ fn: zoomIn, icon: ZoomIn, label: 'Zoom in' }, { fn: zoomOut, icon: ZoomOut, label: 'Zoom out' }, { fn: resetTransform, icon: Maximize2, label: 'Reset' }].map(({ fn, icon: Ic, label }) => (
                <button key={label} onClick={() => fn()} className="w-8 h-8 flex items-center justify-center rounded-lg transition-all border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-glass)', color: 'var(--text-secondary)' }} aria-label={label}><Ic className="w-4 h-4" /></button>
              ))}
            </div>
            <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%', height: '100%' }}>
              <svg viewBox="0 0 1000 750" className="w-full h-full cursor-grab active:cursor-grabbing" style={{ minWidth: '100%', minHeight: '100%' }}>
                <defs>
                  <pattern id="grid-dots" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="0.8" fill="var(--map-grid-dot)" /></pattern>
                  <filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                  <filter id="glow-strong"><feGaussianBlur stdDeviation="6" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                <rect width="1000" height="750" fill="url(#grid-dots)" />

                {/* draw all the metro lines on the map */}
                {lines.map(line => {
                  const lineStations = line.stations.map(stId => stations.find(s => s.id === stId)).filter(Boolean);
                  const points = lineStations.map(st => `${st.coordinates.x},${st.coordinates.y}`).join(' ');

                  return (
                    <g key={line.id}>
                      {/* this is a glow effect behind the line to make it look nicer */}
                      <polyline
                        points={points}
                        fill="none"
                        stroke={line.color}
                        strokeWidth={6}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        className="transition-all duration-500"
                        style={{ opacity: currentRoute ? 0.04 : 0.1, filter: 'blur(4px)' }}
                      />
                      {/* the actual colored line that you see on the map */}
                      <polyline
                        points={points}
                        fill="none"
                        stroke={line.color}
                        strokeWidth={3.5}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        className="transition-all duration-500"
                        style={{ opacity: currentRoute ? 0.12 : 0.7 }}
                      />
                    </g>
                  );
                })}

                {/* draw the highlighted route on top of everything */}
                {currentRoute && currentRoute.segments.map((seg, segIndex) => {
                  const segStations = seg.stations.map(stId => stations.find(s => s.id === stId)).filter(Boolean);
                  const segLine = lines.find(l => l.id === seg.lineId);
                  const segColor = segLine?.color || '#16a34a';

                  // Draw highlighted path for this segment
                  const points = segStations.map(st => `${st.coordinates.x},${st.coordinates.y}`).join(' ');

                  return (
                    <g key={`route-seg-${segIndex}`}>
                      {/* glowing effect around the highlighted path */}
                      <polyline
                        points={points}
                        fill="none"
                        stroke={segColor}
                        strokeWidth={20}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        style={{ opacity: 0.4, filter: 'blur(8px)' }}
                      />
                      {/* the bright colored path the user selected */}
                      <polyline
                        points={points}
                        fill="none"
                        stroke={segColor}
                        strokeWidth={7}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        style={{ opacity: 1, filter: 'url(#glow-strong)' }}
                      />
                      {/* moving dashes animation along the route */}
                      <polyline
                        points={points}
                        fill="none"
                        stroke="white"
                        strokeWidth={3}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        strokeDasharray="10 14"
                        style={{ opacity: 0.55, filter: 'url(#glow)' }}
                      >
                        <animate attributeName="stroke-dashoffset" from="0" to="40" dur="1.5s" repeatCount="indefinite" />
                      </polyline>
                    </g>
                  );
                })}

                {/* draw the station circles on the map */}
                {stations.map(station => {
                  const isInterchange = interchanges.includes(station.id);
                  const inRoute = isStationInRoute(station.id);
                  const isSelected = selectedStation?.id === station.id;
                  const isHovered = hoveredStation === station.id;
                  const stLines = getStationLines(station.id);
                  const label = getLabelAnchor(station);
                  return (
                    <g key={station.id} transform={`translate(${station.coordinates.x},${station.coordinates.y})`} onClick={() => setSelectedStation(station)} onMouseEnter={() => setHoveredStation(station.id)} onMouseLeave={() => setHoveredStation(null)} className={cn("cursor-pointer transition-all duration-300", !inRoute && "opacity-20")}>
                      {/* pulsing ring around interchange stations that are in the current route */}
                      {currentRoute && inRoute && isInterchange && (
                        <circle r={16} fill="none" stroke={stLines[0]?.color || '#888'} strokeWidth={1.5} opacity={0.4}>
                          <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                        </circle>
                      )}
                      {/* extra ring around stations where multiple lines meet */}
                      {isInterchange && stLines.map((line, i) => (
                        <circle key={line.id} r={10 + i * 3} fill="none" stroke={line.color} strokeWidth={2} opacity={isHovered || isSelected ? 0.8 : 0.4} className="transition-opacity duration-200" />
                      ))}
                      {/* the station circle itself */}
                      <circle r={isInterchange ? 6 : 5} fill={isSelected ? '#818cf8' : (isHovered ? stationFillHover : stationFillDefault)} stroke={isSelected ? '#818cf8' : (stLines[0]?.color || '#475569')} strokeWidth={2.5} className="transition-all duration-200" />
                      {/* station name text */}
                      <text x={label.dx} y={label.dy} textAnchor={label.anchor} className="pointer-events-none" style={{ fontSize: isHovered || isSelected ? '12px' : '9px', fontWeight: isHovered || isSelected ? 700 : 600, fill: isHovered || isSelected ? labelFillActive : labelFillDefault, fontFamily: 'Inter, sans-serif' }}>{station.name}</text>
                    </g>
                  );
                })}
              </svg>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>

      {/* popup that appears when you click on a station */}
      {
        selectedStation && (
          <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 p-5 rounded-2xl animate-fade-in-up" style={{ background: 'var(--bg-card)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-glass)', boxShadow: 'var(--shadow-card)' }}>
            <button onClick={() => setSelectedStation(null)} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg transition-all" style={{ color: 'var(--text-muted)' }} aria-label="Close"><X className="w-4 h-4" /></button>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{selectedStation.name}</h3>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {interchanges.includes(selectedStation.id) && (<span className="text-[10px] font-bold bg-purple-500/15 text-purple-400 px-2 py-1 rounded-md border border-purple-500/20">Interchange</span>)}
              {getStationLines(selectedStation.id).map(l => (<span key={l.id} className="text-[10px] font-bold px-2 py-1 rounded-md" style={{ backgroundColor: `${l.color}30`, border: `1px solid ${l.color}40`, color: l.color }}>{l.name}</span>))}
            </div>
            {selectedStation.facilities?.length > 0 && (
              <div className="flex gap-3 mb-5" style={{ color: 'var(--text-muted)' }}>
                {selectedStation.facilities.includes('accessibility') && <div className="flex items-center gap-1 text-xs"><Accessibility className="w-4 h-4" /><span>Accessible</span></div>}
                {selectedStation.facilities.includes('parking') && <div className="flex items-center gap-1 text-xs"><CarFront className="w-4 h-4" /><span>Parking</span></div>}
                {selectedStation.facilities.includes('exits') && <div className="flex items-center gap-1 text-xs"><LogOut className="w-4 h-4" /><span>Multi-exit</span></div>}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => { setSource(selectedStation); setSelectedStation(null); }} className="flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all border" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)', borderColor: 'var(--border-glass)' }}>Book From Here</button>
              <button onClick={() => { setDestination(selectedStation); setSelectedStation(null); }} className="flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold bg-green-500 text-white hover:shadow-lg hover:shadow-green-500/25 transition-all">Book To Here</button>
            </div>
          </div>
        )
      }
    </div >
  );
};