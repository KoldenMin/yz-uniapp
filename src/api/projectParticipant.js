import request from "../utils/request";

// 分页查询项目参与人员
export function getProjectParticipantPage(pageNum, pageSize, moduleName, requirement) {
    return request.get('/project-participant/page', {
        pageNum,
        pageSize,
        moduleName,
        requirement
    });
}

// 根据项目ID查询参与人员
export function getProjectParticipantByProjectId(projectId) {
    return request.get(`/project-participant/selectByProjectId/${projectId}`);
}

// 根据ID查询单条项目参与信息
export function getProjectParticipantInfo(id) {
    return request.get(`/project-participant/info/${id}`);
}

// 新增或更新项目参与信息
export function saveOrUpdateProjectParticipant(data) {
    return request.post('/project-participant/addOrUpdate', data);
}

// 删除项目参与信息
export function deleteProjectParticipant(id) {
    return request.delete(`/project-participant/delete/${id}`);
}

// 上传图片
export function uploadAvatar(projectParticipantId, file) {
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('projectParticipantId', projectParticipantId);

    return request.post('/project-participant/avatar', formData, {
        header: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

// 上传附件
export function uploadResume(projectParticipantId, file) {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('projectParticipantId', projectParticipantId);

    return request.post('/project-participant/upload', formData, {
        header: {
            'Content-Type': 'multipart/form-data'
        }
    });
}