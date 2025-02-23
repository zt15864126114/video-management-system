<template>
  <div class="alarm-management">
    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <div class="search-section" style="display: flex; align-items: center; gap: 16px;">
        <el-input
          v-model="searchKey"
          placeholder="搜索地点"
          prefix-icon="Search"
          clearable
          @input="handleSearch"
          style="width: 300px;"
        />
        <el-select v-model="filterType" placeholder="报警类型" style="width: 150px;">
          <el-option v-for="type in alarmTypes" :key="type" :label="type" :value="type" />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 250px;"
        />
      </div>
      <div class="action-buttons" style="display: flex; gap: 8px;">
        <el-button type="primary" @click="exportReport">导出报表</el-button>
        <el-button type="warning" @click="showEmergencyPlan">应急预案</el-button>
      </div>
    </div>

    <div class="main-content">
      <!-- 左侧：地图和报警列表 -->
      <div class="left-panel">
        <!-- 电子地图区域 -->
        <div class="mock-map-container">
          <div class="amap-wrapper" ref="mapContainer"></div>
          
          <!-- 地图图例 -->
          <div class="map-legend">
            <div class="legend-title">报警类型</div>
            <div class="legend-item" v-for="type in alarmTypes" :key="type">
              <el-tag :type="getAlarmTagType({type})">{{ type }}</el-tag>
            </div>
          </div>
        </div>

        <!-- 报警列表 -->
        <div class="alarm-list">
          <el-table :data="filteredAlarms" @row-click="handleAlarmSelect">
            <el-table-column prop="time" label="时间" width="150" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="location" label="位置" />
            <el-table-column label="等级" width="80">
              <template #default="{ row }">
                <el-tag :type="getSeverityType(row.severity)">
                  {{ row.severity }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 右侧：详情和统计 -->
      <div class="right-panel">
        <!-- 报警详情 -->
        <el-card class="alarm-detail" v-if="selectedAlarm">
          <template #header>
            <div class="detail-header">
              <span>报警详情</span>
              <div class="detail-actions" style="display: flex; gap: 8px;">
                <el-button type="success" size="small" @click="handleProcess">处理</el-button>
                <el-button type="danger" size="small" @click="handleEmergency">紧急处理</el-button>
              </div>
            </div>
          </template>
          
          <div class="detail-content">
            <div class="detail-item">
              <span class="label">报警类型：</span>
              <span>{{ selectedAlarm.type }}</span>
            </div>
            <div class="detail-item">
              <span class="label">报警时间：</span>
              <span>{{ selectedAlarm.time }}</span>
            </div>
            <div class="detail-item">
              <span class="label">报警位置：</span>
              <span>{{ selectedAlarm.location }}</span>
            </div>
            <div class="detail-item">
              <span class="label">报警描述：</span>
              <p>{{ selectedAlarm.description }}</p>
            </div>
            <div class="detail-item">
              <span class="label">处理记录：</span>
              <el-timeline>
                <el-timeline-item
                  v-for="(record, index) in selectedAlarm.processRecords"
                  :key="index"
                  :timestamp="record.time">
                  {{ record.action }}
                </el-timeline-item>
              </el-timeline>
            </div>
          </div>
        </el-card>

        <!-- 统计分析 -->
        <el-card class="statistics-panel">
          <template #header>
            <div class="statistics-header">
              <span>报警类型分布</span>
              <el-select v-model="statsPeriod" size="small">
                <el-option label="今日" value="today" />
                <el-option label="本周" value="week" />
                <el-option label="本月" value="month" />
              </el-select>
            </div>
          </template>
          
          <div class="statistics-content">
            <div class="chart-container">
              <div class="chart" ref="typeChart"></div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 添加应急预案对话框 -->
    <emergency-plan-dialog
      v-model:visible="emergencyPlanVisible"
      :alarm-type="selectedAlarm?.type"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import EmergencyPlanDialog from '../components/EmergencyPlanDialog.vue'
import AMapLoader from '@amap/amap-jsapi-loader'

// 状态定义
const searchKey = ref('')
const filterType = ref('')
const dateRange = ref([])
const selectedAlarm = ref(null)
const statsPeriod = ref('today')

// 报警类型定义
const alarmTypes = [
  '入侵报警',
  '火灾报警',
  '求助报警',
  '设备故障',
  '异常行为'
]

// 地图相关
const mapContainer = ref(null)
const map = ref(null)
const markers = ref([])

// 统计数据
const statistics = ref({
  total: 156,
  processing: 23,
  resolved: 133
})

// 更新报警记录数据，添加经纬度坐标
const alarmRecords = ref([
  {
    id: 1,
    type: '入侵报警',
    time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), // 5天前
    location: '图书馆后门',
    severity: '高',
    status: '处理中',
    description: '发现可疑人员尝试翻越围墙',
    coordinates: {
      longitude: 116.5862,
      latitude: 35.5501
    },
    processRecords: [
      { time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), action: '系统自动报警' },
      { time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), action: '安保人员已派出' }
    ]
  },
  {
    id: 2,
    type: '火灾报警',
    time: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), // 10天前
    location: '教学楼',
    severity: '高',
    status: '处理中',
    description: '发现烟雾报警',
    coordinates: {
      longitude: 116.5862,
      latitude: 35.5501
    },
    processRecords: [
      { time: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), action: '系统自动报警' }
    ]
  },
  {
    id: 3,
    type: '求助报警',
    time: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), // 15天前
    location: '宿舍楼',
    severity: '中',
    status: '待处理',
    description: '学生按下紧急求助按钮',
    coordinates: {
      longitude: 116.5862,
      latitude: 35.5501
    },
    processRecords: [
      { time: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), action: '系统自动报警' }
    ]
  },
  {
    id: 4,
    type: '设备故障',
    time: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), // 20天前
    location: '实验室',
    severity: '低',
    status: '已处理',
    description: '实验室设备故障',
    coordinates: {
      longitude: 116.5862,
      latitude: 35.5501
    },
    processRecords: [
      { time: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), action: '技术人员已到达' },
      { time: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), action: '设备已修复' }
    ]
  },
  {
    id: 5,
    type: '异常行为',
    time: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), // 25天前
    location: '操场',
    severity: '中',
    status: '待处理',
    description: '发现可疑人员在操场徘徊',
    coordinates: {
      longitude: 116.5862,
      latitude: 35.5501
    },
    processRecords: [
      { time: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), action: '系统自动报警' }
    ]
  },
  {
    id: 6,
    type: '火灾报警',
    time: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), // 30天前
    location: '食堂',
    severity: '高',
    status: '已处理',
    description: '食堂烟雾报警',
    coordinates: {
      longitude: 116.5862,
      latitude: 35.5501
    },
    processRecords: [
      { time: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), action: '系统自动报警' },
      { time: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '), action: '安保人员已到达' }
    ]
  }
])

