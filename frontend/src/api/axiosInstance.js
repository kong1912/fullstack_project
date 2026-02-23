// Fn 6.4 — Axios Interceptors with Retry Logic & Error Rollback
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const MAX_RETRIES = 3

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true, // Fn 5.3 — send HttpOnly cookies
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach token if available (fallback for non-cookie auth)
axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

// Response interceptor — Retry Logic (Fn 6.4)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config

    // Don't retry on 4xx client errors
    if (error.response?.status >= 400 && error.response?.status < 500) {
      return Promise.reject(error)
    }

    config._retryCount = config._retryCount || 0

    if (config._retryCount < MAX_RETRIES) {
      config._retryCount += 1
      const delay = Math.pow(2, config._retryCount) * 300 // exponential back-off
      await new Promise((res) => setTimeout(res, delay))
      return axiosInstance(config)
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
