import axios from "axios"
import { toast } from "react-toastify"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/auth"
    }

    if (error.response?.status === 429) {
      toast.error("Too many requests. Please try again later.")
    }

    return Promise.reject(error)
  },
)

// API endpoints
export const authAPI = {
  login: (credentials: { email: string; password: string }) => apiClient.post("/auth/login", credentials),

  register: (userData: { name: string; email: string; password: string; phone?: string }) =>
    apiClient.post("/auth/register", userData),

  logout: () => apiClient.post("/auth/logout"),

  getProfile: () => apiClient.get("/auth/me"),

  forgotPassword: (email: string) => apiClient.post("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) => apiClient.post("/auth/reset-password", { token, password }),
}

export const symptomAPI = {
  analyze: (data: {
    symptoms: string[]
    temperature?: { value: number; unit: "C" | "F" }
    emotions?: string[]
    additionalInfo?: string
    language?: string
  }) => apiClient.post("/symptoms/analyze", data),

  getHistory: (page = 1, limit = 10) => apiClient.get(`/symptoms/history?page=${page}&limit=${limit}`),

  getAnalysis: (sessionId: string) => apiClient.get(`/symptoms/analysis/${sessionId}`),

  submitFeedback: (
    sessionId: string,
    feedback: {
      helpful: boolean
      rating?: number
      comment?: string
      reportedIssues?: string[]
    },
  ) => apiClient.post(`/symptoms/feedback/${sessionId}`, feedback),

  processVoice: (data: { transcript: string; language?: string; confidence?: number }) =>
    apiClient.post("/symptoms/voice-process", data),
}

export const medicineAPI = {
  analyzeImage: (formData: FormData) =>
    apiClient.post("/medicines/analyze-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  analyzeText: (data: { medicineName: string; additionalInfo?: string; language?: string }) =>
    apiClient.post("/medicines/analyze-text", data),

  getHistory: (page = 1, limit = 10) => apiClient.get(`/medicines/history?page=${page}&limit=${limit}`),

  getAnalysis: (sessionId: string) => apiClient.get(`/medicines/analysis/${sessionId}`),

  submitFeedback: (
    sessionId: string,
    feedback: {
      accurate: boolean
      helpful: boolean
      rating?: number
      comment?: string
      corrections?: Array<{ field: string; correctValue: string; reason: string }>
    },
  ) => apiClient.post(`/medicines/feedback/${sessionId}`, feedback),

  search: (query: string, language = "en", limit = 20) =>
    apiClient.get(`/medicines/search?q=${encodeURIComponent(query)}&language=${language}&limit=${limit}`),

  getPopular: (limit = 10) => apiClient.get(`/medicines/popular?limit=${limit}`),
}

export const hospitalAPI = {
  getAll: (
    params: {
      page?: number
      limit?: number
      province?: string
      district?: string
      department?: string
      type?: string
      level?: string
      search?: string
      sortBy?: string
      sortOrder?: "asc" | "desc"
      latitude?: number
      longitude?: number
      radius?: number
    } = {},
  ) => {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })
    return apiClient.get(`/hospitals?${queryParams.toString()}`)
  },

  getById: (id: string) => apiClient.get(`/hospitals/${id}`),

  getProvinces: () => apiClient.get("/hospitals/provinces"),

  getDistricts: (province: string) => apiClient.get(`/hospitals/districts/${province}`),

  getDepartments: () => apiClient.get("/hospitals/departments"),

  addReview: (
    id: string,
    review: {
      rating: number
      comment?: string
      department?: string
      visitDate?: string
    },
  ) => apiClient.post(`/hospitals/${id}/review`, review),

  getEmergencyNumbers: (province?: string, district?: string) => {
    const params = new URLSearchParams()
    if (province) params.append("province", province)
    if (district) params.append("district", district)
    return apiClient.get(`/hospitals/emergency/numbers?${params.toString()}`)
  },

  getTopHospitals: (province: string, limit = 14) => apiClient.get(`/hospitals/top/${province}?limit=${limit}`),

  searchNearby: (data: {
    latitude: number
    longitude: number
    radius?: number
    department?: string
    type?: string
    level?: string
  }) => apiClient.post("/hospitals/search/nearby", data),
}

export const contactAPI = {
  submit: (data: {
    name: string
    email: string
    phone: string
    subject: string
    message: string
    category?: string
  }) => apiClient.post("/contact", data),

  getAll: (
    params: {
      page?: number
      limit?: number
      status?: string
      category?: string
      priority?: string
      search?: string
    } = {},
  ) => {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString())
      }
    })
    return apiClient.get(`/contact?${queryParams.toString()}`)
  },

  getStats: (days = 30) => apiClient.get(`/contact/stats?days=${days}`),

  respond: (id: string, message: string) => apiClient.put(`/contact/${id}/respond`, { message }),
}

export const analyticsAPI = {
  getDashboard: (days = 30) => apiClient.get(`/analytics/dashboard?days=${days}`),

  getHealthTrends: (startYear = 2020, endYear = new Date().getFullYear()) =>
    apiClient.get(`/analytics/health-trends?startYear=${startYear}&endYear=${endYear}`),

  getRealTime: () => apiClient.get("/analytics/real-time"),

  getUserEngagement: (days = 30) => apiClient.get(`/analytics/user-engagement?days=${days}`),

  trackEvent: (event: string, data?: any, userId?: string) =>
    apiClient.post("/analytics/track-event", { event, data, userId }),
}

export const uploadAPI = {
  uploadImage: (file: File, folder = "general") => {
    const formData = new FormData()
    formData.append("image", file)
    formData.append("folder", folder)
    return apiClient.post("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },

  uploadMultiple: (files: File[], folder = "general") => {
    const formData = new FormData()
    files.forEach((file) => formData.append("images", file))
    formData.append("folder", folder)
    return apiClient.post("/upload/multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },
}

export const userAPI = {
  getProfile: () => apiClient.get("/users/profile"),

  updateProfile: (data: {
    name?: string
    phone?: string
    address?: {
      province?: string
      district?: string
      municipality?: string
      ward?: string
      street?: string
    }
    preferences?: {
      language?: "en" | "ne" | "hi"
      notifications?: {
        email?: boolean
        sms?: boolean
        push?: boolean
      }
      theme?: "light" | "dark"
    }
    healthProfile?: {
      dateOfBirth?: string
      gender?: "male" | "female" | "other"
      bloodGroup?: string
      height?: number
      weight?: number
      allergies?: string[]
      chronicConditions?: string[]
      medications?: string[]
      emergencyContact?: {
        name?: string
        phone?: string
        relation?: string
      }
    }
  }) => apiClient.put("/users/profile", data),

  getActivity: (page = 1, limit = 20) => apiClient.get(`/users/activity?page=${page}&limit=${limit}`),

  deleteAccount: () => apiClient.delete("/users/account"),
}