// 计算属性
const filteredAlarms = computed(() => {
  return alarmRecords.value.filter(alarm => {
    if (searchKey.value && !alarm.location.includes(searchKey.value)) return false
    if (filterType.value && alarm.type !== filterType.value) return false
    // 添加日期范围过滤
    return true
  })
})

const activeAlarms = computed(() => {
  return alarmRecords.value.filter(alarm => alarm.status !== '已处理')
})

// 方法定义
const handleAlarmSelect = (alarm) => {
  selectedAlarm.value = alarm
}

// 搜索功能
const handleSearch = async () => {
  if (searchKey.value) {
    const AMap = await AMapLoader.load({
      key: '1a2f2df0472a2170783ca5d5e7a3c7e0',
      version: '2.0',
      plugins: ['AMap.Autocomplete', 'AMap.Geocoder']
    })

    const autocomplete = new AMap.Autocomplete({
      input: 'searchKey'
    })

    autocomplete.search(searchKey.value, (status, result) => {
      if (status === 'complete' && result.tips) {
        const firstResult = result.tips[0]
        const position = firstResult.location.split(',').map(Number)
        map.value.setCenter(position) // 设置地图中心
        new AMap.Marker({
          position: position,
          title: firstResult.name,
          map: map.value
        })
      } else {
        ElMessage.error('未找到相关地点')
      }
    })
  }
}

// 获取报警类型对应的颜色
const getAlarmColor = (type) => {
  const colors = {
    '入侵报警': '#F56C6C',
    '火灾报警': '#E6A23C',
    '求助报警': '#409EFF',
    '设备故障': '#909399',
    '异常行为': '#67C23A'
  }
  return colors[type] || '#909399'
}

