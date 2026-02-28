<template>
  <div class="spot-detail-page">
    <a-spin :spinning="spotStore.loading">
      <template v-if="spotStore.currentSpot">
        <div class="spot-layout">
          <!-- 左栏：主要视觉内容 -->
          <div class="spot-left">
            <!-- 图片轮播 -->
            <a-carousel v-if="spotStore.currentSpot.images?.length" class="spot-carousel">
              <div v-for="(img, index) in spotStore.currentSpot.images" :key="index" class="carousel-item">
                <img :src="img" :alt="spotStore.currentSpot.name" />
              </div>
            </a-carousel>
            <div v-else class="spot-placeholder">
              <PictureOutlined style="font-size: 48px; color: #ccc" />
              <span>暂无图片</span>
            </div>

            <!-- 标题和基本信息 -->
            <div class="spot-title">
              <h1>{{ spotStore.currentSpot.name }}</h1>
              <div class="spot-meta">
                <a-tag color="blue">{{ spotStore.currentSpot.province }}</a-tag>
                <a-tag>{{ spotStore.currentSpot.city }}</a-tag>
                <span v-if="spotStore.currentSpot.rating" class="rating">
                  <StarFilled style="color: #fadb14" />
                  {{ spotStore.currentSpot.rating }}
                </span>
              </div>
            </div>

            <!-- 景区介绍 -->
            <a-card title="景区介绍" class="spot-section">
              <p>{{ spotStore.currentSpot.description || '暂无介绍' }}</p>
              <a v-if="spotStore.currentSpot.wikiUrl" :href="spotStore.currentSpot.wikiUrl" target="_blank">
                <LinkOutlined /> 查看百科
              </a>
            </a-card>

            <!-- 特色亮点 -->
            <a-card v-if="spotStore.currentSpot.highlights?.length" title="特色亮点" class="spot-section">
              <a-space wrap>
                <a-tag v-for="(h, i) in spotStore.currentSpot.highlights" :key="i" color="green">
                  {{ h }}
                </a-tag>
              </a-space>
            </a-card>
          </div>

          <!-- 右栏：详细信息和地图 -->
          <div class="spot-right">
            <!-- 详细信息 -->
            <a-card title="详细信息" class="spot-section">
              <a-descriptions :column="1" bordered>
                <a-descriptions-item label="地址">
                  <EnvironmentOutlined /> {{ spotStore.currentSpot.address || `${spotStore.currentSpot.province}${spotStore.currentSpot.city}` }}
                </a-descriptions-item>
                <a-descriptions-item label="开放时间">
                  <ClockCircleOutlined /> {{ spotStore.currentSpot.openTime || '暂无信息' }}
                </a-descriptions-item>
                <a-descriptions-item label="门票信息">
                  <DollarOutlined />
                  <span v-if="spotStore.currentSpot.ticketInfo?.price">
                    ¥{{ spotStore.currentSpot.ticketInfo.price }}
                  </span>
                  {{ spotStore.currentSpot.ticketInfo?.description || '暂无信息' }}
                </a-descriptions-item>
                <a-descriptions-item label="景区类型">
                  <TagOutlined /> {{ spotStore.currentSpot.category || '其他' }}
                </a-descriptions-item>
              </a-descriptions>
            </a-card>

            <!-- 地图位置 -->
            <a-card title="地图位置" class="spot-section map-section">
              <div ref="miniMapContainer" class="mini-map"></div>
            </a-card>

            <!-- 操作按钮 -->
            <div class="spot-actions">
              <a-button
                :type="isFavorite ? 'default' : 'primary'"
                @click="toggleFavorite"
                block
              >
                <HeartFilled v-if="isFavorite" />
                <HeartOutlined v-else />
                {{ isFavorite ? '已收藏' : '收藏' }}
              </a-button>
              <a-button type="primary" @click="addToPlan" block>
                <PlusOutlined /> 加入行程
              </a-button>
              <a-button @click="goBack" block>
                <ArrowLeftOutlined /> 返回地图
              </a-button>
            </div>
          </div>
        </div>
      </template>
      <a-empty v-else-if="!spotStore.loading" description="景区不存在" />
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  PictureOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  TagOutlined,
  StarFilled,
  LinkOutlined,
  HeartOutlined,
  HeartFilled,
  PlusOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons-vue'
import { useSpotStore } from '@/stores/spot'
import { useUserStore } from '@/stores/user'

declare const AMap: any

const route = useRoute()
const router = useRouter()
const spotStore = useSpotStore()
const userStore = useUserStore()

const miniMapContainer = ref<HTMLElement | null>(null)

