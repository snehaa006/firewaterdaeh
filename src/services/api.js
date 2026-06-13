// ---------------------------------------------------------------------------
// API service layer
//
// Every function here returns a Promise so the rest of the app already
// behaves as if it were talking to FastAPI. Right now USE_MOCK is true and
// data comes from mockData.js. When the real backend (FastAPI + Postgres,
// behind Nginx) is ready:
//
//   1. Set USE_MOCK = false (or drive it from an env var)
//   2. Set API_BASE_URL to the deployed API path, e.g. '/api/v1'
//   3. The fetch* functions below already point at the expected REST routes
//
// No other component needs to change.
// ---------------------------------------------------------------------------

import { BUILDING, PANEL, ZONES, EVENTS, getSummary } from './mockData';

const USE_MOCK = true;
const API_BASE_URL = '/api/v1';

const AUTH_TOKEN_KEY = 'fwd_auth_token';

function authHeaders() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

// Hardcoded demo user (predefined, no signup flow).
// In production this check happens server-side via JWT issued by FastAPI,
// validating against the `users` table (hashed_password via bcrypt).
const DEMO_USERS = [
  { username: 'John', password: 'fire@123', role: 'ADMIN', email: 'john@example.com' },
  { username: 'admin', password: 'admin@123', role: 'ADMIN', email: 'admin@example.com' },
];

export async function login(username, password) {
  if (USE_MOCK) {
    await delay(400);
    const user = DEMO_USERS.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (!user) {
      throw new Error('Invalid username or password');
    }
    // Fake a JWT-shaped token (header.payload.signature) for realism.
    const fakeToken = `mock.${btoa(
      JSON.stringify({ sub: user.username, role: user.role, exp: Date.now() + 1000 * 60 * 60 * 8 })
    )}.signature`;
    localStorage.setItem(AUTH_TOKEN_KEY, fakeToken);
    return { token: fakeToken, user: { username: user.username, role: user.role, email: user.email } };
  }

  // Real endpoint: POST /auth/login -> { access_token, token_type, user }
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
  return { token: data.access_token, user: data.user };
}

export function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Dashboard data
// ---------------------------------------------------------------------------

export async function fetchBuilding() {
  if (USE_MOCK) {
    await delay(200);
    return BUILDING;
  }
  return request('/buildings/1');
}

export async function fetchPanel() {
  if (USE_MOCK) {
    await delay(200);
    return PANEL;
  }
  return request('/panels/FACP_001');
}

export async function fetchZones() {
  if (USE_MOCK) {
    await delay(300);
    return ZONES;
  }
  // Real endpoint should join zones + latest sensor_readings per zone
  return request('/panels/FACP_001/zones');
}

export async function fetchEvents() {
  if (USE_MOCK) {
    await delay(250);
    return EVENTS;
  }
  return request('/events?acknowledged=false');
}

export async function fetchSummary() {
  if (USE_MOCK) {
    await delay(150);
    return getSummary(ZONES);
  }
  return request('/panels/FACP_001/summary');
}

export async function acknowledgeEvent(eventId) {
  if (USE_MOCK) {
    await delay(200);
    return { id: eventId, is_acknowledged: true };
  }
  return request(`/events/${eventId}/acknowledge`, { method: 'POST' });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
