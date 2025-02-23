<template>
  <div class="video-monitor">
    <!-- 左侧监控点位列表 -->
    <div class="left-panel">
      <div class="monitor-list">
        <div class="list-header">
          <div class="header-title">
            <el-icon><VideoCamera /></el-icon>
            <span>监控点位</span>
          </div>
          <el-input
            v-model="searchQuery"
            placeholder="搜索监控点"
            prefix-icon="Search"
            clearable
            size="small"
          />
        </div>
        <div class="list-content">
          <div 
            v-for="camera in filteredCameraList" 
            :key="camera.id"
            class="camera-item"
            :class="{ active: currentCamera?.id === camera.id }"
            @click="selectCamera(camera)"
          >
            <div class="camera-item-left">
              <el-icon><VideoCamera /></el-icon>
              <span class="camera-name">{{ camera.label }}</span>
            </div>
            <div class="status-tag" :class="camera.status">
              {{ camera.status === 'online' ? '在线' : '离线' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧监控画面 -->
    <div class="right-panel">
      <!-- 顶部工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <div class="time-display">
            <div class="current-time">{{ currentTime }}</div>
            <div class="current-date">{{ currentDate }}</div>
          </div>
          <el-button-group>
            <el-button 
              :type="layoutMode === '1' ? 'primary' : ''" 
              @click="switchLayout('1')"
            >
              <el-icon><Monitor /></el-icon>单屏
            </el-button>
            <el-button 
              :type="layoutMode === '4' ? 'primary' : ''" 
              @click="switchLayout('4')"
            >
              <el-icon><Grid /></el-icon>四分屏
            </el-button>
            <el-button 
              :type="layoutMode === '9' ? 'primary' : ''" 
              @click="switchLayout('9')"
            >
              <el-icon><Grid /></el-icon>九分屏
            </el-button>
          </el-button-group>
        </div>
        <div class="toolbar-right">
          <el-button-group>
            <el-button 
              type="primary" 
              :loading="isCapturing"
              @click="handleSnapshot"
            >
              <el-icon><Camera /></el-icon>抓拍
            </el-button>
            <el-button 
              :type="isRecording ? 'danger' : 'primary'"
              @click="handleRecord"
            >
              <el-icon><VideoCamera /></el-icon>
              {{ isRecording ? '停止录制' : '开始录制' }}
            </el-button>
          </el-button-group>
        </div>
      </div>

      <!-- 监控画面网格 -->
      <div class="video-grid" :data-layout="layoutMode">
        <div 
          v-for="(camera, index) in displayCameras" 
          :key="camera.id" 
          class="video-item"
          :class="{ 'is-active': currentCamera?.id === camera.id }"
          @click="selectCamera(camera)"
        >
          <el-image 
            :src="camera.imageUrl"
            fit="cover"
            :preview-src-list="[camera.imageUrl]"
          >
            <template #error>
              <div class="image-error">
                <el-icon><VideoCamera /></el-icon>
                <span>画面未连接</span>
              </div>
            </template>
          </el-image>
          <!-- 监控画面顶部信息 -->
          <div class="camera-overlay camera-header">
            <span class="real-time-tag">实时监控</span>
            <span class="timestamp">{{ currentTime }}</span>
          </div>
          <!-- 监控画面底部信息 -->
          <div class="camera-overlay camera-footer">
            <div class="camera-details">
              <span class="monitor-name">{{ camera.label }}</span>
              <span class="camera-id">设备编号：Camera_0{{ camera.id }}</span>
            </div>
            <div class="camera-status" :class="camera.status">
              <span class="status-dot"></span>
              <span>{{ camera.status === 'online' ? '在线' : '离线' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部控制面板 -->
      <div class="control-panel">
        <div class="panel-title">云台控制</div>
        <div class="control-buttons">
          <el-button-group class="direction-group">
            <el-button 
              :icon="ArrowUp" 
              circle 
              :disabled="!currentCamera || currentCamera.status === 'offline'"
              @click="handlePTZControl('up')" 
            />
            <el-button 
              :icon="ArrowDown" 
              circle 
              :disabled="!currentCamera || currentCamera.status === 'offline'"
              @click="handlePTZControl('down')" 
            />
            <el-button 
              :icon="ArrowLeft" 
              circle 
              :disabled="!currentCamera || currentCamera.status === 'offline'"
              @click="handlePTZControl('left')" 
            />
            <el-button 
              :icon="ArrowRight" 
              circle 
              :disabled="!currentCamera || currentCamera.status === 'offline'"
              @click="handlePTZControl('right')" 
            />
          </el-button-group>
          <el-button-group class="zoom-group">
            <el-button 
              :icon="ZoomIn" 
              circle 
              :disabled="!currentCamera || currentCamera.status === 'offline'"
              @click="handlePTZControl('zoomIn')" 
            />
            <el-button 
              :icon="ZoomOut" 
              circle 
              :disabled="!currentCamera || currentCamera.status === 'offline'"
              @click="handlePTZControl('zoomOut')" 
            />
          </el-button-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  Search, Monitor, Grid, VideoPlay, Camera,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  ZoomIn, ZoomOut
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 搜索和布局
const searchQuery = ref('')
const layoutMode = ref('4')
const currentCamera = ref(null)
const isCapturing = ref(false)
const isRecording = ref(false)

// 时间相关
const currentTime = ref('')
const currentDate = ref('')
let timeInterval = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long'
  })
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

// 摄像头数据
const cameras = ref([
  {
    id: 1,
    label: '楼道检测点',
    location: '正门入口',
    status: 'online',
    imageUrl: new URL('../assets/images/monitor/gate.png', import.meta.url).href
  },
  {
    id: 2,
    label: '停车场监测点',
    location: '教学楼一层大厅',
    status: 'online',
    imageUrl: new URL('../assets/images/monitor/building.png', import.meta.url).href
  },
  {
    id: 3,
    label: '男生宿舍监控点',
    location: '操场北侧看台',
    status: 'online',
    imageUrl: new URL('../assets/images/monitor/image.png', import.meta.url).href
  },
  {
    id: 4,
    label: '操场监控点',
    location: '图书馆入口',
    status: 'online',
    imageUrl: new URL('../assets/images/monitor/222.png', import.meta.url).href
  },
  {
    id: 5,
    label: '食堂监控点',
    location: '食堂一楼大厅',
    status: 'online',
    imageUrl: new URL('../assets/images/monitor/canteen.jpg', import.meta.url).href
  },
  {
    id: 6,
    label: '宿舍楼监控点',
    location: '宿舍楼大门',
    status: 'offline',
    imageUrl: new URL('../assets/images/monitor/dormitory.jpg', import.meta.url).href
  },
  {
    id: 7,
    label: '体育馆监控点',
    location: '体育馆入口',
    status: 'online',
    imageUrl: new URL('../assets/images/monitor/gym.jpg', import.meta.url).href
  },
  {
    id: 8,
    label: '实验室监控点',
    location: '实验室一层',
    status: 'online',
    imageUrl: new URL('../assets/images/monitor/lab.jpg', import.meta.url).href
  },
  {
    id: 9,
    label: '停车场监控点',
    location: '停车场入口',
    status: 'online',
    imageUrl: new URL('../assets/images/monitor/parking.jpg', import.meta.url).href
  },
  {
    id: 10,
    label: '运动场监控点',
    location: '运动场南侧',
    status: 'online',
    imageUrl: new URL('../assets/images/monitor/sports.jpg', import.meta.url).href
  },
  {
    id: 10,
    label: '教学楼检测点',
    location: '运动场南侧',
    status: 'online',
    imageUrl: new URL('../assets/images/monitor/sports.jpg', import.meta.url).href
  },
  {
    id: 11,
    label: '男生宿舍楼监控点',
    location: '运动场南侧',
    status: 'online',
    imageUrl: new URL('../assets/images/monitor/sports.jpg', import.meta.url).href
  },
  {
    id: 12,
    label: '女生宿舍楼监控点',
    location: '运动场南侧',
    status: 'online',
    imageUrl: new URL('../assets/images/monitor/sports.jpg', import.meta.url).href
  },
  {
    id: 13,
    label: '运动场监控点',
    location: '运动场南侧',
    status: 'online',
    imageUrl: new URL('../assets/images/monitor/sports.jpg', import.meta.url).href
  },
  {
    id: 14,
    label: '大门监控点',
    location: '运动场南侧',
    status: 'online',
    imageUrl: new URL('../assets/images/monitor/sports.jpg', import.meta.url).href
  }
])

// 计算属性
const filteredCameraList = computed(() => {
  if (!searchQuery.value) return cameras.value
  const query = searchQuery.value.toLowerCase()
  return cameras.value.filter(camera => 
    camera.label.toLowerCase().includes(query) ||
    camera.location.toLowerCase().includes(query)
  )
})

const displayCameras = computed(() => {
  const count = parseInt(layoutMode.value)
  if (layoutMode.value === '1' && currentCamera.value) {
    return [currentCamera.value]
  }
  return cameras.value.slice(0, count)
})

// 方法
const selectCamera = (camera) => {
  currentCamera.value = camera
  if (layoutMode.value !== '1') {
    layoutMode.value = '1'
  }
}

const switchLayout = (mode) => {
  layoutMode.value = mode
  if (mode !== '1') {
    currentCamera.value = null
  }
}

const handleSnapshot = async () => {
  if (!currentCamera.value) {
    ElMessage.warning('请先选择一个监控点')
    return
  }
  
  isCapturing.value = true
  try {
    // 模拟抓拍操作
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('抓拍成功')
  } catch (error) {
    ElMessage.error('抓拍失败')
  } finally {
    isCapturing.value = false
  }
}

const handleRecord = () => {
  if (!currentCamera.value) {
    ElMessage.warning('请先选择一个监控点')
    return
  }
  
  isRecording.value = !isRecording.value
  ElMessage.success(isRecording.value ? '开始录制' : '停止录制')
}

const handlePTZControl = (direction) => {
  if (!currentCamera.value) {
    ElMessage.warning('请先选择一个监控点')
    return
  }
  
  ElMessage.success(`云台控制: ${direction}`)
}
</script>

<style scoped>
.video-monitor {
  height: 100vh;
  display: flex;
  background-color: #f0f2f5;
}

.left-panel {
  width: 280px;
  padding: 16px;
  background: #fff;
  border-right: 1px solid #e0e0e0;
}

.right-panel {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.monitor-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.list-header {
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
}

.list-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.camera-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  margin: 4px 0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.camera-item:hover {
  background: #f5f7fa;
}

.camera-item.active {
  background: #e6f6ff;
  border-right: 2px solid #1890ff;
}

.camera-item-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.camera-name {
  font-size: 14px;
}

.status-tag {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.status-tag.online {
  background: #e6f6ff;
  color: #1890ff;
}

.status-tag.offline {
  background: #fff1f0;
  color: #f5222d;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.time-display {
  padding: 8px 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.current-time {
  font-size: 20px;
  font-weight: bold;
  color: #1890ff;
}

.current-date {
  font-size: 12px;
  color: #666;
}

.video-grid {
  flex: 1;
  display: grid;
  gap: 16px;
  background: #fff;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.video-grid[data-layout="1"] {
  grid-template-columns: 1fr;
}

.video-grid[data-layout="4"] {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.video-grid[data-layout="9"] {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
}

.video-item {
  position: relative;
  background: #000;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  aspect-ratio: 16/9;
}

.video-item:hover {
  transform: scale(1.01);
}

.video-item.is-active {
  box-shadow: 0 0 0 2px #1890ff;
}

.camera-overlay {
  position: absolute;
  left: 0;
  right: 0;
  padding: 8px 12px;
  color: #fff;
  font-size: 14px;
  z-index: 2;
}

.camera-header {
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent);
}

.camera-footer {
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
}

.real-time-tag {
  background-color: rgba(40, 167, 69, 0.8);
  padding: 2px 8px;
  border-radius: 2px;
  font-size: 12px;
}

.timestamp {
  font-family: monospace;
  font-size: 14px;
}

.camera-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.monitor-name {
  font-size: 14px;
  font-weight: 500;
}

.camera-id,
.resolution {
  font-size: 12px;
  opacity: 0.8;
}

.camera-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}

.camera-status.online {
  color: #52c41a;
}

.camera-status.offline {
  color: #ff4d4f;
}

.control-panel {
  padding: 16px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.panel-title {
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 600;
}

.control-buttons {
  display: flex;
  gap: 16px;
}

.el-image {
  width: 100%;
  height: 100%;
}

.image-error {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
  background: #f5f7fa;
}

.image-error .el-icon {
  font-size: 32px;
  margin-bottom: 8px;
}
</style> 