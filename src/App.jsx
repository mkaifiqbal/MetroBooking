import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Train, ShieldHalf, Map, Ticket, Sun, Moon, MapPin, Palette, LayoutGrid, Search } from 'lucide-react';

import { JourneyPlanner } from './components/molecules/StationSearch';
import { RouteResultDisplay } from './components/organisms/RouteResultDisplay';
import { BookingConfirmation } from './components/organisms/BookingConfirmation';
import { NetworkMap } from './components/organisms/NetworkMap';
import { useBookingStore } from './store/useBookingStore';
import { useThemeStore } from './store/useThemeStore';

import { AdminAddStation } from './components/organisms/AdminAddStation';
import { AdminAddLine } from './components/organisms/AdminAddLine';
import { AdminOverview } from './components/organisms/AdminOverview';
import { AdminBulkImport } from './components/organisms/AdminBulkImport';
import { CompatibilityMatrix } from './components/organisms/CompatibilityMatrix';
import { cn } from './components/molecules/StationSearch';

const PassengerView = () => {
  const currentRoute = useBookingStore((state) => state.currentRoute);
  const bookingConfirmed = useBookingStore((state) => state.bookingConfirmed);
  const resetBooking = useBookingStore((state) => state.resetBooking);

  const hasRoute = !!currentRoute;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid lg:grid-cols-12 gap-6">
        {/* On phones, we show the map above everything */}
        <div className="lg:hidden animate-fade-in-up overflow-hidden max-w-full">
          <NetworkMap />
        </div>

        {/* Left side - shows search form OR route results depending on state */}
        <div className="lg:col-span-5 space-y-5">
          {!hasRoute ? (
            <JourneyPlanner />
          ) : (
            <div className="space-y-4 animate-fade-in-up">
              {!bookingConfirmed ? <RouteResultDisplay /> : <BookingConfirmation />}
              {/* Button to go back to search - we hide it after booking is done */}
              {!bookingConfirmed && (
                <button
                  onClick={resetBooking}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 border hover:border-indigo-500/30 hover:bg-indigo-500/5"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', borderColor: 'var(--border-glass)' }}
                >
                  <Search className="w-4 h-4 text-indigo-400" />
                  Plan New Journey
                </button>
              )}
            </div>
          )}
        </div>

        {/* On bigger screens, the map goes on the right side */}
        <div className="hidden lg:block lg:col-span-7 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <NetworkMap />
        </div>
      </div>
    </div>
  );
};

const ADMIN_TABS = [
  { id: 'stations', label: 'Add Station', icon: MapPin },
  { id: 'lines', label: 'Add Line', icon: Palette },
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'tools', label: 'Tools', icon: ShieldHalf },
];

const AdminView = () => {
  const [activeTab, setActiveTab] = useState('stations');

  const activeTabData = ADMIN_TABS.find(t => t.id === activeTab);

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 pb-20 md:pb-6">
      {/* Admin Header — compact on mobile */}
      <div className="mb-3 sm:mb-6">
        {/* Mobile: slim header */}
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-indigo-500/15 flex items-center justify-center border border-indigo-500/20 shrink-0">
            <ShieldHalf className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base md:text-xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>Admin Panel</h1>
            <p className="text-[10px] md:text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>Manage your metro network</p>
          </div>
          {/* Mobile active tab badge */}
          <div className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'var(--bg-input)', color: 'var(--text-accent)', border: '1px solid var(--border-glass)' }}>
            <activeTabData.icon className="w-3.5 h-3.5" />
            {activeTabData.label}
          </div>
        </div>

        {/* Desktop: horizontal tab bar */}
        <nav className="hidden md:flex gap-1 p-1 rounded-xl border" style={{ background: 'var(--nav-bg)', borderColor: 'var(--nav-border)' }}>
          {ADMIN_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200",
                activeTab === tab.id ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" : ""
              )}
              style={activeTab !== tab.id ? { color: 'var(--text-secondary)' } : {}}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'stations' && <AdminAddStation />}
      {activeTab === 'lines' && <AdminAddLine />}
      {activeTab === 'overview' && <AdminOverview />}
      {activeTab === 'tools' && (
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          <AdminBulkImport />
          <CompatibilityMatrix />
        </div>
      )}

      {/* Mobile: sticky bottom tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t safe-area-bottom" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-glass)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        <nav className="flex">
          {ADMIN_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all duration-200"
              style={{ color: activeTab === tab.id ? '#6366f1' : 'var(--text-muted)' }}
            >
              <tab.icon className="w-5 h-5" style={activeTab === tab.id ? { filter: 'drop-shadow(0 0 6px rgba(99,102,241,0.4))' } : {}} />
              <span className="text-[9px] font-bold leading-none">{tab.label}</span>
              {activeTab === tab.id && <span className="w-4 h-0.5 rounded-full bg-indigo-500 mt-0.5" />}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

// This component handles everything inside <BrowserRouter>
// We need it separate so we can use useLocation() hook
function AppContent() {
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  // Set the theme on the html tag whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', transition: 'background-color 0.3s ease, color 0.3s ease' }}>

      {/* Top navigation bar - sticks to the top when scrolling */}
      <header className="sticky top-0 z-50" style={{
        background: 'var(--header-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-glass)'
      }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo on the left */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Train className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>MoveInSync</span>
              <span className="text-[10px] font-semibold text-indigo-400 tracking-widest uppercase">Metro Service</span>
            </div>
          </div>

          {/* Right side: nav button + theme toggle */}
          <div className="flex items-center gap-3">
            {/* Only show the opposite page button */}
            {isAdminPage ? (
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
              >
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            ) : (
              <Link
                to="/admin"
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
              >
                <ShieldHalf className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            {/* Dark/Light mode toggle button */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 border"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border-glass)',
                color: 'var(--text-secondary)'
              }}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>
          </div>
        </div>
      </header>

      {/* Page content goes here */}
      <main>
        <Routes>
          <Route path="/" element={<PassengerView />} />
          <Route path="/admin" element={<AdminView />} />
        </Routes>
      </main>

    </div>
  );
}

// Main App component - just wraps everything in the router
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;