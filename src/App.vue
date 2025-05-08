<script>
import {useUserStore} from "./store/userStore";
import {getToken} from "./utils/auth";
import Navbar from "./components/Navbar.vue";

export default {
  components: {Navbar},
  onLaunch: function () {
    const token = getToken('User-Token');
    if (!token) {
      uni.reLaunch({
        url: '/pages/login/login'
      })
    }
    // console.log('App Launch')
  },
  onShow: function () {
    // console.log('App Show')
  },
  onHide: function () {
    // console.log('App Hide')
  },
}
</script>
<template>
  <Navbar></Navbar>
</template>

<style>
/*每个页面公共css */
</style>
