import { useMemo, useState } from 'react';
import ZoneTile from './ZoneTile';
import ZoneDetailModal from './ZoneDetailModal';
import './ZoneGrid.css';

const FILTERS = [
  { key: 'all', label: 'All Zones' },
  { key: 'alerts', label: 'Alerts Only' },
];

export default function ZoneGrid({ zones, title = 'Zone Monitoring', defaultFilter = 'all' }) {
  const [filter, setFilter] = useState(defaultFilter);
  const [selectedZone, setSelectedZone] = useState(null);
  const showFilters = defaultFilter === 'all';

  const filteredZones = useMemo(() => {
    if (filter === 'alerts') return zones.filter((z) => z.status !== 'NORMAL');
    return zones;
  }, [zones, filter]);

  return (
    <section className="zone-grid-section">
      <div className="zone-grid-header">
        <div>
          <h3>{title}</h3>
          <p className="zone-grid-subtitle">Tap a zone to view full sensor details</p>
        </div>
        {showFilters && (
          <div className="zone-grid-filters">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`zone-filter-btn ${filter === f.key ? 'active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredZones.length === 0 ? (
        <div className="zone-grid-empty">No zones match this filter.</div>
      ) : (
        <div className="zone-grid">
          {filteredZones.map((zone) => (
            <ZoneTile key={zone.id} zone={zone} onClick={() => setSelectedZone(zone)} />
          ))}
        </div>
      )}

      {selectedZone && (
        <ZoneDetailModal zone={selectedZone} onClose={() => setSelectedZone(null)} />
      )}
    </section>
  );
}
