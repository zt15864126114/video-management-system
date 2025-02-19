<template>
  <div class="system-settings">
    <el-row :gutter="20">
      <!-- 基础设置 -->
      <el-col :span="12">
        <el-card class="settings-card">
          <template #header>
            <div class="card-header">
              <span class="title">基础设置</span>
            </div>
          </template>
          
          <el-form :model="settings" label-width="120px" class="settings-form">
            <el-form-item label="系统名称">
              <el-input v-model="settings.systemName" placeholder="请输入系统名称" />
            </el-form-item>
            <el-form-item label="系统版本">
              <el-input v-model="settings.version" disabled />
            </el-form-item>
            <el-form-item label="系统主题">
              <el-select v-model="settings.theme" placeholder="请选择主题">
                <el-option label="默认主题" value="default" />
                <el-option label="暗色主题" value="dark" />
                <el-option label="浅色主题" value="light" />
              </el-select>
            </el-form-item>
            <el-form-item label="系统语言">
              <el-select v-model="settings.language" placeholder="请选择语言">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveSettings">保存设置</el-button>
              <el-button @click="resetSettings">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 安全设置 -->
      <el-col :span="12">
        <el-card class="settings-card">
          <template #header>
            <div class="card-header">
              <span class="title">安全设置</span>
            </div>
          </template>
          
          <el-form :model="securitySettings" label-width="140px" class="settings-form">
            <el-form-item label="密码有效期">
              <el-input-number v-model="securitySettings.passwordExpireDays" :min="30" :max="180" />
              <span class="setting-tip">天</span>
            </el-form-item>
            <el-form-item label="密码长度限制">
              <el-input-number v-model="securitySettings.passwordMinLength" :min="6" :max="20" />
              <span class="setting-tip">位</span>
            </el-form-item>
            <el-form-item label="登录失败锁定">
              <el-input-number v-model="securitySettings.loginFailLock" :min="3" :max="10" />
              <span class="setting-tip">次后锁定账号</span>
            </el-form-item>
            <el-form-item label="会话超时时间">
              <el-input-number v-model="securitySettings.sessionTimeout" :min="10" :max="120" />
              <span class="setting-tip">分钟</span>
            </el-form-item>
            <el-form-item label="双因素认证">
              <el-switch v-model="securitySettings.twoFactorAuth" />
              <span class="setting-tip">开启后需要验证码登录</span>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 系统维护 -->
      <el-col :span="24" style="margin-top: 20px;">
        <el-card class="settings-card">
          <template #header>
            <div class="card-header">
              <span class="title">系统维护</span>
            </div>
          </template>
          
          <el-form :model="maintenanceSettings" label-width="120px" class="settings-form">
            <el-form-item label="数据备份">
              <el-switch v-model="maintenanceSettings.autoBackup" />
              <span class="setting-tip">每天凌晨自动备份数据</span>
            </el-form-item>
            <el-form-item label="备份保留时间">
              <el-input-number v-model="maintenanceSettings.backupRetentionDays" :min="7" :max="90" />
              <span class="setting-tip">天</span>
            </el-form-item>
            <el-form-item label="日志保存时间">
              <el-input-number v-model="maintenanceSettings.logRetentionDays" :min="7" :max="90" />
              <span class="setting-tip">天</span>
            </el-form-item>
            <el-form-item label="系统维护时间">
              <el-time-picker
                v-model="maintenanceSettings.maintenanceTime"
                format="HH:mm"
                placeholder="选择时间"
              />
              <span class="setting-tip">系统将在该时间点进行维护</span>
            </el-form-item>
            <el-form-item label="维护提醒">
              <el-input-number v-model="maintenanceSettings.maintenanceNotifyBefore" :min="5" :max="60" />
              <span class="setting-tip">分钟前提醒用户</span>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const settings = ref({
  systemName: '校园安全管理系统',
  version: 'v1.0.0',
  theme: 'default',
  language: 'zh-CN'
})

const securitySettings = ref({
  passwordExpireDays: 90,
  passwordMinLength: 8,
  loginFailLock: 5,
  sessionTimeout: 30,
  twoFactorAuth: false
})

const maintenanceSettings = ref({
  autoBackup: true,
  backupRetentionDays: 30,
  logRetentionDays: 30,
  maintenanceTime: new Date(2024, 0, 1, 3, 0),
  maintenanceNotifyBefore: 15
})

const initialSettings = {
  basic: { ...settings.value },
  security: { ...securitySettings.value },
  maintenance: { ...maintenanceSettings.value }
}

const saveSettings = () => {
  ElMessage.success('设置保存成功')
}

const resetSettings = () => {
  settings.value = { ...initialSettings.basic }
  securitySettings.value = { ...initialSettings.security }
  maintenanceSettings.value = { ...initialSettings.maintenance }
  ElMessage.info('已重置为初始设置')
}
</script>

<style scoped>
.system-settings {
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  background-color: var(--el-bg-color-page);
}

.settings-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.title {
  font-size: 16px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.settings-form {
  padding: 20px;
}

.setting-tip {
  margin-left: 10px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-input),
:deep(.el-input-number),
:deep(.el-select),
:deep(.el-time-picker) {
  width: 240px;
}

:deep(.el-button) {
  padding: 12px 20px;
  min-width: 100px;
}

:deep(.el-card__body) {
  height: calc(100% - 61px);
  overflow-y: auto;
}

.el-col {
  margin-bottom: 20px;
}

.el-col:last-child {
  margin-bottom: 0;
}
</style> 