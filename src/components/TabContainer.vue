<!-- components/TabContainer.vue -->
<template>
  <div class="browser-window">
    <!-- 标签栏 -->
    <div class="tab-bar">
      <transition-group
        name="tab"
        @after-leave="handleAfterLeave"
      >
        <div
          v-for="tab in tabStore.tabs"
          :key="tab.id"
          class="tab-item"
          :class="{ active: tab.id === tabStore.activeTabId }"
          @click="tabStore.switchTab(tab.id)"
        >
          <span class="tab-title">{{ tab.title }}</span>
          <span
            class="tab-close"
            @click.stop="tabStore.closeTab(tab.id)"
            title="关闭标签"
          >
            ×
          </span>
        </div>
      </transition-group>

      <button class="new-tab-btn" @click="createDefaultTab" title="新建标签">+</button>

      <!-- 窗口控制按钮（右侧） -->
      <div class="window-controls">
        <button class="window-btn" @click="minimizeWindow" title="最小化">─</button>
        <button class="window-btn" @click="toggleMaximizeWindow" title="最大化/还原">
          {{ isMaximized ? '❒' : '☐' }}
        </button>
        <button class="window-btn close-btn" @click="closeWindow" title="关闭">✕</button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="tab-content">
      <keep-alive>
        <component
          v-if="activeTab"
          :is="activeTab.component"
          :key="activeTab.id"
          v-bind="activeTab.props || {}"
        />
      </keep-alive>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useTabStore } from '@/stores/tab'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { listen } from '@tauri-apps/api/event'   // 新增

import HomePage from '@/views/HomePage.vue'

const tabStore = useTabStore()
const activeTab = computed(() => tabStore.activeTab)

// 窗口控制
const appWindow = getCurrentWindow()
const isMaximized = ref(false)
let unlistenMaximized: (() => void) | null = null
let unlistenUnmaximized: (() => void) | null = null

onMounted(async () => {
  // 初始化标签
  tabStore.init({
    id: 'home',
    title: '首页',
    component: HomePage
  })

  // 获取初始最大化状态
  isMaximized.value = await appWindow.isMaximized()

  // 监听最大化 / 还原事件（使用 listen 避免类型问题）
  unlistenMaximized = await listen('tauri://maximized', () => {
    isMaximized.value = true
  })
  unlistenUnmaximized = await listen('tauri://unmaximized', () => {
    isMaximized.value = false
  })
})

onBeforeUnmount(() => {
  if (unlistenMaximized) unlistenMaximized()
  if (unlistenUnmaximized) unlistenUnmaximized()
})

// 窗口控制函数
function minimizeWindow() {
  appWindow.minimize()
}

function toggleMaximizeWindow() {
  appWindow.toggleMaximize()
}

function closeWindow() {
  appWindow.close()
}

// 创建默认标签
function createDefaultTab() {
  tabStore.openTab({
    title: '首页',
    component: HomePage
  })
}

function handleAfterLeave() {
  // 保持过渡平滑
}

// 所有标签关闭时退出应用
watch(
  () => tabStore.tabs.length,
  (length) => {
    if (length === 0) {
      appWindow.close()
    }
  }
)

defineExpose({
  createDefaultTab,
  openTab: tabStore.openTab,
  closeTab: tabStore.closeTab,
  switchTab: tabStore.switchTab
})
</script>

<style scoped>
.browser-window {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #ffffff;
  font-family: system-ui, -apple-system, sans-serif;
}

.tab-bar {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-end;
  background: #e8eaed;
  border-bottom: 1px solid #dadce0;
  height: 40px;
  flex-shrink: 0;
  user-select: none;
  gap: 0;
  padding-left: 5px;
}

.tab-item {
  position: relative;
  flex: 0 1 150px;
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 0 8px 0 12px;
  height: 35px;
  background: #e8eaed;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, transform 0.2s ease;
  font-size: 14px;
  color: #3c4043;
  clip-path: inset(0 0 -1px 0);
}

.tab-item.active {
  background: #ffffff;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.08);
  color: #1a73e8;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #ffffff;
  z-index: 2;
}

.tab-item .tab-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: clip;
  -webkit-mask-image: linear-gradient(to right, black 70%, transparent 100%);
  mask-image: linear-gradient(to right, black 70%, transparent 100%);
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}

.tab-item .tab-close {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  border-radius: 30%;
  font-size: 18px;
  line-height: 1;
  color: #5f6368;
  opacity: 0.4;
  transition: background 0.15s, opacity 0.15s;
  cursor: pointer;
}

.tab-item:hover .tab-close {
  opacity: 0.8;
}

.tab-item .tab-close:hover {
  background: #dadce0;
  opacity: 1;
}

/* 新建标签按钮 */
.new-tab-btn {
  flex: 0 0 28px;
  height: 28px;
  background: transparent;
  border: none;
  font-size: 22px;
  border-radius: 30%;
  cursor: pointer;
  color: #5f6368;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  margin-left: 4px;
  margin-right: 50px;
  margin-bottom: 3px;
  flex-shrink: 0;
  line-height: 1;
}

.new-tab-btn:hover {
  background: #cacbcf;
  transform: scale(1.05);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 窗口控制按钮组（右侧） */
.window-controls {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: auto;
  flex-shrink: 0;
}

.window-btn {
  width: 50px;
  height: 40px;
  background: transparent;
  border: none;
  font-size: 15px;
  cursor: pointer;
  color: #5f6368;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  flex-shrink: 0;
  line-height: 1;
}

.window-btn:hover {
  background: #cacbcf;
  /* 去除 transform 和 box-shadow，与新建按钮区分 */
}

/* 关闭按钮特殊悬停效果 */
.window-btn.close-btn:hover {
  background: #e81123;
  color: white;
}

/* ===== 标签过渡动画 ===== */
.tab-enter-active,
.tab-leave-active {
  transition: clip-path 0.1s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: clip-path;
}

.tab-enter-from,
.tab-leave-to {
  clip-path: inset(0 100% -1px 0);
}

.tab-enter-to,
.tab-leave-from {
  clip-path: inset(0 0 -1px 0);
}

.tab-move {
  transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 使整个标签栏可拖拽 */
.tab-bar {
  -webkit-app-region: drag;
  /* 其他已有样式保持不变 */
}

/* 所有交互元素不可拖拽，以保留点击功能 */
.tab-item,
.new-tab-btn,
.window-btn {
  -webkit-app-region: no-drag;
}

.tab-content {
  flex: 1;
  overflow: auto;
  background: #ffffff;
  padding: 16px;
}
</style>