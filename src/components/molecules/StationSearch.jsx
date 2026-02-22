import React, { useState, useRef, useEffect } from 'react';
import { useBookingStore } from '../../store/useBookingStore';
import { useAdminStore } from '../../store/useAdminStore';
import { MapPin, ArrowUpDown, Search, Clock, Loader2 } from 'lucide-react';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// helper function to combine css class names without conflicts
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const AutocompleteInput = ({ label, value, onChange, placeholder, id, icon: Icon = MapPin }) => {
  const stations = useAdminStore((state) => state.stations);
  const lines = useAdminStore((state) => state.lines);
  const [query, setQuery] = useState(value?.name || '');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);

  const filteredStations = query === ''
    ? stations
    : stations.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setQuery(value?.name || '');
  }, [value]);

  const handleKeyDown = (e) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredStations.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filteredStations.length) % filteredStations.length);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredStations[activeIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (station) => {
    setQuery(station.name);
    onChange(station);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const getStationLines = (stationId) => {
    return lines.filter(l => l.stations.includes(stationId));
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <label htmlFor={id} className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
        <input
          id={id}
          type="text"
          className="metro-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
            if (e.target.value === '') onChange(null);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={`${id}-listbox`}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
        />
      </div>

      {isOpen && filteredStations.length > 0 && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-20 w-full mt-2 rounded-xl overflow-hidden shadow-2xl border max-h-60 overflow-y-auto"
          style={{ background: 'var(--dropdown-bg)', backdropFilter: 'blur(16px)', borderColor: 'var(--border-glass)' }}
        >
          {filteredStations.map((station, index) => {
            const stationLines = getStationLines(station.id);
            const isInterchange = stationLines.length > 1;

            return (
              <li
                key={station.id}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={activeIndex === index}
                className={cn(
                  "cursor-pointer py-3 px-4 flex items-center justify-between transition-all duration-150 last:border-0",
                  activeIndex === index ? "bg-indigo-500/15" : ""
                )}
                onClick={() => handleSelect(station)}
              >
                <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{station.name}</span>
                <div className="flex items-center gap-1.5">
                  {stationLines.map(line => (
                    <span
                      key={line.id}
                      className="w-2.5 h-2.5 rounded-full ring-1 ring-white/20"
                      style={{ backgroundColor: line.color }}
                      title={line.name}
                    />
                  ))}
                  {isInterchange && (
                    <span className="ml-1 text-[10px] font-bold bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-md border border-purple-500/20">
                      ⇆
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export const JourneyPlanner = () => {
  const { sourceStation, destinationStation, setSource, setDestination, swapStations, searchRoutes, recentSearches, loadRecentSearch, isSearching } = useBookingStore();
  const [swapAnim, setSwapAnim] = useState(false);

  const handleSwap = () => {
    setSwapAnim(true);
    swapStations();
    setTimeout(() => setSwapAnim(false), 300);
  };

  return (
    <div className="glass-card p-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
          <Search className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Plan Your Journey</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Search and book metro tickets</p>
        </div>
      </div>

      <div className="space-y-4 relative">
        <AutocompleteInput
          id="source-search"
          label="From"
          placeholder="Select starting station"
          value={sourceStation}
          onChange={setSource}
        />

        {/* button to swap the from and to stations */}
        <div className="flex justify-center -my-1 relative z-10">
          <button
            onClick={handleSwap}
            className="w-10 h-10 rounded-full border hover:border-indigo-500/50 flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10"
            aria-label="Swap source and destination"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-glass)', transform: swapAnim ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
          >
            <ArrowUpDown className="h-4 w-4 text-indigo-400" />
          </button>
        </div>

        <AutocompleteInput
          id="dest-search"
          label="To"
          placeholder="Select destination station"
          value={destinationStation}
          onChange={setDestination}
        />
      </div>

      <button
        onClick={searchRoutes}
        className="btn-primary mt-6 flex items-center justify-center gap-2"
        disabled={!sourceStation || !destinationStation || sourceStation.id === destinationStation?.id || isSearching}
      >
        {isSearching ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="w-4 h-4" />
            Find Routes
          </>
        )}
      </button>

      {/* shows the last few journeys the user searched for */}
      {recentSearches.length > 0 && (
        <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Recent Journeys</p>
          <div className="space-y-2">
            {recentSearches.slice(0, 3).map((search, i) => (
              <button
                key={i}
                onClick={() => loadRecentSearch(search)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:opacity-80 transition-all duration-150 text-left group border"
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-subtle)' }}
              >
                <Clock className="w-3.5 h-3.5 group-hover:text-indigo-400 transition-colors shrink-0" style={{ color: 'var(--text-muted)' }} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm truncate block" style={{ color: 'var(--text-primary)' }}>
                    {search.source.name} <span style={{ color: 'var(--text-muted)' }}>→</span> {search.destination.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};