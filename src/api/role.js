import request from '@/utils/request'

export function fetchRoles() {
  return request({
    url: '/roles',
    method: 'get'
  })
}
