<template>
  <view class="employee-list-container">
    <uni-card>
      <view class="card-header">
        <text class="card-title">员工列表</text>
        <button class="custom-btn primary-btn" @click="openAddDialog">新增员工</button>
      </view>

      <uni-notice-bar
          text="这里显示了系统中所有员工的信息列表"
          type="info"
          show-icon
          :scrollable="false"
          style="margin-bottom: 20rpx;"
      />

      <view class="employee-search">
        <view class="search-container">
          <uni-easyinput placeholder="姓名查询" v-model="name" clearable class="search-input"></uni-easyinput>
          <uni-easyinput placeholder="电话查询" v-model="phone" clearable class="search-input"></uni-easyinput>
          <view class="search-buttons">
            <button class="custom-btn primary-btn" @click="handleSearch">搜索</button>
            <button class="custom-btn danger-btn" @click="handleClear">清空</button>
          </view>
        </view>
      </view>

      <view class="uni-table-container">
        <uni-table
            :loading="loading"
            border
            stripe
            emptyText="暂无数据"
        >
          <uni-tr>
            <uni-th align="center" width="60">#</uni-th>
            <uni-th width="120">姓名</uni-th>
            <uni-th width="130">电话</uni-th>
            <uni-th width="80" align="center">性别</uni-th>
            <uni-th width="80" align="center">年龄</uni-th>
            <uni-th width="120" align="center">部门名称</uni-th>
            <uni-th width="100" align="center">角色</uni-th>
            <uni-th>当前住址</uni-th>
            <uni-th width="180" align="center">入职时间</uni-th>
            <uni-th width="100" align="center">头像</uni-th>
            <uni-th width="420" align="center">操作</uni-th>
          </uni-tr>

          <uni-tr v-for="(item, index) in employeeList" :key="item.id">
            <uni-td align="center">{{ index + 1 }}</uni-td>
            <uni-td>{{ item.name }}</uni-td>
            <uni-td>{{ item.phone }}</uni-td>
            <uni-td align="center">{{ item.gender === 1 ? '男' : '女' }}</uni-td>
            <uni-td align="center">{{ item.age }}</uni-td>
            <uni-td align="center">{{ item.departmentName }}</uni-td>
            <uni-td align="center">
              <uni-tag v-if="item.role === 2" type="success" text="经理"></uni-tag>
              <uni-tag v-else-if="item.role === 1" type="warning" text="管理员"></uni-tag>
              <uni-tag v-else type="info" text="员工"></uni-tag>
            </uni-td>
            <uni-td class="ellipsis">{{ item.currentAddress }}</uni-td>
            <uni-td align="center">{{ item.entryTime }}</uni-td>
            <uni-td align="center">
              <image v-if="item.avatar" :src="formatResourceUrl(item.avatar)" class="avatar-small"></image>
              <view v-else class="avatar-placeholder">
                <uni-icons type="person" size="24"></uni-icons>
              </view>
            </uni-td>
            <uni-td align="center">
              <view class="action-buttons">
                <button class="custom-btn primary-btn" @click="viewEmployeeDetail(item)">查看详情</button>
                <button class="custom-btn success-btn" @click="handleEdit(item)">编辑</button>
                <button class="custom-btn warning-btn" @click="handleUpload(item.id)">上传文件</button>
                <button class="custom-btn danger-btn" @click="showDeleteConfirm(item.id)">删除</button>
              </view>
            </uni-td>
          </uni-tr>
        </uni-table>
      </view>

      <view class="pagination-block">
        <uni-pagination
            :current="currentPage"
            :total="total"
            :pageSize="pageSize"
            @change="handlePageChange"
            showSizer
            :pageSizeRange="[2, 3, 5, 10]"
        ></uni-pagination>
      </view>
    </uni-card>

    <!-- 员工详情弹窗 -->
    <uni-popup ref="detailPopup" type="center">
      <view class="popup-container detail-popup">
        <view class="popup-header">
          <text class="popup-title">员工详情</text>
          <uni-icons type="close" size="20" @click="closeDetailPopup"></uni-icons>
        </view>

        <scroll-view scroll-y class="popup-scroll-content">
          <view v-if="selectedEmployee" class="employee-detail">
            <!-- 基本信息部分 -->
            <view class="detail-section">
              <view class="detail-row">
                <view class="detail-item">
                  <text class="detail-label">姓名:</text>
                  <text class="detail-value">{{ selectedEmployee.name }}</text>
                </view>
                <view class="detail-item">
                  <text class="detail-label">电话:</text>
                  <text class="detail-value">{{ selectedEmployee.phone || '未填写' }}</text>
                </view>
              </view>

              <view class="detail-row">
                <view class="detail-item">
                  <text class="detail-label">性别:</text>
                  <text class="detail-value">{{ selectedEmployee.gender === 1 ? '男' : '女' }}</text>
                </view>
                <view class="detail-item">
                  <text class="detail-label">年龄:</text>
                  <text class="detail-value">{{ selectedEmployee.age || '未填写' }}</text>
                </view>
              </view>

              <view class="detail-row">
                <view class="detail-item">
                  <text class="detail-label">角色:</text>
                  <view class="detail-value">
                    <uni-tag v-if="selectedEmployee.role === 2" type="success" text="经理"></uni-tag>
                    <uni-tag v-else-if="selectedEmployee.role === 1" type="warning" text="管理员"></uni-tag>
                    <uni-tag v-else type="info" text="员工"></uni-tag>
                  </view>
                </view>
                <view class="detail-item">
                  <text class="detail-label">部门名称:</text>
                  <text class="detail-value">{{ selectedEmployee.departmentName || '未分配' }}</text>
                </view>
              </view>

              <view class="detail-row">
                <view class="detail-item">
                  <text class="detail-label">入职时间:</text>
                  <text class="detail-value">{{ formatDate(selectedEmployee.entryTime) || '未填写' }}</text>
                </view>
              </view>

              <view class="detail-row full">
                <view class="detail-item full">
                  <text class="detail-label">当前住址:</text>
                  <text class="detail-value">{{ selectedEmployee.currentAddress || '未填写' }}</text>
                </view>
              </view>

              <view class="detail-row full">
                <view class="detail-item full">
                  <text class="detail-label">职能描述:</text>
                  <text class="detail-value">{{ selectedEmployee.jobDescription || '未填写' }}</text>
                </view>
              </view>
            </view>

            <!-- 头像部分 -->
            <view class="avatar-section" v-if="selectedEmployee.avatar">
              <view class="section-header">
                <text class="section-title">员工头像</text>
              </view>
              <view class="avatar-container">
                <image
                    :src="formatResourceUrl(selectedEmployee.avatar)"
                    mode="aspectFit"
                    class="avatar-large"
                    @click="previewImage(formatResourceUrl(selectedEmployee.avatar))"
                ></image>
              </view>
            </view>

            <!-- 简历部分 -->
            <view class="resume-section" v-if="selectedEmployee.resumeUrl">
              <view class="section-header">
                <text class="section-title">员工简历</text>
              </view>
              <view class="resume-container">
                <button
                    class="custom-btn primary-btn"
                    @click="openResume(selectedEmployee.resumeUrl)"
                >查看简历文件
                </button>
              </view>
            </view>

            <!-- 参与项目部分 -->
            <view class="participants-section">
              <view class="section-header">
                <text class="section-title">参与项目</text>
              </view>

              <view v-if="selectedEmployee.projectList && selectedEmployee.projectList.length > 0">
                <uni-table border>
                  <uni-tr>
                    <uni-th width="120">项目名称</uni-th>
                    <uni-th width="120">项目开始时间</uni-th>
                    <uni-th width="120">项目结束时间</uni-th>
                    <uni-th>项目描述</uni-th>
                  </uni-tr>

                  <uni-tr v-for="project in selectedEmployee.projectList" :key="project.id">
                    <uni-td>{{ project.name }}</uni-td>
                    <uni-td>{{ project.startDate }}</uni-td>
                    <uni-td>{{ project.endDate }}</uni-td>
                    <uni-td class="ellipsis">{{ project.description }}</uni-td>
                  </uni-tr>
                </uni-table>
              </view>
              <view v-else class="empty-placeholder">
                <image src="/static/images/empty.png" class="empty-image"></image>
                <text class="empty-text">暂无参与项目</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </uni-popup>

    <!-- 新增/编辑员工弹窗 -->
    <uni-popup ref="formPopup" type="center">
      <view class="popup-container form-popup">
        <view class="popup-header">
          <text class="popup-title">{{ isEdit ? '编辑员工' : '新增员工' }}</text>
          <uni-icons type="close" size="20" @click="closeFormPopup"></uni-icons>
        </view>

        <scroll-view scroll-y class="popup-scroll-content">
          <uni-forms
              ref="employeeFormRef"
              :model="employeeForm"
              :rules="rules"
              label-position="top"
          >
            <uni-forms-item label="姓名" name="name">
              <uni-easyinput v-model="employeeForm.name" placeholder="请输入姓名"/>
            </uni-forms-item>

            <uni-forms-item label="电话" name="phone">
              <uni-easyinput v-model="employeeForm.phone" placeholder="请输入电话"/>
            </uni-forms-item>

            <uni-forms-item label="性别" name="gender">
              <uni-data-checkbox
                  v-model="employeeForm.gender"
                  :localdata="[{text: '男', value: 1}, {text: '女', value: 0}]"
                  mode="button"
              ></uni-data-checkbox>
            </uni-forms-item>

            <uni-forms-item label="年龄" name="age">
              <uni-number-box
                  v-model="employeeForm.age"
                  :min="18"
                  :max="100"
              ></uni-number-box>
            </uni-forms-item>

            <uni-forms-item label="角色" name="role">
              <uni-data-select
                  v-model="employeeForm.role"
                  :localdata="[
                  {text: '员工', value: 0},
                  {text: '管理员', value: 1},
                  {text: '经理', value: 2}
                ]"
              ></uni-data-select>
            </uni-forms-item>

            <uni-forms-item label="部门名称" name="departmentName">
              <uni-data-select
                  v-model="employeeForm.departmentName"
                  :localdata="departmentList.map(dept => ({text: dept.name, value: dept.name}))"
              ></uni-data-select>
            </uni-forms-item>

            <uni-forms-item label="当前住址" name="currentAddress">
              <uni-easyinput
                  v-model="employeeForm.currentAddress"
                  type="textarea"
                  placeholder="请输入当前住址"
                  height="150"
              ></uni-easyinput>
            </uni-forms-item>

            <uni-forms-item label="职能描述" name="jobDescription">
              <uni-easyinput
                  v-model="employeeForm.jobDescription"
                  type="textarea"
                  placeholder="请输入职能描述"
                  height="200"
              ></uni-easyinput>
            </uni-forms-item>

            <view class="form-actions">
              <button class="custom-btn" @click="closeFormPopup">取消</button>
              <button class="custom-btn primary-btn" @click="submitEmployeeForm">确定</button>
            </view>
          </uni-forms>
        </scroll-view>
      </view>
    </uni-popup>

    <!-- 上传文件弹窗 -->
    <uni-popup ref="uploadPopup" type="center">
      <view class="popup-container upload-popup">
        <view class="popup-header">
          <text class="popup-title">上传文件</text>
          <uni-icons type="close" size="20" @click="closeUploadPopup"></uni-icons>
        </view>

        <uni-segmented-control
            :current="activeTabIndex"
            :values="['上传头像', '上传简历']"
            @clickItem="onTabChange"
            styleType="button"
            activeColor="#2979ff"
        ></uni-segmented-control>

        <view class="upload-content">
          <!-- 上传头像选项卡 -->
          <view v-if="activeTabIndex === 0" class="upload-tab">
            <view class="avatar-uploader">
              <view class="avatar-preview-container" @click="chooseAvatar">
                <image v-if="avatarUrl" :src="avatarUrl" class="avatar-preview"></image>
                <view v-else class="avatar-placeholder large">
                  <uni-icons type="plusempty" size="30"></uni-icons>
                </view>
              </view>
              <text class="upload-tip">点击选择图片上传</text>
            </view>
          </view>

          <!-- 上传简历选项卡 -->
          <view v-if="activeTabIndex === 1" class="upload-tab">
            <view class="resume-uploader">
              <button class="custom-btn primary-btn" @click="chooseResume">选择文件</button>
              <view v-if="resumeFileName" class="file-item">
                <text class="file-name">{{ resumeFileName }}</text>
                <uni-icons type="trash" size="20" color="#dd524d" @click="clearResumeFile"></uni-icons>
              </view>
              <text class="upload-tip">请上传PDF、Word文档格式的简历文件</text>
            </view>
          </view>
        </view>

        <view class="upload-actions">
          <button class="custom-btn" @click="closeUploadPopup">取消</button>
          <button class="custom-btn primary-btn" @click="submitUpload" :disabled="isUploadButtonDisabled">上传</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import {ref, reactive, onMounted, computed} from 'vue';
