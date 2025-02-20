<template>
  <div class="welcome">
    <!-- 顶部欢迎区域 -->
    <el-card class="welcome-card">
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

    <!-- 数据概览 -->
    <div class="overview-cards">
      <el-card v-for="item in overviewData" :key="item.title" class="overview-item">
        <div class="overview-icon" :style="{ backgroundColor: item.color }">
          <el-icon><component :is="item.icon" /></el-icon>
        </div>
        <div class="overview-info">
          <div class="overview-title">{{ item.title }}</div>
          <div class="overview-value">{{ item.value }}</div>
          <div class="overview-trend" :class="{ 'up': item.trend > 0, 'down': item.trend < 0 }">
            {{ item.trend > 0 ? '+' : '' }}{{ item.trend }}%
          </div>
        </div>
      </el-card>
    </div>

    <!-- 主要内容区域 -->
    <el-row :gutter="20" class="main-content">
      <!-- 左侧图表 -->
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>系统访问统计</span>
              <el-radio-group v-model="chartType" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="chartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 右侧通知 -->
      <el-col :span="8">
        <el-card class="notice-card">
          <template #header>
            <div class="card-header">
              <span>系统公告</span>
              <el-button type="primary" link>查看全部</el-button>
            </div>
          </template>
          <div class="notice-list">
            <div v-for="notice in notices" :key="notice.id" class="notice-item">
              <div class="notice-title">
                <el-tag :type="notice.type" size="small">{{ notice.tag }}</el-tag>
                <span>{{ notice.title }}</span>
              </div>
              <span class="notice-time">{{ notice.time }}</span>
            </div>
          </div>
        </el-card>

        <el-card class="quick-nav-card">
          <template #header>
            <div class="card-header">
              <span>快捷导航</span>
            </div>
          </template>
          <div class="quick-nav-grid">
            <div v-for="nav in quickNavs" :key="nav.title" class="quick-nav-item" @click="handleQuickNav(nav)">
              <el-icon><component :is="nav.icon" /></el-icon>
              <span>{{ nav.title }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { 
  Sunny, VideoCamera, Van, User, Bell, Lock, 
  Setting, Key, Warning, Message 
} from '@element-plus/icons-vue'

const router = useRouter()
const chartRef = ref(null)
let chart = null

// 时间和欢迎语
const currentTime = ref('')
const welcomeMessage = ref('')
const updateTime = () => {
  const now = new Date()
  const hour = now.getHours()
  currentTime.value = now.toLocaleString()
  welcomeMessage.value = hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好'
}
let timer = null

// 天气信息
const weather = ref({
  temperature: 26,
  description: '晴朗'
})

// 概览数据
const overviewData = ref([
  { 
    title: '监控设备',
    value: '324',
    trend: 12,
    icon: 'VideoCamera',
    color: '#409EFF'
  },
  { 
    title: '在校车辆',
    value: '156',
    trend: 8,
    icon: 'Van',
    color: '#67C23A'
  },
  { 
    title: '今日访客',
    value: '1,203',
    trend: 15,
    icon: 'User',
    color: '#E6A23C'
  },
  { 
    title: '报警事件',
    value: '12',
    trend: -5,
    icon: 'Bell',
    color: '#F56C6C'
  }
])

// 系统公告
const notices = ref([
  {
    id: 1,
    title: '系统升级通知',
    tag: '通知',
    type: 'info',
    time: '10分钟前'
  },
  {
    id: 2,
    title: '新增车辆识别功能',
    tag: '更新',
    type: 'success',
    time: '2小时前'
  },
  {
    id: 3,
    title: '安全隐患排查',
    tag: '重要',
    type: 'warning',
    time: '1天前'
  }
])

// 快捷导航
const quickNavs = [
  { title: '视频监控', icon: 'VideoCamera', path: '/video-monitor' },
  { title: '车辆管理', icon: 'Van', path: '/vehicle-management' },
  { title: '门禁控制', icon: 'Lock', path: '/access-control' },
  { title: '系统设置', icon: 'Setting', path: '/system/settings' }
]

// 图表相关
const chartType = ref('week')
const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '访问量',
        type: 'line',
        smooth: true,
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64,158,255,0.3)' },
            { offset: 1, color: 'rgba(64,158,255,0.1)' }
          ])
        }
      }
    ]
  }
  chart.setOption(option)
}

// 快捷导航处理
const handleQuickNav = (nav) => {
  router.push(nav.path)
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  initChart()
  window.addEventListener('resize', () => chart?.resize())
})

onUnmounted(() => {
  clearInterval(timer)
  chart?.dispose()
  window.removeEventListener('resize', () => chart?.resize())
})
</script>

<style scoped>
.welcome {
  padding: 20px;
  background: var(--el-bg-color-page);
  min-height: 100%;
}

.welcome-card {
  margin-bottom: 20px;
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-info h2 {
  margin: 0;
  font-size: 24px;
  color: var(--el-text-color-primary);
}

.welcome-time {
  margin: 8px 0;
  color: var(--el-text-color-secondary);
}

.welcome-message {
  color: var(--el-text-color-regular);
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-regular);
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.overview-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.overview-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.overview-info {
  flex: 1;
}

.overview-title {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.overview-value {
  font-size: 24px;
  font-weight: bold;
  margin: 4px 0;
}

.overview-trend {
  font-size: 12px;
}

.overview-trend.up {
  color: #67C23A;
}

.overview-trend.down {
  color: #F56C6C;
}

.main-content {
  margin-top: 20px;
}

.chart-container {
  height: 400px;
}

.notice-card {
  margin-bottom: 20px;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.notice-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notice-time {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.quick-nav-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.quick-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: var(--el-bg-color-page);
}

.quick-nav-item:hover {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.quick-nav-item .el-icon {
  font-size: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 