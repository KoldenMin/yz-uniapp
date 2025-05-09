<!-- src/pages/dashboard/index.vue -->
<template>
  <view class="dashboard-container">
    <uni-card class="welcome-card" title="欢迎使用用户管理系统">
      <view class="welcome-content">
        <text class="welcome-title">您好，{{ userInfo?.realName || '用户' }}！</text>
        <text class="welcome-time">当前时间: {{ currentTime }}</text>
        <text v-if="isAdmin" class="welcome-text">您具有管理员权限，可以查看所有用户信息</text>
        <text v-else class="welcome-text">您可以在个人信息页面查看并管理您的信息</text>
      </view>
    </uni-card>

    <view class="card-row">
      <uni-card class="info-card" title="个人信息概览">
        <template v-slot:cover>
          <view class="card-actions">
            <text class="card-link" @click="goToProfile">查看详情</text>
            <text class="card-link logout-link" @click="showLogoutConfirm">退出登录</text>
          </view>
        </template>
        <view v-if="userInfo" class="info-overview">
          <view class="info-item">
            <text class="label">用户名:</text>
            <text class="value">{{ userInfo.username }}</text>
          </view>
          <view class="info-item">
            <text class="label">姓名:</text>
            <text class="value">{{ userInfo.realName }}</text>
          </view>
          <view class="info-item">
            <text class="label">性别:</text>
            <text class="value">{{ userInfo.gender === 1 ? '男' : '女' }}</text>
          </view>
          <view class="info-item">
            <text class="label">年龄:</text>
            <text class="value">{{ userInfo.age }}</text>
          </view>
          <view class="info-item">
            <text class="label">电话:</text>
            <text class="value">{{ userInfo.phone }}</text>
          </view>
        </view>
        <view v-else class="loading-placeholder">
          <view class="skeleton-row" v-for="i in 5" :key="i"></view>
        </view>
      </uni-card>

      <uni-card class="edu-card" title="教育背景概览">
        <view v-if="userInfo && userInfo.educationList && userInfo.educationList.length > 0" class="edu-overview">
          <view v-for="(edu, index) in userInfo.educationList" :key="index" class="edu-item">
            <text class="edu-title">{{ edu.school }} - {{ edu.major }}</text>
            <text class="edu-period">{{ formatDate(edu.startDate) }} 至 {{
                edu.endDate ? formatDate(edu.endDate) : '至今'
              }}
            </text>
          </view>
        </view>
        <view v-else-if="userInfo && (!userInfo.educationList || userInfo.educationList.length === 0)"
              class="empty-placeholder">
          <image src="/static/images/empty.png" class="empty-image"></image>
          <text class="empty-text">暂无教育背景信息</text>
        </view>
        <view v-else class="loading-placeholder">
          <view class="skeleton-row" v-for="i in 3" :key="i"></view>
        </view>
      </uni-card>
    </view>

    <view class="card-row" v-if="isAdmin">
      <uni-card class="admin-card" title="用户统计信息">
        <template v-slot:cover>
          <text class="card-link" @click="goToUserList">查看用户列表</text>
        </template>
        <view class="admin-info">
          <text class="admin-text">作为管理员，您可以查看系统中所有用户的信息。</text>
          <text class="admin-text">点击"查看用户列表"按钮进入用户管理页面。</text>
        </view>
      </uni-card>
    </view>
  </view>
</template>

<script setup>
import {computed, onMounted, ref, onBeforeUnmount} from 'vue';
import {useUserStore} from "../../store/userStore";

const userStore = useUserStore();
const currentTime = ref(new Date().toLocaleString());
let timer = null;

const userInfo = computed(() => userStore.userInfo);
const isAdmin = computed(() => userStore.isAdmin);

