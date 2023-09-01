<template>
  <div class="home-div">
    <div class="fs24 mobile">
      <RealTime></RealTime>
    </div>
  </div>
</template>

<script lang="js">
import RealTime from '@/components/Real-Time/RealTime.vue'
export default {
  name: 'HomeView',
  components: {
    RealTime,
  },
  data() {
    return {
      activeTab: "real-time",
    }
  }
}
</script>

<style scoped lang="scss">
.tabs {
  position: absolute;
  border-radius: 16px;
  left: 0px;
  top: 1rem;
  width: 100%;
}
.tab-content {
  box-sizing: border-box;
  padding: 10px;
  // background-color: #ff0d0e;
}
.home-div {
  text-align: center;
  width: 100%;
  max-width: 500px;
  margin: 1rem;
  padding-left: 0rem;
  padding-right: 0rem;
}
.home-link {
  font-size: 1.2rem;
  line-height: 2.4rem;
  font-weight: 600;
  display: block;
  background-color: #ff0d0e;
  width: 300px;
  border-radius: 1rem;
}
</style>
