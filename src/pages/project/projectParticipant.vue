<template>
  <view class="project-participant-container">
    <uni-card>
      <view class="card-header">
        <text class="card-title">项目参与人员管理</text>
        <button class="custom-btn primary-btn" @click="handleAdd">新增参与人员</button>
      </view>

      <uni-notice-bar
          text="管理项目中的参与人员、功能模块与任务分配"
          type="info"
          show-icon
          :scrollable="false"
          style="margin-bottom: 20rpx;"
      />

      <view class="search-section">
        <view class="search-container">
          <uni-easyinput placeholder="模块名称" v-model="moduleName" clearable class="search-input"></uni-easyinput>
          <uni-easyinput placeholder="相关需求" v-model="requirement" clearable class="search-input"></uni-easyinput>
          <view class="search-buttons">
            <button class="custom-btn primary-btn" @click="handleSearch">搜索</button>
            <button class="custom-btn danger-btn" @click="handleClear">重置</button>
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
            <uni-th width="180">项目名称</uni-th>
            <uni-th width="120">参与人员</uni-th>
            <uni-th width="150">功能模块</uni-th>
            <uni-th>相关需求</uni-th>
            <uni-th align="center" width="120">任务状态</uni-th>
            <uni-th align="center" width="120">开始时间</uni-th>
            <uni-th align="center" width="100">附件</uni-th>
            <uni-th align="center" width="240">操作</uni-th>
          </uni-tr>

          <uni-tr v-for="(item, index) in participantList" :key="item.id">
            <uni-td align="center">{{ index + 1 }}</uni-td>
            <uni-td class="ellipsis">{{ item.projectName }}</uni-td>
            <uni-td>{{ item.employeeName }}</uni-td>
            <uni-td class="ellipsis">{{ item.moduleName }}</uni-td>
            <uni-td class="ellipsis">{{ item.requirement }}</uni-td>
            <uni-td align="center">
              <uni-tag
                  :text="getTaskStatusText(item.taskStatus)"
                  :type="getTaskStatusType(item.taskStatus)"
              ></uni-tag>
            </uni-td>
            <uni-td align="center">{{ dateFormatter(null, null, item.startDate) }}</uni-td>
            <uni-td align="center">
              <text
                  v-if="item.attachmentUrl"
                  class="attachment-link"
                  @click="handleViewAttachment(item)"
              >查看附件
              </text>
              <text v-else>无附件</text>
            </uni-td>
            <uni-td align="center">
              <view class="action-buttons">
                <button class="custom-btn primary-btn" @click="handleEdit(item)">编辑</button>
                <button class="custom-btn success-btn" @click="handleViewDetail(item)">详情</button>
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

    <!-- 编辑或新增弹窗 -->
    <uni-popup ref="formPopup" type="center">
      <view class="popup-container form-popup">
        <view class="popup-header">
          <text class="popup-title">{{ dialogType === 'add' ? '新增项目参与人员' : '编辑项目参与人员' }}</text>
          <uni-icons type="close" size="20" @click="closeFormPopup"></uni-icons>
        </view>

        <scroll-view scroll-y="true" class="popup-scroll-content">
          <uni-forms
              ref="formRef"
              :model="form"
              :rules="rules"
              label-position="top"
          >
            <uni-forms-item label="项目" name="projectId">
              <uni-data-select
                  v-model="form.projectId"
                  :localdata="projectOptions.map(item => ({text: item.name, value: item.id}))"
                  placeholder="请选择项目"
              ></uni-data-select>
            </uni-forms-item>

            <uni-forms-item label="参与人员" name="employeeId">
              <uni-data-select
                  v-model="form.employeeId"
                  :localdata="employeeOptions.map(item => ({text: item.name, value: item.id}))"
                  placeholder="请选择参与人员"
              ></uni-data-select>
            </uni-forms-item>

            <uni-forms-item label="功能模块" name="moduleName">
              <uni-easyinput v-model="form.moduleName" placeholder="请输入功能模块名称"/>
            </uni-forms-item>

            <uni-forms-item label="相关需求" name="requirement">
              <uni-easyinput
                  v-model="form.requirement"
                  type="textarea"
                  placeholder="请输入相关需求描述"
                  height="180"
              />
            </uni-forms-item>

            <uni-forms-item label="任务状态" name="taskStatus">
              <uni-data-select
                  v-model="form.taskStatus"
                  :localdata="taskStatusOptions"
                  placeholder="请选择任务状态"
              ></uni-data-select>
            </uni-forms-item>

            <uni-forms-item label="开始日期" name="startDate">
              <uni-datetime-picker
                  v-model="form.startDate"
                  type="date"
                  return-type="string"
                  placeholder="请选择开始日期"
              />
            </uni-forms-item>

            <uni-forms-item label="附件" name="attachmentUrl">
              <view class="upload-area">
                <button class="custom-btn primary-btn" @click="chooseFile">{{
                    fileList.length > 0 ? '重新选择' : '选择文件'
                  }}
                </button>

                <view v-if="fileList.length > 0" class="file-list">
                  <view class="file-item">
                    <text class="file-name">{{ fileList[0].name }}</text>
                    <uni-icons type="trash" size="20" color="#dd524d" @click="handleRemoveFile"></uni-icons>
                  </view>
                </view>

                <text class="upload-tip">可上传任意类型文件，大小不超过10MB</text>
              </view>
            </uni-forms-item>

            <uni-forms-item label="图片" name="imageUrl">
              <view class="image-upload-area">
                <view class="image-preview-container" @click="chooseImage">
                  <image v-if="form.imageUrl" :src="formatResourceUrl(form.imageUrl)" class="image-preview"/>
                  <view v-else class="image-placeholder">
                    <uni-icons type="plusempty" size="30"></uni-icons>
                  </view>
                </view>
                <text class="upload-tip">点击选择图片，JPG/PNG/GIF格式, 不超过2MB</text>
              </view>
            </uni-forms-item>

            <view class="form-actions">
              <button class="custom-btn" @click="closeFormPopup">取消</button>
              <button class="custom-btn primary-btn" @click="submitForm">确认</button>
            </view>
          </uni-forms>
        </scroll-view>
      </view>
    </uni-popup>

    <!-- 详情弹窗 -->
    <uni-popup ref="detailPopup" type="center">
      <view class="popup-container detail-popup">
        <view class="popup-header">
          <text class="popup-title">参与人员详情</text>
          <uni-icons type="close" size="20" @click="closeDetailPopup"></uni-icons>
        </view>

        <scroll-view scroll-y="true" class="popup-scroll-content">
          <view v-if="currentParticipant" class="participant-detail">
            <!-- 基本信息部分 -->
            <view class="detail-section">
              <view class="detail-row">
                <view class="detail-item">
                  <text class="detail-label">项目名称:</text>
                  <text class="detail-value">{{ currentParticipant.projectName }}</text>
                </view>
                <view class="detail-item">
                  <text class="detail-label">参与人员:</text>
                  <text class="detail-value">{{ currentParticipant.employeeName }}</text>
                </view>
              </view>

              <view class="detail-row">
                <view class="detail-item">
                  <text class="detail-label">功能模块:</text>
                  <text class="detail-value">{{ currentParticipant.moduleName }}</text>
                </view>
                <view class="detail-item">
                  <text class="detail-label">任务状态:</text>
                  <view class="detail-value">
                    <uni-tag
                        :text="getTaskStatusText(currentParticipant.taskStatus)"
                        :type="getTaskStatusType(currentParticipant.taskStatus)"
                    ></uni-tag>
                  </view>
                </view>
              </view>

              <view class="detail-row">
                <view class="detail-item">
                  <text class="detail-label">开始日期:</text>
                  <text class="detail-value">{{ dateFormatter(null, null, currentParticipant.startDate) }}</text>
                </view>
              </view>

              <view class="detail-row full">
                <view class="detail-item full">
                  <text class="detail-label">相关需求:</text>
                  <text class="detail-value">{{ currentParticipant.requirement || '无' }}</text>
                </view>
              </view>
            </view>

            <!-- 文件部分 -->
            <view v-if="currentParticipant.attachmentUrl || currentParticipant.imageUrl" class="files-section">
              <view class="section-header">
                <text class="section-title">相关文件</text>
              </view>

              <view class="files-grid">
                <view class="file-card" v-if="currentParticipant.attachmentUrl">
                  <view class="file-card-content">
                    <uni-icons type="file" size="30"></uni-icons>
                    <text class="file-card-title">附件文件</text>
                    <button class="custom-btn primary-btn mini-btn"
                            @click="handleDownload(currentParticipant.attachmentUrl)">下载
                    </button>
                  </view>
                </view>

                <view class="file-card image-card" v-if="currentParticipant.imageUrl">
                  <image
                      :src="formatResourceUrl(currentParticipant.imageUrl)"
                      mode="aspectFit"
                      class="detail-image"
                      @click="previewImage(currentParticipant.imageUrl)"
                  ></image>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </uni-popup>

    <!-- 附件预览弹窗 -->
    <uni-popup ref="attachmentPopup" type="center">
      <view class="popup-container attachment-popup">
        <view class="popup-header">
          <text class="popup-title">附件预览</text>
          <uni-icons type="close" size="20" @click="closeAttachmentPopup"></uni-icons>
        </view>

        <view v-if="currentAttachment" class="attachment-preview">
          <!-- 在小程序和App环境中，某些文件类型无法直接预览 -->
          <view class="non-previewable">
            <uni-icons type="file" size="30"></uni-icons>
            <text class="preview-text">此类文件在移动端可能无法直接预览</text>
            <button class="custom-btn primary-btn" @click="handleDownload(currentAttachment)">下载文件</button>
            <!-- #ifdef H5 -->
            <view class="preview-iframe-container" v-if="isPreviewable(currentAttachment)">
              <web-view :src="formatResourceUrl(currentAttachment)"></web-view>
            </view>
            <!-- #endif -->
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import {onMounted, reactive, ref} from 'vue';
import {
  deleteProjectParticipant,
  getProjectParticipantInfo,
  getProjectParticipantPage,
  saveOrUpdateProjectParticipant,
  uploadAvatar,
  uploadResume
} from '../../api/projectParticipant';
import {getProjectList} from '../../api/project';
import {getEmployeeList} from '../../api/employee';

