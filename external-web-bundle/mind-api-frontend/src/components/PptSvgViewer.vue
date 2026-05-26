<template>
  <!-- PPT SVG 查看器：NotebookLM 风格布局 -->
  <div class="ppt-svg-viewer" :class="{ 'is-fullscreen': isFullscreen }" ref="viewerEl">
    <!-- 顶部工具栏 -->
    <div class="ppt-toolbar">
      <span class="ppt-toolbar-title">{{ title || '演示文稿' }}</span>
      <div class="ppt-toolbar-center">
        <span class="ppt-slide-counter">{{ currentIndex + 1 }} / {{ slides.length }}</span>
      </div>
      <div class="ppt-toolbar-actions">
        <button class="ppt-icon-btn" title="下载 PPTX" @click="$emit('download')" v-if="hasDownload">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
        <button class="ppt-icon-btn" :title="isFullscreen ? '退出全屏' : '全屏'" @click="toggleFullscreen">
          <svg v-if="!isFullscreen" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15,3 21,3 21,9"/><polyline points="9,21 3,21 3,15"/>
            <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="8,3 3,3 3,8"/><polyline points="21,8 21,3 16,3"/>
            <polyline points="3,16 3,21 8,21"/><polyline points="16,21 21,21 21,16"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 主体区域 -->
    <div class="ppt-body">
      <!-- 左侧缩略图导航栏 -->
      <div class="ppt-thumbnails" ref="thumbsEl">
        <div
          v-for="(slide, idx) in slides"
          :key="idx"
          class="ppt-thumb-wrapper"
          :class="{ 'is-active': idx === currentIndex }"
          @click="goTo(idx)"
          :title="slide.title || `幻灯片 ${idx + 1}`"
        >
          <div class="ppt-thumb-num">{{ idx + 1 }}</div>
          <div class="ppt-thumb-canvas">
            <!-- 缩略图：缩小版 SVG -->
            <div class="ppt-thumb-svg" v-html="slide.svg" />
          </div>
          <div class="ppt-thumb-label">{{ slide.title || `幻灯片 ${idx + 1}` }}</div>
        </div>
      </div>

      <!-- 右侧主展示区 -->
      <div class="ppt-stage" ref="stageEl">
        <div class="ppt-slide-container" @click="nextSlide" :title="currentIndex < slides.length - 1 ? '点击下一页' : ''">
          <!-- SVG 幻灯片主展示 -->
          <div
            class="ppt-slide-svg"
            v-html="currentSlide?.svg"
            :key="currentIndex"
          />
          <!-- 无 SVG 时的占位 -->
          <div v-if="!currentSlide?.svg" class="ppt-slide-empty">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#d1d5db" stroke-width="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            <p>暂无预览</p>
          </div>
        </div>

        <!-- 演讲备注（可折叠） -->
        <div v-if="currentSlide?.notes" class="ppt-notes" :class="{ 'is-expanded': notesExpanded }">
          <div class="ppt-notes-header" @click="notesExpanded = !notesExpanded">
            <span>演讲备注</span>
            <svg :style="{ transform: notesExpanded ? 'rotate(180deg)' : '' }" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </div>
          <div class="ppt-notes-body" v-if="notesExpanded">{{ currentSlide.notes }}</div>
        </div>
      </div>
    </div>

    <!-- 底部导航栏 -->
    <div class="ppt-nav">
      <button class="ppt-nav-btn" :disabled="currentIndex === 0" @click="prevSlide">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="15,18 9,12 15,6"/>
        </svg>
        <span>上一页</span>
      </button>

      <!-- 进度点 -->
      <div class="ppt-progress-dots">
        <span
          v-for="(_, idx) in Math.min(slides.length, 15)"
          :key="idx"
          class="ppt-dot"
          :class="{ 'is-active': idx === Math.min(currentIndex, 14) }"
          @click="goTo(idx)"
        />
      </div>

      <button class="ppt-nav-btn" :disabled="currentIndex === slides.length - 1" @click="nextSlide">
        <span>下一页</span>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="9,18 15,12 9,6"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

/**
 * SVG 幻灯片数据结构（与后端 SlideSVGItem 对应）
 */
export interface SlideSVGItem {
  index: number
  title: string
  svg: string   // 完整 SVG XML 字符串
  notes: string
}

interface Props {
  slides: SlideSVGItem[]
  title?: string
  hasDownload?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  hasDownload: false,
})

const emit = defineEmits<{
  download: []
}>()

// ──────────────────────────────────────────────
// 状态
// ──────────────────────────────────────────────
const currentIndex = ref(0)
const isFullscreen = ref(false)
const notesExpanded = ref(false)
const viewerEl = ref<HTMLElement | null>(null)
const thumbsEl = ref<HTMLElement | null>(null)
const stageEl = ref<HTMLElement | null>(null)

// ──────────────────────────────────────────────
// 计算属性
// ──────────────────────────────────────────────
const currentSlide = computed(() => props.slides[currentIndex.value] ?? null)

// ──────────────────────────────────────────────
// 导航
// ──────────────────────────────────────────────
function goTo(idx: number) {
  if (idx < 0 || idx >= props.slides.length) return
  currentIndex.value = idx
  // 滚动缩略图到可视区
  nextTick(() => {
    const thumbs = thumbsEl.value
    if (!thumbs) return
    const active = thumbs.querySelector('.ppt-thumb-wrapper.is-active') as HTMLElement | null
    active?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  })
}

function prevSlide() { goTo(currentIndex.value - 1) }
function nextSlide() { goTo(currentIndex.value + 1) }

