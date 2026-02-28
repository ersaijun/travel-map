<template>
  <div class="plan-create-page">
    <a-card title="创建新行程" class="plan-form-card">
      <a-form :model="planForm" layout="vertical" @finish="savePlan">
        <a-form-item label="行程名称" name="title" :rules="[{ required: true, message: '请输入行程名称' }]">
          <a-input v-model:value="planForm.title" placeholder="例如：我的江南之旅" />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="开始日期" name="startDate" :rules="[{ required: true, message: '请选择开始日期' }]">
              <a-date-picker v-model:value="planForm.startDate" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="结束日期" name="endDate" :rules="[{ required: true, message: '请选择结束日期' }]">
              <a-date-picker v-model:value="planForm.endDate" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>

    <a-card title="选择景区" class="spot-selector-card">
      <template #extra>
        <a-button type="link" @click="showSpotSelector = true">
          <PlusOutlined /> 从地图选择
        </a-button>
      </template>

      <div v-if="selectedSpots.length === 0" class="empty-spots">
        <a-empty description="暂未选择景区，请点击上方按钮添加" />
      </div>

      <div v-else class="selected-spots">
        <a-list :data-source="selectedSpots" item-layout="horizontal">
          <template #renderItem="{ item, index }">
            <a-list-item>
              <a-list-item-meta :description="`${item.province} ${item.city}`">
                <template #title>
                  <span>{{ index + 1 }}. {{ item.name }}</span>
                </template>
                <template #avatar>
                  <a-avatar style="background: #1890ff">
                    {{ index + 1 }}
                  </a-avatar>
                </template>
              </a-list-item-meta>
              <template #actions>
                <a-button type="text" danger @click="removeSpot(index)">
                  <DeleteOutlined />
                </a-button>
              </template>
            </a-list-item>
          </template>
        </a-list>
      </div>
    </a-card>

    <div class="plan-actions">
      <a-button @click="goBack">取消</a-button>
      <a-button type="primary" :loading="saving" @click="savePlan">
        <SaveOutlined /> 保存行程
      </a-button>
    </div>

    <a-modal
      v-model:open="showSpotSelector"
      title="选择景区"
      width="800px"
      :footer="null"
    >
      <div class="spot-selector">
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="搜索景区"
          style="margin-bottom: 16px"
          @search="handleSearch"
        />

        <a-list
          :data-source="searchResults"
          :loading="spotStore.loading"
          item-layout="horizontal"
          class="spot-list"
        >
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta
                :title="item.name"
                :description="`${item.province} ${item.city}`"
              />
              <template #actions>
                <a-button
                  type="primary"
                  size="small"
                  :disabled="isSelected(item._id)"
                  @click="addSpot(item)"
                >
                  {{ isSelected(item._id) ? '已添加' : '添加' }}
                </a-button>
              </template>
            </a-list-item>
          </template>
        </a-list>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import dayjs, { Dayjs } from 'dayjs'
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined
} from '@ant-design/icons-vue'
import { useSpotStore } from '@/stores/spot'
import { useUserStore } from '@/stores/user'
import { planApi } from '@/api/plan'
import type { ScenicSpot } from '@/types/spot'

const router = useRouter()
const spotStore = useSpotStore()
const userStore = useUserStore()

const planForm = ref({
  title: '',
  startDate: null as Dayjs | null,
  endDate: null as Dayjs | null
})

const selectedSpots = ref<ScenicSpot[]>([])
const showSpotSelector = ref(false)
const searchKeyword = ref('')
const searchResults = ref<ScenicSpot[]>([])
const saving = ref(false)

function isSelected(spotId: string): boolean {
  return selectedSpots.value.some(s => s._id === spotId)
}

function addSpot(spot: ScenicSpot) {
  if (!isSelected(spot._id)) {
    selectedSpots.value.push(spot)
    message.success(`已添加 ${spot.name}`)
  }
}

function removeSpot(index: number) {
  const spot = selectedSpots.value[index]
  selectedSpots.value.splice(index, 1)
  message.success(`已移除 ${spot.name}`)
}

async function handleSearch() {
  if (searchKeyword.value) {
    await spotStore.searchSpots(searchKeyword.value)
    searchResults.value = spotStore.spots
  } else {
    searchResults.value = spotStore.spots
  }
}

