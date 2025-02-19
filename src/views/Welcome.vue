<template>
  <div class="welcome">
    <el-row :gutter="20">
      <!-- 系统概览 -->
      <el-col :span="24">
        <el-card class="overview-card">
          <div class="welcome-header">
            <div class="welcome-info">
              <h2>欢迎使用校园安全管理系统</h2>
              <p class="welcome-time">{{ currentTime }}</p>
              <p class="welcome-message">{{ welcomeMessage }}</p>
            </div>
            <div class="weather-info">
              <el-icon><Sunny /></el-icon>
              <span>{{ weather.temperature }}°C</span>
              <span>{{ weather.description }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 数据统计 -->
      <el-col :span="24" style="margin-top: 20px;">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon" style="background-color: #409EFF;">
                  <el-icon><Van /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.vehicleCount }}</div>
                  <div class="stat-label">在场车辆</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon" style="background-color: #67C23A;">
                  <el-icon><User /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.visitorCount }}</div>
                  <div class="stat-label">今日访客</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon" style="background-color: #E6A23C;">
                  <el-icon><Bell /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.alarmCount }}</div>
                  <div class="stat-label">告警数量</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon" style="background-color: #F56C6C;">
                  <el-icon><Lock /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.doorCount }}</div>
                  <div class="stat-label">门禁设备</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>

      <!-- 快捷入口 -->
      <el-col :span="24" style="margin-top: 20px;">
        <el-card class="shortcut-card">
          <template #header>
            <div class="card-header">
              <span class="title">快捷入口</span>
            </div>
          </template>
          <div class="shortcut-list">
            <div class="shortcut-item" v-for="item in shortcuts" :key="item.path" @click="router.push(item.path)">
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.name }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 系统公告 -->
      <el-col :span="12" style="margin-top: 20px;">
        <el-card class="notice-card">
          <template #header>
            <div class="card-header">
              <span class="title">系统公告</span>
              <el-button text>更多</el-button>
            </div>
          </template>
          <div class="notice-list">
            <div v-for="notice in notices" :key="notice.id" class="notice-item">
              <div class="notice-title">
                <el-tag size="small" :type="notice.type">{{ notice.tag }}</el-tag>
                <span>{{ notice.title }}</span>
              </div>
              <span class="notice-time">{{ notice.time }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 最近活动 -->
      <el-col :span="12" style="margin-top: 20px;">
        <el-card class="activity-card">
          <template #header>
            <div class="card-header">
              <span class="title">最近活动</span>
              <el-button text>更多</el-button>
            </div>
          </template>
          <div class="activity-list">
            <el-timeline>
              <el-timeline-item
                v-for="activity in activities"
                :key="activity.id"
                :type="activity.type"
                :timestamp="activity.time"
                :size="'large'"
              >
                {{ activity.content }}
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Sunny, Van, User, Bell, Lock, VideoCamera, Setting, Key } from '@element-plus/icons-vue'

const router = useRouter()
const currentTime = ref('')
const timer = ref(null)

// 欢迎语
const welcomeMessage = ref('')
const updateWelcomeMessage = () => {
  const hour = new Date().getHours()
  if (hour < 6) {
    welcomeMessage.value = '夜深了，请注意休息'
  } else if (hour < 9) {
    welcomeMessage.value = '早上好，祝您开启愉快的一天'
  } else if (hour < 12) {
    welcomeMessage.value = '上午好，工作顺利'
  } else if (hour < 14) {
    welcomeMessage.value = '中午好，请适当休息'
  } else if (hour < 18) {
    welcomeMessage.value = '下午好，请保持精神'
  } else if (hour < 22) {
    welcomeMessage.value = '晚上好，请总结今日工作'
  } else {
    welcomeMessage.value = '夜深了，请注意休息'
  }
}

// 天气信息
const weather = ref({
  temperature: 26,
  description: '晴朗'
})

// 统计数据
const stats = ref({
  vehicleCount: 128,
  visitorCount: 356,
  alarmCount: 3,
  doorCount: 24
})

// 快捷入口
const shortcuts = [
  { name: '视频监控', path: '/video-monitor', icon: 'VideoCamera' },
  { name: '车辆监控', path: '/vehicle-management/monitor', icon: 'Van' },
  { name: '门禁控制', path: '/access-control/control', icon: 'Lock' },
  { name: '系统设置', path: '/system/settings', icon: 'Setting' }
]

// 系统公告
const notices = [
  { id: 1, title: '系统将于本周日凌晨3点进行例行维护', time: '2024-01-20', type: 'warning', tag: '维护' },
  { id: 2, title: '新版本功能更新说明', time: '2024-01-19', type: 'success', tag: '更新' },
  { id: 3, title: '关于加强校园安全管理的通知', time: '2024-01-18', type: 'info', tag: '通知' },
  { id: 4, title: '请及时处理系统告警信息', time: '2024-01-17', type: 'danger', tag: '提醒' }
]

// 最近活动
const activities = [
  { id: 1, content: '张三登录了系统', time: '10分钟前', type: 'primary' },
  { id: 2, content: '新增了3个门禁设备', time: '30分钟前', type: 'success' },
  { id: 3, content: '处理了2条告警信息', time: '1小时前', type: 'warning' },
  { id: 4, content: '更新了系统配置', time: '2小时前', type: 'info' }
]

onMounted(() => {
  updateWelcomeMessage()
  // 更新当前时间
  const updateTime = () => {
    const now = new Date()
    currentTime.value = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }
  updateTime()
  timer.value = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style scoped>
.welcome {
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  background-color: var(--el-bg-color-page);
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.welcome-info h2 {
  margin: 0;
  font-size: 24px;
  color: var(--el-text-color-primary);
}

.welcome-time {
  margin: 10px 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.welcome-message {
  margin: 0;
  color: var(--el-text-color-regular);
  font-size: 16px;
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  color: var(--el-text-color-regular);
}

.stat-card {
  height: 100px;
}

.stat-content {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 20px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.shortcut-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
}

.shortcut-item {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  background-color: var(--el-bg-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid var(--el-border-color-lighter);
}

.shortcut-item:hover {
  background-color: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
  transform: translateY(-2px);
}

.shortcut-item .el-icon {
  font-size: 32px;
  color: var(--el-color-primary);
}

.shortcut-item span {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.title {
  font-size: 16px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.notice-list {
  padding: 0 20px;
}

.notice-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.notice-item:last-child {
  border-bottom: none;
}

.notice-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notice-time {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.activity-list {
  padding: 0 20px;
}

:deep(.el-timeline-item__node) {
  background-color: var(--el-color-primary);
}

:deep(.el-timeline-item__content) {
  color: var(--el-text-color-regular);
}

:deep(.el-timeline-item__timestamp) {
  color: var(--el-text-color-secondary);
}
</style> 