<template>
  <view class="department-list-container">
    <uni-card>
      <view class="card-header">
        <text class="card-title">部门列表</text>
        <button class="custom-btn primary-btn" @click="showAddDepartmentDialog">添加部门</button>
      </view>

      <uni-notice-bar
          type="info"
          text="这里显示了系统中所有部门的信息列表"
          show-icon
          :scrollable="false"
          style="margin: 20rpx 0;"
      />

      <view class="department-search">
        <view class="search-container">
          <uni-easyinput placeholder="部门名称查询" v-model="searchName" class="search-input"></uni-easyinput>
          <uni-easyinput placeholder="部门职能查询" v-model="searchFunction" class="search-input"></uni-easyinput>
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
            <uni-th align="center" width="80">#</uni-th>
            <uni-th width="150">部门名称</uni-th>
            <uni-th width="200">部门职能</uni-th>
            <uni-th align="center" width="100">部门人数</uni-th>
            <uni-th align="center" width="100">部门经理</uni-th>
            <uni-th width="120">工作日期</uni-th>
            <uni-th width="120">工作时长</uni-th>
            <uni-th align="center" width="180">创建时间</uni-th>
            <uni-th align="center" width="280">操作</uni-th>
          </uni-tr>

          <uni-tr v-for="(item, index) in departmentList" :key="item.id">
            <uni-td align="center">{{ index + 1 }}</uni-td>
            <uni-td>{{ item.name }}</uni-td>
            <uni-td class="ellipsis">{{ item.depaFunction }}</uni-td>
            <uni-td align="center">{{ item.employeeCount }}</uni-td>
            <uni-td align="center">{{ item.managerName }}</uni-td>
            <uni-td>{{ item.workingDate }}</uni-td>
            <uni-td>{{ item.workingHours }}</uni-td>
            <uni-td align="center">{{ dateFormatter(null, null, item.createTime) }}</uni-td>
            <uni-td align="center">
              <view class="action-buttons">
                <button class="custom-btn primary-btn" @click="viewDepartmentDetail(item)">查看详情</button>
                <button class="custom-btn success-btn" @click="viewDepartmentEmployees(item)">查看成员</button>
                <button class="custom-btn warning-btn" @click="editDepartment(item)">编辑</button>
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
            :pageSizeRange="[1, 2, 5, 10]"
        ></uni-pagination>
      </view>
    </uni-card>

    <!-- 部门详情弹窗 -->
    <uni-popup ref="detailPopup" type="center">
      <view class="popup-container">
        <view class="popup-header">
          <text class="popup-title">部门详情</text>
          <uni-icons type="close" size="20" @click="closeDetailPopup"></uni-icons>
        </view>

        <view v-if="selectedDepartment" class="department-detail">
          <view class="detail-row">
            <view class="detail-item">
              <text class="detail-label">部门名称:</text>
              <text class="detail-value">{{ selectedDepartment.name }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">部门人数:</text>
              <text class="detail-value">{{ selectedDepartment.employeeCount }}</text>
            </view>
          </view>

          <view class="detail-row">
            <view class="detail-item">
              <text class="detail-label">工作日期:</text>
              <text class="detail-value">{{ selectedDepartment.workingDate }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">工作时长:</text>
              <text class="detail-value">{{ selectedDepartment.workingHours }}</text>
            </view>
          </view>

          <view class="detail-row">
            <view class="detail-item">
              <text class="detail-label">创建时间:</text>
              <text class="detail-value">{{ dateFormatter(null, null, selectedDepartment.createTime) }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">更新时间:</text>
              <text class="detail-value">{{ dateFormatter(null, null, selectedDepartment.updateTime) }}</text>
            </view>
          </view>

          <view class="detail-row full">
            <view class="detail-item full">
              <text class="detail-label">部门职能:</text>
              <text class="detail-value">{{ selectedDepartment.depaFunction }}</text>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 部门成员弹窗 -->
    <uni-popup ref="employeesPopup" type="center">
      <view class="popup-container employee-popup">
        <view class="popup-header">
          <text class="popup-title">部门成员</text>
          <uni-icons type="close" size="20" @click="closeEmployeesPopup"></uni-icons>
        </view>

        <view class="popup-content">
          <uni-table v-if="departmentEmployees.length > 0" border stripe>
            <uni-tr>
              <uni-th align="center" width="60">#</uni-th>
              <uni-th width="120">姓名</uni-th>
              <uni-th align="center" width="80">性别</uni-th>
              <uni-th align="center" width="80">年龄</uni-th>
              <uni-th width="150">电话</uni-th>
              <uni-th>职能描述</uni-th>
            </uni-tr>

            <uni-tr v-for="(item, index) in departmentEmployees" :key="item.id">
              <uni-td align="center">{{ index + 1 }}</uni-td>
              <uni-td>{{ item.name }}</uni-td>
              <uni-td align="center">{{ item.gender === 1 ? '男' : '女' }}</uni-td>
              <uni-td align="center">{{ item.age }}</uni-td>
              <uni-td>{{ item.phone }}</uni-td>
              <uni-td class="ellipsis">{{ item.jobDescription }}</uni-td>
            </uni-tr>
          </uni-table>

          <view v-else class="empty-placeholder">
            <image src="/static/images/empty.png" class="empty-image"></image>
            <text class="empty-text">该部门暂无成员</text>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 添加/编辑部门弹窗 -->
    <uni-popup ref="formPopup" type="center">
      <view class="popup-container form-popup">
        <view class="popup-header">
          <text class="popup-title">{{ isEdit ? '编辑部门' : '添加部门' }}</text>
          <uni-icons type="close" size="20" @click="closeFormPopup"></uni-icons>
        </view>

        <uni-forms
            ref="departmentFormRef"
            :model="departmentForm"
            :rules="rules"
            label-width="150rpx"
            label-position="left"
        >
          <uni-forms-item label="部门名称" name="name">
            <uni-easyinput v-model="departmentForm.name" placeholder="请输入部门名称"/>
          </uni-forms-item>

          <uni-forms-item label="部门职能" name="depaFunction">
            <uni-easyinput
                v-model="departmentForm.depaFunction"
                type="textarea"
                placeholder="请输入部门职能描述"
                height="180"
            />
          </uni-forms-item>

          <uni-forms-item label="部门经理" name="managerName">
            <uni-data-select
                v-model="departmentForm.managerName"
                :localdata="employeeList.map(item => ({ value: item.name, text: item.name }))"
                placeholder="请选择部门经理"
            ></uni-data-select>
          </uni-forms-item>

          <uni-forms-item label="工作日期" name="workingDate">
            <uni-easyinput v-model="departmentForm.workingDate" placeholder="例如：周一到周五"/>
          </uni-forms-item>

          <uni-forms-item label="工作时长" name="workingHours">
            <uni-easyinput v-model="departmentForm.workingHours" placeholder="例如：9:00--18:00"/>
          </uni-forms-item>

          <view class="form-actions">
            <button class="custom-btn" @click="closeFormPopup">取消</button>
            <button class="custom-btn primary-btn" @click="submitDepartmentForm">确认</button>
          </view>
        </uni-forms>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import {ref, onMounted, reactive} from 'vue';
import {
  getDepartmentPage,
  getDepartmentInfo,
  getDepartmentEmployees,
  addDepartment,
  updateDepartment,
  deleteDepartment
} from '../../api/department';
import {getEmployeeList} from "../../api/employee";

// 组件状态
const loading = ref(false);
const departmentList = ref([]);
const selectedDepartment = ref(null);
const isEdit = ref(false);
const departmentEmployees = ref([]);
const departmentFormRef = ref(null);
const employeeList = ref([]);

// 弹窗引用
const detailPopup = ref(null);
const employeesPopup = ref(null);
const formPopup = ref(null);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(5);
const total = ref(0);
const searchName = ref('');
const searchFunction = ref('');

// 表单数据
const departmentForm = reactive({
  id: null,
  name: '',
  depaFunction: '',
  workingDate: '',
  workingHours: '',
  employeeCount: 0,
  managerName: '',
});

// 表单验证规则
const rules = {
  name: {
    rules: [
      {required: true, errorMessage: '请输入部门名称'},
      {minLength: 2, maxLength: 50, errorMessage: '长度在 2 到 50 个字符'}
    ]
  },
  depaFunction: {
    rules: [
      {required: true, errorMessage: '请输入部门职能'}
    ]
  }
};

// 页面加载时获取部门列表
onMounted(() => {
  fetchDepartmentList();
});

// 获取部门列表数据（分页）
const fetchDepartmentList = async () => {
  loading.value = true;
  try {
    const response = await getDepartmentPage(
        currentPage.value,
        pageSize.value,
        searchName.value,
        searchFunction.value
    );

    departmentList.value = response.data.records;
    total.value = response.data.total;
  } catch (error) {
    console.error('获取部门列表失败:', error);
    uni.showToast({
      title: '获取部门列表失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 获取当前部门所有员工信息，以便设置管理员
const fetchEmployeeList = async () => {
  try {
    const response = await getEmployeeList();
    employeeList.value = response.data;
  } catch (error) {
    console.error('获取员工列表失败:', error);
  }
};

// 查询
const handleSearch = () => {
  currentPage.value = 1; // 重置到第一页
  fetchDepartmentList();
};

// 清空搜索条件
const handleClear = () => {
  searchName.value = '';
  searchFunction.value = '';
  handleSearch();
};

// 处理分页变化
const handlePageChange = (e) => {
  if (e.type === 'next' || e.type === 'prev') {
    currentPage.value = e.current;
  } else if (e.type === 'pageSize') {
    pageSize.value = e.pageSize;
  }
  fetchDepartmentList();
};

// 查看部门详情
const viewDepartmentDetail = async (department) => {
  loading.value = true;
  try {
    const response = await getDepartmentInfo(department.id);
    selectedDepartment.value = response.data;
    detailPopup.value.open();
  } catch (error) {
    console.error('获取部门详情失败:', error);
    uni.showToast({
      title: '获取部门详情失败',
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

// 查看部门成员
const viewDepartmentEmployees = async (department) => {
  loading.value = true;
  try {
    const response = await getDepartmentEmployees(department.id);
    departmentEmployees.value = response.data || [];
    employeesPopup.value.open();
  } catch (error) {
    console.error('获取部门成员失败:', error);
    uni.showToast({
      title: '获取部门成员失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 关闭成员弹窗
const closeEmployeesPopup = () => {
  employeesPopup.value.close();
};

// 编辑部门
const editDepartment = async (department) => {
  isEdit.value = true;
  try {
    loading.value = true;
    const departmentEmployeesResponse = await getDepartmentEmployees(department.id);
    const response = await getDepartmentInfo(department.id);

    const deptData = response.data;
    Object.assign(departmentForm, {
      id: deptData.id,
      name: deptData.name,
      depaFunction: deptData.depaFunction,
      workingDate: deptData.workingDate,
      workingHours: deptData.workingHours,
      managerId: deptData.managerId,
      managerName: deptData.managerName,
    });

    // 显示经理列表
    employeeList.value = departmentEmployeesResponse.data;
    formPopup.value.open();
  } catch (error) {
    console.error('获取部门信息失败:', error);
    uni.showToast({
      title: '获取部门信息失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 关闭表单弹窗
const closeFormPopup = () => {
  formPopup.value.close();
};

// 显示添加部门对话框
const showAddDepartmentDialog = async () => {
  isEdit.value = false;
  try {
    await fetchEmployeeList();
    Object.assign(departmentForm, {
      id: null,
      name: '',
      depaFunction: '',
      workingDate: '',
      workingHours: '',
      employeeCount: 0,
      managerName: ''
    });
    formPopup.value.open();
  } catch (error) {
    console.error('准备添加部门失败:', error);
  }
};

// 提交部门表单
const submitDepartmentForm = async () => {
  if (!departmentFormRef.value) return;

  try {
    const valid = await departmentFormRef.value.validate();
    if (!valid) return;

    loading.value = true;
    let response;

    if (isEdit.value) {
      // 修改部门
      const updateDTO = {
        name: departmentForm.name,
        depaFunction: departmentForm.depaFunction,
        workingDate: departmentForm.workingDate,
        workingHours: departmentForm.workingHours,
        managerName: departmentForm.managerName,
      };
      response = await updateDepartment(departmentForm.id, updateDTO);
    } else {
      // 添加部门
      response = await addDepartment(departmentForm);
    }

    uni.showToast({
      title: isEdit.value ? '修改部门成功' : '添加部门成功',
      icon: 'success'
    });
    formPopup.value.close();
    await fetchDepartmentList(); // 刷新列表
  } catch (error) {
    console.error(isEdit.value ? '修改部门失败:' : '添加部门失败:', error);
    uni.showToast({
      title: isEdit.value ? '修改部门失败' : '添加部门失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 显示删除确认
const showDeleteConfirm = (id) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除此部门吗？',
    confirmColor: '#dd524d',
    success: async (res) => {
      if (res.confirm) {
        await handleDelDepartment(id);
      }
    }
  });
};

// 删除部门
const handleDelDepartment = async (id) => {
  loading.value = true;
  try {
    await deleteDepartment(id);
    uni.showToast({
      title: '删除部门成功',
      icon: 'success'
    });
    fetchDepartmentList(); // 刷新列表
  } catch (error) {
    console.error('删除部门失败:', error);
    uni.showToast({
      title: '删除部门失败',
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


</script>

<style scoped>
.department-list-container {
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
.department-search {
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
  overflow-y: auto;
}

.employee-popup, .form-popup {
  width: 90vw; /* 让成员和表单弹窗更宽 */
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

.popup-content {
  max-height: 60vh;
  overflow-y: auto;
}

/* 部门详情样式 */
.department-detail {
  padding: 10rpx;
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
}

.detail-item.full {
  flex: 100%;
  width: 100%;
}

.detail-label {
  font-weight: bold;
  color: #666;
  display: inline-block;
  width: 160rpx;
}

.detail-value {
  flex: 1;
}

/* 表单操作按钮 */
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
}
</style>