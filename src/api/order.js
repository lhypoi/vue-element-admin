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

export function updateSendState(query) {
  return request({
    url: '/services/wine',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'updateSendState',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function getAreaList(query) {
  return request({
    url: '/services/wine',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'getAreaList',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function uploadWine(query) {
  return request({
    url: '/services/uploadWine',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: query
  })
}

