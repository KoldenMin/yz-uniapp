import request from "../utils/request";

// 新增或更新项目
export function addOrUpdateProject(data) {
    return request.post('/project/addOrUpdate', data);
}

// 根据ID获取项目信息
export function getProjectInfo(id) {
    return request.get(`/project/info/${id}`);
}

// 删除项目
export function deleteProject(id) {
    return request.delete(`/project/delete/${id}`);
}

// 分页查询项目列表
export function getProjectPage(pageNum, pageSize, name, description) {
    return request.get('/project/page', {
        pageNum,
        pageSize,
        name,
        description
    });
}

// 获取项目及其参与人员
export function getProjectWithUsers(projectId) {
    return request.get(`/project/userList/${projectId}`);
}

// 获取所有项目信息
export function getProjectList() {
    return request.get('/project/list');
}

// 更新项目参与人数
export function updateProjectParticipantCount() {
    return request.post('/project/updateCount');
}