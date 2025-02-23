<template>
  <div class="vehicle-monitor">
    <el-row :gutter="16">
      <!-- 左侧监控列表 -->
      <el-col :span="6">
        <el-card class="monitor-list">
          <template #header>
            <div class="list-header">
              <span>监控点位</span>
              <el-input
                v-model="searchKey"
                placeholder="搜索监控点"
                prefix-icon="Search"
                clearable
              />
            </div>
          </template>
          <div class="camera-list">
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
        </el-card>
      </el-col>

      <!-- 右侧监控内容 -->
      <el-col :span="18">
        <div class="monitor-content">
          <div class="video-section">
            <div class="video-header">
              <div class="camera-info">
                <span class="title">{{ getCurrentCamera?.name }}</span>
                <span class="subtitle">{{ getCurrentCamera?.location }}</span>
              </div>
              <div class="control-buttons">
                <el-button-group>
                  <el-button type="primary" @click="handleCapture">
                    <el-icon><Camera /></el-icon>
                    抓拍
                  </el-button>
                  <el-button type="warning" @click="handleAlert">
                    <el-icon><Warning /></el-icon>
                    报警
                  </el-button>
                  <el-button @click="handleFullscreen">
                    <el-icon><FullScreen /></el-icon>
                    全屏
                  </el-button>
                </el-button-group>
              </div>
            </div>
            <div class="video-container" ref="videoContainer">
              <video-player 
                :stream="currentCamera"
                :camera-info="getCurrentCamera"
              />
            </div>
          </div>

          <!-- 识别结果 -->
          <div class="recognition-result" v-if="currentVehicle">
            <div class="plate-info">
              <span class="plate-number">{{ currentVehicle.plateNumber }}</span>
              <el-tag :type="currentVehicle.status === '正常' ? 'success' : 'warning'">
                {{ currentVehicle.status }}
              </el-tag>
              <span class="time">{{ currentVehicle.time }}</span>
            </div>
            <div class="vehicle-details">
              <div class="detail-item">
                <span class="label">类型</span>
                <span class="value">{{ currentVehicle.type }}</span>
              </div>
              <div class="detail-item">
                <span class="label">颜色</span>
                <span class="value">{{ currentVehicle.color }}</span>
              </div>
              <div class="detail-item">
                <span class="label">部门</span>
                <span class="value">{{ currentVehicle.department }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Camera, Warning, FullScreen, VideoCamera } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import VideoPlayer from '../components/VideoPlayer.vue'

const searchKey = ref('')
const currentCamera = ref('camera-1')
const videoContainer = ref(null)

// 模拟数据
const cameras = ref([
  { id: 'camera-1', name: '正门入口', location: '校园正门', status: 'online' },
  { id: 'camera-2', name: '后门入口', location: '校园后门', status: 'online' },
  { id: 'camera-3', name: '地下车库', location: 'A区地下室', status: 'offline' },
  { id: 'camera-4', name: '访客停车场', location: '西区停车场', status: 'online' }
])

const currentVehicle = ref({
  plateNumber: '京A12345',
  status: '正常',
  time: '2024-03-20 15:30:45',
  type: '小型轿车',
  color: '黑色',
  department: '教务处'
})

// 过滤摄像头列表
const filteredCameras = computed(() => {
  if (!searchKey.value) return cameras.value
  return cameras.value.filter(camera => 
    camera.name.includes(searchKey.value) || 
    camera.location.includes(searchKey.value)
  )
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
</script>

<style scoped>
.vehicle-monitor {
  display: flex;
  height: 100vh;
  background: #f0f2f5;
}

.monitor-sidebar {
  width: 280px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
}

.search-box {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.camera-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.camera-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.camera-item:hover,
.camera-item.active {
  background: #f6f6f6;
}

.camera-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.camera-text {
  display: flex;
  flex-direction: column;
}

.camera-text .name {
  font-size: 14px;
  font-weight: 500;
}

.camera-text .location {
  font-size: 12px;
  color: #999;
}

.monitor-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.video-section {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.video-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e8e8e8;
}

.camera-info {
  display: flex;
  flex-direction: column;
}

.camera-info .title {
  font-size: 16px;
  font-weight: 500;
}

.camera-info .subtitle {
  font-size: 12px;
  color: #999;
}

.video-container {
  flex: 1;
  background: #000;
}

.recognition-result {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
}

.plate-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.plate-number {
  font-size: 20px;
  font-weight: bold;
  color: #1890ff;
}

.time {
  color: #999;
  font-size: 12px;
}

.vehicle-details {
  display: flex;
  gap: 24px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item .label {
  font-size: 12px;
  color: #999;
}

.detail-item .value {
  font-size: 14px;
}
</style>
