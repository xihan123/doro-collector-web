<template>
  <div class="upload-view">
    <el-page-header @back="goBack">
      <template #content>
        <span class="page-title">上传表情包</span>
      </template>
    </el-page-header>

    <div class="upload-container">
      <sticker-upload />
    </div>

    <el-alert
      show-icon
      title="请不要上传违规、低俗或侵权内容，共同维护良好的社区环境"
      type="warning"
      :closable="false"
      style="margin: 20px 0"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import StickerUpload from '@/components/sticker/StickerUpload.vue'

const router = useRouter()
const goBack = () => router.back()
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;

.upload-view {
  max-width: var(--app-width-content);
  margin: 0 auto;
  padding: var(--app-spacing-lg);

  .page-title {
    font-size: 18px;
    font-weight: 500;
  }

  .upload-container {
    margin-top: var(--app-spacing-lg);
  }
}

@include respond-to(tablet) {
  .upload-view {
    padding: 10px;
  }
}
</style>
