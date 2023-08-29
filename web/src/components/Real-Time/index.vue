<template>
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
      <el-autocomplete v-model="roomConfig.cultures" class="inline-input" :fetch-suggestions="querySearch"
        :trigger-on-focus="true" placeholder="Enter Languages" @select="handleSelect" @change="handleChanged">
        <i slot="suffix" class="el-input__icon el-icon-error" @click="clearCulList" />
      </el-autocomplete>
    </el-form-item>
    <el-form-item label="Translate To:" prop="translateTo">
      <el-autocomplete v-model="roomConfig.translation" class="inline-input" :fetch-suggestions="querySearch"
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
</template>


<script>
import roomConfig from '@/components/RoomConfig.js'
import router from "@/router";

export default {
  data() {
    return {
      roomConfig: roomConfig, // room config, singleton, will be pass to next room page
      rules: {
        channelName: [{ required: true, message: 'roomName is required', trigger: 'blur' }],
        userName: [{ required: true, message: 'userName is required', trigger: 'blur' }],
        cultures: [{ required: true, message: 'languages is required', trigger: 'change' }]
      },
    }
  },
  mounted() {
    this.cultureList = this.loadCultures()
    window.tmpCulList = []
    window.tmpTranslationList = []
  },
  methods: {
    loadCultures() {
      return [
        { 'code': 'en-US', 'value': 'English (US)' },
        { 'code': 'en-IN', 'value': 'English (India)' },
        { 'code': 'hi-IN', 'value': 'Hindi (India)' },
        { 'code': 'ko-KR', 'value': 'Korean (South Korea)' },
        { 'code': 'ja-JP', 'value': 'Japanese (Japan)' },
        { 'code': 'de-DE', 'value': 'German (Germany)' },
        { 'code': 'es-ES', 'value': 'Spanish (Spain)' },
        { 'code': 'fr-FR', 'value': 'French (French)' },
        { 'code': 'it-IT', 'value': 'Italian (Italy)' },
        { 'code': 'zh-CN', 'value': 'Chinese (Mandarin, Simplified)	' },
        { 'code': 'zh-TW', 'value': 'Chinese (Taiwanese Putonghua)' },
        { 'code': 'zh-HK', 'value': 'Chinese (Cantonese, Traditional)' },
        { 'code': 'pt-PT', 'value': 'Portuguese (Portugal)' },
        { 'code': 'id-ID', 'value': 'Indonesian (Indonesia)' }
      ]
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
