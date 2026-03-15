import axiosInstance from './axiosInstance'

// Use the search endpoint which supports tags + pagination. Keep params compatible.
export const fetchGuides      = (params = {}) => axiosInstance.get('/guides/search', { params })
export const fetchGuide       = (id)          => axiosInstance.get(`/guides/${id}`)
export const createGuide      = (data)        => axiosInstance.post('/guides', data)
export const updateGuide      = (id, data)    => axiosInstance.put(`/guides/${id}`, data)
export const deleteGuide      = (id)          => axiosInstance.delete(`/guides/${id}`)
export const voteGuide        = (id, vote)    => axiosInstance.post(`/guides/${id}/vote`, { vote })
export const uploadGuideImages = (id, files) => {
  const form = new FormData()
  files.forEach(f => form.append('images', f))
  return axiosInstance.post(`/guides/${id}/images`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// Upload a single file with real XHR progress (used by ImageUploadQueue)
export const uploadSingleImage = (guideId, file, onProgress) => {
  const form = new FormData()
  form.append('images', file)
  return axiosInstance.post(`/guides/${guideId}/images`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100))
    },
  })
}

export const fetchComments    = (params = {}) => axiosInstance.get('/comments', { params })
export const createComment    = (data)        => axiosInstance.post('/comments', data)
export const deleteComment    = (id)          => axiosInstance.delete(`/comments/${id}`)
export const voteComment      = (id, vote)    => axiosInstance.post(`/comments/${id}/vote`, { vote })
