<!-- views/SettingsPage.vue -->
<template>
  <div class="page">
    <h2>⚙️ 设置</h2>
    <p>这个标签页可以关闭。</p>
    <button @click="close">关闭当前标签</button>
  </div>
</template>

<script setup lang="ts">
import { useTabStore } from '@/stores/tab'

const tabStore = useTabStore()
// 获取当前激活的标签ID（可通过 computed 获取）
import { computed } from 'vue'
const activeId = computed(() => tabStore.activeTabId)

function close() {
  if (activeId.value) {
    tabStore.closeTab(activeId.value)
  }
}
</script>