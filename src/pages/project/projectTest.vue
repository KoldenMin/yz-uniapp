<template>
  <view class="project-test-list-container">
    <uni-card>
      <view class="card-header">
        <text class="card-title">测试用例列表</text>
        <button class="custom-btn primary-btn" @click="openAddDialog">新增测试用例</button>
      </view>

      <uni-notice-bar
          text="这里显示了所有项目的测试用例信息"
          type="info"
          show-icon
          :scrollable="false"
          style="margin-bottom: 20rpx;"
      />

      <view class="test-search">
        <view class="search-container">
          <uni-easyinput placeholder="测试名称查询" v-model="testName" class="search-input"></uni-easyinput>
          <uni-easyinput placeholder="测试类型查询" v-model="testType" class="search-input"></uni-easyinput>
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
            <uni-th width="120">测试名称</uni-th>
            <uni-th width="120">所属项目</uni-th>
            <uni-th width="120">测试人员</uni-th>
            <uni-th width="120">测试类型</uni-th>
            <uni-th align="center" width="80">优先级</uni-th>
            <uni-th align="center" width="100">状态</uni-th>
            <uni-th width="120">添加日期</uni-th>
            <uni-th align="center" width="250">操作</uni-th>
          </uni-tr>

          <uni-tr v-for="(item, index) in testList" :key="item.id">
            <uni-td align="center">{{ index + 1 }}</uni-td>
            <uni-td>{{ item.testName }}</uni-td>
            <uni-td>{{ item.projectName }}</uni-td>
            <uni-td>{{ item.testerName }}</uni-td>
            <uni-td>{{ item.testType }}</uni-td>
            <uni-td align="center">
              <uni-tag :text="item.priority" :type="getPriorityType(item.priority)"></uni-tag>
            </uni-td>
            <uni-td align="center">
              <uni-tag :text="item.status" :type="getStatusType(item.status)"></uni-tag>
            </uni-td>
            <uni-td>{{ dateFormatter(null, null, item.addDate) }}</uni-td>
            <uni-td align="center">
              <view class="action-buttons">
                <button class="custom-btn primary-btn" @click="viewTestDetail(item)">查看详情</button>
                <button class="custom-btn warning-btn" @click="handleEdit(item)">编辑</button>
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
            :pageSizeRange="[5, 10, 20, 50]"
        ></uni-pagination>
      </view>
    </uni-card>

    <!-- 测试用例详情弹窗 -->
    <uni-popup ref="detailPopup" type="center">
      <view class="popup-container detail-popup">
        <view class="popup-header">
          <text class="popup-title">测试用例详情</text>
          <uni-icons type="close" size="20" @click="closeDetailPopup"></uni-icons>
        </view>

        <scroll-view scroll-y="true" class="popup-scroll-content">
          <view v-if="selectedTest" class="test-detail">
            <!-- 基本信息部分 -->
            <view class="detail-section">
              <view class="detail-row">
                <view class="detail-item">
                  <text class="detail-label">测试ID:</text>
                  <text class="detail-value">{{ selectedTest.id }}</text>
                </view>
                <view class="detail-item">
                  <text class="detail-label">测试名称:</text>
                  <text class="detail-value">{{ selectedTest.testName }}</text>
                </view>
              </view>

              <view class="detail-row">
                <view class="detail-item">
                  <text class="detail-label">所属项目:</text>
                  <text class="detail-value">{{ selectedTest.projectName }}</text>
                </view>
                <view class="detail-item">
                  <text class="detail-label">测试人员:</text>
                  <text class="detail-value">{{ selectedTest.testerName }}</text>
                </view>
              </view>

              <view class="detail-row">
                <view class="detail-item">
                  <text class="detail-label">测试类型:</text>
                  <text class="detail-value">{{ selectedTest.testType }}</text>
                </view>
                <view class="detail-item">
                  <text class="detail-label">优先级:</text>
                  <view class="detail-value">
                    <uni-tag :text="selectedTest.priority" :type="getPriorityType(selectedTest.priority)"></uni-tag>
                  </view>
                </view>
              </view>

              <view class="detail-row">
                <view class="detail-item">
                  <text class="detail-label">状态:</text>
                  <view class="detail-value">
                    <uni-tag :text="selectedTest.status" :type="getStatusType(selectedTest.status)"></uni-tag>
                  </view>
                </view>
                <view class="detail-item">
                  <text class="detail-label">添加日期:</text>
                  <text class="detail-value">{{ dateFormatter(null, null, selectedTest.addDate) }}</text>
                </view>
              </view>
            </view>

            <!-- 测试步骤部分 -->
            <view class="test-steps-section">
              <view class="section-header">
                <text class="section-title">测试步骤</text>
              </view>
              <view class="content-card">
                <text class="step-content">{{ selectedTest.step || '暂无测试步骤' }}</text>
              </view>
            </view>

            <!-- 测试结果部分 -->
            <view class="test-results-section">
              <view class="section-header">
                <text class="section-title">测试结果</text>
              </view>
              <view class="result-grid">
                <view class="result-card">
                  <view class="result-card-header">
                    <text class="result-card-title">预期结果</text>
                  </view>
                  <text class="result-content">{{ selectedTest.expectedResult || '暂无预期结果' }}</text>
                </view>

                <view class="result-card">
                  <view class="result-card-header">
                    <text class="result-card-title">实际结果</text>
                  </view>
                  <text class="result-content">{{ selectedTest.actualResult || '暂无实际结果' }}</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </uni-popup>

    <!-- 新增/编辑测试用例弹窗 -->
    <uni-popup ref="editPopup" type="center">
      <view class="popup-container form-popup">
        <view class="popup-header">
          <text class="popup-title">{{ dialogTitle }}</text>
          <uni-icons type="close" size="20" @click="closeEditPopup"></uni-icons>
        </view>

        <scroll-view scroll-y="true" class="popup-scroll-content">
          <uni-forms
              ref="testFormRef"
              :model="testForm"
              :rules="rules"
              label-position="top"
          >
            <uni-forms-item label="测试名称" name="testName">
              <uni-easyinput v-model="testForm.testName" placeholder="请输入测试名称"/>
            </uni-forms-item>

            <uni-forms-item label="所属项目" name="projectId">
              <uni-data-select
                  v-model="testForm.projectId"
                  :localdata="projectOptions.map(item => ({text: item.name, value: item.id}))"
                  placeholder="请选择项目"
              ></uni-data-select>
            </uni-forms-item>

            <uni-forms-item label="测试人员" name="testerId">
              <uni-data-select
                  v-model="testForm.testerId"
                  :localdata="employeeOptions.map(item => ({text: item.employeeName, value: item.employeeId}))"
                  placeholder="请选择测试人员"
                  :disabled="!testForm.projectId"
              ></uni-data-select>

              <view v-if="!testForm.projectId" class="form-tip">
                <uni-notice-bar
                    text="请先选择项目，再选择测试人员"
                    type="info"
                    show-icon
                    :scrollable="false"
                ></uni-notice-bar>
              </view>

              <view v-else-if="employeeOptions.length === 0" class="form-tip">
                <uni-notice-bar
                    text="该项目暂无参与人员"
                    type="warning"
                    show-icon
                    :scrollable="false"
                ></uni-notice-bar>
              </view>
            </uni-forms-item>

            <uni-forms-item label="测试类型" name="testType">
              <uni-easyinput v-model="testForm.testType" placeholder="请输入测试类型"/>
            </uni-forms-item>

            <uni-forms-item label="优先级" name="priority">
              <uni-data-select
                  v-model="testForm.priority"
                  :localdata="[
                  {text: '高', value: 'P0'},
                  {text: '中', value: 'P1'},
                  {text: '低', value: 'P2'}
                ]"
                  placeholder="请选择优先级"
              ></uni-data-select>
            </uni-forms-item>

            <uni-forms-item label="状态" name="status">
              <uni-data-select
                  v-model="testForm.status"
                  :localdata="[
                  {text: '待测试', value: '待测试'},
                  {text: '进行中', value: '进行中'},
                  {text: '已完成', value: '已完成'},
                  {text: '失败', value: '失败'}
                ]"
                  placeholder="请选择状态"
              ></uni-data-select>
            </uni-forms-item>

            <uni-forms-item label="添加日期" name="addDate">
              <uni-datetime-picker
                  v-model="testForm.addDate"
                  type="date"
                  return-type="string"
                  placeholder="请选择日期"
              />
            </uni-forms-item>

            <uni-forms-item label="测试步骤" name="step">
              <uni-easyinput
                  v-model="testForm.step"
                  type="textarea"
                  placeholder="请输入测试步骤"
                  height="200"
              />
            </uni-forms-item>

            <uni-forms-item label="预期结果" name="expectedResult">
              <uni-easyinput
                  v-model="testForm.expectedResult"
                  type="textarea"
                  placeholder="请输入预期结果"
                  height="150"
              />
            </uni-forms-item>

            <uni-forms-item label="实际结果" name="actualResult">
              <uni-easyinput
                  v-model="testForm.actualResult"
                  type="textarea"
                  placeholder="请输入实际结果"
                  height="150"
              />
            </uni-forms-item>

            <view class="form-actions">
              <button class="custom-btn" @click="closeEditPopup">取消</button>
              <button class="custom-btn primary-btn" @click="submitForm">确认</button>
            </view>
          </uni-forms>
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import {onMounted, reactive, ref, watch} from 'vue';
import {addOrUpdateProjectTest, deleteProjectTest, getProjectTestInfo, getProjectTestPage} from '../../api/projectTest';
import {getProjectList} from '../../api/project';
import {getProjectParticipantByProjectId} from '../../api/projectParticipant';


