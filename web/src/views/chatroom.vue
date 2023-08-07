<template>
  <div>
    <div class="fs24 mobile">
      <div class="room-view">
        <div class="room-title">Channel: {{ roomConfig.channelName }}</div>
        <div class="room-info">Stt Lanaguage(s): {{ roomConfig.cultures }}</div>
        <div class="room-info">Translate {{ roomConfig.translateSource }} to {{ roomConfig.translateTarget }}</div>
        <div class="room-subtitle" ref="subtitleArea">
          <SubtitleCell v-for="(subtitle, index) in subtitles" :subtitle="subtitle" :key="index"/>
        </div>
      </div>
    </div>
    <div class="buttonList">
      <el-button v-if="sttStarted" icon="el-icon-microphone"
        style="width:auto;background:#cb4c38;font-size:30px;border:#cb4c38;" circle @click="stopStt" size="mini"
        type="primary" title="Stop Transcription" :loading="loading" />
      <el-button v-else icon="el-icon-turn-off-microphone"
        style="width:auto;font-size:30px;" circle @click="startStt" size="mini" 
        :disabled="!rtcJoined" type="primary" title="Start Transcription" :loading="loading" />
      <el-button size="mini" v-show="true" :disabled="!rtcJoined" type="primary" plain @click="leaveRoom">Leave Room</el-button>
      <!-- <el-button size="mini" v-show="false" :disabled="!rtcJoined" type="primary" plain @click="fanl" v-if="sttStarted">load transcription</el-button> -->
      <!-- <el-button size="mini" v-show="false" :disabled="!rtcJoined" type="primary" plain @click="noFanl" v-if="sttStarted">load close caption</el-button> -->
      <el-button size="mini" v-show="true" :disabled="!rtcJoined" type="primary" plain @click="showFullText">Full Transcription</el-button>
      <el-button size="mini" v-show="true" :disabled="!rtcJoined" type="primary" plain @click="showConversation">Conversation</el-button>
      <!-- <el-button size="mini" v-show="false" type="primary" plain @click="queryFanl" :disabled="!taskId">Query status</el-button> -->
    </div>
    <!-- Full Transcription -->
    <el-drawer title="Full Transcription" :visible.sync="displayFullText">
      <div class="conversation-area">
        {{ fullText }}
      </div>
    </el-drawer>
    <!-- Conversation -->
    <el-drawer title="Conversation" :visible.sync="displayConversation">
      <div class="conversation-area">
        <div v-for='(item, idx) in subtitles' :key="idx">
          <div v-if="item.text" class="subtitle-cell">
            <div class="user-name">{{ rtcMgr.allData[item.uid].name }} ({{ item.uid }}) {{ item.time != 0 ? new Date(parseInt(item.time)).toLocaleString() : 'N/A' }} </div>
            <div class="subtitle-text">{{ item.text }}</div>
            <div class="translation-text">{{ item.translation[0] }}</div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script type="js">
