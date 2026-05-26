<template>
  <!-- 闪卡查看器：NotebookLM 风格 3D 翻转 + 学习状态 -->
  <div class="flashcard-viewer">
    <!-- 顶部统计栏 -->
    <div class="fc-header">
      <div class="fc-stats">
        <div class="fc-stat-item is-mastered">
          <span class="fc-stat-dot" />
          <span class="fc-stat-label">已掌握</span>
          <span class="fc-stat-value">{{ masteredCount }}</span>
        </div>
        <div class="fc-stat-item is-pending">
          <span class="fc-stat-dot" />
          <span class="fc-stat-label">需复习</span>
          <span class="fc-stat-value">{{ unmasteredCount }}</span>
        </div>
        <div class="fc-stat-item is-total">
          <span class="fc-stat-dot" />
          <span class="fc-stat-label">总数</span>
          <span class="fc-stat-value">{{ cards.length }}</span>
        </div>
      </div>
      <!-- 进度条 -->
      <div class="fc-progress-bar">
        <div class="fc-progress-fill" :style="{ width: progressPercent + '%' }" />
      </div>
      <div class="fc-actions">
        <button class="fc-mini-btn" @click="shuffleCards" title="打乱顺序">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16,3 21,3 21,8"/><line x1="4" y1="20" x2="21" y2="3"/>
            <polyline points="21,16 21,21 16,21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>
          </svg>
          打乱
        </button>
        <button class="fc-mini-btn" @click="resetProgress" title="重置学习状态">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1,4 1,10 7,10"/><path d="M3.51,15a9,9,0,1,0,2.13-9.36L1,10"/>
          </svg>
          重置
        </button>
      </div>
    </div>

    <!-- 完成页 -->
    <div v-if="isCompleted" class="fc-completion">
      <div class="fc-completion-icon">🎉</div>
      <h2>恭喜，全部完成！</h2>
      <p class="fc-completion-summary">
        已掌握 <strong>{{ masteredCount }}</strong> 张，需复习 <strong>{{ unmasteredCount }}</strong> 张
      </p>
      <div class="fc-completion-actions">
        <button class="fc-primary-btn" @click="resetProgress">重新开始</button>
        <button v-if="unmasteredCount > 0" class="fc-secondary-btn" @click="reviewUnmastered">
          只复习未掌握（{{ unmasteredCount }}）
        </button>
      </div>
    </div>

    <!-- 闪卡主区域 -->
    <div v-else class="fc-main">
      <!-- 卡片 -->
      <div
        class="fc-card-container"
        @click="flipCard"
        :title="isFlipped ? '点击翻回正面' : '点击查看答案'"
      >
        <div class="fc-card" :class="{ 'is-flipped': isFlipped }">
          <!-- 正面：问题 -->
          <div class="fc-card-face fc-card-front">
            <div class="fc-card-corner-tag">Q · {{ currentIndex + 1 }}/{{ cards.length }}</div>
            <div class="fc-card-content">{{ currentCard?.front || '' }}</div>
            <div class="fc-card-hint">点击或按空格翻转</div>
          </div>
          <!-- 背面：答案 -->
          <div class="fc-card-face fc-card-back">
            <div class="fc-card-corner-tag is-answer">A · {{ currentIndex + 1 }}/{{ cards.length }}</div>
            <div class="fc-card-content">{{ currentCard?.back || '' }}</div>
            <div class="fc-card-hint">如何评价你的掌握情况？</div>
          </div>
        </div>
      </div>

      <!-- 中间导航 -->
      <div class="fc-nav-row">
        <button class="fc-nav-btn" :disabled="currentIndex === 0" @click="prevCard">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15,18 9,12 15,6"/>
          </svg>
          上一张
        </button>
        <span class="fc-counter">{{ currentIndex + 1 }} / {{ cards.length }}</span>
        <button class="fc-nav-btn" :disabled="currentIndex === cards.length - 1" @click="nextCard">
          下一张
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9,18 15,12 9,6"/>
          </svg>
        </button>
      </div>

      <!-- 掌握度评价按钮（仅翻面后显示） -->
      <transition name="fc-fade">
        <div v-if="isFlipped" class="fc-judge-row">
          <button class="fc-judge-btn is-unmastered" @click="markCard(false)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            未掌握
            <span class="fc-shortcut">[R]</span>
          </button>
          <button class="fc-judge-btn is-mastered" @click="markCard(true)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            已掌握
            <span class="fc-shortcut">[G]</span>
          </button>
        </div>
      </transition>

      <!-- 键盘提示 -->
      <div class="fc-keyhints">
        <span><kbd>空格</kbd> 翻转</span>
        <span><kbd>←</kbd> <kbd>→</kbd> 切换</span>
        <span><kbd>G</kbd> 已掌握</span>
        <span><kbd>R</kbd> 未掌握</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

