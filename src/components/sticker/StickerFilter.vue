<template>
  <div class="sticker-filter">
    <el-card shadow="never">
      <template #header>
        <div class="filter-header">
          <h3>筛选表情包</h3>
          <el-button text @click="filterStore.resetFilters()">重置筛选</el-button>
        </div>
      </template>

      <div class="filter-content">
        <div class="filter-item">
          <div class="filter-title">展示模式</div>
          <el-radio-group v-model="displayMode" size="large">
            <el-tooltip content="网格模式">
              <el-radio-button value="grid">
                <el-icon><Grid /></el-icon>
              </el-radio-button>
            </el-tooltip>
            <el-tooltip content="列表模式">
              <el-radio-button value="list">
                <el-icon><List /></el-icon>
              </el-radio-button>
            </el-tooltip>
            <el-tooltip content="瀑布流模式">
              <el-radio-button value="waterfall">
                <el-icon><PictureFilled /></el-icon>
              </el-radio-button>
            </el-tooltip>
          </el-radio-group>
        </div>

        <div class="filter-item">
          <div class="filter-title">排序方式</div>
          <el-radio-group v-model="sortType" size="default">
            <el-radio-button value="created_at">最新上传</el-radio-button>
            <el-radio-button value="likes">最多喜欢</el-radio-button>
            <el-radio-button value="dislikes">最多不喜欢</el-radio-button>
          </el-radio-group>
        </div>

        <div class="filter-item">
          <div class="filter-title">标签筛选</div>
          <el-select
            v-model="selectedTags"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
            placeholder="选择标签"
            style="width: 100%"
          >
            <el-option
              v-for="tag in stickerStore.availableTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
          <div class="filter-tip" v-if="selectedTags.length > 0">
            已选择 {{ selectedTags.length }} 个标签
            <el-button link type="primary" @click="selectedTags = []">清空</el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useStickerStore } from '@/store/stickerStore'
import { useStickerFilterStore } from '@/store/stickerFilterStore'
import { Grid, List, PictureFilled } from '@element-plus/icons-vue'

const stickerStore = useStickerStore()
const filterStore = useStickerFilterStore()

const displayMode = computed({
  get: () => filterStore.displayMode,
  set: (val) => filterStore.displayMode = val,
})

const sortType = computed({
  get: () => filterStore.sort,
  set: (val) => filterStore.sort = val,
})

const selectedTags = computed({
  get: () => filterStore.selectedTags,
  set: (val) => filterStore.selectedTags = val,
})

onMounted(async () => {
  if (stickerStore.availableTags.length === 0) {
    await stickerStore.fetchAllTags()
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;

.sticker-filter {
  margin-bottom: var(--app-spacing-lg);

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }
  }

  .filter-content {
    .filter-item {
      margin-bottom: var(--app-spacing-md);

      &:last-child {
        margin-bottom: 0;
      }

      .filter-title {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        margin-bottom: var(--app-spacing-sm);
      }
    }
  }
}

.filter-tip {
  margin-top: var(--app-spacing-sm);
  font-size: 12px;
  color: var(--el-text-color-secondary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@include respond-to(tablet) {
  .sticker-filter .filter-content .filter-item {
    :deep(.el-radio-group) {
      display: flex;
      flex-wrap: wrap;

      .el-radio-button {
        margin-bottom: var(--app-spacing-sm);
      }
    }
  }
}
</style>