// 列表数据相关
const loading = ref(false);
const participantList = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const moduleName = ref('');
const requirement = ref('');

// 弹窗引用
const formPopup = ref(null);
const detailPopup = ref(null);
const attachmentPopup = ref(null);

// 对话框相关
const dialogType = ref('add'); // 'add' 或 'edit'
const currentParticipant = ref(null);
const currentAttachment = ref(null);
const formRef = ref(null);

// 下拉选项
const projectOptions = ref([]);
const employeeOptions = ref([]);
const taskStatusOptions = ref([
  {text: '未开始', value: '未开始'},
  {text: '进行中', value: '进行中'},
  {text: '已完成', value: '已完成'},
  {text: '已延期', value: '已延期'},
  {text: '已搁置', value: '已搁置'}
]);

// 文件上传
const fileList = ref([]);
const tempFile = ref(null);  // 临时存储选择的文件
const tempImage = ref(null); // 临时存储选择的图片

// 表单数据
const form = reactive({
  id: null,
  projectId: null,
  employeeId: null,
  moduleName: '',
  requirement: '',
  taskStatus: '未开始',
  startDate: '',
  attachmentUrl: '',
  imageUrl: ''
});

// 表单验证规则
const rules = {
  projectId: {
    rules: [{required: true, errorMessage: '请选择项目'}]
  },
  employeeId: {
    rules: [{required: true, errorMessage: '请选择参与人员'}]
  },
  moduleName: {
    rules: [{required: true, errorMessage: '请输入功能模块名称'}]
  },
  taskStatus: {
    rules: [{required: true, errorMessage: '请选择任务状态'}]
  }
};

