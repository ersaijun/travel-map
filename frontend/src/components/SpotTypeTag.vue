<template>
  <span :class="['spot-type-tag', `type-${type}`]">
    <component :is="icon" />
    <span>{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  EnvironmentOutlined,
  HomeOutlined,
  ThunderboltOutlined,
  StarOutlined
} from '@ant-design/icons-vue'

const props = defineProps<{
  type: '自然风光' | '历史古迹' | '主题公园' | '其他'
}>()

const typeConfig = {
  '自然风光': {
    label: '自然风光',
    icon: EnvironmentOutlined,
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'
  },
  '历史古迹': {
    label: '历史古迹',
    icon: HomeOutlined,
    color: '#D97706',
    gradient: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)'
  },
  '主题公园': {
    label: '主题公园',
    icon: ThunderboltOutlined,
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)'
  },
  '其他': {
    label: '其他',
    icon: StarOutlined,
    color: '#0EA5E9',
    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)'
  }
}

const config = computed(() => typeConfig[props.type])
const label = computed(() => config.value.label)
const icon = computed(() => config.value.icon)
const type = computed(() => props.type)
</script>

<style scoped>
.spot-type-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: white;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.spot-type-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.type-自然风光 {
  background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.type-自然风光:hover {
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.type-历史古迹 {
  background: linear-gradient(135deg, #D97706 0%, #F59E0B 100%);
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.3);
}

.type-历史古迹:hover {
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4);
}

.type-主题公园 {
  background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.type-主题公园:hover {
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.type-其他 {
  background: linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%);
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
}

.type-其他:hover {
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
}
</style>
