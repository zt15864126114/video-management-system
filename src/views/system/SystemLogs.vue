<template>
  <div class="system-logs">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="title">系统日志</span>
        </div>
      </template>

      <el-empty description="暂无日志数据" />
    </el-card>
  </div>
</template>

<script setup>
</script>

<style scoped>
.system-logs {
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  background-color: var(--el-bg-color-page);
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

:deep(.el-empty) {
  padding: 60px 0;
}
</style> 