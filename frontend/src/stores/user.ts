import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi, type User } from '@/api/user'
import type { ScenicSpot } from '@/types/spot'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value)
  const favorites = computed(() => user.value?.favorites || [])

  async function devLogin(nickname?: string) {
    loading.value = true
    try {
      const response = await userApi.devLogin(nickname)
      token.value = response.token
      user.value = response.user
      localStorage.setItem('token', response.token)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchProfile() {
    if (!token.value) return
    loading.value = true
    try {
      user.value = await userApi.getProfile()
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      logout()
    } finally {
      loading.value = false
    }
  }

  async function addFavorite(spot: ScenicSpot) {
    if (!isLoggedIn.value) {
      throw new Error('请先登录')
    }
    await userApi.addFavorite(spot._id)
    if (user.value) {
      user.value.favorites = [...(user.value.favorites || []), spot]
    }
  }

  async function removeFavorite(spotId: string) {
    if (!isLoggedIn.value) {
      throw new Error('请先登录')
    }
    await userApi.removeFavorite(spotId)
    if (user.value) {
      user.value.favorites = user.value.favorites?.filter(s => s._id !== spotId) || []
    }
  }

  function isFavorite(spotId: string): boolean {
    return favorites.value.some(s => s._id === spotId)
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    loading,
    isLoggedIn,
    favorites,
    devLogin,
    fetchProfile,
    addFavorite,
    removeFavorite,
    isFavorite,
    logout
  }
})
