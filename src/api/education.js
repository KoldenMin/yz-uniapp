import request from "../utils/request";

// 获取教育背景列表
export function getEducationList() {
    return request.get('/education/list')
}

// 添加教育背景
export function addEducation(data) {
    return request.post('/education/add', data)
}

// 根据id删除教育背景
export function delEducationById(id) {
    return request.delete(`/education/delete/${id}`)
}

// 根据用户id删除教育背景
export function delEducationByUserId(userId) {
    return request.delete(`/education/delete/user/${userId}`)
}