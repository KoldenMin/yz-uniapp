<template>
	<view class="register-container">
		<view class="register-header">
			<text class="title">用户注册</text>
		</view>

		<view class="register-form">
			<!-- 基本信息 -->
			<view class="form-section">
				<view class="section-title">基本信息</view>

				<view class="input-group">
					<text class="label">用户名 <text class="required">*</text></text>
					<input type="text" v-model="registerForm.username" placeholder="2-20个字符" />
				</view>

				<view class="input-group">
					<text class="label">密码 <text class="required">*</text></text>
					<input type="password" v-model="registerForm.password" placeholder="2-20个字符" />
				</view>

				<view class="input-group">
					<text class="label">姓名 <text class="required">*</text></text>
					<input type="text" v-model="registerForm.realName" placeholder="请输入真实姓名" />
				</view>

				<view class="input-group">
					<text class="label">性别 <text class="required">*</text></text>
					<radio-group @change="genderChange">
						<label class="radio">
							<radio value="1" :checked="registerForm.gender === 1" />男
						</label>
						<label class="radio">
							<radio value="0" :checked="registerForm.gender === 0" />女
						</label>
					</radio-group>
				</view>

				<view class="input-group">
					<text class="label">年龄 <text class="required">*</text></text>
					<input type="number" v-model="registerForm.age" placeholder="请输入年龄" />
				</view>

				<view class="input-group">
					<text class="label">电话 <text class="required">*</text></text>
					<input type="number" v-model="registerForm.phone" placeholder="请输入手机号" />
				</view>

				<view class="input-group">
					<text class="label">住址</text>
					<input type="text" v-model="registerForm.currentAddress" placeholder="请输入当前住址" />
				</view>

				<view class="input-group">
					<text class="label">入职时间</text>
					<picker mode="date" :value="entryTimeStr" @change="entryTimeChange">
						<view class="picker-value">{{ entryTimeStr || '请选择入职时间' }}</view>
					</picker>
				</view>

				<view class="input-group">
					<text class="label">职能描述</text>
					<textarea v-model="registerForm.jobDescription" placeholder="请输入职能描述" />
				</view>
			</view>

			<!-- 教育背景 -->
			<view class="form-section">
				<view class="section-title">
					教育背景
					<text class="add-btn" @click="addEducation">+ 添加</text>
				</view>

				<view v-if="registerForm.educationList.length === 0" class="empty-tip">
					请添加至少一项教育背景
				</view>

				<view v-for="(edu, index) in registerForm.educationList" :key="index" class="education-item">
					<view class="edu-header">
						<text>教育经历 #{{ index + 1 }}</text>
						<text class="remove-btn" @click="removeEducation(index)">删除</text>
					</view>

					<view class="input-group">
						<text class="label">学校名称 <text class="required">*</text></text>
						<input type="text" v-model="edu.school" placeholder="请输入学校名称" />
					</view>

					<view class="input-group">
						<text class="label">专业 <text class="required">*</text></text>
						<input type="text" v-model="edu.major" placeholder="请输入专业" />
					</view>

					<view class="input-group">
						<text class="label">学位</text>
						<input type="text" v-model="edu.degree" placeholder="请输入学位" />
					</view>

					<view class="input-group">
						<text class="label">开始时间 <text class="required">*</text></text>
						<picker mode="date" :value="formatDate(edu.startDate)"
							@change="(e) => startDateChange(e, index)">
							<view class="picker-value">{{ formatDate(edu.startDate) || '请选择开始时间' }}</view>
						</picker>
					</view>

					<view class="input-group">
						<text class="label">结束时间</text>
						<picker mode="date" :value="formatDate(edu.endDate)" @change="(e) => endDateChange(e, index)">
							<view class="picker-value">{{ formatDate(edu.endDate) || '请选择结束时间' }}</view>
						</picker>
					</view>

					<view class="input-group">
						<text class="label">描述</text>
						<textarea v-model="edu.description" placeholder="请输入教育经历描述" />
					</view>
				</view>
			</view>

			<button class="register-btn" @click="handleRegister">注册</button>
			<view class="login-link" @click="goToLogin">已有账号？返回登录</view>
		</view>
	</view>
</template>