// 格式化资源URL的函数
const formatResourceUrl = (url) => {
  if (!url) return '';

  // 如果已经是完整URL，则直接返回
  if (url.toString().indexOf('http') === 0) {
    return url;
  }

  // 确保URL以/开头
  const path = url.toString().startsWith('/') ? url : `/${url}`;
  return `http://localhost:8080/api${path}`;
};

// 预览图片
const previewImage = (url) => {
  if (!url) return;

  uni.previewImage({
    urls: [formatResourceUrl(url)],
    current: formatResourceUrl(url)
  });
};

// 获取任务状态对应的Tag类型
const getTaskStatusType = (status) => {
  switch (status) {
    case '未开始':
      return 'info';
    case '进行中':
      return 'warning';
    case '已完成':
      return 'success';
    case '已延期':
      return 'error';
    case '已搁置':
      return 'default';
    default:
      return 'default';
  }
};

// 获取任务状态文本
const getTaskStatusText = (status) => {
  return status || '未开始';
};

// 日期格式化
const dateFormatter = (row, column, cellValue) => {
  if (!cellValue) return '';
  const date = new Date(cellValue);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 分页处理
const handlePageChange = (e) => {
  if (e.type === 'next' || e.type === 'prev') {
    currentPage.value = e.current;
  } else if (e.type === 'pageSize') {
    pageSize.value = e.pageSize;
  }
  fetchData();
};

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1;
  fetchData();
};

