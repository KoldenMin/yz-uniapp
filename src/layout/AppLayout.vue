<template>
  <view class="app-layout">
    <view class="main-content">
      <router-view/>
    </view>
    <Navbar/>
  </view>
</template>

<script>
import Navbar from "../components/Navbar.vue";

export default {
  components: {
    Navbar
  }
}
</script>

<style>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
}
</style>