<template>
  <div class="empty-state" :class="`empty-${type}`">
    <div class="empty-icon" :style="{ fontSize: iconSize }">
      <component :is="iconComponent" />
    </div>
    <h3 class="empty-title">{{ title }}</h3>
    <p class="empty-description" v-html="description"></p>
    <div class="empty-actions" v-if="$slots.actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  SearchOutlined,
  StarOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  HeartOutlined,
  FileTextOutlined
} from '@ant-design/icons-vue'

const props = withDefaults(defineProps<{
  type?: 'spots' | 'favorites' | 'plans' | 'search' | 'default'
  title?: string
  description?: string
  iconSize?: string
}>(), {
  type: 'default',
  title: '',
  description: '',
  iconSize: '64px'
})

const typeConfig = {
  spots: {
    icon: EnvironmentOutlined,
    defaultTitle: '探索中国5A景区',
    defaultDescription: '收录全国338个5A级景区<br/>从故宫到九寨沟，发现不一样的中国'
  },
  favorites: {
    icon: HeartOutlined,
    defaultTitle: '还没有收藏',
    defaultDescription: '收藏喜欢的景区，随时查看<br/>开启您的旅行收藏夹'
  },
  plans: {
    icon: CalendarOutlined,
    defaultTitle: '还没有行程',
    defaultDescription: '创建您的第一个旅行计划<br/>规划完美的旅程'
  },
  search: {
    icon: SearchOutlined,
    defaultTitle: '未找到相关景区',
    defaultDescription: '试试其他关键词或调整筛选条件<br/>发现更多精彩景区'
  },
  default: {
    icon: StarOutlined,
    defaultTitle: '暂无数据',
    defaultDescription: '这里还没有内容<br/>稍后再来看看吧'
  }
}

const config = computed(() => typeConfig[props.type])
const iconComponent = computed(() => config.value.icon)
const title = computed(() => props.title || config.value.defaultTitle)
const description = computed(() => props.description || config.value.defaultDescription)
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  text-align: center;
  animation: fadeIn 0.4s ease-out;
}

.empty-icon {
  margin-bottom: 24px;
  color: var(--color-text-tertiary);
  animation: float 3s ease-in-out infinite;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.empty-description {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.8;
  max-width: 400px;
  margin-bottom: 32px;
}

.empty-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

/* 不同类型的空状态样式 */
.empty-spots .empty-icon {
  color: #0EA5E9;
}

.empty-favorites .empty-icon {
  color: #EF4444;
}

.empty-plans .empty-icon {
  color: #F59E0B;
}

.empty-search .empty-icon {
  color: #6B7280;
}

/* 浮动动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

/* 淡入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .empty-state {
    padding: 60px 24px;
  }
  
  .empty-icon {
    font-size: 48px !important;
    margin-bottom: 20px;
  }
  
  .empty-title {
    font-size: 20px;
    margin-bottom: 10px;
  }
  
  .empty-description {
    font-size: 13px;
    margin-bottom: 24px;
  }
  
  .empty-actions {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .empty-state {
    padding: 48px 16px;
  }
  
  .empty-icon {
    font-size: 40px !important;
  }
  
  .empty-title {
    font-size: 18px;
  }
}
</style>
