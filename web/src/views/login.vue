<template>
  <div class="login">
    <!-- Login Panel -->
    <div class="fs24 mobile">
      <el-button class="setting" icon="el-icon-setting" circle @click="dialogFormVisible = true"></el-button>
      <el-form ref="form" :model="roomConfig" label-width="110px" :rules="rules" style="margin-top: -7rem;">
        <el-form-item label="User Name:" prop="userName">
          <el-input v-model="roomConfig.userName" placeholder="Enter Your Name"
            @input="(val) => (roomConfig.userName = roomConfig.userName.toUpperCase())"></el-input>
        </el-form-item>
        <el-form-item label="Room Name:" prop="channelName">
          <el-input v-model="roomConfig.channelName" placeholder="Enter Room Name" suffix-icon="el-icon-s-home"
            @input="(val) => (roomConfig.channelName = roomConfig.channelName.toUpperCase())"></el-input>
        </el-form-item>
        <el-form-item label="Language:" prop="cultures">
          <el-autocomplete
            class="inline-input"
            v-model="roomConfig.cultures"
            :fetch-suggestions="querySearch"
            :trigger-on-focus="true"
            placeholder="Enter Languages"
            @select="handleSelect"
            @change="handleChanged">
            <i slot="suffix" class="el-input__icon el-icon-error" @click="clearCulList"></i>
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="Translate To:" prop="translateTo">
          <el-autocomplete
            class="inline-input"
            v-model="roomConfig.translation"
            :fetch-suggestions="querySearch"
            :trigger-on-focus="true"
            placeholder="Enter Translate Languages"
            @select="handleTranslationSelect"
            @change="handleTranslationChanged">
            <i slot="suffix" class="el-input__icon el-icon-error" @click="clearTranslation"></i>
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="Join As:">
          <el-radio-group v-model="roomConfig.role">
            <el-radio label="host" style="margin-left: -1rem;">Host</el-radio>
            <el-radio label="audience" style="margin-left: -1rem;">Audience</el-radio>
          </el-radio-group>
        </el-form-item>
        <div>
          <el-button type="primary" @click="onSubmit" style="width:80%">JOIN</el-button>
        </div>
      </el-form>
    </div>
    <!-- Setting Dialog -->
    <el-dialog title="Settings" :visible.sync="dialogFormVisible" width="400px" :close-on-click-modal="false">
      <p style="padding-right: 4px;">APP ID: <el-input v-model="appId" placeholder="appId" style="width:300px;">
        </el-input>
      </p>
      <el-form ref="form" :model="audioOptions" label-width="110px" :rules="rules" style="margin-left: -3rem;">
        <el-form-item label="AEC:">
          <el-radio-group v-model="audioOptions.AEC" style="margin-left: -8rem;">
            <el-radio :label="true" style="margin-right: -1rem;">Open</el-radio>
            <el-radio :label="false">Close</el-radio>
            <el-tooltip class="item" effect="dark" content="Acoustic Echo Cancellation" placement="top-start">
              <el-button icon="el-icon-info" circle data-coreui-placement="top" class="tooltip"
                style="padding:0% !important,margin-right: -1rem;">
              </el-button>
            </el-tooltip>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="AGC:">
          <el-radio-group v-model="audioOptions.AGC" style="margin-left: -8rem;">
            <el-radio :label="true" style="margin-right: -1rem;">Open</el-radio>
            <el-radio :label="false">Close</el-radio>
            <el-tooltip class="item" effect="dark" content="Audio Gain Control" placement="top-start">
              <el-button icon="el-icon-info" circle data-coreui-placement="top" class="tooltip"
                style="padding:0% !important,margin-right: -1rem;">
              </el-button>
            </el-tooltip>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="ANS:">
          <el-radio-group v-model="audioOptions.ANS" style="margin-left: -8rem;">
            <el-radio :label="true" style="margin-right: -1rem;">Open</el-radio>
            <el-radio :label="false">Close</el-radio>
            <el-tooltip class="item" effect="dark" content="Automatic Noise Suppression" placement="top-start">
              <el-button icon="el-icon-info" circle data-coreui-placement="top" class="tooltip"
                style="padding:0% !important,margin-right: -1rem;">
              </el-button>
            </el-tooltip>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogFormVisible = false">Confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import sttApiManager from "@/components/STTApiManager.js" // STT manager class js
// import rtcMgr from "@/components/RtcManager.js"           // Agora RTC manager class
// import rtmMgr from "@/components/RtmManager.js"           // Agora RTM manager class
import roomConfig from "@/components/RoomConfig.js";
import _ from "lodash";
import { async, ninvoke } from "q";
import { faL } from "@fortawesome/free-solid-svg-icons";
import { logger } from "agora-rte-extension";
import router from "@/router";

