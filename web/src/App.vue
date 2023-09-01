<template>
  <div id="app">
    <el-container class="layout">
      <el-header class="app-header">
        <PageHeader/>
      </el-header>
      <el-main class="main-content">
        <!-- <el-container :style="{margin: '0px 0px 0', minHeight: '500px', width: '100%'}"> -->
          <el-row>
            <el-col :span="12">
              <div class="panel-title">
                Transcription
              </div>
              <router-view/>
            </el-col>
            <el-col :span="12">
              <div class="panel-title">
                AI Analysis
              </div>
              <GptMainView/>
            </el-col>
          </el-row>
        <!-- </el-container> -->
      </el-main>
      <el-footer class="app-footer">
        <PageFooter/>
      </el-footer>
    </el-container>
    <!-- <router-view /> -->
  </div>
</template>

<script>
import PageHeader from '@/components/common/PageHeader.vue'
import PageFooter from '@/components/common/PageFooter.vue'
import GptMainView from '@/views/GptMainView.vue'
export default {
  name: 'App',
  components: {
    PageHeader,
    PageFooter,
    GptMainView,
  },
  metaInfo: {
    // meta: [
    //   {'http-equiv': 'Content-Security-Policy', 'content': 'upgrade-insecure-requests'}
    // ]
    //<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests" />
  }
}
</script>

<style>
@import "theme/main.scss";
body{
  margin: 0;
}
#app {
  font-size: 15px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
div.app-header {
  height: 40px;
}
.main-content {
  /* width: 100%; */
  margin: auto;
  text-align: center;
  min-height: 600px;
  min-width: 1300px;
  max-width: 1600px;
  width: 80%
}
.panel-title {
  box-sizing: border-box;
  font-size: 1rem;
  padding: 8px;
  font-weight: 700;
}
.app-header {
  min-width: 1300px;
  max-width: 1600px;
  margin: auto;
}
.app-footer {
  min-width: 1300px;
  max-width: 1600px;
  margin: auto;
}
</style>
