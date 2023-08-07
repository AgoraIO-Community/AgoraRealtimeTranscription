<template>
<div class="subtitle-cell">
  <div class="user-panel">
    <div class="user-avatar"><el-avatar size="small" :src="rtcMgr.allData[subtitle.uid].src" /></div>
    <div class="user-name">
      {{ rtcMgr.allData[subtitle.uid].name }} ({{ subtitle.uid }})
    </div>
  </div>
  <div class="text-panel">
    <div class="subtitle-text">
      {{ subtitle.text }}
    </div>
    <div class="translation-text" v-for="(tran, index) in subtitle.translation" :key="index">{{ tran }}</div>
  </div>
</div>
</template>

<script lang="js">
import rtcMgr from "@/components/RtcManager.js"           // Agora RTC manager class
export default {
  name: 'SubtitleCell',
  props: {
    subtitle: {type: Object, required: true}
  },
  data() {
    return {
      rtcMgr: rtcMgr
    }
  },
  created: function() {
    // join channel
    // console.log(rtcMgr)
  },
  methods: {
    
  },
}
</script>

<style scoped lang="scss">
@import '../theme/subtitle.scss';
</style>