const fetchUserInfo = async () => {
  if (!userStore.userInfo) {
    try {
      await userStore.getUserInfoAction();
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const goToProfile = () => {
  uni.switchTab({
    url: '/pages/users/Profile'
  });
};

const goToUserList = () => {
  uni.switchTab({
    url: '/pages/users/UserList'
  });
};

// 显示退出登录确认对话框
const showLogoutConfirm = () => {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    confirmColor: '#ff0000',
    success: (res) => {
      if (res.confirm) {
        logout();
      }
    }
  });
};

// 退出登录
const logout = async () => {
  try {
    await userStore.logoutAction();
    // 退出成功后跳转到登录页
    uni.reLaunch({
      url: '/pages/login/login'
    });
    uni.showToast({
      title: '已安全退出',
      icon: 'success'
    });
  } catch (error) {
    console.error('退出登录失败:', error);
    uni.showToast({
      title: '退出失败，请重试',
      icon: 'none'
    });
  }
};

// 更新当前时间
const updateTime = () => {
  currentTime.value = new Date().toLocaleString();
};

onMounted(() => {
  fetchUserInfo();
  // 每秒更新一次时间
  timer = setInterval(updateTime, 1000);
});

onBeforeUnmount(() => {
  // 清除定时器，避免内存泄漏
  if (timer) {
    clearInterval(timer);
  }
});

</script>

<style scoped>
.dashboard-container {
  padding: 20rpx;
  background-color: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 120rpx; /* 为底部工具栏留出空间 */
  position: relative;
}

.welcome-card {
  margin-bottom: 20rpx;
  border-radius: 8rpx;
  background-color: #ecf5ff !important;
}

.welcome-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx 0;
}

.welcome-title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.welcome-time {
  font-size: 28rpx;
  margin-bottom: 20rpx;
  color: #606266;
}

.welcome-text {
  font-size: 28rpx;
  color: #606266;
}

.card-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 20rpx;
}

.info-card, .edu-card, .admin-card {
  margin-bottom: 20rpx;
  border-radius: 8rpx;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.card-link {
  color: #409EFF;
  font-size: 28rpx;
}

.logout-link {
  color: #F56C6C;
}

.info-overview, .edu-overview {
  padding: 10rpx 0;
}

.info-item {
  display: flex;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px dashed #eee;
}

.label {
  font-weight: bold;
  width: 160rpx;
  font-size: 28rpx;
}

.value {
  flex: 1;
  font-size: 28rpx;
}

.edu-item {
  margin-bottom: 30rpx;
  padding-bottom: 30rpx;
  border-bottom: 1px dashed #eee;
}

.edu-title {
  font-weight: bold;
  margin-bottom: 10rpx;
  font-size: 28rpx;
  display: block;
}

.edu-period {
  color: #909399;
  font-size: 26rpx;
  display: block;
}

.loading-placeholder {
  padding: 20rpx 0;
}

.skeleton-row {
  height: 30rpx;
  background-color: #f2f2f2;
  border-radius: 4rpx;
  margin-bottom: 20rpx;
  animation: skeleton-loading 1.5s infinite ease-in-out;
}

@keyframes skeleton-loading {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.6;
  }
}

.empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
}

.empty-image {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  color: #909399;
  font-size: 28rpx;
}

.admin-info {
  padding: 20rpx 0;
  text-align: center;
}

.admin-text {
  font-size: 28rpx;
  display: block;
  margin-bottom: 10rpx;
  color: #606266;
}

/* 底部工具栏样式 */
.bottom-toolbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  padding: 20rpx;
  display: flex;
  justify-content: center;
  z-index: 100;
}

.logout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F56C6C;
  color: #fff;
  border-radius: 8rpx;
  padding: 10rpx 30rpx;
  font-size: 28rpx;
  border: none;
}

.logout-button text {
  margin-left: 10rpx;
}

/* 媒体查询适配大屏 */
@media screen and (min-width: 768px) {
  .card-row {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .info-card, .edu-card {
    width: calc(50% - 20rpx);
  }

  .info-card {
    margin-right: 20rpx;
  }

  .admin-card {
    width: 100%;
  }

  .bottom-toolbar {
    padding: 20rpx 40rpx;
  }

  .logout-button {
    width: auto;
    margin: 0 auto;
  }
}
</style>