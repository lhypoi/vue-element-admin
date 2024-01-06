import request from '@/utils/request'

export default {
  getTeacherList(params) {
    return request({
      url: 'https://whale.api.ukshuxi.com/healthy/getTeacherList',
      method: 'post',
      data: params
    })
  },
  getAgentList(params) {
    return request({
      url: 'https://whale.api.ukshuxi.com/healthy/getAgentList',
      method: 'post',
      data: params
    })
  },
  getAllCourseList(params) {
    return request({
      url: 'https://whale.api.ukshuxi.com/healthy/getAllCourseList',
      method: 'post',
      data: params
    })
  },
  updateTeacher(params) {
    return request({
      url: 'https://whale.api.ukshuxi.com/healthy/updateTeacher',
      method: 'post',
      data: params
    })
  },
  deleteTeacher(params) {
    return request({
      url: 'https://whale.api.ukshuxi.com/healthy/deleteTeacher',
      method: 'post',
      data: params
    })
  },
  insertTeacher(params) {
    return request({
      url: 'https://whale.api.ukshuxi.com/healthy/insertTeacher',
      method: 'post',
      data: params
    })
  },
  deleteAgent(params) {
    return request({
      url: 'https://whale.api.ukshuxi.com/healthy/deleteAgent',
      method: 'post',
      data: params
    })
  },
  createCourse(params) {
    return request({
      url: 'https://whale.api.ukshuxi.com/healthy/createCourse',
      method: 'post',
      data: params
    })
  },
  selectCourseUserList(params) {
    return request({
      url: 'https://whale.api.ukshuxi.com/healthy/selectCourseUserList',
      method: 'post',
      data: params
    })
  },
  deleteByCourseIdAndPhone(params) {
    return request({
      url: 'https://whale.api.ukshuxi.com/healthy/deleteByCourseIdAndPhone',
      method: 'post',
      data: params
    })
  }
}
