<template>
  <!-- 注意这里不要再用 class 绑定 -->
  <div class="app-container">
    <app-header/>
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component"/>
        </transition>
      </router-view>
    </main>
    <app-footer/>
  </div>
</template>

<script setup lang="ts">
import {onMounted} from 'vue';
import AppHeader from '@/components/common/AppHeader.vue';
import AppFooter from '@/components/common/AppFooter.vue';
import {useThemeStore} from '@/store/themeStore';

const themeStore = useThemeStore();

onMounted(() => {
  // 初始化主题
  themeStore.initTheme();
});

</script>

<style lang="scss">
:root {
  --app-transition-duration: 0.3s;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
  'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
  transition: background-color var(--app-transition-duration), color var(--app-transition-duration);
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: background-color var(--app-transition-duration), color var(--app-transition-duration);

  .main-content {
    flex: 1;
  }
}

/* 确保 dark 类正确应用 */
html.dark {
  color-scheme: dark;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 针对按钮的动画效果 */
.button-animated {
  animation-duration: 0.3s;
  animation-name: button-pulse;
  animation-timing-function: ease-in-out;
}

@keyframes button-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>