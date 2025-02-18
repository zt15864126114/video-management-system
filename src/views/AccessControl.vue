<template>
  <div class="access-control">
    <!-- 顶部统计区域 -->
    <div class="statistics-row">
      <div v-for="stat in statsData" :key="stat.label" class="stat-card">
        <div class="stat-icon" :class="stat.type">
          <el-icon><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
          <div v-if="stat.trend" class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
            {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <el-row :gutter="20" class="main-content">
      <!-- 左侧门禁控制 -->
      <el-col :span="16">
        <el-card class="door-control-card">
          <template #header>
            <div class="control-header">
              <div class="header-left">
                <h2 class="section-title">门禁控制</h2>
                <el-tag type="success">{{ statistics.openDoors }}/{{ doors.length }} 开启</el-tag>
              </div>
              <div class="header-right">
                <el-input
                  v-model="searchQuery"
                  placeholder="搜索门禁"
                  prefix-icon="Search"
                  clearable
                  class="search-input"
                />
                <el-button-group>
                  <el-button type="primary" :icon="Lock" @click="handleEmergencyUnlock">
                    一键开启
                  </el-button>
                  <el-button type="danger" :icon="CircleClose" @click="handleEmergencyLock">
                    一键关闭
                  </el-button>
                </el-button-group>
              </div>
            </div>
          </template>

          <div class="door-list">
            <div v-for="door in filteredDoors" :key="door.id" class="door-item">
              <div class="door-item-header">
                <div class="door-info">
                  <span class="door-name">{{ door.name }}</span>
                  <el-tag 
                    :type="door.status === 'open' ? 'success' : 'info'"
                    size="small"
                  >
                    {{ door.status === 'open' ? '开启' : '关闭' }}
                  </el-tag>
                  <el-tooltip 
                    v-if="door.timing"
                    :content="`定时${door.timing.type === 'open' ? '开启' : '关闭'}: ${door.timing.time}`"
                  >
                    <el-icon class="timing-icon"><Timer /></el-icon>
                  </el-tooltip>
                </div>
                <div class="door-location">{{ door.location }}</div>
              </div>
              
              <div class="door-item-content">
                <div class="operation-info">
                  <div class="info-row">
                    <span class="label">最近操作：</span>
                    <span class="value">{{ door.lastOperation }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">操作时间：</span>
                    <span class="value">{{ door.lastOperationTime }}</span>
                  </div>
                </div>
                
                <div class="door-actions">
                  <el-button-group>
                    <el-button 
                      type="primary" 
                      :disabled="door.status === 'open'"
                      @click="handleDoorControl(door, 'open')"
                      size="small"
                    >
                      开启
                    </el-button>
                    <el-button 
                      type="warning" 
                      :disabled="door.status === 'closed'"
                      @click="handleDoorControl(door, 'close')"
                      size="small"
                    >
                      关闭
                    </el-button>
                  </el-button-group>
                  <el-button 
                    type="info" 
                    link 
                    :icon="Timer"
                    @click="showTimingDialog(door)"
                    size="small"
                  >
                    定时
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧通行记录 -->
      <el-col :span="8">
        <el-card class="records-card">
          <template #header>
            <div class="records-header">
              <div class="header-left">
                <h2 class="section-title">通行记录</h2>
                <span class="record-count">共 {{ accessRecords.length }} 条</span>
              </div>
              <div class="header-right">
                <el-dropdown trigger="click">
                  <el-button type="primary" plain size="small">
                    <el-icon><Filter /></el-icon>
                    筛选
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item>
                        <el-radio-group v-model="quickFilter" size="small">
                          <el-radio-button label="all">全部</el-radio-button>
                          <el-radio-button label="today">今日</el-radio-button>
                          <el-radio-button label="week">本周</el-radio-button>
                        </el-radio-group>
                      </el-dropdown-item>
                      <el-dropdown-item divided>
                        <el-button 
                          type="primary" 
                          link 
                          size="small" 
                          @click="showFilter = true"
                        >
                          高级筛选
                        </el-button>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-dropdown trigger="click">
                  <el-button type="primary" plain size="small">
                    <el-icon><Download /></el-icon>
                    导出
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="exportRecords('excel')">
                        导出到 Excel
                      </el-dropdown-item>
                      <el-dropdown-item @click="exportRecords('csv')">
                        导出到 CSV
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </template>

          <div class="records-list">
            <el-timeline>
              <el-timeline-item
                v-for="record in accessRecords"
                :key="record.id"
                :type="record.status === 'normal' ? 'primary' : 'danger'"
                :timestamp="record.time"
                size="large"
              >
                <div class="record-item">
                  <div class="record-header">
                    <span class="person-name">{{ record.name }}</span>
                    <el-tag 
                      size="small" 
                      :type="record.status === 'normal' ? 'success' : 'danger'"
                    >
                      {{ record.status === 'normal' ? '正常' : '异常' }}
                    </el-tag>
                  </div>
                  <div class="record-details">
                    <span class="door-name">{{ record.door }}</span>
                    <span class="access-type">{{ record.type }}</span>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 定时控制对话框 -->
    <el-dialog
      v-model="timingDialogVisible"
      :title="`${currentDoor?.name} - 定时控制`"
      width="500px"
    >
      <el-form :model="timingForm" label-width="100px">
        <el-form-item label="控制类型">
          <el-radio-group v-model="timingForm.type">
            <el-radio label="open">定时开启</el-radio>
            <el-radio label="close">定时关闭</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="执行时间">
          <el-time-picker
            v-model="timingForm.time"
            format="HH:mm"
            placeholder="选择时间"
          />
        </el-form-item>
        
        <el-form-item label="重复">
          <el-checkbox-group v-model="timingForm.repeat">
            <el-checkbox label="1">周一</el-checkbox>
            <el-checkbox label="2">周二</el-checkbox>
            <el-checkbox label="3">周三</el-checkbox>
            <el-checkbox label="4">周四</el-checkbox>
            <el-checkbox label="5">周五</el-checkbox>
            <el-checkbox label="6">周六</el-checkbox>
            <el-checkbox label="0">周日</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="timingDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTiming">确定</el-button>
      </template>
    </el-dialog>

    <!-- 筛选抽屉 -->
    <el-drawer
      v-model="showFilter"
      title="记录筛选"
      direction="rtl"
      size="300px"
    >
      <el-form :model="filterForm">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item label="门禁">
          <el-select v-model="filterForm.door" placeholder="请选择">
            <el-option label="全部" value="" />
            <el-option
              v-for="door in doors"
              :key="door.id"
              :label="door.name"
              :value="door.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="通行状态">
          <el-select v-model="filterForm.status" placeholder="请选择">
            <el-option label="全部" value="" />
            <el-option label="正常" value="normal" />
            <el-option label="异常" value="abnormal" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetFilter">重置</el-button>
        <el-button type="primary" @click="applyFilter">应用筛选</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Lock, CircleClose, Timer, Search, User, Warning, TrendCharts, Download, Filter } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const timingDialogVisible = ref(false)
const showFilter = ref(false)
const currentDoor = ref(null)

const doors = ref([
  { 
    id: 'door1', 
    name: '正门', 
    status: 'closed',
    location: '教学楼正门',
    lastOperation: '正常开启',
    lastOperationTime: '2024-03-20 14:30:00'
  },
  { 
    id: 'door2', 
    name: '侧门', 
    status: 'open',
    location: '教学楼西侧',
    lastOperation: '定时开启',
    lastOperationTime: '2024-03-20 08:00:00'
  },
  { 
    id: 'door3', 
    name: '后门', 
    status: 'closed',
    location: '教学楼后门',
    lastOperation: '正常关闭',
    lastOperationTime: '2024-03-20 12:00:00'
  }
])

const statistics = ref({
  todayAccess: 570,
  accessChange: -5,
  openDoors: 1,
  abnormalAccess: 2
})

const accessRecords = ref([
  { 
    id: 1,
    time: '2024-03-20 14:35:00', 
    name: '张三', 
    door: '正门', 
    type: '刷卡进入',
    status: 'normal' 
  },
  { 
    id: 2,
    time: '2024-03-20 14:32:00', 
    name: '李四', 
    door: '侧门', 
    type: '人脸识别',
    status: 'normal' 
  },
  { 
    id: 3,
    time: '2024-03-20 14:30:00', 
    name: '王五', 
    door: '后门', 
    type: '密码开门',
    status: 'abnormal' 
  }
])

const filterForm = ref({
  dateRange: [],
  door: '',
  status: ''
})

const timingForm = ref({
  type: 'open',
  time: null,
  repeat: []
})

const searchQuery = ref('')

const quickFilter = ref('all')

const statsData = computed(() => [
  {
    label: '今日通行',
    value: statistics.value.todayAccess,
    icon: 'User',
    type: 'primary',
    trend: statistics.value.accessChange
  },
  {
    label: '当前开启',
    value: statistics.value.openDoors,
    icon: 'Timer',
    type: 'success'
  },
  {
    label: '异常通行',
    value: statistics.value.abnormalAccess,
    icon: 'Warning',
    type: 'danger'
  },
  {
    label: '通行率',
    value: '98%',
    icon: 'TrendCharts',
    type: 'info'
  }
])

const filteredDoors = computed(() => {
  if (!searchQuery.value) return doors.value
  return doors.value.filter(door => 
    door.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    door.location.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 处理门禁控制
const handleDoorControl = (door, action) => {
  ElMessageBox.confirm(
    `确认${action === 'open' ? '开启' : '关闭'} ${door.name}？`,
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: action === 'open' ? 'warning' : 'info'
    }
  ).then(() => {
    door.status = action
    door.lastOperation = `手动${action === 'open' ? '开启' : '关闭'}`
    door.lastOperationTime = new Date().toLocaleString()
    statistics.value.openDoors = doors.value.filter(d => d.status === 'open').length
    ElMessage.success(`${door.name}已${action === 'open' ? '开启' : '关闭'}`)
  })
}

// 处理紧急开启
const handleEmergencyUnlock = () => {
  ElMessageBox.confirm(
    '确认紧急解锁所有门禁？',
    '警告',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    doors.value.forEach(door => {
      door.status = 'open'
      door.lastOperation = '紧急开启'
      door.lastOperationTime = new Date().toLocaleString()
    })
    statistics.value.openDoors = doors.value.length
    ElMessage.warning('已紧急解锁所有门禁')
  })
}

// 处理紧急关闭
const handleEmergencyLock = () => {
  ElMessageBox.confirm(
    '确认紧急关闭所有门禁？',
    '警告',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    doors.value.forEach(door => {
      door.status = 'closed'
      door.lastOperation = '紧急关闭'
      door.lastOperationTime = new Date().toLocaleString()
    })
    statistics.value.openDoors = 0
    ElMessage.warning('已紧急关闭所有门禁')
  })
}

// 显示定时控制对话框
const showTimingDialog = (door) => {
  currentDoor.value = door
  timingDialogVisible.value = true
}

// 提交定时控制设置
const submitTiming = () => {
  if (!timingForm.value.time || timingForm.value.repeat.length === 0) {
    ElMessage.warning('请完善定时设置')
    return
  }
  
  ElMessage.success('定时控制设置成功')
  timingDialogVisible.value = false
  
  // 重置表单
  timingForm.value = {
    type: 'open',
    time: null,
    repeat: []
  }
}

// 导出记录
const exportRecords = (type) => {
  ElMessage.success(`记录已导出为 ${type.toUpperCase()} 格式`)
}

// 应用筛选
const applyFilter = () => {
  console.log('应用筛选:', filterForm.value)
  showFilter.value = false
  ElMessage.success('筛选已应用')
}

// 重置筛选
const resetFilter = () => {
  filterForm.value = {
    dateRange: [],
    door: '',
    status: ''
  }
}
</script>

<style scoped>
.access-control {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.statistics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-info {
  flex: 1;
  position: relative;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.main-content {
  margin-top: 24px;
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 240px;
}

.door-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.door-item {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #ebeef5;
  transition: all 0.3s;
}

.door-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.door-item-header {
  margin-bottom: 12px;
}

.door-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.door-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.door-location {
  font-size: 13px;
  color: #909399;
}

.operation-info {
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  font-size: 13px;
  margin-bottom: 4px;
}

.info-row .label {
  color: #909399;
  width: 80px;
}

.info-row .value {
  color: #606266;
}

.door-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.records-card {
  height: calc(100vh - 200px);
}

.records-list {
  height: calc(100% - 60px);
  overflow-y: auto;
  padding-right: 8px;
}

.record-item {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 8px;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.person-name {
  font-weight: 500;
  color: #303133;
}

.record-details {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #606266;
}

/* 自定义滚动条样式 */
.records-list::-webkit-scrollbar {
  width: 6px;
}

.records-list::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.records-list::-webkit-scrollbar-track {
  background: #f5f7fa;
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.record-count {
  font-size: 13px;
  color: #909399;
}

.header-right {
  display: flex;
  gap: 8px;
}

.header-right :deep(.el-dropdown) {
  margin-left: 0;
}

/* 优化下拉菜单样式 */
:deep(.el-dropdown-menu) {
  padding: 8px;
  min-width: 120px;
}

:deep(.el-dropdown-menu__item) {
  padding: 8px;
  line-height: 1;
}

:deep(.el-radio-group) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style> 