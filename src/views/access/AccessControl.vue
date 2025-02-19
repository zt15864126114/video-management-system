<template>
  <div class="access-control">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
<!--            <span class="title">门禁控制</span>-->
            <el-input
              v-model="searchQuery"
              placeholder="搜索门禁名称/位置"
              prefix-icon="Search"
              clearable
              class="search-input"
            />
            <el-select v-model="filterType" placeholder="门禁类型" clearable>
              <el-option label="全部" value="" />
              <el-option label="人脸识别" value="人脸识别" />
              <el-option label="刷卡门禁" value="刷卡门禁" />
              <el-option label="密码门禁" value="密码门禁" />
            </el-select>
          </div>
          <el-button-group>
            <el-button type="success" @click="showAddDialog = true">
              <el-icon><Plus /></el-icon>新增门禁
            </el-button>
            <el-button type="primary" @click="showTimingDialog = true">
              <el-icon><Timer /></el-icon>定时设置
            </el-button>
            <el-button type="success" @click="showPermissionDialog = true">
              <el-icon><User /></el-icon>权限设置
            </el-button>
          </el-button-group>
        </div>
      </template>

      <el-table :data="filteredDoors" style="width: 100%" border>
        <el-table-column prop="name" label="门禁名称" />
        <el-table-column prop="location" label="位置" />
        <el-table-column prop="type" label="类型">
          <template #default="{ row }">
            <el-tag>{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="openTime" label="开放时间" />
        <el-table-column prop="allowedGroups" label="允许通行">
          <template #default="{ row }">
            <el-tag
              v-for="group in row.allowedGroups"
              :key="group"
              class="group-tag"
              type="info"
              size="small"
            >
              {{ group }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="timing" label="定时设置">
          <template #default="{ row }">
            <el-tag v-if="row.timing" type="success">
              {{ row.timing.type === 'open' ? '定时开启' : '定时关闭' }}
              {{ row.timing.time }}
            </el-tag>
            <el-tag v-else type="info">未设置</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button-group>
              <el-button 
                type="primary" 
                link
                @click="handleTiming(row)"
              >
                定时
              </el-button>
              <el-button 
                type="success" 
                link
                @click="handlePermission(row)"
              >
                权限
              </el-button>
              <el-button
                type="warning"
                link
                @click="handleOpenTime(row)"
              >
                时间
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 定时设置对话框 -->
    <el-dialog
      v-model="showTimingDialog"
      title="定时设置"
      width="400px"
    >
      <el-form :model="timingForm" label-width="80px">
        <el-form-item label="门禁">
          <el-select v-model="timingForm.doorId" placeholder="选择门禁">
            <el-option
              v-for="door in doorList"
              :key="door.id"
              :label="door.name"
              :value="door.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="timingForm.type">
            <el-radio label="open">定时开启</el-radio>
            <el-radio label="close">定时关闭</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="时间">
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
        <el-button @click="showTimingDialog = false">取消</el-button>
        <el-button type="primary" @click="handleTimingSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 权限设置对话框 -->
    <el-dialog
      v-model="showPermissionDialog"
      title="权限设置"
      width="500px"
    >
      <el-form :model="permissionForm" label-width="80px">
        <el-form-item label="门禁">
          <el-select v-model="permissionForm.doorId" placeholder="选择门禁">
            <el-option
              v-for="door in doorList"
              :key="door.id"
              :label="door.name"
              :value="door.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="权限组">
          <el-checkbox-group v-model="permissionForm.groups">
            <el-checkbox 
              v-for="group in allGroups" 
              :key="group.key" 
              :label="group.key"
            >
              {{ group.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPermissionDialog = false">取消</el-button>
        <el-button type="primary" @click="handlePermissionSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 开放时间设置对话框 -->
    <el-dialog
      v-model="showOpenTimeDialog"
      title="开放时间设置"
      width="400px"
    >
      <el-form :model="openTimeForm" label-width="100px">
        <el-form-item label="工作日">
          <el-time-picker
            v-model="openTimeForm.workdayStart"
            format="HH:mm"
            placeholder="开始时间"
          />
          <span class="time-separator">至</span>
          <el-time-picker
            v-model="openTimeForm.workdayEnd"
            format="HH:mm"
            placeholder="结束时间"
          />
        </el-form-item>
        <el-form-item label="节假日">
          <el-time-picker
            v-model="openTimeForm.holidayStart"
            format="HH:mm"
            placeholder="开始时间"
          />
          <span class="time-separator">至</span>
          <el-time-picker
            v-model="openTimeForm.holidayEnd"
            format="HH:mm"
            placeholder="结束时间"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showOpenTimeDialog = false">取消</el-button>
        <el-button type="primary" @click="handleOpenTimeSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新增门禁对话框 -->
    <el-dialog
      v-model="showAddDialog"
      title="新增门禁"
      width="500px"
    >
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
        <el-form-item label="门禁名称" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入门禁名称" />
        </el-form-item>
        <el-form-item label="所在位置" prop="location">
          <el-select v-model="addForm.location" placeholder="选择位置">
            <el-option label="教学区" value="教学区" />
            <el-option label="实验区" value="实验区" />
            <el-option label="生活区" value="生活区" />
            <el-option label="运动区" value="运动区" />
            <el-option label="办公区" value="办公区" />
          </el-select>
        </el-form-item>
        <el-form-item label="门禁类型" prop="type">
          <el-select v-model="addForm.type" placeholder="选择类型">
            <el-option label="人脸识别" value="人脸识别" />
            <el-option label="刷卡门禁" value="刷卡门禁" />
            <el-option label="密码门禁" value="密码门禁" />
          </el-select>
        </el-form-item>
        <el-form-item label="开放时间" prop="openTime">
          <el-time-picker
            v-model="addForm.startTime"
            format="HH:mm"
            placeholder="开始时间"
          />
          <span class="time-separator">至</span>
          <el-time-picker
            v-model="addForm.endTime"
            format="HH:mm"
            placeholder="结束时间"
          />
        </el-form-item>
        <el-form-item label="允许通行" prop="allowedGroups">
          <el-checkbox-group v-model="addForm.allowedGroups">
            <el-checkbox label="教师">教师</el-checkbox>
            <el-checkbox label="学生">学生</el-checkbox>
            <el-checkbox label="工作人员">工作人员</el-checkbox>
            <el-checkbox label="访客">访客</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Timer, User, Search, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const doorList = ref([
  {
    id: 1,
    name: '教学楼正门',
    location: '教学区',
    type: '人脸识别',
    timing: { type: 'open', time: '07:30' },
    openTime: '07:00-22:00',
    allowedGroups: ['教师', '学生', '工作人员']
  },
  {
    id: 2,
    name: '图书馆入口',
    location: '教学区',
    type: '刷卡门禁',
    openTime: '08:00-22:30',
    allowedGroups: ['教师', '学生']
  },
  {
    id: 3,
    name: '实验楼大门',
    location: '实验区',
    type: '人脸识别',
    timing: { type: 'close', time: '22:00' },
    openTime: '08:00-22:00',
    allowedGroups: ['教师', '研究生', '实验室人员']
  },
  {
    id: 4,
    name: '宿舍楼A座',
    location: '生活区',
    type: '人脸识别',
    openTime: '06:00-23:00',
    allowedGroups: ['学生', '宿管人员']
  },
  {
    id: 5,
    name: '宿舍楼B座',
    location: '生活区',
    type: '人脸识别',
    openTime: '06:00-23:00',
    allowedGroups: ['学生', '宿管人员']
  },
  {
    id: 6,
    name: '食堂主入口',
    location: '生活区',
    type: '刷卡门禁',
    openTime: '06:30-20:00',
    allowedGroups: ['教师', '学生', '工作人员']
  },
  {
    id: 7,
    name: '体育馆入口',
    location: '运动区',
    type: '密码门禁',
    timing: { type: 'close', time: '22:00' },
    openTime: '09:00-22:00',
    allowedGroups: ['教师', '学生']
  },
  {
    id: 8,
    name: '游泳馆入口',
    location: '运动区',
    type: '刷卡门禁',
    timing: { type: 'close', time: '21:30' },
    openTime: '09:00-21:30',
    allowedGroups: ['教师', '学生', '会员']
  },
  {
    id: 9,
    name: '行政楼入口',
    location: '办公区',
    type: '人脸识别',
    openTime: '08:30-17:30',
    allowedGroups: ['教师', '行政人员']
  },
  {
    id: 10,
    name: '艺术楼入口',
    location: '教学区',
    type: '刷卡门禁',
    openTime: '08:00-22:00',
    allowedGroups: ['教师', '学生', '艺术系人员']
  }
])

// 搜索和筛选
const searchQuery = ref('')
const filterType = ref('')

// 过滤门禁列表
const filteredDoors = computed(() => {
  return doorList.value.filter(door => {
    const matchQuery = door.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                      door.location.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchType = !filterType.value || door.type === filterType.value
    return matchQuery && matchType
  })
})

const showTimingDialog = ref(false)
const showPermissionDialog = ref(false)
const showAddDialog = ref(false)

const timingForm = ref({
  doorId: '',
  type: 'open',
  time: null,
  repeat: []
})

const permissionForm = ref({
  doorId: '',
  groups: []
})

const allGroups = [
  { key: '教师', label: '教师' },
  { key: '学生', label: '学生' },
  { key: '工作人员', label: '工作人员' },
  { key: '访客', label: '访客' },
  { key: '研究生', label: '研究生' },
  { key: '行政人员', label: '行政人员' },
  { key: '宿管人员', label: '宿管人员' },
  { key: '实验室人员', label: '实验室人员' }
]

const addFormRef = ref(null)

const addForm = ref({
  name: '',
  location: '',
  type: '',
  startTime: null,
  endTime: null,
  allowedGroups: []
})

const addRules = {
  name: [
    { required: true, message: '请输入门禁名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请选择所在位置', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择门禁类型', trigger: 'change' }
  ],
  allowedGroups: [
    { type: 'array', required: true, message: '请选择允许通行的人员', trigger: 'change' }
  ]
}

const handleTiming = (door) => {
  timingForm.value.doorId = door.id
  if (door.timing) {
    timingForm.value = { ...door.timing, doorId: door.id }
  }
  showTimingDialog.value = true
}

const handlePermission = (door) => {
  permissionForm.value.doorId = door.id
  permissionForm.value.groups = door.allowedGroups.map(g => g)
  showPermissionDialog.value = true
}

const handleTimingSubmit = () => {
  if (!timingForm.value.time) {
    ElMessage.warning('请选择执行时间')
    return
  }
  
  const door = doorList.value.find(d => d.id === timingForm.value.doorId)
  if (door) {
    door.timing = {
      type: timingForm.value.type,
      time: timingForm.value.time.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      repeat: timingForm.value.repeat
    }
  }
  
  showTimingDialog.value = false
  ElMessage.success('定时设置成功')
}

const handlePermissionSubmit = () => {
  const door = doorList.value.find(d => d.id === permissionForm.value.doorId)
  if (door) {
    door.allowedGroups = permissionForm.value.groups
  }
  showPermissionDialog.value = false
  ElMessage.success('权限设置成功')
}

// 开放时间设置
const showOpenTimeDialog = ref(false)
const openTimeForm = ref({
  doorId: '',
  workdayStart: null,
  workdayEnd: null,
  holidayStart: null,
  holidayEnd: null
})

const handleOpenTime = (door) => {
  openTimeForm.value.doorId = door.id
  showOpenTimeDialog.value = true
}

const handleOpenTimeSubmit = () => {
  const door = doorList.value.find(d => d.id === openTimeForm.value.doorId)
  if (door) {
    const workdayTime = `${openTimeForm.value.workdayStart.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}-${openTimeForm.value.workdayEnd.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`
    door.openTime = workdayTime
  }
  showOpenTimeDialog.value = false
  ElMessage.success('开放时间设置成功')
}

const handleAddSubmit = async () => {
  if (!addFormRef.value) return
  
  await addFormRef.value.validate((valid, fields) => {
    if (valid) {
      const openTime = `${addForm.value.startTime.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })}-${addForm.value.endTime.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })}`
      
      const newDoor = {
        id: doorList.value.length + 1,
        name: addForm.value.name,
        location: addForm.value.location,
        type: addForm.value.type,
        openTime: openTime,
        allowedGroups: addForm.value.allowedGroups,
        deviceStatus: 'online'
      }
      
      doorList.value.push(newDoor)
      showAddDialog.value = false
      ElMessage.success('新增门禁成功')
      
      // 重置表单
      addFormRef.value.resetFields()
    } else {
      console.log('error submit!', fields)
    }
  })
}
</script>

<style scoped>
.access-control {
  height: 100%;
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

:deep(.el-transfer) {
  display: flex;
  justify-content: center;
  gap: 20px;
}

:deep(.el-checkbox-group) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
}

.group-tag {
  margin-right: 4px;
}

.time-separator {
  margin: 0 8px;
  color: #909399;
}

:deep(.el-table) {
  margin-top: 16px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
}
</style> 