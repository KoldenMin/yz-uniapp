<template>
  <view class="project-list-container">
    <uni-card>
      <view class="card-header">
        <text class="card-title">项目列表</text>
        <button class="custom-btn primary-btn" @click="openAddProject">创建项目</button>
      </view>

      <uni-notice-bar
          text="这里显示了系统中所有项目的信息列表"
          type="info"
          show-icon
          :scrollable="false"
          style="margin-bottom: 20rpx;"
      />

      <view class="project-search">
        <view class="search-container">
          <uni-easyinput placeholder="项目名称" v-model="name" class="search-input"></uni-easyinput>
          <uni-easyinput placeholder="项目概述" v-model="description" class="search-input"></uni-easyinput>
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
            <uni-th width="200">项目名称</uni-th>
            <uni-th width="240">项目时间</uni-th>
            <uni-th>项目概述</uni-th>
            <uni-th align="center" width="100">参与人数</uni-th>
            <uni-th align="center" width="180">创建时间</uni-th>
            <uni-th align="center" width="320">操作</uni-th>
          </uni-tr>

          <uni-tr v-for="(item, index) in projectList" :key="item.id">
            <uni-td align="center">{{ index + 1 }}</uni-td>
            <uni-td>{{ item.name }}</uni-td>
            <uni-td>{{ formatDateRange(item.startDate, item.endDate) }}</uni-td>
            <uni-td class="ellipsis">{{ item.description }}</uni-td>
            <uni-td align="center">{{ item.participantCount }}</uni-td>
            <uni-td align="center">{{ dateFormatter(null, null, item.createTime) }}</uni-td>
            <uni-td align="center">
              <view class="action-buttons">
                <button class="custom-btn primary-btn" @click="viewProjectDetail(item)">查看详情</button>
                <button class="custom-btn warning-btn" @click="editProject(item)">编辑项目</button>
                <button class="custom-btn danger-btn" @click="showDeleteConfirm(item.id)">删除项目</button>
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

    <!-- 项目详情弹窗 -->
    <uni-popup ref="detailPopup" type="center">
      <view class="popup-container detail-popup">
        <view class="popup-header">
          <text class="popup-title">项目详情</text>
          <uni-icons type="close" size="20" @click="closeDetailPopup"></uni-icons>
        </view>

        <scroll-view scroll-y="true" class="popup-scroll-content">
          <view v-if="selectedProject" class="project-detail">
            <!-- 基本信息部分 -->
            <view class="detail-section">
              <view class="detail-row">
                <view class="detail-item">
                  <text class="detail-label">项目名称:</text>
                  <text class="detail-value">{{ selectedProject.name }}</text>
                </view>
                <view class="detail-item">
                  <text class="detail-label">项目时间:</text>
                  <text class="detail-value">{{
                      formatDateRange(selectedProject.startDate, selectedProject.endDate)
                    }}
                  </text>
                </view>
              </view>

              <view class="detail-row">
                <view class="detail-item">
                  <text class="detail-label">参与人数:</text>
                  <text class="detail-value">{{ selectedProject.participantCount }}</text>
                </view>
                <view class="detail-item">
                  <text class="detail-label">创建时间:</text>
                  <text class="detail-value">{{ dateFormatter(null, null, selectedProject.createTime) }}</text>
                </view>
              </view>

              <view class="detail-row full">
                <view class="detail-item full">
                  <text class="detail-label">项目概述:</text>
                  <text class="detail-value">{{ selectedProject.description || '无' }}</text>
                </view>
              </view>
            </view>

            <!-- 参与人员部分 -->
            <view class="participants-section">
              <view class="section-header">
                <text class="section-title">参与人员</text>
              </view>

              <view v-if="selectedProject.participantEmployees && selectedProject.participantEmployees.length > 0">
                <uni-table border>
                  <uni-tr>
                    <uni-th width="120">姓名</uni-th>
                    <uni-th align="center" width="80">性别</uni-th>
                    <uni-th width="150">电话</uni-th>
                    <uni-th>职能描述</uni-th>
                  </uni-tr>

                  <uni-tr v-for="emp in selectedProject.participantEmployees" :key="emp.id">
                    <uni-td>{{ emp.name }}</uni-td>
                    <uni-td align="center">{{ emp.gender === 1 ? '男' : '女' }}</uni-td>
                    <uni-td>{{ emp.phone }}</uni-td>
                    <uni-td class="ellipsis">{{ emp.jobDescription }}</uni-td>
                  </uni-tr>
                </uni-table>
              </view>
              <view v-else class="empty-placeholder">
                <image src="/static/images/empty.png" class="empty-image"></image>
                <text class="empty-text">暂无参与人员</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </uni-popup>

    <!-- 添加/编辑项目弹窗 -->
    <uni-popup ref="formPopup" type="center">
      <view class="popup-container form-popup">
        <view class="popup-header">
          <text class="popup-title">{{ isEdit ? '编辑项目' : '创建项目' }}</text>
          <uni-icons type="close" size="20" @click="closeFormPopup"></uni-icons>
        </view>

        <uni-forms
            ref="projectFormRef"
            :model="projectForm"
            :rules="formRules"
            label-position="top"
        >
          <uni-forms-item label="项目名称" name="name">
            <uni-easyinput v-model="projectForm.name" placeholder="请输入项目名称"/>
          </uni-forms-item>

          <uni-forms-item label="开始日期" name="startDate">
            <uni-datetime-picker
                v-model="projectForm.startDate"
                type="date"
                return-type="string"
                placeholder="请选择开始日期"
            />
          </uni-forms-item>

          <uni-forms-item label="结束日期" name="endDate">
            <uni-datetime-picker
                v-model="projectForm.endDate"
                type="date"
                return-type="string"
                placeholder="请选择结束日期"
            />
          </uni-forms-item>

          <uni-forms-item label="项目概述" name="description">
            <uni-easyinput
                v-model="projectForm.description"
                type="textarea"
                placeholder="请输入项目概述"
                height="200"
            />
          </uni-forms-item>

          <view class="form-actions">
            <button class="custom-btn" @click="closeFormPopup">取消</button>
            <button class="custom-btn primary-btn" @click="submitProjectForm">确认</button>
          </view>
        </uni-forms>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import {ref, onMounted, reactive} from 'vue';
