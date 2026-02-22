import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useBookingStore } from '../../store/useBookingStore';
import { CheckCircle2, Download, Wallet, RefreshCcw, Loader2, Train, MapPin, Clock, Banknote } from 'lucide-react';

export const BookingConfirmation = () => {
  const { currentRoute, sourceStation, destinationStation, ticketData, resetBooking } = useBookingStore();
  const qrRef = useRef(null);

  const handleDownloadTicket = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `Metro-Ticket-${ticketData.pnr}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  if (!currentRoute) return null;

  // while the ticket is loading we show a skeleton animation
  if (!ticketData) {
    return (
      <div className="glass-card p-8 flex flex-col items-center justify-center min-h-[350px] animate-fade-in-up">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-indigo-500/30 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-full animate-ping bg-indigo-500/10" />
        </div>
        <h3 className="text-lg font-bold mt-6" style={{ color: 'var(--text-primary)' }}>Confirming Booking...</h3>
        <p className="text-sm text-center mt-2 max-w-xs" style={{ color: 'var(--text-muted)' }}>
          Generating your secure QR ticket. Please wait.
        </p>

        {/* loading placeholder while ticket is being created */}
        <div className="w-full mt-8 space-y-4">
          <div className="skeleton h-4 w-3/4 mx-auto" />
          <div className="skeleton h-40 w-40 mx-auto rounded-xl" />
          <div className="skeleton h-4 w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 animate-fade-in-up">
      {/* green checkmark and success message */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mb-3">
          <CheckCircle2 className="w-9 h-9 text-emerald-400" />
        </div>
        <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Booking Confirmed!</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Ref: <span className="font-mono font-bold text-indigo-400">{ticketData.pnr}</span>
        </p>
      </div>

      {/* shows the trip details like stations, time, fare etc */}
      <div className="rounded-xl p-4 mb-6 space-y-3" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            From
          </div>
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{sourceStation?.name}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            To
          </div>
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{destinationStation?.name}</span>
        </div>
        <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Clock className="w-3.5 h-3.5" />
            Duration
          </div>
          <span className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>{currentRoute.totalDuration} min</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Train className="w-3.5 h-3.5" />
            Route
          </div>
          <span className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>{currentRoute.segments.map(s => s.lineName).join(' → ')}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Banknote className="w-3.5 h-3.5 text-emerald-400" />
            Fare
          </div>
          <span className="font-bold text-emerald-400 text-base">₹{ticketData.fare}</span>
        </div>
      </div>

      {/* the scannable QR code for the ticket */}
      <div className="flex justify-center mb-6" ref={qrRef}>
        <div className="p-5 bg-white rounded-2xl shadow-xl shadow-black/20">
          <QRCodeCanvas
            value={ticketData.qrString}
            size={180}
            level="H"
            includeMargin={false}
          />
        </div>
      </div>

      {/* buttons to download ticket or book another one */}
      <div className="flex gap-3">
        <button
          onClick={handleDownloadTicket}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/30"
        >
          <Download className="w-4 h-4" />
          Download
        </button>

      </div>
      <button
        onClick={resetBooking}
        className="w-full mt-3 flex items-center justify-center gap-2 hover:text-indigo-400 py-2.5 transition-colors text-sm font-medium"
        style={{ color: 'var(--text-muted)' }}
      >
        <RefreshCcw className="w-3.5 h-3.5" />
        Book Another Ticket
      </button>

    </div>
  );
};