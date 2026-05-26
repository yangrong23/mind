<!-- Legacy stub: /landing is rendered by the React shell (see src/react/pages/LandingPage.tsx). -->
<template>
  <p class="landing-stub">Redirecting to React landing…</p>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
onMounted(() => {
  if (window.location.pathname === '/landing') {
    window.location.replace('/landing')
  } else {
    void router.replace('/landing')
  }
})
</script>

<style scoped>
.landing-stub {
  display: none;
}
</style>
