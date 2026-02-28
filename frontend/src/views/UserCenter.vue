<template>
  <div v-if="loading" class="loading-container">
    <a-spin size="large" />
  </div>
  <div v-else class="user-center-page">
    <a-row :gutter="24">
      <a-col :span="8">
        <a-card title="个人信息" class="user-card">
          <div class="user-info">
            <a-avatar :size="80" :src="userStore.user?.avatar">
              {{ userStore.user?.nickname?.charAt(0) }}
            </a-avatar>
            <h2>{{ userStore.user?.nickname || '游客' }}</h2>
            <p class="login-type">
              {{ userStore.user?.loginType === 'wechat' ? '微信登录' : userStore.user?.loginType === 'qq' ? 'QQ登录' : '测试账号' }}
            </p>
          </div>
        </a-card>
      </a-col>

      <a-col :span="16">
        <a-card title="旅行成就" class="achievement-card">
          <template #extra>
            <a-button type="primary" @click="showShareModal = true">
              <TrophyOutlined /> 分享我的旅行成就
            </a-button>
          </template>

          <ShareCard
            :user-name="userStore.user?.nickname || '旅行者'"
            :user-avatar="userStore.user?.avatar"
            :spot-count="userStore.favorites?.length || 0"
            :total-spots="358"
          />
        </a-card>
      </a-col>
    </a-row>

    <!-- 分享模态框 -->
    <ShareModal
      v-model:visible="showShareModal"
      :share-image="shareImage"
      @share="handleShare"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { TrophyOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import ShareCard from '@/components/ShareCard.vue'
import ShareModal from '@/components/ShareModal.vue'

const router = useRouter()
const userStore = useUserStore()
const showShareModal = ref(false)
const shareImage = ref('')
const loading = ref(false)

// 页面加载时获取用户信息
onMounted(async () => {
  await userStore.fetchProfile()
})

// 打开分享模态框
function openShareModal() {
  showShareModal.value = true
}

// 处理分享成功回调
function handleShare(channel: 'wechat' | 'qq' | 'link') {
  showShareModal.value = false
  message.success('分享成功！')
}
</script>

<style scoped>
.user-center-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-6);
  animation: fadeIn 0.4s ease-out;
}

/* 用户卡片 */
.user-card {
  text-align: center;
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: none;
}

.user-card :deep(.ant-card-head) {
  background: var(--gradient-brand);
  border-bottom: none;
  padding: var(--spacing-8) var(--spacing-6);
  position: relative;
  overflow: hidden;
}

.user-card :deep(.ant-card-head::before) {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: rotate 30s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.user-card :deep(.ant-card-head-title) {
  color: white;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.user-info {
  padding: var(--spacing-8) var(--spacing-6);
  position: relative;
}

.user-info :deep(.ant-avatar) {
  border: 4px solid white;
  box-shadow: var(--shadow-lg);
  margin-bottom: var(--spacing-4);
  font-size: 36px;
  font-weight: var(--font-weight-bold);
  background: var(--gradient-brand);
}

.user-info h2 {
  margin: var(--spacing-2) 0 var(--spacing-1);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.login-type {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
  padding: var(--spacing-1) var(--spacing-3);
  background: var(--color-gray-100);
  border-radius: var(--radius-full);
  display: inline-block;
}

/* 成就卡片 */
.achievement-card {
  min-height: 400px;
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-100);
  animation: fadeInUp 0.4s ease-out;
  animation-delay: 0.1s;
}

.achievement-card :deep(.ant-card-head) {
  background: var(--gradient-brand);
  border-bottom: none;
  padding: var(--spacing-6) var(--spacing-8);
  position: relative;
  overflow: hidden;
}

.achievement-card :deep(.ant-card-head-title) {
  color: white;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.achievement-card :deep(.ant-card-head::before) {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: rotate 30s linear infinite;
}

.achievement-card :deep(.ant-btn-primary) {
  background: white;
  color: var(--color-brand-primary);
  border: none;
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-base);
}

.achievement-card :deep(.ant-btn-primary:hover) {
  background: var(--color-gray-50);
  transform: translateY(-2px);
}



/* 空状态 */
.empty-state {
  padding: var(--spacing-16) var(--spacing-6);
  text-align: center;
}

.empty-state :deep(.ant-empty-image) {
  margin-bottom: var(--spacing-6);
}

.empty-state :deep(.ant-empty-description) {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-4);
}

.empty-state :deep(.ant-btn) {
  background: var(--gradient-brand);
  border: none;
  box-shadow: var(--shadow-brand);
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-medium);
  height: 44px;
  padding: 0 var(--spacing-8);
  transition: all var(--transition-base);
}

.empty-state :deep(.ant-btn:hover) {
  background: var(--gradient-brand-subtle);
  box-shadow: var(--shadow-brand-hover);
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-center-page {
    padding: var(--spacing-4);
  }
  
  .user-card :deep(.ant-card-head) {
    padding: var(--spacing-6);
  }
  
  .user-info {
    padding: var(--spacing-6);
  }
  
  .user-info :deep(.ant-avatar) {
    width: 64px;
    height: 64px;
    font-size: 28px;
  }
  
  .user-info h2 {
    font-size: var(--font-size-xl);
  }
  
  .achievement-card {
    margin-top: var(--spacing-4);
  }
}

@media (max-width: 480px) {
  .user-center-page {
    padding: var(--spacing-3);
  }
  
  .user-info {
    padding: var(--spacing-5);
  }
  
  .achievement-card {
    min-height: 300px;
  }
  
  .empty-state {
    padding: var(--spacing-12) var(--spacing-3);
  }
}
</style>
