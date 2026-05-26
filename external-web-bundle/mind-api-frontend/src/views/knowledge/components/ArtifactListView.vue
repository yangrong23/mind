<template>
  <div class="artifact-list-view">
    <!-- 顶部标题栏 -->
    <div class="artifact-header">
      <div class="artifact-header-left">
        <h3 class="artifact-title">AI 生成内容</h3>
        <span class="artifact-count" v-if="artifacts.length">{{ artifacts.length }}</span>
      </div>
      <div class="artifact-header-actions">
        <t-dropdown :options="createOptions" trigger="click" @click="handleDropdownCreate">
          <t-button theme="primary" size="small">
            <template #icon><t-icon name="add" /></template>
            新建
            <t-icon name="chevron-down" style="margin-left:2px" />
          </t-button>
        </t-dropdown>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="artifact-loading">
      <t-loading size="medium" />
    </div>

    <!-- 空状态 -->
    <div v-else-if="!artifacts.length" class="artifact-empty">
      <t-icon name="file-add" size="48px" style="color: var(--td-text-color-placeholder)" />
      <p>还没有生成任何内容</p>
      <p class="artifact-empty-hint">从知识库生成 HTML 页面、PPT 演示文稿、闪卡或测验</p>
      <div class="artifact-empty-btns">
        <t-button
          v-for="opt in createOptions"
          :key="opt.value"
          theme="default"
          variant="outline"
          size="small"
          @click="openCreateDialog(opt.value as ArtifactKind)"
        >
          <template #icon><t-icon :name="opt.icon" /></template>
          {{ opt.label }}
        </t-button>
      </div>
    </div>

    <!-- 卡片列表 -->
    <div v-else class="artifact-grid">
      <div
        v-for="art in artifacts"
        :key="art.id"
        class="artifact-card"
        :class="{ 'is-running': art.status === 'pending' || art.status === 'running' }"
        @click="openPreview(art)"
      >
        <div class="artifact-card-header">
          <t-icon :name="kindIcon(art.kind)" class="artifact-card-icon" :style="{ color: kindColor(art.kind) }" />
          <span class="artifact-card-kind">{{ kindLabel(art.kind) }}</span>
          <t-tag :theme="statusTheme(art.status)" size="small" class="artifact-card-status">
            {{ statusLabel(art.status) }}
          </t-tag>
        </div>
        <div class="artifact-card-title">{{ art.title || '未命名' }}</div>
        <div class="artifact-card-meta">{{ formatTime(art.created_at) }}</div>
        <div v-if="art.status === 'failed'" class="artifact-card-error">
          {{ art.error_message?.slice(0, 80) }}
        </div>
        <!-- 进度条（运行中） -->
        <div v-if="art.status === 'running' || art.status === 'pending'" class="artifact-card-progress">
          <t-loading size="small" />
          <span>生成中...</span>
        </div>
        <div class="artifact-card-actions" @click.stop>
          <t-button
            v-if="art.status === 'succeeded'"
            size="small"
            variant="text"
            title="下载"
            @click="downloadArtifact(art)"
          >
            <t-icon name="download" />
          </t-button>
          <t-button
            v-if="art.status === 'pending' || art.status === 'running'"
            size="small"
            variant="text"
            theme="danger"
            title="取消"
            @click="handleCancel(art)"
          >
            <t-icon name="close" />
          </t-button>
        </div>
      </div>
    </div>

    <!-- 创建对话框 -->
    <t-dialog
      v-model:visible="showCreateDialog"
      :header="createDialogTitle"
      :confirm-btn="{ content: '开始生成', theme: 'primary', loading: creating }"
      :cancel-btn="{ content: '取消' }"
      @confirm="handleCreate"
      width="560px"
    >
      <t-form :data="createForm" layout="vertical">
        <t-form-item label="标题（可选）">
          <t-input v-model="createForm.title" :placeholder="titlePlaceholder" />
        </t-form-item>

        <!-- HTML / PPT 通用指令输入 -->
        <t-form-item v-if="createKind === 'html' || createKind === 'ppt'" label="生成指令" required>
          <t-textarea
            v-model="createForm.instruction"
            :placeholder="instructionPlaceholder"
            :autosize="{ minRows: 4, maxRows: 8 }"
          />
        </t-form-item>

        <!-- PPT 额外参数 -->
        <template v-if="createKind === 'ppt'">
          <t-form-item label="页数">
            <t-input-number v-model="createForm.numPages" :min="3" :max="30" style="width:120px" />
          </t-form-item>
          <t-form-item label="语言">
            <t-select v-model="createForm.language" style="width:160px">
              <t-option value="zh" label="中文" />
              <t-option value="en" label="English" />
            </t-select>
          </t-form-item>
        </template>

        <!-- 闪卡参数 -->
        <template v-if="createKind === 'flashcard'">
          <t-form-item label="生成指令" required>
            <t-textarea
              v-model="createForm.instruction"
              :placeholder="instructionPlaceholder"
              :autosize="{ minRows: 3, maxRows: 6 }"
            />
          </t-form-item>
          <t-form-item label="卡片数量">
            <t-input-number v-model="createForm.count" :min="5" :max="100" style="width:120px" />
          </t-form-item>
          <t-form-item label="语言">
            <t-select v-model="createForm.language" style="width:160px">
              <t-option value="zh" label="中文" />
              <t-option value="en" label="English" />
            </t-select>
          </t-form-item>
        </template>

        <!-- 测验参数 -->
        <template v-if="createKind === 'quiz'">
          <t-form-item label="主题" required>
            <t-input v-model="createForm.topic" placeholder="例如：机器学习基础" />
          </t-form-item>
          <t-form-item label="题目数量">
            <t-input-number v-model="createForm.count" :min="3" :max="50" style="width:120px" />
          </t-form-item>
          <t-form-item label="语言">
            <t-select v-model="createForm.language" style="width:160px">
              <t-option value="zh" label="中文" />
              <t-option value="en" label="English" />
            </t-select>
          </t-form-item>
        </template>

        <!-- 音频概览参数 -->
        <template v-if="createKind === 'audio_overview'">
          <t-form-item label="主题（可选）">
            <t-input v-model="createForm.topic" placeholder="留空则自动从知识库内容提取" />
          </t-form-item>
          <t-form-item label="时长">
            <t-select v-model="createForm.length" style="width:160px">
              <t-option value="short" label="短（2-3 分钟）" />
              <t-option value="medium" label="中（5-8 分钟）" />
              <t-option value="long" label="长（10-15 分钟）" />
            </t-select>
          </t-form-item>
          <t-form-item label="语气风格">
            <t-select v-model="createForm.tone" style="width:160px">
              <t-option value="casual" label="轻松对话" />
              <t-option value="educational" label="知识讲解" />
              <t-option value="enthusiastic" label="热情推荐" />
            </t-select>
          </t-form-item>
          <t-form-item label="音色组合">
            <t-select v-model="createForm.voicePreset" style="width:200px">
              <t-option value="companion" label="社交陪伴（男+女，支持情感）" />
              <t-option value="news" label="新闻播报（男+女）" />
              <t-option value="audiobook" label="有声书（男+女）" />
              <t-option value="dialect_yue" label="粤语（男+女）" />
            </t-select>
          </t-form-item>
          <t-form-item label="语言">
            <t-select v-model="createForm.language" style="width:160px">
              <t-option value="zh" label="中文" />
              <t-option value="en" label="English" />
            </t-select>
          </t-form-item>
        </template>

        <!-- 信息图参数 -->
        <template v-if="createKind === 'infographic'">
          <t-form-item label="主题（可选）">
            <t-input v-model="createForm.topic" placeholder="留空则自动从知识库内容提取" />
          </t-form-item>
          <t-form-item label="视觉风格">
            <t-select v-model="createForm.style" style="width:200px">
              <t-option value="modern" label="现代（KPI 卡片 + 图表）" />
              <t-option value="minimal" label="极简（大留白 + 关键句）" />
              <t-option value="data_dense" label="数据密集（多图并列）" />
              <t-option value="timeline" label="时间线" />
              <t-option value="comparison" label="对比分析" />
            </t-select>
          </t-form-item>
          <t-form-item label="语言">
            <t-select v-model="createForm.language" style="width:160px">
              <t-option value="zh" label="中文" />
              <t-option value="en" label="English" />
            </t-select>
          </t-form-item>
        </template>

        <!-- 报告参数 -->
        <template v-if="createKind === 'report'">
          <t-form-item label="主题（可选）">
            <t-input v-model="createForm.topic" placeholder="留空则自动从知识库内容提取" />
          </t-form-item>
          <t-form-item label="深度">
            <t-select v-model="createForm.depth" style="width:160px">
              <t-option value="brief" label="简要（1500-2500 字）" />
              <t-option value="standard" label="标准（5000-8000 字）" />
              <t-option value="deep" label="深度（10000-15000 字）" />
            </t-select>
          </t-form-item>
          <t-form-item label="章节数">
            <t-input-number v-model="createForm.sections" :min="3" :max="12" style="width:120px" />
          </t-form-item>
          <t-form-item label="语言">
            <t-select v-model="createForm.language" style="width:160px">
              <t-option value="zh" label="中文" />
              <t-option value="en" label="English" />
            </t-select>
          </t-form-item>
        </template>
      </t-form>
    </t-dialog>

    <!-- HTML 预览对话框 -->
    <t-dialog
      v-model:visible="showHtmlPreview"
      :header="previewArtifact?.title || 'HTML 预览'"
      width="90vw"
      :footer="false"
      class="artifact-preview-dialog"
    >
      <div v-if="previewLoading" class="artifact-preview-loading">
        <t-loading size="large" />
        <p>加载中...</p>
      </div>
      <div v-else-if="previewHtml" class="artifact-preview-container">
        <div class="artifact-preview-toolbar">
          <t-button size="small" variant="outline" @click="downloadArtifact(previewArtifact!)">
            <template #icon><t-icon name="download" /></template>
            下载
          </t-button>
        </div>
        <iframe
          :srcdoc="previewHtml"
          class="artifact-preview-iframe"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </t-dialog>

    <!-- PPT 预览对话框 — 智能区分 SVG（NotebookLM 风格）、PPTX（原生可编辑）和 HTML（fallback 浏览器渲染） -->
    <t-dialog
      v-model:visible="showPPTPreview"
      :header="previewArtifact?.title || 'PPT 预览'"
      width="92vw"
      :footer="false"
      class="artifact-preview-dialog"
    >
      <div v-if="previewLoading" class="artifact-preview-loading">
        <t-loading size="large" />
        <p>加载中...</p>
      </div>
      <!-- 情况 A: SVG 幻灯片（NotebookLM 风格交互） -->
      <div v-else-if="pptIsSVG && pptSvgSlides.length > 0" class="artifact-svg-preview">
        <PptSvgViewer
          :slides="pptSvgSlides"
          :title="previewArtifact?.title || ''"
          :has-download="pptHasPPTX"
          @download="downloadArtifact(previewArtifact!)"
        />
      </div>
      <!-- 情况 B: 原生 PPTX 文件 — 浏览器不能直接渲染，展示文件信息 + 下载按钮 -->
      <div v-else-if="pptIsPPTX" class="ppt-pptx-card">
        <t-icon name="file-powerpoint" size="64px" style="color:#d54941" />
        <h3 class="ppt-pptx-title">{{ previewArtifact?.title || '演示文稿' }}</h3>
        <p class="ppt-pptx-desc">这是一份原生 PPTX 文件，可在 PowerPoint / Keynote / WPS 中编辑</p>
        <div class="ppt-pptx-meta">
          <div class="ppt-pptx-meta-item">
            <span class="ppt-pptx-meta-label">文件名：</span>
            <span>{{ pptFileName }}</span>
          </div>
          <div v-if="pptFileSize" class="ppt-pptx-meta-item">
            <span class="ppt-pptx-meta-label">文件大小：</span>
            <span>{{ pptFileSize }}</span>
          </div>
          <div v-if="pptFilesIncluded > 0" class="ppt-pptx-meta-item">
            <span class="ppt-pptx-meta-label">参考文件：</span>
            <span>{{ pptFilesIncluded }} 个</span>
          </div>
        </div>
        <div class="ppt-pptx-actions">
          <t-button theme="primary" size="large" @click="downloadArtifact(previewArtifact!)">
            <template #icon><t-icon name="download" /></template>
            下载 PPTX
          </t-button>
          <t-button
            v-if="pptOnlineViewerUrl"
            theme="default"
            size="large"
            variant="outline"
            @click="openInOnlineViewer"
          >
            <template #icon><t-icon name="browse" /></template>
            在线预览
          </t-button>
        </div>
        <p class="ppt-pptx-hint">
          💡 在线预览使用 Office Web Viewer，需要文件可被公网访问。
          如预览失败请下载后用本地软件打开。
        </p>
      </div>
      <!-- 情况 B: HTML 模式 — 直接 iframe 渲染 -->
      <div v-else-if="previewHtml" class="artifact-preview-container">
        <div class="artifact-preview-toolbar">
          <t-button size="small" variant="outline" @click="downloadArtifact(previewArtifact!)">
            <template #icon><t-icon name="download" /></template>
            下载 HTML
          </t-button>
        </div>
        <iframe
          :srcdoc="previewHtml"
          class="artifact-preview-iframe"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </t-dialog>

    <!-- 闪卡预览对话框 — 智能区分 bridge JSON 和 HTML fallback -->
    <t-dialog
      v-model:visible="showFlashcardPreview"
      :header="previewArtifact?.title || '闪卡'"
      width="720px"
      :footer="false"
      class="artifact-preview-dialog flashcard-dialog"
    >
      <div v-if="previewLoading" class="artifact-preview-loading">
        <t-loading size="large" />
        <p>加载中...</p>
      </div>
      <!-- 情况 A: HTML 闪卡（fallback skill 模式生成的交互式 HTML 页面） -->
      <div v-else-if="previewHtml" class="artifact-preview-container">
        <div class="artifact-preview-toolbar">
          <t-button size="small" variant="outline" @click="downloadArtifact(previewArtifact!)">
            <template #icon><t-icon name="download" /></template>
            下载 HTML
          </t-button>
        </div>
        <iframe
          :srcdoc="previewHtml"
          class="artifact-preview-iframe"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
      <!-- 情况 B: 结构化 JSON 闪卡 — 使用 NotebookLM 风格 FlashcardViewer 渲染 -->
      <FlashcardViewer
        v-else-if="flashcards.length > 0"
        :cards="flashcards"
      />
      <div v-else class="flashcard-empty">
        <t-icon name="info-circle" size="32px" style="color: var(--td-text-color-placeholder)" />
        <p>未找到闪卡数据</p>
      </div>
    </t-dialog>

    <!-- 测验预览对话框 — 交互式答题 -->
    <t-dialog
      v-model:visible="showQuizPreview"
      :header="previewArtifact?.title || '测验'"
      width="720px"
      :footer="false"
    >
      <div class="quiz-preview">
        <div class="quiz-stats">共 {{ quizQuestions.length }} 道题</div>
        <div class="quiz-list">
          <div v-for="(q, idx) in quizQuestions" :key="idx" class="quiz-item">
            <div class="quiz-question">{{ idx + 1 }}. {{ q.question }}</div>
            <div class="quiz-options">
              <div
                v-for="(opt, oi) in q.options"
                :key="oi"
                class="quiz-option"
                :class="{
                  'is-answer': quizAnswerRevealed && q.correctIndex.includes(oi),
                  'is-wrong': quizSubmitted && quizUserAnswers[idx]?.includes(oi) && !q.correctIndex.includes(oi),
                  'is-selected': quizUserAnswers[idx]?.includes(oi),
                }"
                @click="toggleQuizOption(idx, oi, q.type)"
              >
                <span class="quiz-option-letter">{{ String.fromCharCode(65 + oi) }}.</span>
                {{ opt }}
              </div>
            </div>
            <div v-if="quizAnswerRevealed && q.explanation" class="quiz-explanation">
              {{ q.explanation }}
            </div>
          </div>
        </div>
        <div class="quiz-footer">
          <t-button v-if="!quizSubmitted" theme="primary" @click="submitQuiz">提交答案</t-button>
          <t-button @click="quizAnswerRevealed = !quizAnswerRevealed" variant="outline">
            {{ quizAnswerRevealed ? '隐藏答案' : '显示答案' }}
          </t-button>
          <span v-if="quizSubmitted" class="quiz-score">
            得分：{{ quizScore }} / {{ quizQuestions.length }}
          </span>
        </div>
      </div>
    </t-dialog>

    <!-- 音频概览预览对话框 -->
    <t-dialog
      v-model:visible="showAudioPreview"
      :header="previewArtifact?.title || '音频概览'"
      width="720px"
      :footer="false"
    >
      <div class="audio-preview">
        <div class="audio-player-wrapper">
          <audio
            ref="audioRef"
            v-if="audioSrc"
            :src="audioSrc"
            preload="metadata"
            style="display:none"
            @timeupdate="onAudioTimeUpdate"
            @loadedmetadata="onAudioLoadedMetadata"
            @ended="isAudioPlaying = false"
          />
          <div v-if="audioSrc" class="audio-custom-controls">
            <button class="audio-play-btn" @click="toggleAudioPlay">
              <t-icon :name="isAudioPlaying ? 'pause-circle' : 'play-circle'" size="28px" />
            </button>
            <span class="audio-time-current">{{ formatAudioTime(audioCurrentMs) }}</span>
            <input
              type="range"
              class="audio-seek-bar"
              :min="0"
              :max="audioTotalMs"
              :value="audioCurrentMs"
              @mousedown="onSeekStart"
              @touchstart="onSeekStart"
              @input="onSeekInput"
              @mouseup="onSeekEnd"
              @touchend="onSeekEnd"
            />
            <span class="audio-time-total">{{ formatAudioTime(audioTotalMs) }}</span>
            <select class="audio-speed-select" :value="audioPlaybackRate" @change="onSpeedChange">
              <option value="0.75">0.75×</option>
              <option value="1">1×</option>
              <option value="1.25">1.25×</option>
              <option value="1.5">1.5×</option>
              <option value="2">2×</option>
            </select>
          </div>
        </div>
        <div v-if="audioMeta" class="audio-meta">
          <div class="audio-meta-row">
            <span class="audio-meta-label">时长：</span>
            <span>{{ formatAudioTime(audioTotalMs) }}</span>
          </div>
          <div class="audio-meta-row">
            <span class="audio-meta-label">主播 A：</span>
            <span>{{ audioMeta.host_a?.name || '主持人' }}（{{ audioMeta.host_a?.voice }}）</span>
          </div>
          <div class="audio-meta-row">
            <span class="audio-meta-label">主播 B：</span>
            <span>{{ audioMeta.host_b?.name || '嘉宾' }}（{{ audioMeta.host_b?.voice }}）</span>
          </div>
          <div class="audio-meta-row">
            <span class="audio-meta-label">参考文件：</span>
            <span>{{ audioMeta.files_included || 0 }} 个</span>
          </div>
        </div>
        <!-- 脚本字幕 -->
        <div v-if="audioMeta?.segments?.length" class="audio-transcript">
          <h4 class="audio-transcript-title">对话脚本</h4>
          <div
            v-for="seg in audioMeta.segments"
            :key="seg.index"
            class="audio-segment"
            :class="{ 'is-host-a': seg.speaker === 'A', 'is-host-b': seg.speaker === 'B' }"
          >
            <span class="audio-segment-speaker">{{ seg.speaker === 'A' ? (audioMeta.host_a?.name || '主持人') : (audioMeta.host_b?.name || '嘉宾') }}</span>
            <span class="audio-segment-text">{{ seg.text }}</span>
          </div>
        </div>
        <div class="audio-actions">
          <t-button size="small" variant="outline" @click="downloadArtifact(previewArtifact!)">
            <template #icon><t-icon name="download" /></template>
            下载音频
          </t-button>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import {
  listArtifacts,
  submitArtifact,
  cancelArtifact,
  issueArtifactStreamToken,
  type Artifact,
  type ArtifactKind,
} from '@/api/artifact'
import { get } from '@/utils/request'
import PptSvgViewer, { type SlideSVGItem } from '@/components/PptSvgViewer.vue'
import FlashcardViewer, { type Flashcard } from '@/components/FlashcardViewer.vue'

