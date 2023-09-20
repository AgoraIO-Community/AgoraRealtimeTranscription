//
// RtmManager.js
// 2023.04.07
// by Hu Yuhua
//

import AgoraRTM from "agora-rtm-sdk";

const VUE_APP_ID = process.env.VUE_APP_ID
class RtmManager {
  rtmClient = null
  delegate = null

  uid = null
  joined = false

  // init
  constructor() {
    this.rtmClient = AgoraRTM.createInstance(VUE_APP_ID, { enableLogUpload: false });
  }

  // rtm login
  async login(username, callback) {
    const rtmOptions = {}
    rtmOptions.uid = username
    rtmOptions.token = null

    console.log(rtmOptions)
    await this.rtmClient.login(rtmOptions).then(() => {
      console.log("[RTM Mgr]RTM login success")
      this.joined = true;
      callback(true)
    }).catch(error => {
      console.log("[RTM Mgr]RTM login failed")
      callback(false)
    })
  }

  // rtm join channel
  async join(channel, callback) {
    this.rtmClient.on('MessageFromPeer', async (text, peerId) => {
      this.rtmMessageFromPeer(text, peerId)
    });

    const rtmChannel = await this.rtmClient.createChannel(channel);
    this.rtmChannel = rtmChannel;
    await this.rtmChannel.join().then(() => {
      console.log("[RTM Mgr]RTM channel join success");
      callback(true)
    }).catch(error => {
      console.log("[RTM Mgr]RTM channel join failed")
      callback(false)
    });

    rtmChannel.on('MemberJoined', () => {
      this.rtmMemberJoined()
    });
  }

  // leave channel
  async leave(channel) {
    console.log('rtm joined:' + this.joined + ', logout. uid:' + this.uid)
    if ( this.joined ) {
      await this.rtmClient.deleteChannelAttributesByKeys(channel, [rtmMgr.uid])
      await this.rtmChannel.leave()
      await this.rtmClient.logout()
    }
  }

  // get rtm member list
  getMembers() {
    if ( this.rtmChannel ) {
      return this.rtmChannel.getMembers()
    }
  }

  // delegate functions
  // get rtm message from peer
  rtmMessageFromPeer(text, peerId) {
    if ( delegate != null ) {
      this.delegate.rtmMessageFromPeer(text, peerId)
    }
  }

  // rtm user joined callback
  rtmMemberJoined() {
    if ( delegate != null ) {
      this.delegate.rtmMemberJoined(this.start)
    }
  }
}

// export instance
let rtmMgr = new RtmManager()
export default rtmMgr

// EOF