// 重置搜索
const handleClear = () => {
  moduleName.value = '';
  requirement.value = '';
  handleSearch();
};

// 获取列表数据
const fetchData = async () => {
  loading.value = true;
  try {
    const response = await getProjectParticipantPage(
        currentPage.value,
        pageSize.value,
        moduleName.value,
        requirement.value
    );
    participantList.value = response.data.records;
    total.value = response.data.total;
  } catch (error) {
    console.error('获取参与人员列表失败:', error);
    uni.showToast({
      title: '获取参与人员列表失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 关闭弹窗方法
const closeFormPopup = () => {
  formPopup.value.close();
};

const closeDetailPopup = () => {
  detailPopup.value.close();
};

const closeAttachmentPopup = () => {
  attachmentPopup.value.close();
};

// 新增处理
const handleAdd = async () => {
  dialogType.value = 'add';
  resetForm();
  await fetchOptions();
  formPopup.value.open();
};

// 编辑处理
const handleEdit = async (row) => {
  try {
    dialogType.value = 'edit';
    loading.value = true;

    // 获取详细信息
    const response = await getProjectParticipantInfo(row.id);
    const detailData = response.data;

    await fetchOptions();

    // 使用详细信息填充表单
    Object.assign(form, {
      id: detailData.id,
      projectId: detailData.projectId,
      employeeId: detailData.employeeId,
      moduleName: detailData.moduleName,
      requirement: detailData.requirement,
      taskStatus: detailData.taskStatus || '未开始',
      startDate: detailData.startDate,
      attachmentUrl: detailData.attachmentUrl,
      imageUrl: detailData.imageUrl
    });

    // 设置文件列表
    fileList.value = [];
    if (form.attachmentUrl) {
      fileList.value.push({
        name: getFileNameFromUrl(form.attachmentUrl),
        url: formatResourceUrl(form.attachmentUrl)
      });
    }

    formPopup.value.open();
  } catch (error) {
    console.error('获取编辑数据失败:', error);
    uni.showToast({
      title: '获取编辑数据失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 获取文件名
const getFileNameFromUrl = (url) => {
  if (!url) return '';
  return url.substring(url.lastIndexOf('/') + 1);
};

// 查看详情
const handleViewDetail = async (row) => {
  try {
    loading.value = true;
    const response = await getProjectParticipantInfo(row.id);
    currentParticipant.value = response.data;
    detailPopup.value.open();
  } catch (error) {
    console.error('获取详情失败:', error);
    uni.showToast({
      title: '获取详情失败',
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
    content: '确定要删除此记录吗？',
    confirmColor: '#dd524d',
    success: async (res) => {
      if (res.confirm) {
        await handleDelete(id);
      }
    }
  });
};

// 删除处理
const handleDelete = async (id) => {
  try {
    await deleteProjectParticipant(id);
    uni.showToast({
      title: '删除成功',
      icon: 'success'
    });
    fetchData();
  } catch (error) {
    console.error('删除失败:', error);
    uni.showToast({
      title: '删除失败',
      icon: 'none'
    });
  }
};

// 查看附件
const handleViewAttachment = (row) => {
  currentAttachment.value = row.attachmentUrl;
  attachmentPopup.value.open();
};

// 是否可预览文件
const isPreviewable = (url) => {
  if (!url) return false;
  const ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
  return ['pdf', 'jpg', 'jpeg', 'png', 'gif'].includes(ext);
};

// 下载文件
const handleDownload = (url) => {
  if (!url) return;

  const formattedUrl = formatResourceUrl(url);

  // #ifdef H5
  // 使用a标签下载
  const link = document.createElement('a');
  link.href = formattedUrl;
  link.target = '_blank';
  link.download = getFileNameFromUrl(url);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // #endif

  // #ifdef APP-PLUS
  // APP环境使用uni.downloadFile
  uni.downloadFile({
    url: formattedUrl,
    success: (res) => {
      if (res.statusCode === 200) {
        uni.saveFile({
          tempFilePath: res.tempFilePath,
          success: (saveRes) => {
            uni.showToast({
              title: '文件已保存',
              icon: 'success'
            });
            // 打开文件
            uni.openDocument({
              filePath: saveRes.savedFilePath,
              success: () => {
                console.log('打开文档成功');
              }
            });
          }
        });
      }
    },
    fail: () => {
      uni.showToast({
        title: '下载失败',
        icon: 'none'
      });
    }
  });
  // #endif

  // #ifdef MP
  uni.showToast({
    title: '小程序环境暂不支持下载文件',
    icon: 'none'
  });
  // #endif
};

// 选择文件
const chooseFile = () => {
  // #ifdef H5
  uni.chooseFile({
    count: 1,
    type: 'all',
    extension: ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'txt', 'png', 'jpg', 'jpeg', 'gif'],
    success: (res) => {
      const file = res.tempFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        uni.showToast({
          title: '文件大小不能超过10MB',
          icon: 'none'
        });
        return;
      }

      tempFile.value = file;
      fileList.value = [{
        name: file.name,
        url: ''
      }];
    }
  });
  // #endif

  // #ifdef APP-PLUS
  uni.chooseFile({
    count: 1,
    success: (res) => {
      const file = res.tempFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        uni.showToast({
          title: '文件大小不能超过10MB',
          icon: 'none'
        });
        return;
      }

      tempFile.value = file;
      fileList.value = [{
        name: file.name,
        url: ''
      }];
    }
  });
  // #endif

  // #ifdef MP
  uni.showToast({
    title: '小程序环境暂不支持选择文件',
    icon: 'none'
  });
  // #endif
};

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const file = res.tempFiles[0];

      if (file.size > 2 * 1024 * 1024) {
        uni.showToast({
          title: '图片大小不能超过2MB',
          icon: 'none'
        });
        return;
      }

      tempImage.value = file;

      // 设置临时预览
      form.imageUrl = res.tempFilePaths[0];
    }
  });
};

// 移除文件
const handleRemoveFile = () => {
  form.attachmentUrl = '';
  fileList.value = [];
  tempFile.value = null;
};

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    id: null,
    projectId: null,
    employeeId: null,
    moduleName: '',
    requirement: '',
    taskStatus: '未开始',
    startDate: '',
    attachmentUrl: '',
    imageUrl: ''
  });
  fileList.value = [];
  tempFile.value = null;
  tempImage.value = null;

  if (formRef.value) {
    formRef.value.clearValidate();
  }
};

