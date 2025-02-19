<template>
  <div class="vehicle-layout">
    <div class="vehicle-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
// 这个组件作为路由出口
</script>

<style scoped>
.vehicle-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.vehicle-content {
  flex: 1;
  padding: 20px;
  min-height: 0;
}
</style> 