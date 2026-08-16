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

export interface RecentGift {
  gift_name: string;
  user_name: string;
  city?: string;
  created_at?: string;
}

export interface ChatMessage {
  id: number;
  need_id: number;
  participant_id: number;
  sender_id: number;
  sender_name?: string;
  body: string;
  created_at?: string;
}

export interface ApiNotification {
  id: string;
  kind: 'new_message' | 'new_participant';
  sender_name?: string | null;
  need_id?: number | null;
  participant_id?: number | null;
  need_title?: string | null;
  excerpt?: string | null;
  read_at: string | null;
  created_at?: string;
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
  display_name?: string | null;
  email: string;
  role: 'khatma' | 'seeker' | 'admin';
  neighborhood?: string;
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
  token?: string;
  message?: string;
}

// Token-based (Bearer) auth. Cross-domain cookie auth is not viable here:
// browsers block third-party cookies, so the API's session/XSRF cookies are
// never stored by this app. Auth happens via a Sanctum personal access token
// returned by /login and /register, persisted here, and sent as a Bearer header.
export const authTokenKey = 'auth_token';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(authTokenKey);
}

export const saveAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(authTokenKey, token);
  }
};

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  headers.set('Accept', 'application/json');

  // Attach the bearer token when present (stateless API — no cookies needed).
  const token = getStoredToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
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
  display_name?: string;
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

// Complete email verification from the signed link params carried on the
// frontend verify page URL (id, hash, expires, signature).
export const verifyEmailLink = (
  id: string,
  hash: string,
  expires: string,
  signature: string
) => {
  const qs = new URLSearchParams({ expires, signature }).toString();
  return fetchJson<{ message: string; verified: boolean }>(
    `/email/verify/${encodeURIComponent(id)}/${encodeURIComponent(hash)}?${qs}`
  );
};

export const fetchUser = async () => {
  const res = await fetchJson<{ data: User }>('/user');
  return res.data;
};

export const logout = () =>
  fetchJson<{ message: string }>('/logout', { method: 'POST' });

export const logoutAll = () =>
  fetchJson<{ message: string }>('/logout-all', { method: 'POST' });

export const getGifts = () => fetchJson<Gift[]>('/gifts');
export const getNeeds = () => fetchJson<Need[]>('/needs');
export const getMapPins = () => fetchJson<KhatmaPin[]>('/map');
export const getRecentGifts = () => fetchJson<RecentGift[]>('/recent-khatmas');
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
// Seeker deleting their own need (ownership enforced server-side).
export const deleteMyNeed = (id: number) =>
  fetchJson<{ message: string }>(`/needs/${id}`, {
    method: 'DELETE',
  });

// Chat: a thread is keyed by (need_id, participant_id). The need owner loads a
// thread for a specific participant; a khatma always sees only her own thread.
export const getMessages = (needId: number, participantId?: number) => {
  const qs = new URLSearchParams();
  if (participantId) qs.set('participant', String(participantId));
  const query = qs.toString();
  return fetchJson<ChatMessage[]>(
    `/needs/${needId}/messages${query ? `?${query}` : ''}`
  );
};

export const sendMessage = (
  needId: number,
  body: string,
  participantId?: number
) =>
  fetchJson<ChatMessage>(`/needs/${needId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      participantId ? { body, participant_id: participantId } : { body }
    ),
  });

// In-app notifications (header bell). The bell polls the unread count while
// the dropdown lists the latest notifications on open.
export const getNotifications = () =>
  fetchJson<ApiNotification[]>('/notifications');
export const getUnreadNotificationCount = () =>
  fetchJson<{ unread: number }>('/notifications/unread-count');
export const markNotificationRead = (id: string) =>
  fetchJson<{ status: string }>(`/notifications/${id}/read`, {
    method: 'POST',
  });
export const markAllNotificationsRead = () =>
  fetchJson<{ status: string }>('/notifications/read-all', {
    method: 'POST',
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
  type?: string;
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
    localStorage.removeItem(authTokenKey);
  }
};
