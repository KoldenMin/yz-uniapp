// src/api/department.js
import request from "../utils/request";

/**
 * 获取部门列表
 */
export function getDepartmentList() {
    return request.get('/department/list');
}

/**
 * 获取部门分页数据
 * @param {number} pageNum - 当前页码
 * @param {number} pageSize - 每页数量
 * @param {string} name - 部门名称(可选)
 * @param {string} depaFunction - 部门职能(可选)
 */
export function getDepartmentPage(pageNum, pageSize, name, depaFunction) {
    return request.get('/department/page', {
        pageNum,
        pageSize,
        name,
        depaFunction
    });
}

/**
 * 获取部门详情
 * @param {number} id - 部门ID
 */
export function getDepartmentInfo(id) {
    return request.get(`/department/info/${id}`);
}

/**
 * 添加部门
 * @param {Object} data - 部门数据
 */
export function addDepartment(data) {
    return request.post('/department/add', data);
}

/**
 * 更新部门
 * @param {number} id - 部门ID
 * @param {Object} data - 更新的部门数据
 */
export function updateDepartment(id, data) {
    return request.put(`/department/update/${id}`, data);
}

/**
 * 删除部门
 * @param {number} id - 部门ID
 */
export function deleteDepartment(id) {
    return request.delete(`/department/delete/${id}`);
}

/**
 * 获取部门成员列表
 * @param {number} departmentId - 部门ID
 */
export function getDepartmentEmployees(departmentId) {
    return request.get(`/department/employeeList/${departmentId}`);
}