async function savePlan() {
  if (!userStore.isLoggedIn) {
    message.warning('请先登录')
    return
  }

  if (!planForm.value.title) {
    message.warning('请输入行程名称')
    return
  }

  if (!planForm.value.startDate || !planForm.value.endDate) {
    message.warning('请选择日期')
    return
  }

  if (selectedSpots.value.length === 0) {
    message.warning('请至少选择一个景区')
    return
  }

  saving.value = true
  try {
    const days = planForm.value.endDate.diff(planForm.value.startDate, 'day') + 1
    const spotsPerDay = Math.ceil(selectedSpots.value.length / days)
    
    const spots = selectedSpots.value.map((spot, index) => ({
      spotId: spot._id,
      day: Math.floor(index / spotsPerDay) + 1,
      order: (index % spotsPerDay) + 1,
      notes: ''
    }))

    await planApi.create({
      title: planForm.value.title,
      startDate: planForm.value.startDate.format('YYYY-MM-DD'),
      endDate: planForm.value.endDate.format('YYYY-MM-DD'),
      spots
    })

    message.success('行程保存成功')
    router.push('/user')
  } catch (error) {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}

function goBack() {
  router.push('/')
}

onMounted(async () => {
  await spotStore.fetchSpots()
  searchResults.value = spotStore.spots
})
</script>

<style scoped>
.plan-create-page {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-6);
  animation: fadeIn 0.4s ease-out;
}

/* 表单卡片 */
.plan-form-card,
.spot-selector-card {
  margin-bottom: var(--spacing-6);
  border-radius: var(--radius-2xl);
  border: 1px solid var(--color-gray-100);
  box-shadow: var(--shadow-sm);
  animation: fadeInUp 0.4s ease-out;
}

.plan-form-card {
  animation-delay: 0.1s;
}

.spot-selector-card {
  animation-delay: 0.2s;
}

.plan-form-card :deep(.ant-card-head),
.spot-selector-card :deep(.ant-card-head) {
  border-bottom: 1px solid var(--color-gray-100);
  padding: var(--spacing-5) var(--spacing-6);
}

.plan-form-card :deep(.ant-card-head-title),
.spot-selector-card :deep(.ant-card-head-title) {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.plan-form-card :deep(.ant-card-body),
.spot-selector-card :deep(.ant-card-body) {
  padding: var(--spacing-6);
}

/* 表单样式 */
.plan-form-card :deep(.ant-form-item-label) {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.plan-form-card :deep(.ant-input),
.plan-form-card :deep(.ant-picker) {
  border-radius: var(--radius-lg);
  border-color: var(--color-gray-200);
  transition: all var(--transition-base);
}

.plan-form-card :deep(.ant-input:focus),
.plan-form-card :deep(.ant-picker:focus),
.plan-form-card :deep(.ant-picker-focused) {
  border-color: var(--color-brand-primary);
  box-shadow: 0 0 0 2px var(--color-info-light);
}

/* 景区选择按钮 */
.spot-selector-card :deep(.ant-btn-link) {
  color: var(--color-brand-primary);
  font-weight: var(--font-weight-medium);
  padding: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  transition: all var(--transition-base);
}

.spot-selector-card :deep(.ant-btn-link:hover) {
  color: var(--color-brand-primary-dark);
  transform: translateX(4px);
}

/* 空状态 */
.empty-spots {
  padding: var(--spacing-16) var(--spacing-6);
  text-align: center;
}

.empty-spots :deep(.ant-empty-description) {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-4);
}

/* 已选景区列表 */
.selected-spots {
  max-height: 500px;
  overflow-y: auto;
  padding: var(--spacing-2);
}

.selected-spots::-webkit-scrollbar {
  width: 6px;
}

.selected-spots::-webkit-scrollbar-track {
  background: transparent;
}

.selected-spots::-webkit-scrollbar-thumb {
  background: var(--color-gray-300);
  border-radius: var(--radius-full);
}

.selected-spots::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-400);
}

.selected-spots :deep(.ant-list-item) {
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-2);
  transition: all var(--transition-base);
  border: 1px solid var(--color-gray-100);
}

.selected-spots :deep(.ant-list-item:hover) {
  background: var(--color-gray-50);
  transform: translateX(4px);
  border-color: var(--color-brand-primary);
}

.selected-spots :deep(.ant-list-item-meta-title) {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.selected-spots :deep(.ant-list-item-meta-description) {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
}

.selected-spots :deep(.ant-avatar) {
  background: var(--gradient-brand);
  font-weight: var(--font-weight-bold);
  box-shadow: var(--shadow-sm);
}

.selected-spots :deep(.ant-btn-text) {
  transition: all var(--transition-base);
}

.selected-spots :deep(.ant-btn-text:hover) {
  background: var(--color-error-light);
  border-radius: var(--radius-md);
}

/* 操作按钮区域 */
.plan-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-4);
  padding: var(--spacing-5) var(--spacing-6);
  background: var(--color-bg-container);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-gray-100);
  animation: fadeInUp 0.4s ease-out 0.3s both;
}

