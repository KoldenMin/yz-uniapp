<template>
	<view class="container">
		<view class="header">
			<text class="title">用户列表</text>
			<view class="admin-tip" v-if="isAdmin">
				<text>管理员功能</text>
			</view>
		</view>

		<view class="search-box">
			<view class="search-input">
				<text class="iconfont icon-search"></text>
				<input type="text" v-model="searchText" placeholder="搜索用户名或姓名" />
				<text class="clear-btn" v-if="searchText" @click="clearSearch">×</text>
			</view>
		</view>

		<view v-if="!isAdmin" class="no-permission">
			<image src="/static/images/no-permission.png" mode="aspectFit"></image>
			<text>您没有查看用户列表的权限</text>
		</view>

		<view v-else-if="loading" class="loading-container">
			<view class="loading-spinner"></view>
			<text>加载中...</text>
		</view>

		<view v-else-if="filteredUserList.length === 0" class="empty-container">
			<image src="/static/images/empty.png" mode="aspectFit"></image>
			<text>没有找到匹配的用户</text>
		</view>

		<view v-else class="table-container">
			<!-- 表格头部 -->
			<view class="table-header">
				<view class="th th-number">#</view>
				<view class="th">用户名</view>
				<view class="th">姓名</view>
				<view class="th th-gender">性别</view>
				<view class="th">年龄</view>
				<view class="th">电话</view>
				<view class="th">当前住址</view>
				<view class="th">管理员</view>
				<view class="th">状态</view>
				<view class="th">注册时间</view>
				<view class="th th-action">操作</view>
			</view>

			<!-- 表格内容 -->
			<view class="table-body">
				<view v-for="(user, index) in filteredUserList" :key="user.id" class="table-row"
					:class="{'row-even': index % 2 === 1}">
					<view class="td td-number">{{ index + 1 }}</view>
					<view class="td">{{ user.username }}</view>
					<view class="td">{{ user.realName }}</view>
					<view class="td td-gender">
						<view class="gender-icon"
							:class="{'gender-male': user.gender === 1, 'gender-female': user.gender === 0}">
							{{ user.gender === 1 ? '男' : '女' }}
						</view>
					</view>
					<view class="td">{{ user.age }}</view>
					<view class="td">{{ user.phone }}</view>
					<view class="td">{{ user.currentAddress || '暂无' }}</view>
					<view class="td">
						<view class="badge"
							:class="{'badge-primary': user.isAdmin === 1, 'badge-default': user.isAdmin !== 1}">
							{{ user.isAdmin === 1 ? '是' : '否' }}
						</view>
					</view>
					<view class="td">
						<view class="badge"
							:class="{'badge-success': getUserStatus(user) === 1, 'badge-danger': getUserStatus(user) !== 1}">
							{{ getUserStatus(user) === 1 ? '正常' : '禁用' }}
						</view>
					</view>
					<view class="td">{{ formatDateTime(user.createTime) }}</view>
					<view class="td td-action">
						<view class="action-buttons">
							<view class="action-btn view-btn" @click="viewUser(user)">查看</view>
							<view class="action-btn edit-btn" @click="editUser(user)">编辑</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 分页控件 (如果需要) -->
		<view v-if="isAdmin && filteredUserList.length > 0" class="pagination">
			<text class="page-info">当前显示 {{ filteredUserList.length }} 条记录</text>
		</view>
	</view>
</template>

<script>
	import {
		onMounted,
		ref,
		computed,
	} from 'vue';
	import {
		useToken
	} from '@/hooks/useToken';
	import {
		getUserInfo,
		listAllUsers
	} from '@/api/user';

	export default {
		setup() {
			const {
				getToken
			} = useToken();

			// 用户列表相关
			const isAdmin = ref(false);
			const userList = ref([]);
			const loading = ref(true);
			const searchText = ref('');

			// 获取当前用户信息（判断是否是管理员）
			const fetchUserInfo = async () => {
				try {
					const result = await getUserInfo();

					if (result.code === 200) {
						isAdmin.value = result.data.isAdmin;

						// 如果是管理员，获取用户列表
						if (isAdmin.value) {
							await fetchUserList();
						} else {
							loading.value = false;
						}
					} else {
						uni.showToast({
							title: result.msg || '获取用户信息失败',
							icon: 'none'
						});
						loading.value = false;
					}
				} catch (error) {
					console.error('获取用户信息失败:', error);
					uni.showToast({
						title: '获取用户信息失败',
						icon: 'none'
					});
					loading.value = false;
				}
			};

			// 获取用户列表
			const fetchUserList = async () => {
				try {
					loading.value = true;

					const result = await listAllUsers();

					if (result.code === 200) {
						userList.value = result.data || [];
					} else if (result.code === 403) {
						isAdmin.value = false;
					} else {
						uni.showToast({
							title: result.msg || '获取用户列表失败',
							icon: 'none'
						});
					}

					loading.value = false;
				} catch (error) {
					console.error('获取用户列表失败:', error);
					uni.showToast({
						title: '获取用户列表失败',
						icon: 'none'
					});
					loading.value = false;
				}
			};

			// 过滤用户列表
			const filteredUserList = computed(() => {
				if (!searchText.value) return userList.value;

				const keyword = searchText.value.toLowerCase();
				return userList.value.filter(user => {
					return (
						user.username.toLowerCase().includes(keyword) ||
						(user.realName && user.realName.toLowerCase().includes(keyword))
					);
				});
			});

			// 获取用户状态（处理可能存在的undefined）
			const getUserStatus = (user) => {
				return user && user.status !== undefined ? user.status : 1; // 默认为正常状态
			};

			// 清除搜索
			const clearSearch = () => {
				searchText.value = '';
			};

			// 日期格式化
			const formatDateTime = (dateStr) => {
				if (!dateStr) return '';
				const date = new Date(dateStr);
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const hours = String(date.getHours()).padStart(2, '0');
				const minutes = String(date.getMinutes()).padStart(2, '0');

				return `${year}-${month}-${day} ${hours}:${minutes}`;
			};

			// 查看用户详情
			const viewUser = (user) => {
				uni.showToast({
					title: '查看用户: ' + user.realName,
					icon: 'none'
				});
				// 实际应用中可以导航到用户详情页或弹出详情窗口
			};

			// 编辑用户
			const editUser = (user) => {
				uni.showToast({
					title: '编辑用户: ' + user.realName,
					icon: 'none'
				});
				// 实际应用中可以导航到用户编辑页或弹出编辑窗口
			};

			// 页面加载时获取数据
			onMounted(async () => {
				const token = getToken();

				if (!token) {
					uni.reLaunch({
						url: '/pages/login/login'
					});
					return;
				}

				await fetchUserInfo();
			});

			// 使用onShow代替uni.onTabItemTap
			// onShow(() => {
			// 	fetchUserInfo();
			// });

			return {
				isAdmin,
				userList,
				loading,
				searchText,
				filteredUserList,
				getUserStatus,
				clearSearch,
				formatDateTime,
				viewUser,
				editUser
			};
		}
	}
