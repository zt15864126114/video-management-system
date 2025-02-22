<template>
  <div class="video-player-container">
    <video
      ref="videoRef"
      class="video-player"
      autoplay
      muted
      loop
    >
      <source src="/video/traffic.mp4" type="video/mp4">
      您的浏览器不支持视频播放。
    </video>
    
    <!-- 视频信息覆盖层 -->
    <div class="video-overlay">
      <div class="overlay-header">
        <span class="real-time-tag">实时监控</span>
        <span class="timestamp">{{ currentTime }}</span>
      </div>
      <div class="overlay-footer">
        <div class="camera-info">
          <span class="camera-name">{{ cameraInfo?.name }}</span>
          <span class="camera-id">ID: {{ cameraInfo?.id }}</span>
        </div>
        <div class="status-tag" :class="{ online: isOnline }">
          {{ isOnline ? '在线' : '离线' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  stream: {
    type: String,
    required: true
  },
  cameraInfo: {
    type: Object,
    default: () => ({})
  }
})

const videoRef = ref(null)
const currentTime = ref('')
const isOnline = ref(true)
let timeInterval

// 更新时间显示
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
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
</script>

<style scoped>
.video-player-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16/9;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.overlay-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent);
}

.overlay-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
}

.real-time-tag {
  background-color: rgba(40, 167, 69, 0.8);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
}

.timestamp {
  font-family: monospace;
  color: #fff;
  font-size: 14px;
}

.camera-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.camera-name {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.camera-id {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

.status-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: rgba(255, 59, 48, 0.8);
  color: #fff;
}

.status-tag.online {
  background: rgba(40, 167, 69, 0.8);
}
</style> 