import {
  getProjectPage,
  addOrUpdateProject,
  deleteProject,
  getProjectInfo,
  getProjectWithUsers,
  updateProjectParticipantCount
} from '../../api/project';

// 数据状态
const loading = ref(false);
const projectList = ref([]);
const selectedProject = ref(null);
const isEdit = ref(false);
const projectFormRef = ref(null);

// 弹窗引用
const detailPopup = ref(null);
const formPopup = ref(null);

// 分页参数
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const name = ref('');
const description = ref('');

// 表单数据
const projectForm = reactive({
  id: null,
  name: '',
  startDate: '',
  endDate: '',
  description: '',
  participantCount: 0
});

// 表单校验规则
const formRules = {
  name: {
    rules: [
      {required: true, errorMessage: '请输入项目名称'},
      {minLength: 2, maxLength: 100, errorMessage: '长度在 2 到 100 个字符'}
    ]
  },
  description: {
    rules: [
      {maxLength: 500, errorMessage: '长度不能超过 500 个字符'}
    ]
  }
};

// 清空表单
const resetForm = () => {
  if (projectFormRef.value) {
    projectFormRef.value.clearValidate();
  }
  projectForm.id = null;
  projectForm.name = '';
  projectForm.startDate = '';
  projectForm.endDate = '';
  projectForm.description = '';
  projectForm.participantCount = 0;
};

// 打开创建项目对话框
const openAddProject = () => {
  isEdit.value = false;
  resetForm();
  formPopup.value.open();
};

// 关闭表单弹窗
const closeFormPopup = () => {
  formPopup.value.close();
};

// 关闭详情弹窗
const closeDetailPopup = () => {
  detailPopup.value.close();
};

// 打开编辑项目对话框
const editProject = (row) => {
  isEdit.value = true;
  resetForm();
  projectForm.id = row.id;
  projectForm.name = row.name;
  projectForm.startDate = row.startDate;
  projectForm.endDate = row.endDate;
  projectForm.description = row.description;
  projectForm.participantCount = row.participantCount || 0;

  formPopup.value.open();
};

// 提交项目表单
const submitProjectForm = async () => {
  if (!projectFormRef.value) return;

  try {
    const valid = await projectFormRef.value.validate();
    if (!valid) return;

    loading.value = true;
    await addOrUpdateProject(projectForm);

    uni.showToast({
      title: isEdit.value ? '更新项目成功' : '创建项目成功',
      icon: 'success'
    });

    formPopup.value.close();
    fetchProjectList();
  } catch (error) {
    uni.showToast({
      title: isEdit.value ? '更新项目失败' : '创建项目失败',
      icon: 'none'
    });
    console.error(error);
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
  fetchProjectList();
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchProjectList();
};

// 清空搜索
const handleClear = () => {
  name.value = '';
  description.value = '';
  fetchProjectList();
};

// 显示删除确认
const showDeleteConfirm = (id) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除此项目吗？',
    confirmColor: '#dd524d',
    success: async (res) => {
      if (res.confirm) {
        await handleDelProject(id);
      }
    }
  });
};

// 删除项目
const handleDelProject = async (id) => {
  try {
    loading.value = true;
    await deleteProject(id);

    uni.showToast({
      title: '删除项目成功',
      icon: 'success'
    });

    fetchProjectList();
  } catch (error) {
    uni.showToast({
      title: '删除项目失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 查看项目详情
const viewProjectDetail = async (project) => {
  loading.value = true;
  try {
    const response = await getProjectWithUsers(project.id);
    selectedProject.value = response.data;
    detailPopup.value.open();
  } catch (error) {
    console.error('获取项目详情失败:', error);
    uni.showToast({
      title: '获取项目详情失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 获取项目列表
const fetchProjectList = async () => {
  loading.value = true;
  try {
    const response = await getProjectPage(
        currentPage.value,
        pageSize.value,
        name.value,
        description.value
    );
    projectList.value = response.data.records;
    total.value = response.data.total;
  } catch (error) {
    console.error('获取项目列表失败:', error);
    uni.showToast({
      title: '获取项目列表失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 格式化日期
const dateFormatter = (row, column, cellValue) => {
  if (!cellValue) return '-';
  const date = new Date(cellValue);
  return date.toLocaleString();
};

// 格式化日期范围
const formatDateRange = (startDate, endDate) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const start = startDate ? formatDate(startDate) : '未设置';
  const end = endDate ? formatDate(endDate) : '未设置';
  return `${start} 至 ${end}`;
};

// 页面加载时获取项目列表
onMounted(() => {
  fetchProjectList();
});


</script>

<style scoped>
.project-list-container {
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
.project-search {
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

.detail-popup, .form-popup {
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

/* 项目详情样式 */
.project-detail {
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

.participants-section {
  margin-top: 40rpx;
  margin-bottom: 40rpx;
}

/* 表单操作按钮 */
.form-actions {
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