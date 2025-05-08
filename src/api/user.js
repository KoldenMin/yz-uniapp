// src/api/user.js

import request from '../utils/request';

// 用户登录
export function login(data) {
    return request.post('/user/login', data);
}

// 用户注册
export function register(data) {
    return request.post('/user/register', data);
}

// 获取当前用户信息
export function getUserInfo() {
    return request.get('/user/info');
}

// 获取用户列表（管理员）
export function getUserList() {
    return request.get('/user/list');
}

// 用户登出
export function logout() {
    return request.post('/user/logout');
}

// 分页
export function getUserPage(pageNum, pageSize, username, realName) {
    return request.get('/user/page', {
        pageNum,
        pageSize,
        username,
        realName
    });
}

// 删除用户
export function deleteUser(id) {
    return request.delete(`/user/delete/${id}`);
}

// 更新用户
export function updateUser(id, updateDTO) {
    return request.put('/user/update/' + id, updateDTO);
}

// 设为管理员
export function setAdmin(id) {
    return request.put('/user/setAsAdmin/' + id);
}

// 获取用户盐
export function getUserSalt(username) {
    return request.get('/user/salt', {
        username
    });
}

// 更新头像
export function updateUserAvatar(formData) {
    return request.post('/user/update-avatar', formData, {
        header: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

// 上传简历
export function uploadResume(formData) {
    return request.post('/user/upload-resume', formData, {
        header: {
            'Content-Type': 'multipart/form-data'
        }
    });
}