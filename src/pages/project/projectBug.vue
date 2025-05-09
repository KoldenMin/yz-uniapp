<template>
  <view class="project-bug-list-container">
    <uni-card>
      <view class="card-header">
        <text class="card-title">项目Bug列表</text>
        <button class="custom-btn primary-btn" @click="openAddDialog">新增Bug</button>
      </view>

      <uni-notice-bar
          text="这里显示了所有项目的Bug信息"
          type="info"
          show-icon
          :scrollable="false"
          style="margin-bottom: 20rpx;"
      />

      <view class="bug-search">
        <view class="search-container">
          <uni-easyinput placeholder="Bug标题查询" v-model="bugTitle" class="search-input"></uni-easyinput>
          <uni-easyinput placeholder="Bug类型查询" v-model="bugType" class="search-input"></uni-easyinput>
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
            <uni-th width="120">Bug标题</uni-th>
            <uni-th width="120">所属项目</uni-th>
            <uni-th width="120">测试人员</uni-th>
            <uni-th width="120">Bug类型</uni-th>
            <uni-th width="120">操作系统</uni-th>
            <uni-th width="120">浏览器</uni-th>
            <uni-th align="center" width="100">修复状态</uni-th>
            <uni-th align="center" width="100">确认状态</uni-th>
            <uni-th align="center" width="250">操作</uni-th>
          </uni-tr>

          <uni-tr v-for="(item, index) in bugList" :key="item.id">
            <uni-td align="center">{{ index + 1 }}</uni-td>
            <uni-td>{{ item.title }}</uni-td>
            <uni-td>{{ item.projectName }}</uni-td>
            <uni-td>{{ item.testerName }}</uni-td>
            <uni-td>{{ item.bugType }}</uni-td>
            <uni-td>{{ item.system }}</uni-td>
            <uni-td>{{ item.browser }}</uni-td>
            <uni-td align="center">
              <uni-tag :text="item.isResolved ? '已解决' : '未解决'"
                       :type="item.isResolved ? 'success' : 'error'"></uni-tag>
            </uni-td>
            <uni-td align="center">
              <uni-tag :text="item.isConfirmed ? '已确认' : '未确认'"
                       :type="item.isConfirmed ? 'success' : 'info'"></uni-tag>
            </uni-td>
            <uni-td align="center">
              <view class="action-buttons">
                <button class="custom-btn primary-btn" @click="viewBugDetail(item)">查看详情</button>
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
            :pageSizeRange="[2, 3, 5, 10]"
        ></uni-pagination>
      </view>
    </uni-card>

    <!-- Bug详情弹窗 -->
    <uni-popup ref="detailPopup" type="center">
      <view class="popup-container detail-popup">
        <view class="popup-header">
          <text class="popup-title">Bug详情</text>
          <uni-icons type="close" size="20" @click="closeDetailPopup"></uni-icons>
        </view>

        <scroll-view scroll-y="true" class="popup-scroll-content">
          <view v-if="selectedBug" class="bug-detail">
            <!-- 基本信息部分 -->
            <view class="detail-section">
              <view class="detail-row">
                <view class="detail-item">
                  <text class="detail-label">Bug ID:</text>
                  <text class="detail-value">{{ selectedBug.id }}</text>
                </view>
                <view class="detail-item">
                  <text class="detail-label">Bug标题:</text>
                  <text class="detail-value">{{ selectedBug.title }}</text>
                </view>
              </view>

              <view class="detail-row">
                <view class="detail-item">
                  <text class="detail-label">所属项目:</text>
                  <text class="detail-value">{{ selectedBug.projectName }}</text>
                </view>
                <view class="detail-item">
                  <text class="detail-label">测试人员:</text>
                  <text class="detail-value">{{ selectedBug.testerName }}</text>
                </view>
              </view>

              <view class="detail-row">
                <view class="detail-item">
                  <text class="detail-label">Bug类型:</text>
                  <text class="detail-value">{{ selectedBug.bugType }}</text>
                </view>
                <view class="detail-item">
                  <text class="detail-label">操作系统:</text>
                  <text class="detail-value">{{ selectedBug.system }}</text>
                </view>
              </view>

              <view class="detail-row">
                <view class="detail-item">
                  <text class="detail-label">浏览器:</text>
                  <text class="detail-value">{{ selectedBug.browser }}</text>
                </view>
                <view class="detail-item">
                  <text class="detail-label">修复状态:</text>
                  <view class="detail-value">
                    <uni-tag :text="selectedBug.isResolved ? '已解决' : '未解决'"
                             :type="selectedBug.isResolved ? 'success' : 'error'"></uni-tag>
                  </view>
                </view>
              </view>

              <view class="detail-row">
                <view class="detail-item">
                  <text class="detail-label">确认状态:</text>
                  <view class="detail-value">
                    <uni-tag :text="selectedBug.isConfirmed ? '已确认' : '未确认'"
                             :type="selectedBug.isConfirmed ? 'success' : 'info'"></uni-tag>
                  </view>
                </view>
              </view>
            </view>

            <!-- 复现步骤部分 -->
            <view class="bug-steps-section">
              <view class="section-header">
                <text class="section-title">复现步骤</text>
              </view>
              <view class="content-card">
                <text class="step-content">{{ selectedBug.step || '暂无复现步骤' }}</text>
              </view>
            </view>

            <!-- 相关需求部分 -->
            <view class="bug-requirement-section">
              <view class="section-header">
                <text class="section-title">相关需求</text>
              </view>
              <view class="content-card">
                <text class="requirement-content">{{ selectedBug.requirement || '暂无相关需求' }}</text>
              </view>
            </view>

            <!-- 解决方案部分 -->
            <view class="bug-solution-section">
              <view class="section-header">
                <text class="section-title">解决方案</text>
              </view>
              <view class="content-card">
                <text class="solution-content">{{ selectedBug.solution || '暂无解决方案' }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </uni-popup>

    <!-- 新增/编辑Bug弹窗 -->
    <uni-popup ref="editPopup" type="center">
      <view class="popup-container form-popup">
        <view class="popup-header">
          <text class="popup-title">{{ dialogTitle }}</text>
          <uni-icons type="close" size="20" @click="closeEditPopup"></uni-icons>
        </view>

        <scroll-view scroll-y="true" class="popup-scroll-content">
          <uni-forms
              ref="bugFormRef"
              :model="bugForm"
              :rules="rules"
              label-position="top"
          >
            <uni-forms-item label="Bug标题" name="title">
              <uni-easyinput v-model="bugForm.title" placeholder="请输入Bug标题"/>
            </uni-forms-item>

            <uni-forms-item label="所属项目" name="projectId">
              <uni-data-select
                  v-model="bugForm.projectId"
                  :localdata="projectOptions.map(item => ({text: item.name, value: item.id}))"
                  placeholder="请选择项目"
              ></uni-data-select>
            </uni-forms-item>

            <uni-forms-item label="测试人员" name="testerId">
              <uni-data-select
                  v-model="bugForm.testerId"
                  :localdata="employeeOptions.map(item => ({text: item.employeeName, value: item.employeeId}))"
                  placeholder="请选择测试人员"
                  :disabled="!bugForm.projectId"
              ></uni-data-select>

              <view v-if="!bugForm.projectId" class="form-tip">
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

            <uni-forms-item label="Bug类型" name="bugType">
              <uni-easyinput v-model="bugForm.bugType" placeholder="请输入Bug类型"/>
            </uni-forms-item>

            <uni-forms-item label="操作系统" name="system">
              <uni-easyinput v-model="bugForm.system" placeholder="请输入操作系统"/>
            </uni-forms-item>

            <uni-forms-item label="浏览器" name="browser">
              <uni-easyinput v-model="bugForm.browser" placeholder="请输入浏览器"/>
            </uni-forms-item>

            <uni-forms-item label="处理人" name="assigneeId">
              <uni-data-select
                  v-model="bugForm.assigneeId"
                  :localdata="employeeOptions.map(item => ({text: item.employeeName, value: item.employeeId}))"
                  placeholder="请选择处理人"
                  :disabled="!bugForm.projectId"
              ></uni-data-select>
            </uni-forms-item>

            <uni-forms-item label="是否解决" name="isResolved">
              <uni-data-select
                  v-model="bugForm.isResolved"
                  :localdata="[
                  {text: '已解决', value: true},
                  {text: '未解决', value: false}
                ]"
                  placeholder="请选择状态"
              ></uni-data-select>
            </uni-forms-item>

            <uni-forms-item label="是否确认" name="isConfirmed">
              <uni-data-select
                  v-model="bugForm.isConfirmed"
                  :localdata="[
                  {text: '已确认', value: true},
                  {text: '未确认', value: false}
                ]"
                  placeholder="请选择确认状态"
              ></uni-data-select>
            </uni-forms-item>

            <uni-forms-item label="复现步骤" name="step">
              <uni-easyinput
                  v-model="bugForm.step"
                  type="textarea"
                  placeholder="请输入复现步骤"
                  height="200"
              />
            </uni-forms-item>

            <uni-forms-item label="相关需求" name="requirement">
              <uni-easyinput
                  v-model="bugForm.requirement"
                  type="textarea"
                  placeholder="请输入相关需求"
                  height="150"
              />
            </uni-forms-item>

            <uni-forms-item label="解决方案" name="solution">
              <uni-easyinput
                  v-model="bugForm.solution"
                  type="textarea"
                  placeholder="请输入解决方案"
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
import {
  addOrUpdateProjectBug,
  deleteProjectBug,
  getProjectBugInfo,
  getProjectBugPage,
  getProjectBugsByProjectId
} from '../../api/projectBug';
import {getProjectList} from '../../api/project';
import {getProjectParticipantByProjectId} from '../../api/projectParticipant';

    // 数据加载和列表状态
    const loading = ref(false);
    const bugList = ref([]);
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);
    const bugTitle = ref('');
    const bugType = ref('');

    // 弹窗引用
    const detailPopup = ref(null);
    const editPopup = ref(null);

    // 详情对话框状态
    const selectedBug = ref(null);

    // 编辑对话框状态
    const dialogTitle = ref('新增Bug');
    const bugForm = reactive({
      id: null,
      title: '',
      projectId: null,
      testerId: null,
      bugType: '',
      system: '',
      browser: '',
      assigneeId: null,
      isResolved: false,
      isConfirmed: false,
      step: '',
      requirement: '',
      solution: '',
    });
    const bugFormRef = ref(null);
    const projectOptions = ref([]);
    const employeeOptions = ref([]);

    // 表单验证规则
    const rules = {
      title: {
        rules: [{required: true, errorMessage: '请输入Bug标题'}]
      },
      projectId: {
        rules: [{required: true, errorMessage: '请选择所属项目'}]
      },
      testerId: {
        rules: [{required: true, errorMessage: '请选择测试人员'}]
      },
      bugType: {
        rules: [{required: true, errorMessage: '请输入Bug类型'}]
      }
    };

    // 分页处理
    const handlePageChange = (e) => {
      if (e.type === 'next' || e.type === 'prev') {
        currentPage.value = e.current;
      } else if (e.type === 'pageSize') {
        pageSize.value = e.pageSize;
      }
      fetchPageBugList();
    };

    // 搜索和清空
    const handleSearch = () => {
      currentPage.value = 1;
      fetchPageBugList();
    };

    const handleClear = () => {
      bugTitle.value = '';
      bugType.value = '';
      fetchPageBugList();
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
        content: '确定要删除此Bug吗？',
        confirmColor: '#dd524d',
        success: async (res) => {
          if (res.confirm) {
            await handleDelete(id);
          }
        }
      });
    };

    // 删除Bug
    const handleDelete = async (id) => {
      try {
        await deleteProjectBug(id);
        uni.showToast({
          title: '删除Bug成功',
          icon: 'success'
        });
        await fetchPageBugList();
      } catch (error) {
        uni.showToast({
          title: '删除Bug失败',
          icon: 'none'
        });
      }
    };

    // 查看Bug详情
    const viewBugDetail = async (bug) => {
      loading.value = true;
      try {
        const response = await getProjectBugInfo(bug.id);
        selectedBug.value = response.data;
        detailPopup.value.open();
      } catch (error) {
        console.error('获取Bug详情失败:', error);
        uni.showToast({
          title: '获取Bug详情失败',
          icon: 'none'
        });
      } finally {
        loading.value = false;
      }
    };

    // 编辑Bug
    const handleEdit = async (bug) => {
      dialogTitle.value = '编辑Bug';

      // 获取最新的Bug详情
      try {
        loading.value = true;
        const response = await getProjectBugInfo(bug.id);
        const bugData = response.data;

        // 填充表单
        Object.keys(bugForm).forEach(key => {
          if (key in bugData) {
            bugForm[key] = bugData[key];
          }
        });

        // 先获取项目参与人员，确保测试人员下拉列表已更新
        if (bugForm.projectId) {
          await fetchProjectParticipants(bugForm.projectId);
        }

        // 打开编辑对话框
        editPopup.value.open();
      } catch (error) {
        console.error('获取Bug详情失败:', error);
        uni.showToast({
          title: '获取Bug详情失败',
          icon: 'none'
        });
      } finally {
        loading.value = false;
      }
    };

    // 新增Bug
    const openAddDialog = () => {
      dialogTitle.value = '新增Bug';

      // 重置表单
      Object.keys(bugForm).forEach(key => {
        if (key === 'isResolved' || key === 'isConfirmed') {
          bugForm[key] = false;
        } else {
          bugForm[key] = key === 'id' ? null : '';
        }
      });

      editPopup.value.open();
    };

    // 提交表单
    const submitForm = async () => {
      if (!bugFormRef.value) return;

      try {
        const valid = await bugFormRef.value.validate();
        if (!valid) return;

        loading.value = true;
        await addOrUpdateProjectBug(bugForm);

        uni.showToast({
          title: `${bugForm.id ? '更新' : '新增'}Bug成功`,
          icon: 'success'
        });

        editPopup.value.close();
        await fetchPageBugList();
      } catch (error) {
        uni.showToast({
          title: `${bugForm.id ? '更新' : '新增'}Bug失败`,
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

    // 获取Bug列表（分页）
    const fetchPageBugList = async () => {
      loading.value = true;
      try {
        const response = await getProjectBugPage(
            currentPage.value,
            pageSize.value,
            bugTitle.value,
            bugType.value
        );
        bugList.value = response.data.records;
        total.value = response.data.total;
      } catch (error) {
        console.error('获取Bug列表失败:', error);
        uni.showToast({
          title: '获取Bug列表失败',
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
      return date.toLocaleString(); // 显示日期和时间
    };

    // 监听项目ID变化，更新测试人员选项
    watch(() => bugForm.projectId, async (newProjectId) => {
      if (newProjectId) {
        // 当选择项目后，获取该项目的参与人员
        await fetchProjectParticipants(newProjectId);

        // 如果当前选中的测试人员不在新的项目参与人员中，则清空选择
        if (bugForm.testerId) {
          const testerExists = employeeOptions.value.some(emp => emp.employeeId === bugForm.testerId);
          if (!testerExists) {
            bugForm.testerId = null;
          }
        }

        // 同样处理处理人
        if (bugForm.assigneeId) {
          const assigneeExists = employeeOptions.value.some(emp => emp.employeeId === bugForm.assigneeId);
          if (!assigneeExists) {
            bugForm.assigneeId = null;
          }
        }
      } else {
        // 如果未选择项目，清空人员选项
        employeeOptions.value = [];
        bugForm.testerId = null;
        bugForm.assigneeId = null;
      }
    });

    // 组件挂载时加载数据
    onMounted(() => {
      fetchPageBugList();
      fetchProjectOptions();
    });


</script>

<style scoped>
.project-bug-list-container {
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
.bug-search {
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
.bug-detail {
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

/* Bug步骤和需求、解决方案样式 */
.bug-steps-section,
.bug-requirement-section,
.bug-solution-section {
  margin-top: 40rpx;
}

.content-card {
  padding: 20rpx;
  border: 1px solid #eee;
  border-radius: 8rpx;
  background-color: #f8f8f8;
}

.step-content,
.requirement-content,
.solution-content {
  white-space: pre-line;
  line-height: 1.6;
  font-size: 28rpx;
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
}
</style>