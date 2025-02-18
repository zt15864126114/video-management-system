<template>
  <div class="alarm-management">
    <el-row :gutter="20">
      <el-col :span="18">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>报警监控</span>
              <div class="header-actions">
                <el-input
                  placeholder="搜索监控点"
                  prefix-icon="Search"
                  v-model="searchQuery"
                  style="width: 200px; margin-right: 16px;"
                />
                <el-button-group>
                  <el-button type="danger" :icon="Bell" @click="handleEmergency">
                    一键报警
                  </el-button>
                  <el-button type="warning" :icon="Notification" @click="handleBroadcast">
                    广播通知
                  </el-button>
                </el-button-group>
              </div>
            </div>
          </template>
          <el-row :gutter="16">
            <el-col :span="12" v-for="camera in filteredCameras" :key="camera.id">
              <div class="camera-wrapper">
                <div class="camera-container" :data-camera-id="camera.id">
                  <div class="camera-title">{{ camera.name }}</div>
                  <video-player :stream="camera.stream" />
                  <div class="camera-status" :class="{ 'is-alarm': camera.status === 'alarm' }">
                    {{ camera.status === 'normal' ? '正常' : '报警中' }}
                  </div>
                  <div class="camera-overlay" v-if="camera.status === 'alarm'">
                    <div class="alarm-content">
                      <div class="alarm-header">
                        <el-icon class="alarm-icon"><Warning /></el-icon>
                        <span class="alarm-title">异常警报</span>
                      </div>
                      <div class="alarm-info">
                        <p class="alarm-time">{{ new Date().toLocaleTimeString() }}</p>
                        <p class="alarm-desc">检测到可疑行为，请及时处理</p>
                      </div>
                      <div class="alarm-actions">
                        <el-button type="danger" size="small" @click="handleAlarmAction(camera, 'confirm')">
                          确认警报
                        </el-button>
                        <el-button type="warning" size="small" @click="handleAlarmAction(camera, 'ignore')">
                          忽略
                        </el-button>
                      </div>
                    </div>
                  </div>
                  <div class="camera-tools">
                    <div class="tools-group">
                      <el-tooltip content="截图">
                        <el-button :icon="Camera" circle @click="captureImage(camera)" />
                      </el-tooltip>
                      <el-tooltip :content="camera.recording ? '停止录制' : '开始录制'">
                        <el-button 
                          :icon="VideoCamera" 
                          circle 
                          :type="camera.recording ? 'danger' : 'default'"
                          @click="toggleRecord(camera)" 
                        />
                      </el-tooltip>
                      <el-tooltip content="全屏">
                        <el-button :icon="FullScreen" circle @click="toggleFullscreen(camera)" />
                      </el-tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
        
        <div class="statistics-row">
          <el-card class="statistic-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>今日报警</span>
                <el-tag type="danger" effect="dark">{{ statistics.todayAlarms }}</el-tag>
              </div>
            </template>
            <div class="trend-info">
              <span class="trend-text">较昨日</span>
              <span :class="['trend-value', statistics.todayChange > 0 ? 'up' : 'down']">
                {{ statistics.todayChange > 0 ? '+' : '' }}{{ statistics.todayChange }}%
              </span>
            </div>
          </el-card>
          
          <el-card class="statistic-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>处理中</span>
                <el-tag type="warning" effect="dark">{{ statistics.processing }}</el-tag>
              </div>
            </template>
            <div class="trend-info">
              <span class="trend-text">平均处理时间</span>
              <span class="trend-value">15分钟</span>
            </div>
          </el-card>
          
          <el-card class="statistic-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>已处理</span>
                <el-tag type="success" effect="dark">{{ statistics.processed }}</el-tag>
              </div>
            </template>
            <div class="trend-info">
              <span class="trend-text">处理率</span>
              <span class="trend-value success">98%</span>
            </div>
          </el-card>
        </div>
      </el-col>
      
      <el-col :span="6">
        <el-card class="alarm-records-card">
          <template #header>
            <div class="card-header">
              <span>报警记录</span>
              <el-select v-model="alarmType" placeholder="类型" size="small">
                <el-option label="全部" value="all" />
                <el-option label="入侵报警" value="intrusion" />
                <el-option label="火灾报警" value="fire" />
                <el-option label="求助报警" value="help" />
              </el-select>
            </div>
          </template>
          <div class="alarm-records-container">
            <el-timeline>
              <el-timeline-item
                v-for="alarm in alarmRecords"
                :key="alarm.id"
                :type="alarm.status === 'processed' ? 'success' : 'danger'"
                :timestamp="alarm.time"
              >
                <div class="alarm-record">
                  <div class="alarm-title">
                    {{ alarm.type }} - {{ alarm.location }}
                  </div>
                  <div class="alarm-desc">{{ alarm.description }}</div>
                  <div class="alarm-actions" v-if="alarm.status !== 'processed'">
                    <el-button type="primary" size="small" @click="handleAlarm(alarm.id)">
                      处理
                    </el-button>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 处理报警对话框 -->
    <el-dialog v-model="dialogVisible" title="报警处理" width="500px">
      <el-form :model="alarmForm" label-width="100px">
        <el-form-item label="处理方式">
          <el-select v-model="alarmForm.method" placeholder="请选择处理方式">
            <el-option label="现场处理" value="onsite" />
            <el-option label="远程处理" value="remote" />
            <el-option label="转交处理" value="transfer" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理说明">
          <el-input type="textarea" v-model="alarmForm.description" rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAlarmProcess">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Bell, Notification, Warning, Camera, VideoCamera, FullScreen, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import VideoPlayer from '../components/VideoPlayer.vue'

