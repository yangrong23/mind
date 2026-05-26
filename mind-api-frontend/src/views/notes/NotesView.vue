<template>
  <div class="notes-view">
    <header class="notes-header">
      <div class="notes-header-title">
        <h1>{{ $t('notes.title') }}</h1>
        <p class="notes-header-subtitle">{{ $t('notes.subtitle') }}</p>
      </div>
      <div class="notes-header-actions">
        <t-input
          v-model="searchKeyword"
          :placeholder="$t('notes.searchPlaceholder')"
          clearable
          class="notes-search"
        >
          <template #prefix-icon>
            <t-icon name="search" />
          </template>
        </t-input>
        <t-button theme="primary" @click="handleNewNote">
          <template #icon><t-icon name="add" /></template>
          {{ $t('notes.create') }}
        </t-button>
      </div>
    </header>

    <div class="notes-body">
      <aside class="notes-list">
        <div v-if="loading && notes.length === 0" class="notes-list-loading">
          <t-skeleton animation="gradient" :row-col="[{ width: '100%', height: '64px' }, { width: '100%', height: '64px' }, { width: '100%', height: '64px' }]" />
        </div>
        <div v-else-if="filteredNotes.length === 0" class="notes-empty">
          <div class="notes-empty-icon">
            <t-icon name="file-add" size="32" />
          </div>
          <p class="notes-empty-title">{{ $t('notes.empty.title') }}</p>
          <p class="notes-empty-hint">{{ $t('notes.empty.hint') }}</p>
        </div>
        <div v-else class="notes-list-items">
          <div
            v-for="note in filteredNotes"
            :key="note.id"
            class="note-list-item"
            :class="{ active: selected?.id === note.id }"
            @click="selectNote(note)"
          >
            <div class="note-list-item-title">{{ stripExt(note.name) }}</div>
            <div class="note-list-item-meta">
              <span>{{ formatRelative(note.updated_at) }}</span>
              <span v-if="note.size_bytes" class="note-list-item-size">{{ formatBytes(note.size_bytes) }}</span>
            </div>
          </div>
        </div>
      </aside>

      <main class="notes-editor">
        <div v-if="!selected" class="notes-editor-empty">
          <div class="notes-editor-empty-orb"></div>
          <h2>{{ $t('notes.placeholder.title') }}</h2>
          <p>{{ $t('notes.placeholder.hint') }}</p>
        </div>
        <template v-else>
          <div class="notes-editor-toolbar">
            <t-input
              v-model="editingName"
              class="notes-editor-title"
              :placeholder="$t('notes.untitled')"
              borderless
              @blur="commitName"
            />
            <div class="notes-editor-actions">
              <span v-if="saveState === 'saving'" class="save-state">{{ $t('notes.saving') }}</span>
              <span v-else-if="saveState === 'saved'" class="save-state saved">{{ $t('notes.saved') }}</span>
              <t-button variant="text" theme="default" @click="handleDelete">
                <template #icon><t-icon name="delete" /></template>
              </t-button>
            </div>
          </div>
          <textarea
            v-model="editingContent"
            class="notes-editor-textarea"
            :placeholder="$t('notes.editor.placeholder')"
            spellcheck="false"
            @input="scheduleAutoSave"
          />
        </template>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import {
  listNotes,
  createMarkdownNote,
  fetchNoteContent,
  renameNote,
  deleteNote,
  type NoteFile,
} from '@/api/notes'

const { t } = useI18n()

const notes = ref<NoteFile[]>([])
const selected = ref<NoteFile | null>(null)
const editingName = ref('')
const editingContent = ref('')
const loading = ref(false)
const searchKeyword = ref('')
const saveState = ref<'idle' | 'saving' | 'saved'>('idle')

let autoSaveTimer: ReturnType<typeof setTimeout> | null = null
const AUTO_SAVE_DELAY = 1200

const filteredNotes = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  const visible = notes.value.filter(n => !n.deleted_at)
  if (!kw) return visible
  return visible.filter(n => n.name.toLowerCase().includes(kw))
})

function stripExt(name: string): string {
  return name.replace(/\.md$/i, '') || t('notes.untitled')
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

function formatRelative(iso: string): string {
  const d = new Date(iso)
  const diffSec = (Date.now() - d.getTime()) / 1000
  if (diffSec < 60) return t('time.justNow')
  if (diffSec < 3600) return t('time.minutesAgo', { n: Math.floor(diffSec / 60) })
  if (diffSec < 86400) return t('time.hoursAgo', { n: Math.floor(diffSec / 3600) })
  return d.toLocaleDateString()
}

async function refreshList() {
  loading.value = true
  try {
    const resp = await listNotes({ limit: 200 })
    notes.value = (resp.data?.items ?? [])
      .filter(it => !it.deleted_at && it.category === 'note')
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  } catch (err: any) {
    MessagePlugin.error(err?.message || t('notes.loadFailed'))
  } finally {
    loading.value = false
  }
}

async function selectNote(note: NoteFile) {
  if (selected.value?.id === note.id) return
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
    await flushSave()
  }
  selected.value = note
  editingName.value = stripExt(note.name)
  editingContent.value = ''
  saveState.value = 'idle'
  try {
    editingContent.value = await fetchNoteContent(note)
  } catch {
    MessagePlugin.error(t('notes.loadContentFailed'))
  }
}