export interface Flashcard {
  front: string
  back: string
}

interface Props {
  cards: Flashcard[]
}

const props = defineProps<Props>()

// ──────────────────────────────────────────────
// 学习状态
// undefined = 未评价；true = 已掌握；false = 未掌握
// ──────────────────────────────────────────────
const masteryStates = ref<(boolean | undefined)[]>([])
const currentIndex = ref(0)
const isFlipped = ref(false)
const displayCards = ref<Flashcard[]>([])

// 初始化
watch(() => props.cards, (cards) => {
  displayCards.value = [...cards]
  masteryStates.value = cards.map(() => undefined)
  currentIndex.value = 0
  isFlipped.value = false
}, { immediate: true })

// ──────────────────────────────────────────────
// 计算属性
// ──────────────────────────────────────────────
const cards = computed(() => displayCards.value)
const currentCard = computed(() => cards.value[currentIndex.value] ?? null)

const masteredCount = computed(() => masteryStates.value.filter(s => s === true).length)
const unmasteredCount = computed(() => masteryStates.value.filter(s => s === false).length)
const progressPercent = computed(() => {
  if (cards.value.length === 0) return 0
  const evaluated = masteryStates.value.filter(s => s !== undefined).length
  return Math.round((evaluated / cards.value.length) * 100)
})
const isCompleted = computed(() => {
  if (cards.value.length === 0) return false
  return masteryStates.value.every(s => s !== undefined)
})

// ──────────────────────────────────────────────
// 操作
// ──────────────────────────────────────────────
function flipCard() {
  isFlipped.value = !isFlipped.value
}

function goTo(idx: number) {
  if (idx < 0 || idx >= cards.value.length) return
  currentIndex.value = idx
  isFlipped.value = false
}

function prevCard() { goTo(currentIndex.value - 1) }
function nextCard() { goTo(currentIndex.value + 1) }

function markCard(mastered: boolean) {
  masteryStates.value[currentIndex.value] = mastered
  // 自动跳到下一张
  if (currentIndex.value < cards.value.length - 1) {
    setTimeout(() => {
      goTo(currentIndex.value + 1)
    }, 250)
  } else {
    // 最后一张完成后短暂停留再触发完成态
    setTimeout(() => {
      isFlipped.value = false
    }, 250)
  }
}

function shuffleCards() {
  const indices = cards.value.map((_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  displayCards.value = indices.map(i => props.cards[i])
  masteryStates.value = indices.map(() => undefined)
  currentIndex.value = 0
  isFlipped.value = false
}

function resetProgress() {
  displayCards.value = [...props.cards]
  masteryStates.value = props.cards.map(() => undefined)
  currentIndex.value = 0
  isFlipped.value = false
}

function reviewUnmastered() {
  const unmastered = displayCards.value.filter((_, i) => masteryStates.value[i] === false)
  if (unmastered.length === 0) return
  displayCards.value = unmastered
  masteryStates.value = unmastered.map(() => undefined)
  currentIndex.value = 0
  isFlipped.value = false
}

// ──────────────────────────────────────────────
// 键盘快捷键
// ──────────────────────────────────────────────
function onKeyDown(e: KeyboardEvent) {
  // 输入框中不响应
  const target = e.target as HTMLElement
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return

  if (e.key === ' ') {
    e.preventDefault()
    flipCard()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    nextCard()
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    prevCard()
  } else if ((e.key === 'g' || e.key === 'G') && isFlipped.value) {
    e.preventDefault()
    markCard(true)
  } else if ((e.key === 'r' || e.key === 'R') && isFlipped.value) {
    e.preventDefault()
    markCard(false)
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
})
onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
})
</script>

<style scoped>
.flashcard-viewer {
  display: flex;
  flex-direction: column;
  min-height: 560px;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
  border-radius: 12px;
  padding: 20px 24px 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
  user-select: none;
}

/* ── 顶部统计 ─────────────────────────────── */
.fc-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
  position: relative;
}

.fc-stats {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.fc-stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #4b5563;
}

