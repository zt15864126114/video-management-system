<template>
  <div class="system-users">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="title">用户管理</span>
            <el-input
              v-model="searchQuery"
              placeholder="搜索用户名/姓名"
              prefix-icon="Search"
              clearable
              class="search-input"
            />
            <el-select v-model="roleFilter" placeholder="角色" clearable>
              <el-option label="全部" value="" />
              <el-option label="管理员" value="admin" />
              <el-option label="操作员" value="operator" />
              <el-option label="普通用户" value="user" />
            </el-select>
          </div>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增用户
          </el-button>
        </div>
      </template>

      <el-table :data="filteredUsers" style="width: 100%" v-loading="loading">
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="realName" label="姓名" width="120" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="roleTypeMap[row.role]">{{ roleNameMap[row.role] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" width="150" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              <el-button type="primary" link @click="handleResetPwd(row)">
                <el-icon><Key /></el-icon>重置密码
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>删除
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
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <!-- 用户表单对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="userForm.realName" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="操作员" value="operator" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-cascader
            v-model="userForm.department"
            :options="departmentOptions"
            placeholder="请选择部门"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Key } from '@element-plus/icons-vue'

// 数据加载状态
const loading = ref(false)

// 搜索和筛选
const searchQuery = ref('')
const roleFilter = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 角色映射
const roleTypeMap = {
  admin: 'danger',
  operator: 'warning',
  user: 'info'
}

const roleNameMap = {
  admin: '管理员',
  operator: '操作员',
  user: '普通用户'
}

// 模拟用户数据
const users = ref([
  {
    id: 1,
    username: 'admin',
    realName: '管理员',
    role: 'admin',
    department: ['技术部', '研发组'],
    email: 'admin@example.com',
    status: 1,
    lastLoginTime: '2024-01-20 12:00:00'
  },
  // ... 更多用户数据
])

// 部门选项
const departmentOptions = [
  {
    value: '技术部',
    label: '技术部',
    children: [
      {
        value: '研发组',
        label: '研发组'
      },
      {
        value: '测试组',
        label: '测试组'
      }
    ]
  },
  // ... 更多部门数据
]

// 过滤后的用户列表
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchQuery = searchQuery.value ? 
      (user.username.includes(searchQuery.value) || user.realName.includes(searchQuery.value)) : 
      true
    const matchRole = roleFilter.value ? user.role === roleFilter.value : true
    return matchQuery && matchRole
  })
})

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const userFormRef = ref(null)
const userForm = ref({
  username: '',
  realName: '',
  role: '',
  department: [],
  email: ''
})

// 表单验证规则
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 处理新增用户
const handleAdd = () => {
  dialogType.value = 'add'
  userForm.value = {
    username: '',
    realName: '',
    role: '',
    department: [],
    email: ''
  }
  dialogVisible.value = true
}

// 处理编辑用户
const handleEdit = (row) => {
  dialogType.value = 'edit'
  userForm.value = { ...row }
  dialogVisible.value = true
}

// 处理删除用户
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除用户 ${row.username} 吗？`,
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

// 处理重置密码
const handleResetPwd = (row) => {
  ElMessageBox.confirm(
    `确定要重置用户 ${row.username} 的密码吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('密码重置成功')
  })
}

// 处理状态变更
const handleStatusChange = (row) => {
  const status = row.status === 1 ? '启用' : '禁用'
  ElMessage.success(`用户${status}成功`)
}

// 处理表单提交
const handleSubmit = async () => {
  if (!userFormRef.value) return
  
  await userFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
      dialogVisible.value = false
    }
  })
}
</script>

<style scoped>
.system-users {
  padding: 20px;
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

.title {
  font-size: 16px;
  font-weight: bold;
}

.search-input {
  width: 200px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-button-group) {
  .el-button {
    padding: 4px 8px;
  }
}
</style> 