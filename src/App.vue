<template>
  <el-container class="app-container">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="aside">
      <div class="logo" :class="{ 'collapsed': isCollapse }">
        <img src="./assets/logo.png" alt="logo" />
        <span v-show="!isCollapse">校园安全管理平台</span>
      </div>
      <el-menu
        :router="true"
        :collapse="isCollapse"
        default-active="/video-monitor"
        class="el-menu-vertical"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#409EFF"
        :collapse-transition="false"
      >
        <el-menu-item index="/video-monitor">
          <el-icon><VideoCamera /></el-icon>
          <template #title>视频监控</template>
        </el-menu-item>
        <el-menu-item index="/vehicle-management">
          <el-icon><Van /></el-icon>
          <template #title>车辆管理</template>
        </el-menu-item>
        <el-sub-menu index="/access-control">
          <template #title>
            <el-icon><Lock /></el-icon>
            <span>门禁管理</span>
          </template>
          <el-menu-item index="/access-control/monitor">
            <el-icon><VideoCamera /></el-icon>
            <template #title>门禁监控</template>
          </el-menu-item>
          <el-menu-item index="/access-control/control">
            <el-icon><Setting /></el-icon>
            <template #title>门禁控制</template>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/alarm-management">
          <el-icon><AlarmClock /></el-icon>
          <template #title>报警管理</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container class="main-container">
      <el-header class="header" height="56px">
        <div class="header-left">
          <el-icon 
            class="trigger" 
            :class="{ 'is-collapsed': isCollapse }"
            @click="toggleCollapse"
          >
            <Fold v-if="isCollapse" />
            <Expand v-else />
          </el-icon>
          <breadcrumb />
        </div>
        <div class="header-right">
          <el-badge :value="alarmCount" class="alarm-badge" type="danger">
            <el-button type="danger" :icon="Bell" plain>报警信息</el-button>
          </el-badge>
          <el-dropdown trigger="click">
            <span class="user-info">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="username">管理员</span>
              <el-icon class="el-icon--right"><CaretBottom /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-icon><User /></el-icon>个人信息
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-icon><Edit /></el-icon>修改密码
                </el-dropdown-item>
                <el-dropdown-item divided>
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { 
  VideoCamera, Van, Lock, AlarmClock, Bell, 
  Expand, Fold, CaretBottom, User, Edit, SwitchButton, Setting 
} from '@element-plus/icons-vue'
import Breadcrumb from './components/Breadcrumb.vue'

const alarmCount = ref(2)
const isCollapse = ref(false)

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: #1f1f1f;
}

#app {
  height: 100%;
}

.app-container {
  height: 100%;
}

.aside {
  background-color: #001529;
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1) 0s;
  overflow: hidden;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 10;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.logo {
  height: 56px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  background: linear-gradient(to right, #1a237e, #0d47a1);
  color: #fff;
  overflow: hidden;
  transition: all 0.3s;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.logo.collapsed {
  padding: 0 20px;
  justify-content: center;
}

.logo img {
  width: 32px;
  height: 32px;
  margin-right: 16px;
  transition: all 0.3s;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.logo span {
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  opacity: 1;
  transition: all 0.3s;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  letter-spacing: 0.5px;
}

.el-menu-vertical {
  border-right: none;
  padding: 12px;
  background: #001529;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 220px;
}

.el-menu--collapse {
  width: 64px;
  padding: 12px 8px;
}

.el-menu-item {
  margin: 8px 0;
  height: 44px;
  line-height: 44px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.65);
}

.el-menu-item.is-active {
  background: rgba(24, 144, 255, 0.2) !important;
  color: #fff !important;
}

.el-menu-item:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  transform: translateX(4px);
  color: #fff;
}

.el-menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: #1890ff;
  opacity: 0;
  transition: opacity 0.3s;
}

.el-menu-item .el-icon {
  font-size: 18px;
  margin-right: 12px;
  transition: all 0.3s;
  opacity: 1;
  color: inherit;
}

