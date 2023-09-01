<template>
  <div>
    <el-button class="setting-btn" icon="el-icon-setting" circle @click="dialogFormVisible = true" />
    <div class="real-time-panel">
      <el-form ref="form" :model="roomConfig" label-width="110px" :rules="rules" >
        <el-form-item label="User Name:" prop="userName">
          <el-input v-model="roomConfig.userName" placeholder="Enter Your Name"
            @input="(val) => (roomConfig.userName = roomConfig.userName.toUpperCase())" />
        </el-form-item>
        <el-form-item label="Room Name:" prop="channelName">
          <el-input v-model="roomConfig.channelName" placeholder="Enter Room Name" suffix-icon="el-icon-s-home"
            @input="(val) => (roomConfig.channelName = roomConfig.channelName.toUpperCase())" />
        </el-form-item>
        <el-form-item label="Language:" prop="cultures">
          <el-autocomplete v-model="roomConfig.cultures" class="inline-input drop-down" :fetch-suggestions="querySearch"
            :trigger-on-focus="true" placeholder="Enter Languages" @select="handleSelect" @change="handleChanged">
            <i slot="suffix" class="el-input__icon el-icon-error" @click="clearCulList" />
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="Translate To:" prop="translateTo">
          <el-autocomplete v-model="roomConfig.translation" class="inline-input drop-down" :fetch-suggestions="querySearch"
            :trigger-on-focus="true" placeholder="Enter Translate Languages" @select="handleTranslationSelect"
            @change="handleTranslationChanged">
            <i slot="suffix" class="el-input__icon el-icon-error" @click="clearTranslation" />
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="Join As:">
          <el-radio-group v-model="roomConfig.role">
            <el-radio label="host" style="margin-left: -1rem;">Host</el-radio>
            <el-radio label="audience" style="margin-left: -1rem;">Audience</el-radio>
          </el-radio-group>
        </el-form-item>
        <div>
          <el-button type="primary" style="width:80%" @click="onSubmit">JOIN</el-button>
        </div>
      </el-form>
    </div>
    <!-- Setting Dialog -->
    <el-dialog title="Settings" :visible.sync="dialogFormVisible" width="400px" :close-on-click-modal="false">
      <p style="padding-right: 4px;">APP ID: <el-input v-model="appId" placeholder="appId" style="width:300px;" />
      </p>
      <el-form ref="form" :model="audioOptions" label-width="110px" :rules="rules" style="margin-left: -3rem;">
        <el-form-item label="AEC:">
          <el-radio-group v-model="audioOptions.AEC" style="margin-left: -8rem;">
            <el-radio :label="true" style="margin-right: -1rem;">Open</el-radio>
            <el-radio :label="false">Close</el-radio>
            <el-tooltip class="item" effect="dark" content="Acoustic Echo Cancellation" placement="top-start">
              <el-button icon="el-icon-info" circle data-coreui-placement="top" class="tooltip"
                style="padding:0% !important,margin-right: -1rem;" />
            </el-tooltip>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="AGC:">
          <el-radio-group v-model="audioOptions.AGC" style="margin-left: -8rem;">
            <el-radio :label="true" style="margin-right: -1rem;">Open</el-radio>
            <el-radio :label="false">Close</el-radio>
            <el-tooltip class="item" effect="dark" content="Audio Gain Control" placement="top-start">
              <el-button icon="el-icon-info" circle data-coreui-placement="top" class="tooltip"
                style="padding:0% !important,margin-right: -1rem;" />
            </el-tooltip>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="ANS:">
          <el-radio-group v-model="audioOptions.ANS" style="margin-left: -8rem;">
            <el-radio :label="true" style="margin-right: -1rem;">Open</el-radio>
            <el-radio :label="false">Close</el-radio>
            <el-tooltip class="item" effect="dark" content="Automatic Noise Suppression" placement="top-start">
              <el-button icon="el-icon-info" circle data-coreui-placement="top" class="tooltip"
                style="padding:0% !important,margin-right: -1rem;" />
            </el-tooltip>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Cancel</el-button
        <el-button type="primary" @click="dialogFormVisible = false">Confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import roomConfig from '@/components/RoomConfig.js'