// 数据加载和列表状态
const loading = ref(false);
const testList = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const testName = ref('');
const testType = ref('');

// 弹窗引用
const detailPopup = ref(null);
const editPopup = ref(null);

// 详情对话框状态
const selectedTest = ref(null);

// 编辑对话框状态
const dialogTitle = ref('新增测试用例');
const testForm = reactive({
  id: null,
  testName: '',
  projectId: null,
  testerId: null,
  testType: '',
  priority: '',
  status: '待测试',
  addDate: new Date().toISOString().split('T')[0], // yyyy-MM-dd格式
  step: '',
  expectedResult: '',
  actualResult: '',
});
const testFormRef = ref(null);
const projectOptions = ref([]);
const employeeOptions = ref([]);

// 表单验证规则
const rules = {
  testName: {
    rules: [{required: true, errorMessage: '请输入测试名称'}]
  },
  projectId: {
    rules: [{required: true, errorMessage: '请选择所属项目'}]
  },
  testerId: {
    rules: [{required: true, errorMessage: '请选择测试人员'}]
  },
  priority: {
    rules: [{required: true, errorMessage: '请选择优先级'}]
  },
  status: {
    rules: [{required: true, errorMessage: '请选择状态'}]
  }
};

// 获取优先级对应的Tag类型
const getPriorityType = (priority) => {
  switch (priority) {
    case 'P0':
      return 'error';
    case 'P1':
      return 'warning';
    case 'P2':
      return 'info';
    default:
      return '';
  }
};

