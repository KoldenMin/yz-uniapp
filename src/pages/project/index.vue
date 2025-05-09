<template>
  <view class="container">
    <view class="menu-grid">
      <view class="menu-item" @click="navigateTo('project')">
        <uni-icons type="calendar" size="30" color="#409EFF"></uni-icons>
        <text class="menu-text">项目列表</text>
      </view>

      <view class="menu-item" @click="navigateTo('projectParticipant')">
        <uni-icons type="personadd" size="30" color="#409EFF"></uni-icons>
        <text class="menu-text">项目参与人员</text>
      </view>

      <view class="menu-item" @click="navigateTo('projectTest')">
        <uni-icons type="checkbox" size="30" color="#409EFF"></uni-icons>
        <text class="menu-text">测试用例</text>
      </view>

      <view class="menu-item" @click="navigateTo('projectBug')">
        <uni-icons type="info" size="30" color="#409EFF"></uni-icons>
        <text class="menu-text">bug列表</text>
      </view>
    </view>
  </view>
</template>

<script setup>
const navigateTo = (url) => {
  uni.navigateTo({
    url: url
  });
};
</script>

<style scoped>
.container {
  padding: 30rpx;
}

.menu-grid {
  display: flex;
  flex-wrap: wrap;
  margin-top: 30rpx;
}

.menu-item {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
}

.menu-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #303133;
}
</style>