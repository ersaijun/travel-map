import api from './index'
import type { ScenicSpot } from '@/types/spot'

export interface PlanSpot {
  spotId: string | ScenicSpot
  day: number
  order: number
  notes: string
}

export interface TravelPlan {
  _id: string
  userId: string
  title: string
  startDate: string
  endDate: string
  spots: PlanSpot[]
  createdAt: string
  updatedAt: string
}

export const planApi = {
  getList() {
    return api.get<TravelPlan[]>('/plans')
  },

  getById(id: string) {
    return api.get<TravelPlan>(`/plans/${id}`)
  },

  create(data: { title: string; startDate: string; endDate: string; spots: { spotId: string; day: number; order: number; notes?: string }[] }) {
    return api.post<TravelPlan>('/plans', data)
  },

  update(id: string, data: Partial<{ title: string; startDate: string; endDate: string; spots: { spotId: string; day: number; order: number; notes?: string }[] }>) {
    return api.put<TravelPlan>(`/plans/${id}`, data)
  },

  delete(id: string) {
    return api.delete(`/plans/${id}`)
  }
}
