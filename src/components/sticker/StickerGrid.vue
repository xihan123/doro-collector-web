<template>
  <div class="sticker-grid">
    <div v-if="loading && stickers.length === 0" class="loading-container">
      <el-skeleton v-for="i in 3" :key="i" :rows="3" animated />
    </div>

    <template v-else-if="stickers.length > 0">
      <div class="grid-container">
        <div
          v-for="sticker in stickers"
          :key="sticker.id"
          class="grid-item"
        >
          <sticker-card
            :sticker="sticker"
            :is-selectable="selectable"
          />
        </div>
      </div>

      <div v-if="showPagination" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 36, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="(val: number) => emit('update:size', val)"
          @current-change="(val: number) => emit('update:page', val)"
        />
      </div>

      <div v-else-if="hasMore" class="load-more-container">
        <el-button :loading="loading" @click="emit('load-more')">加载更多</el-button>
      </div>
    </template>

    <el-empty v-else description="暂无表情包" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStickerStore } from '@/store/stickerStore'
import StickerCard from './StickerCard.vue'
import type { Sticker } from '@/types/sticker'

const props = defineProps<{
  stickers: Sticker[]
  total: number
  loading: boolean
  hasMore: boolean
  selectable?: boolean
  showPagination?: boolean
}>()

const emit = defineEmits<{
  'update:page': [page: number]
  'update:size': [size: number]
  'load-more': []
}>()

const stickerStore = useStickerStore()

const currentPage = computed({
  get: () => stickerStore.page,
  set: (val) => emit('update:page', val),
})

const pageSize = computed({
  get: () => stickerStore.size,
  set: (val) => emit('update:size', val),
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;

.sticker-grid {
  .loading-container {
    display: grid;
    gap: var(--app-spacing-lg);
    margin-bottom: var(--app-spacing-lg);
  }

  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--app-spacing-lg);
    margin-bottom: var(--app-spacing-lg);
  }

  .pagination-container,
  .load-more-container {
    margin-top: 30px;
    display: flex;
    justify-content: center;
  }
}

@include respond-to(tablet) {
  .sticker-grid {
    .grid-container {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 10px;
    }
  }
}
</style>
