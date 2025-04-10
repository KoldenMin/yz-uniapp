<template>
	<view class="container">
		<view class="header">
			<text class="title">添加教育背景</text>
		</view>

		<view class="form-card">
			<view class="form-item">
				<text class="form-label">学校名称 <text class="required">*</text></text>
				<input type="text" v-model="educationForm.school" placeholder="请输入学校名称" />
			</view>

			<view class="form-item">
				<text class="form-label">专业 <text class="required">*</text></text>
				<input type="text" v-model="educationForm.major" placeholder="请输入专业" />
			</view>

			<view class="form-item">
				<text class="form-label">学位</text>
				<picker mode="selector" :range="degreeOptions" @change="degreeChange">
					<view class="picker-value">{{ educationForm.degree || '请选择学位' }}</view>
				</picker>
			</view>

			<view class="form-item">
				<text class="form-label">开始时间 <text class="required">*</text></text>
				<picker mode="date" :value="startDateStr" @change="startDateChange">
					<view class="picker-value">{{ startDateStr || '请选择开始时间' }}</view>
				</picker>
			</view>

			<view class="form-item">
				<text class="form-label">结束时间</text>
				<picker mode="date" :value="endDateStr" @change="endDateChange">
					<view class="picker-value">{{ endDateStr || '请选择结束时间' }}</view>
				</picker>
			</view>

			<view class="form-item">
				<text class="form-label">教育经历描述</text>
				<textarea v-model="educationForm.description" placeholder="请输入教育经历描述" />
			</view>
		</view>

		<view class="bottom-btn-group">
			<button class="cancel-btn" @click="goBack">取消</button>
			<button class="submit-btn" @click="handleSubmit">提交</button>
		</view>
	</view>
</template>

<script>
	import {
		ref,
		reactive
	} from 'vue';
	import {
		useToken
	} from '@/hooks/useToken';
	import {
		addEducation
	} from '@/api/education';

	export default {
		setup() {
			const {
				getToken
			} = useToken();

			// 添加教育背景表单
			const educationForm = reactive({
				school: '',
				major: '',
				degree: '',
				startDate: null,
				endDate: null,
				description: ''
			});

			// 日期格式化数据
			const startDateStr = ref('');
			const endDateStr = ref('');

			// 学位选项
			const degreeOptions = ['学士', '硕士', '博士', '其他'];

			// 学位选择
			const degreeChange = (e) => {
				educationForm.degree = degreeOptions[e.detail.value];
			};

			// 开始日期选择
			const startDateChange = (e) => {
				startDateStr.value = e.detail.value;
				educationForm.startDate = new Date(e.detail.value);
			};

			// 结束日期选择
			const endDateChange = (e) => {
				endDateStr.value = e.detail.value;
				educationForm.endDate = new Date(e.detail.value);
			};

			// 表单验证
			const validateForm = () => {
				if (!educationForm.school) {
					uni.showToast({
						title: '学校名称不能为空',
						icon: 'none'
					});
					return false;
				}

				if (!educationForm.major) {
					uni.showToast({
						title: '专业不能为空',
						icon: 'none'
					});
					return false;
				}

				if (!educationForm.startDate) {
					uni.showToast({
						title: '开始日期不能为空',
						icon: 'none'
					});
					return false;
				}

				if (educationForm.endDate && educationForm.startDate > educationForm.endDate) {
					uni.showToast({
						title: '结束日期不能早于开始日期',
						icon: 'none'
					});
					return false;
				}

				return true;
			};

			// 提交表单
			const handleSubmit = async () => {
				if (!validateForm()) return;

				try {
					uni.showLoading({
						title: '提交中...'
					});

					const result = await addEducation(educationForm);

					uni.hideLoading();

					if (result.code === 200) {
						uni.showToast({
							title: '添加成功',
							icon: 'success'
						});

						// 延迟返回，让用户看到成功提示
						setTimeout(() => {
							goBack();
						}, 1500);
					} else {
						uni.showToast({
							title: result.msg || '添加失败',
							icon: 'none'
						});
					}
				} catch (error) {
					uni.hideLoading();
					console.error('添加教育背景失败:', error);
					uni.showToast({
						title: '添加失败，请重试',
						icon: 'none'
					});
				}
			};

			// 返回上一页
			const goBack = () => {
				uni.navigateBack();
			};

			return {
				educationForm,
				startDateStr,
				endDateStr,
				degreeOptions,
				degreeChange,
				startDateChange,
				endDateChange,
				handleSubmit,
				goBack
			};
		}
	}
</script>

<style lang="scss">
	.container {
		padding: 20px;
		background-color: #f5f5f5;
		min-height: 100vh;
		position: relative;
		padding-bottom: 80px;
	}

	.header {
		margin-bottom: 20px;

		.title {
			font-size: 22px;
			font-weight: bold;
			color: #333;
		}
	}

	.form-card {
		background-color: #fff;
		border-radius: 8px;
		padding: 20px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

		.form-item {
			margin-bottom: 20px;

			&:last-child {
				margin-bottom: 0;
			}

			.form-label {
				display: block;
				margin-bottom: 8px;
				font-size: 14px;
				color: #333;

				.required {
					color: #ff3b30;
				}
			}

			input,
			textarea,
			.picker-value {
				width: 100%;
				height: 44px;
				padding: 10px 15px;
				border: 1px solid #ddd;
				border-radius: 6px;
				font-size: 14px;
				color: #333;
				background-color: #fff;
			}

			textarea {
				height: 100px;
			}

			.picker-value {
				line-height: 24px;
			}
		}
	}

	.bottom-btn-group {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 10px 20px;
		background-color: #fff;
		display: flex;
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);

		button {
			flex: 1;
			height: 44px;
			line-height: 44px;
			margin: 0 5px;
			border-radius: 6px;
			font-size: 16px;
		}

		.cancel-btn {
			background-color: #f5f5f5;
			color: #333;
		}

		.submit-btn {
			background-color: #2979ff;
			color: #fff;
		}
	}
</style>