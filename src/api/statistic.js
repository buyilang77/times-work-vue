import request from '@/utils/request'

export function fetchStatistic() {
  return request({
    url: '/statistics',
    method: 'get'
  })
}
