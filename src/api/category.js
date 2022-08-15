import request from '@/utils/request'

export function getCategoryList(query) {
  return request({
    url: '/wine',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'getCategoryList',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function insertCategory(query) {
  return request({
    url: '/wine',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'insertCategory',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function updateCategory(query) {
  return request({
    url: '/wine',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'updateCategory',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function deleteCategory(query) {
  return request({
    url: '/wine',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'deleteCategory',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}
