<!-- views/HomePage.vue -->
<template>
  <div class="page">
    <h1>🏠 首页</h1>
    <p>这是默认初始页面，不可关闭。</p>
    <button @click="openSettings">打开设置（新建标签）</button>
  </div>
</template>

<script setup lang="ts">
import { useTabStore } from '@/stores/tab'
import SettingsPage from './SettingsPage.vue'

const tabStore = useTabStore()

function openSettings() {
  tabStore.openTab({
    title: '设置',
    component: SettingsPage
  })
}
</script>

<style scoped>
.page { padding: 20px; }
button { padding: 8px 16px; cursor: pointer; }
</style>