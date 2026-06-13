// ---------------------------------------------------------------------------
// Mock data layer
//
// Based on the reference Arduino code, each zone's microcontroller reads:
//   - rawWL  (analog water level sensor)  -> waterLevel mapped 0-100 (%)
//   - rawP   (analog pressure sensor)     -> pressure 0-10 (bar)
//   - FIRE_IN (digital, active LOW)       -> fire boolean
//   - FAULT_IN (digital, active LOW)      -> fault boolean
//
// Combined with the Postgres schema (sensor_readings table), each zone also
// reports: temperature, smoke_level, battery_level, power_status and
// communication_status.
//
// There are 16 zones total (per panel). This file produces realistic
// hardcoded sample data shaped exactly like what the real API/DB will
// eventually return, so swapping in the live fetch later is a drop-in.
// ---------------------------------------------------------------------------

export const BUILDING = {
  id: 1,
  building_name: 'Academic Block',
  address: 'IIT Jammu',
  latitude: 32.7265,
  longitude: 74.8571,
};

export const PANEL = {
  id: 1,
  panel_id: 'FACP_001',
  panel_name: 'Main Fire Panel',
  panel_type: 'Fire Alarm Control Panel',
  status: 'NORMAL',
  last_seen: new Date().toISOString(),
};

const FLOOR_PLAN = [
  'Ground Floor',
  'Ground Floor',
  'Ground Floor',
  'Ground Floor',
  'First Floor',
  'First Floor',
  'First Floor',
  'First Floor',
  'Second Floor',
  'Second Floor',
  'Second Floor',
  'Second Floor',
  'Third Floor',
  'Third Floor',
  'Third Floor',
  'Third Floor',
];

const ZONE_NAMES = [
  'Server Room',
  'Main Lobby',
  'Electrical Room',
  'Library Wing A',
  'Lecture Hall 101',
  'Lecture Hall 102',
  'Faculty Offices',
  'Pantry / Kitchenette',
  'Lab - Chemistry',
  'Lab - Physics',
  'Corridor East',
  'Corridor West',
  'Seminar Hall',
  'Storage Room',
  'IT Closet',
  'Rooftop Tank Room',
];

// Deterministic pseudo-random generator so values are stable across reloads
function seeded(seed) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function buildZone(zoneNumber) {
  const rand = seeded(zoneNumber * 97 + 13);

  // Simulate raw analog reads (0-1023), same as Arduino A0 / A1
  const rawWL = Math.floor(rand() * 1023);
  const rawP = Math.floor(rand() * 1023);

  const waterLevel = Math.round((rawWL / 1023) * 100); // map(rawWL, 0,1023, 0,100)
  const pressure = Math.round(((rawP * 10.0) / 1023) * 100) / 100; // (rawP*10)/1023

  // digitalRead is active LOW -> fire = !digitalRead(FIRE_IN)
  // Most zones are clear; a couple are deliberately flagged for demo purposes
  let fire = false;
  let fault = false;

  if (zoneNumber === 1) fire = true; // Server Room - matches seed event in schema
  if (zoneNumber === 15) fault = true; // IT Closet - comms fault demo

  const temperature = Math.round((22 + rand() * 14) * 10) / 10; // 22-36 C
  const smokeLevel = fire ? Math.floor(60 + rand() * 35) : Math.floor(rand() * 30);
  const batteryLevel = fault ? Math.floor(20 + rand() * 30) : Math.floor(70 + rand() * 30);
  const powerStatus = fault ? 'UPS' : 'ON';
  const communicationStatus = fault && zoneNumber === 15 ? 'OFFLINE' : 'ONLINE';

  let status = 'NORMAL';
  if (fire) status = 'ALARM';
  else if (fault) status = 'FAULT';
  else if (communicationStatus === 'OFFLINE') status = 'OFFLINE';

  return {
    id: zoneNumber,
    panel_id: PANEL.id,
    zone_number: zoneNumber,
    zone_name: ZONE_NAMES[zoneNumber - 1],
    floor_name: FLOOR_PLAN[zoneNumber - 1],
    status,
    sensors: {
      waterLevel,   // %
      pressure,     // bar
      fire,         // boolean
      fault,        // boolean
      temperature,  // deg C
      smokeLevel,   // 0-100 index
      batteryLevel, // %
      powerStatus,  // ON | FAILURE | UPS
      communicationStatus, // ONLINE | OFFLINE
    },
    lastUpdated: new Date().toISOString(),
  };
}

export const ZONES = Array.from({ length: 16 }, (_, i) => buildZone(i + 1));

export const EVENTS = [
  {
    id: 1,
    panel_id: PANEL.id,
    zone_id: 1,
    zone_name: 'Server Room',
    event_type: 'FIRE_ALARM',
    severity: 'CRITICAL',
    message: 'High smoke detected in Server Room',
    is_acknowledged: false,
    created_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
  {
    id: 2,
    panel_id: PANEL.id,
    zone_id: 15,
    zone_name: 'IT Closet',
    event_type: 'COMMUNICATION_FAULT',
    severity: 'MEDIUM',
    message: 'Zone 15 sensor unit lost communication with panel',
    is_acknowledged: false,
    created_at: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
  },
  {
    id: 3,
    panel_id: PANEL.id,
    zone_id: 16,
    zone_name: 'Rooftop Tank Room',
    event_type: 'LOW_WATER_LEVEL',
    severity: 'LOW',
    message: 'Water tank level below recommended threshold',
    is_acknowledged: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
];

// Aggregate helpers used by dashboard summary cards
export function getSummary(zones = ZONES) {
  const totalZones = zones.length;
  const fireAlarms = zones.filter((z) => z.sensors.fire).length;
  const faults = zones.filter((z) => z.sensors.fault).length;
  const offline = zones.filter((z) => z.sensors.communicationStatus === 'OFFLINE').length;
  const avgWaterLevel = Math.round(
    zones.reduce((sum, z) => sum + z.sensors.waterLevel, 0) / totalZones
  );
  const avgPressure = Math.round(
    (zones.reduce((sum, z) => sum + z.sensors.pressure, 0) / totalZones) * 100
  ) / 100;

  return { totalZones, fireAlarms, faults, offline, avgWaterLevel, avgPressure };
}
