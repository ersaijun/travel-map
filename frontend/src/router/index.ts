import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '中国5A景区全揽' }
  },
  {
    path: '/spot/:id',
    name: 'SpotDetail',
    component: () => import('@/views/SpotDetail.vue'),
    meta: { title: '景区详情' }
  },
  {
    path: '/plan',
    name: 'PlanCreate',
    component: () => import('@/views/PlanCreate.vue'),
    meta: { title: '创建行程' }
  },
  {
    path: '/user',
    name: 'UserCenter',
    component: () => import('@/views/UserCenter.vue'),
    meta: { title: '个人中心' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = (to.meta.title as string) || '中国5A景区全揽'
  next()
})

export default router