const VUE_APP_ID = process.env.VUE_APP_ID;
export default {
  data() {
    return {
      roomConfig: roomConfig, // room config, singleton, will be pass to next room page
      appId: VUE_APP_ID,
      loading: false,
      isMobile: false,
      audioOptions: {
        AEC: true,
        AGC: true,
        ANS: true,
      },
      rules: {
        channelName: [{ required: true, message: 'roomName is required', trigger: 'blur' },],
        userName: [{ required: true, message: 'userName is required', trigger: 'blur' },],
        cultures: [{ required: true, message: 'languages is required', trigger: 'change'},],
      },
      dialogFormVisible: false,
      // str: '',
      isCollapse: false,
      activeName: 'TranscribeLive',
    }
  },
  created() {
    console.log('version 6, by huyuhua@agora.io 2023.06.06')
    if (window.screen.width < 500) {
      this.isMobile = true
    }
  },
  mounted() {
    //window.addEventListener('beforeunload', e => this.beforeunloadHandler(e));
    this.cultureList = this.loadCultures();
    window.tmpCulList = [];
    window.tmpTranslationList = [];
  },
  beforeDestroy() {
    console.log('Leave login scene.')
  },
  methods: {
    changeOpen() {
      this.isCollapse = !this.isCollapse;
    },
    handleClick() {
      this.isCollapse = false;
    },
    onSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.activeName = 'TranscribeLive'
          router.push ('chatroom')
        } else {
          return false;
        }
      });
    },
    back() {
      console.log('[Login]Back.')
    },
    // -------
    // Load language list
    loadCultures() {
      return [
        {"code": "en-US", "value": "English (US)"},
        {"code": "en-IN", "value": "English (India)"},
        {"code": "hi-IN", "value": "Hindi (India)"},
        {"code": "ko-KR", "value": "Korean (South Korea)"},
        {"code": "ja-JP", "value": "Japanese (Japan)"},
        {"code": "de-DE", "value": "German (Germany)"},
        {"code": "es-ES", "value": "Spanish (Spain)"},
        {"code": "fr-FR", "value": "French (French)"},
        {"code": "it_IT", "value": "Italian (Italy)"},
        {"code": "zh-CN", "value": "Chinese (Mandarin, Simplified)	"},
        {"code": "zh_TW", "value": "Chinese (Taiwanese Putonghua)"},
        {"code": "zh_HK", "value": "Chinese (Cantonese, Traditional)"},
        {"code": "pt-PT", "value": "Portuguese (Portugal)"},
        {"code": "id-ID", "value": "Indonesian (Indonesia)"}
      ];
    },
    querySearch(queryString, cb) {
      if (cb) {
        cb(this.cultureList);
      }
    },
    // cultures
    clearCulList() {
      tmpCulList = [];
      this.roomConfig.cultures = '';
    },
    handleSelect(cul) {
      let arr = tmpCulList;
      let hit = false;
      if (arr.length > 1) {
        this.roomConfig.cultures = arr.join(',');
        return;
      }
      for (let i = 0; i < this.cultureList.length; i++) {
        const e = this.cultureList[i];
        if (arr[0] === e.value) {
          arr[0] = cul.code;
          hit = true;
          break;
        } else if (arr.length > 1 && arr[1] === e.value ) {
          arr[1] = cul.code;
          hit = true;
          break;
        }
      }
      if (arr.length < 2 && !hit) {
        arr.push(cul.code);
        //tmpCulList.push(cul.code);
      }
      this.roomConfig.cultures = arr.join(',');
      this.roomConfig.translateSource = arr[0]
    },
    handleChanged(val) {
      let arr = String(val).split(',');
      tmpCulList = [];
      if (String(val).trim().length < 1) {
        return;
      }
      if (arr.length == 1) {
        tmpCulList.push(arr[0]);
      } else if (arr.length == 2) {
        tmpCulList.push(arr[0]);
        tmpCulList.push(arr[1]);
      }
      val = tmpCulList.join(',');
    },
    // translate
    clearTranslation() {
      this.roomConfig.translation = ''
    },
    handleTranslationSelect(translateLang) {
      let arr = tmpTranslationList;
      let hit = false;
      this.roomConfig.translateTarget = translateLang.code
    },
    handleTranslationChanged (translateLang) {
      console.log(translateLang)
      this.roomConfig.translation = translateLang.code
    }
  }
}
</script>

<!-- style -->
<style lang="scss">
@import "@/theme/main.scss";
</style>
