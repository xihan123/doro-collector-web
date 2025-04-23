<template>
  <div class="sticker-filter">
    <el-card shadow="never">
      <template #header>
        <div class="filter-header">
          <h3>筛选表情包</h3>
          <el-button text @click="resetFilters">重置筛选</el-button>
        </div>
      </template>

      <div class="filter-content">
        <div class="filter-item">
          <div class="filter-title">展示模式</div>
          <el-radio-group v-model="displayMode" size="large">
            <el-tooltip content="网格模式">
              <el-radio-button label="grid">
                <el-icon>
                  <Grid/>
                </el-icon>
              </el-radio-button>
            </el-tooltip>
            <el-tooltip content="列表模式">
              <el-radio-button label="list">
                <el-icon>
                  <List/>
                </el-icon>
              </el-radio-button>
            </el-tooltip>
            <el-tooltip content="瀑布流模式">
              <el-radio-button label="waterfall">
                <el-icon>
                  <PictureFilled/>
                </el-icon>
              </el-radio-button>
            </el-tooltip>
          </el-radio-group>
        </div>

        <div class="filter-item">
          <div class="filter-title">排序方式</div>
          <el-radio-group v-model="sortType" size="default">
            <el-radio-button label="created_at">最新上传</el-radio-button>
            <el-radio-button label="likes">最多喜欢</el-radio-button>
            <el-radio-button label="dislikes">最多不喜欢</el-radio-button>
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
              @change="handleTagsChange"
          >
            <el-option
                v-for="tag in availableTags"
                :key="tag"
                :label="tag"
                :value="tag"
            />
          </el-select>
          <div class="filter-tip" v-if="selectedTags.length > 0">
            已选择 {{ selectedTags.length }} 个标签
            <el-button link type="primary" @click="clearTags">清空</el-button>
          </div>
        </div>

      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import {useStickerStore} from '@/store/stickerStore';
import type {DisplayMode, SortType} from '@/types/sticker';
import {Grid, List, PictureFilled} from '@element-plus/icons-vue';

const stickerStore = useStickerStore();

const displayMode = ref<DisplayMode>(stickerStore.displayMode);
const sortType = ref<SortType>(stickerStore.sort);
const selectedTags = ref<string[]>(stickerStore.selectedTags);
const availableTags = ref<string[]>(stickerStore.availableTags);

// 监听展示模式变化
watch(displayMode, (newVal) => {
  stickerStore.setDisplayMode(newVal);
});

// 监听排序方式变化
watch(sortType, (newVal) => {
  if (newVal !== stickerStore.sort) {
    stickerStore.setSort(newVal);
  }
});

// 监听标签选择变化
watch(selectedTags, (newVal) => {
  stickerStore.setSelectedTags(newVal);
  stickerStore.fetchStickers(true);
});

// 添加清空标签方法
const clearTags = () => {
  selectedTags.value = [];
};

// 添加标签变化处理方法，增加用户体验
const handleTagsChange = (tags: string[]) => {
  // 可以添加额外的用户反馈，例如显示加载指示器等
  console.log('Tags changed to:', tags);
};

// 重置筛选条件
const resetFilters = () => {
  displayMode.value = 'grid';
  sortType.value = 'created_at';
  selectedTags.value = [];
  stickerStore.resetFilters();
};

// 组件挂载时获取所有标签
onMounted(async () => {
  if (stickerStore.availableTags.length === 0) {
    await stickerStore.fetchAllTags();
    availableTags.value = stickerStore.availableTags;
  }
});
</script>

<style lang="scss" scoped>
.sticker-filter {
  margin-bottom: 20px;

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
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .filter-title {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        margin-bottom: 8px;
      }
    }
  }
}

.filter-tip {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 768px) {
  .sticker-filter {
    .filter-content {
      .filter-item {
        :deep(.el-radio-group) {
          display: flex;
          flex-wrap: wrap;

          .el-radio-button {
            margin-bottom: 8px;
          }
        }
      }
    }
  }
}
</style>