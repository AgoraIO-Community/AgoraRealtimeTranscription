
<template>
  <div v-loading="isLoading">
    <div class="setting-area shadow-block">
      <div class="setting-title">GPT Parameter</div>
      <el-form ref="settingForm" label-width="160px" :model="gptSetting" label-position="right">
        <el-row :gutter="16">
          <el-col :span="12">
        <el-form-item label="Temperature:" class="form-item">
          <el-input-number v-model="temperature" show-input :min="0.0" :max="1.0" :step="0.1" size="small" controls-position="right" :disabled="true"/>
        </el-form-item>
          </el-col>
          <el-col :span="12">
        <el-form-item label="Past Message Include:" class="form-item">
          <el-input-number v-model="pastInclude" show-input :min="1" :max="20" :step="1" size="small" controls-position="right" :disabled="true"/>
        </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <!-- Template select -->
      <div class="setting-title">Template</div>
      <el-form ref="settingForm" label-width="160px" :model="gptSetting" label-position="right">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Sample System:" class="form-item">
              <el-select class="m-2" placeholder="Select Sample System" v-model="samplePromptTitle" @change="onPromptChanged" size="small" value-key="id">
                <el-option
                  v-for="item in this.samplePrompts"
                  :key="item.id"
                  :label="item.title"
                  :value="item"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Sample Text:">
              <el-select class="m-2" placeholder="Select Sample Text" v-model="sampleTextTitle" @change="onSampleTextChanged" size="small">
                <el-option
                  v-for="item in this.sampleTexts"
                  :key="item.title"
                  :label="item.title"
                  :value="item.text"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-form ref="settingForm" label-width="110px" :model="gptSetting" label-position="top">
        <el-form-item label="System:">
          <el-input
            v-model="gptSetting.system"
            rows="2"
            resize="none"
            type="textarea"
            placeholder="Sample text"
          />
          </el-form-item>
        <el-form-item label="Text:">
          <el-input
            v-model="gptSetting.userContent"
            rows="12"
            resize="none"
            type="textarea"
            placeholder="Sample text"
          />
        </el-form-item>
      </el-form>
      <div class="gpt-button-area">
        <el-button type="primary" @click="onSubmit" class="gpt-button" :loading="isLoading">Analysis</el-button>
        <el-button type="danger" @click="clearText" class="gpt-button">Clear Text</el-button>
      </div>
    </div>
    <div class="setting-area shadow-block result-pannel">
      <div class="setting-title">Analysis Result</div>
      <div id="analysis-result-div" class="analysis-result">
        {{ result }}
      </div>
      <el-button type="danger" @click="clearResult" class="gpt-button" v-if="result!=''">Clear Result</el-button>
    </div>
    <el-drawer title="Result" :visible.sync="displayResult" size="50%">
      <div class="setting-area">
        {{result}}
      </div>
    </el-drawer>
  </div>
</template>

<script lang="js">
import gptMgr from "@/components/GPT/GptManager.js"
import gptSetting from "@/components/GPT/GptSetting.js"
export default {
  name: 'GptMainView',
  components: {
  },
  data() {
    return {
      isLoading: false,
      displayTextSetting: false,
      displayPromptSetting: false,
      displayResult: false,
      //
      temperature: 0.5,
      pastInclude: 1,
      sampleTextTitle: '',
      sampleTexts: gptMgr.sampleTexts,
      samplePromptTitle: '',
      samplePrompts: gptMgr.samplePrompts,
      resultText: "",
      //
      textSettingRules: {
        uploadFile: [{ required: true, message: 'file is required', trigger: 'change' }],
        cultures: [{ required: true, message: 'languages is required', trigger: 'change' }]
      },
      gptSetting: gptSetting,
      //
      promptSettingRules: {
        uploadFile: [{ required: true, message: 'file is required', trigger: 'change' }],
        cultures: [{ required: true, message: 'languages is required', trigger: 'change' }]
      },
      // result
      result: ''
    }
  },
  created() {
    this.sampleTexts = gptMgr.sampleTexts,
    console.log(gptSetting)
  },
  methods: {
    showTextSetting() {
      console.log(this.displayTextSetting)
      this.displayTextSetting = true
    },
    onSampleTextChanged(val) {
      gptSetting.userContent += val
    },
    showPromptSetting() {
      console.log('showPromptSetting')
      this.displayPromptSetting = true
    },
    onPromptChanged(val) {
      gptSetting.system = val.system
      gptSetting.userContent = val.prompt + '\n'
    },
    clearText() {
      gptSetting.userContent = ''
    },
    onSubmit() {
      console.log('onSubmit')
      this.isLoading = true
      let res = gptMgr.runAnalysis(gptSetting.system, gptSetting.userContent, (success, text) => {
        console.log(text)
        this.result = text
        this.isLoading = false
      })
      //this.displayResult = true
//       this.result = 
//       `Agenda:
// Discuss the features to add next, specifically focusing on maintaining low friction and integrating with other tools.
// Consider the effectiveness of different video conferencing back-end options, including Agora.
// Conclusion:
// The opportunity lies in maintaining low friction and keeping the cost low.
// Shortening meetings and integrating with other tools are important features to focus on.
// Agora has been a reliable back-end option, and its scalability has been proven by other successful companies.
// Action items:
// Continue to prioritize low friction and cost efficiency (Vinny)
// Explore further integration with other tools, such as Zapier (Vinny)
// Consider potential improvements to the product based on user feedback (Vinny)`
    },
    clearResult() {
      this.result = ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/theme/analysis.scss";
.gpt-button-area {
  display: flex;
  width: 100%;
  text-align: center;
  flex-wrap: nowrap;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 1rem;
}
.gpt-button {
  position: relative;
  width: 30%;
  margin-top: 0rem;
  margin-right: 0rem;
  right: 16px;
}
.setting-title {
  font-size: 1rem;
  font-weight: 700;
  text-align: left;
  margin-bottom: 0rem;
  height: 1rem;
}
div.result-pannel {
  margin-top: 1rem;
  // display: flex;
  text-align: right;
}
div.analysis-result {
  width: 100%;
  box-sizing: border-box;
  padding: 1rem;
  text-align: left;
  white-space: pre-line;
}
</style>
