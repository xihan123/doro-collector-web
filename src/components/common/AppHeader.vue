<template>
  <div class="app-header">
    <div class="header-container">
      <div class="header-left">
        <router-link to="/" class="logo">
          <img src="@/assets/logo.svg" alt="DORO 表情包"/>
          <span>DORO 表情包收集</span>
        </router-link>
      </div>

      <div class="header-center">
        <div class="search-container">
          <el-input
              v-model="searchText"
              placeholder="搜索表情包描述"
              clearable
              @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon>
                <Search/>
              </el-icon>
            </template>
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
      </div>

      <div class="header-right">
        <router-link to="/upload" class="upload-btn">
          <el-button type="primary" :icon="Plus">上传表情包</el-button>
        </router-link>

        <el-tooltip content="切换主题">
          <el-button
              circle
              :icon="themeStore.isDark ? Sunny : Moon"
              @click="themeStore.toggleTheme()"
          />
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue';
import {useRouter} from 'vue-router';
import {useStickerStore} from '@/store/stickerStore';
import {useThemeStore} from '@/store/themeStore';
import {Moon, Plus, Search, Sunny} from '@element-plus/icons-vue';

const router = useRouter();
const stickerStore = useStickerStore();
const themeStore = useThemeStore();

const searchText = ref('');

// 监听 store 中的搜索关键字变化
watch(() => stickerStore.search, (newVal) => {
  searchText.value = newVal;
});

const handleSearch = () => {
  stickerStore.setSearch(searchText.value);
  stickerStore.fetchStickers(true);

  // 如果不在首页，则跳转到首页
  if (router.currentRoute.value.name !== 'Home') {
    router.push('/');
  }
};
</script>

<style lang="scss" scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--el-bg-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;

  .header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    padding: 0 20px;
    max-width: 1400px;
    margin: 0 auto;

    .header-left {
      .logo {
        display: flex;
        align-items: center;
        text-decoration: none;
        color: var(--el-text-color-primary);

        img {
          height: 32px;
          margin-right: 10px;
        }

        span {
          font-size: 18px;
          font-weight: bold;
        }
      }
    }

    .header-center {
      flex: 1;
      margin: 0 20px;

      .search-container {
        max-width: 500px;
        margin: 0 auto;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }
}

@media (max-width: 768px) {
  .app-header {
    .header-container {
      flex-direction: column;
      height: auto;
      padding: 10px;

      .header-left, .header-center, .header-right {
        width: 100%;
        margin: 5px 0;
      }

      .header-right {
        justify-content: space-between;
      }
    }
  }
}
</style>