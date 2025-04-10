import {
	useToken
} from '@/hooks/useToken';

// API基础URL，根据实际情况修改
const BASE_URL = 'http://localhost:8080/api'; // 修改为您的实际后端地址

/**
 * 请求封装
 * @param {Object} options 请求选项
 * @returns {Promise<*>} 请求响应
 */
export function request(options) {
	const {
		getToken
	} = useToken();

	return new Promise((resolve, reject) => {
		// 请求参数
		const requestOptions = {
			url: BASE_URL + options.url,
			method: options.method || 'GET',
			data: options.data,
			header: {
				'Content-Type': 'application/json',
				...options.header
			},
			success: (res) => {
				// 请求成功
				const {
					statusCode,
					data
				} = res;

				// 调试信息
				console.log(`请求 ${options.url} 响应:`, res);

				if (statusCode === 200) {
					// 业务逻辑正常
					resolve(data);
				} else if (statusCode === 401) {
					// 未认证或认证已过期
					uni.showToast({
						title: '登录已过期，请重新登录',
						icon: 'none'
					});

					setTimeout(() => {
						const {
							removeToken
						} = useToken();
						removeToken();
						uni.reLaunch({
							url: '/pages/login/login'
						});
					}, 1500);

					reject(new Error('未认证或认证已过期'));
				} else {
					// 其他错误
					uni.showToast({
						title: data.msg || `请求失败，状态码：${statusCode}`,
						icon: 'none'
					});

					reject(new Error(data.msg || `请求失败，状态码：${statusCode}`));
				}
			},
			fail: (err) => {
				// 请求失败
				console.error(`请求 ${options.url} 失败:`, err);

				uni.showToast({
					title: '网络异常，请稍后重试',
					icon: 'none'
				});

				reject(new Error('网络异常，请稍后重试'));
			}
		};

		// 添加认证token
		const token = getToken();
		if (token) {
			requestOptions.header.Authorization = `Bearer ${token}`;
			console.log('添加认证token:', token);
		}

		// 发送请求
		console.log(`发起请求:`, {
			url: requestOptions.url,
			method: requestOptions.method,
			data: requestOptions.data
		});

		uni.request(requestOptions);
	});
}

/**
 * GET请求
 * @param {string} url 请求地址
 * @param {Object} params 请求参数
 * @param {Object} options 额外选项
 * @returns {Promise<*>} 请求响应
 */
export function get(url, params = {}, options = {}) {
	return request({
		url,
		method: 'GET',
		data: params,
		...options
	});
}

/**
 * POST请求
 * @param {string} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 额外选项
 * @returns {Promise<*>} 请求响应
 */
export function post(url, data = {}, options = {}) {
	return request({
		url,
		method: 'POST',
		data,
		...options
	});
}

/**
 * PUT请求
 * @param {string} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 额外选项
 * @returns {Promise<*>} 请求响应
 */
export function put(url, data = {}, options = {}) {
	return request({
		url,
		method: 'PUT',
		data,
		...options
	});
}

/**
 * DELETE请求
 * @param {string} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 额外选项
 * @returns {Promise<*>} 请求响应
 */
export function del(url, data = {}, options = {}) {
	return request({
		url,
		method: 'DELETE',
		data,
		...options
	});
}