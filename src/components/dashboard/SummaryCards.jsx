import './SummaryCards.css';

export default function SummaryCards({ summary }) {
  const cards = [
    {
      label: 'Total Zones',
      value: summary.totalZones,
      sub: 'Monitored across 4 floors',
      tone: 'water',
      icon: (
        <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" />
      ),
    },
    {
      label: 'Active Fire Alarms',
      value: summary.fireAlarms,
      sub: summary.fireAlarms > 0 ? 'Requires immediate attention' : 'All clear',
      tone: summary.fireAlarms > 0 ? 'critical' : 'normal',
      icon: (
        <path d="M12 2C9 6 6 9.5 6 13a6 6 0 0012 0c0-3.5-3-7-6-11zM12 8c1.2 2 2.2 3.6 2.2 5a2.2 2.2 0 11-4.4 0c0-1.4 1-3 2.2-5z" />
      ),
    },
    {
      label: 'Sensor Faults',
      value: summary.faults,
      sub: summary.faults > 0 ? 'Check device connectivity' : 'No faults reported',
      tone: summary.faults > 0 ? 'warning' : 'normal',
      icon: (
        <path d="M12 2L1 21h22L12 2zm0 6v6m0 3.5h.01" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ),
    },
    {
      label: 'Avg. Water Level',
      value: `${summary.avgWaterLevel}%`,
      sub: `Avg. pressure ${summary.avgPressure} bar`,
      tone: 'water',
      icon: (
        <path d="M12 2C8.5 7 5 11 5 14.5a7 7 0 0014 0C19 11 15.5 7 12 2z" />
      ),
    },
  ];

  return (
    <div className="summary-grid">
      {cards.map((card) => (
        <div key={card.label} className={`summary-card summary-card--${card.tone}`}>
          <div className="summary-card-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              {card.icon}
            </svg>
          </div>
          <div className="summary-card-body">
            <div className="summary-card-value">{card.value}</div>
            <div className="summary-card-label">{card.label}</div>
            <div className="summary-card-sub">{card.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
