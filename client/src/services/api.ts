'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export interface Gift {
  id: number;
  name: string;
  description: string;
  [key: string]: any;
}

export interface SeekerNeed {
  id: number;
  user_id: number;
  gift_id: number;
  gift?: { name: string; icon?: string };
  description?: string;
  city?: string;
  neighborhood?: string;
  created_at_human?: string;
  messages_count?: number;
  status?: string;
  fulfilled_at?: string;
  fulfilled_by_id?: number;
  [key: string]: any;
}

// Alias for backward compatibility during migration
export type Need = SeekerNeed;

export interface KhatmaPin {
  id: number;
  user_id: number;
  user_name: string;
  city?: string;
  location: { lat: number; lng: number };
  glow_level: number;
  gifts: string[];
  total_impact?: number;
}

export interface KhatmaGift {
  id: number;
  khatma_id: number;
  user_id: number;
  gift_name: string;
  gift_icon?: string;
  user_name: string;
  city?: string;
  created_at?: string;
  messages_count?: number;
  status?: string;
  delivered_at?: string;
  delivered_to_id?: number;
}

// Alias for backward compatibility
export type RecentGift = KhatmaGift;

export interface ChatMessage {
  id: number;
  messageable_id: number;
  messageable_type: 'need' | 'gift';
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
  type?: 'need' | 'gift';
  item_id?: number | null;
  item_title?: string | null;
  // Legacy fields for compatibility
  need_id?: number | null;
  need_title?: string | null;
  participant_id?: number | null;
  read_at: string | null;
  created_at?: string;
  excerpt?: string | null;
}

export interface Review {
  id: number;
  reviewer_id: number;
  reviewee_id: number;
  reviewable_id: number;
  reviewable_type: string;
  rating: number;
  comment?: string;
  reviewer?: {
    id: number;
    name: string;
    display_name?: string;
  };
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
  email_verified: boolean;
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
  email?: string;
}

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

export const verifyWithCode = (email: string, code: string) =>
  fetchJson<{ message: string; verified: boolean; user?: User; token?: string }>('/verify-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, code }),
  });

export const resendVerificationCodePublic = (email: string) =>
  fetchJson<{ message: string }>('/resend-verification-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

export const requestPasswordReset = (email: string) =>
  fetchJson<{ message: string }>('/forgot-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

export const resetPassword = (email: string, token: string, password: string, password_confirmation: string) =>
  fetchJson<{ message: string }>('/reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, token, password, password_confirmation }),
  });

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

export const updateUserProfile = (payload: {
  name?: string;
  display_name?: string;
  bio?: string;
  city?: string;
  neighborhood?: string;
}) =>
  fetchJson<{ message: string; user: User }>('/user/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

export const logout = () =>
  fetchJson<{ message: string }>('/logout', { method: 'POST' });

export const logoutAll = () =>
  fetchJson<{ message: string }>('/logout-all', { method: 'POST' });

export const getGifts = () => fetchJson<Gift[]>('/gifts');
export const getSeekerNeeds = () => fetchJson<SeekerNeed[]>('/seeker-needs');
export const getSeekerNeed = (id: number) => fetchJson<SeekerNeed>(`/seeker-needs/${id}`);
export const getKhatmaGift = (id: number) => fetchJson<KhatmaGift>(`/khatma-gifts/${id}`);
export const getMapPins = () => fetchJson<KhatmaPin[]>('/map');
export const getRecentGifts = () => fetchJson<KhatmaGift[]>('/recent-gifts');
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

export const deleteKhatma = (id: number) =>
  fetchJson<{ message: string }>(`/admin/khatmas/${id}`, {
    method: 'DELETE',
  });

export const deleteSeekerNeed = (id: number) =>
  fetchJson<{ message: string }>(`/admin/needs/${id}`, {
    method: 'DELETE',
  });

export const deleteMySeekerNeed = (id: number) =>
  fetchJson<{ message: string }>(`/seeker-needs/${id}`, {
    method: 'DELETE',
  });

// Backward compatibility functions
export const getNeeds = getSeekerNeeds;
export const getNeed = getSeekerNeed;
export const getGiftService = getKhatmaGift;
export const deleteNeed = deleteSeekerNeed;
export const deleteMyNeed = deleteMySeekerNeed;

export const getChatThreads = () => fetchJson<any[]>('/chat/threads');

export const getMessages = (type: 'need' | 'gift', id: number, participantId?: number) => {
  const qs = new URLSearchParams();
  if (participantId) qs.set('participant', String(participantId));
  const query = qs.toString();
  return fetchJson<ChatMessage[]>(
    `/chat/${type}/${id}/messages${query ? `?${query}` : ''}`
  );
};

export const sendMessage = (
  type: 'need' | 'gift',
  id: number,
  body: string,
  participantId?: number
) =>
  fetchJson<ChatMessage>(`/chat/${type}/${id}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      participantId ? { body, participant_id: participantId } : { body }
    ),
  });

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

export const createSeekerNeed = (payload: {
  gift_id: number;
  description: string;
  city?: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
}) =>
  fetchJson<SeekerNeed>('/seeker-needs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

export const createNeed = createSeekerNeed;

// New endpoints for Rating & Review
export const markGiftDelivered = (id: number, deliveredToId: number) =>
  fetchJson<{ message: string; gift: KhatmaGift }>(`/khatma-gifts/${id}/delivered`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delivered_to_id: deliveredToId }),
  });

export const markNeedFulfilled = (id: number, fulfilledById: number) =>
  fetchJson<{ message: string; need: SeekerNeed }>(`/seeker-needs/${id}/fulfilled`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fulfilled_by_id: fulfilledById }),
  });

export const markNeedInProgress = (id: number) =>
  fetchJson<{ message: string; need: SeekerNeed }>(`/seeker-needs/${id}/in-progress`, {
    method: 'POST',
  });

export const submitReview = (payload: {
  reviewable_id: number;
  reviewable_type: 'gift' | 'need';
  rating: number;
  comment?: string;
}) =>
  fetchJson<{ message: string; review: Review }>('/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export const getUserReviews = (userId: number) =>
  fetchJson<{ reviews: Review[]; average_rating: number; total_reviews: number }>(`/users/${userId}/reviews`);

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