import {
  getEmployeePage,
  getEmployeeById,
  addOrUpdateEmployee,
  deleteEmployee,
  uploadAvatar,
  uploadResume,
  updateEmployeeRole,
  getEmployeeByUserId
} from '../../api/employee';
import {useEmployeeStore} from "../../store/employeeStore";
import {getAllDepartments} from "../../api/registerApprove";

// 数据列表和分页
const loading = ref(false);
const employeeList = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const name = ref('');
const phone = ref('');

// 弹窗引用
const detailPopup = ref(null);
const formPopup = ref(null);
const uploadPopup = ref(null);

// 详情弹窗
const selectedEmployee = ref(null);

// 编辑/新增表单
const isEdit = ref(false);
const employeeFormRef = ref(null);
const employeeForm = reactive({
  id: null,
  name: '',
  phone: '',
  gender: 1,
  age: 18,
  avatar: '',
  currentAddress: '',
  entryTime: '',
  resumeUrl: '',
  jobDescription: '',
  departmentId: null,
  departmentName: null,
  role: 0,
  userId: null
});
const departmentList = ref([]);

// 表单验证规则
const rules = {
  name: {
    rules: [
      {required: true, errorMessage: '请输入姓名'},
      {minLength: 2, maxLength: 50, errorMessage: '长度在 2 到 50 个字符'}
    ]
  },
  phone: {
    rules: [
      {pattern: /^1[3-9]\d{9}$/, errorMessage: '请输入正确的手机号'}
    ]
  }
};

