<template>
  <div id="PageHeader" class="page-header">
    <div id="HeaderLogo" class="logo">
      <img src="../../../img/logo.png"/>
    </div>
    <!-- <div class="title">Agora STT Web Demo</div> -->
    <!-- <div class="menu">
      <router-link v-for="(item) in menuItems" :to="item.url" key="item.url" class="menu-item">
        {{item.text}}
      </router-link>
    </div> -->
  </div>
</template>

<script lang="js">
export default {
  name: 'PageHeader',
  components: {

  },
  data() {
    return {
      menuItems: [{
        text: 'Online Speech to Text',
        url: ''
      },{
        text: 'Offline Speech to Text',
        url: ''
      }, {
        text: 'GPT Samples',
        url: ''
      }
      ]
    }
  }
}
</script>

<style scoped lang="scss">
div {
  box-sizing: border-box;
}
div.page-header {
  width: 100%;
  max-width: 375px;
  z-index: 999;
  margin: auto;
  height: 40px;
  padding-left: 1rem;
  padding-right: 1rem;
  box-sizing: border-box;
  div.logo {
    height: 100%;
    border-radius: 0px;
    float: center;
    position: relative;
    top: 0px;
    vertical-align: middle;
    // logo image
    img {
      display: inline-block;
      // width: 120px;
      height: 100%;
    }
  }
  div.title {
    height: 60px;
    line-height: 40px;
    font-weight: bold;
    text-align: center;
    //background: #f95;
    border-radius: 8px;
    float: left;
    position: relative;
    top: 10px;
    left: 30px;
    padding: 0px 20px 0px 20px
  }
  div.menu {
    background-color: #f0f0f0;
    position: relative;
    float: right;
    left:auto;
    height: 60px;
    line-height: 40px;
    padding: 8px;
    vertical-align: middle;
    top: 0px;
    right: 1rem;
    .menu-item {
      width: 80px;
      margin: 0 auto;
      margin-right: 0.7rem;
      margin-left: 0.7rem;
      text-align: center;
      font-size: 0.8rem;
      font-weight: 600;
    }
  }
}
</style>
