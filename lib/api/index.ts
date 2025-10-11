// lib/api.ts
import axios from "axios";

// Laravel Backend URL for authentication and services
// const LARAVEL_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://backendcv.onlinetoolpot.com/api"
const LARAVEL_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://stagingbackend.resumaic.com/api"

// Node.js Backend URL for app/api routes 
const NODEJS_API_BASE_URL = process.env.NEXT_PUBLIC_NODEJS_API_URL || "https://backendserver.resumaic.com"
// const NODEJS_API_BASE_URL = process.env.NEXT_PUBLIC_NODEJS_API_URL || "https://stagingbackendserver.resumaic.com"

// Laravel API client for authentication and services 
export const api = axios.create({
  baseURL: LARAVEL_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
})

// Node.js API client for app/api routes
export const nodeApi = axios.create({
  baseURL: NODEJS_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 120000, // 2 minutes for AI operations
})

// Laravel API interceptors for authentication and services
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token")
      if (token) config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }
    return Promise.reject(error)
  },
)

// Node.js API interceptors
nodeApi.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token")
      if (token) config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

nodeApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }
    return Promise.reject(error)
  },
)