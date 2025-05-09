<template>
  <view class="approval-list-container">
    <uni-card>
      <template v-slot:title>
        <view class="card-header">
          <text class="head-title">注册审核列表</text>
        </view>
      </template>
      <template v-slot:cover>
        <view class="header-actions">
          <button type="warn" @click="handleDeleteApproved" :disabled="!hasApproved" class="custom-btn error-btn">
            <uni-icons type="trash" size="18"></uni-icons>
            <text>删除已通过审核</text>
          </button>
        </view>
      </template>

      <uni-notice-bar
          text="这里显示了系统中所有用户的注册审核申请，您可以进行审核操作"
          show-icon
          :scrollable="false"
          style="margin-bottom: 20px;"
      ></uni-notice-bar>

      <view class="approval-search">
        <view class="search-container">
          <uni-easyinput
              placeholder="姓名查询"
              v-model="realName"
              clearable
              class="search-input"
          ></uni-easyinput>
          <uni-data-select
              v-model="status"
              :localdata="statusOptions"
              placeholder="审核状态"
              class="search-select"
          ></uni-data-select>
          <view class="search-buttons">
            <button type="primary" @click="handleSearch" class="custom-btn primary-btn">
              搜索
            </button>
            <button type="default" @click="handleClear" class="custom-btn">
              重置
            </button>
          </view>
        </view>
      </view>

      <view class="batch-operations" v-if="multipleSelection.length > 0">
        <uni-notice-bar
            type="warning"
            :text="`已选择 ${multipleSelection.length} 条记录，可进行批量操作`"
            show-icon
            style="margin-bottom: 10px;"
        ></uni-notice-bar>
        <view class="batch-buttons">
          <button type="primary" @click="handleBatchApprove" :disabled="!hasUnapproved" class="custom-btn success-btn">
            批量通过
          </button>
          <button type="default" @click="handleBatchReject" :disabled="!hasUnapproved" class="custom-btn error-btn">
            批量拒绝
          </button>
        </view>
      </view>

      <view class="uni-table-container">
        <uni-table
            :loading="loading"
            border
            stripe
            emptyText="暂无数据"
            @selection-change="handleSelectionChange"
        >
          <uni-tr>
            <uni-th align="center">
              <uni-checkbox
                  :checked="checkedAll"
                  @change="handleCheckAll"
              ></uni-checkbox>
            </uni-th>
            <uni-th align="center">#</uni-th>
            <uni-th align="center">用户ID</uni-th>
            <uni-th>姓名</uni-th>
            <uni-th align="center">审核状态</uni-th>
            <uni-th align="center">审核员姓名</uni-th>
            <uni-th>审核意见</uni-th>
            <uni-th align="center">审核时间</uni-th>
            <uni-th align="center">拟转入部门</uni-th>
            <uni-th align="center">操作</uni-th>
          </uni-tr>

          <uni-tr v-for="(item, index) in approvalList" :key="item.id">
            <uni-td align="center">
              <uni-checkbox
                  :checked="isItemChecked(item)"
                  @change="(e) => handleItemCheck(e, item)"
                  :disabled="item.status !== 0"
              ></uni-checkbox>
            </uni-td>
            <uni-td align="center">{{ index + 1 }}</uni-td>
            <uni-td align="center">{{ item.userId }}</uni-td>
            <uni-td>{{ item.realName }}</uni-td>
            <uni-td align="center">
              <uni-tag
                  :text="item.status === 0 ? '待审核' : item.status === 1 ? '已通过' : '已拒绝'"
                  :type="item.status === 0 ? 'info' : item.status === 1 ? 'success' : 'error'"
              ></uni-tag>
            </uni-td>
            <uni-td align="center">{{ item.employeeName || '未分配' }}</uni-td>
            <uni-td>{{ item.approvalOpinion || '暂无意见' }}</uni-td>
            <uni-td align="center">{{ item.approvalTime ? dateFormatter(item.approvalTime) : '' }}</uni-td>
            <uni-td align="center">{{ item.departmentName || '暂无部门' }}</uni-td>
            <uni-td align="center">
              <view class="action-buttons">
                <button
                    @click="viewApprovalDetail(item)"
                    class="custom-btn primary-btn mini-btn"
                >查看
                </button>
                <button
                    type="primary"
                    v-if="item.status === 0"
                    @click="handleApprove(item)"
                    class="custom-btn success-btn mini-btn"
                >通过
                </button>
                <button
                    type="warn"
                    v-if="item.status === 0"
                    @click="handleReject(item)"
                    class="custom-btn error-btn mini-btn"
                >拒绝
                </button>
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
        ></uni-pagination>
      </view>
    </uni-card>

    <!-- 审核详情弹窗 -->
    <uni-popup ref="detailPopup" type="center">
      <view class="popup-container">
        <view class="popup-header">
          <text class="popup-title">注册审核详情</text>
          <uni-icons type="close" size="20" @click="closeDetailPopup"></uni-icons>
        </view>

        <view v-if="selectedApproval" class="approval-detail">
          <view class="detail-item">
            <text class="detail-label">ID:</text>
            <text class="detail-value">{{ selectedApproval.id }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">用户ID:</text>
            <text class="detail-value">{{ selectedApproval.userId }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">姓名:</text>
            <text class="detail-value">{{ selectedApproval.realName }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">拟转入部门:</text>
            <text class="detail-value">{{ selectedApproval.departmentName || '未指定' }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">审核状态:</text>
            <uni-tag
                :text="selectedApproval.status === 0 ? '待审核' : selectedApproval.status === 1 ? '已通过' : '已拒绝'"
                :type="selectedApproval.status === 0 ? 'info' : selectedApproval.status === 1 ? 'success' : 'error'"
            ></uni-tag>
          </view>
          <view class="detail-item">
            <text class="detail-label">审核员:</text>
            <text class="detail-value">{{ selectedApproval.employeeName || '未分配' }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">审核时间:</text>
            <text class="detail-value">
              {{ selectedApproval.approvalTime ? dateFormatter(selectedApproval.approvalTime) : '暂无时间' }}
            </text>
          </view>
          <view class="detail-item wide">
            <text class="detail-label">审核意见:</text>
            <text class="detail-value">{{ selectedApproval.approvalOpinion || '暂无审核意见' }}</text>
          </view>

          <view class="approval-actions" v-if="selectedApproval.status === 0">
            <button class="custom-btn success-btn" @click="handleApprove(selectedApproval)">通过申请</button>
            <button class="custom-btn error-btn" @click="handleReject(selectedApproval)">拒绝申请</button>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 审核操作弹窗 -->
    <uni-popup ref="approvalPopup" type="center">
      <view class="popup-container">
        <view class="popup-header">
          <text class="popup-title">{{ approvalAction === 'approve' ? '通过审核' : '拒绝审核' }}</text>
          <uni-icons type="close" size="20" @click="closeApprovalPopup"></uni-icons>
        </view>

        <uni-forms :model="approvalForm" ref="approvalFormRef" :rules="approvalRules">
          <uni-forms-item label="拟转入部门" name="targetDepartmentId" v-if="approvalAction === 'approve'">
            <uni-data-select
                v-model="approvalForm.targetDepartmentId"
                :localdata="departmentList"
                placeholder="请选择拟转入部门"
            ></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="审核意见" name="approvalOpinion">
            <uni-easyinput
                v-model="approvalForm.approvalOpinion"
                type="textarea"
                placeholder="请输入您的审核意见"
                :maxlength="200"
            ></uni-easyinput>
          </uni-forms-item>

          <view class="form-actions">
            <button @click="closeApprovalPopup" class="custom-btn">取消</button>
            <button @click="submitApproval" :loading="submitLoading" class="custom-btn primary-btn">确认</button>
          </view>
        </uni-forms>
      </view>
    </uni-popup>

    <!-- 批量审核弹窗 -->
    <uni-popup ref="batchPopup" type="center">
      <view class="popup-container">
        <view class="popup-header">
          <text class="popup-title">{{ batchAction === 'approve' ? '批量通过审核' : '批量拒绝审核' }}</text>
          <uni-icons type="close" size="20" @click="closeBatchPopup"></uni-icons>
        </view>

        <text class="batch-info">您选择了 {{ multipleSelection.length }}
          条记录进行{{ batchAction === 'approve' ? '通过' : '拒绝' }}操作
        </text>

        <uni-forms :model="batchForm" ref="batchFormRef" :rules="batchRules">
          <uni-forms-item label="拟转入部门" name="targetDepartmentId" v-if="batchAction === 'approve'">
            <uni-data-select
                v-model="batchForm.targetDepartmentId"
                :localdata="departmentList"
                placeholder="请选择拟转入部门"
            ></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="统一审核意见" name="approvalOpinion">
            <uni-easyinput
                v-model="batchForm.approvalOpinion"
                type="textarea"
                placeholder="请输入统一的审核意见"
                :maxlength="200"
            ></uni-easyinput>
          </uni-forms-item>

          <view class="form-actions">
            <button @click="closeBatchPopup" class="custom-btn">取消</button>
            <button @click="submitBatchApproval" :loading="batchSubmitLoading" class="custom-btn primary-btn">确认
            </button>
          </view>
        </uni-forms>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import {ref, computed, onMounted, reactive} from 'vue';
import {
  getApprovalPage,
  addOrUpdateApproval,
  deleteApprovalRecords,
  getAllDepartments
} from '../../api/registerApprove';
import {useEmployeeStore} from "../../store/employeeStore";
// 审核列表数据
const loading = ref(false);
const submitLoading = ref(false);
const batchSubmitLoading = ref(false);
const approvalList = ref([]);
const dialogVisible = ref(false);
const selectedApproval = ref(null);
const approvalDialogVisible = ref(false);
const approvalAction = ref('');
const currentApproval = ref(null);
const multipleSelection = ref([]);
const batchDialogVisible = ref(false);
const batchAction = ref('');
const departmentList = ref([]);
const checkedAll = ref(false);

// 弹窗引用
const detailPopup = ref(null);
const approvalPopup = ref(null);
const batchPopup = ref(null);

// 分页参数
const currentPage = ref(1);
const pageSize = ref(5); // 默认与后端一致
const total = ref(0);

// store
const employeeStore = useEmployeeStore();

// 搜索参数
const realName = ref('');
const status = ref(null);
const statusOptions = [
  {value: '', text: '全部'},
  {value: 0, text: '待审核'},
  {value: 1, text: '已通过'},
  {value: 2, text: '已拒绝'}
];

// 审核表单
const approvalForm = ref({
  id: null,
  userId: null,
  realName: '',
  approverId: null,
  status: 0,
  approvalOpinion: '',
  approvalTime: null,
  employeeName: null,
  departmentName: null,
  targetDepartmentId: null,
});

// 审核表单验证规则
const approvalRules = {
  approvalOpinion: {
    rules: [
      {required: true, errorMessage: '请输入审核意见'},
      {minLength: 2, maxLength: 200, errorMessage: '长度在 2 到 200 个字符之间'}
    ]
  },
  targetDepartmentId: {
    rules: [
      {required: true, errorMessage: '请选择拟转入部门'}
    ]
  }
};

// 批量审核表单
const batchForm = ref({
  approvalOpinion: '',
  targetDepartmentId: null,
  status: 0
});

// 批量审核表单验证规则
const batchRules = {
  approvalOpinion: {
    rules: [
      {required: true, errorMessage: '请输入统一审核意见'},
      {minLength: 2, maxLength: 200, errorMessage: '长度在 2 到 200 个字符之间'}
    ]
  },
  targetDepartmentId: {
    rules: [
      {required: true, errorMessage: '请选择拟转入部门'}
    ]
  }
};

// 表单引用
const approvalFormRef = ref(null);
const batchFormRef = ref(null);

// 计算是否有已通过的审核
const hasApproved = computed(() => {
  return approvalList.value.some(item => item.status === 1);
});

// 计算选中项中是否有未审核的记录
const hasUnapproved = computed(() => {
  return multipleSelection.value.some(item => item.status === 0);
});

// 打开/关闭弹窗方法
const viewApprovalDetail = (approval) => {
  selectedApproval.value = {...approval};
  detailPopup.value.open();
};

const closeDetailPopup = () => {
  detailPopup.value.close();
};

const closeApprovalPopup = () => {
  approvalPopup.value.close();
};

const closeBatchPopup = () => {
  batchPopup.value.close();
};

// 处理全选
const handleCheckAll = (e) => {
  const checked = e.detail.value;
  checkedAll.value = checked;
  if (checked) {
    // 只选择待审核的数据
    multipleSelection.value = approvalList.value.filter(item => item.status === 0);
  } else {
    multipleSelection.value = [];
  }
};

// 判断项是否被选中
const isItemChecked = (item) => {
  return multipleSelection.value.some(selected => selected.id === item.id);
};

// 处理单项选择
const handleItemCheck = (e, item) => {
  const checked = e.detail.value;
  if (checked) {
    if (!isItemChecked(item)) {
      multipleSelection.value.push(item);
    }
  } else {
    multipleSelection.value = multipleSelection.value.filter(selected => selected.id !== item.id);
  }

  // 更新全选状态
  const allCheckableItems = approvalList.value.filter(item => item.status === 0);
  checkedAll.value =
      allCheckableItems.length > 0 &&
      allCheckableItems.every(item => isItemChecked(item));
};

// 处理选择变化
const handleSelectionChange = (selection) => {
  multipleSelection.value = selection;
};

// 处理分页变化
const handlePageChange = (e) => {
  currentPage.value = e.current;
  fetchApprovalList();
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchApprovalList();
};

// 清空搜索条件
const handleClear = () => {
  realName.value = '';
  status.value = null;
  currentPage.value = 1;
  fetchApprovalList();
};

// 获取部门列表
const fetchDepartmentList = async () => {
  try {
    const result = await getAllDepartments();
    departmentList.value = result.data.map(dept => ({
      text: dept.name,
      value: dept.id
    }));
  } catch (error) {
    console.error('获取部门列表失败:', error);
  }
};

// 获取审核列表
const fetchApprovalList = async () => {
  loading.value = true;
  try {
    const result = await getApprovalPage(
        currentPage.value,
        pageSize.value,
        realName.value || undefined,
        status.value !== null ? status.value : undefined
    );
    approvalList.value = result.data.records;
    total.value = result.data.total;
    await employeeStore.getEmployeeInfoAction();
  } catch (error) {
    console.error('获取审核列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 处理通过审核
const handleApprove = (approval) => {
  approvalAction.value = 'approve';
  currentApproval.value = {...approval};

  approvalForm.value = {
    id: approval.id,
    userId: approval.userId,
    realName: approval.realName,
    approverId: employeeStore.employeeId,
    status: 1, // 1表示通过
    approvalOpinion: '',
    approvalTime: getIsoDateTime(),
    targetDepartmentId: approval.targetDepartmentId || null
  };
  fetchDepartmentList();
  approvalPopup.value.open();
};

// 处理拒绝审核
const handleReject = (approval) => {
  approvalAction.value = 'reject';
  currentApproval.value = {...approval};

  approvalForm.value = {
    id: approval.id,
    userId: approval.userId,
    realName: approval.realName,
    approverId: employeeStore.employeeId,
    status: 2, // 2表示拒绝
    approvalOpinion: '',
    approvalTime: getIsoDateTime(),
    targetDepartmentId: approval.targetDepartmentId
  };

  approvalPopup.value.open();
};

// 提交审核结果
const submitApproval = async () => {
  if (!approvalFormRef.value) return;

  try {
    const formValidated = await approvalFormRef.value.validate();
    if (!formValidated) return;

    submitLoading.value = true;
    await addOrUpdateApproval(approvalForm.value);

    uni.showToast({
      title: approvalAction.value === 'approve' ? '审核通过成功' : '审核拒绝成功',
      icon: 'success'
    });
    approvalPopup.value.close();
    await fetchApprovalList();

    // 如果详情对话框打开着，也更新它
    if (detailPopup.value.isOpen && selectedApproval.value && selectedApproval.value.id === approvalForm.value.id) {
      selectedApproval.value = {...approvalForm.value};
    }
  } catch (error) {
    console.error('提交审核结果失败:', error);
  } finally {
    submitLoading.value = false;
  }
};

// 处理批量通过
const handleBatchApprove = () => {
  if (multipleSelection.value.length === 0) {
    uni.showToast({
      title: '请至少选择一条记录',
      icon: 'none'
    });
    return;
  }

  // 检查是否包含已审核的记录
  const hasApproved = multipleSelection.value.some(item => item.status !== 0);
  if (hasApproved) {
    uni.showToast({
      title: '只能对待审核的记录进行批量操作',
      icon: 'none'
    });
    return;
  }

  batchAction.value = 'approve';
  batchForm.value = {
    approvalOpinion: '',
    targetDepartmentId: null,
    status: 1
  };
  batchPopup.value.open();
};

// 处理批量拒绝
const handleBatchReject = () => {
  if (multipleSelection.value.length === 0) {
    uni.showToast({
      title: '请至少选择一条记录',
      icon: 'none'
    });
    return;
  }

  // 检查是否包含已审核的记录
  const hasApproved = multipleSelection.value.some(item => item.status !== 0);
  if (hasApproved) {
    uni.showToast({
      title: '只能对待审核的记录进行批量操作',
      icon: 'none'
    });
    return;
  }

  batchAction.value = 'reject';
  batchForm.value = {
    approvalOpinion: '',
    targetDepartmentId: null,
    status: 2
  };
  batchPopup.value.open();
};

// 提交批量审核
const submitBatchApproval = async () => {
  if (!batchFormRef.value) return;

  try {
    const formValidated = await batchFormRef.value.validate();
    if (!formValidated) return;

    batchSubmitLoading.value = true;

    // 构建批量处理的对象数组
    const batchData = multipleSelection.value.map(item => ({
      id: item.id,
      userId: item.userId,
      realName: item.realName,
      approverId: employeeStore.employeeId,
      status: batchAction.value === 'approve' ? 1 : 2,
      approvalOpinion: batchForm.value.approvalOpinion,
      approvalTime: getIsoDateTime(),
      targetDepartmentId: batchAction.value === 'approve' ? batchForm.value.targetDepartmentId : item.targetDepartmentId
    }));

    // 由于后端没有批量API，这里使用Promise.all进行并行处理
    const promises = batchData.map(data => addOrUpdateApproval(data));
    await Promise.all(promises);

    uni.showToast({
      title: `批量${batchAction.value === 'approve' ? '通过' : '拒绝'}成功`,
      icon: 'success'
    });
    batchPopup.value.close();
    fetchApprovalList();
  } catch (error) {
    console.error('批量审核失败:', error);
  } finally {
    batchSubmitLoading.value = false;
  }
};

// 删除已通过审核的记录
const handleDeleteApproved = async () => {
  uni.showModal({
    title: '警告',
    content: '确定要删除所有已通过审核的记录吗？此操作不可恢复！',
    confirmColor: '#dd524d',
    success: async function (res) {
      if (res.confirm) {
        loading.value = true;
        try {
          const response = await deleteApprovalRecords();
          if (response.data) {
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            });
            fetchApprovalList();
          }
        } catch (error) {
          console.error('删除失败:', error);
        } finally {
          loading.value = false;
        }
      }
    }
  });
};

// 格式化日期
const dateFormatter = (cellValue) => {
  if (!cellValue) return '';
  const date = new Date(cellValue);
  return date.toLocaleString();
};

function getIsoDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  // 返回格式：2025-04-27T08:32:46
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

onMounted(() => {
  fetchApprovalList();
});


</script>

<style scoped>
.approval-list-container {
  padding: 20rpx;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
}

.head-title {
  font-size: 32rpx;
  font-weight: bold;
}

.header-actions {
  display: flex;
  gap: 20rpx;
}

/* 搜索区域整体样式 */
.approval-search {
  margin: 20rpx 0;
  padding: 30rpx;
  background-color: #f5f7fa;
  border-radius: 8rpx;
}

/* 搜索容器布局 */
.search-container {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.search-input, .search-select {
  width: 100%;
}

.search-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 10rpx;
}

.batch-operations {
  margin: 30rpx 0;
}

.batch-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
}

.u-table-container {
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
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-top: 40rpx;
}

/* 弹窗样式 */
.popup-container {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 30rpx;
  max-height: 80vh;
  overflow-y: auto;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #eee;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
}

.approval-detail {
  padding: 20rpx 0;
}

.detail-item {
  display: flex;
  margin-bottom: 20rpx;
  align-items: center;
}

.detail-item.wide {
  flex-direction: column;
  align-items: flex-start;
}

.detail-label {
  width: 180rpx;
  color: #666;
  margin-right: 20rpx;
}

.detail-value {
  flex: 1;
}

.approval-actions {
  margin-top: 40rpx;
  display: flex;
  justify-content: center;
  gap: 40rpx;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  margin-top: 30rpx;
}

.batch-info {
  display: block;
  margin-bottom: 30rpx;
  color: #ff9900;
}

/* 响应式调整 */
@media screen and (min-width: 768rpx) {
  .search-container {
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
  }

  .search-input, .search-select {
    width: 320rpx;
  }
}
</style>