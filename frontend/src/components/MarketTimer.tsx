import { useEffect, useState } from 'react';

// NYSE/NASDAQ: Mon–Fri 09:30–16:00 Eastern Time
const MARKET_OPEN_HOUR = 9;
const MARKET_OPEN_MIN = 30;
const MARKET_CLOSE_HOUR = 16;
const MARKET_CLOSE_MIN = 0;

function getEasternDate(): Date {
  // Convert current UTC time to Eastern Time (handles EST/EDT automatically)
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
}

function toMinutes(h: number, m: number) {
  return h * 60 + m;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatCountdown(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

interface MarketState {
  isOpen: boolean;
  secondsUntilChange: number; // until open (if closed) or until close (if open)
  opensNextWeekday: boolean;  // true if next open is Mon (currently Fri after close or weekend)
}

function computeMarketState(): MarketState {
  const now = getEasternDate();
  const day = now.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  const currentMin = toMinutes(now.getHours(), now.getMinutes());
  const openMin = toMinutes(MARKET_OPEN_HOUR, MARKET_OPEN_MIN);
  const closeMin = toMinutes(MARKET_CLOSE_HOUR, MARKET_CLOSE_MIN);
  const currentSec = now.getSeconds();

  const isWeekday = day >= 1 && day <= 5;
  const isOpen = isWeekday && currentMin >= openMin && currentMin < closeMin;

  if (isOpen) {
    const secondsUntilChange = (closeMin - currentMin) * 60 - currentSec;
    return { isOpen: true, secondsUntilChange, opensNextWeekday: false };
  }

  // Calculate seconds until next market open
  let daysUntilOpen = 0;
  let opensNextWeekday = false;

  if (isWeekday && currentMin < openMin) {
    // Same day, before open
    daysUntilOpen = 0;
  } else {
    // After close today, or weekend — find next Monday or next weekday
    const daysAhead = day === 5 ? 3 : day === 6 ? 2 : day === 0 ? 1 : 1;
    daysUntilOpen = daysAhead;
    opensNextWeekday = daysAhead >= 2;
  }

  // Seconds until next 09:30 ET
  const secondsUntilOpen =
    daysUntilOpen * 86400 +
    (openMin - currentMin) * 60 -
    currentSec;

  return { isOpen: false, secondsUntilChange: Math.max(0, secondsUntilOpen), opensNextWeekday };
}

export default function MarketTimer() {
  const [state, setState] = useState<MarketState>(computeMarketState);

  useEffect(() => {
    const id = setInterval(() => setState(computeMarketState()), 1000);
    return () => clearInterval(id);
  }, []);

  const { isOpen, secondsUntilChange, opensNextWeekday } = state;

  const dotColor = isOpen ? '#16a34a' : '#dc2626';
  const label = isOpen ? 'Market closes in' : opensNextWeekday ? 'Market opens Monday' : 'Market opens in';
  const showCountdown = !(opensNextWeekday && !isOpen) || secondsUntilChange < 86400 * 3;

  return (
    <div style={{
      border: '1px solid #e5e5e5',
      borderRadius: '12px',
      padding: '18px 24px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#1a1a1a' }}>
        Market Hours
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Status dot with pulse when open */}
        <span style={{
          display: 'inline-block',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: dotColor,
          flexShrink: 0,
          boxShadow: isOpen ? `0 0 0 3px ${dotColor}33` : 'none',
        }} />
        <span style={{ fontSize: '14px', fontWeight: 600, color: dotColor }}>
          {isOpen ? 'Open' : 'Closed'}
        </span>
        <span style={{ fontSize: '12px', color: '#888', marginLeft: '2px' }}>
          NYSE / NASDAQ
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontSize: '12px', color: '#888' }}>{label}</span>
        {showCountdown && (
          <span style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.5px' }}>
            {formatCountdown(secondsUntilChange)}
          </span>
        )}
      </div>

      <span style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>
        09:30 – 16:00 ET · Mon – Fri
      </span>
    </div>
  );
}
