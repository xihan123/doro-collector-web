<template>
  <div class="sticker-list">
    <div v-if="loading && stickers.length === 0" class="loading-container">
      <el-skeleton v-for="i in 3" :key="i" :rows="1" animated />
    </div>

    <template v-else-if="stickers.length > 0">
      <div class="list-container">
        <el-table
          ref="tableRef"
          :data="stickers"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            v-if="selectable"
            type="selection"
            width="55"
          />

          <el-table-column label="预览" width="100">
            <template #default="{ row }">
              <el-image
                :src="row.url"
                fit="contain"
                :preview-src-list="selectable ? undefined : [row.url]"
                preview-teleported
                style="width: 80px; height: 80px"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><PictureRounded /></el-icon>
                  </div>
                </template>
              </el-image>
            </template>
          </el-table-column>

          <el-table-column prop="description" label="描述">
            <template #default="{ row }">
              <div class="content-container">
                <el-text class="sticker-description">{{ row.description || '无描述' }}</el-text>
                <div class="sticker-tags">
                  <el-tag
                    v-for="tag in row.tags.slice(0, 3)"
                    :key="tag"
                    size="small"
                    @click.stop="handleTagClick(tag)"
                  >
                    {{ tag }}
                  </el-tag>
                  <el-tag v-if="row.tags.length > 3" size="small" type="info">
                    +{{ row.tags.length - 3 }}
                  </el-tag>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="尺寸" width="100" class-name="hide-on-mobile">
            <template #default="{ row }">
              {{ row.width }}x{{ row.height }}
            </template>
          </el-table-column>

          <el-table-column label="点赞/踩" width="100">
            <template #default="{ row }">
              <el-space>
                <el-text
                  type="primary"
                  :class="{ 'is-active': interactionStore.hasUserLiked(row.id) }"
                >
                  <heart-icon class="icon" :filled="interactionStore.hasUserLiked(row.id)" />
                  {{ row.likes }}
                </el-text>
                <el-text
                  type="danger"
                  :class="{ 'is-active': interactionStore.hasUserDisliked(row.id) }"
                >
                  <thumbs-down-icon class="icon" :filled="interactionStore.hasUserDisliked(row.id)" />
                  {{ row.dislikes }}
                </el-text>
              </el-space>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-space>
                <el-tooltip content="查看详情">
                  <el-button
                    type="primary"
                    :icon="More"
                    circle
                    @click="navigateToDetail(row.id)"
                  />
                </el-tooltip>
                <el-tooltip content="下载">
                  <el-button
                    type="success"
                    :icon="Download"
                    circle
                    @click="handleDownload(row)"
                  />
                </el-tooltip>
                <el-dropdown trigger="click">
                  <el-button circle>
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        @click="handleLike(row.id)"
                        :class="{ 'is-active': interactionStore.hasUserLiked(row.id) }"
                      >
                        <heart-icon class="icon" :filled="interactionStore.hasUserLiked(row.id)" />
                        点赞
                      </el-dropdown-item>
                      <el-dropdown-item
                        @click="handleDislike(row.id)"
                        :class="{ 'is-active': interactionStore.hasUserDisliked(row.id) }"
                      >
                        <thumbs-down-icon class="icon" :filled="interactionStore.hasUserDisliked(row.id)" />
                        踩一下
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="(val: number) => emit('update:size', val)"
          @current-change="(val: number) => emit('update:page', val)"
        />
      </div>
    </template>

    <el-empty v-else description="暂无表情包" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStickerStore } from '@/store/stickerStore'
import { useStickerInteractionStore } from '@/store/stickerInteractionStore'
import { useStickerActions } from '@/composables/useStickerActions'
import { Download, More, MoreFilled, PictureRounded } from '@element-plus/icons-vue'
import HeartIcon from '@/components/icons/HeartIcon.vue'
import ThumbsDownIcon from '@/components/icons/ThumbsDownIcon.vue'
import type { Sticker } from '@/types/sticker'

const props = defineProps<{
  stickers: Sticker[]
  total: number
  loading: boolean
  selectable?: boolean
}>()

const emit = defineEmits<{
  'update:page': [page: number]
  'update:size': [size: number]
  'selection-change': [selection: Sticker[]]
}>()

const tableRef = ref()
const stickerStore = useStickerStore()
const interactionStore = useStickerInteractionStore()
const { handleLike, handleDislike, handleDownload, handleTagClick, navigateToDetail } = useStickerActions()

const currentPage = computed({
  get: () => stickerStore.page,
  set: (val) => emit('update:page', val),
})

const pageSize = computed({
  get: () => stickerStore.size,
  set: (val) => emit('update:size', val),
})

const handleSelectionChange = (selection: Sticker[]) => {
  emit('selection-change', selection)
  interactionStore.clearSelectedStickers()
  selection.forEach(sticker => {
    interactionStore.toggleSelectedSticker(sticker.id)
  })
}

watch(() => interactionStore.selectedStickers, (newSelectedIds) => {
  if (newSelectedIds.length === 0 && tableRef.value) {
    tableRef.value.clearSelection()
  }
}, { deep: true })
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;

.sticker-list {
  .loading-container {
    display: flex;
    flex-direction: column;
    gap: var(--app-spacing-lg);
    margin-bottom: var(--app-spacing-lg);
  }

  .list-container {
    margin-bottom: var(--app-spacing-lg);

    .content-container {
      .sticker-description {
        display: block;
        margin-bottom: var(--app-spacing-sm);
      }

      .sticker-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }
    }

    .image-error {
      width: 80px;
      height: 80px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--el-text-color-secondary);
      background-color: var(--el-fill-color-light);
    }
  }

  .pagination-container {
    margin-top: var(--app-spacing-lg);
    display: flex;
    justify-content: center;
  }
}

.icon {
  vertical-align: middle;
  width: 16px;
  height: 16px;
}

.is-active {
  font-weight: bold;
  color: var(--app-color-accent) !important;
}

@include respond-to(tablet) {
  .sticker-list .list-container {
    overflow-x: auto;
  }
}
</style>
