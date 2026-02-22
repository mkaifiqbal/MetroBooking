import { create } from 'zustand';
import { useAdminStore } from './useAdminStore';

// this function finds the shortest path between two stations using BFS
function findRoute(stations, lines, sourceId, destId) {
  if (sourceId === destId) return null;

  // first we build a map of which stations connect to which other stations
  const adj = {};
  stations.forEach(s => { adj[s.id] = []; });

  lines.forEach(line => {
    for (let i = 0; i < line.stations.length - 1; i++) {
      const a = line.stations[i];
      const b = line.stations[i + 1];
      if (adj[a]) adj[a].push({ neighbor: b, lineId: line.id });
      if (adj[b]) adj[b].push({ neighbor: a, lineId: line.id });
    }
  });

  // now we search level by level (BFS) to find shortest route with fewest transfers
  const queue = [{ stationId: sourceId, path: [{ stationId: sourceId, lineId: null }] }];
  const visited = new Set([sourceId]);

  while (queue.length > 0) {
    const { stationId, path } = queue.shift();

    if (stationId === destId) {
      return buildRouteResult(path, stations, lines);
    }

    const neighbors = adj[stationId] || [];
    for (const { neighbor, lineId } of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({
          stationId: neighbor,
          path: [...path, { stationId: neighbor, lineId }]
        });
      }
    }
  }

  // if we get here, there is no way to go from source to destination
  return { segments: [], totalStops: 0, totalDuration: 0, transfers: 0, fare: 0 };
}

function buildRouteResult(path, stations, lines) {
  if (path.length < 2) return { segments: [], totalStops: 0, totalDuration: 0, transfers: 0, fare: 0 };

  const segments = [];
  let currentSegment = null;

  for (let i = 1; i < path.length; i++) {
    const { stationId, lineId } = path[i];
    const prevStationId = path[i - 1].stationId;

    if (!currentSegment || currentSegment.lineId !== lineId) {
      // we changed lines so we start a new segment
      if (currentSegment) {
        segments.push(currentSegment);
      }
      const line = lines.find(l => l.id === lineId);
      currentSegment = {
        lineId: lineId,
        lineName: line?.name || 'Unknown',
        color: line?.color || '#888',
        stations: [prevStationId, stationId],
        duration: 3 // 3 min per stop
      };
    } else {
      currentSegment.stations.push(stationId);
      currentSegment.duration += 3;
    }
  }

  if (currentSegment) segments.push(currentSegment);

  const totalStops = path.length - 1;
  const transfers = segments.length - 1;
  const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0) + transfers * 2; // +2min per transfer
  const fare = 10 + totalStops * 5; // Base fare + per stop

  return { segments, totalStops, totalDuration, transfers, fare };
}

// loads the users recent searches from browser storage
function loadRecentSearches() {
  try {
    const saved = localStorage.getItem('metro_recent_searches');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(searches) {
  try {
    localStorage.setItem('metro_recent_searches', JSON.stringify(searches.slice(0, 5)));
  } catch { /* ignore */ }
}

export const useBookingStore = create((set, get) => ({
  // we get stations and lines from the admin store so everything stays in sync
  get stations() { return useAdminStore.getState().stations; },
  get lines() { return useAdminStore.getState().lines; },

  sourceStation: null,
  destinationStation: null,
  currentRoute: null,
  bookingConfirmed: false,
  ticketData: null,
  recentSearches: loadRecentSearches(),
  isSearching: false,

  setSource: (station) => set({ sourceStation: station, currentRoute: null, bookingConfirmed: false, ticketData: null }),
  setDestination: (station) => set({ destinationStation: station, currentRoute: null, bookingConfirmed: false, ticketData: null }),

  swapStations: () => set((state) => ({
    sourceStation: state.destinationStation,
    destinationStation: state.sourceStation,
    currentRoute: null,
    bookingConfirmed: false,
    ticketData: null
  })),

  searchRoutes: () => {
    const { sourceStation, destinationStation, recentSearches } = get();
    // grab the latest stations and lines from admin store
    const { stations, lines } = useAdminStore.getState();
    if (!sourceStation || !destinationStation) return;

    set({ isSearching: true });

    // tiny delay so the user sees the loading animation
    setTimeout(() => {
      const route = findRoute(stations, lines, sourceStation.id, destinationStation.id);

      // save this search so the user can quickly redo it later
      const newSearch = {
        source: sourceStation,
        destination: destinationStation,
        timestamp: Date.now()
      };
      const updatedRecent = [newSearch, ...recentSearches.filter(
        s => !(s.source.id === sourceStation.id && s.destination.id === destinationStation.id)
      )].slice(0, 5);
      saveRecentSearches(updatedRecent);

      set({
        currentRoute: route,
        recentSearches: updatedRecent,
        isSearching: false
      });
    }, 600);
  },

  confirmBooking: () => {
    const { sourceStation, destinationStation, currentRoute } = get();
    if (!currentRoute) return;

    set({ bookingConfirmed: true });

    // pretend we are calling a booking API (takes about 2.5 seconds)
    setTimeout(() => {
      set({
        ticketData: {
          pnr: `MIS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          timestamp: new Date().toISOString(),
          fare: currentRoute.fare,
          qrString: JSON.stringify({
            src: sourceStation?.id,
            dest: destinationStation?.id,
            fare: currentRoute.fare,
            route: currentRoute.segments.map(s => s.lineName).join(' → ')
          })
        }
      });
    }, 2500);
  },

  resetBooking: () => set({
    sourceStation: null,
    destinationStation: null,
    currentRoute: null,
    bookingConfirmed: false,
    ticketData: null
  }),

  loadRecentSearch: (search) => set({
    sourceStation: search.source,
    destinationStation: search.destination,
    currentRoute: null,
    bookingConfirmed: false,
    ticketData: null
  }),
}));