const isFavorite = computed(() => {
  if (!spotStore.currentSpot) return false
  return userStore.isFavorite(spotStore.currentSpot._id)
})

async function toggleFavorite() {
  if (!spotStore.currentSpot) return
  
  if (!userStore.isLoggedIn) {
    message.warning('请先登录')
    return
  }

  try {
    if (isFavorite.value) {
      await userStore.removeFavorite(spotStore.currentSpot._id)
      message.success('已取消收藏')
    } else {
      await userStore.addFavorite(spotStore.currentSpot)
      message.success('收藏成功')
    }
  } catch (error) {
    message.error('操作失败')
  }
}

function addToPlan() {
  if (!userStore.isLoggedIn) {
    message.warning('请先登录')
    return
  }
  router.push('/plan')
}

function goBack() {
  router.push('/')
}

function initMiniMap() {
  if (!miniMapContainer.value || !spotStore.currentSpot?.location?.coordinates) return
  if (typeof AMap === 'undefined') return

  const map = new AMap.Map(miniMapContainer.value, {
    zoom: 12,
    center: spotStore.currentSpot.location.coordinates,
    mapStyle: 'amap://styles/whitesmoke'
  })

  new AMap.Marker({
    position: spotStore.currentSpot.location.coordinates,
    map
  })
}

onMounted(async () => {
  const id = route.params.id as string
  await spotStore.fetchSpotById(id)
  
  nextTick(() => {
    initMiniMap()
  })
})
</script>

<style scoped>
.spot-detail-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-6);
  animation: fadeIn 0.4s ease-out;
}

/* 左右分栏布局 */
.spot-layout {
  display: flex;
  gap: var(--spacing-6);
  align-items: flex-start;
}

.spot-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.spot-right {
  flex: 0 0 400px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

/* 头部图片区域 */
.spot-header {
  margin-bottom: var(--spacing-8);
  animation: fadeInDown 0.5s ease-out;
}

.spot-carousel {
  height: 480px;
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
}

.carousel-item {
  height: 480px;
  position: relative;
}

.carousel-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.carousel-item:hover img {
  transform: scale(1.05);
}

/* 轮播图指示器样式 */
.spot-carousel :deep(.slick-dots) {
  bottom: var(--spacing-4);
}

.spot-carousel :deep(.slick-dots li button) {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.5);
  transition: all var(--transition-base);
}

.spot-carousel :deep(.slick-dots li.slick-active button) {
  width: 24px;
  background: white;
  box-shadow: var(--shadow-sm);
}

/* 空状态占位图 */
.spot-placeholder {
  height: 480px;
  background: var(--gradient-brand-subtle);
  border-radius: var(--radius-2xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-4);
  color: white;
  position: relative;
  overflow: hidden;
}

.spot-placeholder::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spot-placeholder :deep(.anticon) {
  font-size: 64px;
  color: rgba(255, 255, 255, 0.8);
  z-index: 1;
}

.spot-placeholder span {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: rgba(255, 255, 255, 0.9);
  z-index: 1;
}

/* 标题区域 */
.spot-title {
  margin-bottom: var(--spacing-8);
  padding: var(--spacing-6);
  background: var(--color-bg-container);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.spot-title h1 {
  margin: 0 0 var(--spacing-4);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  background: var(--gradient-brand);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.spot-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}

.spot-meta :deep(.ant-tag) {
  font-size: var(--font-size-sm);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-gray-200);
  font-weight: var(--font-weight-medium);
}

.rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-brand-accent);
  background: var(--color-warning-light);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
}

