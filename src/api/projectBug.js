import request from "../utils/request";

// 新增或更新bug
export function addOrUpdateProjectBug(data) {
    return request.post('/project-bug/addOrUpdate', data);
}

// 删除bug
export function deleteProjectBug(id) {
    return request.delete(`/project-bug/delete/${id}`);
}

// 获取bug详情
export function getProjectBugInfo(id) {
    return request.get(`/project-bug/info/${id}`);
}

// 根据项目ID获取bug列表
export function getProjectBugsByProjectId(projectId) {
    return request.get(`/project-bug/getByProjectId/${projectId}`);
}

// 分页获取bug列表
export function getProjectBugPage(pageNum, pageSize, title, bugType) {
    return request.get('/project-bug/page', {
        pageNum,
        pageSize,
        title,
        bugType
    });
}

// 获取所有bug列表
export function getAllProjectBugs() {
    return request.get('/project-bug/list');
}