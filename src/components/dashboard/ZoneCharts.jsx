import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import './ZoneCharts.css';

export function WaterLevelChart({ zones }) {
  const data = zones.map((z) => ({
    name: `Z${z.zone_number}`,
    waterLevel: z.sensors.waterLevel,
  }));

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3>Water Level by Zone</h3>
        <span className="chart-card-subtitle">Tank / line fill percentage</span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
            formatter={(value) => [`${value}%`, 'Water Level']}
          />
          <Bar dataKey="waterLevel" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.waterLevel < 20
                    ? 'var(--color-warning-strong)'
                    : 'var(--color-water-strong)'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PressureChart({ zones }) {
  const data = zones.map((z) => ({
    name: `Z${z.zone_number}`,
    pressure: z.sensors.pressure,
  }));

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3>Line Pressure by Zone</h3>
        <span className="chart-card-subtitle">Bar — nominal range 2–8</span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
            formatter={(value) => [`${value} bar`, 'Pressure']}
          />
          <Bar dataKey="pressure" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.pressure < 2 || entry.pressure > 8
                    ? 'var(--color-fire-strong)'
                    : 'var(--color-accent)'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
