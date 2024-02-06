import request from '@/utils/request'

export default {
  getTeacherList(params) {
    return request({
      url: '/healthy/getTeacherList',
      method: 'post',
      data: params
    })
  },
  getAgentList(params) {
    return request({
      url: '/healthy/getAgentList',
      method: 'post',
      data: params
    })
  },
  getAllCourseList(params) {
    return request({
      url: '/healthy/getAllCourseList',
      method: 'post',
      data: params
    })
  },
  updateTeacher(params) {
    return request({
      url: '/healthy/updateTeacher',
      method: 'post',
      data: params
    })
  },
  deleteTeacher(params) {
    return request({
      url: '/healthy/deleteTeacher',
      method: 'post',
      data: params
    })
  },
  insertTeacher(params) {
    return request({
      url: '/healthy/insertTeacher',
      method: 'post',
      data: params
    })
  },
  deleteAgent(params) {
    return request({
      url: '/healthy/deleteAgent',
      method: 'post',
      data: params
    })
  },
  insertCourse(params) {
    return request({
      url: '/healthy/insertCourse',
      method: 'post',
      data: params
    })
  },
  selectCourseUserList(params) {
    return request({
      url: '/healthy/selectCourseUserList',
      method: 'post',
      data: params
    })
  },
  deleteByCourseIdAndPhone(params) {
    return request({
      url: '/healthy/deleteByCourseIdAndPhone',
      method: 'post',
      data: params
    })
  },
  deleteCourse(params) {
    return request({
      url: '/healthy/deleteCourse',
      method: 'post',
      data: params
    })
  },
  exportCourseRecordList(params) {
    return request({
      url: '/healthy/exportCourseRecordList',
      method: 'post',
      data: params,
      responseType: 'blob'
    })
  },
  exportCourseRecordListByDate(params) {
    return request({
      url: '/healthy/exportCourseRecordListByDate',
      method: 'post',
      data: params,
      responseType: 'blob'
    })
  },
  exportUnRecordUserList(params) {
    return request({
      url: '/healthy/exportUnRecordUserList',
      method: 'post',
      data: params,
      responseType: 'blob'
    })
  },
  selectUserCourseRecordList(params) {
    return request({
      url: '/healthy/selectUserCourseRecordList',
      method: 'post',
      data: params
    })
  }
}
