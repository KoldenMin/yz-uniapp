<template>
	<view class="login-container">
		<view class="login-header">
			<image class="logo" mode="aspectFit"></image>
			<text class="title">员工信息管理系统</text>
		</view>

		<view class="login-form">
			<view class="input-group">
				<text class="label">用户名</text>
				<input type="text" v-model="loginForm.username" placeholder="请输入用户名" />
			</view>

			<view class="input-group">
				<text class="label">密码</text>
				<input type="password" v-model="loginForm.password" placeholder="请输入密码" />
			</view>

			<view class="input-group captcha-group">
				<text class="label">验证码</text>
				<input type="text" v-model="loginForm.captcha" placeholder="请输入验证码" />
				<view class="captcha" @click="refreshCaptcha">
					<text>{{ captchaText }}</text>
				</view>
			</view>

			<button class="login-btn" @click="handleLogin">登录</button>
			<view class="register-link" @click="goToRegister">没有账号？点击注册</view>
		</view>
	</view>
</template>

<script>
	import {
		ref,
		reactive,
		onMounted
	} from 'vue';
	import {
		useToken
	} from '@/hooks/useToken';
	import {
		login
	} from '@/api/user';

	export default {
		setup() {
			const {
				setToken
			} = useToken();

			const loginForm = reactive({
				username: '',
				password: '',
				captcha: ''
			});

			const captchaText = ref('');
			const realCaptcha = ref('');

			// 生成随机验证码
			const generateCaptcha = () => {
				const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
				let result = '';
				for (let i = 0; i < 4; i++) {
					result += chars[Math.floor(Math.random() * chars.length)];
				}
				realCaptcha.value = result;
				captchaText.value = result;
			};

			// 刷新验证码
			const refreshCaptcha = () => {
				generateCaptcha();
			};

			// 登录处理
			const handleLogin = async () => {
				// 验证表单
				if (!loginForm.username) {
					uni.showToast({
						title: '请输入用户名',
						icon: 'none'
					});
					return;
				}

				if (!loginForm.password) {
					uni.showToast({
						title: '请输入密码',
						icon: 'none'
					});
					return;
				}

				if (!loginForm.captcha) {
					uni.showToast({
						title: '请输入验证码',
						icon: 'none'
					});
					return;
				}

				// 验证码检验 (前端验证)
				if (loginForm.captcha.toLowerCase() !== realCaptcha.value.toLowerCase()) {
					uni.showToast({
						title: '验证码错误',
						icon: 'none'
					});
					refreshCaptcha();
					return;
				}

				// 发送登录请求
				try {
					uni.showLoading({
						title: '登录中...'
					});

					const result = await login({
						username: loginForm.username,
						password: loginForm.password,
						captcha: loginForm.captcha
					});

					uni.hideLoading();

					if (result.code === 200) {
						// 存储token和用户信息
						setToken(result.data.token);
						uni.setStorageSync('userInfo', JSON.stringify(result.data));

						// 登录成功跳转到首页
						uni.showToast({
							title: '登录成功',
							icon: 'success'
						});

						setTimeout(() => {
							uni.reLaunch({
								url: '/pages/index/index'
							});
						}, 1500);
					} else {
						uni.showToast({
							title: result.msg || '登录失败',
							icon: 'none'
						});
						refreshCaptcha();
					}
				} catch (error) {
					uni.hideLoading();
					uni.showToast({
						title: '登录失败，请重试',
						icon: 'none'
					});
					refreshCaptcha();
				}
			};

			// 跳转到注册页面
			const goToRegister = () => {
				uni.navigateTo({
					url: '/pages/register/register'
				});
			};

			// 页面加载时生成验证码
			onMounted(() => {
				generateCaptcha();
			});

			return {
				loginForm,
				captchaText,
				refreshCaptcha,
				handleLogin,
				goToRegister
			};
		}
	}
</script>

<style lang="scss">
	.login-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100vh;
		padding: 40px 20px;
		background-color: #f5f5f5;
	}

	.login-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 40px;

		.logo {
			width: 80px;
			height: 80px;
			margin-bottom: 15px;
		}

		.title {
			font-size: 24px;
			font-weight: bold;
			color: #333;
		}
	}

	.login-form {
		width: 100%;
		padding: 20px;
		background-color: #fff;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

		.input-group {
			margin-bottom: 20px;

			.label {
				display: block;
				margin-bottom: 8px;
				font-size: 14px;
				color: #333;
			}

			input {
				width: 100%;
				height: 44px;
				padding: 0 15px;
				border: 1px solid #ddd;
				border-radius: 4px;
				font-size: 16px;
			}
		}

		.captcha-group {
			display: flex;
			flex-direction: column;

			input {
				width: 65%;
			}

			.captcha {
				position: absolute;
				right: 40px;
				width: 30%;
				height: 44px;
				line-height: 44px;
				text-align: center;
				background-color: #e8f0fe;
				border-radius: 4px;
				font-size: 16px;
				font-weight: bold;
				color: #333;
				letter-spacing: 2px;
			}
		}

		.login-btn {
			width: 100%;
			height: 44px;
			background-color: #007aff;
			color: #fff;
			border-radius: 4px;
			font-size: 16px;
			font-weight: bold;
			margin-top: 10px;
		}

		.register-link {
			margin-top: 15px;
			text-align: center;
			font-size: 14px;
			color: #007aff;
		}
	}
</style>