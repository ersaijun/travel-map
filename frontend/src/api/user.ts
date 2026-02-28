import api from './index'
import type { ScenicSpot } from '@/types/spot'

export interface User {
  id: string
  nickname: string
  avatar: string
  favorites?: ScenicSpot[]
}

export interface LoginResponse {
  token: string
  user: User
}

export const userApi = {
  devLogin(nickname?: string) {
    return api.post<LoginResponse>('/auth/dev-login', { nickname })
  },

  getProfile() {
    return api.get<User & { favorites: ScenicSpot[] }>('/user/profile')
  },

  addFavorite(spotId: string) {
    return api.post('/user/favorites', { spotId })
  },

  removeFavorite(spotId: string) {
    return api.delete(`/user/favorites/${spotId}`)
  }
}
