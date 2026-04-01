<template>
  <div class="sticker-waterfall">
    <div v-if="loading && stickers.length === 0" class="loading-container">
      <el-skeleton v-for="i in 3" :key="i" :rows="3" animated />
    </div>

    <template v-else-if="stickers.length > 0">
      <masonry-wall
        :items="stickers"
        :ssr-columns="1"
        :column-width="columnWidth"
        :gap="gap"
      >
        <template #default="{ item }">
          <div
            class="waterfall-item"
            :class="{ 'is-selected': interactionStore.selectedStickers.includes(item.id) }"
            @click="handleItemClick(item)"
          >
            <el-checkbox
              v-if="selectable"
              :model-value="interactionStore.selectedStickers.includes(item.id)"
              class="sticker-select-checkbox"
              @click.stop="interactionStore.toggleSelectedSticker(item.id)"
            />

            <el-image
              class="sticker-image"
              :src="item.url"
              fit="contain"
              :preview-src-list="selectable ? undefined : [item.url]"
              preview-teleported
              :initial-index="0"
              loading="lazy"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><PictureRounded /></el-icon>
                  <span>加载失败</span>
                </div>
              </template>
            </el-image>

            <div class="sticker-info">
              <div class="sticker-content">{{ item.description || '无描述' }}</div>

              <div class="waterfall-actions">
                <el-button-group size="small">
                  <el-button
                    type="primary"
                    @click.stop="handleLike(item.id)"
                    :class="{ 'is-active': interactionStore.hasUserLiked(item.id) }"
                  >
                    <heart-icon class="icon" :filled="interactionStore.hasUserLiked(item.id)" />
                    {{ item.likes }}
                  </el-button>
                  <el-button
                    type="danger"
                    @click.stop="handleDislike(item.id)"
                    :class="{ 'is-active': interactionStore.hasUserDisliked(item.id) }"
                  >
                    <thumbs-down-icon class="icon" :filled="interactionStore.hasUserDisliked(item.id)" />
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

              <div class="sticker-tags" v-if="item.tags?.length">
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
        <el-button :loading="loading" @click="emit('load-more')">加载更多</el-button>
      </div>
    </template>

    <el-empty v-else description="暂无表情包" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useStickerInteractionStore } from '@/store/stickerInteractionStore'
import { useStickerActions } from '@/composables/useStickerActions'
import { useResponsive } from '@/composables/useResponsive'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { Download, PictureRounded } from '@element-plus/icons-vue'
import {MasonryWall} from '@yeger/vue-masonry-wall'
import HeartIcon from '@/components/icons/HeartIcon.vue'
import ThumbsDownIcon from '@/components/icons/ThumbsDownIcon.vue'
import type { Sticker } from '@/types/sticker'

const props = defineProps<{
  stickers: Sticker[]
  loading: boolean
  hasMore: boolean
  selectable?: boolean
}>()

const emit = defineEmits<{
  'load-more': []
}>()

const interactionStore = useStickerInteractionStore()
const { handleLike, handleDislike, handleDownload, handleTagClick, navigateToDetail } = useStickerActions()
const { isMobile, isTablet } = useResponsive()

const columnWidth = ref(300)
const gap = ref(20)

// 根据断点更新瀑布流参数
const updateDimensions = () => {
  if (isMobile.value) {
    columnWidth.value = 150
    gap.value = 10
  } else if (isTablet.value) {
    columnWidth.value = 200
    gap.value = 15
  } else {
    columnWidth.value = 300
    gap.value = 20
  }
}

watch([isMobile, isTablet], updateDimensions)
onMounted(updateDimensions)

useInfiniteScroll(async () => {
  if (props.hasMore && !props.loading) {
    emit('load-more')
  }
})

const handleItemClick = (sticker: Sticker) => {
  if (props.selectable) {
    interactionStore.toggleSelectedSticker(sticker.id)
  } else {
    navigateToDetail(sticker.id)
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;

.sticker-waterfall {
  .loading-container {
    display: flex;
    flex-direction: column;
    gap: var(--app-spacing-lg);
    margin-bottom: var(--app-spacing-lg);
  }

  .waterfall-item {
    position: relative;
    border-radius: var(--app-radius-md);
    overflow: hidden;
    background-color: var(--el-bg-color);
    box-shadow: var(--app-shadow-sm);
    transition: all var(--app-transition-normal);
    margin-bottom: var(--app-spacing-lg);

    &.is-selected {
      border: 2px solid var(--el-color-primary);
    }

    .sticker-select-checkbox {
      position: absolute;
      top: var(--app-spacing-sm);
      right: var(--app-spacing-sm);
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

      .waterfall-actions {
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

    @include card-hover;
  }

  .load-more-container {
    margin: 30px auto;
    text-align: center;
  }
}

.icon {
  vertical-align: middle;
  margin-right: 4px;
  width: 16px;
  height: 16px;
}

.is-active {
  font-weight: bold;
  color: var(--app-color-accent);
}
</style>
