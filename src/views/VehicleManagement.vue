<template>
  <div class="vehicle-management">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>实时车辆监控</span>
              <el-select v-model="currentCamera" placeholder="选择监控点" style="width: 180px">
                <el-option
                  v-for="camera in cameras"
                  :key="camera.id"
                  :label="camera.name"
                  :value="camera.id"
                />
              </el-select>
            </div>
          </template>
          <div class="video-wrapper">
            <video-player :stream="currentCamera" :camera-info="cameraInfo" />
          </div>
          
          <div class="recognition-panel" v-if="currentVehicle">
            <div class="plate-number">{{ currentVehicle.plateNumber }}</div>
            <el-descriptions :column="3" border>
              <el-descriptions-item label="车辆类型">{{ currentVehicle.type }}</el-descriptions-item>
              <el-descriptions-item label="车辆颜色">{{ currentVehicle.color }}</el-descriptions-item>
              <el-descriptions-item label="车辆品牌">{{ currentVehicle.brand }}</el-descriptions-item>
              <el-descriptions-item label="进入时间">{{ currentVehicle.enterTime }}</el-descriptions-item>
              <el-descriptions-item label="所属部门">{{ currentVehicle.department }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="currentVehicle.status === '正常' ? 'success' : 'danger'">
                  {{ currentVehicle.status }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
            <div class="action-buttons">
              <el-button type="primary" @click="handleRecord">记录通行</el-button>
              <el-button type="warning" @click="handleAlert">异常报警</el-button>
              <el-button type="success" @click="handleCapture">抓拍图片</el-button>
            </div>
          </div>
        </el-card>

        <el-card class="mt-20">
          <template #header>
            <div class="card-header">
              <span>车流量统计</span>
              <el-radio-group v-model="chartType" size="small">
                <el-radio-button label="day">日统计</el-radio-button>
                <el-radio-button label="week">周统计</el-radio-button>
                <el-radio-button label="month">月统计</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <div ref="trafficChart" style="width: 100%; height: 300px"></div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="statistics-card">
          <div class="statistics-grid">
            <div class="statistic-item">
              <div class="statistic-title">今日进入</div>
              <div class="statistic-number">{{ statistics.todayEnter }}</div>
              <div class="statistic-change">
                <el-icon :class="statistics.enterChange >= 0 ? 'up' : 'down'">
                  <CaretTop v-if="statistics.enterChange >= 0" />
                  <CaretBottom v-else />
                </el-icon>
                {{ Math.abs(statistics.enterChange) }}%
              </div>
            </div>
            <div class="statistic-item">
              <div class="statistic-title">当前在校</div>
              <div class="statistic-number">{{ statistics.currentInSchool }}</div>
              <div class="statistic-desc">车辆数量</div>
            </div>
            <div class="statistic-item">
              <div class="statistic-title">异常记录</div>
              <div class="statistic-number warning">{{ statistics.abnormal }}</div>
              <div class="statistic-desc">需处理</div>
            </div>
          </div>
        </el-card>
        
        <el-card class="mt-20">
          <template #header>
            <div class="card-header">
              <span>最近记录</span>
              <div class="header-actions">
                <el-button type="primary" link @click="exportRecords">导出记录</el-button>
                <el-button type="primary" link @click="showFilter = true">筛选</el-button>
              </div>
            </div>
          </template>
          <el-table :data="recentRecords" height="500" style="width: 100%">
            <el-table-column prop="time" label="时间" width="150" />
            <el-table-column prop="plateNumber" label="车牌号" width="120" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.type === '进入' ? 'success' : 'info'">
                  {{ scope.row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag :type="scope.row.status === '正常' ? 'success' : 'danger'">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="120">
              <template #default="scope">
                <el-button type="primary" link @click="showDetail(scope.row)">
                  详情
                </el-button>
                <el-button type="danger" link @click="handleDelete(scope.row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

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
        <el-form-item label="车牌号">
          <el-input v-model="filterForm.plateNumber" placeholder="请输入车牌号" />
        </el-form-item>
        <el-form-item label="通行类型">
          <el-select v-model="filterForm.type" placeholder="请选择">
            <el-option label="全部" value="" />
            <el-option label="进入" value="进入" />
            <el-option label="离开" value="离开" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择">
            <el-option label="全部" value="" />
            <el-option label="正常" value="正常" />
            <el-option label="异常" value="异常" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetFilter">重置</el-button>
        <el-button type="primary" @click="applyFilter">应用筛选</el-button>
      </template>
    </el-drawer>

    <el-dialog
      v-model="showDetailDialog"
      title="通行记录详情"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item v-for="(value, key) in currentDetail" :key="key" :label="key">
          {{ value }}
        </el-descriptions-item>
      </el-descriptions>
      <div class="detail-images">
        <el-image
          v-for="(img, index) in currentDetail?.images"
          :key="index"
          :src="img"
          :preview-src-list="currentDetail?.images"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { CaretTop, CaretBottom } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import VideoPlayer from '../components/VideoPlayer.vue'
import * as echarts from 'echarts'

const currentStream = ref('entrance-camera-1')
const currentVehicle = ref(null)
const statistics = ref({
  todayEnter: 156,
  currentInSchool: 89,
  abnormal: 2
})

const recentRecords = ref([
  {
    id: 1,
    plateNumber: '京A12345',
    action: '进入校园',
    status: '正常',
    time: '2024-03-20 14:30:00'
  },
  {
    id: 2,
    plateNumber: '京B67890',
    action: '离开校园',
    status: '正常',
    time: '2024-03-20 14:25:00'
  },
  {
    id: 3,
    plateNumber: '京C11111',
    action: '尝试进入',
    status: '异常',
    time: '2024-03-20 14:20:00'
  }
])

// 监控点列表
const cameras = ref([
  { id: 'camera-1', name: '正门入口' },
  { id: 'camera-2', name: '后门入口' },
  { id: 'camera-3', name: '地下车库入口' },
  { id: 'camera-4', name: '访客停车场' }
])

const currentCamera = ref('camera-1')
const chartType = ref('day')
const trafficChart = ref(null)
const showFilter = ref(false)
const showDetailDialog = ref(false)
const currentDetail = ref(null)

// 筛选表单
const filterForm = ref({
  dateRange: [],
  plateNumber: '',
  type: '',
  status: ''
})

// 初始化图表
const initChart = () => {
  if (!trafficChart.value) return
  
  const chart = echarts.init(trafficChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['进入', '离开']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '进入',
        type: 'line',
        smooth: true,
        data: [10, 5, 15, 45, 30, 40, 35, 20]
      },
      {
        name: '离开',
        type: 'line',
        smooth: true,
        data: [5, 8, 12, 35, 40, 30, 40, 25]
      }
    ]
  }
  chart.setOption(option)
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 处理记录导出
const exportRecords = () => {
  ElMessage.success('记录导出成功')
}

// 处理筛选
const applyFilter = () => {
  console.log('应用筛选:', filterForm.value)
  showFilter.value = false
  ElMessage.success('筛选已应用')
}

const resetFilter = () => {
  filterForm.value = {
    dateRange: [],
    plateNumber: '',
    type: '',
    status: ''
  }
}

// 显示记录详情
const showDetail = (record) => {
  currentDetail.value = {
    ...record,
    车牌号: record.plateNumber,
    通行时间: record.time,
    通行类型: record.type,
    状态: record.status,
    车辆类型: '小型轿车',
    所属部门: '教务处',
    驾驶员: '张三',
    联系电话: '13800138000',
    备注: '正常通行',
    images: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg'
    ]
  }
  showDetailDialog.value = true
}

// 删除记录
const handleDelete = (record) => {
  ElMessageBox.confirm('确认删除该记录？', '提示', {
    type: 'warning'
  }).then(() => {
    recentRecords.value = recentRecords.value.filter(r => r.id !== record.id)
    ElMessage.success('记录已删除')
  })
}

// 车辆操作
const handleRecord = () => {
  ElMessage.success('已记录通行')
}

const handleAlert = () => {
  ElMessageBox.confirm('确认发起异常报警？', '警告', {
    type: 'warning',
    confirmButtonText: '确认报警',
    cancelButtonText: '取消'
  }).then(() => {
    ElMessage.warning('已发起异常报警')
  })
}

const handleCapture = () => {
  ElMessage.success('图片已抓拍并保存')
}

// 监听图表类型变化
watch(chartType, () => {
  // 实际项目中这里需要根据不同的统计类型请求数据
  initChart()
})

// 生命周期钩子
onMounted(() => {
  nextTick(() => {
    initChart()
  })
  
  // 模拟实时数据更新
  setInterval(() => {
    statistics.value.todayEnter++
    statistics.value.enterChange = Math.floor(Math.random() * 40) - 20
  }, 5000)
})
</script>

<style scoped>
.vehicle-management {
  padding: 20px;
}

.video-wrapper {
  width: 100%;
  height: 480px;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

/* 确保视频播放器填满容器 */
.video-wrapper :deep(.video-player) {
  width: 100%;
  height: 100%;
}

.recognition-panel {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.plate-number {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 16px;
  text-align: center;
}

.action-buttons {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px;
}

.statistic-item {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s;
}

.statistic-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.statistic-title {
  color: #666;
  margin-bottom: 8px;
}

.statistic-number {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
}

.statistic-number.warning {
  color: #ff4d4f;
}

.statistic-change {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 14px;
}

.statistic-change .up {
  color: #52c41a;
}

.statistic-change .down {
  color: #ff4d4f;
}

.statistic-desc {
  font-size: 14px;
  color: #999;
  margin-top: 8px;
}

.chart-container {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

.header-actions {
  display: flex;
  gap: 16px;
}

.detail-images {
  margin-top: 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.detail-images .el-image {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  overflow: hidden;
}

.mt-20 {
  margin-top: 20px;
}
</style> 