<template>
  <div class="home-page">
    <div class="filter-panel">
      <div class="filter-header">
        <h3>筛选景区</h3>
        <a-button v-if="hasFilter" type="link" size="small" @click="clearAllFilters">
          清除筛选
        </a-button>
      </div>
      
      <div class="filter-section">
        <div class="filter-title">
          <SearchOutlined />
          <span>搜索景区</span>
        </div>
        <a-input
          v-model:value="searchKeyword"
          placeholder="输入景区名称或城市"
          allow-clear
        />
      </div>

      <div class="filter-section">
        <div class="filter-title">
          <EnvironmentOutlined />
          <span>省份筛选</span>
          <span v-if="selectedProvinces.length > 0" class="selected-count">
            已选 {{ selectedProvinces.length }} 个
          </span>
        </div>
        <a-select
          v-model:value="selectedProvinces"
          mode="multiple"
          placeholder="选择省份（可多选）"
          style="width: 100%"
          :max-tag-count="2"
          :options="provinceOptions"
          allow-clear
          show-search
          :filter-option="filterProvince"
          :get-popup-container="(trigger: any) => trigger.parentNode"
        />
      </div>

      <div class="filter-section">
        <div class="filter-title">
          <TagOutlined />
          <span>景区类型</span>
        </div>
        <a-radio-group v-model:value="selectedCategory" class="category-list">
          <a-radio-button value="">全部</a-radio-button>
          <a-radio-button value="自然风光">自然风光</a-radio-button>
          <a-radio-button value="历史古迹">历史古迹</a-radio-button>
          <a-radio-button value="主题公园">主题公园</a-radio-button>
          <a-radio-button value="其他">其他</a-radio-button>
        </a-radio-group>
      </div>

      <div class="filter-footer">
        <a-statistic title="已选景区" :value="filteredSpots.length" :suffix="`/ ${spotStore.total}`" />
      </div>
      
      <div class="data-source">
        <div class="data-source-title">数据来源</div>
        <ul class="data-source-list">
          <li>数据源自中华人民共和国文化和旅游部</li>
          <li>更新频率：每年</li>
          <li>最近更新：2025-02-13</li>
        </ul>
      </div>
    </div>

    <div class="map-container" ref="mapContainer">
      <div v-if="spotStore.loading" class="map-loading">
        <a-spin size="large" tip="加载中..." />
      </div>
    </div>

    <a-modal
      v-model:open="showSpotModal"
      :title="selectedSpot?.name"
      :footer="null"
      width="400px"
    >
      <div v-if="selectedSpot" class="spot-modal-content">
        <div class="spot-info">
          <p><EnvironmentOutlined /> {{ selectedSpot.province }} {{ selectedSpot.city }}</p>
          <p><StarOutlined /> 评分：{{ selectedSpot.rating || '暂无' }}</p>
          <p><ClockCircleOutlined /> {{ selectedSpot.openTime || '暂无开放时间' }}</p>
          <p><DollarOutlined /> {{ selectedSpot.ticketInfo?.description || '暂无门票信息' }}</p>
        </div>
        <div class="spot-actions">
          <a-button type="primary" @click="goToDetail(selectedSpot._id)">
            查看详情
          </a-button>
          <a-button
            :type="isFavorite(selectedSpot._id) ? 'default' : 'primary'"
            :ghost="!isFavorite(selectedSpot._id)"
            @click="toggleFavorite(selectedSpot)"
          >
            {{ isFavorite(selectedSpot._id) ? '取消收藏' : '收藏' }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  SearchOutlined,
  EnvironmentOutlined,
  TagOutlined,
  StarOutlined,
  ClockCircleOutlined,
  DollarOutlined
} from '@ant-design/icons-vue'
import { useSpotStore } from '@/stores/spot'
import { useUserStore } from '@/stores/user'
import type { ScenicSpot } from '@/types/spot'

declare const AMap: any

const router = useRouter()
const spotStore = useSpotStore()
const userStore = useUserStore()

const mapContainer = ref<HTMLElement | null>(null)
const searchKeyword = ref('')
const selectedProvinces = ref<string[]>([])
const selectedCategory = ref('')
const showSpotModal = ref(false)
const selectedSpot = ref<ScenicSpot | null>(null)

let map: any = null
let markers: any[] = []
let markerCluster: any = null

