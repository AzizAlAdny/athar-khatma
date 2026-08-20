/**
 * WebRTC Audio Service
 * Manages peer connection, SDP offer/answer exchange, ICE candidates, and local/remote audio streams.
 */

export interface WebRTCCallbacks {
  onIceCandidate: (candidate: RTCIceCandidateInit) => void;
  onRemoteStream: (stream: MediaStream) => void;
  onConnectionStateChange: (state: RTCPeerConnectionState) => void;
  onAudioVolumeChange?: (volume: number) => void;
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private pendingIceCandidates: RTCIceCandidateInit[] = [];
  private callbacks: WebRTCCallbacks | null = null;
  private audioContext: AudioContext | null = null;
  private volumeAnalyser: AnalyserNode | null = null;
  private volumeInterval: any = null;

  public async initialize(callbacks: WebRTCCallbacks): Promise<MediaStream> {
    this.callbacks = callbacks;
    this.cleanup();

    const rtcConfig: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    };

    this.peerConnection = new RTCPeerConnection(rtcConfig);

    // Acquire microphone audio stream (high quality for Tajweed & Quran recitation)
    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000
      },
      video: false
    });

    // Add local tracks to peer connection
    this.localStream.getTracks().forEach(track => {
      if (this.peerConnection && this.localStream) {
        this.peerConnection.addTrack(track, this.localStream);
      }
    });

    // ICE candidate handler
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.callbacks) {
        this.callbacks.onIceCandidate(event.candidate.toJSON());
      }
    };

    // Remote stream handler
    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        if (this.callbacks) {
          this.callbacks.onRemoteStream(this.remoteStream);
        }
        this.setupVolumeAnalyzer(this.remoteStream);
      }
    };

    // Connection state change
    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection && this.callbacks) {
        this.callbacks.onConnectionStateChange(this.peerConnection.connectionState);
      }
    };

    return this.localStream;
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

    const offer = JSON.parse(sdpOfferStr);
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    await this.flushPendingIceCandidates();

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return JSON.stringify(answer);
  }

  public async handleAnswer(sdpAnswerStr: string): Promise<void> {
    if (!this.peerConnection) return;
    const answer = JSON.parse(sdpAnswerStr);
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    await this.flushPendingIceCandidates();
  }

  public async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection || !this.peerConnection.remoteDescription) {
      // Queue candidate until remote description is set
      this.pendingIceCandidates.push(candidate);
      return;
    }

    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.error('Error adding ICE candidate:', e);
    }
  }

  private async flushPendingIceCandidates(): Promise<void> {
    if (!this.peerConnection || !this.peerConnection.remoteDescription) return;

    while (this.pendingIceCandidates.length > 0) {
      const candidate = this.pendingIceCandidates.shift();
      if (candidate) {
        try {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding flushed ICE candidate:', e);
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
    this.callbacks = null;
  }
}
