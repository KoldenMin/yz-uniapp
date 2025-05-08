<!-- src/pages/user-profile/index.vue -->
<template>
  <view class="profile-container">
    <uni-card class="profile-card">
      <view slot="title" class="card-header">
        <text class="card-title">个人信息</text>
        <button type="primary" class="update-btn" @click="handleClick">更改信息</button>
      </view>

      <!-- 骨架屏 -->
      <view v-if="loading" class="skeleton">
        <view class="skeleton-row" v-for="i in 6" :key="i"></view>
      </view>

      <!-- 个人信息内容 -->
      <view v-else class="profile-content">
        <!-- 基本信息 -->
        <view class="profile-section">
          <text class="section-title">基本信息</text>
          <view class="info-grid">
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
            <view class="info-item">
              <text class="label">住址:</text>
              <text class="value">{{ userInfo.currentAddress || '未填写' }}</text>
            </view>
          </view>
        </view>

        <!-- 分隔线 -->
        <view class="divider"></view>

        <!-- 工作信息 -->
        <view class="profile-section">
          <text class="section-title">工作信息</text>
          <view class="info-grid">
            <view class="info-item">
              <text class="label">入职时间:</text>
              <text class="value">{{ userInfo.entryTime ? formatDate(userInfo.entryTime) : '未填写' }}</text>
            </view>
            <view class="info-item full-width">
              <text class="label">职能描述:</text>
              <text class="value">{{ userInfo.jobDescription || '未填写' }}</text>
            </view>
          </view>
        </view>

        <!-- 分隔线 -->
        <view class="divider"></view>

        <!-- 教育背景 -->
        <view class="profile-section">
          <view class="section-header">
            <text class="section-title">教育背景</text>
            <button type="primary" size="mini" class="add-edu-btn" @click="showAddEducationDialog">添加教育背景</button>
          </view>

          <view v-if="userInfo.educationList && userInfo.educationList.length > 0" class="education-list">
            <view class="timeline">
              <view v-for="(edu, id) in userInfo.educationList" :key="id" class="timeline-item">
                <view class="timeline-marker"></view>
                <view class="timeline-content">
                  <view class="timeline-card">
                    <view class="education-header">
                      <text class="timeline-title">{{ edu.school }} - {{ edu.major }}</text>
                      <button type="warn" size="mini" class="delete-btn" @click="showDeleteEducationConfirm(edu.id)">
                        删除
                      </button>
                    </view>
                    <text class="timeline-period">{{ getEducationPeriod(edu) }}</text>
                    <text v-if="edu.degree" class="timeline-degree">学位: {{ edu.degree }}</text>
                    <text v-if="edu.description" class="timeline-desc">{{ edu.description }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view v-else class="empty-data">
            <image src="/static/images/empty.png" class="empty-image"></image>
            <text class="empty-text">暂无教育背景信息</text>
          </view>
        </view>

        <!-- 分隔线 -->
        <view class="divider"></view>

        <!-- 个人简历 -->
        <view class="profile-section">
          <view class="section-header">
            <text class="section-title">个人简历</text>
            <button
                v-if="userInfo.resumeUrl"
                type="primary"
                size="mini"
                class="view-btn"
                @click="viewResume"
            >查看简历
            </button>
          </view>

          <view class="resume-upload-container">
            <uni-file-picker
                ref="resumeUploader"
                v-model="resumeFiles"
                :auto-upload="false"
                limit="1"
                title="上传简历"
                file-extname="pdf,doc,docx"
                @select="handleResumeSelect"
                @delete="handleResumeDelete"
                @progress="handleResumeProgress"
                @success="handleResumeSuccess"
                @fail="handleResumeError"
            >
              <text class="upload-text">点击或拖动文件到此处上传</text>
              <text class="upload-tip">只能上传pdf、doc、docx格式的简历，且不超过10MB</text>
            </uni-file-picker>

            <view v-if="userInfo.resumeUrl" class="resume-info">
              <view class="resume-status">
                <uni-tag text="已上传简历" type="success"/>
                <text class="resume-filename">{{ getResumeFileName(userInfo.resumeUrl) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </uni-card>

    <!-- 添加教育背景弹窗 -->
    <uni-popup ref="educationPopup" type="dialog">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">添加教育背景</text>
          <text class="popup-close" @click="cancelEducation">×</text>
        </view>

        <view class="popup-body">
          <uni-forms
              ref="educationFormRef"
              :model="educationForm"
              :rules="educationRules"
              label-width="80px"
              label-position="top"
          >
            <uni-forms-item label="学校" name="school">
              <uni-easyinput v-model="educationForm.school" placeholder="请输入学校名称"/>
            </uni-forms-item>

            <uni-forms-item label="专业" name="major">
              <uni-easyinput v-model="educationForm.major" placeholder="请输入专业"/>
            </uni-forms-item>

            <uni-forms-item label="学位" name="degree">
              <uni-data-select
                  v-model="educationForm.degree"
                  :localdata="degreeOptions"
                  placeholder="请选择学位"
              />
            </uni-forms-item>

            <uni-forms-item label="开始日期" name="startDate">
              <uni-datetime-picker
                  v-model="educationForm.startDate"
                  type="date"
                  return-type="string"
                  :end="today"
              />
            </uni-forms-item>

            <uni-forms-item label="结束日期" name="endDate">
              <uni-datetime-picker
                  v-model="educationForm.endDate"
                  type="date"
                  return-type="string"
                  :end="today"
              />
            </uni-forms-item>

            <uni-forms-item label="描述" name="description">
              <uni-easyinput
                  type="textarea"
                  v-model="educationForm.description"
                  placeholder="请输入教育经历描述"
              />
            </uni-forms-item>
          </uni-forms>

          <view class="popup-footer">
            <button @click="cancelEducation">取消</button>
            <button type="primary" :disabled="submitting" @click="submitEducation">确定</button>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 更新用户信息弹窗 -->
    <uni-popup ref="userInfoPopup" type="dialog">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">更改用户信息</text>
          <text class="popup-close" @click="handleUserInfoFormDel">×</text>
        </view>

        <view class="popup-body">
          <uni-forms
              ref="userInfoFormRef"
              :model="userInfoForm"
              :rules="userInfoRules"
              label-width="80px"
              label-position="top"
          >
            <uni-forms-item label="用户名" name="username">
              <uni-easyinput v-model="userInfoForm.username" disabled/>
            </uni-forms-item>

            <uni-forms-item label="密码" name="password">
              <uni-easyinput type="password" v-model="userInfoForm.password" placeholder="请输入新密码"/>
            </uni-forms-item>

            <uni-forms-item label="真实姓名" name="realName">
              <uni-easyinput v-model="userInfoForm.realName" placeholder="请输入真实姓名"/>
            </uni-forms-item>

            <uni-forms-item label="手机号" name="phone">
              <uni-easyinput v-model="userInfoForm.phone" placeholder="请输入手机号"/>
            </uni-forms-item>
          </uni-forms>

          <view class="popup-footer">
            <button @click="handleUserInfoFormDel">取消</button>
            <button type="primary" :disabled="submitting" @click="submitUserInfo">确定</button>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 确认弹窗 -->
    <uni-popup ref="confirmPopup" type="dialog">
      <uni-popup-dialog
          type="error"
          title="删除教育经历"
          content="确认删除这段教育经历？此操作不可恢复！"
          @confirm="confirmDeleteEducation"
          @close="cancelDeleteEducation"
      ></uni-popup-dialog>
    </uni-popup>
  </view>
</template>

<script setup>
import {onMounted, reactive, ref, computed} from 'vue';
import {getUserInfo, updateUser, uploadResume} from "../../api/user";
import {addEducation, delEducationById, getEducationList} from "../../api/education";

const loading = ref(true);
const userInfo = ref({});
const submitting = ref(false);
const deleteEducationId = ref(null);

// 引用
const educationPopup = ref(null);
const userInfoPopup = ref(null);
const confirmPopup = ref(null);
const educationFormRef = ref(null);
const userInfoFormRef = ref(null);
const resumeUploader = ref(null);

// 表单数据
const educationForm = reactive({
  school: '',
  major: '',
  degree: '',
  startDate: '',
  endDate: '',
  description: ''
});

const userInfoForm = reactive({
  username: '',
  password: '',
  realName: '',
  phone: ''
});

// 简历上传文件
const resumeFiles = ref([]);

// 学位选项
const degreeOptions = [
  {value: '学士', text: '学士'},
  {value: '硕士', text: '硕士'},
  {value: '博士', text: '博士'},
  {value: '其他', text: '其他'}
];

// 当前日期，用于日期选择器
const today = computed(() => {
  const now = new Date();
  return now.toISOString().split('T')[0];
});

// 校验规则
const educationRules = {
  school: {
    rules: [
      {required: true, errorMessage: '请输入学校名称'}
    ]
  },
  major: {
    rules: [
      {required: true, errorMessage: '请输入专业'}
    ]
  },
  startDate: {
    rules: [
      {required: true, errorMessage: '请选择开始日期'}
    ]
  },
  endDate: {
    rules: [
      {
        validateFunction: (rule, value, data, callback) => {
          if (value && data.startDate && new Date(value) < new Date(data.startDate)) {
            callback('结束日期不能早于开始日期');
            return false;
          }
          return true;
        }
      }
    ]
  }
};

const userInfoRules = {
  password: {
    rules: [
      {minLength: 2, maxLength: 20, errorMessage: '密码长度必须在2-20个字符之间'}
    ]
  },
  phone: {
    rules: [
      {
        validateFunction: (rule, value, data, callback) => {
          if (value && !/^1[3-9]\d{9}$/.test(value)) {
            callback('手机号码格式不正确');
            return false;
          }
          return true;
        }
      }
    ]
  }
};

// 获取用户信息及教育背景
const fetchUserData = async () => {
  loading.value = true;
  try {
    // 获取用户信息
    const userResponse = await getUserInfo();
    userInfo.value = userResponse.data;

    // 如果用户已有简历，更新文件列表
    if (userInfo.value.resumeUrl) {
      resumeFiles.value = [{
        name: getResumeFileName(userInfo.value.resumeUrl),
        url: userInfo.value.resumeUrl
      }];
    } else {
      resumeFiles.value = [];
    }

    // 获取教育背景列表
    const eduResponse = await getEducationList();
    userInfo.value.educationList = eduResponse.data;
  } catch (error) {
    console.error('获取用户数据失败:', error);
    uni.showToast({
      title: '获取用户数据失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 获取教育经历起止时间
const getEducationPeriod = (edu) => {
  const start = edu.startDate ? formatDate(edu.startDate) : '';
  const end = edu.endDate ? formatDate(edu.endDate) : '至今';
  return `${start} 至 ${end}`;
};

// 显示用户信息对话框
const handleClick = () => {
  userInfoForm.username = userInfo.value.username;
  userInfoForm.password = '';
  userInfoForm.realName = userInfo.value.realName || '';
  userInfoForm.phone = userInfo.value.phone || '';

  userInfoPopup.value.open('center');
};

// 关闭用户信息对话框
const handleUserInfoFormDel = () => {
  userInfoPopup.value.close();
};

// 显示添加教育背景对话框
const showAddEducationDialog = () => {
  // 重置表单
  educationForm.school = '';
  educationForm.major = '';
  educationForm.degree = '';
  educationForm.startDate = '';
  educationForm.endDate = '';
  educationForm.description = '';

  educationPopup.value.open('center');
};

// 取消添加教育背景
const cancelEducation = () => {
  educationPopup.value.close();
};

// 显示删除教育确认
const showDeleteEducationConfirm = (id) => {
  deleteEducationId.value = id;
  confirmPopup.value.open();
};

// 确认删除教育
const confirmDeleteEducation = async () => {
  if (!deleteEducationId.value) return;

  try {
    await delEducationById(deleteEducationId.value);
    // 重新获取教育背景列表
    await fetchUserData();

    uni.showToast({
      title: '删除成功',
      icon: 'success'
    });
  } catch (error) {
    console.error('删除教育背景失败:', error);
    uni.showToast({
      title: '删除失败',
      icon: 'none'
    });
  }
};

// 取消删除教育
const cancelDeleteEducation = () => {
  deleteEducationId.value = null;
};

// 提交教育背景表单
const submitEducation = () => {
  educationFormRef.value.validate().then(async (valid) => {
    if (!valid) return;

    submitting.value = true;
    try {
      await addEducation(educationForm);

      uni.showToast({
        title: '添加教育背景成功',
        icon: 'success'
      });

      educationPopup.value.close();

      // 重新获取教育背景列表
      await fetchUserData();
    } catch (error) {
      console.error('添加教育背景失败:', error);
      uni.showToast({
        title: '添加失败',
        icon: 'none'
      });
    } finally {
      submitting.value = false;
    }
  }).catch(err => {
    console.log('表单验证失败:', err);
  });
};

// 提交用户信息表单
const submitUserInfo = () => {
  userInfoFormRef.value.validate().then(async (valid) => {
    if (!valid) return;

    submitting.value = true;
    try {
      const userResponse = await getUserInfo();
      const id = userResponse.data.id;
      await updateUser(id, userInfoForm);

      uni.showToast({
        title: '更新成功',
        icon: 'success'
      });

      userInfoPopup.value.close();

      // 重新获取用户数据
      await fetchUserData();
    } catch (error) {
      console.error('更新失败:', error);
      uni.showToast({
        title: '更新失败',
        icon: 'none'
      });
    } finally {
      submitting.value = false;
    }
  }).catch(err => {
    console.log('表单验证失败:', err);
  });
};

// 简历上传相关方法
const handleResumeSelect = (e) => {
  const fileList = e.tempFiles;

  // 验证文件类型和大小
  for (const file of fileList) {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const validExtensions = ['pdf', 'doc', 'docx'];

    if (!validExtensions.includes(fileExtension)) {
      uni.showToast({
        title: '简历只能是PDF/DOC/DOCX格式!',
        icon: 'none'
      });
      resumeFiles.value = [];
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      uni.showToast({
        title: '简历大小不能超过10MB!',
        icon: 'none'
      });
      resumeFiles.value = [];
      return;
    }
  }

  // 开始上传
  uploadResume(fileList[0].file || fileList[0].tempFilePath);
};

// 上传简历
const uploadMyResume = async (file) => {
  try {
    const formData = new FormData();
    formData.append('resume', file);

    // 获取当前用户ID
    const userResponse = await getUserInfo();
    const userId = userResponse.data.id;
    formData.append('userId', userId);

    // todo 暂时注释
    const response = await uploadResume(formData);
    handleResumeSuccess(response);
  } catch (error) {
    console.error('简历上传失败:', error);
    handleResumeError(error);
  }
};

// 简历上传进度
const handleResumeProgress = (e) => {
  console.log('上传进度:', e.progress);
};

// 简历上传成功
const handleResumeSuccess = (res) => {
  uni.showToast({
    title: '简历上传成功',
    icon: 'success'
  });

  fetchUserData(); // 重新获取用户数据，包括最新的简历URL
};

// 简历上传失败
const handleResumeError = (err) => {
  console.error('简历上传错误:', err);
  uni.showToast({
    title: '简历上传失败',
    icon: 'none'
  });
};

// 处理简历删除
const handleResumeDelete = (e) => {
  resumeFiles.value = [];
};

// 获取简历文件名
const getResumeFileName = (url) => {
  if (!url) return '';
  return url.split('/').pop();
};

// 查看简历
const viewResume = () => {
  if (userInfo.value.resumeUrl) {
    // 构建完整的URL路径
    const baseUrl = 'http://localhost:8080/api';
    const fullUrl = baseUrl + userInfo.value.resumeUrl;

    // 在H5环境下打开新窗口
    // #ifdef H5
    window.open(fullUrl, '_blank');
    // #endif

    // 在非H5环境下使用内置浏览器打开链接
    // #ifndef H5
    uni.navigateTo({
      url: '/pages/web-view/index?url=' + encodeURIComponent(fullUrl)
    });
    // #endif
  } else {
    uni.showToast({
      title: '暂无简历可查看',
      icon: 'none'
    });
  }
};

onMounted(() => {
  fetchUserData();
});


</script>

<style scoped lang="scss">
.profile-container {
  padding: 20rpx;
  background-color: #f5f7fa;
}

.profile-card {
  background-color: #fff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
}

.update-btn {
  font-size: 28rpx;
  height: 70rpx;
  line-height: 70rpx;
}

/* 骨架屏 */
.skeleton {
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

/* 内容样式 */
.profile-content {
  padding: 10rpx;
}

.profile-section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #303133;
  margin-bottom: 30rpx;
  display: block;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.add-edu-btn, .view-btn {
  font-size: 24rpx;
  height: 60rpx;
  line-height: 60rpx;
}

/* 分隔线 */
.divider {
  height: 1px;
  background-color: #ebeef5;
  margin: 30rpx 0;
}

/* 信息网格 */
.info-grid {
  display: flex;
  flex-direction: column;
}

.info-item {
  margin-bottom: 20rpx;
  padding-bottom: 10rpx;
  border-bottom: 1px dashed #eee;
}

.label {
  font-weight: bold;
  width: 160rpx;
  display: inline-block;
  font-size: 28rpx;
}

.value {
  font-size: 28rpx;
  color: #606266;
}

.full-width {
  width: 100%;
}

/* 教育背景时间线 */
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

.education-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10rpx;
}

.timeline-title {
  font-weight: bold;
  color: #409eff;
  font-size: 28rpx;
  flex: 1;
}

.delete-btn {
  font-size: 24rpx;
  height: 50rpx;
  line-height: 50rpx;
  padding: 0 16rpx;
}

.timeline-period {
  color: #909399;
  font-size: 24rpx;
  margin-bottom: 10rpx;
  display: block;
}

.timeline-degree {
  font-size: 26rpx;
  margin-bottom: 10rpx;
  display: block;
}

.timeline-desc {
  font-size: 26rpx;
  color: #606266;
  display: block;
}

/* 简历上传 */
.resume-upload-container {
  margin-top: 20rpx;
}

.upload-text {
  display: block;
  text-align: center;
  color: #606266;
  font-size: 28rpx;
  margin-bottom: 10rpx;
}

.upload-tip {
  display: block;
  text-align: center;
  color: #909399;
  font-size: 24rpx;
}

.resume-info {
  margin-top: 20rpx;
}

.resume-status {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.resume-filename {
  color: #606266;
  font-size: 26rpx;
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
  padding: 30rpx;
}

.popup-footer {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  margin-top: 30rpx;
}

.popup-footer button {
  width: 160rpx;
  font-size: 28rpx;
  height: 70rpx;
  line-height: 70rpx;
}

/* 媒体查询 - 大屏幕适配 */
@media screen and (min-width: 768px) {
  .info-grid {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .info-item {
    width: 50%;
    padding-right: 30rpx;
    box-sizing: border-box;
  }

  .info-item.full-width {
    width: 100%;
  }
}
</style>