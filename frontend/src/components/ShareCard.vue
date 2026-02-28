<template>
  <div class="share-card">
    <!-- 背景图片 -->
    <div class="share-background">
      <div class="share-content">
        <!-- 用户信息 -->
        <div class="user-info">
          <div class="avatar">
            <img :src="userAvatar" alt="用户头像" />
          </div>
          <div class="user-details">
            <div class="user-name">{{ userName }}</div>
            <div class="share-title">我的5A之旅</div>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="stats-container">
          <div class="stat-item">
            <div class="stat-icon">
              <EnvironmentOutlined style="font-size: 32px; color: #52c41a" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ spotCount }}</div>
              <div class="stat-label">已去过的5A景区</div>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon">
              <StarOutlined style="font-size: 32px; color: #fadb14" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalSpots }}</div>
              <div class="stat-label">中国5A景区总数</div>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon">
              <TrophyOutlined style="font-size: 32px; color: #faad14" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ percentage }}%</div>
              <div class="stat-label">去过的百分比</div>
            </div>
          </div>
        </div>

        <!-- 自定义文案 -->
        <div class="custom-text">
          <a-input
            v-model:value="customText"
            placeholder="自定义分享文案（可选）"
            :maxlength="50"
            class="text-input"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  EnvironmentOutlined,
  StarOutlined,
  TrophyOutlined
} from '@ant-design/icons-vue'

interface Props {
  userName?: string;
  userAvatar?: string;
  spotCount: number;
  totalSpots?: number;
}

const props = withDefaults(defineProps<Props>(), {
  userName: '旅行者',
  userAvatar: '',
  spotCount: 0,
  totalSpots: 358
})

const customText = ref('')

// 计算百分比
const percentage = computed(() => {
  if (props.totalSpots === 0) return 0
  return Math.round((props.spotCount / props.totalSpots) * 100)
})

// 生成分享文案
const shareText = computed(() => {
  if (customText.value.trim()) {
    return customText.value
  }
  return `我的5A之旅：已去${props.spotCount}个/${props.totalSpots}个景区`
})

// 复制链接
function copyLink() {
  const shareUrl = window.location.href
  navigator.clipboard.writeText(shareUrl)
  message.success('链接已复制到剪贴板')
}

// 生成分享图片
function generateShareImage() {
  // 使用Canvas生成分享图片
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 600
  const ctx = canvas.getContext('2d')!

  // 绘制渐变背景
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, '#667eea')
  gradient.addColorStop(1, '#764ba2')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 绘制统计信息
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.font = 'bold 48px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // 绘制用户昵称
  ctx.fillText(props.userName, canvas.width / 2, 150)

  // 绘制统计数字
  ctx.font = 'bold 72px Arial'
  ctx.fillStyle = '#52c41a'
  ctx.fillText(props.spotCount.toString(), canvas.width / 2, 280)

  ctx.fillStyle = '#fadb14'
  ctx.fillText(props.totalSpots.toString(), canvas.width / 2, 380)

  // 绘制百分比
  ctx.font = 'bold 64px Arial'
  ctx.fillStyle = '#faad14'
  ctx.fillText(`${percentage.value}%`, canvas.width / 2, 480)

  // 绘制分享文案
  ctx.font = '24px Arial'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
  ctx.fillText(shareText.value, canvas.width / 2, 550)

  return canvas.toDataURL('image/png')
}
</script>

<style scoped>
.share-card {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
}

.share-background {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.share-content {
  position: relative;
  z-index: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.user-details {
  text-align: left;
}

.user-name {
  font-size: 24px;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
}

.share-title {
  font-size: 28px;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.stats-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
}

.stat-value {
  font-size: 48px;
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 4px;
}

.custom-text {
  width: 100%;
}

.text-input :deep(.ant-input) {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
}

.text-input :deep(.ant-input::placeholder) {
  color: rgba(255, 255, 255, 0.6);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .share-card {
    max-width: 100%;
    padding: 16px;
  }

  .share-content {
    padding: 24px;
    gap: 16px;
  }

  .user-info {
    flex-direction: column;
    gap: 12px;
  }

  .avatar {
    width: 60px;
    height: 60px;
  }

  .stats-container {
    gap: 12px;
  }

  .stat-item {
    padding: 12px 16px;
  }

  .stat-value {
    font-size: 36px;
  }

  .stat-label {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .share-content {
    padding: 16px;
  }

  .user-name {
    font-size: 20px;
  }

  .share-title {
    font-size: 24px;
  }

  .stat-value {
    font-size: 32px;
  }

  .stat-label {
    font-size: 11px;
  }
}
</style>