/**
 * 景区分类映射函数
 * 将数据库中的具体分类描述映射到通用分类
 */
function mapCategory(category: string): string {
  if (!category) return '其他'
  
  const categoryMap: Record<string, string> = {
    // 自然风光类
    '峡谷风光': '自然风光',
    '世界自然遗产': '自然风光',
    '海南第一山水': '自然风光',
    '中国马尔代夫': '自然风光',
    '山水风光': '自然风光',
    '湖泊风光': '自然风光',
    '山岳风光': '自然风光',
    '海滨风光': '自然风光',
    '森林风光': '自然风光',
    '草原风光': '自然风光',
    '沙漠风光': '自然风光',
    '湿地风光': '自然风光',
    '溶洞风光': '自然风光',
    '瀑布风光': '自然风光',
    '温泉': '自然风光',
    
    // 历史古迹类
    '历史文化': '历史古迹',
    '古城古镇': '历史古迹',
    '皇家园林': '历史古迹',
    '皇家宫殿': '历史古迹',
    '宗教文化': '历史古迹',
    '佛教圣地': '历史古迹',
    '道教圣地': '历史古迹',
    '历史遗址': '历史古迹',
    '古建筑群': '历史古迹',
    '世界文化遗产': '历史古迹',
    
    // 主题公园类
    '主题乐园': '主题公园',
    '影视基地': '主题公园',
    '动物园': '主题公园',
    '植物园': '主题公园',
    '水上乐园': '主题公园',
    '海洋公园': '主题公园',
  }
  
  return categoryMap[category] || '其他'
}

// 省份选项（用于下拉选择器）
const provinceOptions = computed(() => 
  spotStore.provinces.map(p => ({
    label: `${p.province} (${p.count})`,
    value: p.province
  }))
)

// 是否有筛选条件
const hasFilter = computed(() => 
  selectedProvinces.value.length > 0 || 
  selectedCategory.value || 
  searchKeyword.value
)

// 筛选省份
function filterProvince(input: string, option: any) {
  return option.label.toLowerCase().includes(input.toLowerCase())
}

// 清除所有筛选
function clearAllFilters() {
  selectedProvinces.value = []
  selectedCategory.value = ''
  searchKeyword.value = ''
}

