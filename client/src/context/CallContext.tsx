import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { audioToneService } from '../services/audioToneService';
import { WebRTCService } from '../services/webrtcService';
import { API_BASE } from '../services/api';
import { getEcho } from '../services/echo';
import { useAuth } from './AuthContext';

export interface CallData {
  id: number;
  caller_id: number;
  receiver_id: number;
  caller_name: string;
  receiver_name: string;
  other_user_name: string;
  callable_id: number;
  callable_type: 'need' | 'gift';
  status: 'ringing' | 'connected' | 'rejected' | 'missed' | 'cancelled' | 'busy' | 'ended' | 'failed';
  sdp_offer?: string;
  sdp_answer?: string;
  caller_ice_candidates?: any[];
  receiver_ice_candidates?: any[];
  started_at?: string;
  ended_at?: string;
  duration_seconds?: number;
  formatted_duration?: string;
  is_caller: boolean;
}

export type CallStatus = 'IDLE' | 'OUTGOING_RINGING' | 'INCOMING_RINGING' | 'CONNECTING' | 'CONNECTED' | 'ENDED' | 'BUSY';

interface CallContextType {
  call: CallData | null;
  status: CallStatus;
  isMuted: boolean;
  durationSeconds: number;
  audioVolume: number;
  error: string | null;
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
  startCall: (receiverId: number, receiverName: string, contextType: 'need' | 'gift', contextId: number) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => void;
  clearError: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [call, setCall] = useState<CallData | null>(null);
  const [status, setStatus] = useState<CallStatus>('IDLE');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [audioVolume, setAudioVolume] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const webrtcRef = useRef<WebRTCService | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const pollIntervalRef = useRef<any>(null);
  const processedCandidatesCount = useRef<number>(0);
  const statusRef = useRef<CallStatus>('IDLE');
  const isPollingRef = useRef<boolean>(false);
  const activeCallIdRef = useRef<number | null>(null);
  const pendingLocalCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  };

  // Send one local ICE candidate to the backend signaling endpoint
  const sendIceCandidate = useCallback((callId: number, candidate: RTCIceCandidateInit) => {
    const token = getToken();
    if (!token) return;
    fetch(`${API_BASE}/calls/${callId}/signal`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ candidate })
    }).catch((e) => {
      console.warn('Failed to send ICE candidate:', e);
    });
  }, []);

  // Queue local ICE candidates until the call id is known, then send them directly.
  // (ICE gathering starts while /calls/initiate is still in flight, so `call`
  // state is not available yet inside the callback closure.)
  const emitOrQueueIceCandidate = useCallback((candidate: RTCIceCandidateInit) => {
    if (activeCallIdRef.current) {
      sendIceCandidate(activeCallIdRef.current, candidate);
    } else {
      pendingLocalCandidatesRef.current.push(candidate);
    }
  }, [sendIceCandidate]);

  // Stop tones & reset state
  const resetCallState = useCallback((endReasonStatus?: CallStatus) => {
    audioToneService.stopAllTones();
    activeCallIdRef.current = null;
    pendingLocalCandidatesRef.current = [];
    if (webrtcRef.current) {
      webrtcRef.current.cleanup();
      webrtcRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (endReasonStatus) {
      setStatus(endReasonStatus);
      setTimeout(() => {
        setStatus('IDLE');
        setCall(null);
        setDurationSeconds(0);
        setIsMuted(false);
        setAudioVolume(0);
        processedCandidatesCount.current = 0;
      }, 3000);
    } else {
      setStatus('IDLE');
      setCall(null);
      setDurationSeconds(0);
      setIsMuted(false);
      setAudioVolume(0);
      processedCandidatesCount.current = 0;
    }
  }, []);

  // Keep a ref in sync with status so async callbacks (intervals & WebSocket
  // listeners) always read the latest value instead of stale closure state
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Real-time WebSocket listener for incoming calls & signaling
  useEffect(() => {
    if (!user?.id) return;
    const echo = getEcho();
    if (!echo) return;

    const channelName = `call.${user.id}`;
    const channel = echo.private(channelName);

    channel.listen('.call.signaled', async (data: { action: string; payload: any }) => {
      const { action, payload } = data;

      if (action === 'incoming_call') {
        if (statusRef.current === 'IDLE') {
          statusRef.current = 'INCOMING_RINGING';
          setCall(payload);
          setStatus('INCOMING_RINGING');
          audioToneService.playIncomingRingtone();
        }
      } else if (action === 'call_answered') {
        if (statusRef.current === 'OUTGOING_RINGING' && payload?.sdp_answer) {
          // Flip status immediately (before the async work) so the HTTP polling
          // fallback cannot race and apply the same answer twice
          statusRef.current = 'CONNECTING';
          setStatus('CONNECTING');
          audioToneService.playConnectedTone();
          if (webrtcRef.current) {
            await webrtcRef.current.handleAnswer(payload.sdp_answer);
            statusRef.current = 'CONNECTED';
            setStatus('CONNECTED');
          }
        }
      } else if (action === 'call_rejected') {
        audioToneService.playEndTone();
        resetCallState('BUSY');
      } else if (action === 'ice_candidate') {
        // Guard against candidates from a different/stale call session
        if (payload?.candidate && webrtcRef.current && payload.call_id === activeCallIdRef.current) {
          await webrtcRef.current.addIceCandidate(payload.candidate);
        }
      } else if (action === 'call_ended') {
        audioToneService.playEndTone();
        resetCallState('ENDED');
      }
    });

    return () => {
      channel.stopListening('.call.signaled');
      echo.leave(channelName);
    };
  }, [user?.id, status, resetCallState]);

  // Background fallback poll for incoming calls when IDLE
  useEffect(() => {
    const checkActiveCall = async () => {
      if (status !== 'IDLE') return;
      const token = getToken();
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/calls/active`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (!res.ok) return;
        const data = await res.json();

        if (data.call && status === 'IDLE') {
          setCall(data.call);
          if (!data.call.is_caller && data.call.status === 'ringing') {
            setStatus('INCOMING_RINGING');
            audioToneService.playIncomingRingtone();
          }
        }
      } catch (e) {
        // Silently fail active call polling
      }
    };

    const interval = setInterval(checkActiveCall, 8000);
    return () => clearInterval(interval);
  }, [status]);

  // Handle live duration timer
  useEffect(() => {
    if (status === 'CONNECTED') {
      timerIntervalRef.current = setInterval(() => {
        setDurationSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status]);

  // Warn user before leaving page during active call
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (status === 'CONNECTED' || status === 'OUTGOING_RINGING' || status === 'CONNECTING') {
        e.preventDefault();
        e.returnValue = 'لديك مكالمة نشطة حالياً. هل أنت تأكد من مغادرة الصفحة؟';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [status]);

  // Poll active call signaling data
  useEffect(() => {
    if (!call?.id || status === 'IDLE' || status === 'ENDED') return;

    const pollCallData = async () => {
      // Skip this tick if the previous poll request is still in flight
      if (isPollingRef.current) return;
      const token = getToken();
      if (!token) return;

      isPollingRef.current = true;
      try {
        const res = await fetch(`${API_BASE}/calls/${call.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (!res.ok) return;
        const data = await res.json();
        const updatedCall: CallData = data.call;

        if (!updatedCall) return;

        setCall(updatedCall);

        // Remote user rejected/ended/busy/cancelled
        if (['rejected', 'missed', 'cancelled', 'ended', 'failed', 'busy'].includes(updatedCall.status)) {
          audioToneService.playEndTone();
          resetCallState('ENDED');
          return;
        }

        // Caller detects receiver accepted call
        if (updatedCall.is_caller && updatedCall.status === 'connected' && updatedCall.sdp_answer && statusRef.current === 'OUTGOING_RINGING') {
          // Flip status immediately (before the async work) so a concurrent
          // WebSocket event or poll tick cannot apply the same answer twice
          statusRef.current = 'CONNECTING';
          setStatus('CONNECTING');
          audioToneService.playConnectedTone();
          if (webrtcRef.current) {
            await webrtcRef.current.handleAnswer(updatedCall.sdp_answer);
            statusRef.current = 'CONNECTED';
            setStatus('CONNECTED');
          }
        }

        // Process remote ICE candidates
        const remoteCandidates = updatedCall.is_caller
          ? updatedCall.receiver_ice_candidates
          : updatedCall.caller_ice_candidates;

        if (remoteCandidates && remoteCandidates.length > processedCandidatesCount.current && webrtcRef.current) {
          const newCandidates = remoteCandidates.slice(processedCandidatesCount.current);
          for (const cand of newCandidates) {
            await webrtcRef.current.addIceCandidate(cand);
          }
          processedCandidatesCount.current = remoteCandidates.length;
        }
      } catch (e) {
        console.error('Call polling error:', e);
      } finally {
        isPollingRef.current = false;
      }
    };

    pollIntervalRef.current = setInterval(pollCallData, 2000);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [call?.id, status, resetCallState]);

  // Start outgoing call
  const startCall = async (receiverId: number, receiverName: string, contextType: 'need' | 'gift', contextId: number) => {
    try {
      setError(null);
      const token = getToken();
      if (!token) throw new Error('يرجى تسجيل الدخول أولاً');

      setStatus('OUTGOING_RINGING');
      audioToneService.playRingbackTone();

      const webrtc = new WebRTCService();
      webrtcRef.current = webrtc;

      await webrtc.initialize({
        onIceCandidate: (candidate) => {
          emitOrQueueIceCandidate(candidate);
        },
        onRemoteStream: (stream) => {
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = stream;
            remoteAudioRef.current.play().catch(() => { });
          }
        },
        onConnectionStateChange: (state) => {
          if (state === 'connected') setStatus('CONNECTED');
          // "disconnected" is often transient and recovers on its own — only hang up on "failed"
          if (state === 'failed') {
            endCall();
          }
        },
        onAudioVolumeChange: (vol) => setAudioVolume(vol)
      });

      const sdpOffer = await webrtc.createOffer();

      const res = await fetch(`${API_BASE}/calls/initiate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          receiver_id: receiverId,
          context_type: contextType,
          context_id: contextId,
          sdp_offer: sdpOffer
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'فشل إجراء المكالمة');
      }

      // Call id is now known — flush ICE candidates gathered during initiation
      activeCallIdRef.current = data.call.id;
      const pendingCandidates = pendingLocalCandidatesRef.current;
      pendingLocalCandidatesRef.current = [];
      pendingCandidates.forEach((cand) => sendIceCandidate(data.call.id, cand));

      setCall(data.call);
    } catch (e: any) {
      audioToneService.playEndTone();
      setError(e.message || 'حدث خطأ أثناء إجراء المكالمة');
      resetCallState();
    }
  };

  // Accept incoming call
  const acceptCall = async () => {
    if (!call) return;
    try {
      setError(null);
      audioToneService.stopAllTones();
      setStatus('CONNECTING');
      const token = getToken();
      activeCallIdRef.current = call.id;

      const webrtc = new WebRTCService();
      webrtcRef.current = webrtc;

      await webrtc.initialize({
        onIceCandidate: (candidate) => {
          emitOrQueueIceCandidate(candidate);
        },
        onRemoteStream: (stream) => {
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = stream;
            remoteAudioRef.current.play().catch(() => { });
          }
        },
        onConnectionStateChange: (state) => {
          if (state === 'connected') setStatus('CONNECTED');
          // "disconnected" is often transient and recovers on its own — only hang up on "failed"
          if (state === 'failed') {
            endCall();
          }
        },
        onAudioVolumeChange: (vol) => setAudioVolume(vol)
      });

      const sdpAnswer = await webrtc.handleOfferAndCreateAnswer(call.sdp_offer || '{}');

      const res = await fetch(`${API_BASE}/calls/${call.id}/respond`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'accept',
          sdp_answer: sdpAnswer
        })
      });

      if (!res.ok) throw new Error('فشل الرد على المكالمة');

      const data = await res.json();
      setCall(data.call);
      setStatus('CONNECTED');
      audioToneService.playConnectedTone();
    } catch (e: any) {
      audioToneService.playEndTone();
      setError(e.message || 'حدث خطأ أثناء الرد');
      resetCallState();
    }
  };

  // Reject incoming call
  const rejectCall = async () => {
    if (!call) return;
    try {
      const token = getToken();
      await fetch(`${API_BASE}/calls/${call.id}/respond`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ action: 'reject' })
      });
    } catch (e) { }
    audioToneService.playEndTone();
    resetCallState('ENDED');
  };

  // End active call
  const endCall = async () => {
    // Use the ref so this works even from stale closures (e.g. connection state changes)
    const callId = activeCallIdRef.current ?? call?.id;
    if (!callId) return;
    try {
      const token = getToken();
      await fetch(`${API_BASE}/calls/${callId}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
    } catch (e) { }
    audioToneService.playEndTone();
    resetCallState('ENDED');
  };

  // Toggle microphone mute
  const toggleMute = () => {
    if (webrtcRef.current) {
      const muted = webrtcRef.current.toggleMute();
      setIsMuted(muted);
    }
  };

  const clearError = () => setError(null);

  return (
    <CallContext.Provider
      value={{
        call,
        status,
        isMuted,
        durationSeconds,
        audioVolume,
        error,
        remoteAudioRef,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        clearError
      }}
    >
      {children}
      <audio ref={remoteAudioRef} autoPlay playsInline />
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};