import { faTurkishLiraSign } from '@fortawesome/free-solid-svg-icons';
import SubtitleCell from './SubtitleCell.vue'
import roomConfig from "@/components/RoomConfig.js";
import { async, ninvoke } from "q";
import router from '@/router';
import { logger } from 'agora-rte-extension';
import rtcMgr from "@/components/RtcManager.js"           // Agora RTC manager class
import rtmMgr from "@/components/RtmManager.js"           // Agora RTM manager class
import sttApiManager from "@/components/STTApiManager.js" // STT manager class js
import subtitleManager from '@/components/SubtitleManager'
export default {
  name: 'chatroom',
  components: {
    SubtitleCell,
  },
  data() {
    return {
      rtc: {
        localAudioTrack: null,
        client: null,
      },
      loading: true,
      rtcJoined: false,
      rtmJoined: false,
      sttStarted: false,
      sttTokenName: '',
      taskId: '',
      subtitles: [],
      userList: [],
      hostList: [],
      roomConfig: roomConfig,
      displayFullText: false,
      fullTranslation: '',
      displayConversation: false,
      rtcMgr: rtcMgr
    }
  },
  computed: {
    fullText: function() {
      let full = ''
      this.subtitles.forEach((sub, index) => {
        full += '(' + sub.uid + ')' + sub.text
      })
      return full
    }
  },
  created: function() {
    // join channel
    rtmMgr.delegate = this
    rtcMgr.delegate = this
  },
  mounted: function() {
    console.log(roomConfig)
    window.addEventListener('beforeunload', e => this.unloadHandler(e))
    window.addEventListener('unload', function(event) {
        console.log('unload')
        this.leaveRoom()
        // 加一段同步代码阻塞一下，不然刷新会发不出去异步请求
        let now = new Date()
        while (new Date() - now < 100) { }
    })
    if (roomConfig.channelName == '') {
      router.push('/')
      return
    }
    this.startRtcCall()
  },
  beforeDestroy() {
    console.log('chatroom destory.')
    this.leaveRoom()
    window.removeEventListener('beforeunload', e => this.unloadHandler(e))
  },
  methods: {
    // STT
    startStt: function() {
      console.log('start Stt button clicked')
      this.loading = true
      this.subtitles = []

      // save channel 
      if (sttApiManager.channel != this.roomConfig.channelName) {
        sttApiManager.tokenName = ""
        sttApiManager.channel = this.roomConfig.channelName
      }
      let self = this
      // start rtt
      if (sttApiManager.isOverdue()) {
        // acquire token and start
        console.log('Start STT in channel ' + this.roomConfig.channelName)
        sttApiManager.acquire(this.roomConfig.channelName, (success, tokenName) => {
          self.sttTokenName = tokenName
          sttApiManager.start(this.roomConfig.channelName, this.roomConfig.cultures, this.roomConfig.translateSource, this.roomConfig.translateTarget, (success, taskIdorErrorMessage) => {
            self.updateUI(success, taskIdorErrorMessage)
          })
        })
      }
      else {
        // use token to start
        sttApiManager.start(this.roomConfig.channelName, this.roomConfig.cultures, this.roomConfig.translateSource, this.roomConfig.translateTarget, (success, taskIdorErrorMessage) => {
          self.updateUI(success, taskIdorErrorMessage)
        })
      }
      return
    },
    stopStt: function() {
      console.log('stop Stt button clicked')
      this.loading = true
      sttApiManager.stop(this.taskId, this.sttTokenName, (result, message) => {
        if ( result ) {
          this.updateUI(false, '')
        }
        this.loading = false
      })
    },
    // Query button handler (not used now)
    async queryStt() {
      sttApiManager.query(this.taskId, this.sttTokenName, (success, taskId, state) => {
        console.log("Query task")
      })
      return
    },
    clearSttManager() {
      sttApiManager.clearSttData()
    },
    onSubtitleCallback: function(subtitle) {
      console.log(subtitle)
    },
    // join channel
    async startRtcCall() {
      var self = this
      // rtm init
      rtmMgr.delegate = self
      rtmMgr.login(this.roomConfig.userName, (loginSuccess) => {
        if (loginSuccess) {
          console.log("Rtm login success, start joining " + this.roomConfig.channel)
          rtmMgr.join(this.roomConfig.channelName, (success) => {
            if ( success ) {
              console.log("[ChatRoom View] Rtm join channel success.")
              self.rtmJoined = true
            } else {
              console.log("[ChatRoom View] RTM join failed");
              self.loading = false
              return
            }
          })
        }
        else {
          console.log("[ChatRoom View] RTM login failed");
          self.loading = false
        }
      })
      // rtc init
      rtcMgr.delegate = self
      const config = {
        AEC: this.roomConfig.AEC,
        AGC: this.roomConfig.AGC,
        ANS: this.roomConfig.ANS,
        role: this.roomConfig.role
      }
      rtcMgr.join(self.roomConfig.channelName, rtcMgr.uid, config, (success, uid) => {
        if ( success ) {
          console.log("[ChatRoom View] rtc join successed, uid: " + uid)
          self.loading = false
          self.rtcJoined = true
          const userId = uid.toString()
          self.userList.unshift({ uid: userId, name: self.roomConfig.userName, online: false });
          // console.log(self.userList)
          rtcMgr.allData[userId] = {
            src: require('../../img/avatar' + userId.toString().slice(-1) + '.png'),
            name: self.roomConfig.userName
          }
          // console.log(rtcMgr.allData)
        }
      })
      return
    },
    // rtc delegate function
    
    // rtm delegate function
    async rtmMemberLeft() {
      if (this.uid && this.roomConfig.channelName) {
        await this.rtmClient.deleteChannelAttributesByKeys(this.roomConfig.channelName, [this.uid.toString()]);
      }
    },
    async rtmMessageFromPeer(message, peerId) {
      if (message.text === "STT started") {
        this.peerStartedSTT = true;
        this.start = true;
      }
      else {
        this.peerStartedSTT = false;
        this.start = false;
        if(this.tokenName){
          this.stopFanl()
        }
      }
    },
    rtmMemberJoined(isSttStarted){
      console.log("[View] rtmMemberJoined" + isSttStarted)
      this.sendStartSTTNotificationToPeers(isSttStarted)
    },

    // Update UI after start
    updateUI(started, taskIdOrMeesage) {
      if ( started ) {
        this.sttStarted = started;
        this.loading = false;
        this.taskId = taskIdOrMeesage;
        this.sendStartSTTNotificationToPeers(true);
        // auto stop in 10 mins
        this.createSttAutoStopTimer(() => {
          if (this.taskId) {
            console.log(new Date())
            this.stopFanl()
          }
        }, 600000)
      } else {
        this.sttStarted = false;
        this.loading = false;
        this.$message.error(taskIdOrMeesage ? taskIdOrMeesage : 'network anomaly')
      }
    },
    async sendStartSTTNotificationToPeers(hasStarted) {
      console.log("[View] sendStartSTTNotificationToPeers")
      this.peerStartedSTT = hasStarted;
      rtmMgr.getMembers().then((memberNames) => {
        console.log("members in the channel are " + memberNames);
        memberNames.forEach(async (member)=> {
          if (this.roomConfig.userName != member) {
            await this.rtmClient.sendMessageToPeer({
              text: hasStarted ? "STT started" : "STT stopped"
            },
              member,
            ).then(
              console.log("message has been sent")
            ).catch((error) => {
              console.log("error while sending message", error);
            });
          }
        })
      })
    },
    // leave room
    async leaveRoom() {
      if (rtcMgr.rtc.localAudioTrack) {
        rtcMgr.leave()
      }
      if (sttApiManager.taskId != null && sttApiManager.taskId != "") {
        this.stopStt()
      }
      rtmMgr.leave(this.roomConfig.channelName)
      subtitleManager.clear()
      this.uid = ''
      this.sttStarted = false
      this.rtcJoined = false
      this.rtmJoined = false
      this.sttTokenName = ''
      this.taskId = ''
      this.subtitles = []
      // back to login
      router.push('/')
    },
    // subtitle functions
    // Updata subtitle UI
    updataSubtitleUI(subtitle) {
      if (subtitle == null) {
        return
      }
      // console.log(subtitle)
      this.subtitles = subtitleManager.subtitleList
      // console.log(this.subtitles)
      let subtitleArea = this.$refs.subtitleArea
      subtitleArea.scrollTo(0, subtitleArea.scrollHeight)
      this.$forceUpdate()
      return
    },
    // full text
    showFullText() {
      this.displayFullText = true
    },
    // conversation
    showConversation() {
      this.displayConversation = true
    },
    // timer
    createSttAutoStopTimer(callback, time) {
      this.autoStopTimer = this.create(`function (e) {
        setInterval(function () {
          this.postMessage(null)
        }, ${time})
      }`);
      this.autoStopTimer.onmessage = callback
    },
    create(f) {
      var blob = new Blob(['(' + f + ')()']);
      var url = window.URL.createObjectURL(blob);
      var worker = new Worker(url);
      return worker;
    },
    //
    async unloadHandler(e) {
      //if (.taskId && this.tokenName) {
      //await this.leaveRoom();

      console.log('aaaa')
      // event.preventDefault();
      var confirmationMessage = "Are you sure you want to leave?";
      (e || window.event).returnValue = confirmationMessage; // 兼容 Gecko + IE
      return confirmationMessage; // 兼容 Gecko + Webkit, Safari, Chrome
    },
  }
}
</script>

<style scoped lang="scss">
@import '../theme/subtitle.scss';
.room-view {
  width: 100%;
  flex-flow: column;
  flex-direction: column;
  margin-top: 200px;
  height: 90%;
  box-sizing: border-box;
}
.room-title {
  display: inline-block;
  text-align: left;
  width: 100%;
  font-size: 1.0rem;
  font-weight: 500;
  color: #363636;
  padding: 0rem 1rem 0rem 1rem;
  box-sizing: border-box;
}
.room-info {
  display: inline-block;
  text-align: left;
  padding: 0rem 1rem 0rem 1rem;
  width: 100%;
  font-size: 0.9rem;
  color: #565656;
  box-sizing: border-box;
}
.room-subtitle {
  display: inline-block;
  text-align: left;
  padding: 1rem 1rem 0rem 1rem;
  width: 100%;
  height: 80%;
  margin-bottom: 0px;
  overflow: auto;
  box-sizing: border-box;
}
.conversation-area {
  padding: 0rem 1rem 0rem 1rem;
  text-align: left;
}
</style>
