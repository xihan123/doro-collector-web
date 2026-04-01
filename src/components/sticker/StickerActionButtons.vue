<template>
  <div class="sticker-actions">
    <div class="action-buttons">
      <el-button
        type="primary"
        link
        @click.stop="$emit('like')"
        :class="{ 'is-active': isLiked }"
        :aria-label="isLiked ? '取消点赞' : '点赞'"
      >
        <heart-icon class="icon" :filled="isLiked"/>
        {{ likes }}
      </el-button>

      <el-button
        type="danger"
        link
        @click.stop="$emit('dislike')"
        :class="{ 'is-active': isDisliked }"
        :aria-label="isDisliked ? '取消点踩' : '点踩'"
      >
        <thumbs-down-icon class="icon" :filled="isDisliked"/>
        {{ dislikes }}
      </el-button>
    </div>

    <div class="action-buttons">
      <el-button
        type="success"
        link
        :icon="Download"
        @click.stop="$emit('download')"
        aria-label="下载"
      >
        下载
      </el-button>

      <el-button
        v-if="showDetail"
        type="info"
        link
        :icon="More"
        @click.stop="$emit('detail')"
        aria-label="查看详情"
      >
        详情
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Download, More } from '@element-plus/icons-vue'
import HeartIcon from '@/components/icons/HeartIcon.vue'
import ThumbsDownIcon from '@/components/icons/ThumbsDownIcon.vue'

defineProps<{
  likes: number
  dislikes: number
  isLiked: boolean
  isDisliked: boolean
  showDetail?: boolean
}>()

defineEmits<{
  like: []
  dislike: []
  download: []
  detail: []
}>()
</script>

<style lang="scss" scoped>
.sticker-actions {
  display: flex;
  justify-content: space-between;

  .action-buttons {
    display: flex;
    gap: 10px;
  }
}

.icon {
  vertical-align: middle;
  margin-right: 4px;
  width: 16px;
  height: 16px;
}

.action-buttons {
  .el-button {
    &.is-active {
      font-weight: bold;

      &.el-button--primary,
      &.el-button--danger {
        color: var(--app-color-accent);
      }
    }
  }
}
</style>
