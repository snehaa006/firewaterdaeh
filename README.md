# Fire & Water Safety Dashboard (React)

A modular React dashboard for monitoring fire and water safety sensors across
16 zones of a building, matching the tech stack: React frontend, FastAPI
backend (planned), PostgreSQL database, JWT auth.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173 and log in with:

- **Username:** `John`
- **Password:** `fire@123`

(Second demo account: `admin` / `admin@123`)

## Folder structure

```
src/
  components/
    auth/           Login page, route guard
    layout/         Sidebar, Topbar, page shell
    dashboard/      Summary cards, zone cards/grid, charts, events log
  context/          AuthContext (JWT session state)
  pages/            DashboardPage (view switching: overview/fire/water/events)
  services/
    api.js          All data fetching — currently mocked, swap USE_MOCK=false
                     to hit the real FastAPI backend
    mockData.js     16-zone hardcoded sample data
  utils/            Status colors, formatting helpers
  styles/           Global design tokens (colors, spacing, fonts)
```

## How the 16-zone data model was derived

Two reference snippets were provided:

1. **Postgres schema** — `sensor_readings` table stores per-zone:
   `temperature`, `smoke_level`, `battery_level`, `power_status`,
   `communication_status`, linked to a `zone_id`.

2. **Arduino code** — each zone's microcontroller reads:
   ```c
   int rawWL = analogRead(A0);          // water level sensor
   int rawP  = analogRead(A1);          // pressure sensor
   int waterLevel = map(rawWL, 0, 1023, 0, 100);  // -> 0-100%
   float pressure = (rawP * 10.0) / 1023.0;       // -> 0-10 bar
   bool fire  = !digitalRead(FIRE_IN);   // active-LOW fire sensor
   bool fault = !digitalRead(FAULT_IN);  // active-LOW fault sensor
   ```

**Interpretation used in this dashboard:** each of the 16 zones is its own
sensor unit and reports *all* of these fields together — water level,
pressure, fire flag, fault flag, temperature, smoke index, battery level,
power status, and communication status. This matches "16 zones" as 16 rows
in `zones`, each with a corresponding latest row in `sensor_readings` plus
the two extra Arduino-derived fields (waterLevel %, pressure bar).

If your real database stores water/pressure separately from the fire panel
sensors (e.g. two different device types per zone), the shape in
`mockData.js` / `api.js` can be split into two parallel arrays without
touching any UI components — `ZoneCard` just reads `zone.sensors.*`.

## Connecting to the real backend

In `src/services/api.js`:

1. Set `USE_MOCK = false`
2. Set `API_BASE_URL` to your Nginx-proxied FastAPI path
3. Implement these endpoints server-side:
   - `POST /auth/login` → `{ access_token, user }` (JWT, validated against
     the `users` table with bcrypt)
   - `GET /buildings/1`
   - `GET /panels/FACP_001`
   - `GET /panels/FACP_001/zones` — joins `zones` + latest `sensor_readings`
   - `GET /events?acknowledged=false`
   - `GET /panels/FACP_001/summary`
   - `POST /events/{id}/acknowledge`

No component code needs to change — they all consume the same shapes
already returned by the mock functions.

## Theme

White background (`--color-bg`, `--color-surface`) with light accent boxes
for status (water = light blue, fire = light orange/red, fault = light
amber, normal = light green). All tokens live in `src/styles/global.css`.
