<template>
  <div class="sticker-waterfall">
    <div v-if="loading && stickers.length === 0" class="loading-container">
      <el-skeleton :rows="3" animated/>
      <el-skeleton :rows="3" animated/>
      <el-skeleton :rows="3" animated/>
    </div>

    <template v-else-if="stickers.length > 0">
      <masonry-wall
          :items="stickers"
          :ssr-columns="1"
          :column-width="columnWidth"
          :gap="gap"
      >
        <template #default="{ item, index }">
          <div
              class="waterfall-item"
              :class="{ 'is-selected': isSelected(item.id) }"
              @click="handleItemClick(item)"
          >
            <el-checkbox
                v-if="selectable"
                v-model="selectedItems[index]"
                class="sticker-select-checkbox"
                @click.stop="toggleSelection(item.id)"
            />

            <el-image
                class="sticker-image"
                :src="item.url"
                fit="contain"
                :preview-src-list="selectable ? null : [item.url]"
                preview-teleported
                :initial-index="0"
                loading="lazy"
            >
              <template #error>
                <div class="image-error">
                  <el-icon>
                    <PictureRounded/>
                  </el-icon>
                  <span>加载失败</span>
                </div>
              </template>
            </el-image>

            <div class="sticker-info">
              <div class="sticker-content">{{ item.description || '无描述' }}</div>

              <div class="sticker-actions">
                <el-button-group size="small">
                  <el-button
                      type="primary"
                      @click.stop="handleLike(item.id)"
                      :class="{ 'is-active': stickerStore.hasUserLiked(item.id) }"
                  >
                    <heart-icon class="icon" :filled="stickerStore.hasUserLiked(item.id)"/>
                    {{ item.likes }}
                  </el-button>

                  <el-button
                      type="danger"
                      @click.stop="handleDislike(item.id)"
                      :class="{ 'is-active': stickerStore.hasUserDisliked(item.id) }"
                  >
                    <thumbs-down-icon class="icon" :filled="stickerStore.hasUserDisliked(item.id)"/>
                    {{ item.dislikes }}
                  </el-button>
                </el-button-group>

                <el-button
                    type="success"
                    size="small"
                    :icon="Download"
                    @click.stop="handleDownload(item)"
                >
                  下载
                </el-button>
              </div>

              <div class="sticker-tags" v-if="item.tags && item.tags.length">
                <el-tag
                    v-for="tag in item.tags.slice(0, 2)"
                    :key="tag"
                    size="small"
                    @click.stop="handleTagClick(tag)"
                >
                  {{ tag }}
                </el-tag>
                <el-tag v-if="item.tags.length > 2" size="small" type="info">+{{ item.tags.length - 2 }}</el-tag>
              </div>
            </div>
          </div>
        </template>
      </masonry-wall>

      <div v-if="hasMore" class="load-more-container">
        <el-button :loading="loading" @click="loadMore">加载更多</el-button>
      </div>
    </template>

    <el-empty v-else description="暂无表情包"/>
  </div>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref, watch} from 'vue';
import {useRouter} from 'vue-router';
import {useStickerStore} from '@/store/stickerStore';
import {downloadSingleSticker} from '@/utils/download';
import {useThemeStore} from '@/store/themeStore';
import type {Sticker} from '@/types/sticker';
import {Download, PictureRounded} from '@element-plus/icons-vue';
import {ElMessage} from 'element-plus';
import {useInfiniteScroll} from '@/hooks/useInfiniteScroll';
import MasonryWall from '@yeger/vue-masonry-wall'
import HeartIcon from "@/components/icons/HeartIcon.vue";
import ThumbsDownIcon from "@/components/icons/ThumbsDownIcon.vue";

const props = defineProps<{
  stickers: Sticker[];
  loading: boolean;
  hasMore: boolean;
  selectable?: boolean;
}>();

const emit = defineEmits<{
  (e: 'load-more'): void;
}>();

const router = useRouter();
const stickerStore = useStickerStore();
const themeStore = useThemeStore();

// 瀑布流配置参数
const columnWidth = ref(300);
const gap = ref(20);
const selectedItems = ref<boolean[]>([]);

