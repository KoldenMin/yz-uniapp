<!-- src/pages/user-list/index.vue -->
<template>
  <view class="user-list-container">
    <uni-card>
      <text slot="title" class="card-title">用户列表</text>

      <!-- 提示信息 -->
      <view class="custom-alert">
        <view class="alert-icon">
          <text class="iconfont icon-info"></text>
        </view>
        <view class="alert-content">
          <text class="alert-title">管理员功能</text>
          <text class="alert-desc">这里显示了系统中所有注册用户的信息列表</text>
        </view>
      </view>

      <!-- 搜索区域 -->
      <view class="user-search">
        <view class="search-container">
          <uni-easyinput class="search-input" placeholder="用户名查询" v-model="username"/>
          <uni-easyinput class="search-input" placeholder="姓名查询" v-model="realName"/>
          <view class="search-buttons">
            <button type="primary" class="search-btn" @click="handleSearch">搜索</button>
            <button type="default" class="clear-btn" @click="handleClear">清空</button>
          </view>
        </view>
      </view>

      <!-- 用户列表 -->
      <view class="table-container">
        <!-- 表格加载状态 -->
        <view v-if="loading" class="loading-container">
          <uni-load-more status="loading" :contentText="loadingText"/>
        </view>

        <!-- 大屏幕表格视图 -->
        <view v-else-if="isWideScreen" class="desktop-view">
          <scroll-view scroll-x="true" class="table-scroll">
            <view class="table-header">
              <view class="th th-index">#</view>
              <view class="th th-username">用户名</view>
              <view class="th th-realname">姓名</view>
              <view class="th th-gender">性别</view>
              <view class="th th-age">年龄</view>
              <view class="th th-phone">电话</view>
              <view class="th th-address">当前住址</view>
              <view class="th th-admin">管理员</view>
              <view class="th th-status">状态</view>
              <view class="th th-time">注册时间</view>
              <view class="th th-action">操作</view>
            </view>

            <!-- 表格数据 -->
            <view v-for="(item, index) in userList" :key="item.id" class="table-row">
              <view class="td td-index">{{ index + 1 }}</view>
              <view class="td td-username">{{ item.username }}</view>
              <view class="td td-realname">{{ item.realName }}</view>
              <view class="td td-gender">{{ item.gender === 1 ? '男' : '女' }}</view>
              <view class="td td-age">{{ item.age }}</view>
              <view class="td td-phone">{{ item.phone }}</view>
              <view class="td td-address ellipsis">{{ item.currentAddress || '未填写' }}</view>
              <view class="td td-admin">
                <uni-tag v-if="item.isAdmin === 1" text="是" type="error" size="small"/>
                <uni-tag v-else text="否" type="default" size="small"/>
              </view>
              <view class="td td-status">
                <uni-tag v-if="item.status === 1" text="正常" type="success" size="small"/>
                <uni-tag v-else text="禁用" type="default" size="small"/>
              </view>
              <view class="td td-time">{{ dateFormatter(null, null, item.createTime) }}</view>
              <view class="td td-action">
                <view class="action-buttons">
                  <button class="mini-btn" type="primary" size="mini" @click="viewUserDetail(item)">查看详情</button>
                  <button class="mini-btn" type="warn" size="mini" @click="showSetAdminConfirm(item.id)">设为管理员
                  </button>
                  <button class="mini-btn" type="warn" size="mini" @click="showDeleteConfirm(item.id)">删除用户
                  </button>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>

        <!-- 移动端卡片视图 -->
        <view v-else class="mobile-view">
          <view v-for="(item, index) in userList" :key="item.id" class="user-card">
            <view class="card-header">
              <view class="user-basic-info">
                <text class="user-index">{{ index + 1 }}</text>
                <text class="user-name">{{ item.username }} ({{ item.realName }})</text>
              </view>
              <view class="tag-container">
                <uni-tag v-if="item.isAdmin === 1" text="管理员" type="error" size="small"/>
                <uni-tag v-if="item.status === 1" text="正常" type="success" size="small" class="status-tag"/>
                <uni-tag v-else text="禁用" type="default" size="small" class="status-tag"/>
              </view>
            </view>

            <view class="card-body">
              <view class="info-row">
                <view class="info-item">
                  <text class="info-label">性别:</text>
                  <text class="info-value">{{ item.gender === 1 ? '男' : '女' }}</text>
                </view>
                <view class="info-item">
                  <text class="info-label">年龄:</text>
                  <text class="info-value">{{ item.age }}</text>
                </view>
              </view>

              <view class="info-row">
                <view class="info-item full-width">
                  <text class="info-label">电话:</text>
                  <text class="info-value">{{ item.phone }}</text>
                </view>
              </view>

              <view class="info-row">
                <view class="info-item full-width">
                  <text class="info-label">住址:</text>
                  <text class="info-value ellipsis">{{ item.currentAddress || '未填写' }}</text>
                </view>
              </view>

              <view class="info-row">
                <view class="info-item full-width">
                  <text class="info-label">注册时间:</text>
                  <text class="info-value">{{ dateFormatter(null, null, item.createTime) }}</text>
                </view>
              </view>
            </view>

            <view class="card-footer">
              <button class="mobile-btn" type="default" size="mini" @click="viewUserDetail(item)">详情</button>
              <button class="mobile-btn" type="primary" size="mini" @click="showSetAdminConfirm(item.id)">设为管理员
              </button>
              <button class="mobile-btn" type="warn" size="mini" @click="showDeleteConfirm(item.id)">删除</button>
            </view>
          </view>
        </view>

        <!-- 分页 -->
        <view class="pagination-container">
          <uni-pagination
              :total="total"
              :current="currentPage"
              :pageSize="pageSize"
              @change="handlePaginationChange"
              showSizer
              :pageSizeOptions="[2, 3, 5, 10, 20]"
          />
        </view>
      </view>
    </uni-card>

    <!-- 用户详情弹窗 -->
    <uni-popup ref="userDetailPopup" type="center">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">用户详情</text>
          <text class="popup-close" @click="closeUserDetail">×</text>
        </view>

        <scroll-view scroll-y="true" class="popup-body">
          <view v-if="selectedUser" class="user-detail">
            <!-- 基本信息 -->
            <view class="detail-section">
              <view class="detail-row">
                <view class="detail-item">
                  <text class="detail-label">用户名</text>
                  <text class="detail-value">{{ selectedUser.username }}</text>
                </view>
                <view class="detail-item">
                  <text class="detail-label">姓名</text>
                  <text class="detail-value">{{ selectedUser.realName }}</text>
                </view>
              </view>

              <view class="detail-row">
                <view class="detail-item">
                  <text class="detail-label">性别</text>
                  <text class="detail-value">{{ selectedUser.gender === 1 ? '男' : '女' }}</text>
                </view>
                <view class="detail-item">
                  <text class="detail-label">年龄</text>
                  <text class="detail-value">{{ selectedUser.age }}</text>
                </view>
              </view>

              <view class="detail-row">
                <view class="detail-item">
                  <text class="detail-label">电话</text>
                  <text class="detail-value">{{ selectedUser.phone }}</text>
                </view>
                <view class="detail-item">
                  <text class="detail-label">是否管理员</text>
                  <text class="detail-value">{{ selectedUser.isAdmin === 1 ? '是' : '否' }}</text>
                </view>
              </view>

              <view class="detail-row full-width">
                <view class="detail-item">
                  <text class="detail-label">当前住址</text>
                  <text class="detail-value">{{ selectedUser.currentAddress || '未填写' }}</text>
                </view>
              </view>

              <view class="detail-row">
                <view class="detail-item">
                  <text class="detail-label">入职时间</text>
                  <text class="detail-value">
                    {{ selectedUser.entryTime ? dateFormatter(null, null, selectedUser.entryTime) : '未填写' }}
                  </text>
                </view>
                <view class="detail-item">
                  <text class="detail-label">注册时间</text>
                  <text class="detail-value">{{ dateFormatter(null, null, selectedUser.createTime) }}</text>
                </view>
              </view>

              <view class="detail-row full-width">
                <view class="detail-item">
                  <text class="detail-label">职能描述</text>
                  <text class="detail-value">{{ selectedUser.jobDescription || '未填写' }}</text>
                </view>
              </view>
            </view>

            <!-- 教育背景 -->
            <view class="education-section">
              <view class="section-header">
                <text class="section-title">教育背景</text>
              </view>

              <view v-if="selectedUser.educationList && selectedUser.educationList.length > 0" class="timeline">
                <view v-for="(edu, index) in selectedUser.educationList" :key="index" class="timeline-item">
                  <view class="timeline-marker"></view>
                  <view class="timeline-content">
                    <view class="timeline-card">
                      <view class="timeline-title">{{ edu.school }} - {{ edu.major }}</view>
                      <view class="timeline-period">{{ getEducationPeriod(edu) }}</view>
                      <view v-if="edu.degree" class="timeline-degree">学位: {{ edu.degree }}</view>
                      <view v-if="edu.description" class="timeline-desc">{{ edu.description }}</view>
                    </view>
                  </view>
                </view>
              </view>
              <view v-else class="empty-data">
                <image src="/static/images/empty.png" class="empty-image"></image>
                <text class="empty-text">暂无教育背景信息</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </uni-popup>

    <!-- 确认弹窗 -->
    <uni-popup ref="confirmPopup" type="dialog">
      <uni-popup-dialog
          :type="confirmType"
          :title="confirmTitle"
          :content="confirmContent"
          @confirm="handleConfirm"
          @close="closeConfirm"
      ></uni-popup-dialog>
    </uni-popup>
  </view>
