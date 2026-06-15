// ---------------------------------------------------------------------------
// API service layer — Supabase (PostgreSQL via PostgREST)
//
// All exported function signatures are IDENTICAL to the previous mock version,
// so no component needs to change.  Data shapes are normalised to match what
// the rest of the app already expects.
// ---------------------------------------------------------------------------

import { supabase } from './supabase';

const AUTH_TOKEN_KEY = 'fwd_auth_token';

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function login(username, password) {
  // Password is verified server-side using bcrypt via the check_password
  // Postgres RPC (uses pgcrypto's crypt()). The hash never leaves the DB.
  const { data, error } = await supabase.rpc('check_password', {
    p_username: username,
    p_password: password,
  });

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('Invalid username or password');

  const user = data[0];

  const token = `supabase.${btoa(
    JSON.stringify({ sub: user.username, role: user.role, id: user.id, exp: Date.now() + 8 * 60 * 60 * 1000 })
  )}.sig`;

  localStorage.setItem(AUTH_TOKEN_KEY, token);
  return {
    token,
    user: { username: user.username, role: user.role, email: user.email },
  };
}

export function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Building
// ---------------------------------------------------------------------------

export async function fetchBuilding() {
  const { data, error } = await supabase
    .from('buildings')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

export async function fetchPanel() {
  const { data, error } = await supabase
    .from('panels')
    .select('*')
    .eq('panel_code', 'FACP_001')
    .single();

  if (error) throw new Error(error.message);
  return {
    id: data.id,
    panel_id: data.panel_code,
    panel_name: data.panel_name,
    panel_type: data.panel_type,
    status: data.status,
    last_seen: data.last_seen,
  };
}

// ---------------------------------------------------------------------------
// Zones  (joins zones + zone_status + latest sensor_reading per zone)
// ---------------------------------------------------------------------------

export async function fetchZones() {
  // 1. Fetch all zones with their current status snapshot
  const { data: zonesData, error: zonesError } = await supabase
    .from('zones')
    .select(`
      id,
      zone_number,
      zone_name,
      floor_name,
      zone_status (
        status,
        water_level_pct,
        line_pressure_bar,
        updated_at
      )
    `)
    .order('zone_number', { ascending: true });

  if (zonesError) throw new Error(zonesError.message);

  // 2. Fetch latest sensor reading for each zone (for temperature, smoke, battery, etc.)
  const { data: readings, error: readingsError } = await supabase
    .from('sensor_readings')
    .select('zone_id, temperature, smoke_index, fire_detected, fault_detected, battery_level, power_status, communication_status, created_at')
    .in('zone_id', zonesData.map((z) => z.id))
    .order('created_at', { ascending: false });

  if (readingsError) throw new Error(readingsError.message);

  // Keep only the most-recent reading per zone
  const latestReadingByZone = {};
  for (const r of readings) {
    if (!latestReadingByZone[r.zone_id]) latestReadingByZone[r.zone_id] = r;
  }

  // 3. Normalise to the shape the rest of the app expects
  return zonesData.map((z) => {
    const snap = z.zone_status?.[0] ?? z.zone_status ?? {};
    const reading = latestReadingByZone[z.id] ?? {};

    const fire = reading.fire_detected ?? false;
    const fault = reading.fault_detected ?? false;
    const commStatus = reading.communication_status ?? 'ONLINE';

    let status = snap.status ?? 'NORMAL';
    // Normalise status values between schema variants
    if (status === 'FIRE_ALARM') status = 'ALARM';

    return {
      id: z.zone_number,
      panel_id: 1,
      zone_number: z.zone_number,
      zone_name: z.zone_name,
      floor_name: z.floor_name,
      status,
      sensors: {
        waterLevel: parseFloat(snap.water_level_pct ?? 0),
        pressure: parseFloat(snap.line_pressure_bar ?? 0),
        fire,
        fault,
        temperature: parseFloat(reading.temperature ?? 0),
        smokeLevel: reading.smoke_index ?? 0,
        batteryLevel: reading.battery_level ?? 100,
        powerStatus: reading.power_status ?? 'ON',
        communicationStatus: commStatus,
      },
      lastUpdated: snap.updated_at ?? reading.created_at ?? new Date().toISOString(),
    };
  });
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export async function fetchEvents() {
  const { data, error } = await supabase
    .from('events')
    .select(`
      id,
      panel_id,
      zone_id,
      event_type,
      severity,
      title,
      message,
      is_acknowledged,
      created_at,
      zones ( zone_name )
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);

  return data.map((e) => ({
    id: e.id,
    panel_id: e.panel_id,
    zone_id: e.zone_id,
    zone_name: e.zones?.zone_name ?? `Zone ${e.zone_id}`,
    event_type: e.event_type,
    severity: e.severity,
    message: e.message ?? e.title,
    is_acknowledged: e.is_acknowledged,
    created_at: e.created_at,
  }));
}

// ---------------------------------------------------------------------------
// Summary (computed from live zone data)
// ---------------------------------------------------------------------------

export async function fetchSummary() {
  const zones = await fetchZones();

  const totalZones = zones.length;
  const fireAlarms = zones.filter((z) => z.sensors.fire || z.status === 'ALARM').length;
  const faults = zones.filter((z) => z.sensors.fault || z.status === 'FAULT').length;
  const offline = zones.filter((z) => z.sensors.communicationStatus === 'OFFLINE').length;
  const avgWaterLevel = Math.round(
    zones.reduce((sum, z) => sum + z.sensors.waterLevel, 0) / totalZones
  );
  const avgPressure =
    Math.round((zones.reduce((sum, z) => sum + z.sensors.pressure, 0) / totalZones) * 100) / 100;

  return { totalZones, fireAlarms, faults, offline, avgWaterLevel, avgPressure };
}

// ---------------------------------------------------------------------------
// User Management (admin only)
// ---------------------------------------------------------------------------

export async function fetchUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, role, is_active, created_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function createUser({ username, email, password, role }) {
  // Hash the password server-side using pgcrypto via RPC — the plain-text
  // password never touches the DB directly.
  const { data, error } = await supabase.rpc('create_user_with_password', {
    p_username: username,
    p_email: email,
    p_password: password,
    p_role: role,
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function toggleUserActive(userId, isActive) {
  const { data, error } = await supabase
    .from('users')
    .update({ is_active: isActive })
    .eq('id', userId)
    .select('id, is_active')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ---------------------------------------------------------------------------
// Acknowledge an event
// ---------------------------------------------------------------------------

export async function acknowledgeEvent(eventId) {
  const { data, error } = await supabase
    .from('events')
    .update({ is_acknowledged: true, acknowledged_at: new Date().toISOString() })
    .eq('id', eventId)
    .select('id, is_acknowledged')
    .single();

  if (error) throw new Error(error.message);
  return data;
}
