/**
 * WebRTC Audio Service
 * Manages peer connection, SDP offer/answer exchange, ICE candidates, and local/remote audio streams.
 */

export interface WebRTCCallbacks {
  onIceCandidate: (candidate: RTCIceCandidateInit) => void;
  onRemoteStream: (stream: MediaStream) => void;
  onConnectionStateChange: (state: RTCPeerConnectionState) => void;
  onIceConnectionStateChange?: (state: RTCIceConnectionState) => void;
  onAudioVolumeChange?: (volume: number) => void;
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private pendingIceCandidates: RTCIceCandidateInit[] = [];
  private seenCandidates = new Set<string>(); // dedup across WebSocket + HTTP poll delivery
  private callbacks: WebRTCCallbacks | null = null;
  private audioContext: AudioContext | null = null;
  private volumeAnalyser: AnalyserNode | null = null;
  private volumeInterval: any = null;

  /** Returns the current ICE connection state, or null if not yet initialized. */
  public getIceConnectionState(): RTCIceConnectionState | null {
    return this.peerConnection?.iceConnectionState ?? null;
  }

  /** Returns the current high-level peer connection state, or null if not yet initialized. */
  public getPeerConnectionState(): RTCPeerConnectionState | null {
    return this.peerConnection?.connectionState ?? null;
  }


