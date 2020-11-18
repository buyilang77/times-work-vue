import request from '@/utils/request'

export function image(data) {
  return request({
    url: '/upload/image',
    method: 'post',
    data
  })
}
export function file(data) {
  return request({
    url: '/upload/file',
    method: 'post',
    data
  })
}
