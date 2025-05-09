<template>
  <view class="container">
    <view class="menu-grid">
      <view class="menu-item" @click="navigateTo('approve')">
        <uni-icons type="bars" size="30" color="#409EFF"></uni-icons>
        <text class="menu-text">审核列表</text>
      </view>

      <view class="menu-item" @click="navigateTo('department')">
        <uni-icons type="staff" size="30" color="#409EFF"></uni-icons>
        <text class="menu-text">部门列表</text>
      </view>

      <view class="menu-item" @click="navigateTo('employee')">
        <uni-icons type="person-filled" size="30" color="#409EFF"></uni-icons>
        <text class="menu-text">员工列表</text>
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
  width: 33.33%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx 0;
}

.menu-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #303133;
}
</style>