export const STATUS_STYLES = {
  NORMAL: {
    bg: 'var(--color-normal-bg)',
    border: 'var(--color-normal-border)',
    text: 'var(--color-normal-text)',
    strong: 'var(--color-normal-strong)',
    label: 'Normal',
  },
  ALARM: {
    bg: 'var(--color-critical-bg)',
    border: 'var(--color-critical-border)',
    text: 'var(--color-critical-text)',
    strong: 'var(--color-critical-strong)',
    label: 'Fire Alarm',
  },
  FAULT: {
    bg: 'var(--color-warning-bg)',
    border: 'var(--color-warning-border)',
    text: 'var(--color-warning-text)',
    strong: 'var(--color-warning-strong)',
    label: 'Fault',
  },
  OFFLINE: {
    bg: 'var(--color-offline-bg)',
    border: 'var(--color-offline-border)',
    text: 'var(--color-offline-text)',
    strong: 'var(--color-offline-text)',
    label: 'Offline',
  },
};

export const SEVERITY_STYLES = {
  LOW: { bg: 'var(--color-normal-bg)', text: 'var(--color-normal-text)', label: 'Low' },
  MEDIUM: { bg: 'var(--color-warning-bg)', text: 'var(--color-warning-text)', label: 'Medium' },
  HIGH: { bg: 'var(--color-fire-bg)', text: 'var(--color-fire-text)', label: 'High' },
  CRITICAL: { bg: 'var(--color-critical-bg)', text: 'var(--color-critical-text)', label: 'Critical' },
};

export function formatRelativeTime(isoString) {
  const date = new Date(isoString);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
}

export function pressureLevel(pressure) {
  if (pressure < 2) return 'low';
  if (pressure > 8) return 'high';
  return 'normal';
}

export function waterLevelStatus(level) {
  if (level < 20) return 'low';
  if (level > 90) return 'high';
  return 'normal';
}