const dateRange = ref([])
const alarmType = ref('all')
const dialogVisible = ref(false)
const currentAlarmId = ref(null)
const searchQuery = ref('')

const alarmForm = ref({
  method: '',
  description: ''
})

const alarmCameras = ref([
  { id: 1, name: '正门监控点', stream: 'alarm-camera-1', status: 'normal', recording: false },
  { id: 2, name: '后门监控点', stream: 'alarm-camera-2', status: 'alarm', recording: false },
  { id: 3, name: '操场监控点', stream: 'alarm-camera-3', status: 'normal', recording: false },
  { id: 4, name: '教学楼监控点', stream: 'alarm-camera-4', status: 'normal', recording: false }
])

const statistics = ref({
  todayAlarms: 5,
  todayChange: -15,
  processing: 2,
  processed: 3
})

const alarmRecords = ref([
  {
    id: 1,
    type: '入侵报警',
    location: '后门',
    time: '2024-03-20 14:30:00',
    description: '发现可疑人员尝试翻越围墙',
    status: 'processing'
  },
  {
    id: 2,
    type: '求助报警',
    location: '教学楼',
    time: '2024-03-20 14:25:00',
    description: '学生按下紧急求助按钮',
    status: 'processed'
  }
])

const filteredCameras = computed(() => {
  if (!searchQuery.value) return alarmCameras.value
  return alarmCameras.value.filter(camera => 
    camera.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const handleEmergency = () => {
  ElMessageBox.confirm('确认发起紧急报警？', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('已发起紧急报警')
  })
}

const handleBroadcast = () => {
  ElMessageBox.prompt('请输入广播内容', '广播通知', {
    confirmButtonText: '发送',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    ElMessage.success('广播发送成功')
  })
}

const handleAlarm = (alarmId) => {
  currentAlarmId.value = alarmId
  dialogVisible.value = true
}

const submitAlarmProcess = () => {
  if (!alarmForm.value.method || !alarmForm.value.description) {
    ElMessage.warning('请填写完整的处理信息')
    return
  }
  
  // 实际项目中这里需要调用处理报警的API
  console.log('处理报警:', currentAlarmId.value, alarmForm.value)
  ElMessage.success('报警处理成功')
  dialogVisible.value = false
  
  // 重置表单
  alarmForm.value = {
    method: '',
    description: ''
  }
}

const handleAlarmAction = (camera, action) => {
  if (action === 'confirm') {
    ElMessageBox.confirm(
      `确认处理 ${camera.name} 的报警吗？`,
      '警告',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      // 更新摄像头状态
      camera.status = 'normal'
      
      // 添加到报警记录
      alarmRecords.value.unshift({
        id: Date.now(),
        type: '异常报警',
        location: camera.name,
        time: new Date().toLocaleString(),
        description: '异常行为报警，已确认处理',
        status: 'processed'
      })
      
      // 更新统计数据
      statistics.value.processing--
      statistics.value.processed++
      
      ElMessage.success('报警已处理')
    })
  } else if (action === 'ignore') {
    ElMessageBox.confirm(
      `确认忽略 ${camera.name} 的报警吗？`,
      '提示',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info'
      }
    ).then(() => {
      // 更新摄像头状态
      camera.status = 'normal'
      
      // 添加到报警记录
      alarmRecords.value.unshift({
        id: Date.now(),
        type: '异常报警',
        location: camera.name,
        time: new Date().toLocaleString(),
        description: '异常行为报警，已忽略',
        status: 'processed'
      })
      
      // 更新统计数据
      statistics.value.processing--
      statistics.value.processed++
      
      ElMessage.info('报警已忽略')
    })
  }
}

