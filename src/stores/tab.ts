// stores/tab.ts
import { defineStore } from 'pinia'
import { ref, computed, type Component } from 'vue'

export interface Tab {
  id: string
  title: string
  component: Component | string   // 动态组件
  props?: Record<string, any>      // 传递给组件的 props
}

export const useTabStore = defineStore('tab', () => {
  const tabs = ref<Tab[]>([])
  const activeTabId = ref<string | null>(null)

  // 初始化（通常在根组件调用，设置默认首页）
  function init(initialTab: Tab) {
    if (tabs.value.length === 0) {
      tabs.value.push(initialTab)
      activeTabId.value = initialTab.id
    }
  }

  // 新建标签页（总是新建）
  function openTab(tab: Omit<Tab, 'id'> & { id?: string }): string {
    const id = tab.id || `tab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const newTab: Tab = { ...tab, id }
    tabs.value.push(newTab)
    activeTabId.value = id
    return id
  }

  // 关闭标签页
  function closeTab(id: string) {
    const index = tabs.value.findIndex(t => t.id === id)
    if (index === -1) return

    // 如果关闭的是当前激活标签，则切换到相邻标签
    if (activeTabId.value === id) {
      if (tabs.value.length > 1) {
        const newIndex = index === 0 ? 1 : index - 1
        activeTabId.value = tabs.value[newIndex].id
      } else {
        activeTabId.value = null
      }
    }
    tabs.value.splice(index, 1)
  }

  // 切换标签
  function switchTab(id: string) {
    if (tabs.value.some(t => t.id === id)) {
      activeTabId.value = id
    }
  }

  // 当前激活的标签对象
  const activeTab = computed(() => tabs.value.find(t => t.id === activeTabId.value))

  return {
    tabs,
    activeTabId,
    activeTab,
    init,
    openTab,
    closeTab,
    switchTab
  }
})