/* 信息卡片 */
.spot-info {
  margin-bottom: var(--spacing-6);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.spot-info :deep(.ant-descriptions) {
  background: var(--color-bg-container);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.spot-info :deep(.ant-descriptions-item-label) {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  background: var(--color-gray-50);
  font-size: var(--font-size-sm);
}

.spot-info :deep(.ant-descriptions-item-content) {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.spot-info :deep(.anticon) {
  color: var(--color-brand-primary);
}

/* 内容区块 */
.spot-section {
  margin-bottom: var(--spacing-6);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  animation: fadeInUp 0.4s ease-out;
}

.spot-section:nth-child(n) {
  animation-delay: 0.1s;
}

.spot-section:nth-child(n+1) {
  animation-delay: 0.2s;
}

.spot-section:nth-child(n+2) {
  animation-delay: 0.3s;
}

.spot-section :deep(.ant-card-head) {
  border-bottom: 1px solid var(--color-gray-100);
  padding: var(--spacing-5) var(--spacing-6);
}

.spot-section :deep(.ant-card-head-title) {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.spot-section :deep(.ant-card-body) {
  padding: var(--spacing-6);
}

.spot-section p {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
  margin: 0;
}

.spot-section a {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  color: var(--color-brand-primary);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-base);
  margin-top: var(--spacing-3);
}

.spot-section a:hover {
  color: var(--color-brand-primary-dark);
  transform: translateX(4px);
}

/* 特色亮点标签 */
.spot-section :deep(.ant-tag) {
  font-size: var(--font-size-sm);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-gray-200);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-base);
}

.spot-section :deep(.ant-tag:hover) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 迷你地图 */
.mini-map {
  height: 320px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

/* 操作按钮区域 */
.spot-actions {
  position: sticky;
  bottom: var(--spacing-6);
  background: var(--color-bg-container);
  padding: var(--spacing-5) var(--spacing-6);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-gray-100);
  display: flex;
  gap: var(--spacing-4);
  z-index: var(--z-index-sticky);
  animation: fadeInUp 0.4s ease-out;
  animation-delay: 0.4s;
}

.spot-actions :deep(.ant-btn) {
  flex: 1;
  height: 48px;
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
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

.spot-actions :deep(.ant-btn-default) {
  border-color: var(--color-gray-200);
  color: var(--color-text-primary);
}

.spot-actions :deep(.ant-btn-default:hover) {
  border-color: var(--color-brand-primary);
  color: var(--color-brand-primary);
  background: var(--color-info-light);
}

.spot-actions :deep(.anticon) {
  font-size: var(--font-size-lg);
}

/* 空状态 */
.spot-detail-page :deep(.ant-empty) {
  padding: var(--spacing-16) var(--spacing-6);
}

.spot-detail-page :deep(.ant-empty-description) {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

/* 加载动画 */
.spot-detail-page :deep(.ant-spin-dot-item) {
  background-color: var(--color-brand-primary);
}

/* 左右分栏布局响应式 */
@media (max-width: 1200px) {
  .spot-right {
    flex: 0 0 350px;
  }
}

@media (max-width: 768px) {
  .spot-layout {
    flex-direction: column;
  }

  .spot-left,
  .spot-right {
    flex: 1;
  }

  .spot-right {
    flex: auto;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .spot-detail-page {
    padding: var(--spacing-4);
  }
  
  .spot-header,
  .spot-carousel,
  .carousel-item,
  .spot-placeholder {
    height: 320px;
    border-radius: var(--radius-xl);
  }
  
  .spot-title {
    margin-bottom: var(--spacing-6);
    padding: var(--spacing-4);
  }
  
  .spot-title h1 {
    font-size: var(--font-size-2xl);
  }
  
  .spot-meta {
    gap: var(--spacing-2);
  }
  
  .spot-section :deep(.ant-card-body) {
    padding: var(--spacing-4);
  }
  
  .mini-map {
    height: 240px;
  }
  
  .spot-actions {
    padding: var(--spacing-4);
    border-radius: var(--radius-lg);
    flex-direction: column;
    gap: var(--spacing-2);
  }
  
  .spot-actions :deep(.ant-btn) {
    width: 100%;
    height: 44px;
  }
}

@media (max-width: 480px) {
  .spot-header,
  .spot-carousel,
  .carousel-item,
  .spot-placeholder {
    height: 240px;
    border-radius: var(--radius-lg);
  }
  
  .spot-placeholder :deep(.anticon) {
    font-size: 48px;
  }
  
  .spot-title h1 {
    font-size: var(--font-size-xl);
  }
  
  .spot-info :deep(.ant-descriptions) {
    border-radius: var(--radius-lg);
  }
  
  .spot-section {
    margin-bottom: var(--spacing-4);
    border-radius: var(--radius-lg);
  }
}

/* 轮播图指示器样式 */
.spot-carousel :deep(.ant-carousel-dots) {
  bottom: var(--spacing-4);
}

.spot-carousel :deep(.ant-carousel-dots li button) {
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-full);
  opacity: 0.8;
}

.spot-carousel :deep(.ant-carousel-dots li.ant-carousel-active button) {
  background: white;
  width: 24px;
  opacity: 1;
}

/* 卡片悬停效果 */
.spot-section:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  transition: all var(--transition-base);
}

/* 类型标签颜色 */
.type-nature :deep(.ant-tag) {
  background: var(--color-success-light);
  border-color: var(--color-success);
  color: var(--color-success);
}

.type-history :deep(.ant-tag) {
  background: var(--color-warning-light);
  border-color: var(--color-warning);
  color: var(--color-warning);
}

.type-park :deep(.ant-tag) {
  background: #F3E8FF;
  border-color: #9333EA;
  color: #9333EA;
}
</style>
