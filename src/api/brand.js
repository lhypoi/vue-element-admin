import request from '@/utils/request'

export function getBrandInfoList(query) {
  return request({
    url: '/wine',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'getBrandInfoList',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function deleteBrandInfo(query) {
  return request({
    url: '/wine',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'deleteBrandInfo',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function insertGlobalMessage(query) {
  return request({
    url: '/wine',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'insertGlobalMessage',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function updateGlobalMessage(query) {
  return request({
    url: '/wine',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'updateGlobalMessage',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function getGlobalMessageList(query) {
  return request({
    url: '/wine',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'getGlobalMessageList',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function deleteGlobalMessage(query) {
  return request({
    url: '/wine',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'deleteGlobalMessage',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function uploadBrandInfo(query) {
  console.log(query)
  return request({
    url: '/uploadBrandInfo',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: query
  })
}
