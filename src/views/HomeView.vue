<template>
  <div class="home-view">
    <sticker-filter />

    <div class="actions-container">
      <div class="selected-info" v-if="interactionStore.selectedStickers.length > 0">
        已选择 {{ interactionStore.selectedStickers.length }} 个表情包
        <el-button type="primary" size="small" @click="downloadSelected" :loading="downloading">
          <el-icon><Download /></el-icon>
          批量下载
        </el-button>
        <el-button type="danger" size="small" @click="batchDelete" :loading="deleting">
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
        <el-button type="info" size="small" @click="interactionStore.clearSelectedStickers()">
          <el-icon><Close /></el-icon>
          清除选择
        </el-button>
      </div>

      <div class="toggle-selection">
        <el-switch
          v-model="selectionMode"
          active-text="选择模式"
          inactive-text="浏览模式"
        />
      </div>
    </div>

    <template v-if="filterStore.displayMode === 'grid'">
      <sticker-grid
        :stickers="stickerStore.stickers"
        :total="stickerStore.total"
        :loading="stickerStore.loading"
        :has-more="stickerStore.hasMore"
        :selectable="selectionMode"
        :show-pagination="true"
        @update:page="handlePageChange"
        @update:size="handleSizeChange"
      />
    </template>

    <template v-else-if="filterStore.displayMode === 'list'">
      <sticker-list
        :stickers="stickerStore.stickers"
        :total="stickerStore.total"
        :loading="stickerStore.loading"
        :selectable="selectionMode"
        @update:page="handlePageChange"
        @update:size="handleSizeChange"
        @selection-change="handleSelectionChange"
      />
    </template>

    <template v-else-if="filterStore.displayMode === 'waterfall'">
      <sticker-waterfall
        :stickers="stickerStore.stickers"
        :loading="stickerStore.loading"
        :has-more="stickerStore.hasMore"
        :selectable="selectionMode"
        @load-more="loadMoreStickers"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import StickerGrid from '@/components/sticker/StickerGrid.vue'
import StickerList from '@/components/sticker/StickerList.vue'
import StickerWaterfall from '@/components/sticker/StickerWaterfall.vue'
import StickerFilter from '@/components/sticker/StickerFilter.vue'
import { useStickerStore } from '@/store/stickerStore'
import { useStickerFilterStore } from '@/store/stickerFilterStore'
import { useStickerInteractionStore } from '@/store/stickerInteractionStore'
import { downloadSelectedStickers } from '@/utils/download'
import { batchDeleteStickers } from '@/api/sticker'
import { Close, Delete, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Sticker } from '@/types/sticker'

const stickerStore = useStickerStore()
const filterStore = useStickerFilterStore()
const interactionStore = useStickerInteractionStore()

const downloading = ref(false)
const deleting = ref(false)
const selectionMode = ref(false)

onMounted(() => fetchData(true))

watch(
  () => [filterStore.sort, filterStore.selectedTags, filterStore.search],
  () => fetchData(true),
)

const fetchData = async (resetPage: boolean) => {
  const params = {
    ...filterStore.queryParams,
    page: resetPage ? 1 : stickerStore.page,
    size: stickerStore.size,
  }
  await stickerStore.fetchStickers(params, resetPage)
}

const handlePageChange = async (page: number) => {
  stickerStore.page = page
  await fetchData(false)
}

const handleSizeChange = async (size: number) => {
  stickerStore.size = size
  await fetchData(true)
}

const loadMoreStickers = async () => {
  const params = {
    ...filterStore.queryParams,
    page: stickerStore.page,
    size: stickerStore.size,
  }
  await stickerStore.loadMore(params)
}

const handleSelectionChange = (selection: Sticker[]) => {
  interactionStore.clearSelectedStickers()
  selection.forEach(s => interactionStore.toggleSelectedSticker(s.id))
}

const downloadSelected = async () => {
  if (interactionStore.selectedStickers.length === 0) {
    ElMessage.warning('请先选择要下载的表情包')
    return
  }

  downloading.value = true
  try {
    const selected = stickerStore.stickers.filter(s =>
      interactionStore.selectedStickers.includes(s.id),
    )
    await downloadSelectedStickers(selected)
  } catch {
    ElMessage.error('下载失败，请重试')
  } finally {
    downloading.value = false
  }
}

const batchDelete = async () => {
  if (interactionStore.selectedStickers.length === 0) {
    ElMessage.warning('请先选择要删除的表情包')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${interactionStore.selectedStickers.length} 个表情包吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    const { value: secretKey } = await ElMessageBox.prompt(
      '请输入安全密钥以确认删除操作',
      '安全验证',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        inputType: 'password',
        inputPlaceholder: '请输入安全密钥',
        inputValidator: (value) => !value ? '安全密钥不能为空' : true,
      },
    )

    deleting.value = true
    const response = await batchDeleteStickers(interactionStore.selectedStickers, secretKey)

    if (response.success) {
      ElMessage.success(response.message || '批量删除成功')
      interactionStore.clearSelectedStickers()
      await fetchData(true)
    } else {
      ElMessage.error(response.message || '批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败，请重试')
    }
  } finally {
    deleting.value = false
  }
}

watch(selectionMode, (val) => {
  if (!val) interactionStore.clearSelectedStickers()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;

.home-view {
  @include content-container;

  .actions-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--app-spacing-lg);

    .selected-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }
}

@include respond-to(tablet) {
  .home-view {
    padding: 10px;

    .actions-container {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }
}
</style>
