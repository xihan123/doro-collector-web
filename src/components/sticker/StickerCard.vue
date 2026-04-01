<template>
  <el-card
    class="sticker-card"
    :class="{ 'is-selected': isSelected }"
    shadow="hover"
    :body-style="{ padding: '0' }"
    @click="handleCardClick"
  >
    <div class="sticker-image-container">
      <el-checkbox
        v-if="isSelectable"
        v-model="isSelected"
        class="sticker-select-checkbox"
        @click.stop
      />

      <el-image
        class="sticker-image"
        :src="sticker.url"
        fit="contain"
        :preview-src-list="isSelectable ? undefined : [sticker.url]"
        preview-teleported
        :initial-index="0"
        loading="lazy"
      >
        <template #placeholder>
          <div class="image-placeholder">
            <el-icon><Picture /></el-icon>
          </div>
        </template>
        <template #error>
          <div class="image-error">
            <el-icon><PictureRounded /></el-icon>
            <span>加载失败</span>
          </div>
        </template>
      </el-image>
    </div>

    <div class="sticker-info">
      <div class="sticker-content">{{ sticker.description || '野生Doro表情包' }}</div>

      <div class="sticker-tags" v-if="sticker.tags?.length">
        <el-tag
          v-for="tag in visibleTags"
          :key="tag"
          size="small"
          @click.stop="handleTagClick(tag)"
        >
          {{ tag }}
        </el-tag>
        <el-tag v-if="hasMoreTags" size="small" type="info">+{{ sticker.tags.length - maxVisibleTags }}</el-tag>
      </div>

      <sticker-action-buttons
        :likes="sticker.likes"
        :dislikes="sticker.dislikes"
        :is-liked="isLiked"
        :is-disliked="isDisliked"
        :show-detail="true"
        @like="handleLike(sticker.id)"
        @dislike="handleDislike(sticker.id)"
        @download="handleDownload(sticker)"
        @detail="navigateToDetail(sticker.id)"
      />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStickerInteractionStore } from '@/store/stickerInteractionStore'
import { useStickerActions } from '@/composables/useStickerActions'
import { Picture, PictureRounded } from '@element-plus/icons-vue'
import StickerActionButtons from './StickerActionButtons.vue'
import type { Sticker } from '@/types/sticker'

const props = defineProps<{
  sticker: Sticker
  isSelectable?: boolean
}>()

const interactionStore = useStickerInteractionStore()
const { handleLike, handleDislike, handleDownload, handleTagClick, navigateToDetail } = useStickerActions()

const isLiked = computed(() => interactionStore.hasUserLiked(props.sticker.id))
const isDisliked = computed(() => interactionStore.hasUserDisliked(props.sticker.id))

const maxVisibleTags = 2
const visibleTags = computed(() => props.sticker.tags?.slice(0, maxVisibleTags) ?? [])
const hasMoreTags = computed(() => props.sticker.tags && props.sticker.tags.length > maxVisibleTags)

const isSelected = computed({
  get: () => interactionStore.selectedStickers.includes(props.sticker.id),
  set: (value) => {
    const current = isSelected.value
    if (value !== current) {
      interactionStore.toggleSelectedSticker(props.sticker.id)
    }
  },
})

const handleCardClick = () => {
  if (props.isSelectable) {
    isSelected.value = !isSelected.value
  } else {
    navigateToDetail(props.sticker.id)
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;

.sticker-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all var(--app-transition-normal);

  &.is-selected {
    border: 2px solid var(--el-color-primary);
  }

  .sticker-image-container {
    position: relative;
    width: 100%;
    height: 200px;

    .sticker-select-checkbox {
      position: absolute;
      top: var(--app-spacing-sm);
      right: var(--app-spacing-sm);
      z-index: 2;
    }

    .sticker-image {
      width: 100%;
      height: 100%;
      @include flex-center;
    }

    .image-placeholder,
    .image-error {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: var(--el-text-color-secondary);
      background-color: var(--el-fill-color-light);

      .el-icon {
        font-size: 32px;
        margin-bottom: 10px;
      }
    }
  }

  .sticker-info {
    padding: 12px;

    .sticker-content {
      margin-bottom: var(--app-spacing-sm);
      font-size: 14px;
      line-height: 1.4;
      max-height: 40px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .sticker-tags {
      margin-bottom: 10px;
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
  }

  @include card-hover;
}
</style>
