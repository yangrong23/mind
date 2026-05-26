<template>
  <div v-if="variant === 'workbench'" :class="['lshot', className]">
    <div class="lshot-chrome">
      <div class="lshot-bar">
        <span class="dot dot-r" /><span class="dot dot-y" /><span class="dot dot-g" />
        <span class="lshot-title">Mindar · Dashboard</span>
      </div>
      <div class="lshot-body lshot-dashboard">
        <div class="lshot-rail">
          <span v-for="n in 6" :key="n" class="lshot-rail-item" :class="{ active: n === 1 }" />
        </div>
        <div class="lshot-main">
          <p class="lshot-h">Good afternoon, John</p>
          <p class="lshot-sub">Pick up where you left off</p>
          <div class="lshot-pills">
            <span v-for="p in ['New note', 'Upload', 'Ask Mindar', 'Open library']" :key="p">{{ p }}</span>
          </div>
          <div class="lshot-cards">
            <div v-for="i in 4" :key="i" class="lshot-card" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="variant === 'library'" :class="['lshot', className]">
    <div class="lshot-chrome">
      <div class="lshot-bar">
        <span class="dot dot-r" /><span class="dot dot-y" /><span class="dot dot-g" />
        <span class="lshot-title">Library · Add sources</span>
      </div>
      <div class="lshot-body lshot-library">
        <div class="lshot-upload" />
        <div class="lshot-rows">
          <div v-for="i in 4" :key="i" class="lshot-row" />
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="variant === 'chat'" :class="['lshot', className]">
    <div class="lshot-chrome">
      <div class="lshot-bar">
        <span class="dot dot-r" /><span class="dot dot-y" /><span class="dot dot-g" />
        <span class="lshot-title">Product library · Workspace</span>
      </div>
      <div class="lshot-body lshot-workspace">
        <div class="lshot-col lshot-sources">
          <p class="lshot-col-label">Sources</p>
          <div v-for="i in 3" :key="i" class="lshot-src" :class="{ active: i === 1 }" />
        </div>
        <div class="lshot-col lshot-center">
          <p class="lshot-col-label">Overview</p>
          <div class="lshot-chat">
            <div class="lshot-user-bubble">Who are our core target users?</div>
            <div class="lshot-bot">
              <span class="lshot-avatar" />
              <div class="lshot-bot-text">
                <p>Knowledge workers who manage many documents</p>
                <div class="lshot-cites">
                  <span>User research report.pdf</span>
                  <span>Interview notes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="lshot-col lshot-studio">
          <p class="lshot-col-label">Studio</p>
          <div class="lshot-studio-grid">
            <div v-for="l in ['Report', 'Slides', 'Quiz', 'Audio']" :key="l" class="lshot-studio-tile">{{ l }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- notes / team reuse workspace chrome -->
  <div v-else-if="variant === 'notes' || variant === 'team'" :class="['lshot', className]">
    <div class="lshot-chrome">
      <div class="lshot-bar">
        <span class="dot dot-r" /><span class="dot dot-y" /><span class="dot dot-g" />
        <span class="lshot-title">Product library · Workspace</span>
      </div>
      <div class="lshot-body lshot-workspace" style="min-height: 240px" />
    </div>
  </div>

  <div v-else-if="variant === 'permission'" :class="['lperm', permVariant]">
    <div class="lperm-inner" />
  </div>

  <div v-else-if="variant === 'platform'" class="lplatform">
    <div class="lplatform-frame">
      <div class="lplatform-screen" />
    </div>
    <span class="lplatform-label">{{ platformLabel }}</span>
  </div>

  <div v-else-if="variant === 'resource'" :class="['lresource', resourceTint]">
    <div class="lresource-cover" />
    <div class="lresource-foot">
      <span>{{ resourceLabel }}</span>
      <strong>{{ resourceStat }}</strong>
    </div>
  </div>

  <div v-else-if="variant === 'use-case'" :class="['lusecase', useCaseTint]">
    <div class="lusecase-thumb" />
    <div class="lusecase-body">
      <h3>{{ useCaseTitle }}</h3>
      <p>{{ useCaseDesc }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  variant:
    | 'workbench'
    | 'library'
    | 'chat'
    | 'notes'
    | 'team'
    | 'permission'
    | 'platform'
    | 'resource'
    | 'use-case'
  className?: string
  permVariant?: 'private' | 'team' | 'public'
  platformLabel?: string
  resourceLabel?: string
  resourceStat?: string
  resourceTint?: string
  useCaseTitle?: string
  useCaseDesc?: string
  useCaseTint?: string
}>()
</script>

<style scoped>
.lshot {
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 24px 80px -20px rgba(30, 41, 59, 0.22);
  width: 100%;
}
.lshot-chrome { overflow: hidden; }
.lshot-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #f1f5f9;
  background: rgba(248, 250, 252, 0.95);
  padding: 10px 16px;
}
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot-r { background: #ff5f57; }
.dot-y { background: #febc2e; }
.dot-g { background: #28c840; }
.lshot-title { margin-left: 4px; font-size: 12px; font-weight: 500; color: #64748b; }
.lshot-body { background: #fff; }
.lshot-dashboard { display: flex; min-height: 340px; }
.lshot-rail {
  width: 56px;
  border-right: 1px solid #f1f5f9;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #f8fafc;
}
.lshot-rail-item {
  height: 8px;
  border-radius: 4px;
  background: #e2e8f0;
}
.lshot-rail-item.active { background: #99f6e4; }
.lshot-main { flex: 1; padding: 16px; }
.lshot-h { font-size: 13px; font-weight: 600; color: #3f3f46; margin: 0; }
.lshot-sub { font-size: 11px; color: #71717a; margin: 4px 0 0; }
.lshot-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.lshot-pills span {
  border-radius: 999px;
  border: 1px solid #e7e5e4;
  background: #fff;
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 500;
  color: #52525b;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.lshot-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
.lshot-card {
  height: 72px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f0fdfa, #f5f3ff);
  border: 1px solid #f1f5f9;
}
.lshot-library { padding: 12px; min-height: 280px; }
.lshot-upload {
  height: 80px;
  border-radius: 12px;
  border: 2px dashed #e7e5e4;
  background: #fafaf9;
  margin-bottom: 12px;
}
.lshot-rows { display: flex; flex-direction: column; gap: 8px; }
.lshot-row {
  height: 36px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
}
.lshot-workspace { display: flex; min-height: 300px; }
.lshot-col { padding: 10px; border-right: 1px solid #f1f5f9; }
.lshot-sources { width: 26%; }
.lshot-center { flex: 1; }
.lshot-studio { width: 28%; border-right: none; }
.lshot-col-label {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  color: #a1a1aa;
  margin: 0 0 8px;
}
.lshot-src { height: 14px; border-radius: 4px; background: #f1f5f9; margin-bottom: 4px; }
.lshot-src.active { background: #ccfbf1; }
.lshot-chat { margin-top: 8px; }
.lshot-user-bubble {
  margin-left: auto;
  max-width: 78%;
  border-radius: 12px;
  border-top-right-radius: 4px;
  background: #18181b;
  color: #fff;
  font-size: 11px;
  padding: 8px 12px;
  width: fit-content;
}
.lshot-bot { display: flex; gap: 8px; margin-top: 10px; }
.lshot-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ccfbf1, #ede9fe);
  flex-shrink: 0;
}
.lshot-bot-text {
  flex: 1;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  background: #fff;
  padding: 8px;
  font-size: 11px;
  color: #52525b;
}
.lshot-bot-text p { margin: 0; }
.lshot-cites { display: flex; gap: 4px; margin-top: 6px; flex-wrap: wrap; }
.lshot-cites span {
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 6px;
  background: #f0fdfa;
  color: #0f766e;
}
.lshot-studio-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.lshot-studio-tile {
  font-size: 8px;
  font-weight: 600;
  text-align: center;
  padding: 12px 4px;
  border-radius: 10px;
  border: 1px solid #e7e5e4;
  background: #fff;
  color: #52525b;
}
.lperm {
  width: 100px;
  height: 72px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.lperm-inner { width: 100%; height: 100%; }
.lperm.private .lperm-inner { background: linear-gradient(135deg, #f1f5f9, #e2e8f0); }
.lperm.team .lperm-inner { background: linear-gradient(135deg, #ccfbf1, #e0f2fe); }
.lperm.public .lperm-inner { background: linear-gradient(135deg, #ede9fe, #fce7f3); }
.lplatform { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.lplatform-frame {
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.7);
  padding: 4px;
  box-shadow: 0 8px 32px -8px rgba(30, 41, 59, 0.15);
  backdrop-filter: blur(8px);
}
.lplatform-screen {
  width: 140px;
  height: 88px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f0f9ff, #f5f3ff);
}
.lplatform-label { font-size: 14px; font-weight: 500; color: #475569; }
.lresource {
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
}
.lresource-cover { height: 100px; background: linear-gradient(135deg, #e0f2fe, #f5f3ff); }
.lresource-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.6);
  padding: 12px 16px;
  font-size: 14px;
  color: #1e293b;
}
.lresource-foot strong { font-weight: 700; }
.lresource.tint-sky .lresource-cover { background: rgba(186, 230, 253, 0.45); }
.lresource.tint-emerald .lresource-cover { background: rgba(167, 243, 208, 0.45); }
.lresource.tint-violet .lresource-cover { background: rgba(221, 214, 254, 0.45); }
.lresource.tint-amber .lresource-cover { background: rgba(253, 230, 138, 0.45); }
.lresource.tint-rose .lresource-cover { background: rgba(254, 205, 211, 0.45); }
.lresource.tint-indigo .lresource-cover { background: rgba(199, 210, 254, 0.4); }
.lusecase {
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(8px);
  cursor: pointer;
  transition: box-shadow 0.2s;
  text-align: left;
}
.lusecase:hover { box-shadow: 0 8px 28px rgba(0, 0, 0, 0.1); }
.lusecase-thumb {
  height: 120px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
  background: #f3f4f8;
}
.lusecase-body { padding: 20px 24px 24px; }
.lusecase-body h3 { margin: 0; font-size: 18px; font-weight: 600; color: #0f172a; }
.lusecase-body p { margin: 8px 0 0; font-size: 14px; line-height: 1.6; color: #64748b; }
.lusecase.tint-sky { background: linear-gradient(to bottom, rgba(224, 242, 254, 0.9), rgba(255, 255, 255, 0.4)); }
.lusecase.tint-work { background: linear-gradient(to bottom, rgba(237, 233, 254, 0.85), rgba(255, 255, 255, 0.4)); }
.lusecase.tint-project { background: linear-gradient(to bottom, rgba(204, 251, 241, 0.85), rgba(255, 255, 255, 0.4)); }
</style>
