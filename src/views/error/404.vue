<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在或已被移除</p>
      <el-button type="primary" @click="$router.push('/')">
        <el-icon><HomeFilled /></el-icon>
        返回首页
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { HomeFilled } from '@element-plus/icons-vue'
</script>

<style scoped>
.not-found {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.content {
  text-align: center;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 80px;
  color: var(--el-color-primary);
  margin: 0;
  line-height: 1;
}

h2 {
  font-size: 24px;
  color: #303133;
  margin: 20px 0;
}

p {
  color: #909399;
  margin-bottom: 30px;
}

.el-button {
  padding: 12px 24px;
}

.el-icon {
  margin-right: 8px;
}
</style> 