const props = defineProps<{ knowledgeBaseId: string }>()

const loading = ref(true)
const creating = ref(false)
const artifacts = ref<Artifact[]>([])

const showCreateDialog = ref(false)
const createKind = ref<ArtifactKind>('html')
const createForm = ref({
  title: '',
  instruction: '',
  topic: '',
  count: 20,
  numPages: 10,
  language: 'zh',
  // audio_overview 专用
  length: 'medium' as 'short' | 'medium' | 'long',
  tone: 'casual' as 'casual' | 'educational' | 'enthusiastic',
  voicePreset: 'companion' as 'companion' | 'news' | 'audiobook' | 'dialect_yue',
  format: 'mp3' as 'mp3' | 'wav',
  // infographic 专用
  style: 'modern' as 'modern' | 'minimal' | 'data_dense' | 'timeline' | 'comparison',
  colorScheme: '',
  // report 专用
  depth: 'standard' as 'brief' | 'standard' | 'deep',
  sections: 6,
})

const showHtmlPreview = ref(false)
const showPPTPreview = ref(false)
const showFlashcardPreview = ref(false)
const showQuizPreview = ref(false)
const previewArtifact = ref<Artifact | null>(null)
const previewHtml = ref('')
const previewLoading = ref(false)
const flashcards = ref<Flashcard[]>([])
const quizQuestions = ref<QuizQuestionView[]>([])
const quizAnswerRevealed = ref(false)
const quizUserAnswers = ref<number[][]>([])
const quizSubmitted = ref(false)

