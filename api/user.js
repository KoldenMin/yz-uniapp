import {
	get,
	post
} from '@/utils/request';

/**
 * 用户注册
 * @param {Object} data 注册数据
 * @returns {Promise<*>} 注册结果
 */
export function register(data) {
	return post('/user/register', data);
}

/**
 * 用户登录
 * @param {Object} data 登录数据
 * @returns {Promise<*>} 登录结果
 */
export function login(data) {
	return post('/user/login', data);
}

/**
 * 获取当前用户信息
 * @returns {Promise<*>} 用户信息
 */
export function getUserInfo() {
	return get('/user/info');
}

/**
 * 获取所有用户列表（管理员功能）
 * @returns {Promise<*>} 用户列表
 */
export function listAllUsers() {
	return get('/user/list');
}