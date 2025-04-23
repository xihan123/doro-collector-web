<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-links">
        <router-link to="/about" class="footer-link">关于</router-link>
        <a href="https://github.com/xihan123/doro-collector-api" target="_blank" class="footer-link">GitHub</a>
      </div>

      <p class="copyright">© {{ currentYear }} DORO 表情包收集. All Rights Reserved.</p>

      <div class="footer-records">
        <a class="record-item beian" href="#" target="_blank">
          <img src="@/assets/beian.png" alt="公安备案"/>
          <span>公安备案号预留</span>
        </a>
        <a class="record-item icp" href="https://beian.miit.gov.cn/" target="_blank">
          <span>ICP备案号预留</span>
        </a>
        <p class="updated-time">更新时间：{{ formattedDateTime }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';

const currentYear = computed(() => new Date().getFullYear());

// 使用中国格式的日期时间 (YYYY-MM-DD HH:MM:SS)
const formattedDateTime = ref('2025-04-22 14:55:17');

// 如果需要动态更新时间，可以使用以下代码
// const now = new Date();
// const formattedDateTime = ref(
//   `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
// );
</script>

<style lang="scss" scoped>
.app-footer {
  margin-top: 40px;
  padding: 20px;
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-light);

  .footer-content {
    max-width: 1200px;
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
      gap: 8px;

      .record-item {
        display: flex;
        align-items: center;
        color: var(--el-text-color-secondary);
        text-decoration: none;

        &:hover {
          color: var(--el-color-primary);
        }

        img {
          height: 18px;
          margin-right: 5px;
        }
      }

      .updated-time {
        margin: 5px 0;
        font-size: 12px;
      }
    }
  }
}

@media (max-width: 768px) {
  .app-footer {
    padding: 15px 10px;

    .footer-content {
      .footer-records {
        flex-direction: column;
        gap: 10px;
      }
    }
  }
}
</style>