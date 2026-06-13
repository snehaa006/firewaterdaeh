import { useEffect } from 'react';
import { STATUS_STYLES, formatRelativeTime } from '../../utils/format';
import './ZoneDetailModal.css';

export default function ZoneDetailModal({ zone, onClose }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!zone) return null;

  const style = STATUS_STYLES[zone.status] || STATUS_STYLES.NORMAL;
  const { sensors } = zone;

  return (
    <div className="zone-modal-overlay" onClick={onClose}>
      <div
        className="zone-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Zone ${zone.zone_number} details`}
        onClick={(e) => e.stopPropagation()}
        style={{
          '--modal-bg': style.bg,
          '--modal-border': style.border,
          '--modal-text': style.text,
          '--modal-strong': style.strong,
        }}
      >
        <div className="zone-modal-header">
          <div>
            <div className="zone-modal-eyebrow">Zone {zone.zone_number} &middot; {zone.floor_name}</div>
            <h2>{zone.zone_name}</h2>
          </div>
          <div className="zone-modal-header-right">
            <span className="zone-modal-status">{style.label}</span>
            <button className="zone-modal-close" onClick={onClose} aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="zone-modal-body">
          <div className="zone-modal-section">
            <h3 className="zone-modal-section-title">Water System</h3>
            <div className="zone-modal-metrics">
              <div className="zone-modal-metric">
                <div className="zone-modal-metric-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.5 7 5 11 5 14.5a7 7 0 0014 0C19 11 15.5 7 12 2z" />
                  </svg>
                  Water Level
                </div>
                <div className="zone-modal-metric-value">{sensors.waterLevel}%</div>
                <div className="zone-meter">
                  <div className="zone-meter-fill zone-meter-fill--water" style={{ width: `${sensors.waterLevel}%` }} />
                </div>
              </div>

              <div className="zone-modal-metric">
                <div className="zone-modal-metric-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22a8 8 0 008-8c0-4-3-7-8-12-5 5-8 8-8 12a8 8 0 008 8z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 11v6" strokeLinecap="round" />
                  </svg>
                  Line Pressure
                </div>
                <div className="zone-modal-metric-value">{sensors.pressure} bar</div>
                <div className="zone-meter">
                  <div className="zone-meter-fill zone-meter-fill--pressure" style={{ width: `${(sensors.pressure / 10) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="zone-modal-section">
            <h3 className="zone-modal-section-title">Fire Detection</h3>
            <div className="zone-modal-flags">
              <FlagRow active={sensors.fire} activeLabel="Fire detected" inactiveLabel="No fire detected" tone="fire" />
              <FlagRow active={sensors.fault} activeLabel="Sensor fault reported" inactiveLabel="No fault" tone="warning" />
              <FlagRow
                active={sensors.communicationStatus === 'OFFLINE'}
                activeLabel="Panel offline"
                inactiveLabel="Communication online"
                tone="offline"
              />
            </div>
          </div>

          <div className="zone-modal-section">
            <h3 className="zone-modal-section-title">Environment &amp; Power</h3>
            <div className="zone-modal-grid">
              <DataPoint label="Temperature" value={`${sensors.temperature}°C`} />
              <DataPoint label="Smoke Index" value={sensors.smokeLevel} />
              <DataPoint label="Battery Level" value={`${sensors.batteryLevel}%`} />
              <DataPoint label="Power Status" value={sensors.powerStatus} />
              <DataPoint label="Communication" value={sensors.communicationStatus} />
              <DataPoint label="Last Updated" value={formatRelativeTime(zone.lastUpdated)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlagRow({ active, activeLabel, inactiveLabel, tone }) {
  const className = active ? `zone-modal-flag zone-modal-flag--${tone}` : 'zone-modal-flag zone-modal-flag--ok';
  return (
    <div className={className}>
      <span className="zone-modal-flag-dot" />
      {active ? activeLabel : inactiveLabel}
    </div>
  );
}

function DataPoint({ label, value }) {
  return (
    <div className="zone-modal-datapoint">
      <div className="zone-modal-datapoint-label">{label}</div>
      <div className="zone-modal-datapoint-value">{value}</div>
    </div>
  );
}
