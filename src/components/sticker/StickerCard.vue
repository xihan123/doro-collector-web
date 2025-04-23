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
          :preview-src-list="isSelectable ? null : [sticker.url]"
          preview-teleported
          :initial-index="0"
          loading="lazy"
      >
        <template #placeholder>
          <div class="image-placeholder">
            <el-icon>
              <Picture/>
            </el-icon>
          </div>
        </template>
        <template #error>
          <div class="image-error">
            <el-icon>
              <PictureRounded/>
            </el-icon>
            <span>加载失败</span>
          </div>
        </template>
      </el-image>
    </div>

    <div class="sticker-info">
      <div class="sticker-content">{{ sticker.description || '野生Doro表情包' }}</div>

      <div class="sticker-tags" v-if="sticker.tags && sticker.tags.length">
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

      <div class="sticker-actions">
        <div class="action-buttons">

          <el-button
              type="primary"
              link
              @click.stop="handleLike"
              :class="{ 'is-active': isLiked }"
          >
            <heart-icon class="icon" :filled="isLiked"/>
            {{ sticker.likes }}
          </el-button>

          <el-button
              type="danger"
              link
              @click.stop="handleDislike"
              :class="{ 'is-active': isDisliked }"
          >
            <thumbs-down-icon class="icon" :filled="isDisliked"/>
            {{ sticker.dislikes }}
          </el-button>
        </div>

        <div class="action-buttons">
          <el-button
              type="success"
              link
              :icon="Download"
              @click.stop="handleDownload"
          >
            下载
          </el-button>

          <el-button
              type="info"
              link
              :icon="More"
              @click.stop="navigateToDetail"
          >
            详情
          </el-button>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {useRouter} from 'vue-router';
import {useStickerStore} from '@/store/stickerStore';
import {downloadSingleSticker} from '@/utils/download';
import type {Sticker} from '@/types/sticker';
import {Download, More, Picture, PictureRounded} from '@element-plus/icons-vue';
import {ElMessage} from 'element-plus';
import HeartIcon from "@/components/icons/HeartIcon.vue";
import ThumbsDownIcon from "@/components/icons/ThumbsDownIcon.vue";

const props = defineProps<{
  sticker: Sticker;
  isSelectable?: boolean;
}>();

const router = useRouter();
const stickerStore = useStickerStore();

// 添加计算属性判断用户是否已点赞/点踩
const isLiked = computed(() => stickerStore.hasUserLiked(props.sticker.id));
const isDisliked = computed(() => stickerStore.hasUserDisliked(props.sticker.id));

const maxVisibleTags = 2;

const visibleTags = computed(() => {
  return props.sticker.tags ? props.sticker.tags.slice(0, maxVisibleTags) : [];
});

const hasMoreTags = computed(() => {
  return props.sticker.tags && props.sticker.tags.length > maxVisibleTags;
});

const isSelected = computed({
  get: () => {
    return stickerStore.selectedStickers.includes(props.sticker.id);
  },
  set: (value) => {
    if (value) {
      if (!isSelected.value) {
        stickerStore.toggleSelectedSticker(props.sticker.id);
      }
    } else {
      if (isSelected.value) {
        stickerStore.toggleSelectedSticker(props.sticker.id);
      }
    }
  }
});

const handleCardClick = () => {
  if (props.isSelectable) {
    isSelected.value = !isSelected.value;
  } else {
    navigateToDetail();
  }
};

const navigateToDetail = () => {
  console.log('Navigating to sticker detail:', props.sticker.id);
  router.push({name: 'StickerDetail', params: {id: props.sticker.id}});
};

const handleLike = async () => {
  try {
    await stickerStore.like(props.sticker.id);
  } catch (error) {
    ElMessage.error('点赞失败');
  }
};

const handleDislike = async () => {
  try {
    await stickerStore.dislike(props.sticker.id);
  } catch (error) {
    ElMessage.error('踩一下失败');
  }
};

const handleDownload = async () => {
  try {
    await downloadSingleSticker(props.sticker);
    ElMessage.success('下载成功');
  } catch (error) {
    ElMessage.error('下载失败');
  }
};

const handleTagClick = (tag: string) => {
  stickerStore.setSelectedTags([tag]);
  stickerStore.fetchStickers(true);
};
</script>

<style lang="scss" scoped>
.sticker-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;

  &.is-selected {
    border: 2px solid var(--el-color-primary);
  }

  .sticker-image-container {
    position: relative;
    width: 100%;
    height: 200px;

    .sticker-select-checkbox {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 2;
    }

    .sticker-image {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .image-placeholder, .image-error {
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
      margin-bottom: 8px;
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

    .sticker-actions {
      display: flex;
      justify-content: space-between;

      .action-buttons {
        display: flex;
        gap: 10px;
      }
    }
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
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
.action-buttons {
  .el-button {
    &.is-active {
      font-weight: bold;

      /* 与图标填充颜色相匹配 */
      &.el-button--primary, &.el-button--danger {
        color: #FF4D4F;
      }
    }
  }
}
</style>