const captureImage = (camera) => {
  ElMessage.success(`已保存 ${camera.name} 的截图`)
}

const toggleRecord = (camera) => {
  camera.recording = !camera.recording
  ElMessage.success(`${camera.recording ? '开始' : '停止'}录制 ${camera.name} 的视频`)
}

const toggleFullscreen = (camera) => {
  const videoElement = document.querySelector(`[data-camera-id="${camera.id}"] video`)
  if (videoElement) {
    if (!document.fullscreenElement) {
      videoElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }
}
</script>

<style scoped>
.alarm-management {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.statistics-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 20px;
}

.statistic-card {
  transition: all 0.3s;
}

.statistic-card:hover {
  transform: translateY(-2px);
}

.trend-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.trend-text {
  color: #909399;
  font-size: 14px;
}

.trend-value {
  font-weight: 500;
  font-size: 16px;
}

.trend-value.up {
  color: #f56c6c;
}

.trend-value.down {
  color: #67c23a;
}

.trend-value.success {
  color: #67c23a;
}

.alarm-records-card {
  height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
}

.alarm-records-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.alarm-records-container::-webkit-scrollbar {
  width: 6px;
}

.alarm-records-container::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.alarm-records-container::-webkit-scrollbar-track {
  background: #f5f7fa;
}

.camera-wrapper {
  margin-bottom: 20px;
}

.camera-container {
  position: relative;
  height: 300px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.camera-title {
  padding: 8px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
}

.camera-container :deep(.video-player) {
  width: 100%;
  height: 100%;
}

.camera-status {
  position: absolute;
  top: 12px;
  right: 8px;
  padding: 2px 8px;
  border-radius: 12px;
  background: #67c23a;
  color: #fff;
  font-size: 12px;
  z-index: 2;
}

.camera-status.is-alarm {
  background: #f56c6c;
  animation: blink 1s infinite;
}

.alarm-record {
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.alarm-title {
  font-weight: bold;
  margin-bottom: 8px;
}

.alarm-desc {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.alarm-actions {
  text-align: right;
}

.mt-20 {
  margin-top: 20px;
}

.camera-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  animation: fadeIn 0.3s ease-out;
}

.alarm-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 20px;
  width: 80%;
  max-width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.alarm-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.alarm-icon {
  font-size: 24px;
  color: #f56c6c;
  animation: pulse 1.5s infinite;
}

.alarm-title {
  font-size: 16px;
  color: #f56c6c;
  font-weight: bold;
}

.alarm-info {
  margin-bottom: 16px;
}

.alarm-time {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.alarm-desc {
  font-size: 14px;
  color: #606266;
}

.alarm-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.alarm-actions .el-button {
  padding: 6px 12px;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.camera-tools {
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 3;
  opacity: 0;
  transition: opacity 0.3s;
}

.tools-group {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 24px;
  padding: 8px;
  display: flex;
  gap: 8px;
}

.camera-container:hover .camera-tools {
  opacity: 1;
}

.camera-tools .el-button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
}

.camera-tools .el-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.camera-tools .el-button.is-danger {
  background: #f56c6c;
}

.camera-tools .el-button.is-danger:hover {
  background: #f78989;
}
</style> 