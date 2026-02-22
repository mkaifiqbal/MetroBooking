import React from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import { Clock, MapPin, ArrowRight, Repeat, TrainFront, Banknote } from 'lucide-react';
import { cn } from '../molecules/StationSearch';

export const RouteResultDisplay = () => {
  const currentRoute = useBookingStore((state) => state.currentRoute);
  const confirmBooking = useBookingStore((state) => state.confirmBooking);
  const stations = useBookingStore((state) => state.stations);

  if (!currentRoute) return null;

  const getStationName = (id) => stations.find(s => s.id === id)?.name || 'Unknown';

  if (currentRoute.segments.length === 0) {
    return (
      <div className="glass-card p-6 text-center animate-fade-in-up">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
          <MapPin className="w-7 h-7 text-amber-400" />
        </div>
        <p className="text-amber-300 font-semibold">No route found</p>
        <p style={{ color: 'var(--text-muted)' }} className="text-sm mt-1">These stations are not connected in the current network.</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 animate-fade-in-up">

      {/* shows total time, stops, transfers and fare at the top */}
      <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex flex-col">
          <span className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{currentRoute.totalDuration} <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>min</span></span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Estimated Travel</span>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{currentRoute.totalStops}</span> stops
          </div>
          <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Repeat className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{currentRoute.transfers}</span> transfers
          </div>
          <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Banknote className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-emerald-300">₹{currentRoute.fare}</span>
          </div>
        </div>
      </div>

      {/* shows each line segment as a nice timeline */}
      <div className="relative pl-6">
        {currentRoute.segments.map((segment, index) => {
          const isLastSegment = index === currentRoute.segments.length - 1;
          const startStation = segment.stations[0];
          const endStation = segment.stations[segment.stations.length - 1];

          return (
            <div key={`${segment.lineId}-${index}`} className="relative mb-6 last:mb-0">

              {/* the vertical colored bar connecting stations */}
              <div
                className="absolute -left-[12px] top-3 w-[3px] rounded-full"
                style={{
                  backgroundColor: segment.color,
                  height: isLastSegment ? 'calc(100% + 4px)' : 'calc(100% + 28px)',
                  opacity: 0.7
                }}
              />

              {/* first station in this segment */}
              <div className="relative">
                <div
                  className={cn(
                    "absolute -left-[17px] top-[6px] w-[13px] h-[13px] rounded-full border-2",
                    index > 0 ? "border-white ring-2 ring-offset-1" : ""
                  )}
                  style={{
                    backgroundColor: index > 0 ? 'white' : segment.color,
                    ...(index > 0 ? { ringColor: segment.color } : {})
                  }}
                />

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{getStationName(startStation)}</h3>
                    {index === 0 ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <TrainFront className="w-3 h-3" style={{ color: segment.color }} />
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Board <span className="font-semibold" style={{ color: segment.color }}>{segment.lineName}</span></p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Repeat className="w-3 h-3 text-amber-400" />
                        <p className="text-xs font-semibold text-amber-300">
                          Transfer to <span style={{ color: segment.color }}>{segment.lineName}</span>
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-md" style={{ color: 'var(--text-muted)', background: 'var(--bg-input)' }}>
                    <Clock className="w-3 h-3" />
                    {segment.duration}m
                  </div>
                </div>
              </div>

              {/* stations in between (we collapse them for cleaner look) */}
              {segment.stations.length > 2 && (
                <div className="my-3 ml-2 pl-4 border-l border-dashed text-xs" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                  {segment.stations.length - 2} intermediate stop{segment.stations.length - 2 > 1 ? 's' : ''}
                </div>
              )}

              {/* last station - only shown on the final segment */}
              {isLastSegment && (
                <div className="relative mt-5">
                  <div
                    className="absolute -left-[17px] top-[6px] w-[13px] h-[13px] rounded-full border-2"
                    style={{ backgroundColor: segment.color }}
                  />
                  <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{getStationName(endStation)}</h3>
                  <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                    <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse" />
                    Destination
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={confirmBooking}
        className="btn-success mt-6 flex items-center justify-center gap-2"
      >
        <ArrowRight className="w-4 h-4" />
        Confirm & Generate Ticket
      </button>
    </div>
  );
};