// Audio overview 预览状态
const showAudioPreview = ref(false)
const audioSrc = ref('')
const audioMeta = ref<any>(null)
const audioRef = ref<HTMLAudioElement | null>(null)
const audioCurrentMs = ref(0)
const isAudioPlaying = ref(false)
const audioNativeDurationMs = ref(0)  // 从 audio 元素获取的时长（fallback）
const isSeeking = ref(false)          // 拖动中标志，防止 timeupdate 干扰进度条位置
const audioPlaybackRate = ref(1)      // 播放速度

const audioTotalMs = computed(() =>
  audioNativeDurationMs.value > 0
    ? audioNativeDurationMs.value
    : (audioMeta.value?.duration_ms || 0)
)

function onAudioTimeUpdate() {
  // 拖动期间不用 timeupdate 更新进度，避免进度条被强制重置
  if (isSeeking.value) return
  if (audioRef.value) audioCurrentMs.value = Math.floor(audioRef.value.currentTime * 1000)
}
function onAudioLoadedMetadata() {
  if (audioRef.value && audioRef.value.duration && isFinite(audioRef.value.duration)) {
    audioNativeDurationMs.value = Math.floor(audioRef.value.duration * 1000)
  }
}
// 开始拖动：阻止 timeupdate 覆盖进度条值
function onSeekStart() {
  isSeeking.value = true
}
// 拖动中：实时更新显示的时间（但不 seek，避免频繁触发网络请求）
function onSeekInput(e: Event) {
  audioCurrentMs.value = Number((e.target as HTMLInputElement).value)
}
// 拖动结束：执行实际 seek，然后恢复 timeupdate 监听
function onSeekEnd(e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  audioCurrentMs.value = v
  if (audioRef.value) audioRef.value.currentTime = v / 1000
  isSeeking.value = false
}
function toggleAudioPlay() {
  if (!audioRef.value) return
  if (isAudioPlaying.value) { audioRef.value.pause(); isAudioPlaying.value = false }
  else { audioRef.value.play(); isAudioPlaying.value = true }
}
function onSpeedChange(e: Event) {
  const rate = Number((e.target as HTMLSelectElement).value)
  audioPlaybackRate.value = rate
  if (audioRef.value) audioRef.value.playbackRate = rate
}
function formatAudioTime(ms: number): string {
  if (!ms || ms <= 0) return '0:00'
  const total = Math.round(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// 关闭音频对话框时重置状态
watch(showAudioPreview, (v) => {
  if (!v) {
    audioRef.value?.pause()
    isAudioPlaying.value = false
    audioCurrentMs.value = 0
    audioNativeDurationMs.value = 0
    isSeeking.value = false
    audioPlaybackRate.value = 1
  }
})

// Quiz 标准化视图类型
interface QuizQuestionView {
  type: 'single' | 'multiple'
  question: string
  options: string[]
  correctIndex: number[]
  explanation: string
}

// PPT 预览相关状态：根据 payload_meta.content_type 判断是 PPTX 还是 HTML
const pptIsPPTX = ref(false)        // true=原生 PPTX，false=HTML fallback
const pptIsSVG = ref(false)         // true=SVG 幻灯片模式（NotebookLM 风格）
const pptSvgSlides = ref<SlideSVGItem[]>([])  // SVG 幻灯片数组
const pptFileName = ref('')
const pptFileSize = ref('')
const pptFilesIncluded = ref(0)
const pptOnlineViewerUrl = ref('')  // Office Web Viewer URL（仅 presigned URL 可用时填充）
// SVG 模式下，bridge 是否同时生成了可下载的 PPTX（payload_meta.has_pptx）
const pptHasPPTX = ref(false)

let pollTimer: ReturnType<typeof setInterval> | null = null

const createOptions = [
  { value: 'html',           label: 'HTML 页面',  icon: 'file-code',       content: 'HTML 页面' },
  { value: 'ppt',            label: 'PPT 演示',   icon: 'file-powerpoint', content: 'PPT 演示' },
  { value: 'flashcard',      label: '闪卡',        icon: 'education',       content: '闪卡' },
  { value: 'quiz',           label: '测验',        icon: 'check-circle',    content: '测验' },
  { value: 'audio_overview', label: '音频概览',    icon: 'sound',           content: '音频概览' },
  { value: 'infographic',    label: '信息图',      icon: 'chart-pie',       content: '信息图' },
  { value: 'report',         label: '报告',        icon: 'file-paste',      content: '报告' },
]

const createDialogTitle = computed(() => {
  const opt = createOptions.find(o => o.value === createKind.value)
  return `生成${opt?.label || ''}`
})

const titlePlaceholder = computed(() => {
  const map: Record<string, string> = {
    html: '例如：产品功能介绍',
    ppt: '例如：2024 年度总结',
    flashcard: '例如：Python 基础闪卡',
    quiz: '例如：机器学习测验',
    audio_overview: '例如：本周技术分享播客',
    infographic: '例如：Q4 数据洞察',
    report: '例如：行业趋势分析报告',
  }
  return map[createKind.value] || '标题'
})

const instructionPlaceholder = computed(() => {
  if (createKind.value === 'ppt') {
    return '描述 PPT 的主题和内容要求\n\n例如：\n- 生成一份产品发布会 PPT，包含市场分析、产品特性和路线图'
  }
  if (createKind.value === 'flashcard') {
    return '描述闪卡的主题和重点\n\n例如：\n- 生成关于 Python 基础语法的闪卡，重点覆盖数据类型、控制流和函数'
  }
  return '描述你想生成的内容\n\n例如：\n- 生成一份产品功能介绍页面\n- 制作一份数据分析报告'
})

function handleDropdownCreate(data: any) {
  openCreateDialog(data.value as ArtifactKind)
}

function openCreateDialog(kind: ArtifactKind) {
  createKind.value = kind
  createForm.value = {
    title: '', instruction: '', topic: '',
    count: kind === 'quiz' ? 10 : 20,
    numPages: 10, language: 'zh',
    length: 'medium', tone: 'casual', voicePreset: 'companion', format: 'mp3',
    style: 'modern', colorScheme: '',
    depth: 'standard', sections: 6,
  }
  showCreateDialog.value = true
}

onMounted(() => { fetchArtifacts() })
onUnmounted(() => { if (pollTimer) clearInterval(pollTimer) })

async function fetchArtifacts() {
  loading.value = true
  try {
    const res: any = await listArtifacts({ kb_id: props.knowledgeBaseId, limit: 50 })
    artifacts.value = (res?.items || res?.data?.items || []).sort(
      (a: Artifact, b: Artifact) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    const hasRunning = artifacts.value.some(a => a.status === 'pending' || a.status === 'running')
    if (hasRunning && !pollTimer) {
      pollTimer = setInterval(fetchArtifacts, 5000)
    } else if (!hasRunning && pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  } catch (e) {
    console.error('Failed to fetch artifacts:', e)
  } finally {
    loading.value = false
  }
}

async function handleCreate() {
  const kind = createKind.value
  if ((kind === 'html' || kind === 'ppt' || kind === 'flashcard') && !createForm.value.instruction.trim()) {
    MessagePlugin.warning('请输入生成指令')
    return
  }
  if (kind === 'quiz' && !createForm.value.topic.trim()) {
    MessagePlugin.warning('请输入主题')
    return
  }
  creating.value = true
  try {
    let params: Record<string, any> = {}
    if (kind === 'html') {
      params = { instruction: createForm.value.instruction }
    } else if (kind === 'ppt') {
      params = { instruction: createForm.value.instruction, num_pages: createForm.value.numPages, language: createForm.value.language }
    } else if (kind === 'flashcard') {
      params = {
        topic: createForm.value.title || createForm.value.instruction.slice(0, 50) || '知识库内容',
        instruction: createForm.value.instruction,
        count: createForm.value.count,
        language: createForm.value.language,
      }
    } else if (kind === 'quiz') {
      params = { topic: createForm.value.topic, count: createForm.value.count, language: createForm.value.language }
    } else if (kind === 'audio_overview') {
      params = {
        topic: createForm.value.topic || undefined,
        length: createForm.value.length,
        language: createForm.value.language,
        tone: createForm.value.tone,
        voice_preset: createForm.value.voicePreset,
        format: createForm.value.format,
      }
    } else if (kind === 'infographic') {
      params = {
        topic: createForm.value.topic || undefined,
        style: createForm.value.style,
        color_scheme: createForm.value.colorScheme || undefined,
        language: createForm.value.language,
      }
    } else if (kind === 'report') {
      params = {
        topic: createForm.value.topic || undefined,
        depth: createForm.value.depth,
        sections: createForm.value.sections,
        language: createForm.value.language,
      }
    }
    await submitArtifact({ kb_id: props.knowledgeBaseId, kind, title: createForm.value.title || undefined, params })
    MessagePlugin.success('已开始生成，请稍候...')
    showCreateDialog.value = false
    if (!pollTimer) pollTimer = setInterval(fetchArtifacts, 5000)
    await fetchArtifacts()
  } catch (e: any) {
    MessagePlugin.error(e?.message || '创建失败')
  } finally {
    creating.value = false
  }
}

async function handleCancel(art: Artifact) {
  try {
    await cancelArtifact(art.id)
    MessagePlugin.success('已取消')
    await fetchArtifacts()
  } catch {
    MessagePlugin.error('取消失败')
  }
}

async function openPreview(art: Artifact) {
  if (art.status !== 'succeeded') return
  previewArtifact.value = art
  // 重置所有预览相关状态，避免上次预览的内容残留
  previewHtml.value = ''
  flashcards.value = []
  quizQuestions.value = []
  audioSrc.value = ''
  audioMeta.value = null
  // 解析 payload_meta，用于判断实际生成内容的类型
  const meta = parsePayloadMeta(art)
  const contentType = String(meta?.content_type || '')

  if (art.kind === 'html' || art.kind === 'infographic' || art.kind === 'report') {
    // 通用 HTML artifact：直接 iframe 渲染（信息图、报告也走此路径）
    showHtmlPreview.value = true
    await loadHtmlPreview(art)
  } else if (art.kind === 'ppt') {
    // PPT artifact：根据 content_type 区分 SVG / 原生 PPTX / HTML fallback 三种模式
    showPPTPreview.value = true
    pptSvgSlides.value = []
    pptIsSVG.value = false
    pptIsPPTX.value = false
    pptHasPPTX.value = false

    const slidesSvg = (meta?.slides_svg as SlideSVGItem[] | undefined) || []
    if (slidesSvg.length > 0 || contentType === 'image/svg+xml') {
      pptIsSVG.value = true
      pptSvgSlides.value = slidesSvg
      pptFilesIncluded.value = Number(meta?.files_included || 0)
      pptHasPPTX.value = Boolean(meta?.has_pptx) && Boolean(art.payload_uri)
      pptFileName.value = String(meta?.file_name || (art.title || 'presentation') + '.pptx')
      pptFileSize.value = formatFileSize(Number(meta?.file_size_bytes || 0))
    } else {
      pptIsPPTX.value = isPPTXContentType(contentType, art.payload_uri)
      pptFileName.value = String(meta?.file_name || (art.title || 'presentation') + (pptIsPPTX.value ? '.pptx' : '.html'))
      pptFileSize.value = formatFileSize(Number(meta?.file_size_bytes || 0))
      pptFilesIncluded.value = Number(meta?.files_included || 0)
      pptOnlineViewerUrl.value = ''
      if (pptIsPPTX.value) {
        const downloadUrl = art.download_url || ''
        if (downloadUrl && /^https?:\/\//.test(downloadUrl)) {
          pptOnlineViewerUrl.value = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(downloadUrl)}`
        }
      } else {
        await loadHtmlPreview(art)
      }
    }
  } else if (art.kind === 'flashcard') {
    showFlashcardPreview.value = true
    if (art.payload_uri && contentType === 'text/html') {
      flashcards.value = []
      await loadHtmlPreview(art)
    } else {
      previewHtml.value = ''
      flashcards.value = (meta?.flashcards as Flashcard[]) || []
    }
  } else if (art.kind === 'quiz') {
    showQuizPreview.value = true
    // 兼容两种后端 schema：
    //   旧：{ question, options, answer:string, explanation }
    //   新：{ question, options, correct_index:number[], explanation }
    const rawList = (meta?.questions as any[]) || []
    quizQuestions.value = rawList.map((q: any) => normalizeQuizQuestion(q))
    quizAnswerRevealed.value = false
    quizUserAnswers.value = quizQuestions.value.map(() => [])
    quizSubmitted.value = false
  } else if (art.kind === 'audio_overview') {
    // 音频概览：浏览器原生 <audio src> 不会带 Authorization header，
    // 所以始终走 /api/v1/artifacts/:id/stream-token 拿一个 5 分钟有效的
    // HMAC 签名 URL，再挂到 <audio :src> 上。
    // 注意：不能使用 download_url，因为该字段可能是 http:// 导致混合内容错误。
    showAudioPreview.value = true
    audioMeta.value = meta as any
    audioSrc.value = ''
    try {
      const tok = await issueArtifactStreamToken(art.id)
      audioSrc.value = tok.url
    } catch (err: any) {
      console.error('[audio stream token] failed', err)
      MessagePlugin.error('音频加载失败，请稍后重试')
    }
  }
}

// 工具函数：把后端可能返回的两种 quiz schema 统一为前端使用的标准结构
function normalizeQuizQuestion(q: any): QuizQuestionView {
  const options: string[] = Array.isArray(q?.options) ? q.options.map(String) : []
  let correctIndex: number[] = []
  if (Array.isArray(q?.correct_index)) {
    correctIndex = q.correct_index.filter((i: any) => typeof i === 'number' && i >= 0 && i < options.length)
  } else if (typeof q?.answer === 'string' && q.answer) {
    // 旧 schema：answer 是字符串前缀（如 "A" 或 "A. xxx"），找匹配选项的下标
    const ans = q.answer.trim()
    const idx = options.findIndex((opt) => opt.startsWith(ans))
    if (idx >= 0) correctIndex = [idx]
  }
  return {
    type: q?.type === 'multiple' ? 'multiple' : 'single',
    question: String(q?.question || ''),
    options,
    correctIndex,
    explanation: typeof q?.explanation === 'string' ? q.explanation : '',
  }
}

// 工具函数：解析 payload_meta（既支持 string 也支持 object 形态）
function parsePayloadMeta(art: Artifact): Record<string, any> {
  try {
    return typeof art.payload_meta === 'string' ? JSON.parse(art.payload_meta) : (art.payload_meta || {})
  } catch {
    return {}
  }
}

// 工具函数：判断是否为原生 PPTX 文件（依据 content_type 或 URL 后缀）
function isPPTXContentType(contentType: string, payloadUri: string): boolean {
  if (contentType.includes('presentationml') || contentType.includes('officedocument')) return true
  if (payloadUri && /\.pptx(\?|$)/i.test(payloadUri)) return true
  return false
}

// 工具函数：格式化文件大小（bytes → KB/MB）
function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

// 工具函数：从 download endpoint 加载 HTML 内容到 previewHtml
async function loadHtmlPreview(art: Artifact) {
  previewLoading.value = true
  previewHtml.value = ''
  try {
    const res: any = await get(`/api/v1/artifacts/${art.id}/download`)
    previewHtml.value = typeof res === 'string' ? res : (res?.data || '')
  } catch {
    previewHtml.value = '<p style="color:red;padding:20px">加载失败</p>'
  } finally {
    previewLoading.value = false
  }
}

// 在 Office Web Viewer 中打开 PPTX 预览（新窗口）
function openInOnlineViewer() {
  if (pptOnlineViewerUrl.value) {
    window.open(pptOnlineViewerUrl.value, '_blank')
  }
}

function downloadArtifact(art: Artifact) {
  const url = art.download_url || `/api/v1/artifacts/${art.id}/download`
  // Use axios (with auth header) to fetch as blob, then trigger browser download
  import('@/utils/request').then(({ getDown }) => {
    getDown(url).then((blob: any) => {
      const blobUrl = URL.createObjectURL(blob instanceof Blob ? blob : new Blob([blob]))
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = art.title || 'artifact'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    }).catch((err: any) => {
      // Don't fall back to window.open(url) — that browser request has no
      // Authorization header and produces a raw 401 page. Surface a toast instead.
      console.error('[artifact download] failed', err)
      MessagePlugin.error('下载失败，请稍后重试')
    })
  })
}

function kindIcon(kind: string) {
  const map: Record<string, string> = { html: 'file-code', ppt: 'file-powerpoint', flashcard: 'education', quiz: 'check-circle', podcast: 'sound', mindmap: 'tree-round-dot', slides: 'layers', brief: 'file-paste', audio_overview: 'sound', infographic: 'chart-pie', report: 'file-paste' }
  return map[kind] || 'file'
}

function kindColor(kind: string) {
  const map: Record<string, string> = { html: '#0052d9', ppt: '#d54941', flashcard: '#e37318', quiz: '#00a870', podcast: '#8b5cf6', mindmap: '#0594fa', slides: '#d54941', brief: '#6b7280', audio_overview: '#8b5cf6', infographic: '#0594fa', report: '#0f7a5f' }
  return map[kind] || 'var(--td-brand-color)'
}

function kindLabel(kind: string) {
  const map: Record<string, string> = { html: 'HTML', ppt: 'PPT', flashcard: '闪卡', quiz: '测验', podcast: '播客', mindmap: '思维导图', slides: '幻灯片', brief: '摘要', audio_overview: '音频概览', infographic: '信息图', report: '报告' }
  return map[kind] || kind.toUpperCase()
}

function statusTheme(status: string) {
  switch (status) {
    case 'succeeded': return 'success'
    case 'failed': return 'danger'
    case 'running': return 'warning'
    default: return 'default'
  }
}

function statusLabel(status: string) {
  const map: Record<string, string> = { succeeded: '已完成', failed: '失败', running: '生成中', pending: '等待中', cancelled: '已取消' }
  return map[status] || status
}

function formatTime(ts: string) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// Quiz：切换某选项的选中状态（单选时排他，多选时切换）
function toggleQuizOption(qIdx: number, optIdx: number, type: 'single' | 'multiple') {
  if (quizSubmitted.value) return
  const cur = quizUserAnswers.value[qIdx] || []
  if (type === 'single') {
    quizUserAnswers.value[qIdx] = [optIdx]
  } else {
    if (cur.includes(optIdx)) {
      quizUserAnswers.value[qIdx] = cur.filter((i) => i !== optIdx)
    } else {
      quizUserAnswers.value[qIdx] = [...cur, optIdx]
    }
  }
}

// Quiz：提交答案，统一展示对错并计分
function submitQuiz() {
  quizSubmitted.value = true
  quizAnswerRevealed.value = true
}

// Quiz：得分（多选必须完全匹配才算对）
const quizScore = computed(() => {
  let score = 0
  quizQuestions.value.forEach((q, i) => {
    const user = (quizUserAnswers.value[i] || []).slice().sort().join(',')
    const correct = q.correctIndex.slice().sort().join(',')
    if (user && user === correct) score += 1
  })
  return score
})

// Audio：把 ms 格式化为 mm:ss
function formatDuration(ms: number | undefined): string {
  if (!ms || ms < 0) return '--:--'
  const total = Math.round(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.artifact-list-view { padding: 16px 24px; overflow-y: auto; }
.artifact-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.artifact-header-left { display: flex; align-items: center; gap: 8px; }
.artifact-title { font-size: 16px; font-weight: 600; margin: 0; }
.artifact-count { background: var(--td-brand-color-light); color: var(--td-brand-color); border-radius: 10px; padding: 1px 8px; font-size: 12px; }
.artifact-loading, .artifact-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; gap: 12px; color: var(--td-text-color-secondary); }
.artifact-empty-hint { font-size: 13px; color: var(--td-text-color-placeholder); margin-bottom: 4px; }
.artifact-empty-btns { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.artifact-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
.artifact-card { border: 1px solid rgba(226, 232, 240, 0.8); border-radius: 14px; padding: 14px 16px; cursor: pointer; transition: all 0.25s ease; position: relative; background: rgba(255, 255, 255, 0.95); box-shadow: 0 2px 8px -2px rgba(15, 23, 42, 0.06); }
.artifact-card:hover { border-color: var(--td-brand-color); box-shadow: 0 8px 20px -8px rgba(14, 165, 233, 0.15); transform: translateY(-2px); }
.artifact-card.is-running { border-color: var(--td-warning-color-3); }
.artifact-card-header { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.artifact-card-kind { font-size: 11px; font-weight: 600; color: var(--td-text-color-placeholder); letter-spacing: 0.5px; }
.artifact-card-status { margin-left: auto; }
.artifact-card-title { font-size: 14px; font-weight: 500; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.artifact-card-meta { font-size: 12px; color: var(--td-text-color-placeholder); }
.artifact-card-error { font-size: 12px; color: var(--td-error-color); margin-top: 6px; }
.artifact-card-progress { display: flex; align-items: center; gap: 6px; margin-top: 8px; font-size: 12px; color: var(--td-warning-color); }
.artifact-card-actions { position: absolute; top: 10px; right: 10px; display: flex; gap: 4px; }
.artifact-preview-container { display: flex; flex-direction: column; height: calc(100vh - 220px); min-height: 400px; }
.artifact-preview-toolbar { display: flex; justify-content: flex-end; padding: 8px 0; border-bottom: 1px solid var(--td-component-stroke); margin-bottom: 8px; }
.artifact-preview-iframe { flex: 1; width: 100%; border: 1px solid var(--td-component-stroke); border-radius: 6px; }
.artifact-preview-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; gap: 12px; }
.flashcard-preview { max-height: 80vh; overflow-y: auto; }
.flashcard-stats { font-size: 13px; color: var(--td-text-color-secondary); margin-bottom: 12px; }
.flashcard-list { display: flex; flex-direction: column; gap: 10px; }
.flashcard-item { border: 1px solid rgba(226, 232, 240, 0.8); border-radius: 12px; overflow: hidden; box-shadow: 0 2px 6px -2px rgba(15, 23, 42, 0.05); }
.flashcard-front { background: var(--td-bg-color-container); padding: 12px 14px; font-weight: 500; font-size: 14px; display: flex; gap: 8px; align-items: flex-start; }
.flashcard-num { color: var(--td-brand-color); font-size: 12px; font-weight: 600; min-width: 28px; padding-top: 1px; }
.flashcard-back { background: var(--td-bg-color-secondarycontainer); padding: 10px 14px 10px 50px; font-size: 13px; color: var(--td-text-color-secondary); border-top: 1px solid var(--td-component-stroke); }
.quiz-preview { max-height: 80vh; overflow-y: auto; }
.quiz-stats { font-size: 13px; color: var(--td-text-color-secondary); margin-bottom: 12px; }
.quiz-list { display: flex; flex-direction: column; gap: 16px; }
.quiz-item { border: 1px solid var(--td-component-stroke); border-radius: 8px; padding: 14px; }
.quiz-question { font-weight: 500; font-size: 14px; margin-bottom: 10px; }
.quiz-options { display: flex; flex-direction: column; gap: 6px; }
.quiz-option { padding: 7px 12px; border-radius: 6px; font-size: 13px; background: var(--td-bg-color-container); border: 1px solid var(--td-component-stroke); transition: all 0.2s; cursor: pointer; user-select: none; }
.quiz-option:hover { border-color: var(--td-brand-color-light); }
.quiz-option.is-selected { background: var(--td-brand-color-1); border-color: var(--td-brand-color); }
.quiz-option.is-answer { background: var(--td-success-color-1); border-color: var(--td-success-color); color: var(--td-success-color); font-weight: 500; }
.quiz-option.is-wrong { background: var(--td-error-color-1); border-color: var(--td-error-color); color: var(--td-error-color); }
.quiz-option-letter { display: inline-block; min-width: 22px; font-weight: 600; color: var(--td-text-color-secondary); }
.quiz-explanation { margin-top: 10px; font-size: 12px; color: var(--td-text-color-secondary); background: var(--td-bg-color-secondarycontainer); padding: 8px 10px; border-radius: 6px; }
.quiz-footer { margin-top: 16px; display: flex; justify-content: center; align-items: center; gap: 12px; padding-bottom: 4px; }
.quiz-score { font-size: 14px; font-weight: 600; color: var(--td-brand-color); }

/* 音频概览预览 */
.audio-preview { padding: 16px 4px; max-height: 78vh; overflow-y: auto; }
.audio-player-wrapper { background: var(--td-bg-color-container); border-radius: 8px; padding: 16px; margin-bottom: 16px; }
.audio-player { width: 100%; }
.audio-custom-controls { display: flex; align-items: center; gap: 10px; padding: 4px 0; }
.audio-play-btn { background: none; border: none; cursor: pointer; color: var(--td-brand-color); flex-shrink: 0; padding: 0; display: flex; align-items: center; line-height: 1; }
.audio-play-btn:hover { opacity: 0.8; }
.audio-time-current, .audio-time-total { font-size: 13px; color: var(--td-text-color-secondary); white-space: nowrap; flex-shrink: 0; min-width: 38px; font-variant-numeric: tabular-nums; }
.audio-time-total { text-align: right; }
.audio-seek-bar { flex: 1; height: 4px; accent-color: var(--td-brand-color); cursor: pointer; }
.audio-meta { background: var(--td-bg-color-secondarycontainer); border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; }
.audio-meta-row { font-size: 13px; padding: 3px 0; }
.audio-meta-label { color: var(--td-text-color-secondary); display: inline-block; min-width: 76px; }
.audio-transcript { border-top: 1px solid var(--td-component-stroke); padding-top: 12px; margin-bottom: 16px; }
.audio-transcript-title { font-size: 14px; font-weight: 600; margin: 0 0 12px 0; color: var(--td-text-color); }
.audio-segment { display: flex; gap: 12px; padding: 8px 12px; margin-bottom: 6px; border-radius: 6px; font-size: 13px; line-height: 1.6; }
.audio-segment.is-host-a { background: var(--td-brand-color-1); }
.audio-segment.is-host-b { background: var(--td-warning-color-1); }
.audio-segment-speaker { font-weight: 600; min-width: 60px; flex-shrink: 0; }
.audio-segment-text { flex: 1; color: var(--td-text-color); }
.audio-actions { display: flex; justify-content: center; padding-top: 8px; }
.audio-speed-select { font-size: 12px; color: var(--td-text-color-secondary); background: var(--td-bg-color-container); border: 1px solid var(--td-component-stroke); border-radius: 4px; padding: 2px 4px; cursor: pointer; flex-shrink: 0; }

/* PPT 预览 - 原生 PPTX 信息卡片 */
.ppt-pptx-card { display: flex; flex-direction: column; align-items: center; padding: 40px 20px; text-align: center; }
.ppt-pptx-title { font-size: 20px; font-weight: 600; margin: 16px 0 8px; }
.ppt-pptx-desc { color: var(--td-text-color-secondary); font-size: 14px; margin-bottom: 24px; }
.ppt-pptx-meta { background: var(--td-bg-color-container); border-radius: 8px; padding: 16px 20px; min-width: 320px; margin-bottom: 24px; text-align: left; }
.ppt-pptx-meta-item { font-size: 13px; padding: 4px 0; color: var(--td-text-color); }
.ppt-pptx-meta-label { color: var(--td-text-color-secondary); display: inline-block; min-width: 76px; }
.ppt-pptx-actions { display: flex; gap: 12px; margin-bottom: 16px; }
.ppt-pptx-hint { font-size: 12px; color: var(--td-text-color-placeholder); max-width: 480px; line-height: 1.6; }

/* PPT/Flashcard 预览工具栏调整 */
.artifact-preview-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 12px; background: var(--td-bg-color-container); border-bottom: 1px solid var(--td-component-stroke); }

/* SVG 幻灯片预览容器 — 让 PptSvgViewer 充满对话框 */
.artifact-svg-preview { height: calc(100vh - 220px); min-height: 480px; }
.artifact-svg-preview > * { height: 100%; }

/* 闪卡对话框：让 FlashcardViewer 自适应 */
.flashcard-dialog :deep(.t-dialog__body) { padding: 0; }
.flashcard-dialog :deep(.t-dialog) { max-height: 92vh; }
.flashcard-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 320px; gap: 12px; color: var(--td-text-color-placeholder); }
</style>
