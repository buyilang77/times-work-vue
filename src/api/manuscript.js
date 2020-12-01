import request from '@/utils/request'
import qs from 'qs'

export function fetchList(params) {
  return request({
    url: '/manuscripts',
    method: 'get',
    params: {
      filter: params.filter,
      page: params.page,
      limit: params.limit
    },
    paramsSerializer: params => {
      return qs.stringify(params, { indices: true })
    }
  })
}

export function fetchMedia(params) {
  return request({
    url: '/media',
    method: 'get',
    params
  })
}

export function createManuscript(data) {
  return request({
    url: '/manuscripts',
    method: 'post',
    data
  })
}

export function updateManuscript(id, data) {
  return request({
    url: '/manuscripts/' + id,
    method: 'put',
    data
  })
}

export function updateManuscriptStatus(id, data) {
  return request({
    url: '/manuscripts-workflow/' + id,
    method: 'patch',
    data
  })
}

export function fetchArticle(params) {
  return request({
    url: '/articles',
    method: 'get',
    params
  })
}

export function fetchManuscript(id) {
  return request({
    url: '/manuscripts/' + id,
    method: 'get'
  })
}

export function handleDestroy(id) {
  return request({
    url: '/manuscripts/' + id,
    method: 'delete'
  })
}

export function downloadImage(data) {
  return request({
    url: '/download/image',
    method: 'post',
    data
  })
}

export function uploadFile(data) {
  return request({
    url: '/upload/file',
    method: 'post',
    data
  })
}

export function reviewStatus(id, data) {
  return request({
    url: '/manuscripts-workflow/reviews/' + id,
    method: 'patch',
    data
  })
}

export function cancellation(id) {
  return request({
    url: '/manuscripts-workflow/cancellation/' + id,
    method: 'patch'
  })
}

export function fetchChannelList(params) {
  return request({
    url: '/manuscripts-workflow/reviews/channels',
    method: 'get',
    params
  })
}
