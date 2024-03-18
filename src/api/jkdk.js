import request from '@/utils/request'

export default {
  getTeacherList(params) {
    return request({
      url: process.env.VUE_APP_BASE_API2 + '/healthy/getTeacherList',
      method: 'post',
      data: params
    })
  },
  getAgentList(params) {
    return request({
      url: process.env.VUE_APP_BASE_API2 + '/healthy/getAgentList',
      method: 'post',
      data: params
    })
  },
  getAllCourseList(params) {
    return request({
      url: process.env.VUE_APP_BASE_API2 + '/healthy/getAllCourseList',
      method: 'post',
      data: params
    })
  },
  updateTeacher(params) {
    return request({
      url: process.env.VUE_APP_BASE_API2 + '/healthy/updateTeacher',
      method: 'post',
      data: params
    })
  },
  deleteTeacher(params) {
    return request({
      url: process.env.VUE_APP_BASE_API2 + '/healthy/deleteTeacher',
      method: 'post',
      data: params
    })
  },
  insertTeacher(params) {
    return request({
      url: process.env.VUE_APP_BASE_API2 + '/healthy/insertTeacher',
      method: 'post',
      data: params
    })
  },
  deleteAgent(params) {
    return request({
      url: process.env.VUE_APP_BASE_API2 + '/healthy/deleteAgent',
      method: 'post',
      data: params
    })
  },
  insertCourse(params) {
    return request({
      url: process.env.VUE_APP_BASE_API2 + '/healthy/insertCourse',
      method: 'post',
      data: params
    })
  },
  selectCourseUserList(params) {
    return request({
      url: process.env.VUE_APP_BASE_API2 + '/healthy/selectCourseUserList',
      method: 'post',
      data: params
    })
  },
  deleteByCourseIdAndPhone(params) {
    return request({
      url: process.env.VUE_APP_BASE_API2 + '/healthy/deleteByCourseIdAndPhone',
      method: 'post',
      data: params
    })
  },
  deleteCourse(params) {
    return request({
      url: process.env.VUE_APP_BASE_API2 + '/healthy/deleteCourse',
      method: 'post',
      data: params
    })
  },
  exportCourseRecordList(params) {
    return request({
      url: process.env.VUE_APP_BASE_API2 + '/healthy/exportCourseRecordList',
      method: 'post',
      data: params,
      responseType: 'blob'
    })
  },
  exportCourseRecordListByDate(params) {
    return request({
      url: process.env.VUE_APP_BASE_API2 + '/healthy/exportCourseRecordListByDate',
      method: 'post',
      data: params,
      responseType: 'blob'
    })
  },
  exportUnRecordUserList(params) {
    return request({
      url: process.env.VUE_APP_BASE_API2 + '/healthy/exportUnRecordUserList',
      method: 'post',
      data: params,
      responseType: 'blob'
    })
  },
  selectUserCourseRecordList(params) {
    return request({
      url: process.env.VUE_APP_BASE_API2 + '/healthy/selectUserCourseRecordList',
      method: 'post',
      data: params
    })
  },
  updateCourse(params) {
    return request({
      url: process.env.VUE_APP_BASE_API2 + '/healthy/updateCourse',
      method: 'post',
      data: params
    })
  },
  getQrCode(params) {
    return request({
      url: process.env.VUE_APP_BASE_API2 + '/healthy/getQrCode',
      method: 'get',
      params: params,
      responseType: 'blob'
    })
  }
}