const getSeverityType = (severity) => {
  const types = {
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return types[severity] || 'info'
}

const getStatusType = (status) => {
  const types = {
    '处理中': 'warning',
    '已处理': 'success',
    '待处理': 'info'
  }
  return types[status] || 'info'
}

// 处理报警
const handleProcess = () => {
  if (!selectedAlarm.value) return;
  
  // 更新报警状态
  const alarmIndex = alarmRecords.value.findIndex(alarm => alarm.id === selectedAlarm.value.id);
  if (alarmIndex !== -1) {
    alarmRecords.value[alarmIndex].status = '已处理'; // 更新状态
    ElMessage.success('报警已处理');
    selectedAlarm.value = null; // 清空选中的报警
  }
}

// 紧急处理
const handleEmergency = () => {
  if (!selectedAlarm.value) return;
  
  // 更新报警状态
  const alarmIndex = alarmRecords.value.findIndex(alarm => alarm.id === selectedAlarm.value.id);
  if (alarmIndex !== -1) {
    alarmRecords.value[alarmIndex].status = '紧急处理'; // 更新状态
    ElMessage.warning('已启动紧急处理流程');
    selectedAlarm.value = null; // 清空选中的报警
  }
}

const showEmergencyPlan = () => {
  emergencyPlanVisible.value = true
}

const exportReport = () => {
  // 导出报表逻辑
  ElMessage.success('报表导出成功')
}

// 添加 getAlarmTagType 函数
const getAlarmTagType = (alarm) => {
  const types = {
    '入侵报警': 'danger',
    '火灾报警': 'danger',
    '求助报警': 'warning',
    '设备故障': 'info',
    '异常行为': 'warning'
  }
  return types[alarm.type] || 'info'
}

// 添加应急预案对话框控制
const emergencyPlanVisible = ref(false)

// 图表相关
const typeChart = ref(null)

// 初始化类型分布图表
const initTypeChart = () => {
  nextTick(() => {
    if (typeChart.value) {
      const chart = echarts.init(typeChart.value)
      const option = {
        title: {
          text: '报警类型分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'horizontal',
          bottom: 'bottom'
        },
        series: [
          {
            name: '报警类型',
            type: 'pie',
            radius: ['40%', '70%'],  // 环形图
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              formatter: '{b}: {c}件'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '16',
                fontWeight: 'bold'
              }
            },
            data: [
              { 
                value: 35, 
                name: '入侵报警',
                itemStyle: { color: '#F56C6C' }
              },
              { 
                value: 25, 
                name: '火灾报警',
                itemStyle: { color: '#E6A23C' }
              },
              { 
                value: 20, 
                name: '求助报警',
                itemStyle: { color: '#409EFF' }
              },
              { 
                value: 15, 
                name: '设备故障',
                itemStyle: { color: '#909399' }
              },
              { 
                value: 5, 
                name: '异常行为',
                itemStyle: { color: '#67C23A' }
              }
            ]
          }
        ]
      }
      chart.setOption(option)
    } else {
      console.error('类型分布图表容器未找到')
    }
  })
}

// 初始化地图
const initMap = async () => {
  try {
    const AMap = await AMapLoader.load({
      key: '1a2f2df0472a2170783ca5d5e7a3c7e0',
      version: '1.4.15',
      plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.MapType']
    });

    map.value = new AMap.Map(mapContainer.value, {
      zoom: 17, // 放大缩放级别，以便更清晰地看到学校
      center: [116.5862, 35.5501],  // 兖州一中的坐标
      viewMode: '2D',
      resizeEnable: true,
      pitch: 0,
      rotation: 0,
      layers: [
        new AMap.TileLayer(),
        new AMap.TileLayer.RoadNet()  // 只保留路网图层，移除卫星图层
      ]
    });

    // 添加地图类型切换控件
    map.value.addControl(new AMap.MapType({
      defaultType: 0,
      showRoad: true
    }));

    // 添加比例尺控件
    map.value.addControl(new AMap.Scale({
      position: 'LB'
    }));

    // 添加工具条控件
    map.value.addControl(new AMap.ToolBar({
      position: 'RB'
    }));

    // 添加默认标记
    const marker = new AMap.Marker({
      position: [116.5862, 35.5501],
      title: '济宁市兖州区第一中学',
      label: {
        content: '济宁市兖州区第一中学',
        direction: 'top'
      }
    });
    marker.setMap(map.value);

    // 添加报警标记
    addAlarmMarkers()
  } catch (error) {
    console.error('地图加载失败:', error)
    ElMessage.error('地图加载失败')
  }
}

