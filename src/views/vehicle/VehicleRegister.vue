<template>
  <div class="vehicle-register">
    <!-- 顶部统计卡片 -->
    <div class="statistics-row">
      <div v-for="stat in statsData" :key="stat.label" class="stat-card">
        <div class="stat-icon" :class="stat.type">
          <el-icon><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧列表 -->
      <el-card class="vehicle-list-card">
        <template #header>
          <div class="card-header">
            <div class="header-left">
<!--              <span class="title">已登记车辆</span>-->
              <div class="search-bar">
                <el-input
                  v-model="searchQuery"
                  placeholder="搜索车牌号/车主"
                  prefix-icon="Search"
                  clearable
                />
                <el-select v-model="filterType" placeholder="车辆类型" clearable>
                  <el-option label="全部" value="" />
                  <el-option label="教职工车辆" value="staff" />
                  <el-option label="学生车辆" value="student" />
                  <el-option label="访客车辆" value="visitor" />
                </el-select>
              </div>
            </div>
            <div class="header-btns">
              <el-button type="success" @click="handleImportTemplate">
                <el-icon><Download /></el-icon>下载模板
              </el-button>
              <el-upload
                class="upload-btn"
                action="/api/vehicles/import"
                :show-file-list="false"
                :before-upload="beforeUpload"
              >
                <el-button type="primary">
                  <el-icon><Upload /></el-icon>批量导入
                </el-button>
              </el-upload>
              <el-button type="primary" @click="handleExport">
                <el-icon><Download /></el-icon>导出数据
              </el-button>
            </div>
          </div>
        </template>

        <el-table
          :data="filteredVehicles"
          style="width: 100%"
          height="calc(100vh - 280px)"
          @selection-change="handleSelectionChange"
          @row-click="handleRowClick"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="plateNumber" label="车牌号" width="120" />
          <el-table-column prop="owner" label="车主" width="100" />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.type === 'staff' ? 'success' : row.type === 'student' ? 'warning' : 'info'">
                {{ row.type === 'staff' ? '教职工' : row.type === 'student' ? '学生' : '访客' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="联系电话" width="120" />
          <el-table-column prop="validPeriod" label="有效期" min-width="200">
            <template #default="{ row }">
              {{ formatDateRange(row.validPeriod) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" fixed="right">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
                {{ row.status === 'active' ? '有效' : '过期' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button-group>
                <el-button type="primary" link @click.stop="handleEdit(row)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button type="danger" link @click.stop="handleDelete(row)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalVehicles"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>

      <!-- 右侧详情/表单 -->
      <el-card class="vehicle-detail-card">
        <template #header>
          <div class="card-header">
            <span class="title">{{ isEditing ? '编辑车辆' : '车辆登记' }}</span>
            <div class="header-btns" v-if="isEditing">
              <el-button @click="cancelEdit">取消编辑</el-button>
            </div>
          </div>
        </template>

        <el-form 
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
          class="register-form"
        >
          <el-form-item label="车牌号" prop="plateNumber">
            <el-input v-model="form.plateNumber" placeholder="请输入车牌号" />
          </el-form-item>
          
          <el-form-item label="车主姓名" prop="owner">
            <el-input v-model="form.owner" placeholder="请输入车主姓名" />
          </el-form-item>
          
          <el-form-item label="车辆类型" prop="type">
            <el-select v-model="form.type" placeholder="请选择车辆类型" style="width: 100%">
              <el-option label="教职工车辆" value="staff" />
              <el-option label="学生车辆" value="student" />
              <el-option label="访客车辆" value="visitor" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入联系电话" />
          </el-form-item>
          
          <el-form-item label="车辆品牌" prop="brand">
            <el-cascader
              v-model="form.brand"
              :options="carBrands"
              :props="{ expandTrigger: 'hover' }"
              placeholder="请选择车辆品牌"
            />
          </el-form-item>
          
          <el-form-item label="车辆颜色" prop="color">
            <el-select v-model="form.color" placeholder="请选择车辆颜色">
              <el-option
                v-for="color in carColors"
                :key="color.value"
                :label="color.label"
                :value="color.value"
              >
                <div class="color-option">
                  <div class="color-block" :style="{ background: color.hex }" />
                  <span>{{ color.label }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="有效期限" prop="validPeriod">
            <el-date-picker
              v-model="form.validPeriod"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :shortcuts="dateShortcuts"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="停车区域" prop="parkingArea">
            <el-select v-model="form.parkingArea" placeholder="请选择停车区域">
              <el-option-group
                v-for="group in parkingAreas"
                :key="group.label"
                :label="group.label"
              >
                <el-option
                  v-for="area in group.options"
                  :key="area.value"
                  :label="area.label"
                  :value="area.value"
                />
              </el-option-group>
            </el-select>
          </el-form-item>
          
          <el-form-item label="备注">
            <el-input 
              v-model="form.remark" 
              type="textarea" 
              :rows="3"
              placeholder="请输入备注信息" 
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSubmit">
              {{ isEditing ? '保存修改' : '提交登记' }}
            </el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  Search, Upload, Download, Delete, Edit, 
  Van, DataLine, Warning 
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 模拟的车辆数据
const vehicles = ref([
  {
    id: 1,
    plateNumber: '鲁H8A7B6',
    owner: '张志强',
    type: 'staff',
    phone: '13800138000',
    brand: ['大众', '帕萨特'],
    color: '白色',
    validPeriod: [new Date('2024-01-01'), new Date('2024-12-31')],
    parkingArea: 'A1',
    status: 'active',
    remark: '教师停车证'
  },
  {
    id: 4,
    plateNumber: '鲁H5N9K2',
    owner: '刘晓华',
    type: 'staff',
    phone: '13876543210',
    brand: ['奥迪', 'A6L'],
    color: '黑色',
    validPeriod: [new Date('2024-01-01'), new Date('2024-12-31')],
    parkingArea: 'A2',
    status: 'active',
    remark: '系主任专用车位'
  },
  {
    id: 5,
    plateNumber: '鲁H2M7R4',
    owner: '赵明',
    type: 'student',
    phone: '13987654321',
    brand: ['比亚迪', '汉'],
    color: '红色',
    validPeriod: [new Date('2024-01-01'), new Date('2024-06-30')],
    parkingArea: 'B1',
    status: 'active',
    remark: '研究生'
  },
  {
    id: 6,
    plateNumber: '鲁H9C3V8',
    owner: '孙艳',
    type: 'staff',
    phone: '13765432109',
    brand: ['丰田', '卡罗拉'],
    color: '银色',
    validPeriod: [new Date('2024-01-01'), new Date('2024-12-31')],
    parkingArea: 'A1',
    status: 'active',
    remark: '图书馆工作人员'
  },
  {
    id: 7,
    plateNumber: '鲁H7K4X9',
    owner: '王浩',
    type: 'student',
    phone: '13654321098',
    brand: ['长安', '逸动'],
    color: '蓝色',
    validPeriod: [new Date('2024-01-01'), new Date('2024-06-30')],
    parkingArea: 'B2',
    status: 'active',
    remark: '大四学生'
  },
  {
    id: 8,
    plateNumber: '鲁H3B6P1',
    owner: '陈静',
    type: 'staff',
    phone: '13543210987',
    brand: ['本田', 'CR-V'],
    color: '深灰色',
    validPeriod: [new Date('2024-01-01'), new Date('2024-12-31')],
    parkingArea: 'A3',
    status: 'active',
    remark: '后勤处'
  },
  {
    id: 9,
    plateNumber: '鲁H1F8D5',
    owner: '杨光',
    type: 'visitor',
    phone: '13432109876',
    brand: ['现代', '索纳塔'],
    color: '白色',
    validPeriod: [new Date('2024-03-15'), new Date('2024-03-17')],
    parkingArea: 'C1',
    status: 'active',
    remark: '学术交流访客'
  },
  {
    id: 10,
    plateNumber: '鲁H6T2L7',
    owner: '周婷',
    type: 'staff',
    phone: '13321098765',
    brand: ['马自达', '阿特兹'],
    color: '红色',
    validPeriod: [new Date('2024-01-01'), new Date('2024-12-31')],
    parkingArea: 'A2',
    status: 'active',
    remark: '教务处'
  },
  {
    id: 11,
    plateNumber: '鲁H4W9H3',
    owner: '李强',
    type: 'student',
    phone: '13210987654',
    brand: ['吉利', '帝豪'],
    color: '银色',
    validPeriod: [new Date('2024-01-01'), new Date('2024-06-30')],
    parkingArea: 'B1',
    status: 'active',
    remark: '研究生会主席'
  },
  {
    id: 12,
    plateNumber: '鲁H8E5Y2',
    owner: '张萍',
    type: 'staff',
    phone: '13109876543',
    brand: ['大众', '速腾'],
    color: '黑色',
    validPeriod: [new Date('2024-01-01'), new Date('2024-12-31')],
    parkingArea: 'A1',
    status: 'active',
    remark: '人事处'
  }
])

// 过滤车辆列表
const filteredVehicles = computed(() => {
  return vehicles.value.filter(vehicle => {
    const matchQuery = !searchQuery.value || 
      (vehicle.plateNumber + vehicle.owner).toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchType = !filterType.value || vehicle.type === filterType.value
    return matchQuery && matchType
  })
})

// 统计数据
const statsData = ref([
  {
    label: '总登记车辆',
    value: vehicles.value.length.toString(),
    icon: 'Van',
    type: 'primary'
  },
  {
    label: '本月新增',
    value: '45',
    icon: 'DataLine',
    type: 'success'
  },
  {
    label: '即将过期',
    value: '12',
    icon: 'Warning',
    type: 'danger'
  }
])

// 搜索和筛选
const searchQuery = ref('')
const filterType = ref('')

// 车辆品牌数据
const carBrands = [
  {
    value: '大众',
    label: '大众',
    children: [
      { value: '帕萨特', label: '帕萨特' },
      { value: '迈腾', label: '迈腾' },
      { value: '速腾', label: '速腾' }
    ]
  },
  {
    value: '丰田',
    label: '丰田',
    children: [
      { value: '凯美瑞', label: '凯美瑞' },
      { value: '卡罗拉', label: '卡罗拉' },
      { value: '汉兰达', label: '汉兰达' }
    ]
  },
  {
    value: '本田',
    label: '本田',
    children: [
      { value: '雅阁', label: '雅阁' },
      { value: '思域', label: '思域' },
      { value: 'CR-V', label: 'CR-V' }
    ]
  }
]

// 车辆颜色数据
const carColors = [
  { value: '白色', label: '白色', hex: '#FFFFFF' },
  { value: '黑色', label: '黑色', hex: '#000000' },
  { value: '银色', label: '银色', hex: '#C0C0C0' },
  { value: '深灰色', label: '深灰色', hex: '#666666' },
  { value: '红色', label: '红色', hex: '#FF0000' },
  { value: '蓝色', label: '蓝色', hex: '#0000FF' }
]

// 停车区域数据
const parkingAreas = [
  {
    label: '教职工区域',
    options: [
      { value: 'A1', label: 'A区教师停车场' },
      { value: 'A2', label: 'B区教师停车场' },
      { value: 'A3', label: 'C区教师停车场' }
    ]
  },
  {
    label: '学生区域',
    options: [
      { value: 'B1', label: '学生停车场1' },
      { value: 'B2', label: '学生停车场2' }
    ]
  },
  {
    label: '访客区域',
    options: [
      { value: 'C1', label: '访客停车场' }
    ]
  }
]

// 日期快捷选项
const dateShortcuts = [
  {
    text: '一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  },
  {
    text: '半年',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 180)
      return [start, end]
    }
  },
  {
    text: '一年',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 365)
      return [start, end]
    }
  }
]

// 表单数据和验证规则
const formRef = ref(null)
const form = ref({
  plateNumber: '',
  owner: '',
  type: '',
  phone: '',
  brand: [],
  color: '',
  validPeriod: '',
  parkingArea: '',
  remark: ''
})

const rules = {
  plateNumber: [
    { required: true, message: '请输入车牌号', trigger: 'blur' },
    { pattern: /^[A-Z0-9]{5}$/, message: '请输入正确的车牌号格式', trigger: 'blur' }
  ],
  owner: [
    { required: true, message: '请输入车主姓名', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择车辆类型', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  brand: [
    { required: true, message: '请选择车辆品牌', trigger: 'change' }
  ],
  color: [
    { required: true, message: '请选择车辆颜色', trigger: 'change' }
  ],
  validPeriod: [
    { required: true, message: '请选择有效期限', trigger: 'change' }
  ],
  parkingArea: [
    { required: true, message: '请选择停车区域', trigger: 'change' }
  ]
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      ElMessage.success('登记成功')
      resetForm()
    } else {
      console.log('error submit!', fields)
    }
  })
}

// 重置表单
const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}

// 文件上传前检查
const beforeUpload = (file) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  if (!isExcel) {
    ElMessage.error('只能上传 Excel 文件！')
    return false
  }
  return true
}