<script>
	import {
		ref,
		reactive
	} from 'vue';
	import {
		register
	} from '@/api/user';

	export default {
		setup() {
			// 注册表单数据
			const registerForm = reactive({
				username: '',
				password: '',
				realName: '',
				gender: 1,
				age: '',
				phone: '',
				currentAddress: '',
				entryTime: null,
				jobDescription: '',
				educationList: []
			});

			// 入职时间展示
			const entryTimeStr = ref('');

			// 性别选择
			const genderChange = (e) => {
				registerForm.gender = parseInt(e.detail.value);
			};

			// 入职时间选择
			const entryTimeChange = (e) => {
				entryTimeStr.value = e.detail.value;
				registerForm.entryTime = new Date(e.detail.value);
			};

			// 添加教育背景
			const addEducation = () => {
				registerForm.educationList.push({
					school: '',
					major: '',
					degree: '',
					startDate: null,
					endDate: null,
					description: ''
				});
			};

			// 移除教育背景
			const removeEducation = (index) => {
				registerForm.educationList.splice(index, 1);
			};

			// 开始日期选择
			const startDateChange = (e, index) => {
				registerForm.educationList[index].startDate = new Date(e.detail.value);
			};

			// 结束日期选择
			const endDateChange = (e, index) => {
				registerForm.educationList[index].endDate = new Date(e.detail.value);
			};

			// 日期格式化
			const formatDate = (date) => {
				if (!date) return '';
				const d = new Date(date);
				const year = d.getFullYear();
				const month = String(d.getMonth() + 1).padStart(2, '0');
				const day = String(d.getDate()).padStart(2, '0');
				return `${year}-${month}-${day}`;
			};

			// 表单验证
			const validateForm = () => {
				if (!registerForm.username || registerForm.username.length < 2 || registerForm.username.length > 20) {
					uni.showToast({
						title: '用户名长度必须在2-20个字符之间',
						icon: 'none'
					});
					return false;
				}

				if (!registerForm.password || registerForm.password.length < 2 || registerForm.password.length > 20) {
					uni.showToast({
						title: '密码长度必须在2-20个字符之间',
						icon: 'none'
					});
					return false;
				}

				if (!registerForm.realName) {
					uni.showToast({
						title: '姓名不能为空',
						icon: 'none'
					});
					return false;
				}

				if (!registerForm.age || registerForm.age < 1 || registerForm.age > 100) {
					uni.showToast({
						title: '年龄必须在1-100岁之间',
						icon: 'none'
					});
					return false;
				}

				if (!registerForm.phone || !/^1[3-9]\d{9}$/.test(registerForm.phone)) {
					uni.showToast({
						title: '手机号码格式不正确',
						icon: 'none'
					});
					return false;
				}

				if (registerForm.educationList.length === 0) {
					uni.showToast({
						title: '请至少添加一项教育背景',
						icon: 'none'
					});
					return false;
				}

				// 验证每项教育背景
				for (let i = 0; i < registerForm.educationList.length; i++) {
					const edu = registerForm.educationList[i];

					if (!edu.school) {
						uni.showToast({
							title: `教育背景#${i + 1}：学校名称不能为空`,
							icon: 'none'
						});
						return false;
					}

					if (!edu.major) {
						uni.showToast({
							title: `教育背景#${i + 1}：专业不能为空`,
							icon: 'none'
						});
						return false;
					}

					if (!edu.startDate) {
						uni.showToast({
							title: `教育背景#${i + 1}：开始日期不能为空`,
							icon: 'none'
						});
						return false;
					}
				}

				return true;
			};

			// 注册处理
			const handleRegister = async () => {
				if (!validateForm()) return;

				try {
					uni.showLoading({
						title: '注册中...'
					});

					const result = await register(registerForm);

					uni.hideLoading();

					if (result.code === 200) {
						uni.showToast({
							title: '注册成功',
							icon: 'success'
						});

						setTimeout(() => {
							uni.navigateBack();
						}, 1500);
					} else {
						uni.showToast({
							title: result.msg || '注册失败',
							icon: 'none'
						});
					}
				} catch (error) {
					uni.hideLoading();
					uni.showToast({
						title: '注册失败，请重试',
						icon: 'none'
					});
				}
			};

			// 返回登录页
			const goToLogin = () => {
				uni.navigateBack();
			};

			return {
				registerForm,
				entryTimeStr,
				genderChange,
				entryTimeChange,
				addEducation,
				removeEducation,
				startDateChange,
				endDateChange,
				formatDate,
				handleRegister,
				goToLogin
			};
		}
	}
</script>

<style lang="scss">
	.register-container {
		padding: 20px;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	.register-header {
		margin-bottom: 20px;

		.title {
			font-size: 24px;
			font-weight: bold;
			color: #333;
		}
	}

	.register-form {
		background-color: #fff;
		border-radius: 8px;
		padding: 15px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

		.form-section {
			margin-bottom: 20px;
			padding-bottom: 20px;
			border-bottom: 1px solid #eee;

			&:last-of-type {
				border-bottom: none;
			}
		}

		.section-title {
			font-size: 18px;
			font-weight: bold;
			color: #333;
			margin-bottom: 15px;
			display: flex;
			justify-content: space-between;

			.add-btn {
				color: #007aff;
				font-size: 14px;
			}
		}

		.input-group {
			margin-bottom: 15px;

			.label {
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
				padding: 10px 15px;
				border: 1px solid #ddd;
				border-radius: 4px;
				font-size: 14px;
			}

			textarea {
				height: 80px;
			}

			.picker-value {
				height: 44px;
				line-height: 24px;
				color: #333;
			}

			.radio-group {
				display: flex;
				flex-direction: row;
			}

			.radio {
				margin-right: 20px;
			}
		}

		.education-item {
			background-color: #f9f9f9;
			border-radius: 6px;
			padding: 15px;
			margin-bottom: 15px;

			.edu-header {
				display: flex;
				justify-content: space-between;
				margin-bottom: 10px;
				font-weight: bold;

				.remove-btn {
					color: #ff3b30;
				}
			}
		}

		.empty-tip {
			text-align: center;
			color: #999;
			padding: 20px 0;
		}

		.register-btn {
			width: 100%;
			height: 44px;
			background-color: #007aff;
			color: #fff;
			border-radius: 4px;
			font-size: 16px;
			font-weight: bold;
			margin-top: 20px;
		}

		.login-link {
			margin-top: 15px;
			text-align: center;
			font-size: 14px;
			color: #007aff;
		}
	}
</style>