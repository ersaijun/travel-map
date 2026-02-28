<template>
  <a-modal
    v-model:open="visible"
    title="分享我的旅行成就"
    :footer="null"
    width="500px"
    @cancel="handleCancel"
  >
    <div class="share-modal">
      <!-- 分享卡片预览 -->
      <div class="share-preview">
        <img :src="shareImage" alt="分享预览" class="share-image" />
      </div>

      <!-- 分享渠道选择 -->
      <div class="share-channels">
        <h3>选择分享渠道</h3>
        <div class="channel-buttons">
          <a-button
            type="primary"
            size="large"
            @click="handleShare('wechat')"
            :disabled="loading"
          >
            <WechatOutlined /> 微信分享
          </a-button>

          <a-button
            type="primary"
            size="large"
            @click="handleShare('qq')"
            :disabled="loading"
          >
            <QqOutlined /> QQ分享
          </a-button>

          <a-button
            type="default"
            size="large"
            @click="handleShare('link')"
            :disabled="loading"
          >
            <LinkOutlined /> 复制链接
          </a-button>
        </div>
      </div>

      <!-- 分享文案 -->
      <div class="share-text">
        <h4>分享文案</h4>
        <a-textarea
          v-model:value="shareText"
          placeholder="输入自定义分享文案（可选）"
          :rows="3"
          :maxlength="100"
          show-count
        />
      </div>

      <!-- 分享提示 -->
      <a-alert
        v-if="shareSuccess"
        type="success"
        message="分享成功！"
        show-icon
        closable
        @after-close="shareSuccess = false"
      />

      <a-alert
        v-if="shareError"
        type="error"
        :message="errorMessage"
        show-icon
        closable
        @after-close="shareError = false"
      />
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  WechatOutlined,
  QqOutlined,
  LinkOutlined
} from '@ant-design/icons-vue'

interface Props {
  shareImage: string;
  onShare: (channel: 'wechat' | 'qq' | 'link') => void;
}

const props = withDefaults(defineProps<Props>(), {
  shareImage: '',
  onShare: () => {}
})

const visible = defineModel('visible', false)
const shareText = ref('我的5A之旅：已去{spotCount}个/{totalSpots}个景区')
const loading = ref(false)
const shareSuccess = ref(false)
const shareError = ref(false)
const errorMessage = ref('')

// 处理分享
async function handleShare(channel: 'wechat' | 'qq' | 'link') {
  loading.value = true
  shareSuccess.value = false
  shareError.value = false

  try {
    // 调用父组件的分享方法
    await props.onShare(channel)
    shareSuccess.value = true
    message.success('分享成功！')

    // 2秒后关闭模态框
    setTimeout(() => {
      visible.value = false
      shareSuccess.value = false
    }, 2000)
  } catch (error) {
    loading.value = false
    shareError.value = true
    errorMessage.value = error instanceof Error ? error.message : '分享失败，请稍后重试'
  }
}

// 处理取消
function handleCancel() {
  visible.value = false
  shareSuccess.value = false
  shareError.value = false
}

// 监听分享文案变化
watch(shareText, (newText) => {
  if (newText.trim()) {
    shareText.value = `我的5A之旅：已去{spotCount}个/{totalSpots}个景区`
  }
})
</script>

<style scoped>
.share-modal {
  padding: 24px;
}

.share-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-bottom: 24px;
}

.share-image {
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.share-channels {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.share-channels h3 {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.channel-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.channel-buttons :deep(.ant-btn) {
  height: 48px;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.channel-buttons :deep(.anticon) {
  font-size: 20px;
}

.share-text {
  margin-bottom: 24px;
}

.share-text h4 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.share-text :deep(.ant-input-textarea) {
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .share-preview {
    padding: 16px;
  }

  .share-image {
    max-width: 300px;
  }

  .channel-buttons {
    flex-direction: column;
  }

  .channel-buttons :deep(.ant-btn) {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .share-channels {
    gap: 12px;
  }

  .share-text h4 {
    font-size: 14px;
  }
}
</style>
