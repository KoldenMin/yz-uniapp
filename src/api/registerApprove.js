import request from "../utils/request";

// 获取注册审核列表
export function getApprovalPage(pageNum, pageSize, realName, status) {
    const params = {
        pageNum,
        pageSize,
        realName: realName || undefined,
        status: status !== undefined && status !== null ? status : undefined
    };

    return request.get('/registration-approval/page', params);
}

// 添加或更新注册审核记录
export function addOrUpdateApproval(data) {
    return request.post('/registration-approval/addOrUpdate', data);
}

// 删除已通过审核的记录
export function deleteApprovalRecords() {
    return request.delete('/registration-approval/delete');
}

// 根据id获取审核详情
export function getApprovalById(id) {
    return request.get(`/registration-approval/${id}`);
}

// 批量审核
export function batchApproval(ids, data) {
    const batchData = {
        ids,
        ...data
    };

    return request.post('/registration-approval/batchApprove', batchData);
}

// 统计功能
export function statisticsApproval() {
    return request.get('/registration-approval/statistics');
}

// 获取所有部门列表
export function getAllDepartments() {
    return request.get('/registration-approval/getAllDepartment');
}