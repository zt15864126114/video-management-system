<template>
  <div class="video-monitor">
    <div class="monitor-layout">
      <div class="left-panel">
        <el-card class="camera-list">
          <template #header>
            <div class="card-header">
              <span>监控点位列表</span>
              <el-input
                v-model="searchQuery"
                placeholder="搜索监控点"
                prefix-icon="Search"
                clearable
                size="small"
              />
            </div>
          </template>
          <el-tree
            :data="filteredCameraList"
            :props="defaultProps"
            @node-click="handleNodeClick"
            :highlight-current="true"
            :expand-on-click-node="false"
            :default-expanded-keys="['1', '2', '3']"
          />
        </el-card>
      </div>

      <div class="main-panel">
        <div class="video-container">
          <div class="toolbar">
            <div class="toolbar-left">
              <div class="time-display">
                <div class="current-time">{{ currentTime }}</div>
                <div class="current-date">{{ currentDate }}</div>
              </div>
              <el-button-group>
                <el-button :type="layoutMode === '1' ? 'primary' : ''" @click="layoutMode = '1'">
                  <el-icon><Monitor /></el-icon>单屏
                </el-button>
                <el-button :type="layoutMode === '4' ? 'primary' : ''" @click="layoutMode = '4'">
                  <el-icon><Grid /></el-icon>四分屏
                </el-button>
                <el-button :type="layoutMode === '9' ? 'primary' : ''" @click="layoutMode = '9'">
                  <el-icon><Grid /></el-icon>九分屏
                </el-button>
              </el-button-group>
            </div>
            <div class="toolbar-right">
              <el-button-group>
                <el-button :icon="ArrowUp" circle @click="handlePTZControl('up')" />
                <el-button :icon="ArrowDown" circle @click="handlePTZControl('down')" />
                <el-button :icon="ArrowLeft" circle @click="handlePTZControl('left')" />
                <el-button :icon="ArrowRight" circle @click="handlePTZControl('right')" />
              </el-button-group>
              <el-button-group>
                <el-button :icon="ZoomIn" circle @click="handlePTZControl('zoomIn')" />
                <el-button :icon="ZoomOut" circle @click="handlePTZControl('zoomOut')" />
              </el-button-group>
              <el-button type="primary" plain @click="handleSnapshot">
                <el-icon><Camera /></el-icon>抓拍
              </el-button>
              <el-button type="danger" plain @click="handleRecord">
                <el-icon><VideoCamera /></el-icon>录制
              </el-button>
            </div>
          </div>

          <div class="video-grid" :data-layout="layoutMode">
            <div 
              v-for="camera in displayCameras" 
              :key="camera.id" 
              class="video-item"
              :class="{ 'is-active': currentCamera?.id === camera.id }"
              @click="selectCamera(camera)"
            >
              <video-player 
                :stream="camera.stream"
                :camera-info="camera"
                @error="handleVideoError"
              />
              <div class="camera-info">
                <div class="camera-info-left">
                  <span class="camera-name">{{ camera.label }}</span>
                  <span class="camera-time">{{ currentTime }}</span>
                </div>
                <el-tag size="small" :type="camera.status === 'online' ? 'success' : 'danger'">
                  {{ camera.status === 'online' ? '在线' : '离线' }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  Search, Monitor, Grid, Camera, VideoCamera,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  ZoomIn, ZoomOut
} from '@element-plus/icons-vue'
import VideoPlayer from '../components/VideoPlayer.vue'
import { ElMessage } from 'element-plus'

const searchQuery = ref('')
const layoutMode = ref('4')
const currentCamera = ref(null)

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