// 下载模板
const handleImportTemplate = () => {
  // 这里添加下载模板的逻辑
  ElMessage.success('模板下载成功')
}

// 导出数据
const handleExport = () => {
  ElMessage.success('数据导出成功')
}

// 批量删除
const handleBatchDelete = () => {
  if (!selectedVehicles.value.length) return
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedVehicles.value.length} 条记录吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
  })
}

// 编辑车辆
const handleEdit = (row) => {
  console.log('编辑车辆', row)
}

// 删除车辆
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除车牌号为 ${row.plateNumber} 的车辆记录吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
  })
}

// 选择变化
const selectedVehicles = ref([])
const handleSelectionChange = (selection) => {
  selectedVehicles.value = selection
}

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const totalVehicles = computed(() => vehicles.value.length)

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 格式化日期范围
const formatDateRange = (dateRange) => {
  if (!dateRange || !Array.isArray(dateRange)) return ''
  const start = new Date(dateRange[0]).toLocaleDateString()
  const end = new Date(dateRange[1]).toLocaleDateString()
  return `${start} 至 ${end}`
}
</script>

<style scoped>
.vehicle-register {
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.statistics-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
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

.main-content {
  flex: 1;
  display: flex;
  gap: 20px;
  min-height: 0;
}

.vehicle-list-card {
  width: 60%;
  display: flex;
  flex-direction: column;
}

.vehicle-detail-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-bar {
  display: flex;
  gap: 12px;
}

.header-btns {
  display: flex;
  gap: 12px;
}

.title {
  font-size: 16px;
  font-weight: 500;
}

.color-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-block {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.pagination-container {
  margin-top: 20px;
  padding: 10px 20px;
  background: #fff;
  border-top: 1px solid #ebeef5;
}

:deep(.el-card__body) {
  flex: 1;
  overflow: auto;
}

:deep(.el-form-item__content) {
  flex-wrap: nowrap;
}

.register-form {
  padding: 20px;
}

:deep(.el-input),
:deep(.el-select),
:deep(.el-cascader),
:deep(.el-date-editor) {
  width: 100%;
}
</style> 