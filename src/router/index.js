import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/welcome'
  },
  {
    path: '/welcome',
    name: 'Welcome',
    component: () => import('../views/Welcome.vue'),
    meta: { title: '首页' }
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
    component: () => import('../views/vehicle/VehicleLayout.vue'),
    meta: { title: '车辆管理' },
    redirect: '/vehicle-management/monitor',
    children: [
      {
        path: 'monitor',
        name: 'VehicleMonitor',
        component: () => import('../views/vehicle/VehicleMonitor.vue'),
        meta: { title: '车辆监控' }
      },
      {
        path: 'register',
        name: 'VehicleRegister',
        component: () => import('../views/vehicle/VehicleRegister.vue'),
        meta: { title: '车辆登记' }
      }
    ]
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
        name: 'AccessControl',
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
  },
  {
    path: '/system',
    name: 'SystemManagement',
    component: () => import('../views/system/SystemLayout.vue'),
    meta: { title: '系统管理' },
    redirect: '/system/settings',
    children: [
      {
        path: 'settings',
        name: 'SystemSettings',
        component: () => import('../views/system/SystemSettings.vue'),
        meta: { title: '系统设置' }
      },
      {
        path: 'users',
        name: 'SystemUsers',
        component: () => import('../views/system/SystemUsers.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'roles',
        name: 'SystemRoles',
        component: () => import('../views/system/SystemRoles.vue'),
        meta: { title: '角色权限' }
      },
      {
        path: 'logs',
        name: 'SystemLogs',
        component: () => import('../views/system/SystemLogs.vue'),
        meta: { title: '系统日志' }
      }
    ]
  },
  // 404页面路由
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('../views/error/404.vue'),
    meta: { title: '页面未找到' }
  },
  // 未匹配路由重定向到404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory('/video-management-system/'),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 更新页面标题
  document.title = to.meta.title 
    ? `${to.meta.title} - 校园安全管理系统` 
    : '校园安全管理系统'
  
  // 处理基础路径
  const base = '/video-management-system'
  if (to.path.startsWith(base)) {
    const path = to.path.slice(base.length) || '/'
    next({ path, replace: true })
    return
  }
  next()
})

export default router 