const filteredSpots = computed(() => {
  let result = spotStore.spots
  if (selectedProvinces.value.length > 0) {
    result = result.filter(s => selectedProvinces.value.includes(s.province))
  }
  // 使用分类映射函数进行筛选
  if (selectedCategory.value) {
    result = result.filter(s => mapCategory(s.category) === selectedCategory.value)
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

function isFavorite(spotId: string): boolean {
  return userStore.isFavorite(spotId)
}

async function toggleFavorite(spot: ScenicSpot) {
  if (!userStore.isLoggedIn) {
    message.warning('请先登录')
    return
  }
  try {
    if (isFavorite(spot._id)) {
      await userStore.removeFavorite(spot._id)
      message.success('已取消收藏')
    } else {
      await userStore.addFavorite(spot)
      message.success('收藏成功')
    }
  } catch (error) {
    message.error('操作失败')
  }
}

function goToDetail(id: string) {
  showSpotModal.value = false
  router.push(`/spot/${id}`)
}

function initMap() {
  if (!mapContainer.value || typeof AMap === 'undefined') {
    console.error('AMap not loaded')
    return
  }

  map = new AMap.Map(mapContainer.value, {
    zoom: 5,
    center: [104.065735, 35.738029],
    mapStyle: 'amap://styles/whitesmoke'
  })

  map.on('complete', () => {
    updateMarkers()
  })
}

function updateMarkers() {
  if (!map) return

  if (markerCluster) {
    markerCluster.setMap(null)
    markerCluster = null
  }
  markers = []

  const points: { lnglat: [number, number]; name: string; spot: ScenicSpot }[] = []
  
  filteredSpots.value.forEach(spot => {
    if (!spot.location?.coordinates || 
        spot.location.coordinates[0] === 0 || 
        spot.location.coordinates[1] === 0) return

    points.push({
      lnglat: [spot.location.coordinates[0], spot.location.coordinates[1]],
      name: spot.name,
      spot: spot
    })
  })

  if (points.length === 0) return

  if (AMap.MarkerCluster) {
    markerCluster = new AMap.MarkerCluster(map, points, {
      gridSize: 80,
      minClusterSize: 3,
      renderMarker: (context: any) => {
        const marker = context.marker
        const data = context.data[0]
        marker.setContent(`<div class="custom-marker"><span>🏔️</span></div>`)
        marker.setOffset(new AMap.Pixel(-16, -16))
        marker.on('click', () => {
          selectedSpot.value = data.spot
          showSpotModal.value = true
        })
      }
    })
  }
}

watch(filteredSpots, () => {
  nextTick(() => {
    updateMarkers()
  })
})

onMounted(async () => {
  await spotStore.fetchSpots()
  await spotStore.fetchProvinces()

  // 从环境变量获取高德地图API密钥，避免硬编码泄露
  const amapKey = import.meta.env.VITE_AMAP_KEY
  if (!amapKey || amapKey === 'your-amap-api-key-here') {
    message.error('请配置高德地图API密钥')
    return
  }
  
  const script = document.createElement('script')
  script.src = `https://webapi.amap.com/maps?v=2.0&key=${amapKey}&plugin=AMap.MarkerCluster&callback=initAMap`
  script.async = true
  ;(window as any).initAMap = () => {
    initMap()
  }
  document.head.appendChild(script)
})
</script>

<style scoped>
.home-page {
  display: flex;
  height: calc(100vh - 72px);
  background: var(--color-bg-page);
  overflow: hidden;
}

/* 筛选面板设计 */
.filter-panel {
  width: 340px;
  background: var(--color-bg-container);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  z-index: 10;
  animation: slideInLeft 0.4s ease-out;
}

.filter-header {
  padding: var(--spacing-6);
  background: var(--gradient-brand);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-md);
}

.filter-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.filter-header :deep(.ant-btn-link) {
  color: rgba(255, 255, 255, 0.9);
  font-size: var(--font-size-sm);
  padding: 0;
}

.filter-header :deep(.ant-btn-link:hover) {
  color: white;
}

.filter-section {
  padding: var(--spacing-5);
  border-bottom: 1px solid var(--color-gray-100);
  transition: background var(--transition-fast);
}

.filter-section:hover {
  background: var(--color-gray-50);
}

.filter-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-3);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.selected-count {
  margin-left: auto;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-brand-primary);
  background: var(--color-info-light);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

/* 搜索框样式增强 */
.filter-section :deep(.ant-input) {
  border-radius: var(--radius-lg);
  border-color: var(--color-gray-200);
  padding: var(--spacing-3) var(--spacing-4);
  transition: all var(--transition-base);
}

.filter-section :deep(.ant-input:focus),
.filter-section :deep(.ant-input:hover) {
  border-color: var(--color-brand-primary);
  box-shadow: 0 0 0 2px var(--color-info-light);
}

/* 选择器样式增强 */
.filter-section :deep(.ant-select-selector) {
  border-radius: var(--radius-lg) !important;
  border-color: var(--color-gray-200) !important;
  transition: all var(--transition-base);
}

.filter-section :deep(.ant-select-focused .ant-select-selector) {
  border-color: var(--color-brand-primary) !important;
  box-shadow: 0 0 0 2px var(--color-info-light) !important;
}

/* 分类标签样式 */
.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.category-list :deep(.ant-radio-button-wrapper) {
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-gray-200);
  margin: 0;
  transition: all var(--transition-base);
  /* 隐藏默认的竖线分隔符 */
  position: relative;
}

/* 隐藏radio-button之间的竖线 */
.category-list :deep(.ant-radio-button-wrapper::before) {
  display: none !important;
}

.category-list :deep(.ant-radio-button-wrapper:not(:first-child)) {
  border-left: 1px solid var(--color-gray-200);
}

.category-list :deep(.ant-radio-button-wrapper:hover) {
  color: var(--color-brand-primary);
  border-color: var(--color-brand-primary);
}

.category-list :deep(.ant-radio-button-wrapper-checked) {
  background: var(--gradient-brand);
  border-color: transparent;
  color: white;
  box-shadow: var(--shadow-brand);
}

/* 筛选统计 */
.filter-footer {
  padding: var(--spacing-5);
  background: linear-gradient(180deg, var(--color-gray-50) 0%, var(--color-gray-100) 100%);
  border-top: 1px solid var(--color-gray-200);
}

.filter-footer :deep(.ant-statistic-title) {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-footer :deep(.ant-statistic-content) {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-brand-primary);
}

