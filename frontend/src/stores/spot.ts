import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { spotApi, type ProvinceResponse } from '@/api/spot'
import type { ScenicSpot } from '@/types/spot'

export const useSpotStore = defineStore('spot', () => {
  const spots = ref<ScenicSpot[]>([])
  const provinces = ref<ProvinceResponse[]>([])
  const currentSpot = ref<ScenicSpot | null>(null)
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const limit = ref(500)

  const selectedProvince = ref<string>('')
  const selectedCategory = ref<string>('')
  const searchKeyword = ref<string>('')

  const filteredSpots = computed(() => {
    let result = spots.value
    if (selectedProvince.value) {
      result = result.filter(s => s.province === selectedProvince.value)
    }
    if (selectedCategory.value) {
      result = result.filter(s => s.category === selectedCategory.value)
    }
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      result = result.filter(s => 
        s.name.toLowerCase().includes(keyword) ||
        s.city.toLowerCase().includes(keyword)
      )
    }
    return result
  })

  async function fetchSpots() {
    loading.value = true
    try {
      const response = await spotApi.getList({ page: page.value, limit: limit.value })
      spots.value = response.data
      total.value = response.pagination.total
    } catch (error) {
      console.error('Failed to fetch spots:', error)
    } finally {
      loading.value = false
    }
  }

  async function fetchProvinces() {
    try {
      provinces.value = await spotApi.getProvinces()
    } catch (error) {
      console.error('Failed to fetch provinces:', error)
    }
  }

  async function fetchSpotById(id: string) {
    loading.value = true
    try {
      currentSpot.value = await spotApi.getById(id)
    } catch (error) {
      console.error('Failed to fetch spot:', error)
    } finally {
      loading.value = false
    }
  }

  async function searchSpots(keyword: string) {
    loading.value = true
    try {
      const results = await spotApi.search(keyword)
      spots.value = results
    } catch (error) {
      console.error('Failed to search spots:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    spots,
    provinces,
    currentSpot,
    loading,
    total,
    page,
    limit,
    selectedProvince,
    selectedCategory,
    searchKeyword,
    filteredSpots,
    fetchSpots,
    fetchProvinces,
    fetchSpotById,
    searchSpots
  }
})