  public async initialize(callbacks: WebRTCCallbacks): Promise<MediaStream> {
    this.callbacks = callbacks;
    this.cleanup();

    const rtcConfig: RTCConfiguration = {
      iceServers: this.buildIceServers()
    };
    console.log('[WebRTC] Initializing PeerConnection with ICE servers:', rtcConfig.iceServers);

    this.peerConnection = new RTCPeerConnection(rtcConfig);

    // Acquire microphone audio stream (high quality for Tajweed & Quran recitation).
    // Note: sampleRate is intentionally omitted — specifying a hard value (e.g. 48000)
    // causes OverconstrainedError on devices that do not support that exact rate,
    // silently preventing the call from starting on some Android / iOS hardware.
    // The browser always picks the best available rate automatically.
    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false
    });

    // Add local tracks to peer connection
    this.localStream.getTracks().forEach(track => {
      if (this.peerConnection && this.localStream) {
        this.peerConnection.addTrack(track, this.localStream);
      }
    });

    // Diagnostics: confirm the mic track is live and capturing
    const micTrack = this.localStream.getAudioTracks()[0];
    if (micTrack) {
      console.log('[WebRTC] Local mic track:', {
        label: micTrack.label,
        enabled: micTrack.enabled,
        muted: micTrack.muted,
        readyState: micTrack.readyState
      });
      if (micTrack.muted) {
        console.warn('[WebRTC] Mic track is muted at the source — the device is not delivering audio (OS-level mute or another app holds the mic)');
      }
    } else {
      console.error('[WebRTC] No audio track in local stream!');
    }

    // Log signaling state changes
    this.peerConnection.onsignalingstatechange = () => {
      if (!this.peerConnection) return;
      console.log('[WebRTC] Signaling state:', this.peerConnection.signalingState);
    };

    // Log ICE gathering state changes
    this.peerConnection.onicegatheringstatechange = () => {
      if (!this.peerConnection) return;
      console.log('[WebRTC] ICE gathering state:', this.peerConnection.iceGatheringState);
    };

    // ICE candidate handler
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.callbacks) {
        console.log('[WebRTC] Local ICE candidate gathered:', event.candidate.candidate?.slice(0, 60));
        this.callbacks.onIceCandidate(event.candidate.toJSON());
      } else if (!event.candidate) {
        console.log('[WebRTC] Local ICE gathering completed.');
      }
    };

    // Remote stream handler
    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        const track = event.track;
        console.log('[WebRTC] Remote track received:', {
          kind: track.kind,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState
        });
        track.onunmute = () => console.log('[WebRTC] 🔊 Remote track unmuted — audio frames are arriving!');
        track.onmute = () => console.warn('[WebRTC] 🔇 Remote track muted — waiting for audio frames from peer');
        if (this.callbacks) {
          this.callbacks.onRemoteStream(this.remoteStream);
        }
        this.setupVolumeAnalyzer(this.remoteStream);
      }
    };

    // ICE connection state change
    this.peerConnection.oniceconnectionstatechange = () => {
      if (!this.peerConnection) return;
      const iceState = this.peerConnection.iceConnectionState;
      console.log('[WebRTC] ICE connection state:', iceState);

      if (iceState === 'connected' || iceState === 'completed') {
        this.startMediaFlowDiagnostics();
        if (this.callbacks) {
          this.callbacks.onConnectionStateChange('connected');
        }
      }

      if (iceState === 'failed') {
        if (this.callbacks) {
          this.callbacks.onConnectionStateChange('failed');
        }
      }

      if (this.callbacks && this.callbacks.onIceConnectionStateChange) {
        this.callbacks.onIceConnectionStateChange(iceState);
      }
    };

    // Connection state change
    this.peerConnection.onconnectionstatechange = () => {
      if (!this.peerConnection) return;
      console.log('[WebRTC] Connection state:', this.peerConnection.connectionState);
      if (this.peerConnection.connectionState === 'connected') {
        this.startMediaFlowDiagnostics();
      }
      if (this.callbacks) {
        this.callbacks.onConnectionStateChange(this.peerConnection.connectionState);
      }
    };

    return this.localStream;
  }

  /**
   * Diagnostics: while connected, sample RTC stats every 3 s and log whether
   * audio bytes are actually flowing in each direction.
   */
  private statsInterval: any = null;
  private lastInboundBytes = 0;
  private lastOutboundBytes = 0;

  private startMediaFlowDiagnostics(): void {
    if (this.statsInterval) return;
    this.lastInboundBytes = 0;
    this.lastOutboundBytes = 0;
    let ticks = 0;
    this.statsInterval = setInterval(async () => {
      if (!this.peerConnection || (this.peerConnection.connectionState !== 'connected' && this.peerConnection.iceConnectionState !== 'connected' && this.peerConnection.iceConnectionState !== 'completed') || ++ticks > 20) {
        if (this.statsInterval) { clearInterval(this.statsInterval); this.statsInterval = null; }
        return;
      }
      try {
        const stats = await this.peerConnection.getStats();
        stats.forEach((report) => {
          if (report.type === 'inbound-rtp' && (report as any).kind === 'audio') {
            const bytes = (report as any).bytesReceived ?? 0;
            const growing = bytes > this.lastInboundBytes;
            console.log(`[WebRTC] Inbound audio: ${bytes} bytes received ${growing ? '✅ (media arriving)' : '❌ (NOT growing)'}`);
            this.lastInboundBytes = bytes;
          }
          if (report.type === 'outbound-rtp' && (report as any).kind === 'audio') {
            const bytes = (report as any).bytesSent ?? 0;
            const growing = bytes > this.lastOutboundBytes;
            console.log(`[WebRTC] Outbound audio: ${bytes} bytes sent ${growing ? '✅ (mic transmitting)' : '❌ (NOT growing)'}`);
            this.lastOutboundBytes = bytes;
          }
        });
      } catch (e) {
        console.warn('[WebRTC] stats sample failed:', e);
      }
    }, 3000);
  }

  /**
   * Build the ICE servers list with fast, high-availability STUN and Metered TURN relays.
   */
  private buildIceServers(): RTCIceServer[] {
    const iceServers: RTCIceServer[] = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun.cloudflare.com:3478' }
    ];

    const turnUrl = process.env.NEXT_PUBLIC_TURN_URL;
    const turnUsername = process.env.NEXT_PUBLIC_TURN_USERNAME || '';
    const turnCredential = process.env.NEXT_PUBLIC_TURN_CREDENTIAL || '';

    if (turnUrl) {
      const rawUrls = turnUrl.split(',').map(u => u.trim()).filter(Boolean);
      const stunUrls = rawUrls.filter(u => u.startsWith('stun:'));
      const turnUrls = rawUrls.filter(u => u.startsWith('turn:') || u.startsWith('turns:'));

      if (stunUrls.length > 0) {
        iceServers.push({ urls: stunUrls });
      }

      if (turnUrls.length > 0) {
        iceServers.push({
          urls: turnUrls,
          username: turnUsername,
          credential: turnCredential
        });
      }
    }

    return iceServers;
  }

  public async createOffer(): Promise<string> {
    if (!this.peerConnection) throw new Error('PeerConnection not initialized');

    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true
    });
    await this.peerConnection.setLocalDescription(offer);
    return JSON.stringify(offer);
  }

  public async handleOfferAndCreateAnswer(sdpOfferStr: string): Promise<string> {
    if (!this.peerConnection) throw new Error('PeerConnection not initialized');

    // Offer already answered (double-accept race) — reuse the existing local description
    if (this.peerConnection.signalingState === 'stable' && this.peerConnection.localDescription) {
      return JSON.stringify(this.peerConnection.localDescription);
    }
    // An offer can only be applied while the connection is in the "stable" state
    if (this.peerConnection.signalingState !== 'stable') {
      throw new Error('Cannot apply SDP offer: connection is not in stable state');
    }

    const offer = JSON.parse(sdpOfferStr);
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    // Flush pending ICE candidates now that BOTH remote and local descriptions are established
    await this.flushPendingIceCandidates();

    return JSON.stringify(answer);
  }

  public async handleAnswer(sdpAnswerStr: string): Promise<void> {
    if (!this.peerConnection) return;
    // A remote answer may only be applied while in "have-local-offer" state.
    // If the connection is already "stable", the answer was applied earlier
    // (e.g. duplicate delivery via WebSocket + HTTP polling) — skip it instead
    // of throwing InvalidStateError.
    if (this.peerConnection.signalingState !== 'have-local-offer') return;
    const answer = JSON.parse(sdpAnswerStr);
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    await this.flushPendingIceCandidates();
  }

  public async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!candidate || !candidate.candidate) return; // skip empty / end-of-candidates entries

    const key = candidate.candidate;
    if (this.seenCandidates.has(key)) return;
    this.seenCandidates.add(key);

    if (!this.peerConnection || !this.peerConnection.remoteDescription) {
      console.log('[WebRTC] Buffering ICE candidate until remote description is set:', key.slice(0, 50));
      this.pendingIceCandidates.push(candidate);
      return;
    }

    try {
      console.log('[WebRTC] Adding remote ICE candidate:', key.slice(0, 50));
      await this.peerConnection.addIceCandidate(candidate);
    } catch (e) {
      console.warn('[WebRTC] Error adding ICE candidate:', e, candidate);
    }
  }

  private async flushPendingIceCandidates(): Promise<void> {
    if (!this.peerConnection || !this.peerConnection.remoteDescription) return;

    if (this.pendingIceCandidates.length > 0) {
      console.log(`[WebRTC] Flushing ${this.pendingIceCandidates.length} buffered ICE candidates`);
    }

    while (this.pendingIceCandidates.length > 0) {
      const candidate = this.pendingIceCandidates.shift();
      if (candidate) {
        try {
          await this.peerConnection.addIceCandidate(candidate);
        } catch (e) {
          console.warn('[WebRTC] Error adding flushed ICE candidate:', e);
        }
      }
    }
  }

  public toggleMute(): boolean {
    if (!this.localStream) return false;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return !audioTrack.enabled; // returns isMuted
    }
    return false;
  }

  private setupVolumeAnalyzer(stream: MediaStream): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.volumeAnalyser = this.audioContext.createAnalyser();
      this.volumeAnalyser.fftSize = 64;
      source.connect(this.volumeAnalyser);

      const dataArray = new Uint8Array(this.volumeAnalyser.frequencyBinCount);

      if (this.volumeInterval) clearInterval(this.volumeInterval);
      this.volumeInterval = setInterval(() => {
        if (!this.volumeAnalyser || !this.callbacks?.onAudioVolumeChange) return;
        this.volumeAnalyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        this.callbacks.onAudioVolumeChange(Math.min(100, Math.round((average / 128) * 100)));
      }, 100);
    } catch (e) {
      console.warn('Volume analyzer setup skipped:', e);
    }
  }

  public cleanup(): void {
    if (this.volumeInterval) {
      clearInterval(this.volumeInterval);
      this.volumeInterval = null;
    }

    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }

    this.remoteStream = null;
    this.pendingIceCandidates = [];
    this.seenCandidates.clear();
    this.callbacks = null;
  }
}
