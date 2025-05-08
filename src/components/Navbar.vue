<template>
  <view class="navbar">
    <view class="logo">用户管理系统</view>

    <!-- 移动端菜单图标 -->
    <view class="menu-icon" @click="showMenu = !showMenu">
      <text class="iconfont" :class="showMenu ? 'icon-close' : 'icon-menu'"></text>
    </view>

    <!-- 菜单项 -->
    <view class="menu" :class="{ 'menu-open': showMenu }">
      <navigator url="/pages/dashboard/index" class="menu-item" hover-class="menu-item-hover">首页</navigator>
      <navigator url="/pages/user-profile/index" class="menu-item" hover-class="menu-item-hover">个人信息</navigator>
      <navigator v-if="isAdmin" url="/pages/user-list/index" class="menu-item" hover-class="menu-item-hover">用户列表
      </navigator>

      <!-- 人员信息管理 -->
      <view class="menu-dropdown">
        <view class="menu-item dropdown-trigger" @click="toggleDropdown('personnel')">
          人员信息管理
          <text class="dropdown-icon" :class="{'dropdown-open': activeDropdown === 'personnel'}">▼</text>
        </view>
        <view class="dropdown-menu" v-show="activeDropdown === 'personnel'">
          <navigator url="/pages/approve/index" class="dropdown-item" hover-class="dropdown-item-hover">审核列表
          </navigator>
          <navigator url="/pages/department/index" class="dropdown-item" hover-class="dropdown-item-hover">部门列表
          </navigator>
          <navigator url="/pages/employee/index" class="dropdown-item" hover-class="dropdown-item-hover">员工列表
          </navigator>
        </view>
      </view>

      <!-- 项目信息管理 -->
      <view class="menu-dropdown">
        <view class="menu-item dropdown-trigger" @click="toggleDropdown('project')">
          项目信息管理
          <text class="dropdown-icon" :class="{'dropdown-open': activeDropdown === 'project'}">▼</text>
        </view>
        <view class="dropdown-menu" v-show="activeDropdown === 'project'">
          <navigator url="/pages/project/index" class="dropdown-item" hover-class="dropdown-item-hover">项目列表
          </navigator>
          <navigator url="/pages/project-participant/index" class="dropdown-item" hover-class="dropdown-item-hover">
            项目参与人员
          </navigator>
          <navigator url="/pages/project-test/index" class="dropdown-item" hover-class="dropdown-item-hover">测试用例
          </navigator>
          <navigator url="/pages/project-bug/index" class="dropdown-item" hover-class="dropdown-item-hover">bug列表
          </navigator>
        </view>
      </view>
    </view>

    <!-- 用户信息 -->
    <view class="user-info" @click="showUserOptions = !showUserOptions">
      <view class="avatar-container">
        <image :src="avatarUrl || '/static/images/default-avatar.png'" class="user-avatar" mode="aspectFill"></image>
      </view>

      <!-- 用户选项弹出菜单 -->
      <view class="user-options" v-if="showUserOptions">
        <view class="option-item" @click.stop="navigateTo('/pages/user-profile/index')">个人信息</view>
        <view class="option-item" @click.stop="changeAvatar">更换头像</view>
        <view class="option-divider"></view>
        <view class="option-item" @click.stop="logout">退出登录</view>
      </view>
    </view>

    <!-- 隐藏的文件选择器 -->
    <input
        type="file"
        accept="image/jpeg,image/png,image/gif"
        style="display:none"
        @change="handleAvatarChange"
        id="avatarInput"
    />
  </view>
</template>

<script setup>
import {ref, computed} from 'vue';
import {useUserStore} from '../store/userStore';
import {useEmployeeStore} from '../store/employeeStore';

const userStore = useUserStore();
const employeeStore = useEmployeeStore();

const showMenu = ref(false);
const showUserOptions = ref(false);
const activeDropdown = ref('');

const userInfo = computed(() => userStore.userInfo);
const isAdmin = computed(() => userStore.isAdmin);

const avatarUrl = computed(() => {
  if (!userInfo.value?.avatar) return '';
  // 如果头像路径已经是完整URL，则直接返回
  if (userInfo.value.avatar.startsWith('http')) {
    return userInfo.value.avatar;
  }
  return 'http://localhost:8080/api' + userInfo.value.avatar;
});

// 切换下拉菜单
const toggleDropdown = (menu) => {
  if (activeDropdown.value === menu) {
    activeDropdown.value = '';
  } else {
    activeDropdown.value = menu;
  }
};

// 导航到指定页面
const navigateTo = (url) => {
  uni.navigateTo({
    url
  });
  showUserOptions.value = false;
};

