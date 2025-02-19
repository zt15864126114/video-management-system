<template>
  <div class="access-layout">
    <div class="access-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
// 这个组件现在只作为路由出口
</script>

<style scoped>
.access-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.access-content {
  flex: 1;
  padding: 20px;
  min-height: 0;
}
</style> 