// 上传相关
const activeTabIndex = ref(0);
const currentEmployeeId = ref(null);
const avatarFile = ref(null);
const avatarUrl = ref('');
const resumeFile = ref(null);
const resumeFileName = ref('');

// 上传按钮禁用状态
const isUploadButtonDisabled = computed(() => {
  if (activeTabIndex.value === 0) {
    return !avatarFile.value;
  } else {
    return !resumeFile.value;
  }
});

// 获取员工列表（分页）
const fetchEmployeeList = async () => {
  loading.value = true;
  try {
    const response = await getEmployeePage(currentPage.value, pageSize.value, name.value, phone.value);
    employeeList.value = response.data.records;
    total.value = response.data.total;
    await updateEmployeeRole();
  } catch (error) {
    console.error('获取员工列表失败:', error);
    uni.showToast({
      title: '获取员工列表失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 分页处理
const handlePageChange = (e) => {
  if (e.type === 'next' || e.type === 'prev') {
    currentPage.value = e.current;
  } else if (e.type === 'pageSize') {
    pageSize.value = e.pageSize;
  }
  fetchEmployeeList();
};

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1;
  fetchEmployeeList();
};

const handleClear = () => {
  name.value = '';
  phone.value = '';
  fetchEmployeeList();
};

// 获取部门列表
const fetchDepartmentList = async () => {
  try {
    const result = await getAllDepartments();
    departmentList.value = result.data;
  } catch (error) {
    console.error('获取部门列表失败:', error);
    uni.showToast({
      title: '获取部门列表失败',
      icon: 'none'
    });
  }
};

// 查看员工详情
const viewEmployeeDetail = async (employee) => {
  loading.value = true;
  try {
    const response = await getEmployeeById(employee.id);
    selectedEmployee.value = response.data;
    detailPopup.value.open();
  } catch (error) {
    console.error('获取员工详情失败:', error);
    uni.showToast({
      title: '获取员工详情失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 关闭详情弹窗
const closeDetailPopup = () => {
  detailPopup.value.close();
};

// 编辑员工
const handleEdit = (employee) => {
  isEdit.value = true;
  fetchDepartmentList();
  Object.assign(employeeForm, employee);
  formPopup.value.open();
};

// 关闭表单弹窗
const closeFormPopup = () => {
  formPopup.value.close();
};

// 新增员工
const openAddDialog = () => {
  fetchDepartmentList();
  isEdit.value = false;
  Object.keys(employeeForm).forEach(key => {
    if (key === 'gender') {
      employeeForm[key] = 1;
    } else if (key === 'age') {
      employeeForm[key] = 18;
    } else if (key === 'role') {
      employeeForm[key] = 0;
    } else {
      employeeForm[key] = '';
    }
  });
  formPopup.value.open();
};

// 提交表单
const submitEmployeeForm = async () => {
  if (!employeeFormRef.value) return;

  try {
    const valid = await employeeFormRef.value.validate();
    if (!valid) return;

    loading.value = true;
    await addOrUpdateEmployee(employeeForm);

    uni.showToast({
      title: isEdit.value ? '修改成功' : '添加成功',
      icon: 'success'
    });

    formPopup.value.close();
    await fetchEmployeeList();
  } catch (error) {
    console.error(isEdit.value ? '修改失败:' : '添加失败:', error);
    uni.showToast({
      title: isEdit.value ? '修改失败' : '添加失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 删除确认
const showDeleteConfirm = (id) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除此员工吗？',
    confirmColor: '#dd524d',
    success: async (res) => {
      if (res.confirm) {
        await handleDelEmployee(id);
      }
    }
  });
};

// 删除员工
const handleDelEmployee = async (id) => {
  loading.value = true;
  try {
    await deleteEmployee(id);
    uni.showToast({
      title: '删除成功',
      icon: 'success'
    });
    await fetchEmployeeList();
  } catch (error) {
    console.error('删除失败:', error);
    uni.showToast({
      title: '删除失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 上传文件相关
const handleUpload = (id) => {
  currentEmployeeId.value = id;
  avatarUrl.value = '';
  avatarFile.value = null;
  resumeFileName.value = '';
  resumeFile.value = null;
  activeTabIndex.value = 0;
  uploadPopup.value.open();
};

// 关闭上传弹窗
const closeUploadPopup = () => {
  uploadPopup.value.close();
};

// 选项卡切换
const onTabChange = (e) => {
  activeTabIndex.value = e.currentIndex;
};

// 选择头像
const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      avatarUrl.value = tempFilePath;
      // 获取文件对象
      avatarFile.value = res.tempFiles[0];
    }
  });
};

// 预览图片
const previewImage = (url) => {
  uni.previewImage({
    urls: [url],
    current: url
  });
};

// 选择简历文件
const chooseResume = () => {
  uni.chooseFile({
    count: 1,
    type: 'all',
    success: (res) => {
      const file = res.tempFiles[0];
      resumeFile.value = file;
      resumeFileName.value = file.name;
    },
    fail: (err) => {
      // 在某些平台上可能不支持chooseFile
      uni.showToast({
        title: '请使用uni.chooseFile API或其他方式选择文件',
        icon: 'none'
      });
    }
  });
};

// 清除简历文件
const clearResumeFile = () => {
  resumeFile.value = null;
  resumeFileName.value = '';
};

// 提交上传
const submitUpload = async () => {
  if (!currentEmployeeId.value) {
    uni.showToast({
      title: '请先选择员工',
      icon: 'none'
    });
    return;
  }

  loading.value = true;
  try {
    if (activeTabIndex.value === 0 && avatarFile.value) {
      await uploadAvatar(currentEmployeeId.value, avatarFile.value);
      uni.showToast({
        title: '头像上传成功',
        icon: 'success'
      });
    } else if (activeTabIndex.value === 1 && resumeFile.value) {
      await uploadResume(currentEmployeeId.value, resumeFile.value);
      uni.showToast({
        title: '简历上传成功',
        icon: 'success'
      });
    } else {
      uni.showToast({
        title: '请先选择文件',
        icon: 'none'
      });
      loading.value = false;
      return;
    }

    uploadPopup.value.close();
    await fetchEmployeeList();
  } catch (error) {
    console.error('上传失败:', error);
    uni.showToast({
      title: '上传失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 打开简历
const openResume = (url) => {
  const resumeUrl = formatResourceUrl(url);

  // 根据平台打开文件
  // #ifdef H5
  window.open(resumeUrl, '_blank');
  // #endif

  // #ifdef APP-PLUS
  uni.downloadFile({
    url: resumeUrl,
    success: (res) => {
      if (res.statusCode === 200) {
        uni.openDocument({
          filePath: res.tempFilePath,
          showMenu: true
        });
      }
    }
  });
  // #endif

  // #ifdef MP
  uni.showToast({
    title: '小程序环境暂不支持在线预览文档',
    icon: 'none'
  });
  // #endif
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未填写';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('日期格式化错误:', error);
    return dateString;
  }
};

// 格式化资源URL
const formatResourceUrl = (url) => {
  if (!url) return '';

  if (url.startsWith('http://localhost:8080/api')) {
    return url;
  }

  try {
    if (url.includes('localhost:7070')) {
      return url.replace('localhost:7070', 'localhost:8080/api');
    } else if (url.startsWith('/')) {
      return `http://localhost:8080/api${url}`;
    } else if (!url.startsWith('http')) {
      return `http://localhost:8080/api/${url}`;
    }
    return url;
  } catch (e) {
    console.error('URL格式化错误:', e);
    return url;
  }
};

onMounted(() => {
  fetchEmployeeList();
});


</script>

<style scoped>
.employee-list-container {
  padding: 20rpx;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
}

/* 搜索区域整体样式 */
.employee-search {
  margin: 30rpx 0;
  padding: 30rpx;
  background-color: #f5f7fa;
  border-radius: 8rpx;
}

/* 搜索容器布局 */
.search-container {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.search-input {
  width: 100%;
}

.search-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 10rpx;
}

/* 表格容器 */
.uni-table-container {
  margin-top: 30rpx;
  width: 100%;
  overflow-x: auto;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  justify-content: center;
}

/* 分页区域 */
.pagination-block {
  margin-top: 30rpx;
  display: flex;
  justify-content: flex-end;
}

/* 弹窗样式 */
.popup-container {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  width: 80vw;
  max-height: 80vh;
}

.detail-popup, .form-popup, .upload-popup {
  width: 90vw;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 20rpx;
  margin-bottom: 30rpx;
}

.popup-title {
  font-size: 34rpx;
  font-weight: bold;
}

.popup-scroll-content {
  max-height: 65vh;
}

/* 部门详情样式 */
.employee-detail {
  padding: 10rpx;
}

.detail-section {
  margin-bottom: 40rpx;
}

.section-header {
  margin: 20rpx 0;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #303133;
}

.detail-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20rpx;
}

.detail-item {
  flex: 1;
  min-width: 300rpx;
  padding: 10rpx;
  border-bottom: 1px dashed #eee;
  display: flex;
}

.detail-item.full {
  flex: 100%;
  width: 100%;
}

.detail-label {
  font-weight: bold;
  color: #666;
  min-width: 160rpx;
}

.detail-value {
  flex: 1;
}

/* 头像和简历部分 */
.avatar-section, .resume-section, .participants-section {
  margin-top: 40rpx;
  margin-bottom: 40rpx;
}

.avatar-container, .resume-container {
  margin-top: 30rpx;
  display: flex;
  justify-content: center;
}

.avatar-small {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
}

.avatar-large {
  width: 300rpx;
  height: 300rpx;
  border-radius: 8rpx;
}

.avatar-placeholder {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder.large {
  width: 300rpx;
  height: 300rpx;
  border-radius: 8rpx;
  border: 1px dashed #d9d9d9;
}

/* 上传相关样式 */
.upload-content {
  margin: 40rpx 0;
}

.upload-tab {
  padding: 20rpx 0;
}

.avatar-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-preview-container {
  width: 300rpx;
  height: 300rpx;
  margin-bottom: 20rpx;
  cursor: pointer;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
}

.resume-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin: 20rpx 0;
  padding: 20rpx;
  border: 1px solid #eee;
  border-radius: 8rpx;
  width: 80%;
}

.file-name {
  flex: 1;
  word-break: break-all;
}

.upload-tip {
  margin-top: 20rpx;
  color: #999;
  font-size: 26rpx;
}

.upload-actions, .form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  margin-top: 40rpx;
}

/* 空状态 */
.empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
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

/* 自定义按钮样式 */
.custom-btn {
  padding: 10rpx 20rpx;
  font-size: 28rpx;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  height: 68rpx;
  background-color: #f8f8f8;
  color: #333;
  border: 1px solid #ddd;
}

.primary-btn {
  background-color: #2979ff;
  color: white;
  border: none;
}

.success-btn {
  background-color: #19be6b;
  color: white;
  border: none;
}

.warning-btn {
  background-color: #ff9900;
  color: white;
  border: none;
}

.danger-btn {
  background-color: #fa3534;
  color: white;
  border: none;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 响应式调整 */
@media screen and (min-width: 768rpx) {
  .search-container {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }

  .search-input {
    width: 320rpx;
  }

  .detail-row {
    flex-wrap: nowrap;
  }

  .detail-item {
    min-width: 0;
  }
}
</style>