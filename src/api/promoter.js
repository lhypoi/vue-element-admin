import request from '@/utils/request'

export function getPromoterList(query) {
  return request({
    url: '/promoter',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'getPromoterByPage',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function getPromoterOrder(query) {
  return request({
    url: '/promoter',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'getPromoterOrderManage',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function updatePromoter(query) {
  return request({
    url: '/promoter',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'updatePromoter',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function insertPromoter(query) {
  return request({
    url: '/promoter',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'insertPromoter',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function getPromoterTotal(query) {
  return request({
    url: '/promoter',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'getPromoterTotal',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function insertWithdrawalOrder(query) {
  return request({
    url: '/promoter',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'insertWithdrawalOrder',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function getWithdrawalOrderByPage(query) {
  return request({
    url: '/promoter',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'getWithdrawalOrderByPage',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function updateWithdrawalOrder(query) {
  return request({
    url: '/promoter',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'updateWithdrawalOrder',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function getPromoterWithdrawal(query) {
  return request({
    url: '/promoter',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'getPromoterWithdrawal',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}
