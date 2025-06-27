// src/api/index.ts
import { API_BASE_URL } from '@env';

/**
 * Generic request helper
 */
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  console.log(`📡 API request to ${url}`);
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

/** Authentication */
export function login(email: string, password: string) {
  return request<{ token: string; profile: any }>(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }
  );
}

export function forgotPassword(email: string) {
  return request<{ message: string }>(
    '/api/auth/forgot-password',
    {
      method: 'POST',
      body: JSON.stringify({ email }),
    }
  );
}

/** Users */
export function getUserByEmail(email: string) {
  return request<{ user: any }>(`/api/users/get?email=${encodeURIComponent(email)}`);
}

export function updateProfileImage(username: string, imageUri: string) {
  return request<{ message: string }>(
    '/api/users/profile-image',
    {
      method: 'POST',
      body: JSON.stringify({ username, imageUri }),
    }
  );
}

/** Events */
export function getPublicEvents(city?: string): Promise<{ events: any[] }> {
  const qs = city
    ? `?city=${encodeURIComponent(city)}`
    : '';
  return request<{ events: any[] }>(`/api/events${qs}`);
}

export function getEventsForOrganizer(organizerId: string, draft = false) {
  return request<any[]>(`/api/events?organizerId=${organizerId}&draft=${draft}`);
}

export function createEvent(payload: any) {
  return request<{ message: string; event: any }>(
    '/api/events',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export function uploadEventImage(eventId: string, file: Blob) {
  const form = new FormData();
  form.append('eventId', eventId);
  form.append('image', file);
  return fetch(`${API_BASE_URL}/api/events/upload-image`, {
    method: 'POST',
    body: form,
  }).then(res => res.json());
}

export function updateEvent(eventId: string, data: any) {
  return request<{ message: string }>(
    `/api/events/${eventId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
}

export function deleteEvent(id: string, organizerId: string) {
  return request<{ message: string }>(
    `/api/events/${id}?organizerId=${organizerId}`,
    { method: 'DELETE' }
  );
}

export function getEventById(id: string, organizerId: string) {
  return request<any>(
    `/api/events/${id}?organizerId=${organizerId}`
  );
}


export function saveEvent(email: string, eventId: string) {
  return request<{ message: string }>('/api/events/saved', {
    method: 'POST',
    body: JSON.stringify({ email, eventId }),
  });
}

export function getSavedEvents(email: string) {
  return request<{ events: any[] }>('/api/events/saved', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function getTicketedEvents(email: string) {
  return request<{ events: any[] }>('/api/events/tickets', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}