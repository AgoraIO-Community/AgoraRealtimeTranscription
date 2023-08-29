<template>
  <div v-loading="loading">
    <el-form ref="form" label-width="110px" :rules="rules" :model="roomConfig">
      <el-form-item label="Language:" prop="cultures">
        <el-autocomplete v-model="roomConfig.cultures" class="inline-input" :fetch-suggestions="querySearch"
          :trigger-on-focus="true" placeholder="Enter Languages" @select="handleSelect" @change="handleChanged">
          <i slot="suffix" class="el-input__icon el-icon-error" @click="clearCulList" />
        </el-autocomplete>
      </el-form-item>
      <el-form-item label="Upload File:" prop="uploadFile">
        <el-upload
          action="http://127.0.0.1:5000/upload"
          :auto-upload="true"
          :on-change="onUploadChange"
          :before-upload="onBeforeUpload"
          :on-success="onSuccessUpload"
          :show-file-list="false" :style="{ width: '100%' }">
          <el-input v-model="roomConfig.uploadFile" placeholder="File Name" />
        </el-upload>
      </el-form-item>
      <div>
        <el-button type="primary" style="width:80%" @click="onSubmit" :loading="loading" :enable="loading">{{ btnText }}</el-button>
      </div>
    </el-form>
    <el-drawer title="Transcription" :visible.sync="displayTranscription">
      <div class="conversation-area transcription-area">
        {{ fullText }}
      </div>
    </el-drawer>
  </div>
</template>


<script>
import axios from 'axios'
export default {
  data() {
    return {
      rules: {
        uploadFile: [{ required: true, message: 'file is required', trigger: 'change' }],
        cultures: [{ required: true, message: 'languages is required', trigger: 'change' }]
      },
      roomConfig: {
        uploadFile: "",
        cultures: "auto",
      },
      file: "",
      fullText: "",
      displayTranscription: false,
      status: "idle",  // idle | uploading | uploaded | transcribing | transcribed
    }
  },
  mounted() {
    this.cultureList = this.loadCultures()
    window.tmpCulList = []
    window.tmpTranslationList = []
  },
  computed: {
    btnText() {
      switch (this.status) {
        case "idle":
          return "Upload"
        case "uploading":
          return "Uploading..."
        case "uploaded":
          return "Uploaded Done,Transcribe"
        case "transcribing":
          return "Transcribing..."
        case "transcribed":
          return "Transcribed Done"
      }
    },
    loading() {
      if (this.status == "uploading" || this.status == "transcribing") {
        return true
      }
      return false
    }
  },
  watch: {
  },
  methods: {
    onUploadChange(file) {
      this.roomConfig.uploadFile = file.name
      // console.log(file)
      // this.file = file
    },
    onSuccessUpload(response, file, fileList) {
      this.roomConfig.uploadFile = file.name
      this.status = "uploaded"
    },
    onBeforeUpload() {
      this.status = "uploading"
    },
    loadCultures() {
      return [
        { 'code': 'auto', 'value': 'Auto' },
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
    createJob(params) {
      console.log("upload file, create job.")
      const _file = params.file;
      console.log(_file)
      const formData = new FormData();
      const configStr = '{"type": "transcription","transcription_config": {"operating_point":"enhanced","language": "auto"}}'
      formData.append('data_file', _file);
      formData.append('config', configStr);
      for(var pair of formData.entries()) {
    		console.log(pair[0]+ ', '+ pair[1]); 
   		}
      // call api
      const headers = {
        'Content-Type': 'multipart/form-data'
      }
      axios.post('http://127.0.0.1:5000/upload', formData, {headers: headers}).then((res) => {
        console.log(res)
        if (res.status == '200') {
          this.$message.success(res.message || '文件导入成功，稍后查询处理结果');
          // this.fileList = []
          // this.$emit('refresh-list', true);
          // this.handleClose();
          this.status = 'transcribed'
          this.displayTranscription = true
          this.fullText = res.data.transcript
        } else {
          this.$message.error(res.message || '文件导入失败，稍后重试');
        }
      }).catch(error => {
        console.log(error)
        //callback(false, error.response.data.message ? error.response.data.message : 'network anomaly')
    })
    },
    // cultures
    clearCulList() {
      tmpCulList = []
      this.roomConfig.cultures = ''
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
      }
      this.roomConfig.cultures = arr.join(',')
      this.roomConfig.translateSource = arr[0]
    },
    onSubmit() {
      this.$refs['form'].validate((valid) => {
        console.log("tmpCulList", tmpCulList)
        this.displayTranscription = !this.displayTranscription
        // if (valid) {

        // } else {
        //   return false
        // }
      })
    },
  }
}
</script>

<style lang="scss" scope>
.el-upload {
  width: 100%;
}
.transcription-area {
  text-align: left;
  padding: 1.5rem;
}
</style>
