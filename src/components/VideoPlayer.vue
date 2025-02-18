<template>
  <div class="video-player">
    <div v-if="!isPlaying" class="video-placeholder">
      <el-icon class="placeholder-icon"><VideoCamera /></el-icon>
      <div class="placeholder-text">
        <el-skeleton v-if="loading" :rows="1" animated />
        <template v-else>
          {{ error || '视频加载中...' }}
        </template>
      </div>
      <el-button v-if="error" type="primary" size="small" @click="retryLoad">
        重试
      </el-button>
    </div>
    <div v-else class="player-container">
      <video ref="videoRef" class="video-element" autoplay>
        <source :src="streamUrl" type="video/mp4">
      </video>
      
      <!-- 视频控制栏 -->
      <div class="video-controls">
        <div class="control-left">
          <el-button :icon="videoPlaying ? VideoPause : VideoPlay" circle @click="togglePlay" />
          <el-button :icon="isMuted ? Mute : VideoCamera" circle @click="toggleMute" />
          <div class="volume-slider">
            <el-slider v-model="volume" :min="0" :max="100" :show-tooltip="false" />
          </div>
        </div>
        
        <div class="control-right">
          <el-button :icon="isFullscreen ? Close : FullScreen" circle @click="toggleFullscreen" />
          <el-dropdown trigger="click">
            <el-button :icon="Setting" circle />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-switch v-model="settings.hd" active-text="高清" inactive-text="标清" />
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-switch v-model="settings.record" active-text="录制" inactive-text="关闭" />
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 视频信息浮层 -->
      <div class="video-info">
        <span class="camera-name">{{ cameraInfo.name }}</span>
        <span class="stream-status" :class="{ 'is-online': isOnline }">
          {{ isOnline ? '在线' : '离线' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, defineProps } from 'vue'
import { 
  VideoCamera, VideoPlay, VideoPause, Mute, 
  FullScreen, Close, Setting 
} from '@element-plus/icons-vue'

const props = defineProps({
  stream: {
    type: String,
    required: true
  },
  cameraInfo: {
    type: Object,
    default: () => ({
      name: '未命名摄像头',
      location: '未知位置'
    })
  }
})

const videoRef = ref(null)
const isPlaying = ref(false)
const videoPlaying = ref(true)
const isMuted = ref(false)
const volume = ref(100)
const isFullscreen = ref(false)
const isOnline = ref(true)
const streamUrl = ref('')
const settings = ref({
  hd: true,
  record: false
})
const loading = ref(true)
const error = ref('')

// 模拟视频流URL
const getStreamUrl = (streamId) => {
  return `https://example.com/stream/${streamId}${settings.value.hd ? '/hd' : '/sd'}`
}

// 播放控制
const togglePlay = () => {
  if (videoRef.value) {
    if (videoPlaying.value) {
      videoRef.value.pause()
    } else {
      videoRef.value.play()
    }
    videoPlaying.value = !videoPlaying.value
  }
}

// 静音控制
const toggleMute = () => {
  if (videoRef.value) {
    videoRef.value.muted = !videoRef.value.muted
    isMuted.value = videoRef.value.muted
  }
}

// 音量控制
const updateVolume = () => {
  if (videoRef.value) {
    videoRef.value.volume = volume.value / 100
  }
}

// 全屏控制
const toggleFullscreen = () => {
  const player = videoRef.value
  if (!document.fullscreenElement) {
    player.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 监听全屏变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// 监听视频流状态
const checkStreamStatus = () => {
  // 模拟检查视频流状态
  isOnline.value = Math.random() > 0.1
}

const retryLoad = () => {
  loading.value = true
  error.value = ''
  streamUrl.value = getStreamUrl(props.stream)
  
  // 模拟加载
  setTimeout(() => {
    loading.value = false
    if (Math.random() > 0.8) {
      error.value = '视频加载失败，请重试'
      emit('error', error.value)
    } else {
      isPlaying.value = true
    }
  }, 1500)
}

// 监听属性变化
watch(() => props.stream, (newStream) => {
  isPlaying.value = false
  retryLoad()
})

watch(volume, updateVolume)

watch(() => settings.value.hd, () => {
  streamUrl.value = getStreamUrl(props.stream)
})

// 生命周期钩子
onMounted(() => {
  streamUrl.value = getStreamUrl(props.stream)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  
  // 模拟加载延迟
  setTimeout(() => {
    isPlaying.value = true
  }, 1000)

  // 定期检查流状态
  const statusInterval = setInterval(checkStreamStatus, 5000)
  
  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    clearInterval(statusInterval)
  })
})
</script>

<style scoped>
.video-player {
  width: 100%;
  height: 100%;
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.player-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  display: flex;
  justify-content: space-between;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.player-container:hover .video-controls {
  opacity: 1;
}

.control-left, .control-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.volume-slider {
  width: 100px;
  margin: 0 8px;
}

.video-info {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.camera-name {
  font-size: 14px;
  font-weight: 500;
}

.stream-status {
  padding: 2px 8px;
  border-radius: 12px;
  background: rgba(0,0,0,0.5);
  font-size: 12px;
  color: #ff4d4f;
}

.stream-status.is-online {
  color: #52c41a;
}

/* 自定义按钮样式 */
.el-button {
  background: rgba(255,255,255,0.1);
  border: none;
  color: #fff;
}

.el-button:hover {
  background: rgba(255,255,255,0.2);
  color: #fff;
}

/* 自定义滑块样式 */
:deep(.el-slider__runway) {
  background-color: rgba(255,255,255,0.2);
}

:deep(.el-slider__bar) {
  background-color: #fff;
}

:deep(.el-slider__button) {
  border-color: #fff;
}
</style> 