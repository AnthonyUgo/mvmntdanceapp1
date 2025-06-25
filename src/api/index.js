// src/api/index.js
import { API_BASE_URL } from '@env';       // if you use react-native-dotenv
// —– or —–
// const API_BASE_URL = process.env.API_BASE_URL;  // for web bundlers

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API Error ${res.status}: ${res.statusText}`);
  return res.json();
}

export function fetchEvents() {
  return request('/api/events');
}

export function fetchUserByEmail(email) {
  return request(`/api/users/get?email=${encodeURIComponent(email)}`);
}

// add more wrappers here…
