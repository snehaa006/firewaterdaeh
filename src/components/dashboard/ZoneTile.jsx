import { STATUS_STYLES } from '../../utils/format';
import './ZoneTile.css';

export default function ZoneTile({ zone, onClick }) {
  const style = STATUS_STYLES[zone.status] || STATUS_STYLES.NORMAL;
  const { sensors } = zone;

  return (
    <button
      className="zone-tile"
      onClick={onClick}
      style={{
        '--tile-bg': style.bg,
        '--tile-border': style.border,
        '--tile-text': style.text,
        '--tile-strong': style.strong,
      }}
    >
      <div className="zone-tile-top">
        <span className="zone-tile-number">{zone.zone_number}</span>
        <span className="zone-tile-dot" aria-hidden="true" />
      </div>
      <div className="zone-tile-name">{zone.zone_name}</div>
      <div className="zone-tile-status">{style.label}</div>

      <div className="zone-tile-quick">
        <span title="Water level">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.5 7 5 11 5 14.5a7 7 0 0014 0C19 11 15.5 7 12 2z" />
          </svg>
          {sensors.waterLevel}%
        </span>
        <span title="Pressure">{sensors.pressure} bar</span>
      </div>
    </button>
  );
}
