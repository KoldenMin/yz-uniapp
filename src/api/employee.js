// src/api/employee.js

import request from '../utils/request';

// 分页查询员工
export function getEmployeePage(pageNum, pageSize, name, phone) {
    return request.get('/employee/page', {
        pageNum,
        pageSize,
        name,
        phone
    });
}

// 根据ID获取员工详情
export function getEmployeeById(id) {
    return request.get(`/employee/info/${id}`);
}

// 获取所有员工列表
export function getEmployeeList() {
    return request.get('/employee/list');
}

// 根据用户ID获取员工信息
export function getEmployeeByUserId(userId) {
    return request.get(`/employee/info/user/${userId}`);
}

// 新增或修改员工
export function addOrUpdateEmployee(data) {
    return request.post('/employee/addOrUpdate', data);
}

// 删除员工
export function deleteEmployee(id) {
    return request.delete(`/employee/delete/${id}`);
}

// 上传员工头像
export function uploadAvatar(employeeId, file) {
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('employeeId', employeeId);

    return request.post('/employee/update-avatar', formData, {
        header: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

// 上传员工简历
export function uploadResume(employeeId, file) {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('employeeId', employeeId);

    return request.post('/employee/upload-resume', formData, {
        header: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

// 更新员工角色
export function updateEmployeeRole() {
    return request.post('/employee/updateRole');
}