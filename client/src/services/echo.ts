'use client';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { API_BASE, getStoredToken } from './api';

// Set Pusher globally for Laravel Echo
if (typeof window !== 'undefined') {
  (window as any).Pusher = Pusher;
}

let echoInstance: Echo<any> | null = null;

export const getEcho = (): Echo<any> | null => {
  if (typeof window === 'undefined') return null;

  const token = getStoredToken();
  const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY || 'local-key';
  const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || 'mt1';
  const pusherHost = process.env.NEXT_PUBLIC_PUSHER_HOST || window.location.hostname;
  const pusherPort = Number(process.env.NEXT_PUBLIC_PUSHER_PORT || (window.location.protocol === 'https:' ? 443 : 8000));
  const isTls = process.env.NEXT_PUBLIC_PUSHER_SCHEME === 'https' || window.location.protocol === 'https:';

  if (!echoInstance) {
    try {
      echoInstance = new Echo({
        broadcaster: 'pusher',
        key: pusherKey,
        cluster: pusherCluster,
        wsHost: pusherHost,
        wsPort: pusherPort,
        wssPort: pusherPort,
        forceTLS: isTls,
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${API_BASE}/broadcasting/auth`,
        auth: {
          headers: {
            get Authorization() {
              const currentToken = getStoredToken();
              return currentToken ? `Bearer ${currentToken}` : '';
            },
            Accept: 'application/json',
          },
        },
      });
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to initialize Laravel Echo, falling back to polling:', err);
      }
      return null;
    }
  }

  return echoInstance;
};

export const resetEcho = () => {
  if (echoInstance) {
    try {
      echoInstance.disconnect();
    } catch {
      // Ignore disconnect errors
    }
    echoInstance = null;
  }
};