.plan-actions :deep(.ant-btn) {
  height: 48px;
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  padding: 0 var(--spacing-8);
  transition: all var(--transition-base);
}

.plan-actions :deep(.ant-btn-primary) {
  background: var(--gradient-brand);
  border: none;
  box-shadow: var(--shadow-brand);
}

.plan-actions :deep(.ant-btn-primary:hover) {
  background: var(--gradient-brand-subtle);
  box-shadow: var(--shadow-brand-hover);
  transform: translateY(-2px);
}

.plan-actions :deep(.ant-btn-default) {
  border-color: var(--color-gray-200);
  color: var(--color-text-primary);
}

.plan-actions :deep(.ant-btn-default:hover) {
  border-color: var(--color-brand-primary);
  color: var(--color-brand-primary);
}

/* 模态框 */
.spot-selector {
  max-height: 600px;
}

.spot-selector :deep(.ant-modal-body) {
  padding: var(--spacing-5);
}

.spot-selector :deep(.ant-input-search) {
  margin-bottom: var(--spacing-5);
}

.spot-selector :deep(.ant-input-search .ant-input) {
  border-radius: var(--radius-lg);
  border-color: var(--color-gray-200);
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-base);
}

.spot-selector :deep(.ant-input-search .ant-input:focus) {
  border-color: var(--color-brand-primary);
  box-shadow: 0 0 0 2px var(--color-info-light);
}

.spot-selector :deep(.ant-input-search-button) {
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  background: var(--gradient-brand);
  border: none;
}

.spot-selector :deep(.ant-input-search-button:hover) {
  background: var(--gradient-brand-subtle);
}

/* 景区列表 */
.spot-list {
  max-height: 450px;
  overflow-y: auto;
  padding: var(--spacing-2);
}

.spot-list::-webkit-scrollbar {
  width: 6px;
}

.spot-list::-webkit-scrollbar-track {
  background: transparent;
}

.spot-list::-webkit-scrollbar-thumb {
  background: var(--color-gray-300);
  border-radius: var(--radius-full);
}

.spot-list::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-400);
}

.spot-list :deep(.ant-list-item) {
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-2);
  transition: all var(--transition-base);
  border: 1px solid var(--color-gray-100);
}

.spot-list :deep(.ant-list-item:hover) {
  background: var(--color-gray-50);
  transform: translateX(4px);
  border-color: var(--color-brand-primary);
}

.spot-list :deep(.ant-list-item-meta-title) {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.spot-list :deep(.ant-list-item-meta-description) {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
}

.spot-list :deep(.ant-btn-primary) {
  background: var(--gradient-brand);
  border: none;
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-medium);
  box-shadow: var(--shadow-brand);
  transition: all var(--transition-base);
}

.spot-list :deep(.ant-btn-primary:hover) {
  background: var(--gradient-brand-subtle);
  box-shadow: var(--shadow-brand-hover);
  transform: translateY(-2px);
}

.spot-list :deep(.ant-btn-primary:disabled) {
  background: var(--color-gray-200);
  box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .plan-create-page {
    padding: var(--spacing-4);
  }
  
  .plan-form-card :deep(.ant-card-body),
  .spot-selector-card :deep(.ant-card-body) {
    padding: var(--spacing-5);
  }
  
  .plan-form-card :deep(.ant-row),
  .plan-form-card :deep(.ant-col) {
    margin: 0 !important;
    padding: 0 !important;
  }
  
  .plan-form-card :deep(.ant-col) {
    margin-bottom: var(--spacing-3);
  }
  
  .selected-spots,
  .spot-list {
    max-height: 350px;
  }
  
  .plan-actions {
    flex-direction: column;
    gap: var(--spacing-2);
  }
  
  .plan-actions :deep(.ant-btn) {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .plan-create-page {
    padding: var(--spacing-3);
  }
  
  .plan-form-card :deep(.ant-card-head),
  .spot-selector-card :deep(.ant-card-head) {
    padding: var(--spacing-4);
  }
  
  .plan-form-card :deep(.ant-card-body),
  .spot-selector-card :deep(.ant-card-body) {
    padding: var(--spacing-4);
  }
  
  .spot-selector :deep(.ant-modal-body) {
    padding: var(--spacing-4);
  }
  
  .spot-selector :deep(.ant-input-search) {
    margin-bottom: var(--spacing-4);
  }
  
  .selected-spots,
  .spot-list {
    max-height: 300px;
  }
}
</style>
