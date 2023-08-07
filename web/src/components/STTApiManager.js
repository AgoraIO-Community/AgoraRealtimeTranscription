//
// STTApiManager.js
// 2023.03.30
// by Hu Yuhua
//

import axios from 'axios'

const VUE_APP_ID = process.env.VUE_APP_ID
const STT_BASE_PATH = process.env.VUE_APP_BASE_PATH
const API_AUTH_KEY = process.env.VUE_APP_API_AUTH_KEY
const API_AUTH_SECRET = process.env.VUE_APP_API_AUTH_SECRET

class STTApiManager {
  // properties
  appId = ""
  channel = ""
  tokenName = ""
  taskId = ""
  createTs = 0
  started = false


  basicAuthentication() {
    var token = API_AUTH_KEY + ':' + API_AUTH_SECRET
    var hash = Buffer.from(token).toString('base64')
    return 'Basic ' + hash
  }

  // acquire STT token
  acquire(channel, callback) {
    console.log("STTApiManager: acquire")

    axios.post(`${STT_BASE_PATH}/v1/projects/${VUE_APP_ID}/rtsc/speech-to-text/builderTokens`, {
      instanceId: channel
    }, {
      headers: { 
        'content-type': 'application/json',
        'Authorization': this.basicAuthentication()
      }
    }).then((res) => {
      if (res.status == 200) {
        //console.log(res)
        this.tokenName = res.data.tokenName;
        //this.createTs = res.data.createTs;
        callback(true, this.tokenName)
      } else {
        callback(false, '网络异常')
      }
    }).catch(error => {
      callback(false, error.response.data.message ? error.response.data.message : '网络异常')
    })
  }

  // start STT task
  async start(channel, languages, translateSource, translateTarget, callback) {
    // log, delete before release
    //console.log("STTApiManager: start， in channel " + channel + ", language: " + languages)
    //console.log("TokenName is " + this.tokenName)
    axios.post(`${STT_BASE_PATH}/v1/projects/${VUE_APP_ID}/rtsc/speech-to-text/tasks?builderToken=${this.tokenName}`, {
      "audio": {
        "subscribeSource": "AGORARTC",
        "agoraRtcConfig": {
          "channelName": channel,
          "uid": '1000',
          "token": '', // 可选
          "channelType": 'LIVE_TYPE',
          "subscribeConfig": {
            "subscribeMode": "CHANNEL_MODE"
          },
          "maxIdleTime": 60
        }
      },
      "config": {
        "features": [
          "RECOGNIZE"
        ],
        "recognizeConfig": {
          "language": languages,
          "model": "Model",
          "connectionTimeout": 60,
          "output": {
            "destinations": [
              "AgoraRTCDataStream"
            ],
            "agoraRTCDataStream": {
              "channelName": channel,
              "uid": '2000',
              "token": '' // 可选
            }
          }
        },
        "translateConfig": {
          "languages":[{
              "source": translateSource,
              "target":[translateTarget]
          }]
        }
      }
    }, {
      headers: { 
        'content-type': 'application/json',
        'Authorization': this.basicAuthentication()
      }
    }).then((res) => {
      if (res.status == 200) {
        this.taskId = res.data.taskId;
        callback(true, this.taskId)
      } else {
        callback(false, 'network anomaly')
      }
    }).catch(error => {
      console.log(error)
      callback(false, error.response.data.message ? error.response.data.message : 'network anomaly')
    })
  }
  
  // query the STT task
  query(taskId, tokenName, callback) {
    console.log("STTApiManager: query")
  }
  
  // stop STT task
  async stop(taskId, tokenName, callback) {
    //console.log("STTApiManager: stop, taskId: " + this.taskId)
    //console.log("TokenName is " + this.tokenName)

    if (!this.taskId || this.taskId.length <= 0) {
      callback(false, 'There are currently no tasks');
      return
    }

    let self = this
    if ( self.tokenName && self.taskId ) {
      let res = await fetch(`${STT_BASE_PATH}/v1/projects/${VUE_APP_ID}/rtsc/speech-to-text/tasks/${self.taskId}?builderToken=${self.tokenName}`, {
        method: 'delete',
        keepalive: true,
        headers: {
          'content-type': 'application/json',
          'Authorization': this.basicAuthentication(),
        }
      })

      let data = await res.text();
      let datas = JSON.parse(data);

      //console.log(datas)
      if (!datas.message) {
        callback(true, "")
        self.clearSttData()
      } else {
        callback(false, data.message)
      }
    } else {
      this.loading = false
    }
  }

  // Is token over due
  isOverdue() {
    return (!this.tokenName || ((Date.now() / 1000 - this.createTs) >= 60 * 5))
  }

  clearSttData() {
    self.channel = ""
    self.taskId = ""
    self.tokenName = ""
    self.createTs = 0
  }
}

// export instance
let sttApiManager = new STTApiManager()
export default sttApiManager

// EOF
