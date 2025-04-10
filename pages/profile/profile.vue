<template>
	<view class="container">
		<view class="profile-header">
			<view class="avatar-container">
				<image class="avatar" mode="aspectFill">
				</image>
			</view>
			<view class="user-basic">
				<text class="name">{{ userInfo.realName }}</text>
				<text class="role">{{ userInfo.isAdmin ? '管理员' : '普通用户' }}</text>
			</view>
		</view>

		<!-- 基本信息 -->
		<view class="card">
			<view class="card-title">
				<text>基本信息</text>
			</view>

			<view class="info-list">
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
					<text class="value">{{ userInfo.currentAddress || '暂无' }}</text>
				</view>
			</view>
		</view>

		<!-- 工作信息 -->
		<view class="card">
			<view class="card-title">
				<text>工作信息</text>
			</view>

			<view class="info-list">
				<view class="info-item">
					<text class="label">入职时间:</text>
					<text class="value">{{ formatDate(userInfo.entryTime) || '暂无' }}</text>
				</view>

				<view class="info-item">
					<text class="label">职能描述:</text>
					<text class="value">{{ userInfo.jobDescription || '暂无' }}</text>
				</view>
			</view>
		</view>

		<!-- 教育背景 -->
		<view class="card">
			<view class="card-title">
				<text>教育背景</text>
				<text class="action-btn" @click="goToAddEducation">添加</text>
			</view>

			<view v-if="educationList.length === 0" class="empty-tip">
				<text>暂无教育背景信息</text>
			</view>

			<view v-else class="timeline">
				<view v-for="(edu, index) in educationList" :key="edu.id" class="timeline-item">
					<view class="time-point"></view>
					<view class="time-line" v-if="index !== educationList.length - 1"></view>

					<view class="timeline-content">
						<view class="timeline-header">
							<text class="timeline-title">{{ edu.school }} - {{ edu.major }}</text>
							<text class="timeline-time">{{ formatDate(edu.startDate) }} 至
								{{ edu.endDate ? formatDate(edu.endDate) : '至今' }}</text>
						</view>

						<view class="timeline-body">
							<view class="edu-detail">
								<text class="detail-label">学位:</text>
								<text class="detail-value">{{ edu.degree || '暂无' }}</text>
							</view>

							<view class="edu-detail" v-if="edu.description">
								<text class="detail-label">描述:</text>
								<text class="detail-value">{{ edu.description }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		onMounted,
		ref
	} from 'vue';
	import {
		useToken
	} from '@/hooks/useToken';
	import {
		getUserInfo
	} from '@/api/user';
	import {
		listEducation
	} from '@/api/education';

	export default {
		setup() {
			const {
				getToken
			} = useToken();

			// 用户信息
			const userInfo = ref({});
			const educationList = ref([]);

			// 获取用户信息
			const fetchUserInfo = async () => {
				try {
					const result = await getUserInfo();

					if (result.code === 200) {
						userInfo.value = result.data;
						console.log('@@',userInfo.value)
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
						// 按照开始时间倒序排列
						educationList.value = (result.data || []).sort((a, b) => {
							return new Date(b.startDate) - new Date(a.startDate);
						});
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

			// 日期格式化
			const formatDate = (dateStr) => {
				if (!dateStr) return '';
				const date = new Date(dateStr);
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				return `${year}-${month}-${day}`;
			};

			// 跳转到添加教育背景页面
			const goToAddEducation = () => {
				uni.navigateTo({
					url: '/pages/education/add'
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

				await fetchUserInfo();
				await fetchEducation();
			});

			// 页面显示时刷新数据
			// uni.onTabItemTap((item) => {
			// 	if (item.pagePath === 'pages/profile/profile') {
			// 		fetchUserInfo();
			// 		fetchEducation();
			// 	}
			// });
			

			return {
				userInfo,
				educationList,
				formatDate,
				goToAddEducation
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

	.profile-header {
		display: flex;
		align-items: center;
		background-color: #fff;
		padding: 20px;
		border-radius: 8px;
		margin-bottom: 20px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

		.avatar-container {
			margin-right: 15px;

			.avatar {
				width: 70px;
				height: 70px;
				border-radius: 50%;
				border: 2px solid #2979ff;
			}
		}

		.user-basic {
			.name {
				font-size: 20px;
				font-weight: bold;
				color: #333;
				display: block;
				margin-bottom: 5px;
			}

			.role {
				font-size: 14px;
				color: #fff;
				background-color: #2979ff;
				padding: 2px 8px;
				border-radius: 10px;
			}
		}
	}

	.card {
		background-color: #fff;
		border-radius: 8px;
		margin-bottom: 20px;
		overflow: hidden;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

		.card-title {
			padding: 15px;
			border-bottom: 1px solid #eee;
			display: flex;
			justify-content: space-between;
			align-items: center;

			text {
				font-size: 16px;
				font-weight: bold;
				color: #333;
			}

			.action-btn {
				font-size: 14px;
				color: #2979ff;
			}
		}

		.info-list {
			padding: 0 15px;

			.info-item {
				display: flex;
				padding: 15px 0;
				border-bottom: 1px solid #f5f5f5;

				&:last-child {
					border-bottom: none;
				}

				.label {
					width: 80px;
					color: #666;
					font-size: 14px;
				}

				.value {
					flex: 1;
					color: #333;
					font-size: 14px;
				}
			}
		}

		.empty-tip {
			padding: 30px 0;
			text-align: center;
			color: #999;
		}

		.timeline {
			padding: 15px;

			.timeline-item {
				position: relative;
				padding-left: 20px;

				.time-point {
					position: absolute;
					left: 0;
					top: 5px;
					width: 10px;
					height: 10px;
					border-radius: 50%;
					background-color: #2979ff;
				}

				.time-line {
					position: absolute;
					left: 4px;
					top: 15px;
					width: 2px;
					height: calc(100% - 5px);
					background-color: #e0e0e0;
				}

				.timeline-content {
					padding-bottom: 20px;

					.timeline-header {
						margin-bottom: 10px;

						.timeline-title {
							font-size: 16px;
							font-weight: bold;
							color: #333;
							display: block;
						}

						.timeline-time {
							font-size: 12px;
							color: #999;
						}
					}

					.timeline-body {
						.edu-detail {
							margin-bottom: 5px;

							.detail-label {
								color: #666;
								margin-right: 5px;
							}

							.detail-value {
								color: #333;
							}
						}
					}
				}
			}
		}
	}
</style>