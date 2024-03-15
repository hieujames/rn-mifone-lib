/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import JsSIP from '../lib/JsSIP';
import WebRTCSupported from './WebRTCSupported';
import {mediaDevices, MediaStream, RTCView} from 'react-native-webrtc';
import {Call} from '../lib/Call';

// Tạo websocket
const socket = new JsSIP.WebSocketInterface(
  'wss://sipproxy01-2020.mipbx.vn:4533/wss',
);

const voiceonly = false;
const calls = new Map();

const buttons = [
  {label: 'Speaker', color: '#3498db'},
  {label: 'Micro', color: '#e74c3c'},
  {label: 'Hold', color: '#2ecc71'},
  {label: 'Numpad', color: '#f39c12'},
  {label: 'Transfer', color: '#9b59b6'},
  {label: 'Add', color: '#FF5722'},
];

export class Root extends Component {
  constructor(props) {
    super(props);
    this.r2Ref = React.createRef();
    this.ua = new JsSIP.UA({
      sockets: [socket],
      authorization_user: '9998',
      uri: 'sip:9998@pbx57.mipbx.vn',
      password: 'de9b0b1abbe00540547adeca14bcdc23', //de9b0b1abbe00540547adeca14bcdc23 msTrinh123#$2021
      extension: '9998',
      domain: 'pbx57.mipbx.vn',
      display_name: '9998',
      user_agent: '9998',
      extra_headers: [
        {
          Origin: 'https://sipproxy01-2020.mipbx.vn',
          Host: 'sipproxy01-2020.mipbx.vn:4533',
        },
      ],
    });
    this.callState = new Call();
    this.state = {
      stream: null,
      phoneNumber: null,
    };
  }

  eventHandlers = {
    progress: function (data) {
      console.log('Config progress:' + JSON.stringify(data));
    },
    failed: function (data) {
      console.log('Config failed:' + JSON.stringify(data));
    },
    confirmed: function (data) {
      console.log('Config confirmed:' + JSON.stringify(data));
    },
    ended: function (data) {
      console.log('Config ended:' + JSON.stringify(data));
    },
  };

  defaultOptions = {
    eventHandlers: this.eventHandlers,
    extraHeaders: [],
    pcConfig: {
      sdpSemantics: 'unified-plan',
      iceServers: {url: 'stun:stun.l.google.com:19302'},
    },
    mediaConstraints: {
      audio: true,
      earlyMedia: true,
      video: false,
    },
    rtcOfferConstraints: {
      mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: !voiceonly,
      },
      optional: [],
    },
    rtcAnswerConstraints: {
      mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: !voiceonly,
      },
      optional: [],
    },
    rtcConstraints: {
      mandatory: {},
      optional: [
        {
          DtlsSrtpKeyAgreement: true,
          ipv6: false,
        },
      ],
    },
    sessionTimersExpires: 10800,
  };

  configure = async () => {
    this.ua.on('registered', function (e) {
      console.log('Config Register:' + JSON.stringify(e));
    });
    this.ua.on('unregistered', function (e) {
      console.log('Config UnRegistered:' + JSON.stringify(e));
    });
    this.ua.on('registrationFailed', function (e) {
      console.log('Config RegisteredFailed:' + JSON.stringify(e));
    });

    this.ua.start();
  };

  handleCallButton = async () => {
    let mediaConstraints = {
      audio: true,
    };

    try {
      console.log('BUTTON');
      const stream = await mediaDevices.getUserMedia(mediaConstraints);
      stream.getTracks().forEach(tracks => {
        tracks._setVolume(true);
      });

      this.call(
        `sip:${this.state.phoneNumber}@pbx57.mipbx.vn`,
        voiceonly,
        stream,
      );
    } catch (error) {
      console.log('[MEDIA STREAM] ERROR:  ' + error);
    }
  };

  handlePress(buttonLabel) {
    console.log(`Button ${buttonLabel} was pressed!`);
    switch (buttonLabel) {
      case 'Speaker':
        console.log('Speaker');
        this.ua.speaker(true, false);
        break;
      case 'Micro':
        console.log('Micro');
        this.ua.mute(true, false);
        break;
      case 'Hold':
        console.log('Hold');
        this.callState.hold();
        break;
      case 'Numpad':
        console.log('Numpad');
        break;
      case 'Transfer':
        console.log('Transfer');
        this.ua.transfer(`sip:${this.state.phoneNumber}@pbx57.mipbx.vn`);
        break;
      default:
        break;
    }
  }

  call(
    target,
    {
      voiceonly = false,
      mediaStream = null,
      headers = null,
      customOptions = null,
    } = {},
  ) {
    if (this.ua !== null && this.ua.isConnected()) {
      let options = this.defaultOptions;
      console.log('[MEDIA] Default Option::  ' + JSON.stringify(options));
      if (customOptions !== null) {
        options = {...options, ...customOptions};
      }

      if (mediaStream !== null) {
        options['mediaStream'] = mediaStream;
        options['earlyMedia'] = true;
      }

      let extHeaders = options['extraHeaders'] || [];

      if (headers !== null) {
        extHeaders = extHeaders.concat(headers);
      }
      options['extraHeaders'] = extHeaders;

      this.ua.call(target, options);
      return true;
    } else {
      console.error('Not connected, you will need to register.');
    }
    return false;
  }

  componentDidMount = () => {
    this.configure();
  };

  handleInputChange = text => {
    this.setState({
      phoneNumber: text,
    });
  };

  render() {
    return (
      <View style={{flex: 1, justifyContent: 'center'}}>
        <Text
          style={{
            fontSize: 20,
            justifyContent: 'center',
            alignSelf: 'center',
            color: 'black',
          }}>
          TEST WEBRTC REACT NATIVE
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập số điện thoại"
          keyboardType="phone-pad"
          onChangeText={this.handleInputChange}
          value={this.state.phoneNumber}
        />
        {this.ua.isConnected ? (
          <Text
            style={{color: 'green', paddingVertical: 20, alignSelf: 'center'}}>
            Connected
          </Text>
        ) : (
          <Text
            style={{color: 'red', paddingVertical: 20, alignSelf: 'center'}}>
            Disconnected
          </Text>
        )}
        <View style={styles.circleContainer}>
          {buttons.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.button, {backgroundColor: button.color}]}
              onPress={() => {
                this.handlePress(button.label);
              }}>
              <Text style={styles.buttonText}>{button.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={{
            width: 120,
            height: 50,
            borderRadius: 30,
            marginTop: 20,
            marginVertical: 10,
            backgroundColor: 'green',
            justifyContent: 'center',
            alignSelf: 'center',
          }}
          onPress={this.handleCallButton}>
          <Text
            style={{
              padding: 5,
              justifyContent: 'center',
              color: 'white',
              alignSelf: 'center',
              fontSize: 14,
              fontWeight: '500',
            }}>
            Make Call
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: 80,
            height: 80,
            borderRadius: 50,
            marginTop: 20,
            marginVertical: 10,
            backgroundColor: 'red',
            justifyContent: 'center',
            alignSelf: 'center',
          }}
          onPress={() => {
            this.ua.hangup({status_code: 603});
          }}>
          <Text
            style={{
              padding: 5,
              justifyContent: 'center',
              color: 'white',
              alignSelf: 'center',
              fontSize: 12,
              fontWeight: '700',
            }}>
            Hang Up
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  circleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 16,
  },
  button: {
    width: 55,
    height: 55,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    marginTop: 20,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    width: '80%',
    alignSelf: 'center',
  },
});
