import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { message } from 'antd'
import type { ApiError } from '../types'

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5222/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// İstek interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Yanıt interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          message.error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.')
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          message.error('Bu işlem için yetkiniz yok.')
          break
        case 404:
          message.error('Kaynak bulunamadı.')
          break
        case 422:
          if (data.errors) {
            Object.values(data.errors).forEach(msgs => {
              msgs.forEach(msg => message.error(msg))
            })
          } else {
            message.error(data.message || 'Doğrulama hatası.')
          }
          break
        case 500:
          message.error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.')
          break
        default:
          message.error(data?.message || 'Bir hata oluştu.')
      }
    } else if (error.request) {
      message.error('Sunucuya ulaşılamıyor. İnternet bağlantınızı kontrol edin.')
    } else {
      message.error('Bir hata oluştu.')
    }

    return Promise.reject(error)
  }
)

export default api