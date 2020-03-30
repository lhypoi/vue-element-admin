import request from '@/utils/request'

export function orderManage(query) {
  return request({
    url: '/services/wine',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'orderManage',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}