import router from "@/router";
const VUE_APP_ID = process.env.VUE_APP_ID
export default {
  name: "RealTime",
  data() {
    return {
      appId: VUE_APP_ID,
      roomConfig: roomConfig, // room config, singleton, will be pass to next room page
      rules: {
        channelName: [{ required: true, message: 'roomName is required', trigger: 'blur' }],
        userName: [{ required: true, message: 'userName is required', trigger: 'blur' }],
        cultures: [{ required: true, message: 'languages is required', trigger: 'change' }]
      },
      loading: false,
      isMobile: false,
      audioOptions: {
        AEC: true,
        AGC: true,
        ANS: true
      },
      rules: {
        channelName: [{ required: true, message: 'roomName is required', trigger: 'blur' }],
        userName: [{ required: true, message: 'userName is required', trigger: 'blur' }],
        cultures: [{ required: true, message: 'languages is required', trigger: 'change' }]
      },
      dialogFormVisible: false,
    }
  },
  mounted() {
    this.cultureList = this.loadCultures()
    window.tmpCulList = []
    window.tmpTranslationList = []
  },
  methods: {
    loadCultures() {
      let langs = [
        //2.0.0
        {"code": "en-US", "value": "English (US)"},
        {"code": "en-IN", "value": "English (India)"},
        {"code": "hi-IN", "value": "Hindi (India)"},
        {"code": "ko-KR", "value": "Korean (South Korea)"},
        {"code": "ja-JP", "value": "Japanese (Japan)"},
        {"code": "de-DE", "value": "German (Germany)"},
        {"code": "es-ES", "value": "Spanish (Spain)"},
        {"code": "fr-FR", "value": "French (French)"},
        {"code": "it-IT", "value": "Italian (Italy)"},
        {"code": "zh-CN", "value": "Chinese (Mandarin, Simplified)"},
        {"code": "pt-PT", "value": "Portuguese (Portugal)"},
        // add 2.0.1
        {"code": "zh-HK", "value": "Chinese (Cantonese, Traditional)"},
        {"code": "id-ID", "value": "Indonesian (Indonesia)"},
        {"code": "ar-JO", "value": "Arabic (Jordan)"},
        {"code": "ar-EG", "value": "Arabic (Egyptian)"},
        {"code": "ar-SA", "value": "Arabic (Saudi Arabia)"},
        {"code": "ar-AE", "value": "Arabic (United Arab Emirates)"},
        {"code": "zh-TW", "value": "Chinese (Taiwanese Putonghua)"},
        // add 2.0.2
        {"code": "th-TH", "value": "Thai (Thailand)"},
        {"code": "vi-VN", "value": "Vietnamese (Vietnam)"},
        {"code": "tr-TR", "value": "Turkish (Turkey)"},
        {"code": "ru-RU", "value": "Russian (Russia)"},
        {"code": "ms-MY", "value": "Malay (Malaysia)"},
        {"code": "fa-IR", "value": "Persian (Iran)"},
      ];

      langs.sort(function (a, b) {
        return a.value > b.value ? 1 : -1
      });
      return langs
    },
    onSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          router.push('chatroom')
        } else {
          return false
        }
      })
    },
    // cultures
    clearCulList() {
      tmpCulList = []
      this.roomConfig.cultures = ''
    },
    // translate
    clearTranslation() {
      this.roomConfig.translation = ''
    },
    handleTranslationSelect(translateLang) {
      const arr = tmpTranslationList
      const hit = false
      this.roomConfig.translateTarget = translateLang.code
    },
    handleTranslationChanged(translateLang) {
      console.log(translateLang)
      this.roomConfig.translation = translateLang.code
    },
    handleChanged(val) {
      const arr = String(val).split(',')
      tmpCulList = []
      if (String(val).trim().length < 1) {
        return
      }
      if (arr.length == 1) {
        tmpCulList.push(arr[0])
      } else if (arr.length == 2) {
        tmpCulList.push(arr[0])
        tmpCulList.push(arr[1])
      }
      val = tmpCulList.join(',')
    },
    querySearch(queryString, cb) {
      if (cb) {
        cb(this.cultureList)
      }
    },
    handleSelect(cul) {
      const arr = tmpCulList
      let hit = false
      if (arr.length > 1) {
        this.roomConfig.cultures = arr.join(',')
        return
      }
      for (let i = 0;i < this.cultureList.length;i++) {
        const e = this.cultureList[i]
        if (arr[0] === e.value) {
          arr[0] = cul.code
          hit = true
          break
        } else if (arr.length > 1 && arr[1] === e.value) {
          arr[1] = cul.code
          hit = true
          break
        }
      }
      if (arr.length < 2 && !hit) {
        arr.push(cul.code)
        // tmpCulList.push(cul.code);
      }
      this.roomConfig.cultures = arr.join(',')
      this.roomConfig.translateSource = arr[0]
    },
  }
}
</script>

<style scoped lang="scss">
.real-time-panel {
  margin: auto;
  margin-top: 80px;
}
.drop-down {
  width: 100%;
}
</style>
