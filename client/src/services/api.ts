'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export interface Gift {
  id: number;
  name: string;
  description: string;
  [key: string]: any;
}

export interface Need {
  id: number;
  gift?: { name: string; icon?: string };
  description?: string;
  city?: string;
  neighborhood?: string;
  created_at_human?: string;
  [key: string]: any;
}

export interface KhatmaPin {
  id: number;
  user_id: number;
  user_name: string;
  city?: string;
  location: { lat: number; lng: number };
  glow_level: number;
  services: string[];
  total_impact?: number;
}

export interface KhatmaProfile {
  id: number;
  user: { name: string; bio: string; city: string };
  completion_date?: string;
  impact_score?: number;
  achievements?: Array<Record<string, any>>;
  [key: string]: any;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'khatma' | 'seeker' | 'admin';
  city?: string;
  bio?: string;
  latitude?: number;
  longitude?: number;
  email_verified?: boolean;
  created_at?: string;
}

export interface AdminStats {
  total_users: number;
  total_khatmas: number;
  total_needs: number;
  total_gifts: number;
  active_khatmas: number;
  pending_needs: number;
  khatma_users: number;
  seeker_users: number;
  admin_users: number;
  total_impact_points: number;
}

export interface PaginatedUsers {
  data: User[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AuthResponse {
  user: User;
  message?: string;
}

// CSRF token bootstrap for cookie-based (stateful) auth.
// Cross-domain setup: the API's XSRF-TOKEN cookie belongs to the API domain and
// cannot be read by this app's JavaScript, so we fetch the token in the
// response body of GET /api/csrf-token and send it via the X-CSRF-TOKEN header.
let csrfToken: string | null = null;

async function ensureCsrfToken(): Promise<void> {
  if (csrfToken) return;
  const response = await fetch(`${API_BASE}/csrf-token`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch CSRF token (status ${response.status})`);
  }
  const data = await response.json();
  csrfToken = data.token;
}

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  headers.set('Accept', 'application/json');

  // For unsafe methods, ensure the CSRF token is present and attach the header.
  const method = (options?.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    await ensureCsrfToken();
    if (csrfToken) {
      headers.set('X-CSRF-TOKEN', csrfToken);
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include', // send/receive the session cookie
  });

  const text = await response.text();

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // If not JSON, it's likely an HTML error page from Laravel
      if (process.env.NODE_ENV === 'development') {
        console.error('Non-JSON error response:', text);
      }
    }
    const err = new Error(errorMessage) as Error & { status?: number };
    err.status = response.status;
    throw err;
  }

  try {
    return JSON.parse(text) as T;
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to parse JSON response:', text);
    }
    throw new Error('Received invalid response from server');
  }
}

export const login = (email: string, password: string) =>
  fetchJson<AuthResponse>('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

export const register = (payload: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
  city?: string;
  neighborhood?: string;
  lat?: number;
  lng?: number;
}) =>
  fetchJson<AuthResponse>('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

export const resendEmailVerification = () =>
  fetchJson<{ message: string }>('/email/resend', { method: 'POST' });

export const fetchUser = async () => {
  const res = await fetchJson<{ data: User }>('/user');
  return res.data;
};

export const logoutAll = () =>
  fetchJson<{ message: string }>('/logout-all', { method: 'POST' });

export const getGifts = () => fetchJson<Gift[]>('/gifts');
export const getNeeds = () => fetchJson<Need[]>('/needs');
export const getMapPins = () => fetchJson<KhatmaPin[]>('/map');
export const getKhatmaProfile = (id: number) => fetchJson<KhatmaProfile>(`/users/${id}/profile`);
export const getPublicProfile = (id: number) => fetchJson<KhatmaProfile>(`/users/${id}/public-profile`);
export const getUserKhatmas = () => fetchJson<{ khatmas: any[], total_impact_score: number }>('/khatmas');
export const getPublicStats = () => fetchJson<Record<string, any>>('/public-stats');
export const getAdminStats = () => fetchJson<AdminStats>('/stats');
export const getAdminUsers = (params?: { role?: string; search?: string; page?: number; per_page?: number }) => {
  const queryString = new URLSearchParams(params as any).toString();
  return fetchJson<PaginatedUsers>(`/admin/users${queryString ? `?${queryString}` : ''}`);
};
export const updateUserRole = (userId: number, role: string) =>
  fetchJson<{ message: string; user: User }>(`/admin/users/${userId}/role`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role }),
  });
export const deleteKhatma = (id: number) =>
  fetchJson<{ message: string }>(`/admin/khatmas/${id}`, {
    method: 'DELETE',
  });
export const deleteNeed = (id: number) =>
  fetchJson<{ message: string }>(`/admin/needs/${id}`, {
    method: 'DELETE',
  });
export const createUser = (payload: {
  name: string;
  email: string;
  password: string;
  role: string;
  city?: string;
}) =>
  fetchJson<{ message: string; user: User }>('/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

export const recordKhatma = (payload: {
  completion_date: string;
  type: string;
  gift_ids: number[];
}) =>
  fetchJson<{ khatma: KhatmaProfile }>('/khatmas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

export const createNeed = (payload: {
  gift_id: number;
  description: string;
  city?: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
}) =>
  fetchJson<Need>('/needs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

export const authUserKey = 'auth_user';

export const saveAuthUser = (user: User) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(authUserKey, JSON.stringify(user));
  }
};

export const clearAuthStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(authUserKey);
  }
};
