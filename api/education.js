import {
	get,
	post
} from '@/utils/request';

/**
 * 添加教育背景
 * @param {Object} data 教育背景数据
 * @returns {Promise<*>} 添加结果
 */
export function addEducation(data) {
	return post('/education/add', data);
}

/**
 * 获取当前用户教育背景列表
 * @returns {Promise<*>} 教育背景列表
 */
export function listEducation() {
	return get('/education/list');
}