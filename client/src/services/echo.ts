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

  const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
  // If no Pusher key is configured, return null gracefully so components use fallback polling
  if (!pusherKey) return null;

  const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || 'mt1';
  const customHost = process.env.NEXT_PUBLIC_PUSHER_HOST;
  const customPort = process.env.NEXT_PUBLIC_PUSHER_PORT ? Number(process.env.NEXT_PUBLIC_PUSHER_PORT) : undefined;
  const isTls = process.env.NEXT_PUBLIC_PUSHER_SCHEME !== 'http';

  if (!echoInstance) {
    try {
      const options: Record<string, any> = {
        broadcaster: 'pusher',
        key: pusherKey,
        cluster: pusherCluster,
        forceTLS: isTls,
        disableStats: true,
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
      };

      // Only configure custom wsHost if explicitly provided (e.g. self-hosted Laravel Reverb or Soketi)
      // Otherwise, Pusher.com connects directly to official cloud servers (e.g. wss://ws-eu.pusher.com)
      if (customHost) {
        options.wsHost = customHost;
        options.wsPort = customPort || (isTls ? 443 : 80);
        options.wssPort = customPort || 443;
        options.enabledTransports = ['ws', 'wss'];
      }

      echoInstance = new Echo(options);
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