// ──────────────────────────────────────────────
// 全屏
// ──────────────────────────────────────────────
async function toggleFullscreen() {
  const el = viewerEl.value
  if (!el) return
  if (!document.fullscreenElement) {
    await el.requestFullscreen?.()
    isFullscreen.value = true
  } else {
    await document.exitFullscreen?.()
    isFullscreen.value = false
  }
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

// ──────────────────────────────────────────────
// 键盘导航
// ──────────────────────────────────────────────
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
    e.preventDefault()
    nextSlide()
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault()
    prevSlide()
  } else if (e.key === 'Escape' && isFullscreen.value) {
    document.exitFullscreen?.()
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('fullscreenchange', onFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
})
</script>

<style scoped>
/* ── 基础布局 ─────────────────────────────── */
.ppt-svg-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 520px;
  background: #111827;
  color: #f3f4f6;
  border-radius: 12px;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  user-select: none;
}

.ppt-svg-viewer.is-fullscreen {
  border-radius: 0;
}

/* ── 顶部工具栏 ─────────────────────────────── */
.ppt-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #1f2937;
  border-bottom: 1px solid #374151;
  gap: 12px;
  flex-shrink: 0;
}

.ppt-toolbar-title {
  font-size: 14px;
  font-weight: 600;
  color: #f9fafb;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ppt-toolbar-center {
  flex-shrink: 0;
}

.ppt-slide-counter {
  font-size: 13px;
  color: #9ca3af;
  font-variant-numeric: tabular-nums;
  background: #374151;
  padding: 3px 10px;
  border-radius: 20px;
}

.ppt-toolbar-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.ppt-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.ppt-icon-btn:hover {
  background: #374151;
  color: #f3f4f6;
}

/* ── 主体 ─────────────────────────────── */
.ppt-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

/* ── 缩略图侧边栏 ─────────────────────────────── */
.ppt-thumbnails {
  width: 140px;
  flex-shrink: 0;
  overflow-y: auto;
  background: #1f2937;
  border-right: 1px solid #374151;
  padding: 8px 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  scrollbar-width: thin;
  scrollbar-color: #374151 transparent;
}

.ppt-thumbnails::-webkit-scrollbar { width: 4px; }
.ppt-thumbnails::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }

.ppt-thumb-wrapper {
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: border-color 0.15s, transform 0.1s;
  flex-shrink: 0;
}

.ppt-thumb-wrapper:hover {
  border-color: #4b5563;
  transform: scale(1.02);
}

.ppt-thumb-wrapper.is-active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.ppt-thumb-num {
  font-size: 10px;
  color: #6b7280;
  text-align: center;
  padding: 2px 0;
  background: #111827;
}

.ppt-thumb-canvas {
  /* 16:9 比例容器，宽度固定约 126px */
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #fff;
  overflow: hidden;
  position: relative;
}

.ppt-thumb-svg {
  /* 将全尺寸 SVG（1280x720）缩放到约 126px 宽 */
  width: 1280px;
  height: 720px;
  transform-origin: top left;
  transform: scale(calc(126 / 1280));
  pointer-events: none;
}

.ppt-thumb-svg :deep(svg) {
  display: block;
  width: 1280px !important;
  height: 720px !important;
}

.ppt-thumb-label {
  font-size: 10px;
  color: #9ca3af;
  padding: 3px 4px;
  background: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
}

/* ── 主舞台 ─────────────────────────────── */
.ppt-stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 24px 32px 16px;
  overflow: hidden;
  gap: 12px;
}

.ppt-slide-container {
  width: 100%;
  max-width: 960px;
  aspect-ratio: 16 / 9;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4);
  cursor: pointer;
  position: relative;
  transition: box-shadow 0.2s;
}

.ppt-slide-container:hover {
  box-shadow: 0 24px 70px rgba(0,0,0,0.7), 0 6px 20px rgba(0,0,0,0.5);
}

.ppt-slide-svg {
  width: 100%;
  height: 100%;
  animation: slide-in 0.25s ease;
}

.ppt-slide-svg :deep(svg) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

@keyframes slide-in {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}

.ppt-slide-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
  gap: 8px;
  font-size: 14px;
}

/* ── 演讲备注 ─────────────────────────────── */
.ppt-notes {
  width: 100%;
  max-width: 960px;
  background: #1f2937;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.ppt-notes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 12px;
  color: #9ca3af;
  user-select: none;
}

.ppt-notes-header svg {
  transition: transform 0.2s;
}

.ppt-notes-body {
  padding: 8px 12px 12px;
  font-size: 13px;
  color: #d1d5db;
  line-height: 1.6;
  border-top: 1px solid #374151;
  white-space: pre-wrap;
}

/* ── 底部导航 ─────────────────────────────── */
.ppt-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 24px;
  background: #1f2937;
  border-top: 1px solid #374151;
  flex-shrink: 0;
  gap: 16px;
}

.ppt-nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid #374151;
  border-radius: 6px;
  background: transparent;
  color: #d1d5db;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  min-width: 90px;
  justify-content: center;
}

.ppt-nav-btn:hover:not(:disabled) {
  background: #374151;
  color: #f9fafb;
  border-color: #4b5563;
}

.ppt-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.ppt-progress-dots {
  display: flex;
  gap: 5px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 200px;
}

.ppt-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #374151;
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;
}

.ppt-dot.is-active {
  background: #3b82f6;
  transform: scale(1.4);
}

.ppt-dot:hover:not(.is-active) {
  background: #6b7280;
}

/* ── 响应式 ─────────────────────────────── */
@media (max-width: 700px) {
  .ppt-thumbnails {
    display: none;
  }

  .ppt-stage {
    padding: 12px 12px 8px;
  }
}
</style>
