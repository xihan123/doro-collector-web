<template>
  <div class="app-container">
    <app-header />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <app-footer />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import { useThemeStore } from '@/store/themeStore'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initTheme()
})
</script>

<style lang="scss">
@use '@/assets/styles/main.scss';
</style>
