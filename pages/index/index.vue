<template>
	<view class="container">
		<view class="welcome-card">
			<view class="welcome-text">
				<text class="welcome-title">欢迎使用用户管理系统</text>
			</view>

			<view class="user-info">
				<text class="greeting">您好，{{ userInfo.realName }}！</text>
				<text class="role">{{ userInfo.isAdmin ? '管理员' : '普通用户' }}</text>
			</view>

			<view class="current-time">
				<text>当前时间: {{ currentTime }}</text>
			</view>

			<view class="role-info" v-if="userInfo.isAdmin">
				<text>您具有管理员权限，可以查看所有用户信息</text>
			</view>
		</view>

		<view class="quick-stats">
			<view class="stat-card">
				<view class="stat-icon">
					<text class="iconfont icon-user"></text>
				</view>
				<view class="stat-info">
					<text class="stat-label">我的教育背景</text>
					<text class="stat-value">{{ educationCount }}</text>
				</view>
			</view>

			<view class="stat-card" v-if="userInfo.isAdmin">
				<view class="stat-icon">
					<text class="iconfont icon-users"></text>
				</view>
				<view class="stat-info">
					<text class="stat-label">系统用户数</text>
					<text class="stat-value">{{ userCount }}</text>
				</view>
			</view>
		</view>

		<view class="action-buttons">
			<view class="action-button" @click="goToProfile">
				<text class="iconfont icon-profile"></text>
				<text>查看我的信息</text>
			</view>

			<view class="action-button" v-if="userInfo.isAdmin" @click="goToUserList">
				<text class="iconfont icon-list"></text>
				<text>查看用户列表</text>
			</view>

			<view class="action-button" @click="handleLogout">
				<text class="iconfont icon-logout"></text>
				<text>退出登录</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		onMounted,
		ref,
		computed
	} from 'vue';
	import {
		useToken
	} from '@/hooks/useToken';
	import {
		getUserInfo,
		listAllUsers
	} from '@/api/user';
	import {
		listEducation
	} from '@/api/education';

	export default {
		setup() {
			const {
				getToken,
				removeToken
			} = useToken();

			// 用户信息
			const userInfo = ref({});
			const educationList = ref([]);
			const userCount = ref(0);
			const currentTime = ref('');

			// 计算教育背景数量
			const educationCount = computed(() => {
				return educationList.value.length;
			});

			// 获取用户信息
			const fetchUserInfo = async () => {
				try {
					const result = await getUserInfo();

					if (result.code === 200) {
						userInfo.value = result.data;
						// 管理员显示用户数量
						if (result.data.isAdmin) {
							// 假设总用户数为5（实际应用中可以通过API获取）
							const userList = await listAllUsers()
							userCount.value = userList.data.length
						}
					} else {
						uni.showToast({
							title: result.msg || '获取用户信息失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('获取用户信息失败:', error);
					uni.showToast({
						title: '获取用户信息失败',
						icon: 'none'
					});
				}
			};

			// 获取教育背景
			const fetchEducation = async () => {
				try {
					const result = await listEducation();

					if (result.code === 200) {
						educationList.value = result.data || [];
					} else {
						uni.showToast({
							title: result.msg || '获取教育背景失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('获取教育背景失败:', error);
					uni.showToast({
						title: '获取教育背景失败',
						icon: 'none'
					});
				}
			};

			// 更新当前时间
			const updateCurrentTime = () => {
				const now = new Date();
				const year = now.getFullYear();
				const month = String(now.getMonth() + 1).padStart(2, '0');
				const day = String(now.getDate()).padStart(2, '0');
				const hours = String(now.getHours()).padStart(2, '0');
				const minutes = String(now.getMinutes()).padStart(2, '0');
				const seconds = String(now.getSeconds()).padStart(2, '0');

				currentTime.value = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
			};

			// 跳转到个人信息页
			const goToProfile = () => {
				uni.switchTab({
					url: '/pages/profile/profile'
				});
			};

			// 跳转到用户列表页
			const goToUserList = () => {
				uni.switchTab({
					url: '/pages/userlist/index'
				});
			};

			// 退出登录
			const handleLogout = () => {
				uni.showModal({
					title: '提示',
					content: '确定要退出登录吗？',
					success: (res) => {
						if (res.confirm) {
							// 清除token和用户信息
							removeToken();
							uni.removeStorageSync('userInfo');

							// 跳转到登录页
							uni.reLaunch({
								url: '/pages/login/login'
							});
						}
					}
				});
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

				updateCurrentTime();
				// 每秒更新一次时间
				setInterval(updateCurrentTime, 1000);

				await fetchUserInfo();
				await fetchEducation();
			});

			return {
				userInfo,
				educationCount,
				userCount,
				currentTime,
				goToProfile,
				goToUserList,
				handleLogout
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

	.welcome-card {
		background-color: #fff;
		border-radius: 8px;
		padding: 20px;
		margin-bottom: 20px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

		.welcome-text {
			margin-bottom: 15px;

			.welcome-title {
				font-size: 20px;
				color: #2979ff;
				font-weight: bold;
			}
		}

		.user-info {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20px;

			.greeting {
				font-size: 18px;
				color: #333;
				font-weight: bold;
			}

			.role {
				font-size: 14px;
				color: #fff;
				background-color: #2979ff;
				padding: 4px 8px;
				border-radius: 4px;
			}
		}

		.current-time,
		.role-info {
			font-size: 14px;
			color: #666;
			margin-top: 10px;
		}
	}

	.quick-stats {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20px;

		.stat-card {
			background-color: #fff;
			border-radius: 8px;
			padding: 15px;
			width: 48%;
			display: flex;
			align-items: center;
			box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

			.stat-icon {
				width: 40px;
				height: 40px;
				border-radius: 50%;
				background-color: rgba(41, 121, 255, 0.1);
				display: flex;
				align-items: center;
				justify-content: center;
				margin-right: 10px;

				.iconfont {
					font-size: 20px;
					color: #2979ff;
				}
			}

			.stat-info {
				flex: 1;

				.stat-label {
					font-size: 12px;
					color: #666;
					margin-bottom: 5px;
					display: block;
				}

				.stat-value {
					font-size: 18px;
					color: #333;
					font-weight: bold;
				}
			}
		}
	}

	.action-buttons {
		background-color: #fff;
		border-radius: 8px;
		padding: 10px 20px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

		.action-button {
			display: flex;
			align-items: center;
			padding: 15px 0;
			border-bottom: 1px solid #eee;

			&:last-child {
				border-bottom: none;
			}

			.iconfont {
				font-size: 20px;
				color: #2979ff;
				margin-right: 10px;
			}

			text {
				font-size: 16px;
				color: #333;
			}
		}
	}
</style>