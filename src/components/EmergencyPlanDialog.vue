<template>
  <el-dialog
    title="应急预案"
    :visible="visible"
    width="70%"
    :before-close="handleClose"
  >
    <div class="emergency-plan">
      <el-tabs v-model="activePlan">
        <el-tab-pane 
          v-for="plan in emergencyPlans" 
          :key="plan.type" 
          :label="plan.type" 
          :name="plan.type"
        >
          <div class="plan-content">
            <div class="plan-header">
              <h3>{{ plan.title }}</h3>
              <el-tag :type="plan.level === '紧急' ? 'danger' : 'warning'">
                {{ plan.level }}
              </el-tag>
            </div>
            
            <div class="steps-container">
              <el-steps direction="vertical" :active="1">
                <el-step 
                  v-for="(step, index) in plan.steps" 
                  :key="index"
                  :title="step.title"
                  :description="step.description"
                />
              </el-steps>
            </div>

            <div class="contacts">
              <h4>应急联系人</h4>
              <el-table :data="plan.contacts" border>
                <el-table-column prop="name" label="姓名" width="120" />
                <el-table-column prop="role" label="职责" width="150" />
                <el-table-column prop="phone" label="联系电话" />
                <el-table-column label="操作" width="150">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" @click="handleCall(row)">
                      呼叫
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleActivatePlan">
          启动预案
        </el-button>
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: Boolean,
  alarmType: String
})

const emit = defineEmits(['update:visible'])

const activePlan = ref('')

// 模拟应急预案数据
const emergencyPlans = [
  {
    type: '入侵报警',
    title: '校园入侵应急预案',
    level: '紧急',
    steps: [
      {
        title: '确认警情',
        description: '安保人员立即赶往现场确认警情'
      },
      {
        title: '现场处置',
        description: '对可疑人员进行盘查，必要时报警'
      },
      {
        title: '安全防范',
        description: '加强周边区域巡查，防止类似事件发生'
      }
    ],
    contacts: [
      {
        name: '张三',
        role: '安保队长',
        phone: '13800138000'
      },
      {
        name: '李四',
        role: '保卫处主任',
        phone: '13800138001'
      }
    ]
  },
  {
    type: '火灾报警',
    title: '校园火灾应急预案',
    level: '紧急',
    steps: [
      {
        title: '火情确认',
        description: '确认火灾位置和范围'
      },
      {
        title: '疏散人员',
        description: '立即组织人员疏散，确保人身安全'
      },
      {
        title: '消防处置',
        description: '启动消防设施，联系消防部门'
      }
    ],
    contacts: [
      {
        name: '王五',
        role: '消防安全员',
        phone: '13800138002'
      }
    ]
  }
]

const handleClose = () => {
  emit('update:visible', false)
}

const handleCall = (contact) => {
  ElMessage.success(`正在呼叫${contact.name}: ${contact.phone}`)
}

const handleActivatePlan = () => {
  ElMessage.warning(`已启动${activePlan.value}应急预案`)
  handleClose()
}
</script>

<style scoped>
.emergency-plan {
  padding: 20px;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.steps-container {
  margin: 20px 0;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.contacts {
  margin-top: 20px;
}

.contacts h4 {
  margin-bottom: 15px;
}
</style> 