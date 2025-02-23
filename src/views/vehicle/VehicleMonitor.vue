<template>
  <div class="vehicle-monitor">
    <div class="monitor-layout">
      <!-- 左侧监控列表 -->
      <div class="camera-list">
        <div class="list-header">
          <el-input
            v-model="searchKey"
            placeholder="搜索监控点"
            prefix-icon="Search"
            clearable
            size="small"
          />
        </div>
        <div class="list-content">
          <div
            v-for="camera in filteredCameras"
            :key="camera.id"
            class="camera-item"
            :class="{ active: currentCamera === camera.id }"
            @click="switchCamera(camera)"
          >
            <div class="camera-info">
              <el-icon><VideoCamera /></el-icon>
              <div class="camera-text">
                <span class="name">{{ camera.name }}</span>
                <span class="location">{{ camera.location }}</span>
              </div>
            </div>
            <el-tag 
              size="small" 
              :type="camera.status === 'online' ? 'success' : 'danger'"
            >
              {{ camera.status === 'online' ? '在线' : '离线' }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 中间监控区域 - 简化结构 -->
      <div class="monitor-main">
        <div class="video-header">
          <div class="camera-title">
            <span class="title">{{ getCurrentCamera?.name }}</span>
            <span class="subtitle">{{ getCurrentCamera?.location }}</span>
          </div>
          <div class="control-buttons">
            <el-button-group>
              <el-button type="primary" size="small" @click="handleCapture">
                <el-icon><Camera /></el-icon>抓拍
              </el-button>
              <el-button type="warning" size="small" @click="handleAlert">
                <el-icon><Warning /></el-icon>报警
              </el-button>
              <el-button size="small" @click="handleFullscreen">
                <el-icon><FullScreen /></el-icon>全屏
              </el-button>
            </el-button-group>
          </div>
        </div>
        
        <!-- 视频区域 - 简化结构 -->
        <div class="video-wrapper">
          <video-player 
            :stream="currentCamera"
            :camera-info="getCurrentCamera"
            class="video-player"
          />
        </div>
      </div>

      <!-- 右侧信息区域 -->
      <div class="info-panel">
        <div class="panel-section">
          <div class="section-title">实时识别</div>
          <div class="vehicle-info" v-if="currentVehicle">
            <div class="plate-info">
              <span class="plate-number">{{ currentVehicle.plateNumber }}</span>
              <el-tag size="small" :type="currentVehicle.status === '正常' ? 'success' : 'warning'">
                {{ currentVehicle.status }}
              </el-tag>
            </div>
            <div class="info-table">
              <div class="info-row">
                <span class="label">类型：</span>
                <span class="value">{{ currentVehicle.type }}</span>
              </div>
              <div class="info-row">
                <span class="label">颜色：</span>
                <span class="value">{{ currentVehicle.color }}</span>
              </div>
              <div class="info-row">
                <span class="label">部门：</span>
                <span class="value">{{ currentVehicle.department }}</span>
              </div>
              <div class="info-row">
                <span class="label">时间：</span>
                <span class="value time">{{ currentVehicle.time }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <div class="section-title">今日统计</div>
          <div class="stat-grid">
            <div class="stat-item">
              <span class="number">{{ statistics.todayCount }}</span>
              <span class="label">通行总数</span>
            </div>
            <div class="stat-item">
              <span class="number">{{ statistics.currentCount }}</span>
              <span class="label">当前在场</span>
            </div>
            <div class="stat-item warning">
              <span class="number">{{ statistics.warningCount }}</span>
              <span class="label">异常记录</span>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <div class="section-title">最近记录</div>
          <div class="record-list">
            <div v-for="(record, index) in captureRecords" 
                 :key="index" 
                 class="record-item"
            >
              <div class="record-info">
                <span class="record-plate">{{ record.plateNumber }}</span>
                <span class="record-time">{{ record.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { 
  Camera, Warning, FullScreen, VideoCamera, 
  Timer, CaretTop, VideoPlay 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import VideoPlayer from '@/components/VideoPlayer.vue'
import * as echarts from 'echarts'

const searchKey = ref('')
const filterStatus = ref('')
const currentCamera = ref('camera-1')
const videoContainer = ref(null)

// 模拟数据
const cameras = ref([
  { id: 'camera-1', name: '正门入口', location: '校园正门', status: 'online' },
  { id: 'camera-2', name: '后门入口', location: '校园后门', status: 'online' },
  { id: 'camera-3', name: '地下车库', location: 'A区地下室', status: 'offline' },
  { id: 'camera-4', name: '访客停车场', location: '西区停车场', status: 'online' },
  { id: 'camera-5', name: '教学楼', location: 'B区教学楼', status: 'online' },
  { id: 'camera-6', name: '运动场', location: 'C区运动场', status: 'online' },
  { id: 'camera-7', name: '图书馆', location: 'D区图书馆', status: 'offline' },
  { id: 'camera-8', name: '停车场', location: 'E区停车场', status: 'online' }
])

// 统计数据
const statistics = ref({
  todayCount: 286,
  currentCount: 156,
  warningCount: 3
})

// 当前车辆信息
const currentVehicle = ref({
  plateNumber: '鲁HS2R45',
  status: '正常',
  time: new Date().toLocaleString(),
  type: '小型轿车',
  color: '黑色',
  department: '教务处'
})

// 添加抓拍记录数据
const captureRecords = ref([
  {
    plateNumber: '鲁HS2R45',
    time: new Date(Date.now() - 300000).toLocaleTimeString()
  },
  {
    plateNumber: '鲁H32821',
    time: new Date(Date.now() - 240000).toLocaleTimeString()
  },
  {
    plateNumber: '鲁H98789',
    time: new Date(Date.now() - 180000).toLocaleTimeString()
  },
  {
    plateNumber: '鲁H45638',
    time: new Date(Date.now() - 120000).toLocaleTimeString()
  },
  {
    plateNumber: '鲁H87654',
    time: new Date(Date.now() - 60000).toLocaleTimeString()
  },
  {
    plateNumber: '鲁H13579',
    time: new Date().toLocaleTimeString()
  }
])

// 更新检测数据结构
const detectedItems = ref([
  { 
    type: 'car',
    confidence: 0.81,
    position: { x: 30, y: 40, width: 40, height: 30 }
  },
  { 
    type: 'person',
    confidence: 0.57,
    position: { x: 10, y: 60, width: 10, height: 20 }
  }
])

// 过滤摄像头列表
const filteredCameras = computed(() => {
  let result = cameras.value
  if (searchKey.value) {
    result = result.filter(camera => 
      camera.name.includes(searchKey.value) || 
      camera.location.includes(searchKey.value)
    )
  }
  if (filterStatus.value) {
    result = result.filter(camera => camera.status === filterStatus.value)
  }
  return result
})

// 获取当前摄像头信息
const getCurrentCamera = computed(() => {
  return cameras.value.find(cam => cam.id === currentCamera.value)
})

// 切换摄像头
const switchCamera = (camera) => {
  if (camera.status === 'offline') {
    ElMessage.warning('该监控点当前离线')
    return
  }
  currentCamera.value = camera.id
}

// 处理抓拍
const handleCapture = () => {
  ElMessage.success('已抓拍并保存')
}

// 处理报警
const handleAlert = () => {
  ElMessage.warning('已发起报警')
}

// 处理全屏
const handleFullscreen = () => {
  if (videoContainer.value) {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      videoContainer.value.requestFullscreen()
    }
  }
}

// 画面分割模式
const screenMode = ref('1')

// 监控类型
const monitorType = ref('all')

// 处理回放
const handlePlayback = () => {
  ElMessage.info('正在开发中...')
}

// 处理画面点击
const handleCellClick = (index) => {
  if (screenMode.value !== '1') {
    screenMode.value = '1'
  }
}

// 分析类型
const analysisType = ref('today')
let trendChart = null

// 车辆类型分布数据
const vehicleTypes = ref([
  { name: '小型轿车', count: 156, percentage: 65, color: '#409EFF' },
  { name: 'SUV', count: 45, percentage: 20, color: '#67C23A' },
  { name: '商务车', count: 28, percentage: 12, color: '#E6A23C' },
  { name: '其他', count: 8, percentage: 3, color: '#909399' }
])

// 添加 ref
const trendChartRef = ref(null)

// 修改初始化趋势图的方法
const initTrendChart = () => {
  if (!trendChartRef.value) return
  
  trendChart = echarts.init(trendChartRef.value)
  const option = {
    grid: {
      top: '10%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
      axisLine: {
        lineStyle: {
          color: '#909399'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#909399'
        }
      }
    },
    series: [
      {
        data: [30, 45, 78, 62, 88, 95, 42],
        type: 'line',
        smooth: true,
        areaStyle: {
          opacity: 0.3
        },
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }
  trendChart.setOption(option)
}

// 监听分析类型变化
watch(analysisType, (newValue) => {
  // 根据选择的时间范围更新图表数据
  updateChartData(newValue)
})

// 更新图表数据
const updateChartData = (type) => {
  // 这里可以根据不同的时间范围请求后端数据
  // 示例数据
  const data = {
    today: [30, 45, 78, 62, 88, 95, 42],
    week: [220, 182, 191, 234, 290, 330, 310],
    month: [820, 932, 901, 934, 1290, 1330, 1320]
  }
  
  trendChart.setOption({
    series: [{
      data: data[type]
    }]
  })
}

// 修改 onMounted
onMounted(() => {
  // 确保 DOM 已经渲染完成
  nextTick(() => {
    initTrendChart()
  })
  
  // 监听窗口大小变化，重绘图表
  window.addEventListener('resize', () => {
    trendChart?.resize()
  })
})

// 添加 onUnmounted 清理
onUnmounted(() => {
  // 销毁图表实例
  if (trendChart) {
    trendChart.dispose()
  }
  // 移除事件监听
  window.removeEventListener('resize', () => {
    trendChart?.resize()
  })
})
</script>

<style scoped>
.vehicle-monitor {
  height: 100vh;
  background: #f0f2f5;
}

.monitor-layout {
  height: 100%;
  display: grid;
  grid-template-columns: 220px 1fr 300px;
  background: #fff;
}

.camera-list {
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
}

.list-header {
  padding: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.list-content {
  flex: 1;
  overflow-y: auto;
}

.camera-item {
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s;
}

.camera-item:hover {
  background: #f6f6f6;
}

.camera-item.active {
  background: #e6f7ff;
}

.camera-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.camera-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.camera-text .name {
  font-size: 14px;
  color: #303133;
}

.camera-text .location {
  font-size: 12px;
  color: #909399;
}

.monitor-main {
  display: flex;
  flex-direction: column;
  background: #000;
  min-height: 0; /* 防止溢出 */
}

.video-header {
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1;
}

.camera-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.camera-title .title {
  color: #fff;
  font-size: 16px;
}

.camera-title .subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

.video-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  min-height: 0; /* 防止溢出 */
}

:deep(.video-player) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
}

.info-panel {
  border-left: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.panel-section {
  background: #fff;
  border-radius: 4px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
}

.vehicle-info {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 4px;
}

.plate-info {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.plate-number {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
}

.info-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
}

.info-row .label {
  color: #909399;
}

.info-row .value {
  color: #303133;
  font-weight: 500;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-item .number {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.stat-item .label {
  font-size: 12px;
  color: #909399;
}

.stat-item.warning .number {
  color: #E6A23C;
}

.record-list {
  padding: 0 16px;
}

.record-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.record-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.record-plate {
  font-size: 14px;
  color: #303133;
}

.record-time {
  font-size: 12px;
  color: #909399;
}
</style> 