.fc-stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.fc-stat-item.is-mastered .fc-stat-dot { background: #10b981; }
.fc-stat-item.is-pending .fc-stat-dot { background: #f59e0b; }
.fc-stat-item.is-total .fc-stat-dot { background: #6366f1; }

.fc-stat-label { color: #6b7280; }
.fc-stat-value {
  font-weight: 700;
  color: #1f2937;
  font-variant-numeric: tabular-nums;
  min-width: 18px;
}

.fc-progress-bar {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.fc-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #06b6d4);
  border-radius: 3px;
  transition: width 0.4s ease;
}

.fc-actions {
  display: flex;
  gap: 8px;
  position: absolute;
  top: 0;
  right: 0;
}

.fc-mini-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.fc-mini-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
}

/* ── 完成页 ─────────────────────────────── */
.fc-completion {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  gap: 12px;
}

.fc-completion-icon {
  font-size: 64px;
  margin-bottom: 8px;
}

.fc-completion h2 {
  font-size: 26px;
  color: #1f2937;
  margin: 0 0 4px;
}

.fc-completion-summary {
  font-size: 15px;
  color: #6b7280;
  margin: 0 0 20px;
}

.fc-completion-summary strong {
  color: #1f2937;
  font-size: 18px;
}

.fc-completion-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.fc-primary-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(99,102,241,0.3);
}

.fc-primary-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(99,102,241,0.4); }

.fc-secondary-btn {
  padding: 10px 20px;
  background: #fff;
  color: #4b5563;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.fc-secondary-btn:hover { background: #f9fafb; }

/* ── 主区域 ─────────────────────────────── */
.fc-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

/* ── 卡片（3D 翻转） ─────────────────────────────── */
.fc-card-container {
  width: 100%;
  max-width: 580px;
  height: 320px;
  perspective: 1500px;
  cursor: pointer;
}

.fc-card {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.fc-card.is-flipped {
  transform: rotateY(180deg);
}

.fc-card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 16px;
  padding: 36px 32px 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 36px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
  text-align: center;
  position: absolute;
}

.fc-card-front {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 60%, #06b6d4 100%);
  color: #fff;
}

.fc-card-back {
  background: #ffffff;
  color: #1f2937;
  transform: rotateY(180deg);
  border: 1px solid #e5e7eb;
}

.fc-card-corner-tag {
  position: absolute;
  top: 16px;
  left: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  background: rgba(255,255,255,0.18);
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
}

.fc-card-corner-tag.is-answer {
  background: #f0f9ff;
  color: #0369a1;
}

.fc-card-content {
  font-size: 22px;
  line-height: 1.6;
  font-weight: 500;
  max-width: 100%;
  overflow-y: auto;
  max-height: 220px;
  white-space: pre-wrap;
  word-break: break-word;
}

.fc-card-hint {
  position: absolute;
  bottom: 18px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 11px;
  opacity: 0.6;
  letter-spacing: 0.5px;
}

.fc-card-front .fc-card-hint { color: #dbeafe; }
.fc-card-back .fc-card-hint  { color: #6b7280; }

/* ── 导航行 ─────────────────────────────── */
.fc-nav-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.fc-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #4b5563;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.fc-nav-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #c7d2fe;
  color: #1f2937;
}

.fc-nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.fc-counter {
  font-size: 14px;
  color: #6b7280;
  font-variant-numeric: tabular-nums;
  min-width: 60px;
  text-align: center;
  font-weight: 600;
}

/* ── 评价按钮 ─────────────────────────────── */
.fc-judge-row {
  display: flex;
  gap: 16px;
  width: 100%;
  max-width: 580px;
}

.fc-judge-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border: 2px solid;
  background: #fff;
  transition: all 0.15s;
  position: relative;
}

.fc-judge-btn.is-unmastered {
  border-color: #fecaca;
  color: #dc2626;
}

.fc-judge-btn.is-unmastered:hover {
  background: #fef2f2;
  border-color: #f87171;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(220,38,38,0.15);
}

.fc-judge-btn.is-mastered {
  border-color: #a7f3d0;
  color: #059669;
}

.fc-judge-btn.is-mastered:hover {
  background: #ecfdf5;
  border-color: #34d399;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(5,150,105,0.15);
}

.fc-shortcut {
  font-size: 11px;
  opacity: 0.6;
  font-weight: 500;
  margin-left: 4px;
}

.fc-fade-enter-active, .fc-fade-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}
.fc-fade-enter-from, .fc-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* ── 键盘提示 ─────────────────────────────── */
.fc-keyhints {
  display: flex;
  gap: 16px;
  font-size: 11px;
  color: #9ca3af;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 4px;
}

.fc-keyhints kbd {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 1px 6px;
  font-family: ui-monospace, 'SF Mono', Consolas, monospace;
  font-size: 11px;
  color: #4b5563;
  box-shadow: 0 1px 0 #d1d5db;
  margin-right: 2px;
}

/* ── 响应式 ─────────────────────────────── */
@media (max-width: 600px) {
  .flashcard-viewer { padding: 16px; }
  .fc-card-container { height: 280px; }
  .fc-card-content { font-size: 18px; }
  .fc-actions { position: static; margin-top: 6px; }
  .fc-keyhints { display: none; }
}
</style>
