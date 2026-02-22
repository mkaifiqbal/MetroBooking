import { create } from 'zustand';
import metroData from '../data/metroData.json';

export const useAdminStore = create((set, get) => ({
  stations: metroData.stations,
  lines: metroData.lines,

  // creates a new station and adds it to our station list
  addStation: (name, x, y, facilities = []) => {
    set((state) => {
      const newId = `s${Date.now()}`;
      const newStation = {
        id: newId,
        name,
        coordinates: { x: parseInt(x, 10), y: parseInt(y, 10) },
        facilities
      };
      return { stations: [...state.stations, newStation] };
    });
  },

  // deletes a station and also removes it from any line that had it
  removeStation: (stationId) => {
    set((state) => ({
      stations: state.stations.filter(s => s.id !== stationId),
      lines: state.lines.map(l => ({
        ...l,
        stations: l.stations.filter(sid => sid !== stationId)
      }))
    }));
  },

  // creates a new metro line with a name, color and optional stations
  addLine: (name, color, stationIds = []) => {
    set((state) => {
      const newId = `l${Date.now()}`;
      const newLine = {
        id: newId,
        name,
        color,
        stations: stationIds
      };
      return { lines: [...state.lines, newLine] };
    });
  },

  // deletes a line completely from the network
  removeLine: (lineId) => {
    set((state) => ({
      lines: state.lines.filter(l => l.id !== lineId)
    }));
  },

  // puts a station into a line (only if its not already there)
  addStationToLine: (lineId, stationId) => {
    set((state) => {
      const newLines = state.lines.map(l => {
        if (l.id === lineId && !l.stations.includes(stationId)) {
          return { ...l, stations: [...l.stations, stationId] };
        }
        return l;
      });
      return { lines: newLines };
    });
  },

  // takes a station out of a line without deleting it
  removeStationFromLine: (lineId, stationId) => {
    set((state) => {
      const newLines = state.lines.map(l => {
        if (l.id === lineId) {
          return { ...l, stations: l.stations.filter(sid => sid !== stationId) };
        }
        return l;
      });
      return { lines: newLines };
    });
  },

  // changes the order of stations in a line (used for drag and drop)
  reorderStation: (lineId, oldIndex, newIndex) => {
    set((state) => {
      const lineIndex = state.lines.findIndex(l => l.id === lineId);
      if (lineIndex === -1) return state;

      const newLines = [...state.lines];
      const stationsList = [...newLines[lineIndex].stations];

      const [movedStation] = stationsList.splice(oldIndex, 1);
      stationsList.splice(newIndex, 0, movedStation);

      newLines[lineIndex] = { ...newLines[lineIndex], stations: stationsList };

      return { lines: newLines };
    });
  },

  // replaces all stations and lines with new data from CSV import
  importBulkData: (newStations, newLines) => {
    set({ stations: newStations, lines: newLines });
  }
}));