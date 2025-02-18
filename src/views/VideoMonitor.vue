<template>
  <div class="video-monitor">
    <el-row :gutter="20">
      <el-col :span="18">
        <div class="video-container">
          <div class="main-video">
            <video-player 
              :stream="currentStream"
              :camera-info="currentCamera"
              @error="handleVideoError"
            />
            <div class="video-controls">
              <ptz-control 
                :camera-id="currentCamera?.id"
                @control="handlePTZControl"
              />
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="camera-list">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>监控点位列表</span>
              </div>
            </template>
            <el-tree
              :data="cameraList"
              :props="defaultProps"
              @node-click="handleNodeClick"
            />
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ZoomIn, ZoomOut } from '@element-plus/icons-vue'
import VideoPlayer from '../components/VideoPlayer.vue'
import PTZControl from '../components/PTZControl.vue'
import { ElMessage } from 'element-plus'

const currentStream = ref('mock-stream-1')

const cameraList = ref([
  {
    label: '教学楼',
    children: [
      { label: '一号教学楼大门', id: 'camera-1' },
      { label: '二号教学楼走廊', id: 'camera-2' }
    ]
  },
  {
    label: '宿舍区',
    children: [
      { label: '一号宿舍楼门口', id: 'camera-3' },
      { label: '二号宿舍楼门口', id: 'camera-4' }
    ]
  }
])

const defaultProps = {
  children: 'children',
  label: 'label'
}

const handleNodeClick = (data) => {
  if (data.id) {
    currentStream.value = data.id
  }
}

const controlCamera = (direction) => {
  console.log('控制摄像头:', direction)
  // 实际项目中这里需要调用摄像头控制API
}

const currentCamera = computed(() => {
  if (!currentStream.value) return null
  return cameraList.value.find(camera => camera.id === currentStream.value)
})

const handleVideoError = (error) => {
  ElMessage.error(`视频加载失败: ${error}`)
}

const handlePTZControl = (command) => {
  console.log('PTZ控制:', command)
  // 实际项目中这里需要调用云台控制API
  ElMessage.success(`正在${command.type}`)
}
</script>

<style scoped>
.video-monitor {
  padding: 20px;
}

.video-container {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 4px;
}

.main-video {
  position: relative;
  width: 100%;
  height: 600px;
  background-color: #000;
}

.video-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
}

.camera-list {
  height: 100%;
}
</style> 