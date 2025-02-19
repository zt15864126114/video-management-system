<template>
  <div class="vehicle-monitor">
    <!-- 统计卡片 -->
    <div class="statistics-row">
      <div v-for="stat in statsData" :key="stat.label" class="stat-card">
        <div class="stat-icon" :class="stat.type">
          <el-icon><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
          <div v-if="stat.trend" class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
            {{ Math.abs(stat.trend) }}% {{ stat.trend > 0 ? '↑' : '↓' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 监控内容 -->
    <el-row :gutter="20">
      <!-- 左侧视频监控 -->
      <el-col :span="16">
        <el-card class="monitor-card">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <el-select v-model="currentCamera" placeholder="选择监控点" class="camera-select">
                  <el-option
                    v-for="camera in cameras"
                    :key="camera.id"
                    :label="camera.name"
                    :value="camera.id"
                  />
                </el-select>
                <el-tag :type="isAnalyzing ? 'success' : 'info'" class="analysis-status">
                  {{ isAnalyzing ? '分析中' : '未分析' }}
                </el-tag>
              </div>
              <el-button-group>
                <el-button 
                  type="primary" 
                  :icon="VideoPlay"
                  @click="toggleAnalysis"
                >
                  {{ isAnalyzing ? '停止分析' : '开始分析' }}
                </el-button>
                <el-button 
                  type="warning" 
                  :icon="Camera"
                  @click="handleSnapshot"
                >抓拍</el-button>
              </el-button-group>
            </div>
          </template>
          
          <div class="video-container">
            <div class="video-player">
              <video-player ref="videoPlayer" class="video-content" />
              <div v-if="isAnalyzing" class="analysis-overlay">
                <div 
                  v-for="detection in currentDetections" 
                  :key="detection.id"
                  class="detection-box"
                  :style="detection.style"
                >
                  <div class="detection-info">
                    {{ detection.plateNumber }}
                    <el-tag size="small" :type="detection.type">{{ detection.status }}</el-tag>
                  </div>
                </div>
              </div>
            </div>
            <div class="analysis-panel">
              <div class="panel-header">
                <span>实时分析结果</span>
                <el-switch v-model="showTrajectory" active-text="显示轨迹" />
              </div>
              <div class="analysis-content">
                <div v-for="result in analysisResults" :key="result.id" class="analysis-item">
                  <el-avatar :size="40" :src="result.snapshot" />
                  <div class="result-info">
                    <div class="plate-number">{{ result.plateNumber }}</div>
                    <div class="detail-info">
                      <span>{{ result.time }}</span>
                      <el-tag size="small" :type="result.type">{{ result.status }}</el-tag>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧实时记录 -->
      <el-col :span="8">
        <el-card class="record-card">
          <template #header>
            <div class="card-header">
              <span>通行记录</span>
              <el-radio-group v-model="recordType" size="small">
                <el-radio-button label="all">全部</el-radio-button>
                <el-radio-button label="violation">违规</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          
          <div class="records-list">
            <div v-for="record in filteredRecords" :key="record.id" class="record-item">
              <div class="record-header">
                <span class="plate-number">{{ record.plateNumber }}</span>
                <el-tag 
                  size="small" 
                  :type="record.type === 'normal' ? 'success' : 'danger'"
                >
                  {{ record.type === 'normal' ? '正常' : '违规' }}
                </el-tag>
              </div>
              <div class="record-details">
                <div class="record-info">
                  <span>{{ record.location }}</span>
                  <span class="record-time">{{ record.time }}</span>
                </div>
                <div v-if="record.violation" class="violation-info">
                  <el-icon><Warning /></el-icon>
                  <span>{{ record.violation }}</span>
                </div>
              </div>
              <div class="record-image">
                <el-image 
                  :src="record.snapshot" 
                  :preview-src-list="[record.snapshot]"
                  fit="cover"
                />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { VideoPlay, Camera, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import VideoPlayer from '../../components/VideoPlayer.vue'

// 统计数据
const statsData = ref([
  {
    label: '今日通行',
    value: '1,245',
    icon: 'Van',
    type: 'primary',
    trend: 15
  },
  {
    label: '实时车流',
    value: '86',
    icon: 'DataLine',
    type: 'success',
    trend: 8
  },
  {
    label: '违规记录',
    value: '12',
    icon: 'Warning',
    type: 'danger',
    trend: -5
  }
])

// 监控点列表
const cameras = ref([
  { id: 1, name: '东门入口' },
  { id: 2, name: '南门入口' },
  { id: 3, name: '西门入口' },
  { id: 4, name: '北门入口' },
  { id: 5, name: '地下车库入口' }
])

// 当前选中的监控点
const currentCamera = ref(1)

// 分析状态
const isAnalyzing = ref(false)
const showTrajectory = ref(true)

// 当前检测结果
const currentDetections = ref([
  {
    id: 1,
    plateNumber: '鲁H8A7B6',
    status: '已登记',
    type: 'success',
    style: {
      left: '120px',
      top: '150px',
      width: '180px',
      height: '100px'
    }
  },
  {
    id: 2,
    plateNumber: '鲁H2S8K9',
    status: '已登记',
    type: 'success',
    style: {
      left: '350px',
      top: '200px',
      width: '160px',
      height: '90px'
    }
  }
])

// 分析结果
const analysisResults = ref([
  {
    id: 1,
    plateNumber: '鲁H8A7B6',
    snapshot: 'path/to/snapshot1.jpg',
    time: '10:30:45',
    status: '正常通行',
    type: 'success'
  },
  {
    id: 2,
    plateNumber: '鲁H2S8K9',
    snapshot: 'path/to/snapshot2.jpg',
    time: '10:29:30',
    status: '正常通行',
    type: 'success'
  }
])

// 通行记录
const records = ref([
  {
    id: 1,
    plateNumber: '鲁H8A7B6',
    type: 'normal',
    location: '东门入口',
    time: '10:30:45',
    snapshot: 'path/to/snapshot1.jpg'
  },
  {
    id: 2,
    plateNumber: '鲁H1D8F3',
    type: 'violation',
    location: '南门入口',
    time: '10:28:15',
    violation: '未登记车辆',
    snapshot: 'path/to/snapshot2.jpg'
  }
])

// 记录类型
const recordType = ref('all')

// 过滤后的记录
const filteredRecords = computed(() => {
  if (recordType.value === 'all') return records.value
  return records.value.filter(record => record.type === 'violation')
})

// 开始/停止分析
const toggleAnalysis = () => {
  isAnalyzing.value = !isAnalyzing.value
  ElMessage.success(isAnalyzing.value ? '开始视频分析' : '停止视频分析')
}

// 抓拍
const handleSnapshot = () => {
  ElMessage.success('抓拍成功')
}

// 自动更新检测结果
let updateTimer = null

onMounted(() => {
  updateTimer = setInterval(() => {
    if (isAnalyzing.value) {
      // 更新检测框位置
      currentDetections.value = currentDetections.value.map(detection => ({
        ...detection,
        style: {
          ...detection.style,
          left: `${parseInt(detection.style.left) + Math.random() * 10 - 5}px`,
          top: `${parseInt(detection.style.top) + Math.random() * 10 - 5}px`
        }
      }))
      
      // 添加新的分析结果
      if (Math.random() > 0.8) {
        const newResult = {
          id: Date.now(),
          plateNumber: `鲁H${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          snapshot: 'path/to/new-snapshot.jpg',
          time: new Date().toLocaleTimeString(),
          status: Math.random() > 0.9 ? '未登记' : '正常通行',
          type: Math.random() > 0.9 ? 'danger' : 'success'
        }
        analysisResults.value.unshift(newResult)
        if (analysisResults.value.length > 10) {
          analysisResults.value.pop()
        }
      }
    }
  }, 1000)
})

onUnmounted(() => {
  if (updateTimer) {
    clearInterval(updateTimer)
  }
})
</script>

<style scoped>
.vehicle-monitor {
  height: 100%;
}

.statistics-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.video-container {
  position: relative;
  display: flex;
  gap: 20px;
  height: 600px;
}

.video-player {
  flex: 2;
  position: relative;
  background: #000;
  border-radius: 4px;
  overflow: hidden;
}

.video-content {
  width: 100%;
  height: 100%;
}

.analysis-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.detection-box {
  position: absolute;
  border: 2px solid #409EFF;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.detection-info {
  position: absolute;
  top: -25px;
  left: 0;
  background: rgba(64, 158, 255, 0.9);
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.analysis-panel {
  flex: 1;
  background: #f5f7fa;
  border-radius: 4px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.analysis-content {
  flex: 1;
  overflow-y: auto;
}

.analysis-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.result-info {
  flex: 1;
}

.plate-number {
  font-weight: 500;
  margin-bottom: 4px;
}

.detail-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #909399;
  font-size: 12px;
}

.records-list {
  height: 600px;
  overflow-y: auto;
}

.record-item {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.record-details {
  margin-bottom: 8px;
}

.record-info {
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 13px;
}

.violation-info {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #f56c6c;
  font-size: 13px;
  margin-top: 4px;
}

.record-image {
  width: 100%;
  height: 120px;
  border-radius: 4px;
  overflow: hidden;
}

.record-image :deep(.el-image) {
  width: 100%;
  height: 100%;
}

.camera-select {
  width: 200px;
}

.analysis-status {
  margin-left: 12px;
}

:deep(.el-card__body) {
  padding: 0;
}

.monitor-card :deep(.el-card__body) {
  padding: 20px;
}
</style> 