// 添加报警标记
const addAlarmMarkers = () => {
  // 清除现有标记
  markers.value.forEach(marker => marker.remove())
  markers.value = []

  // 添加新标记
  activeAlarms.value.forEach(alarm => {
    const color = getAlarmColor(alarm.type);
    const marker = new AMap.Marker({
      position: [alarm.coordinates.longitude, alarm.coordinates.latitude],
      title: alarm.type,
      label: {
        content: alarm.type,
        direction: 'top'
      },
      icon: new AMap.Icon({
        size: new AMap.Size(30, 30), // 自定义图标大小
        image: alarm.type === '异常行为' ? 'path/to/your/icon.png' : 'path/to/default/icon.png', // 使用不同的图标
        imageSize: new AMap.Size(30, 30) // 图标的实际大小
      })
    });

    // 添加点击事件
    marker.on('click', () => {
      handleAlarmSelect(alarm);
      // 显示信息窗口
      const infoWindow = new AMap.InfoWindow({
        content: `<div>${alarm.type}: ${alarm.description}</div>`,
        position: marker.getPosition() // 信息窗口位置
      });
      infoWindow.open(map.value, marker.getPosition());
    });

    // 添加自定义样式
    marker.setMap(map.value);
    markers.value.push(marker);
  });
}

// 生命周期钩子
onMounted(() => {
  initMap()
  initTypeChart()

  // 设置默认显示的报警详情为当前的异常报警
  const currentAlarm = alarmRecords.value.find(alarm => alarm.type === '异常行为');
  if (currentAlarm) {
    selectedAlarm.value = currentAlarm;
  }

  // 修改 resize 事件监听
  window.addEventListener('resize', () => {
    if (map.value) {
      map.value.resize() // 确保 map.value 是有效的地图实例
    }
    const typeChartInstance = echarts.getInstanceByDom(typeChart.value)
    typeChartInstance?.resize()
  })
})
</script>

<style scoped>
.alarm-management {
  height: 100vh;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-section {
  display: flex;
  gap: 16px;
}

.main-content {
  flex: 1;
  display: flex;
  gap: 16px;
  min-height: 0;
}

.left-panel {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mock-map-container {
  height: 400px;
  background: #f0f0f0; /* 更柔和的背景色 */
  border-radius: 8px;
  padding: 16px;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 更明显的阴影 */
}

.amap-wrapper {
  height: 100%;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
}

.map-legend {
  position: absolute;
  bottom: 24px;
  right: 24px;
  background: rgba(255, 255, 255, 0.8); /* 半透明背景 */
  padding: 12px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.legend-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
}

.legend-item {
  margin: 4px 0;
}

.alarm-list {
  flex: 1;
  background: white;
  border-radius: 8px;
  overflow: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: auto;
  max-height: calc(100vh - 100px);
}

.alarm-detail {
  flex: none;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.statistics-panel {
  flex: none;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.statistics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px; /* 增加顶部间距 */
}

.chart {
  width: 100%; /* 使图表宽度自适应 */
  max-width: 600px; /* 设置最大宽度 */
  height: 300px; /* 设置高度 */
  background: #f5f7fa; /* 背景色 */
  border-radius: 4px; /* 圆角 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 阴影效果 */
}

.detail-header, .statistics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #ffffff; /* 统一背景色 */
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.detail-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.detail-item .label {
  font-weight: bold;
  min-width: 80px;
  flex-shrink: 0;
}

.detail-item p {
  margin: 0;
  white-space: pre-wrap;
}

.el-timeline {
  margin-top: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.el-timeline-item {
  padding-bottom: 16px;
}

.statistics-content {
  padding: 16px;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.custom-marker {
  padding: 8px 16px;
  background: #409EFF; /* 使用主色调 */
  border-radius: 4px;
  color: white;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.2s; /* 添加过渡效果 */
}

.custom-marker:hover {
  transform: scale(1.1); /* 悬停时放大 */
}

.info-window {
  padding: 10px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.pulse {
  animation: pulse 1.5s infinite;
}

.bounce {
  animation: bounce 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.detail-actions {
  display: flex;
  gap: 8px; /* 确保按钮之间有间距 */
}

.el-button {
  min-width: 100px; /* 确保按钮宽度一致 */
}
</style>
