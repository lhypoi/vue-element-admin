import request from '@/utils/request'

export function getOrderByPage(query) {
  return request({
    url: '/data/getOrderByPage',
    method: 'get',
    params: query
  })
}

export function getWineList(query) {
  return request({
    url: '/data/getWineList',
    method: 'get',
    params: query
  })
}

export function getTicketLogByPage(query) {
  return request({
    url: '/data/getTicketLogByPage',
    method: 'get',
    params: query
  })
}

