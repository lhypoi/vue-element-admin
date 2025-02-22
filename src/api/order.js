import request from '@/utils/request'

export function orderManage(query) {
  return request({
    url: '/wine',
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
    url: '/wine',
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
    url: '/wine',
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
    url: '/uploadWine',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: query
  })
}

export function getAllWineListByPage(query) {
  return request({
    url: '/wine',
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
    url: '/wine',
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
    url: '/wine',
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
    url: '/wine',
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
    url: '/wine',
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
    url: '/wine',
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
    url: '/wine',
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

export function getCodeList(query) {
  return request({
    url: '/code',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'getCodeList',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function insertCode(query) {
  return request({
    url: '/code',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'insertCode',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function checkCodeExist(query) {
  return request({
    url: '/code',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'checkCodeExist',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}
export function getCodeDetail(query) {
  return request({
    url: '/code',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'getCodeDetail',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}
export function updateCode(query) {
  return request({
    url: '/code',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'updateCode',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}
export function deleteCode(query) {
  return request({
    url: '/code',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'deleteCode',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function getExpressCompanyList(query) {
  return request({
    url: '/wine',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'getExpressCompanyList',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function getOrderRefundManage(query) {
  return request({
    url: '/wine',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'getOrderRefundManage',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}

export function auditOrderRefund(query) {
  return request({
    url: '/wine',
    method: 'post',
    data: {
      body: query,
      header: {
        serviceCode: 'auditOrderRefund',
        reqTime: (new Date()).toISOString()
      }
    }
  })
}
