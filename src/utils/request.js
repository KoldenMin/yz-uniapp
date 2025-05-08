// src/utils/request.js

import { getToken } from './auth';

// 基础配置
const baseURL = 'http://localhost:8080/api';
const timeout = 30000;

// 请求函数封装
function service(options = {}) {
	// 处理URL
	options.url = (options.baseURL || baseURL) + (options.url || '');

	// 处理请求头
	options.header = options.header || {};
	const token = getToken();
	if (token) {
		options.header['Authorization'] = `Bearer ${token}`;
	}

	// 处理超时
	options.timeout = options.timeout || timeout;

	// 发起请求
	return new Promise((resolve, reject) => {
		options.success = (res) => {
			// 判断服务器返回的状态码
			if (res.statusCode !== 200) {
				showError(res.data.message || '请求失败');

				// 401: 未登录或token过期
				if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
					uni.navigateTo({
						url: '/pages/login/login'
					});
				}

				reject(res);
			} else {
				// 处理服务器返回的业务状态码
				const data = res.data;
				if (data.code !== 200) {
					showError(data.message || '业务处理失败');

					// 401: 未登录或token过期
					if (data.code === 401) {
						uni.navigateTo({
							url: '/pages/login/login'
						});
					}

					reject(new Error(data.message || '业务处理失败'));
				} else {
					resolve(data);
				}
			}
		};

		options.fail = (err) => {
			console.log('err: ', err);
			showError('网络异常，请稍后再试');
			reject(err);
		};

		uni.request(options);
	});
}

// 显示错误消息
function showError(message) {
	uni.showToast({
		title: message,
		icon: 'none',
		duration: 5000
	});
}

// 请求方法简化
const request = {
	get(url, data, options = {}) {
		return service({
			url,
			data,
			method: 'GET',
			...options
		});
	},

	post(url, data, options = {}) {
		return service({
			url,
			data,
			method: 'POST',
			...options
		});
	},

	put(url, data, options = {}) {
		return service({
			url,
			data,
			method: 'PUT',
			...options
		});
	},

	delete(url, data, options = {}) {
		return service({
			url,
			data,
			method: 'DELETE',
			...options
		});
	}
};

export default request;