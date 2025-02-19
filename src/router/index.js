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
    name: 'AccessManagement',
    component: () => import('../views/access/AccessLayout.vue'),
    meta: { title: '门禁管理' },
    redirect: '/access-control/monitor',
    children: [
      {
        path: 'monitor',
        name: 'AccessMonitor',
        component: () => import('../views/access/AccessMonitor.vue'),
        meta: { title: '门禁监控' }
      },
      {
        path: 'control',
        name: 'AccessControlSettings',
        component: () => import('../views/access/AccessControl.vue'),
        meta: { title: '门禁控制' }
      }
    ]
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