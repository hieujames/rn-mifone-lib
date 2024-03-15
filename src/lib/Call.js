const CallStateEnum = {
  NONE: 0,
  STREAM: 1,
  UNMUTED: 2,
  MUTED: 3,
  CONNECTING: 4,
  PROGRESS: 5,
  FAILED: 6,
  ENDED: 7,
  ACCEPTED: 8,
  CONFIRMED: 9,
  REFER: 10,
  HOLD: 11,
  UNHOLD: 12,
  CALL_INITIATION: 13,
};

export class Call {
  constructor(id, session, state) {
    this._id = id;
    this._session = session;
    this.state = state;
  }

  get id() {
    return this._id;
  }

  get peerConnection() {
    return this._session.connection;
  }

  get session() {
    return this._session;
  }

  answer(options, {mediaStream = null}) {
    if (this._session === null) {
      throw new Error('ERROR(answer): rtc session is invalid!');
    }
    if (mediaStream !== null) {
      options.mediaStream = mediaStream;
    }
    this._session.answer(options);
  }

  refer(target) {
    if (this._session === null) {
      throw new Error('ERROR(refer): rtc session is invalid!');
    }
    const refer = this._session.refer(target);
    refer.on('referTrying', data => {});
    refer.on('referProgress', data => {});
    refer.on('referAccepted', data => {
      this._session.terminate();
    });
    refer.on('referFailed', data => {});
  }

  hangup(options) {
    if (this._session === null) {
      throw new Error('ERROR(hangup): rtc session is invalid!');
    }
    this._session.terminate(options);
  }

  hold() {
    if (this._session === null) {
      throw new Error('ERROR(hold): rtc session is invalid!');
    }
    this._session.hold();
  }

  unhold() {
    if (this._session === null) {
      throw new Error('ERROR(unhold): rtc session is invalid!');
    }
    this._session.unhold();
  }

  mute(audio = true, video = true) {
    if (this._session === null) {
      throw new Error('ERROR(mute): rtc session is invalid!');
    }
    this._session.mute(audio, video);
  }

  unmute(audio = true, video = true) {
    if (this._session === null) {
      throw new Error('ERROR(unmute): rtc session is invalid!');
    }
    this._session.unmute(audio, video);
  }

  renegotiate(options) {
    if (this._session === null) {
      throw new Error('ERROR(renegotiate): rtc session is invalid!');
    }
    this._session.renegotiate(options);
  }

  sendDTMF(tones, options) {
    if (this._session === null) {
      throw new Error('ERROR(sendDTMF): rtc session is invalid!');
    }
    this._session.sendDTMF(tones, options);
  }

  sendInfo(contentType, body, options) {
    if (this._session === null) {
      throw new Error('ERROR(sendInfo): rtc session is invalid');
    }
    this._session.sendInfo(contentType, body, options);
  }

  get remote_display_name() {
    if (this._session === null) {
      throw new Error('ERROR(get remote_identity): rtc session is invalid!');
    }
    if (
      this._session.remote_identity !== null &&
      this._session.remote_identity.display_name !== null
    ) {
      return this._session.remote_identity.display_name;
    }
    return '';
  }

  get remote_identity() {
    if (this._session === null) {
      throw new Error('ERROR(get remote_identity): rtc session is invalid!');
    }
    if (
      this._session.remote_identity !== null &&
      this._session.remote_identity.uri !== null &&
      this._session.remote_identity.uri.user !== null
    ) {
      return this._session.remote_identity.uri.user;
    }
    return '';
  }

  get local_identity() {
    if (this._session === null) {
      throw new Error('ERROR(get local_identity): rtc session is invalid!');
    }
    if (
      this._session.local_identity !== null &&
      this._session.local_identity.uri !== null &&
      this._session.local_identity.uri.user !== null
    ) {
      return this._session.local_identity.uri.user;
    }
    return '';
  }

  get direction() {
    if (this._session === null) {
      throw new Error('ERROR(get direction): rtc session is invalid!');
    }
    if (this._session.direction !== null) {
      return this._session.direction.toUpperCase();
    }
    return '';
  }

  get remote_has_audio() {
    return this._peerHasMediaLine('audio');
  }

  get remote_has_video() {
    return this._peerHasMediaLine('video');
  }

  _peerHasMediaLine(media) {
    if (this._session === null) {
      throw new Error('ERROR(_peerHasMediaLine): rtc session is invalid!');
    }
    if (this._session.request === null) {
      return false;
    }
    let peerHasMediaLine = false;
    const sdp = this._session.request.parseSDP();
    if (!Array.isArray(sdp.media)) {
      sdp.media = [sdp.media];
    }
    for (const m of sdp.media) {
      if (media === 'audio' && m.type === 'audio') {
        peerHasMediaLine = true;
      }
      if (media === 'video' && m.type === 'video') {
        peerHasMediaLine = true;
      }
    }
    return peerHasMediaLine;
  }

  getStats(track) {
    return this.peerConnection?.getStats(track);
  }
}

class CallState {
  constructor(state, {originator, audio, video, stream, cause, refer}) {
    this.state = state;
    this.originator = originator;
    this.audio = audio;
    this.video = video;
    this.stream = stream;
    this.cause = cause;
    this.refer = refer;
  }
}