.filter-footer :deep(.ant-statistic-content-suffix) {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* 数据来源区域 */
.data-source {
  padding: var(--spacing-4) var(--spacing-5);
  background: linear-gradient(135deg, var(--color-gray-50) 0%, var(--color-gray-100) 100%);
  border-top: 1px solid var(--color-gray-200);
  margin-top: auto;
}

.data-source-title {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-2);
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.data-source-list {
  margin: 0;
  padding-left: var(--spacing-4);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  line-height: 1.8;
}

.data-source-list li::marker {
  color: var(--color-brand-primary);
}

/* 地图容器 */
.map-container {
  flex: 1;
  position: relative;
  background: var(--color-bg-surface);
  animation: fadeIn 0.6s ease-out;
}

.map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
}

.map-loading :deep(.ant-spin-dot-item) {
  background-color: var(--color-brand-primary);
}

/* 景区弹窗 */
.spot-modal-content {
  padding: var(--spacing-2) 0;
}

.spot-info {
  margin-bottom: var(--spacing-4);
}

.spot-info p {
  margin: var(--spacing-3) 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.spot-info p :deep(.anticon) {
  color: var(--color-brand-primary);
  font-size: var(--font-size-base);
}

.spot-actions {
  display: flex;
  gap: var(--spacing-3);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-gray-100);
}

.spot-actions :deep(.ant-btn) {
  flex: 1;
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-medium);
  height: 40px;
  transition: all var(--transition-base);
}

.spot-actions :deep(.ant-btn-primary) {
  background: var(--gradient-brand);
  border: none;
  box-shadow: var(--shadow-brand);
}

.spot-actions :deep(.ant-btn-primary:hover) {
  background: var(--gradient-brand-subtle);
  box-shadow: var(--shadow-brand-hover);
  transform: translateY(-2px);
}

.spot-actions :deep(.ant-btn-default.ant-btn-ghost) {
  border-color: var(--color-brand-primary);
  color: var(--color-brand-primary);
}

.spot-actions :deep(.ant-btn-default.ant-btn-ghost:hover) {
  background: var(--color-info-light);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .filter-panel {
    width: 280px;
  }
  
  .filter-header h3 {
    font-size: var(--font-size-base);
  }
}

@media (max-width: 768px) {
  .home-page {
    flex-direction: column;
    height: auto;
    min-height: calc(100vh - 64px);
  }
  
  .filter-panel {
    width: 100%;
    max-height: 400px;
    overflow-y: auto;
    border-radius: 0 0 var(--radius-xl) var(--radius-xl);
    box-shadow: var(--shadow-xl);
  }
  
  .map-container {
    height: calc(100vh - 400px - 64px);
    min-height: 400px;
  }
  
  .filter-section {
    padding: var(--spacing-4);
  }
  
  .category-list {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: var(--spacing-2);
  }
  
  .category-list :deep(.ant-radio-button-wrapper) {
    white-space: nowrap;
  }
}

/* 移动端筛选面板抽屉式设计 */
@media (max-width: 480px) {
  .filter-panel {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    top: auto;
    max-height: 85vh;
    border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
    z-index: var(--z-index-modal);
    transform: translateY(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .filter-panel.open {
    transform: translateY(0);
  }
  
  .map-container {
    height: calc(100vh - 120px);
  }
}

/* 自定义标记点动画 */
.custom-marker {
  width: 36px;
  height: 36px;
  background: var(--gradient-brand);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: var(--shadow-brand);
  cursor: pointer;
  transition: all var(--transition-base);
  animation: markerPop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.custom-marker:hover {
  transform: scale(1.3);
  box-shadow: var(--shadow-brand-hover);
}

@keyframes markerPop {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}

/* 筛选面板滚动条美化 */
.filter-panel::-webkit-scrollbar {
  width: 6px;
}

.filter-panel::-webkit-scrollbar-track {
  background: transparent;
}

.filter-panel::-webkit-scrollbar-thumb {
  background: var(--color-gray-300);
  border-radius: var(--radius-full);
}

.filter-panel::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-400);
}
</style>

<style>
.custom-marker {
  width: 32px;
  height: 32px;
  background: #1890ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.4);
  cursor: pointer;
  transition: transform 0.2s;
}

.custom-marker:hover {
  transform: scale(1.2);
}
</style>