</script>

<style lang="scss">
	.container {
		padding: 20px;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;

		.title {
			font-size: 22px;
			font-weight: bold;
			color: #333;
		}

		.admin-tip {
			background-color: #2979ff;
			color: #fff;
			font-size: 12px;
			padding: 4px 8px;
			border-radius: 4px;
		}
	}

	.search-box {
		margin-bottom: 20px;

		.search-input {
			background-color: #fff;
			border-radius: 8px;
			padding: 10px 15px;
			display: flex;
			align-items: center;
			box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

			.iconfont {
				color: #999;
				margin-right: 10px;
			}

			input {
				flex: 1;
				height: 24px;
				font-size: 14px;
			}

			.clear-btn {
				color: #999;
				font-size: 18px;
				padding: 0 5px;
			}
		}
	}

	.no-permission,
	.empty-container,
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 50px 0;

		image {
			width: 150px;
			height: 150px;
			margin-bottom: 20px;
		}

		text {
			color: #999;
			font-size: 16px;
		}
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid #f3f3f3;
		border-top: 3px solid #2979ff;
		border-radius: 50%;
		margin-bottom: 20px;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}

	// 表格样式
	.table-container {
		background-color: #fff;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		overflow: auto;
		margin-bottom: 20px;
	}

	.table-header {
		display: flex;
		background-color: #f0f8ff;
		border-bottom: 1px solid #e0e0e0;
		position: sticky;
		top: 0;
		z-index: 1;

		.th {
			padding: 12px 15px;
			font-weight: bold;
			color: #333;
			text-align: left;
			flex: 1;
			min-width: 120px;

			&.th-number {
				flex: 0 0 60px;
				min-width: 60px;
			}

			&.th-gender {
				flex: 0 0 80px;
				min-width: 80px;
			}

			&.th-action {
				flex: 0 0 120px;
				min-width: 120px;
			}
		}
	}

	.table-body {
		.table-row {
			display: flex;
			border-bottom: 1px solid #f0f0f0;

			&.row-even {
				background-color: #f9f9f9;
			}

			&:hover {
				background-color: #f0f7ff;
			}

			.td {
				padding: 12px 15px;
				flex: 1;
				min-width: 120px;
				display: flex;
				align-items: center;

				&.td-number {
					flex: 0 0 60px;
					min-width: 60px;
					color: #999;
				}

				&.td-gender {
					flex: 0 0 80px;
					min-width: 80px;
				}

				&.td-action {
					flex: 0 0 120px;
					min-width: 120px;
				}
			}
		}
	}

	// 角标样式
	.badge {
		padding: 4px 8px;
		border-radius: 12px;
		font-size: 12px;
		background-color: #e0e0e0;
		color: #fff;
		text-align: center;

		&.badge-primary {
			background-color: #2979ff;
		}

		&.badge-success {
			background-color: #4caf50;
		}

		&.badge-danger {
			background-color: #f44336;
		}

		&.badge-default {
			background-color: #9e9e9e;
		}
	}

	// 性别图标
	.gender-icon {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;

		&.gender-male {
			background-color: rgba(41, 121, 255, 0.1);
			color: #2979ff;
		}

		&.gender-female {
			background-color: rgba(244, 67, 54, 0.1);
			color: #f44336;
		}
	}

	// 操作按钮
	.action-buttons {
		display: flex;

		.action-btn {
			margin-right: 8px;
			padding: 4px 8px;
			border-radius: 4px;
			font-size: 12px;
			cursor: pointer;

			&.view-btn {
				background-color: rgba(41, 121, 255, 0.1);
				color: #2979ff;
			}

			&.edit-btn {
				background-color: rgba(255, 152, 0, 0.1);
				color: #ff9800;
			}
		}
	}

	// 分页控件
	.pagination {
		display: flex;
		justify-content: flex-end;
		padding: 10px 0;

		.page-info {
			color: #666;
			font-size: 14px;
		}
	}
</style>