<template>
  <a-config-provider>
    <a-layout class="app-layout">
      <a-layout-header class="app-header">
        <div class="header-content">
          <router-link to="/" class="logo">
            <span class="logo-icon">🏔️</span>
            <span class="logo-text">中国5A景区全揽</span>
          </router-link>
          <a-menu mode="horizontal" :selectedKeys="[currentRoute]" class="nav-menu">
            <a-menu-item key="/">
              <router-link to="/">地图探索</router-link>
            </a-menu-item>
            <a-menu-item key="/plan">
              <router-link to="/plan">行程规划</router-link>
            </a-menu-item>
          </a-menu>
          <div class="header-right">
            <template v-if="userStore.isLoggedIn">
              <a-dropdown>
                <a-button type="text">
                  <a-avatar :size="32" :src="userStore.user?.avatar">
                    {{ userStore.user?.nickname?.charAt(0) }}
                  </a-avatar>
                  <span class="user-name">{{ userStore.user?.nickname }}</span>
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="user">
                      <router-link to="/user">个人中心</router-link>
                    </a-menu-item>
                    <a-menu-divider />
                    <a-menu-item key="logout" @click="userStore.logout()">
                      退出登录
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </template>
            <template v-else>
              <a-button type="primary" @click="showLoginModal = true">
                登录
              </a-button>
            </template>
          </div>
        </div>
      </a-layout-header>
      <a-layout-content class="app-content">
        <router-view />
      </a-layout-content>
    </a-layout>

    <a-modal
      v-model:open="showLoginModal"
      title="登录"
      :footer="null"
      width="400px"
    >
      <a-form @submit.prevent="handleLogin">
        <a-form-item label="昵称">
          <a-input v-model:value="loginNickname" placeholder="请输入昵称" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" block :loading="userStore.loading">
            测试登录
          </a-button>
        </a-form-item>
        <a-divider>或</a-divider>
        <a-space direction="vertical" style="width: 100%">
          <a-button block disabled>微信登录（待开通）</a-button>
          <a-button block disabled>QQ登录（待开通）</a-button>
        </a-space>
      </a-form>
    </a-modal>
  </a-config-provider>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()

const currentRoute = computed(() => route.path)
const showLoginModal = ref(false)
const loginNickname = ref('')
const agreeToTerms = ref(false)

onMounted(async () => {
  if (userStore.token) {
    await userStore.fetchProfile()
  }
})

async function handleLogin() {
  try {
    await userStore.devLogin(loginNickname.value || undefined)
    showLoginModal.value = false
    loginNickname.value = ''
  } catch (error) {
    console.error('Login failed:', error)
  }
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: var(--color-bg-page);
}

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-index-fixed);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: var(--shadow-sm);
  padding: 0 var(--spacing-6);
  border-bottom: 1px solid var(--color-gray-100);
}

.header-content {
  max-width: 1920px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  height: 72px;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 20px;
  font-weight: var(--font-weight-bold);
  text-decoration: none;
  transition: all var(--transition-base);
}

.logo-icon {
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--gradient-brand);
  border-radius: var(--radius-lg);
  color: white;
  box-shadow: var(--shadow-brand);
}

.logo-text {
  background: var(--gradient-brand);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: var(--letter-spacing-tight);
}

.logo:hover {
  transform: scale(1.02);
}

.nav-menu {
  flex: 1;
  margin-left: var(--spacing-10);
  border-bottom: none;
  background: transparent;
}

.nav-menu :deep(.ant-menu-item) {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  border-radius: var(--radius-lg);
  margin: 0 var(--spacing-1);
  transition: all var(--transition-base);
}

.nav-menu :deep(.ant-menu-item:hover) {
  color: var(--color-brand-primary);
  background: var(--color-info-light);
}

.nav-menu :deep(.ant-menu-item-selected) {
  background: var(--gradient-brand);
  color: white !important;
}

.nav-menu :deep(.ant-menu-item-selected a) {
  color: white;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.user-name {
  margin-left: var(--spacing-2);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.app-content {
  margin-top: 72px;
  min-height: calc(100vh - 72px);
}

.app-footer {
  background: var(--color-gray-50);
  padding: var(--spacing-6) 0;
  border-top: 1px solid var(--color-gray-100);
}

.footer-content {
  max-width: 1920px;
  margin: 0 auto;
  text-align: center;
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.footer-links a {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color var(--transition-base);
}

.footer-links a:hover {
  color: var(--color-brand-primary);
}

.footer-copyright {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.link-text {
  color: var(--color-brand-primary);
  text-decoration: underline;
}

.link-text:hover {
  color: var(--color-brand-primary-hover);
}

/* 登录按钮增强 */
.header-right :deep(.ant-btn-primary) {
  background: var(--gradient-brand);
  border: none;
  box-shadow: var(--shadow-brand);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.header-right :deep(.ant-btn-primary:hover) {
  background: var(--gradient-brand-subtle);
  box-shadow: var(--shadow-brand-hover);
  transform: translateY(-2px);
}

/* 用户头像样式 */
.header-right :deep(.ant-avatar) {
  border: 2px solid white;
  box-shadow: var(--shadow-sm);
}

/* 模态框样式优化 */
:deep(.ant-modal-header) {
  border-bottom: 1px solid var(--color-gray-100);
  padding: var(--spacing-6);
}

:deep(.ant-modal-title) {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

:deep(.ant-modal-body) {
  padding: var(--spacing-6);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-header {
    padding: 0 var(--spacing-4);
  }
  
  .header-content {
    height: 64px;
  }
  
  .logo-text {
    display: none;
  }
  
  .nav-menu {
    margin-left: var(--spacing-4);
  }
  
  .app-content {
    margin-top: 64px;
  }
}
</style>