// 根据屏幕宽度调整瀑布流参数
const updateWaterfallDimensions = () => {
  const windowWidth = window.innerWidth;

  if (windowWidth <= 576) {
    columnWidth.value = 150;
    gap.value = 10;
  } else if (windowWidth <= 768) {
    columnWidth.value = 200;
    gap.value = 15;
  } else {
    columnWidth.value = 300;
    gap.value = 20;
  }
};

// 监听窗口大小变化
onMounted(() => {
  updateWaterfallDimensions();
  window.addEventListener('resize', updateWaterfallDimensions);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWaterfallDimensions);
});

// 使用无限滚动钩子
useInfiniteScroll(() => {
  if (props.hasMore && !props.loading) {
    emit('load-more');
  }
});

// 监听表情包变化，重置选择数组
watch(() => props.stickers, () => {
  selectedItems.value = Array(props.stickers.length).fill(false);
}, {deep: true});

// 添加对store中selectedStickers变化的监听
watch(() => stickerStore.selectedStickers, (newSelectedIds) => {
  // 如果选中的数组为空，重置所有本地选中状态
  if (newSelectedIds.length === 0) {
    selectedItems.value = Array(props.stickers.length).fill(false);
  } else {
    // 更新本地选中状态以匹配store中的状态
    selectedItems.value = props.stickers.map(sticker =>
        stickerStore.selectedStickers.includes(sticker.id)
    );
  }
}, {deep: true});

// 检查是否被选中
const isSelected = (id: string) => {
  return stickerStore.selectedStickers.includes(id);
};

// 切换选择状态
const toggleSelection = (id: string) => {
  stickerStore.toggleSelectedSticker(id);
};

const handleItemClick = (sticker: Sticker) => {
  if (props.selectable) {
    toggleSelection(sticker.id);
  } else {
    navigateToDetail(sticker.id);
  }
};

const navigateToDetail = (id: string) => {
  router.push({name: 'StickerDetail', params: {id}});
};

const handleLike = async (id: string) => {
  try {
    await stickerStore.like(id);
  } catch (error) {
    ElMessage.error('点赞失败');
  }
};

const handleDislike = async (id: string) => {
  try {
    await stickerStore.dislike(id);
  } catch (error) {
    ElMessage.error('踩一下失败');
  }
};

const handleDownload = async (sticker: Sticker) => {
  try {
    await downloadSingleSticker(sticker);
    ElMessage.success('下载成功');
  } catch (error) {
    ElMessage.error('下载失败');
  }
};

const handleTagClick = (tag: string) => {
  stickerStore.setSelectedTags([tag]);
  stickerStore.fetchStickers(true);
};

const loadMore = () => {
  emit('load-more');
};
</script>

<style lang="scss" scoped>
.sticker-waterfall {
  .loading-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 20px;
  }

  .waterfall-item {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--el-bg-color);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    transition: transform 0.3s, box-shadow 0.3s;
    margin-bottom: 20px; /* 确保每个项目有适当的底部间距 */

    &.is-selected {
      border: 2px solid var(--el-color-primary);
    }

    .sticker-select-checkbox {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 2;
    }

    .sticker-image {
      width: 100%;
      display: block;
    }

    .image-error {
      width: 100%;
      height: 100%;
      min-height: 150px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: var(--el-text-color-secondary);
      background-color: var(--el-fill-color-light);
    }

    .sticker-info {
      padding: 12px;

      .sticker-content {
        font-size: 14px;
        line-height: 1.4;
        margin-bottom: 10px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .sticker-actions {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
      }

      .sticker-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }
    }

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }
  }

  .load-more-container {
    margin: 30px auto;
    text-align: center;
  }
}

/* 添加图标样式 */
.icon {
  vertical-align: middle;
  margin-right: 4px;
  width: 16px;
  height: 16px;
}

/* 添加激活状态样式 */
.is-active {
  font-weight: bold;

  //&.el-button--primary, &.el-button--danger {
  //  color: #FF4D4F;
  //  border-color: #FF4D4F;
  //}
}

</style>