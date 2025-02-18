<template>
  <div class="ptz-control">
    <div class="control-panel">
      <!-- 方向控制 -->
      <div class="direction-control">
        <el-button-group class="vertical-group">
          <el-button :icon="CaretTop" @mousedown="startControl('up')" @mouseup="stopControl" @mouseleave="stopControl" />
          <el-button :icon="CaretBottom" @mousedown="startControl('down')" @mouseup="stopControl" @mouseleave="stopControl" />
        </el-button-group>
        <el-button-group class="horizontal-group">
          <el-button :icon="CaretLeft" @mousedown="startControl('left')" @mouseup="stopControl" @mouseleave="stopControl" />
          <el-button :icon="CaretRight" @mousedown="startControl('right')" @mouseup="stopControl" @mouseleave="stopControl" />
        </el-button-group>
      </div>

      <!-- 变倍控制 -->
      <div class="zoom-control">
        <el-button-group>
          <el-button :icon="ZoomIn" @mousedown="startControl('zoomIn')" @mouseup="stopControl" @mouseleave="stopControl" />
          <el-button :icon="ZoomOut" @mousedown="startControl('zoomOut')" @mouseup="stopControl" @mouseleave="stopControl" />
        </el-button-group>
      </div>

      <!-- 预置位 -->
      <div class="preset-control">
        <div class="preset-header">
          <span>预置位</span>
          <el-button type="primary" link :icon="Plus" @click="showPresetDialog = true">添加</el-button>
        </div>
        <div class="preset-list">
          <div v-for="preset in presets" :key="preset.id" class="preset-item">
            <el-button 
              :type="currentPreset === preset.id ? 'primary' : 'default'"
              @click="callPreset(preset.id)"
            >
              {{ preset.name }}
            </el-button>
            <div class="preset-actions">
              <el-button type="primary" link :icon="Edit" @click="editPreset(preset)" />
              <el-button type="danger" link :icon="Delete" @click="deletePreset(preset.id)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预置位对话框 -->
    <el-dialog 
      v-model="showPresetDialog" 
      :title="editingPreset ? '编辑预置位' : '添加预置位'"
      width="400px"
    >
      <el-form :model="presetForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="presetForm.name" placeholder="请输入预置位名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            v-model="presetForm.description" 
            type="textarea" 
            placeholder="请输入预置位描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPresetDialog = false">取消</el-button>
        <el-button type="primary" @click="savePreset">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { 
  CaretTop, CaretBottom, CaretLeft, CaretRight,
  ZoomIn, ZoomOut, Plus, Edit, Delete
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  cameraId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['control'])

// 控制状态
let controlInterval = null
const controlSpeed = 50 // 控制速度(ms)

// 预置位相关
const currentPreset = ref(null)
const showPresetDialog = ref(false)
const editingPreset = ref(null)
const presetForm = ref({
  name: '',
  description: ''
})

// 模拟预置位数据
const presets = ref([
  { id: 1, name: '大门口', description: '大门入口监控位置' },
  { id: 2, name: '停车场', description: '停车场全景' },
  { id: 3, name: '正门路口', description: '学校正门路口' }
])

// 云台控制
const startControl = (direction) => {
  emit('control', { type: direction, action: 'start' })
  controlInterval = setInterval(() => {
    emit('control', { type: direction, action: 'continue' })
  }, controlSpeed)
}

const stopControl = () => {
  if (controlInterval) {
    clearInterval(controlInterval)
    controlInterval = null
  }
  emit('control', { type: 'stop' })
}

// 调用预置位
const callPreset = (presetId) => {
  currentPreset.value = presetId
  ElMessage.success(`已调用预置位: ${presets.value.find(p => p.id === presetId)?.name}`)
}

// 编辑预置位
const editPreset = (preset) => {
  editingPreset.value = preset
  presetForm.value = { ...preset }
  showPresetDialog.value = true
}

// 删除预置位
const deletePreset = (presetId) => {
  ElMessageBox.confirm('确认删除该预置位？', '提示', {
    type: 'warning'
  }).then(() => {
    presets.value = presets.value.filter(p => p.id !== presetId)
    ElMessage.success('预置位已删除')
  })
}

// 保存预置位
const savePreset = () => {
  if (!presetForm.value.name) {
    ElMessage.warning('请输入预置位名称')
    return
  }

  if (editingPreset.value) {
    // 编辑模式
    const index = presets.value.findIndex(p => p.id === editingPreset.value.id)
    if (index !== -1) {
      presets.value[index] = {
        ...editingPreset.value,
        ...presetForm.value
      }
    }
  } else {
    // 新增模式
    presets.value.push({
      id: Date.now(),
      ...presetForm.value
    })
  }

  showPresetDialog.value = false
  editingPreset.value = null
  presetForm.value = { name: '', description: '' }
  ElMessage.success('预置位保存成功')
}
</script>

<style scoped>
.ptz-control {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.control-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.direction-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.vertical-group, .horizontal-group {
  display: flex;
  gap: 4px;
}

.zoom-control {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.preset-control {
  margin-top: 16px;
}

.preset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.preset-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preset-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preset-item .el-button {
  flex: 1;
}

.preset-actions {
  display: flex;
  gap: 4px;
}

/* 按钮样式优化 */
.el-button {
  padding: 8px 16px;
}

.direction-control .el-button {
  padding: 12px;
}

.direction-control .el-button .el-icon {
  font-size: 20px;
}
</style> 