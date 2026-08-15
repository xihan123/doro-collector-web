<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-links">
        <router-link to="/about" class="footer-link">关于</router-link>
        <a href="https://github.com/xihan123/doro-collector-api" target="_blank" class="footer-link">API</a>
        <a href="https://github.com/xihan123/doro-collector-web" target="_blank" class="footer-link">UI</a>
        <a href="https://beian.miit.gov.cn/" target="_blank" class="footer-link">赣ICP备2024043470号</a>
        <a href="https://beian.mps.gov.cn/#/query/webSearch?code=36110002000153" rel="noreferrer" target="_blank" class="footer-link">赣公网安备36110002000153号</a>
      </div>
      <p class="copyright">&copy; {{ currentYear }} DORO 表情包收集. All Rights Reserved.</p>
      <div class="footer-records">
        <p class="updated-time">更新时间：{{ formattedDateTime }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
const formattedDateTime = new Date().toLocaleString('zh-CN')
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;

.app-footer {
  margin-top: 40px;
  padding: var(--app-spacing-lg);
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-light);

  .footer-content {
    max-width: var(--app-width-content);
    margin: 0 auto;
    text-align: center;
    color: var(--el-text-color-secondary);

    .footer-links {
      margin-bottom: 15px;
      display: flex;
      justify-content: center;
      gap: 20px;

      .footer-link {
        color: var(--el-color-primary);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .copyright {
      margin: 10px 0;
    }

    .footer-records {
      margin-top: 15px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--app-spacing-sm);

      .updated-time {
        margin: 5px 0;
        font-size: 12px;
      }
    }
  }
}

@include respond-to(tablet) {
  .app-footer {
    padding: 15px 10px;
  }
}
</style>
