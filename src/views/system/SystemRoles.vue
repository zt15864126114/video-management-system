<template>
  <div class="system-roles">
    <el-row :gutter="20">
      <!-- 左侧角色列表 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span class="title">角色列表</span>
              <el-button type="primary" @click="handleAddRole">
                <el-icon><Plus /></el-icon>新增角色
              </el-button>
            </div>
          </template>

          <el-table :data="roles" style="width: 100%" v-loading="loading" @row-click="handleRoleSelect" highlight-current-row>
            <el-table-column prop="name" label="角色名称" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button-group>
                  <el-button type="primary" link @click="handleEditRole(row)">
                    <el-icon><Edit /></el-icon>编辑
                  </el-button>
                  <el-button type="danger" link @click="handleDeleteRole(row)">
                    <el-icon><Delete /></el-icon>删除
                  </el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧权限设置 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span class="title">权限设置{{ currentRole ? ` - ${currentRole.name}` : '' }}</span>
              <el-button type="primary" @click="handleSavePermissions">保存</el-button>
            </div>
          </template>

          <el-tree
            ref="permissionTree"
            :data="permissionTreeData"
            show-checkbox
            node-key="id"
            :default-checked-keys="currentRole?.permissions || []"
            :props="{ label: 'name' }"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 角色表单对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleRules"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitRole">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'

// 数据加载状态
const loading = ref(false)

// 角色列表
const roles = ref([
  {
    id: 1,
    name: '超级管理员',
    description: '系统最高权限',
    permissions: [1, 2, 3, 4, 5]
  },
  {
    id: 2,
    name: '操作员',
    description: '日常操作权限',
    permissions: [1, 2, 3]
  }
])

// 权限树
const permissionTreeData = [
  {
    id: 1,
    name: '系统管理',
    children: [
      {
        id: 2,
        name: '用户管理'
      },
      {
        id: 3,
        name: '角色管理'
      }
    ]
  },
  {
    id: 4,
    name: '业务管理',
    children: [
      {
        id: 5,
        name: '车辆管理'
      },
      {
        id: 6,
        name: '门禁管理'
      }
    ]
  }
]

// 当前选中的角色
const currentRole = ref(null)
const permissionTree = ref(null)

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const roleFormRef = ref(null)
const roleForm = ref({
  name: '',
  description: ''
})

// 表单验证规则
const roleRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ]
}

// 处理角色选择
const handleRoleSelect = (row) => {
  currentRole.value = row
  // 重置树的选中状态
  if (permissionTree.value) {
    permissionTree.value.setCheckedKeys(row.permissions || [])
  }
}

// 处理新增角色
const handleAddRole = () => {
  dialogType.value = 'add'
  roleForm.value = {
    name: '',
    description: ''
  }
  dialogVisible.value = true
  currentRole.value = null
}

// 处理编辑角色
const handleEditRole = (row) => {
  dialogType.value = 'edit'
  roleForm.value = { ...row }
  dialogVisible.value = true
  currentRole.value = row
}

// 处理删除角色
const handleDeleteRole = (row) => {
  ElMessageBox.confirm(
    `确定要删除角色 ${row.name} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
    if (currentRole.value?.id === row.id) {
      currentRole.value = null
    }
  })
}

// 处理表单提交
const handleSubmitRole = async () => {
  if (!roleFormRef.value) return
  
  await roleFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
      dialogVisible.value = false
    }
  })
}

// 处理保存权限
const handleSavePermissions = () => {
  if (!permissionTree.value) return
  const checkedKeys = permissionTree.value.getCheckedKeys()
  const halfCheckedKeys = permissionTree.value.getHalfCheckedKeys()
  const permissions = [...checkedKeys, ...halfCheckedKeys]
  
  ElMessage.success('权限保存成功')
}
</script>

<style scoped>
.system-roles {
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  background-color: var(--el-bg-color-page);
}

.el-row {
  height: 100%;
}

.el-col {
  height: 100%;
}

.el-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 16px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

:deep(.el-tree) {
  margin-top: 20px;
  height: calc(100% - 60px);
  overflow-y: auto;
}

:deep(.el-button-group) {
  .el-button {
    padding: 4px 8px;
  }
}

:deep(.el-table) {
  margin-top: 20px;
}

:deep(.el-dialog__body) {
  padding-top: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}
</style>