// 退出登录
const logout = () => {
  userStore.logoutAction().then(() => {
    uni.reLaunch({
      url: '/pages/login/index'
    });
  });
};

// 更换头像
const changeAvatar = () => {
  // uni-app环境使用uni.chooseImage
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];

      // 检查文件大小
      uni.getFileInfo({
        filePath: tempFilePath,
        success: (fileInfo) => {
          const maxSize = 2 * 1024 * 1024; // 2MB
          if (fileInfo.size > maxSize) {
            uni.showToast({
              title: '图片大小不能超过2MB',
              icon: 'none'
            });
            return;
          }

          // 上传头像
          uploadAvatar(tempFilePath);
        }
      });
    }
  });
};

// 上传头像
const uploadAvatar = (filePath) => {
  const formData = new FormData();

  // 使用uni.uploadFile进行文件上传
  uni.uploadFile({
    url: 'http://localhost:8080/api/user/update-avatar',
    filePath: filePath,
    name: 'avatar',
    formData: {
      userId: userInfo.value.id
    },
    header: {
      'Authorization': `Bearer ${userStore.token}`
    },
    success: (uploadRes) => {
      try {
        const data = JSON.parse(uploadRes.data);
        if (data.code === 200) {
          // 更新store中的头像
          if (userInfo.value) {
            userInfo.value.avatar = data.data.avatarUrl;
          }

          uni.showToast({
            title: '头像更新成功',
            icon: 'success'
          });
        } else {
          uni.showToast({
            title: data.message || '头像更新失败',
            icon: 'none'
          });
        }
      } catch (e) {
        uni.showToast({
          title: '头像更新失败',
          icon: 'none'
        });
      }
    },
    fail: () => {
      uni.showToast({
        title: '上传失败，请稍后重试',
        icon: 'none'
      });
    }
  });
};

// H5环境下的头像选择
const handleAvatarChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    uni.showToast({
      title: '请上传JPG、PNG或GIF格式的图片',
      icon: 'none'
    });
    return;
  }

  // 检查文件大小
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    uni.showToast({
      title: '图片大小不能超过2MB',
      icon: 'none'
    });
    return;
  }

  // 创建表单数据
  const formData = new FormData();
  formData.append('avatar', file);

  // 调用更新头像的action
  userStore.updateAvatarAction(formData).then(() => {
    uni.showToast({
      title: '头像更新成功',
      icon: 'success'
    });
  }).catch(error => {
    uni.showToast({
      title: '头像更新失败: ' + (error.message || '未知错误'),
      icon: 'none'
    });
  });

  // 清空文件输入
  e.target.value = '';
};


</script>

<style>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
  white-space: nowrap;
}

/* 移动端菜单图标 */
.menu-icon {
  display: none;
  font-size: 24px;
  color: #606266;
}

.menu {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.menu-item {
  text-decoration: none;
  color: #606266;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 4px;
  margin: 0 5px;
}

.menu-item-hover {
  color: #409EFF;
  background-color: rgba(64, 158, 255, 0.1);
}

/* 下拉菜单 */
.menu-dropdown {
  position: relative;
  margin: 0 5px;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.dropdown-icon {
  margin-left: 5px;
  font-size: 12px;
  transition: transform 0.3s;
}

.dropdown-open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  min-width: 120px;
  z-index: 10;
}

.dropdown-item {
  display: block;
  padding: 8px 16px;
  color: #606266;
  font-size: 14px;
  text-decoration: none;
  white-space: nowrap;
}

.dropdown-item-hover {
  color: #409EFF;
  background-color: #f5f7fa;
}

/* 用户信息 */
.user-info {
  position: relative;
}

.avatar-container {
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #e0e0e0;
}

/* 用户选项菜单 */
.user-options {
  position: absolute;
  top: 50px;
  right: 0;
  background-color: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  min-width: 120px;
  z-index: 10;
}

.option-item {
  padding: 8px 16px;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
}

.option-item:hover {
  color: #409EFF;
  background-color: #f5f7fa;
}

.option-divider {
  height: 1px;
  background-color: #ebeef5;
  margin: 5px 0;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .menu-icon {
    display: block;
  }

  .menu {
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    flex-direction: column;
    background-color: #fff;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    padding: 10px 0;
    display: none;
    align-items: flex-start;
  }

  .menu-open {
    display: flex;
  }

  .menu-item,
  .menu-dropdown {
    width: 100%;
    margin: 5px 0;
  }

  .dropdown-menu {
    position: static;
    box-shadow: none;
    background-color: #f5f7fa;
    width: 100%;
    border-radius: 0;
    margin-top: 5px;
  }

  .dropdown-item {
    padding-left: 24px;
  }
}
</style>