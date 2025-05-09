import request from "../utils/request";

// 新增或更新项目测试用例
export function addOrUpdateProjectTest(data) {
    return request.post('/project-test/addOrUpdate', data);
}

// 根据ID删除项目测试用例
export function deleteProjectTest(id) {
    return request.delete(`/project-test/delete/${id}`);
}

// 根据ID获取项目测试用例详情
export function getProjectTestInfo(id) {
    return request.get(`/project-test/info/${id}`);
}

// 根据项目ID获取所有测试用例
export function getProjectTestsByProjectId(projectId) {
    return request.get(`/project-test/getByProjectId/${projectId}`);
}

// 分页获取项目测试用例列表
export function getProjectTestPage(pageNum, pageSize, testName, testType) {
    return request.get('/project-test/page', {
        pageNum,
        pageSize,
        testName,
        testType
    });
}

// 获取所有项目测试用例
export function getAllProjectTests() {
    return request.get('/project-test/list');
}