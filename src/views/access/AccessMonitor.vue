<template>
  <div class="access-monitor">
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

    <!-- 实时监控 -->
    <el-row :gutter="20">
      <!-- 左侧门禁列表 -->
      <el-col :span="16">
        <el-card class="monitor-card">
          <template #header>
            <div class="card-header">
              <div class="header-left">
<!--                <span class="title">实时监控</span>-->
                <el-input
                  v-model="searchQuery"
                  placeholder="搜索门禁"
                  prefix-icon="Search"
                  clearable
                  class="search-input"
                />
                <el-select v-model="filterStatus" placeholder="状态" clearable>
                  <el-option label="全部" value="" />
                  <el-option label="开启" value="open" />
                  <el-option label="关闭" value="closed" />
                </el-select>
              </div>
              <el-button-group>
                <el-button type="primary" @click="handleEmergencyUnlock">
                  <el-icon><Lock /></el-icon>一键开启
                </el-button>
                <el-button type="danger" @click="handleEmergencyLock">
                  <el-icon><CircleClose /></el-icon>一键关闭
                </el-button>
              </el-button-group>
            </div>
          </template>
          
          <div class="monitor-grid">
            <div v-for="door in filteredDoors" :key="door.id" class="door-card">
              <div class="door-header">
                <span class="door-name">{{ door.name }}</span>
                <el-tag :type="door.status === 'open' ? 'success' : 'info'" size="small">
                  {{ door.status === 'open' ? '开启' : '关闭' }}
                </el-tag>
              </div>
              <div class="door-content">
                <div class="door-info">
                  <p>位置：{{ door.location }}</p>
                  <p>最近操作：{{ door.lastOperation }}</p>
                  <p>操作时间：{{ door.lastOperationTime }}</p>
                  <p>今日通行：{{ door.todayPassCount }} 人次</p>
                  <p>状态：<el-tag size="small" :type="door.deviceStatus === 'online' ? 'success' : 'danger'">
                    {{ door.deviceStatus === 'online' ? '在线' : '离线' }}
                  </el-tag></p>
                </div>
                <div class="door-actions">
                  <el-button-group>
                    <el-button 
                      type="primary" 
                      :disabled="door.status === 'open'"
                      @click="handleDoorControl(door, 'open')"
                      size="small"
                    >开启</el-button>
                    <el-button 
                      type="warning" 
                      :disabled="door.status === 'closed'"
                      @click="handleDoorControl(door, 'close')"
                      size="small"
                    >关闭</el-button>
                    <el-button
                      type="info"
                      @click="showDoorDetails(door)"
                      size="small"
                    >详情</el-button>
                  </el-button-group>
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
              <span>实时通行记录</span>
              <el-button-group>
                <el-button :icon="Refresh" circle @click="refreshRecords" />
                <el-button :icon="Filter" circle @click="showFilterDialog = true" />
              </el-button-group>
            </div>
          </template>
          <div class="records-list">
            <div v-for="record in accessRecords" :key="record.id" class="record-item">
              <div class="record-header">
                <span class="person-name">{{ record.name }}</span>
                <el-tag size="small" :type="record.status === '正常' ? 'success' : 'danger'">
                  {{ record.status }}
                </el-tag>
              </div>
              <div class="record-details">
                <div class="record-info">
                  <span>{{ record.doorName }}</span>
                  <span class="record-location">{{ record.location }}</span>
                </div>
                <div class="record-time">
                  <span>{{ record.time }}</span>
                  <span class="record-action">{{ record.action }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 门禁详情对话框 -->
    <el-dialog v-model="showDetails" title="门禁详情" width="600px">
      <el-descriptions v-if="selectedDoor" :column="2" border>
        <el-descriptions-item label="门禁名称">{{ selectedDoor.name }}</el-descriptions-item>
        <el-descriptions-item label="位置">{{ selectedDoor.location }}</el-descriptions-item>
        <el-descriptions-item label="设备状态">
          <el-tag :type="selectedDoor.deviceStatus === 'online' ? 'success' : 'danger'">
            {{ selectedDoor.deviceStatus === 'online' ? '在线' : '离线' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="selectedDoor.status === 'open' ? 'success' : 'info'">
            {{ selectedDoor.status === 'open' ? '开启' : '关闭' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="今日通行">{{ selectedDoor.todayPassCount }} 人次</el-descriptions-item>
        <el-descriptions-item label="最近操作时间">{{ selectedDoor.lastOperationTime }}</el-descriptions-item>
      </el-descriptions>
      
      <el-tabs class="detail-tabs">
        <el-tab-pane label="通行记录">
          <el-table :data="doorRecords" style="width: 100%" size="small">
            <el-table-column prop="time" label="时间" width="150" />
            <el-table-column prop="name" label="姓名" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === '正常' ? 'success' : 'danger'" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="操作记录">
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in doorActivities"
              :key="index"
              :type="activity.type"
              :timestamp="activity.timestamp"
            >
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Lock, CircleClose, Refresh, Filter, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 搜索和筛选
const searchQuery = ref('')
const filterStatus = ref('')
const showDetails = ref(false)
const selectedDoor = ref(null)

// 实时通行记录
const accessRecords = ref([])

// 更新实时通行记录生成
const generateRandomRecord = () => {
  // 常见姓氏
  const surnames = [
    '张', '王', '李', '赵', '陈', '刘', '杨', '黄', '周', '吴',
    '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林', '郑',
    '谢', '罗', '梁', '宋', '唐', '许', '韩', '冯', '邓', '曹',
    '彭', '曾', '肖', '田', '董', '袁', '潘', '于', '蒋', '蔡'
  ]
  
  // 常见名字组合（分别用于单字名和双字名）
  const nameChars1 = [
    '伟', '强', '军', '磊', '洋', '勇', '建', '峰', '超', '波',
    '辉', '刚', '健', '明', '亮', '俊', '飞', '鹏', '斌', '浩'
  ]
  
  const nameChars2 = [
    '宇', '浩', '航', '瑞', '晨', '辰', '宁', '琪', '文', '明',
    '智', '嘉', '诚', '志', '诺', '轩', '杰', '雨', '泽', '鑫'
  ]
  
  // 女性常用名
  const femaleNames = [
    '芳', '娟', '敏', '静', '秀', '娜', '丽', '艳', '玲', '燕',
    '晶', '萍', '霞', '萱', '雪', '莉', '婷', '婧', '雯', '倩',
    '妍', '瑶', '璐', '漫', '茜', '淑', '莹', '晴', '珊', '瑾'
  ]

  // 生成一个随机的中国人名
  const generateName = () => {
    const surname = surnames[Math.floor(Math.random() * surnames.length)]
    const isFemale = Math.random() < 0.5
    const isDoubleName = Math.random() < 0.6 // 60%概率使用双字名
    
    if (isFemale) {
      if (isDoubleName) {
        return surname + femaleNames[Math.floor(Math.random() * femaleNames.length)] +
               femaleNames[Math.floor(Math.random() * femaleNames.length)]
      } else {
        return surname + femaleNames[Math.floor(Math.random() * femaleNames.length)]
      }
    } else {
      if (isDoubleName) {
        return surname + nameChars1[Math.floor(Math.random() * nameChars1.length)] +
               nameChars2[Math.floor(Math.random() * nameChars2.length)]
      } else {
        return surname + nameChars1[Math.floor(Math.random() * nameChars1.length)]
      }
    }
  }

  const doors = [
    { name: '教学楼正门', location: '教学区' },
    { name: '图书馆入口', location: '教学区' },
    { name: '实验楼大门', location: '实验区' },
    { name: '宿舍楼A座', location: '生活区' },
    { name: '宿舍楼B座', location: '生活区' },
    { name: '食堂主入口', location: '生活区' },
    { name: '体育馆入口', location: '运动区' },
    { name: '游泳馆入口', location: '运动区' },
    { name: '行政楼入口', location: '办公区' },
    { name: '艺术楼入口', location: '教学区' }
  ]
  const actions = ['刷卡通行', '人脸识别', '密码开门', '远程开启']
  const statuses = ['正常', '正常', '正常', '正常', '异常']

  const door = doors[Math.floor(Math.random() * doors.length)]
  const action = actions[Math.floor(Math.random() * actions.length)]
  const status = statuses[Math.floor(Math.random() * statuses.length)]

  return {
    id: Date.now(),
    name: generateName(),
    doorName: door.name,
    location: door.location,
    action: action,
    time: new Date().toLocaleString(),
    status: status
  }
}

// 更新初始通行记录
accessRecords.value = Array.from({ length: 20 }, () => generateRandomRecord())

// 统计数据
const statsData = ref([
  {
    label: '在线门禁',
    value: '9/10',
    icon: 'Link',
    type: 'success',
    trend: 0
  },
  {
    label: '今日通行',
    value: '12,879',
    icon: 'DataLine',
    type: 'primary',
    trend: 12
  },
  {
    label: '异常记录',
    value: '3',
    icon: 'Warning',
    type: 'danger',
    trend: -5
  }
])

// 门禁数据
const doors = ref([
  {
    id: 1,
    name: '教学楼正门',
    location: '教学区',
    status: 'open',
    lastOperation: '正常开启',
    lastOperationTime: '2024-03-20 10:30:45',
    deviceStatus: 'online',
    todayPassCount: 1256
  },
  {
    id: 2,
    name: '图书馆入口',
    location: '教学区',
    status: 'closed',
    lastOperation: '定时关闭',
    lastOperationTime: '2024-03-20 22:00:00',
    deviceStatus: 'online',
    todayPassCount: 2145
  },
  {
    id: 3,
    name: '实验楼大门',
    location: '实验区',
    status: 'open',
    lastOperation: '正常开启',
    lastOperationTime: '2024-03-20 08:00:00',
    deviceStatus: 'online',
    todayPassCount: 986
  },
  {
    id: 4,
    name: '宿舍楼A座',
    location: '生活区',
    status: 'open',
    lastOperation: '刷卡开启',
    lastOperationTime: '2024-03-20 10:15:22',
    deviceStatus: 'online',
    todayPassCount: 1678
  },
  {
    id: 5,
    name: '宿舍楼B座',
    location: '生活区',
    status: 'open',
    lastOperation: '人脸识别',
    lastOperationTime: '2024-03-20 10:28:15',
    deviceStatus: 'online',
    todayPassCount: 1523
  },
  {
    id: 6,
    name: '食堂主入口',
    location: '生活区',
    status: 'open',
    lastOperation: '正常开启',
    lastOperationTime: '2024-03-20 06:30:00',
    deviceStatus: 'online',
    todayPassCount: 3245
  },
  {
    id: 7,
    name: '体育馆入口',
    location: '运动区',
    status: 'closed',
    lastOperation: '定时关闭',
    lastOperationTime: '2024-03-20 22:00:00',
    deviceStatus: 'offline',
    todayPassCount: 456
  },
  {
    id: 8,
    name: '游泳馆入口',
    location: '运动区',
    status: 'closed',
    lastOperation: '定时关闭',
    lastOperationTime: '2024-03-20 21:30:00',
    deviceStatus: 'online',
    todayPassCount: 234
  },
  {
    id: 9,
    name: '行政楼入口',
    location: '办公区',
    status: 'open',
    lastOperation: '正常开启',
    lastOperationTime: '2024-03-20 08:30:00',
    deviceStatus: 'online',
    todayPassCount: 567
  },
  {
    id: 10,
    name: '艺术楼入口',
    location: '教学区',
    status: 'open',
    lastOperation: '刷卡开启',
    lastOperationTime: '2024-03-20 09:15:00',
    deviceStatus: 'online',
    todayPassCount: 789
  }
])

// 过滤门禁列表
const filteredDoors = computed(() => {
  return doors.value.filter(door => {
    const matchQuery = door.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                      door.location.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchStatus = !filterStatus.value || door.status === filterStatus.value
    return matchQuery && matchStatus
  })
})

// 门禁详情相关数据
const doorRecords = ref([
  { time: '2024-03-20 10:30:45', name: '张三', status: '正常' },
  { time: '2024-03-20 10:28:32', name: '李四', status: '异常' }
])

const doorActivities = ref([
  { content: '系统自动关闭', timestamp: '2024-03-20 22:00:00', type: 'primary' },
  { content: '管理员手动开启', timestamp: '2024-03-20 08:00:00', type: 'success' },
  { content: '设备离线', timestamp: '2024-03-19 23:45:00', type: 'danger' }
])

// 方法
const handleDoorControl = (door, action) => {
  door.status = action === 'open' ? 'open' : 'closed'
  door.lastOperation = `${action === 'open' ? '开启' : '关闭'}`
  door.lastOperationTime = new Date().toLocaleString()
  ElMessage.success(`${door.name}已${action === 'open' ? '开启' : '关闭'}`)
}

const handleEmergencyUnlock = () => {
  doors.value.forEach(door => {
    door.status = 'open'
    door.lastOperation = '紧急开启'
    door.lastOperationTime = new Date().toLocaleString()
  })
  ElMessage.success('已紧急开启所有门禁')
}

const handleEmergencyLock = () => {
  doors.value.forEach(door => {
    door.status = 'closed'
    door.lastOperation = '紧急关闭'
    door.lastOperationTime = new Date().toLocaleString()
  })
  ElMessage.success('已紧急关闭所有门禁')
}

// 显示门禁详情
const showDoorDetails = (door) => {
  selectedDoor.value = door
  showDetails.value = true
}

// 刷新记录
const refreshRecords = () => {
  accessRecords.value = Array.from({ length: 20 }, () => generateRandomRecord())
  ElMessage.success('记录已更新')
}
</script>

<style scoped>
.access-monitor {
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

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-icon.primary {
  background: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.stat-icon.success {
  background: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.stat-icon.danger {
  background: rgba(245, 108, 108, 0.1);
  color: #F56C6C;
}

.monitor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.door-card {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
}

.door-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.door-name {
  font-size: 16px;
  font-weight: 500;
}

.door-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.door-info {
  color: #606266;
  font-size: 14px;
}

.door-info p {
  margin: 4px 0;
}

.door-actions {
  display: flex;
  justify-content: flex-end;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 200px;
}

.title {
  font-size: 16px;
  font-weight: 500;
}

.record-card {
  height: 100%;
}

.records-list {
  height: 600px;
  overflow-y: auto;
}

.record-item {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.person-name {
  font-weight: 500;
}

.record-details {
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 13px;
  flex-direction: column;
  gap: 4px;
}

.record-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.record-location {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
}

.record-time {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.record-action {
  color: #409EFF;
}

.stat-trend {
  font-size: 12px;
  margin-top: 4px;
}

.stat-trend.up {
  color: #67C23A;
}

.stat-trend.down {
  color: #F56C6C;
}

.detail-tabs {
  margin-top: 20px;
}

:deep(.el-timeline-item__content) {
  color: #606266;
}
</style> 