// 获取下拉选项
const fetchOptions = async () => {
  try {
    // 获取项目列表
    const projectRes = await getProjectList();
    projectOptions.value = projectRes.data || [];

    // 获取员工列表
    const employeeRes = await getEmployeeList();
    employeeOptions.value = employeeRes.data || [];
  } catch (error) {
    console.error('获取选项数据失败:', error);
    uni.showToast({
      title: '获取选项数据失败',
      icon: 'none'
    });
  }
};

// 上传文件
const uploadFormFiles = async () => {
  try {
    // 如果选择了新文件，则上传
    if (tempFile.value) {
      const response = await uploadResume(form.id || 0, tempFile.value);
      if (response.data && response.data.resumeUrl) {
        form.attachmentUrl = response.data.resumeUrl;
      }
    }

    // 如果选择了新图片，则上传
    if (tempImage.value) {
      const response = await uploadAvatar(form.id || 0, tempImage.value);
      if (response.data && response.data.avatarUrl) {
        form.imageUrl = response.data.avatarUrl;
      }
    }

    return true;
  } catch (error) {
    console.error('上传文件失败:', error);
    uni.showToast({
      title: '上传文件失败',
      icon: 'none'
    });
    return false;
  }
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  try {
    const valid = await formRef.value.validate();
    if (!valid) return;

    loading.value = true;

    // 先保存基本信息
    const saveResponse = await saveOrUpdateProjectParticipant(form);

    // 如果是新增，更新ID
    if (dialogType.value === 'add' && saveResponse.data) {
      form.id = saveResponse.data.id;
    }

    // 上传文件
    await uploadFormFiles();

    uni.showToast({
      title: dialogType.value === 'add' ? '新增成功' : '修改成功',
      icon: 'success'
    });

    formPopup.value.close();
    fetchData();
  } catch (error) {
    console.error('提交失败:', error);
    uni.showToast({
      title: '提交失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 页面加载时获取数据
onMounted(() => {
  fetchData();
});


</script>

<style scoped>
.project-participant-container {
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

.search-section {
  margin: 30rpx 0;
  padding: 30rpx;
  background-color: #f5f7fa;
  border-radius: 8rpx;
}

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

.attachment-link {
  color: #2979ff;
  text-decoration: underline;
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

.form-popup, .detail-popup, .attachment-popup {
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
.participant-detail {
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

/* 文件部分样式 */
.files-section {
  margin-top: 40rpx;
}

.files-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.file-card {
  width: 300rpx;
  height: 200rpx;
  border: 1px solid #eee;
  border-radius: 8rpx;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f8f8;
}

.file-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.file-card-title {
  font-size: 28rpx;
}

.image-card {
  padding: 0;
  background-color: #fff;
}

.detail-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 上传区域样式 */
.upload-area {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.file-list {
  margin-top: 20rpx;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border: 1px solid #eee;
  border-radius: 8rpx;
  background-color: #f8f8f8;
}

.file-name {
  flex: 1;
  word-break: break-all;
}

.image-upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.image-preview-container {
  width: 300rpx;
  height: 300rpx;
  border: 1px dashed #ddd;
  border-radius: 8rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f8f8;
  overflow: hidden;
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.upload-tip {
  font-size: 24rpx;
  color: #999;
}

/* 附件预览样式 */
.attachment-preview {
  padding: 30rpx;
}

.non-previewable {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30rpx;
  padding: 50rpx 0;
}

.preview-text {
  font-size: 28rpx;
  color: #666;
}

.preview-iframe-container {
  width: 100%;
  height: 700rpx;
  margin-top: 30rpx;
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

.mini-btn {
  height: 60rpx;
  font-size: 24rpx;
  padding: 6rpx 16rpx;
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
