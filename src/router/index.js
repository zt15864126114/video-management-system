import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/video-monitor'
  },
  {
    path: '/video-monitor',
    name: 'VideoMonitor',
    component: () => import('../views/VideoMonitor.vue'),
    meta: { title: '视频监控' }
  },
  {
    path: '/vehicle-management',
    name: 'VehicleManagement',
    component: () => import('../views/VehicleManagement.vue'),
    meta: { title: '车辆管理' }
  },
  {
    path: '/access-control',
    name: 'AccessControl',
    component: () => import('../views/AccessControl.vue'),
    meta: { title: '门禁管理' }
  },
  {
    path: '/alarm-management',
    name: 'AlarmManagement',
    component: () => import('../views/AlarmManagement.vue'),
    meta: { title: '报警管理' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 