// 获取状态对应的Tag类型
const getStatusType = (status) => {
  switch (status) {
    case '已完成':
      return 'success';
    case '失败':
      return 'error';
    case '进行中':
      return 'warning';
    case '待测试':
      return 'info';
    default:
      return '';
  }
};

// 分页处理
const handlePageChange = (e) => {
  if (e.type === 'next' || e.type === 'prev') {
    currentPage.value = e.current;
  } else if (e.type === 'pageSize') {
    pageSize.value = e.pageSize;
  }
  fetchPageTestList();
};

// 搜索和清空
const handleSearch = () => {
  currentPage.value = 1;
  fetchPageTestList();
};

const handleClear = () => {
  testName.value = '';
  testType.value = '';
  fetchPageTestList();
};

// 关闭弹窗方法
const closeDetailPopup = () => {
  detailPopup.value.close();
};

const closeEditPopup = () => {
  editPopup.value.close();
};

// 显示删除确认
const showDeleteConfirm = (id) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除此测试用例吗？',
    confirmColor: '#dd524d',
    success: async (res) => {
      if (res.confirm) {
        await handleDelete(id);
      }
    }
  });
};

// 删除测试用例
const handleDelete = async (id) => {
  try {
    await deleteProjectTest(id);
    uni.showToast({
      title: '删除测试用例成功',
      icon: 'success'
    });
    await fetchPageTestList();
  } catch (error) {
    uni.showToast({
      title: '删除测试用例失败',
      icon: 'none'
    });
  }
};

