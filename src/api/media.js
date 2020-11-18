import request from '@/utils/request'

export function fetchTimesChannel() {
  return request({
    url: '/home/workflow/channel',
    method: 'get'
  })
}
