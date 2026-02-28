import api from './index'
import type { ScenicSpot } from '@/types/spot'

export interface SpotListResponse {
  data: ScenicSpot[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ProvinceResponse {
  province: string
  count: number
}

export const spotApi = {
  getList(params?: { province?: string; city?: string; category?: string; page?: number; limit?: number }) {
    return api.get<SpotListResponse>('/spots', { params })
  },

  getById(id: string) {
    return api.get<ScenicSpot>(`/spots/${id}`)
  },

  getProvinces() {
    return api.get<ProvinceResponse[]>('/spots/provinces')
  },

  search(keyword: string) {
    return api.get<ScenicSpot[]>(`/spots/search/${encodeURIComponent(keyword)}`)
  }
}