const cameraList = ref([
  {
    id: '1',
    label: '教学区',
    children: [
      { id: 'camera-1', label: '一号教学楼大门', stream: 'stream-1', status: 'online' },
      { id: 'camera-2', label: '二号教学楼大门', stream: 'stream-2', status: 'online' },
      { id: 'camera-3', label: '教学楼走廊', stream: 'stream-3', status: 'online' },
      { id: 'camera-4', label: '图书馆门口', stream: 'stream-4', status: 'online' }
    ]
  },
  {
    id: '2',
    label: '生活区',
    children: [
      { id: 'camera-5', label: '一号宿舍楼', stream: 'stream-5', status: 'online' },
      { id: 'camera-6', label: '二号宿舍楼', stream: 'stream-6', status: 'offline' },
      { id: 'camera-7', label: '食堂大门', stream: 'stream-7', status: 'online' },
      { id: 'camera-8', label: '超市门口', stream: 'stream-8', status: 'online' }
    ]
  },
  {
    id: '3',
    label: '运动区',
    children: [
      { id: 'camera-9', label: '操场北', stream: 'stream-9', status: 'online' },
      { id: 'camera-10', label: '操场南', stream: 'stream-10', status: 'online' },
      { id: 'camera-11', label: '体育馆', stream: 'stream-11', status: 'online' },
      { id: 'camera-12', label: '游泳馆', stream: 'stream-12', status: 'offline' }
    ]
  }
])

// 获取所有摄像头
const allCameras = computed(() => {
  const cameras = []
  cameraList.value.forEach(group => {
    if (group.children) {
      cameras.push(...group.children)
    }
  })
  return cameras
})

// 根据布局模式显示摄像头
const displayCameras = computed(() => {
  const count = parseInt(layoutMode.value)
  return allCameras.value.slice(0, count)
})

// 过滤摄像头列表
const filteredCameraList = computed(() => {
  if (!searchQuery.value) return cameraList.value
  
  const query = searchQuery.value.toLowerCase()
  return cameraList.value.map(group => {
    const filteredChildren = group.children.filter(camera =>
      camera.label.toLowerCase().includes(query)
    )
    return filteredChildren.length ? {
      ...group,
      children: filteredChildren
    } : null
  }).filter(Boolean)
})

const defaultProps = {
  children: 'children',
  label: 'label'
}

const handleNodeClick = (data) => {
  if (!data.children) {
    selectCamera(data)
  }
}

const selectCamera = (camera) => {
  currentCamera.value = camera
  layoutMode.value = '1' // 切换到单屏模式
}

const handleVideoError = (error) => {
  ElMessage.error(`视频加载失败: ${error}`)
}

const handlePTZControl = (direction) => {
  if (!currentCamera.value) {
    ElMessage.warning('请先选择摄像头')
    return
  }
  console.log('PTZ控制:', direction)
  ElMessage.success(`正在${direction}`)
}

const handleSnapshot = () => {
  if (!currentCamera.value) {
    ElMessage.warning('请先选择摄像头')
    return
  }
  ElMessage.success('已抓拍当前画面')
}

const handleRecord = () => {
  if (!currentCamera.value) {
    ElMessage.warning('请先选择摄像头')
    return
  }
  ElMessage.success('开始录制视频')
}
</script>

<style scoped>
.video-monitor {
  height: calc(100vh - 90px);
  padding: 20px;
}

.monitor-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  height: 100%;
}

.left-panel {
  height: 100%;
}

.main-panel {
  height: 100%;
}

.video-container {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 4px;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 8px;
}

.video-grid {
  display: grid;
  gap: 16px;
  flex: 1;
  aspect-ratio: 16/9;
  min-height: 0;
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
}

.video-item:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.video-item.is-active {
  box-shadow: 0 0 0 2px #409EFF;
}

.camera-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.camera-info-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.camera-name {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.camera-time {
  font-size: 12px;
  opacity: 0.8;
  font-family: monospace;
}

.camera-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.camera-list :deep(.el-card__body) {
  flex: 1;
  overflow: auto;
}

.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.toolbar-right .el-button-group {
  margin-right: 8px;
}

.toolbar-right .el-button-group .el-button {
  padding: 8px;
}

.toolbar-right .el-button-group + .el-button-group {
  margin-left: 0;
}

.time-display {
  background: rgba(0, 0, 0, 0.6);
  padding: 8px 16px;
  border-radius: 4px;
  margin-right: 16px;
  color: #fff;
  font-family: monospace;
}

.current-time {
  font-size: 20px;
  font-weight: bold;
  line-height: 1.2;
}

.current-date {
  font-size: 12px;
  opacity: 0.8;
}
</style> 