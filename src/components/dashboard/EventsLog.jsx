import { useState } from 'react';
import { SEVERITY_STYLES, formatRelativeTime } from '../../utils/format';
import { acknowledgeEvent } from '../../services/api';
import './EventsLog.css';

export default function EventsLog({ events, onAcknowledge }) {
  const [busyId, setBusyId] = useState(null);

  async function handleAcknowledge(id) {
    setBusyId(id);
    try {
      await acknowledgeEvent(id);
      onAcknowledge?.(id);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="events-log">
      <div className="events-log-header">
        <h3>Recent Events</h3>
        <span className="events-log-count">{events.filter((e) => !e.is_acknowledged).length} unacknowledged</span>
      </div>

      {events.length === 0 ? (
        <div className="events-log-empty">No events recorded.</div>
      ) : (
        <ul className="events-log-list">
          {events.map((event) => {
            const severity = SEVERITY_STYLES[event.severity] || SEVERITY_STYLES.LOW;
            return (
              <li key={event.id} className="events-log-item">
                <span
                  className="events-log-severity"
                  style={{ background: severity.bg, color: severity.text }}
                >
                  {severity.label}
                </span>
                <div className="events-log-body">
                  <div className="events-log-message">{event.message}</div>
                  <div className="events-log-meta">
                    {event.zone_name} &middot; {event.event_type.replace(/_/g, ' ')} &middot; {formatRelativeTime(event.created_at)}
                  </div>
                </div>
                {event.is_acknowledged ? (
                  <span className="events-log-ack-badge">Acknowledged</span>
                ) : (
                  <button
                    className="events-log-ack-btn"
                    onClick={() => handleAcknowledge(event.id)}
                    disabled={busyId === event.id}
                  >
                    {busyId === event.id ? 'Saving…' : 'Acknowledge'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