.el-menu-item span {
  font-size: 14px;
  font-weight: 500;
  color: inherit;
  transition: opacity 0.3s;
}

/* 折叠时的图标样式 */
.el-menu--collapse .el-menu-item {
  justify-content: center;
  padding: 0 !important;
  margin: 8px 0;
}

.el-menu--collapse .el-menu-item .el-icon {
  margin: 0;
  font-size: 20px;
  color: inherit;
}

.main-container {
  background: #f0f2f5;
}

.header {
  background: #fff;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0,21,41,.05);
  height: 56px;
  position: relative;
  z-index: 9;
}

.header-left {
  display: flex;
  align-items: center;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  margin-right: 20px;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s;
  color: #666;
}

.trigger:hover {
  background: rgba(0,0,0,.025);
  color: #409EFF;
}

.trigger.is-collapsed {
  transform: rotate(180deg);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.user-info:hover {
  background: rgba(0,0,0,.025);
}

.username {
  font-size: 14px;
  color: #666;
}

.main {
  padding: 16px;
  overflow: auto;
  position: relative;
}

.main::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f0f2f5 url('./assets/bg-pattern.png') repeat;
  opacity: 0.4;
  z-index: -1;
}

.el-card {
  border: none !important;
  margin-bottom: 16px;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
  background: rgba(255,255,255,.9);
}

.el-card:hover {
  box-shadow: 0 8px 16px rgba(0,21,41,.08) !important;
  transform: translateY(-2px);
}

.el-card__header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  background: rgba(250,250,250,.8);
  backdrop-filter: blur(5px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Element Plus 组件样式优化 */
.el-dropdown-menu__item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.el-menu-item {
  display: flex;
  align-items: center;
}

.el-menu-item .el-icon {
  font-size: 18px;
  margin-right: 10px;
}

.el-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

.alarm-badge {
  margin-right: 8px;
}

.alarm-badge .el-button {
  background: linear-gradient(45deg, #ff4d4f 0%, #f5222d 100%);
  border: none;
  color: #fff;
  padding: 8px 16px;
  transition: all 0.3s;
}

.alarm-badge .el-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245,34,45,.35);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #999;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.el-main > * {
  animation: fadeIn 0.3s ease-out;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.alarm-badge .el-badge__content {
  animation: pulse 2s infinite;
}

/* 阴影过渡效果 */
* {
  transition: box-shadow 0.3s ease;
}

/* 按钮悬浮效果 */
.el-button:not(.is-disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,.1);
}

/* 下拉菜单样式优化 */
.el-dropdown-menu {
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,.1);
  border-radius: 8px;
  padding: 8px;
}

.el-dropdown-menu__item {
  border-radius: 4px;
  margin: 4px 0;
}

/* 修改菜单文字颜色相关的属性 */
.el-menu {
  --el-menu-bg-color: #001529;
  --el-menu-text-color: rgba(255, 255, 255, 0.65);
  --el-menu-hover-text-color: #fff;
  --el-menu-active-color: #fff;
}

/* 弹出的子菜单样式 */
.el-menu--popup {
  background-color: #001529;
  padding: 8px;
  min-width: 120px;
}

.el-menu--popup .el-menu-item {
  margin: 4px 0;
  height: 40px;
  line-height: 40px;
  border-radius: 4px;
}

/* 子菜单样式 */
.el-menu-vertical :deep(.el-sub-menu) {
  margin: 8px 0;
}

.el-menu-vertical :deep(.el-sub-menu__title) {
  height: 44px;
  line-height: 44px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.65);
}

.el-menu-vertical :deep(.el-sub-menu__title:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #fff;
}

.el-menu-vertical :deep(.el-menu--inline) {
  background: transparent;
  padding: 4px 0 4px 16px;
}

.el-menu-vertical :deep(.el-menu--inline .el-menu-item) {
  height: 40px;
  line-height: 40px;
  padding-left: 48px !important;
}
</style>