// 查看测试用例详情
const viewTestDetail = async (test) => {
  loading.value = true;
  try {
    const response = await getProjectTestInfo(test.id);
    selectedTest.value = response.data;
    detailPopup.value.open();
  } catch (error) {
    console.error('获取测试用例详情失败:', error);
    uni.showToast({
      title: '获取测试用例详情失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 编辑测试用例
const handleEdit = async (test) => {
  dialogTitle.value = '编辑测试用例';

  // 获取最新的测试用例详情
  try {
    loading.value = true;
    const response = await getProjectTestInfo(test.id);
    const testData = response.data;

    // 填充表单
    Object.keys(testForm).forEach(key => {
      if (key in testData) {
        testForm[key] = testData[key];
      }
    });

    // 先获取项目参与人员，确保测试人员下拉列表已更新
    if (testForm.projectId) {
      await fetchProjectParticipants(testForm.projectId);
    }

    // 打开编辑对话框
    editPopup.value.open();
  } catch (error) {
    console.error('获取测试用例详情失败:', error);
    uni.showToast({
      title: '获取测试用例详情失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 新增测试用例
const openAddDialog = () => {
  dialogTitle.value = '新增测试用例';

  // 重置表单
  Object.keys(testForm).forEach(key => {
    if (key === 'addDate') {
      testForm[key] = new Date().toISOString().split('T')[0]; // yyyy-MM-dd格式
    } else if (key === 'status') {
      testForm[key] = '待测试';
    } else {
      testForm[key] = key === 'id' ? null : '';
    }
  });

  editPopup.value.open();
};

// 提交表单
const submitForm = async () => {
  if (!testFormRef.value) return;

  try {
    const valid = await testFormRef.value.validate();
    if (!valid) return;

    loading.value = true;
    await addOrUpdateProjectTest(testForm);

    uni.showToast({
      title: `${testForm.id ? '更新' : '新增'}测试用例成功`,
      icon: 'success'
    });

    editPopup.value.close();
    await fetchPageTestList();
  } catch (error) {
    uni.showToast({
      title: `${testForm.id ? '更新' : '新增'}测试用例失败`,
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 获取项目选项
const fetchProjectOptions = async () => {
  try {
    // 获取项目列表
    const projectResponse = await getProjectList();
    projectOptions.value = projectResponse.data || [];
  } catch (error) {
    console.error('获取项目数据失败:', error);
    uni.showToast({
      title: '获取项目数据失败',
      icon: 'none'
    });
  }
};

// 根据项目ID获取参与人员
const fetchProjectParticipants = async (projectId) => {
  if (!projectId) {
    employeeOptions.value = [];
    return;
  }

  try {
    loading.value = true;
    const response = await getProjectParticipantByProjectId(projectId);
    if (response && response.data) {
      employeeOptions.value = response.data;
    } else {
      employeeOptions.value = [];
    }
  } catch (error) {
    console.error('获取项目参与人员失败:', error);
    uni.showToast({
      title: '获取项目参与人员失败',
      icon: 'none'
    });
    employeeOptions.value = [];
  } finally {
    loading.value = false;
  }
};

// 获取测试用例列表（分页）
const fetchPageTestList = async () => {
  loading.value = true;
  try {
    const response = await getProjectTestPage(
        currentPage.value,
        pageSize.value,
        testName.value,
        testType.value
    );
    testList.value = response.data.records;
    total.value = response.data.total;
  } catch (error) {
    console.error('获取测试用例列表失败:', error);
    uni.showToast({
      title: '获取测试用例列表失败',
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
  return date.toLocaleDateString();
};

// 监听项目ID变化，更新测试人员选项
watch(() => testForm.projectId, async (newProjectId) => {
  if (newProjectId) {
    // 当选择项目后，获取该项目的参与人员
    await fetchProjectParticipants(newProjectId);

    // 如果当前选中的测试人员不在新的项目参与人员中，则清空选择
    if (testForm.testerId) {
      const testerExists = employeeOptions.value.some(emp => emp.employeeId === testForm.testerId);
      if (!testerExists) {
        testForm.testerId = null;
      }
    }
  } else {
    // 如果未选择项目，清空测试人员选项
    employeeOptions.value = [];
    testForm.testerId = null;
  }
});

// 组件挂载时加载数据
onMounted(() => {
  fetchPageTestList();
  fetchProjectOptions();
});


</script>

<style scoped>
.project-test-list-container {
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
.test-search {
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

/* 详情样式 */
.test-detail {
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

.detail-label {
  font-weight: bold;
  color: #666;
  min-width: 160rpx;
}

.detail-value {
  flex: 1;
}

/* 测试步骤和结果样式 */
.test-steps-section, .test-results-section {
  margin-top: 40rpx;
}

.content-card {
  padding: 20rpx;
  border: 1px solid #eee;
  border-radius: 8rpx;
  background-color: #f8f8f8;
}

.step-content, .result-content {
  white-space: pre-line;
  line-height: 1.6;
  font-size: 28rpx;
}

.result-grid {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.result-card {
  border: 1px solid #eee;
  border-radius: 8rpx;
  overflow: hidden;
  background-color: #fff;
}

.result-card-header {
  padding: 16rpx 20rpx;
  background-color: #f2f6fc;
  border-bottom: 1px solid #ebeef5;
}

.result-card-title {
  font-weight: bold;
  font-size: 28rpx;
  color: #303133;
}

.result-content {
  padding: 20rpx;
  display: block;
}

/* 表单相关样式 */
.form-tip {
  margin-top: 10rpx;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  margin-top: 40rpx;
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

  .result-grid {
    flex-direction: row;
  }

  .result-card {
    flex: 1;
  }
}
</style>