</template>

<script setup>
import {ref, onMounted, computed, onBeforeMount} from 'vue';
import {getUserList, getUserInfo, getUserPage, deleteUser, setAdmin} from "../../api/user";
import {getEducationList} from "../../api/education";

const loading = ref(false);
const userList = ref([]);
const selectedUser = ref(null);
const userDetailPopup = ref(null);
const confirmPopup = ref(null);

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const username = ref('');
const realName = ref('');
const windowWidth = ref(0);

// 判断是否是宽屏
const isWideScreen = computed(() => {
  return windowWidth.value >= 768;
});

const loadingText = {
  contentdown: "上拉显示更多",
  contentrefresh: "正在加载...",
  contentnomore: "没有更多数据了"
};

// 监听窗口大小
const updateWindowWidth = () => {
  // 获取设备窗口宽度
  const info = uni.getSystemInfoSync();
  windowWidth.value = info.windowWidth;
};

onBeforeMount(() => {
  updateWindowWidth();
  // 添加窗口大小变化监听器（H5环境下）
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateWindowWidth);
  }
});

// 确认弹窗相关
const confirmType = ref('info');
const confirmTitle = ref('提示');
const confirmContent = ref('');
const confirmAction = ref('');
const confirmParams = ref(null);

// 显示用户详情
const viewUserDetail = async (user) => {
  loading.value = true;
  try {
    selectedUser.value = {...user};

    // 获取该用户的教育背景
    const eduResponse = await getEducationList(); // 应该传递用户ID参数
    selectedUser.value.educationList = eduResponse.data || [];

    userDetailPopup.value.open();
  } catch (error) {
    console.error('获取用户详情失败:', error);
    uni.showToast({
      title: '获取用户详情失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 关闭用户详情弹窗
const closeUserDetail = () => {
  userDetailPopup.value.close();
};

// 显示设置管理员确认弹窗
const showSetAdminConfirm = (id) => {
  confirmType.value = 'warn';
  confirmTitle.value = '设为管理员';
  confirmContent.value = '确定将此用户设为管理员？';
  confirmAction.value = 'setAdmin';
  confirmParams.value = id;
  confirmPopup.value.open();
};

// 显示删除用户确认弹窗
const showDeleteConfirm = (id) => {
  confirmType.value = 'error';
  confirmTitle.value = '删除用户';
  confirmContent.value = '确定删除此用户？此操作不可恢复！';
  confirmAction.value = 'deleteUser';
  confirmParams.value = id;
  confirmPopup.value.open();
};

// 处理确认弹窗
const handleConfirm = async () => {
  try {
    if (confirmAction.value === 'setAdmin') {
      await setAdmin(confirmParams.value);
      uni.showToast({
        title: '设为管理员成功',
        icon: 'success'
      });
    } else if (confirmAction.value === 'deleteUser') {
      await deleteUser(confirmParams.value);
      uni.showToast({
        title: '删除用户成功',
        icon: 'success'
      });
    }

    // 重新获取用户列表
    await fetchPageUserList();
  } catch (error) {
    uni.showToast({
      title: '操作失败: ' + (error.message || '未知错误'),
      icon: 'none'
    });
  }
};

// 关闭确认弹窗
const closeConfirm = () => {
  confirmPopup.value.close();
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1; // 重置到第一页
  fetchPageUserList();
};

// 清空搜索
const handleClear = () => {
  username.value = '';
  realName.value = '';
  currentPage.value = 1; // 重置到第一页
  fetchPageUserList();
};

// 处理分页变化 - 修复分页问题
const handlePaginationChange = (e) => {
  console.log(e)
  // if (e.type === 'next') {
  //   currentPage.value = e.current;
  //   fetchPageUserList();
  // } else if (e.type === 'pageSize') {
  //   pageSize.value = e.pageSize;
  //   currentPage.value = 1; // 切换每页条数时，重置到第一页
  //   fetchPageUserList();
  // }
  currentPage.value = e.current;
  fetchPageUserList()
};

// 获取分页用户列表
const fetchPageUserList = async () => {
  loading.value = true;
  try {
    // console.log('获取用户列表: 页码=', currentPage.value, '每页条数=', pageSize.value);
    const response = await getUserPage(currentPage.value, pageSize.value, username.value, realName.value);
    userList.value = response.data.records;
    total.value = response.data.total;
  } catch (error) {
    console.error('获取用户列表失败:', error);
    uni.showToast({
      title: '获取用户列表失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 格式化日期
const dateFormatter = (row, column, cellValue) => {
  if (!cellValue) return '';
  const date = new Date(cellValue);
  return date.toLocaleString();
};

// 获取教育经历起止时间
const getEducationPeriod = (edu) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const start = edu.startDate ? formatDate(edu.startDate) : '';
  const end = edu.endDate ? formatDate(edu.endDate) : '至今';
  return `${start} 至 ${end}`;
};

onMounted(() => {
  fetchPageUserList();
});
</script>

<style scoped>
.user-list-container {
  padding: 20rpx;
  background-color: #f5f7fa;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
}

/* 自定义提示框 */
.custom-alert {
  display: flex;
  align-items: flex-start;
  background-color: #f4f4f5;
  border-radius: 8rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
}

.alert-icon {
  margin-right: 20rpx;
  color: #909399;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: bold;
  font-size: 28rpx;
  display: block;
  margin-bottom: 10rpx;
}

.alert-desc {
  font-size: 26rpx;
  color: #606266;
}

/* 搜索区域 */
.user-search {
  background-color: #f5f7fa;
  border-radius: 8rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
}

.search-container {
  display: flex;
  flex-direction: column;
}

.search-input {
  margin-bottom: 20rpx;
}

.search-buttons {
  display: flex;
  justify-content: space-between;
}

.search-btn,
.clear-btn {
  flex: 1;
  margin: 0 10rpx;
  font-size: 28rpx;
  height: 70rpx;
  line-height: 70rpx;
}

/* 表格样式 */
.table-container {
  overflow: hidden;
  border-radius: 8rpx;
  background-color: #fff;
}

.loading-container {
  padding: 40rpx 0;
  text-align: center;
}

/* 桌面视图样式 */
.desktop-view {
  display: block;
}

.table-scroll {
  width: 100%;
  white-space: nowrap;
}

.table-header {
  display: flex;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.th {
  padding: 20rpx;
  font-weight: bold;
  text-align: center;
  font-size: 24rpx;
  color: #606266;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #ebeef5;
}

.table-row:last-child {
  border-bottom: none;
}

.td {
  padding: 20rpx;
  text-align: center;
  font-size: 24rpx;
  color: #606266;
}

/* 表格列宽 */
.th-index, .td-index {
  width: 80rpx;
}

.th-username, .td-username {
  width: 180rpx;
}

.th-realname, .td-realname {
  width: 180rpx;
}

.th-gender, .td-gender {
  width: 100rpx;
}

.th-age, .td-age {
  width: 100rpx;
}

.th-phone, .td-phone {
  width: 200rpx;
}

.th-address, .td-address {
  width: 300rpx;
}

.th-admin, .td-admin {
  width: 120rpx;
}

.th-status, .td-status {
  width: 120rpx;
}

.th-time, .td-time {
  width: 200rpx;
}

.th-action, .td-action {
  width: 440rpx;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 按钮样式 */
.action-buttons {
  display: flex;
  justify-content: center;
}

.mini-btn {
  margin: 0 5rpx;
  padding: 0 16rpx;
  font-size: 24rpx;
  height: 50rpx;
  line-height: 50rpx;
}

/* 移动端视图样式 */
.mobile-view {
  display: block;
}

.user-card {
  border: 1px solid #ebeef5;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
  background-color: #fff;
  box-shadow: 0 2rpx 12rpx 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1px solid #ebeef5;
  background-color: #f5f7fa;
}

.user-basic-info {
  display: flex;
  align-items: center;
}

.user-index {
  background-color: #409eff;
  color: #fff;
  width: 40rpx;
  height: 40rpx;
  line-height: 40rpx;
  text-align: center;
  border-radius: 50%;
  margin-right: 16rpx;
  font-size: 24rpx;
}

.user-name {
  font-weight: bold;
  font-size: 28rpx;
}

.tag-container .status-tag {
  margin-left: 10rpx;
}

.card-body {
  padding: 20rpx;
}

.info-row {
  display: flex;
  margin-bottom: 16rpx;
}

.info-item {
  display: flex;
  align-items: center;
  flex: 1;
}

.info-label {
  color: #909399;
  font-size: 26rpx;
  margin-right: 10rpx;
  white-space: nowrap;
}

.info-value {
  color: #303133;
  font-size: 26rpx;
}

.full-width {
  width: 100%;
}

.card-footer {
  display: flex;
  justify-content: space-around;
  padding: 20rpx;
  border-top: 1px solid #ebeef5;
}

.mobile-btn {
  flex: 1;
  margin: 0 10rpx;
  font-size: 26rpx;
}

/* 分页容器 */
.pagination-container {
  padding: 20rpx 0;
  display: flex;
  justify-content: center;
}

/* 弹窗样式 */
.popup-content {
  width: 90vw;
  max-width: 650rpx;
  background-color: #fff;
  border-radius: 10rpx;
  overflow: hidden;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  border-bottom: 1px solid #ebeef5;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
}

.popup-close {
  font-size: 40rpx;
  color: #909399;
  padding: 10rpx;
}

.popup-body {
  max-height: 70vh;
  padding: 30rpx;
}

/* 用户详情样式 */
.detail-section {
  margin-bottom: 40rpx;
}

.detail-row {
  display: flex;
  margin-bottom: 20rpx;
}

.detail-item {
  flex: 1;
  min-width: 0;
  padding-right: 20rpx;
}

.full-width {
  width: 100%;
}

.detail-label {
  display: block;
  font-size: 24rpx;
  color: #909399;
  margin-bottom: 10rpx;
}

.detail-value {
  display: block;
  font-size: 28rpx;
  word-break: break-all;
}

/* 教育背景时间线 */
.education-section {
  margin-top: 40rpx;
}

.section-header {
  margin-bottom: 30rpx;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #303133;
}

.timeline {
  padding-left: 20rpx;
}

.timeline-item {
  position: relative;
  padding-bottom: 30rpx;
  padding-left: 30rpx;
}

.timeline-marker {
  position: absolute;
  top: 8rpx;
  left: 0;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: #409eff;
  z-index: 2;
}

.timeline-item:after {
  content: '';
  position: absolute;
  top: 8rpx;
  left: 5rpx;
  width: 2rpx;
  height: 100%;
  background-color: #e4e7ed;
  z-index: 1;
}

.timeline-item:last-child:after {
  display: none;
}

.timeline-content {
  padding-left: 20rpx;
}

.timeline-card {
  background-color: #f5f7fa;
  border-radius: 8rpx;
  padding: 20rpx;
}

.timeline-title {
  font-weight: bold;
  margin-bottom: 10rpx;
  color: #409eff;
  font-size: 28rpx;
}

.timeline-period {
  color: #909399;
  font-size: 24rpx;
  margin-bottom: 10rpx;
}

.timeline-degree {
  font-size: 26rpx;
  margin-bottom: 10rpx;
}

.timeline-desc {
  font-size: 26rpx;
  color: #606266;
}

/* 空数据状态 */
.empty-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
}

.empty-image {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  color: #909399;
  font-size: 28rpx;
}

/* 媒体查询 - 大屏幕适配 */
@media screen and (min-width: 768px) {
  .search-container {
    flex-direction: row;
    align-items: center;
  }

  .search-input {
    margin-right: 20rpx;
    margin-bottom: 0;
    flex: 1;
  }

  .search-buttons {
    width: 300rpx;
  }

  .mobile-view {
    display: none; /* 在大屏幕上隐藏移动端卡片视图 */
  }
}

/* 媒体查询 - 小屏幕适配 */
@media screen and (max-width: 767px) {
  .desktop-view {
    display: none; /* 在小屏幕上隐藏桌面表格视图 */
  }

  .pagination-container {
    padding: 10rpx;
  }
}
</style>