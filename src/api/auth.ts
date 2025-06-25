// src/api/auth.ts
import { API_BASE_URL } from '@env';

interface LoginResponse {
  profile?: any;
  organizer?: any;
  error?: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const text = await res.text();
  // try JSON.parse, otherwise throw
  let data: LoginResponse;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error('Invalid server response');
  }

  if (!res.ok) {
    throw new Error(data.error || 'Login failed');
  }
  return data;
}

export async function signup(payload: any): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Sign up failed');
  }
}
