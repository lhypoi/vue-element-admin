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

export function getAllWineListByPage(query) {
  return request({
    url: '/services/wine',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'getAllWineListByPage',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function getWineDetail(query) {
  return request({
    url: '/services/wine',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'getWineDetail',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function updateWine(query) {
  return request({
    url: '/services/wine',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'updateWine',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function getCouponByPage(query) {
  return request({
    url: '/services/wine',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'getCouponByPage',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function insertCoupon(query) {
  return request({
    url: '/services/wine',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'insertCoupon',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function getCouponDetail(query) {
  return request({
    url: '/services/wine',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'getCouponDetail',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function updateCoupon(query) {
  return request({
    url: '/services/wine',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'updateCoupon',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}
