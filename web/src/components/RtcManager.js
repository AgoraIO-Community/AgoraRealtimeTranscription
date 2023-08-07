//
// RtcManager.js
// 2023.04.07
// by Hu Yuhua
//

import AgoraRTC from "agora-rtc-sdk-ng"
import rtmMgr from "./RtmManager.js"
import subtitleManager from "./SubtitleManager.js"
import { faL } from "@fortawesome/free-solid-svg-icons"

const VUE_APP_ID = process.env.VUE_APP_ID
class RtcManager {
  rtc = {
    localAudioTrack: null,
    client: null
  }
  rtmClient = null
  uid = 0
  username = ""
  delegate = null
  role = 1
  token = null
  allData = {}
  localAudioPublished = false
  rtcAppId = VUE_APP_ID

  // init
  constructor() {
    AgoraRTC.setLogLevel(4)
    // init the RTC Engine
    this.rtc.client = AgoraRTC.createClient({ mode: "live", codec: "vp8", role: this.role });
    // get random uid for rtc
    this.uid = this.randomUInt(100000, 999999)
    console.log('self uid ' + this.uid)
  }
  
  // join channel
  //  channel: channel Id
  //  channel: username(string, same as RTM user id)
  //  config: 3A config and role
  //  callback: join completion callback
  async join(channel, username, config, callback) {
    // set delegate handler
    this.rtc.client.on("user-published", this.onUserPublished)
    this.rtc.client.on("user-joined", this.onUserJoined)
    this.rtc.client.on("user-left", this.onUserLeft)
    this.rtc.client.on("stream-message", this.onStreamMessage)
    
    await this.joinRoom(channel, username, config, callback)
  }

  // join rtc channel
  //  channel: channel Id
  //  channel: username(string, same as RTM user id)
  //  config: 3A config and role
  //  callback: join completion callback
  async joinRoom(channel, username, config, callback) {
    const uid = await this.rtc.client.join(VUE_APP_ID, channel, this.token, this.uid)
    // this.hostList.unshift(uid)
    const userId = uid.toString()

    //this.userList.unshift({ uid: userId, name: username, online: false });

    this.allData[userId] = {
      src: require('../../img/avatar' + userId.toString().slice(-1) + '.png'),
      name: username
    }

    let track = await AgoraRTC.createMicrophoneAudioTrack({
      AEC: config.AEC,
      AGC: config.AGC,
      ANS: config.ANS,
    })
    this.rtc.localAudioTrack = track

    if (config.role == 'host' && !this.localAudioPublished) {
      try {
        await this.rtc.client.setClientRole("host")
        await this.rtc.client.unpublish()
        await this.rtc.client.publish([this.rtc.localAudioTrack])
        this.localAudioPublished = true
        callback(true, uid)
      } catch(e) {
        callback(false, -999)
      }
    }
  }

  // leave rtc channel
  async leave() {
    this.rtc.localAudioTrack.close()
    await this.rtc.client.leave()
    this.localAudioPublished = false
    this.uid = 0
    this.username = ""
  }

  // get random uint for uid
  randomUInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  // handler functions
  // on user publish audio/video
  async onUserPublished(user, mediaType) {
    let res = await this.rtc.client.subscribe(user, mediaType);
    let userId = user.uid.toString();
    if (mediaType === "audio") {
      const remoteAudioTrack = user.audioTrack;
      remoteAudioTrack.play();
    }
    this.rtc.client.on("user-unpublished", async (user) => {
      await this.rtc.client.unsubscribe(user);
    });
  }

  // on host user joined rtc channel
  async onUserJoined(user) {
    console.log(user)
    if (![1000, 2000, this.uid].includes(user.uid)) {
      this.hostList.push(user.uid);
      const channelAttributes = await this.rtmClient.getChannelAttributes(this.options.channel);
      console.log('user join ' + user.uid)
      if (channelAttributes[user.uid]) {
        this.userList.push({ uid: user.uid, name: channelAttributes[user.uid].value, online: false })
        this.allData[user.uid] = {
          src: require('../../img/avatar' + user.uid.toString().slice(-1) + '.png'),
          name: channelAttributes[user.uid].value
        }
      }
    }
  }

  // on host user leave rtc channel
  async onUserLeft(user, reason) {
    if (rtcMgr.allData[user.uid] != undefined) {
      delete rtcMgr.allData[user.uid];
      rtcMgr.userList.splice(rtcMgr.hostList.indexOf(user.uid), 1);
      rtcMgr.hostList.splice(rtcMgr.hostList.indexOf(user.uid), 1);
    }
  }

  // on stream data recived, (the speech to text result come here)
  async onStreamMessage(uid, stream) {
    subtitleManager.praseData(stream, (success, subtitle) => {
      // console.log(subtitle)
      rtcMgr.delegate.updataSubtitleUI(subtitle)
    })
  }
}

// export instance
let rtcMgr = new RtcManager()
export default rtcMgr

// EOF
