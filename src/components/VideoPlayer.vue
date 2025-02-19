<template>
  <div class="video-player">
    <div class="video-container">
      <!-- 模拟视频画面 -->
      <div class="mock-video">
        <div class="camera-info">
          <el-icon><VideoCamera /></el-icon>
          <span>{{ cameraName }}</span>
        </div>
        <div class="time-info">
          {{ currentTime }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { VideoCamera } from '@element-plus/icons-vue'

const props = defineProps({
  cameraName: {
    type: String,
    default: '未命名摄像头'
  }
})

const currentTime = ref('')

// 更新时间
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

let timer = null

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.video-player {
  width: 100%;
  height: 100%;
  background: #000;
  border-radius: 4px;
  overflow: hidden;
}

.video-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.mock-video {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #1a1a1a 25%, #2a2a2a 25%, #2a2a2a 50%, #1a1a1a 50%, #1a1a1a 75%, #2a2a2a 75%, #2a2a2a);
  background-size: 20px 20px;
  position: relative;
}

.camera-info {
  position: absolute;
  top: 16px;
  left: 16px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  font-size: 14px;
}

.time-info {
  position: absolute;
  bottom: 16px;
  right: 16px;
  color: #fff;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  font-size: 14px;
}
</style> 