async function handleNewNote() {
  try {
    saveState.value = 'saving'
    const fresh = await createMarkdownNote(t('notes.untitled'), '')
    notes.value.unshift(fresh)
    await selectNote(fresh)
    saveState.value = 'saved'
  } catch (err: any) {
    saveState.value = 'idle'
    MessagePlugin.error(err?.message || t('notes.createFailed'))
  }
}

function scheduleAutoSave() {
  saveState.value = 'idle'
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(flushSave, AUTO_SAVE_DELAY)
}

async function flushSave() {
  if (!selected.value) return
  const name = editingName.value.trim() || t('notes.untitled')
  const content = editingContent.value
  saveState.value = 'saving'
  try {
    const fresh = await createMarkdownNote(name, content)
    if (selected.value && selected.value.id !== fresh.id) {
      try { await deleteNote(selected.value.id) } catch { /* ignore */ }
    }
    const idx = notes.value.findIndex(n => n.id === selected.value?.id)
    if (idx >= 0) notes.value[idx] = fresh
    else notes.value.unshift(fresh)
    selected.value = fresh
    saveState.value = 'saved'
  } catch {
    saveState.value = 'idle'
    MessagePlugin.error(t('notes.saveFailed'))
  }
}

async function commitName() {
  if (!selected.value) return
  const desired = editingName.value.trim()
  if (!desired) return
  const newName = desired.endsWith('.md') ? desired : `${desired}.md`
  if (newName === selected.value.name) return
  try {
    const resp = await renameNote(selected.value.id, newName)
    selected.value = resp.data
    const idx = notes.value.findIndex(n => n.id === resp.data.id)
    if (idx >= 0) notes.value[idx] = resp.data
  } catch {
    MessagePlugin.error(t('notes.renameFailed'))
  }
}

function handleDelete() {
  if (!selected.value) return
  const target = selected.value
  const dialog = DialogPlugin.confirm({
    header: t('notes.delete.title'),
    body: t('notes.delete.body', { name: stripExt(target.name) }),
    confirmBtn: { content: t('common.delete'), theme: 'danger' as const },
    cancelBtn: t('common.cancel'),
    onConfirm: async () => {
      try {
        await deleteNote(target.id)
        notes.value = notes.value.filter(n => n.id !== target.id)
        selected.value = null
        editingName.value = ''
        editingContent.value = ''
        MessagePlugin.success(t('notes.delete.success'))
      } catch {
        MessagePlugin.error(t('notes.delete.failed'))
      }
      dialog.destroy()
    },
  })
}

onMounted(refreshList)
onBeforeUnmount(() => {
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
})
</script>

<style lang="less" scoped>
.notes-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.notes-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 28px 16px;
  flex-shrink: 0;
}

.notes-header-title h1 {
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--td-text-color-primary);
  margin: 0 0 4px;
}

.notes-header-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--td-text-color-secondary);
}

.notes-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notes-search {
  width: 240px;
}

.notes-body {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 16px;
  padding: 0 28px 28px;
}

.notes-list {
  width: 320px;
  flex-shrink: 0;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px -2px rgba(15, 23, 42, 0.06);
  overflow-y: auto;
  padding: 8px;
}

.notes-list-loading {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notes-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  text-align: center;
  color: var(--td-text-color-placeholder);
}

.notes-empty-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(14, 165, 233, 0.1);
  color: var(--td-brand-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.notes-empty-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--td-text-color-secondary);
  margin: 0 0 4px;
}

.notes-empty-hint {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
  margin: 0;
}

.notes-list-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.note-list-item {
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;

  &:hover {
    background: rgba(14, 165, 233, 0.04);
  }

  &.active {
    background: rgba(14, 165, 233, 0.1);
    border-color: rgba(14, 165, 233, 0.2);
  }
}

.note-list-item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 2px;
}

.note-list-item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--td-text-color-placeholder);
}

.note-list-item-size {
  &::before {
    content: '·';
    margin-right: 6px;
    opacity: 0.6;
  }
}

.notes-editor {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px -2px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.notes-editor-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px;
  color: var(--td-text-color-secondary);

  h2 {
    font-size: 18px;
    margin: 16px 0 4px;
    color: var(--td-text-color-primary);
  }

  p {
    margin: 0;
    font-size: 13px;
  }
}

.notes-editor-empty-orb {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, rgba(14, 165, 233, 0.4), rgba(14, 165, 233, 0.05) 70%);
  animation: orb-pulse 4s ease-in-out infinite;
}

@keyframes orb-pulse {
  0%, 100% { transform: scale(0.92); opacity: 0.65; }
  50% { transform: scale(1.08); opacity: 1; }
}

.notes-editor-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  flex-shrink: 0;
}

.notes-editor-title {
  flex: 1;
  font-size: 18px;
  font-weight: 600;

  :deep(.t-input__inner) {
    font-size: 18px;
    font-weight: 600;
    padding: 0;
  }
}

.notes-editor-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.save-state {
  font-size: 12px;
  color: var(--td-text-color-placeholder);

  &.saved {
    color: var(--td-success-color);
  }
}

.notes-editor-textarea {
  flex: 1;
  min-height: 0;
  padding: 20px 24px;
  border: none;
  outline: none;
  resize: none;
  font-family: var(--app-font-family);
  font-size: 15px;
  line-height: 1.7;
  color: var(--td-text-color-primary);
  background: transparent;
}
</style>
