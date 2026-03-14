import axiosInstance from './axiosInstance'

export const fetchGuides      = (params = {}) => axiosInstance.get('/guides', { params })
export const fetchGuide       = (id)          => axiosInstance.get(`/guides/${id}`)
export const createGuide      = (data)        => axiosInstance.post('/guides', data)
export const updateGuide      = (id, data)    => axiosInstance.put(`/guides/${id}`, data)
export const deleteGuide      = (id)          => axiosInstance.delete(`/guides/${id}`)
export const voteGuide        = (id, vote)    => axiosInstance.post(`/guides/${id}/vote`, { vote })

export const fetchComments    = (params = {}) => axiosInstance.get('/comments', { params })
export const createComment    = (data)        => axiosInstance.post('/comments', data)
export const deleteComment    = (id)          => axiosInstance.delete(`/comments/${id}`)
export const voteComment      = (id, vote)    => axiosInstance.post(`/comments/${id}/vote`, { vote })
