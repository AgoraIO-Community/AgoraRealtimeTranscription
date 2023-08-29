<template>
  <div class="login">
    <!-- Login Panel -->
    <div class="fs24 mobile">
      <el-button class="setting" icon="el-icon-setting" circle @click="dialogFormVisible = true" />
      <RealTime></RealTime>
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
        <el-button @click="dialogFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogFormVisible = false">Confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import RealTime from '@/components/Real-Time/index.vue' // STT manager class js

const VUE_APP_ID = process.env.VUE_APP_ID
export default {
  data() {
    return {
      appId: VUE_APP_ID,
      activeTab: "real-time",
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
      // str: '',
    }
  },
  components: {
    RealTime,
  },
  created() {
    console.log('version 6, by huyuhua@agora.io 2023.06.06')
    if (window.screen.width < 500) {
      this.isMobile = true
    }
  },
  mounted() {

  },
  beforeDestroy() {
  },
  methods: {

  }
}
</script>

<!-- style -->
<style lang="scss">
@import "@/theme/main.scss";

.tabs {
  position: absolute;
  top: 120px;
}
</style>
