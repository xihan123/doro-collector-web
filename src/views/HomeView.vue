<template>
  <div class="home-view">
    <sticker-filter/>

    <div class="actions-container">
      <div class="selected-info" v-if="hasSelectedStickers">
        已选择 {{ selectedCount }} 个表情包
        <el-button type="primary" size="small" @click="downloadSelected" :loading="downloading">
          <el-icon>
            <Download/>
          </el-icon>
          批量下载
        </el-button>
        <el-button type="info" size="small" @click="clearSelected">
          <el-icon>
            <Close/>
          </el-icon>
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

    <template v-if="displayMode === 'grid'">
      <sticker-grid
          :stickers="stickers"
          :total="total"
          :loading="loading"
          :has-more="hasMore"
          :selectable="selectionMode"
          :show-pagination="true"
          @update:page="handlePageChange"
          @update:size="handleSizeChange"
      />
    </template>

    <template v-else-if="displayMode === 'list'">
      <sticker-list
          :stickers="stickers"
          :total="total"
          :loading="loading"
          :selectable="selectionMode"
          @update:page="handlePageChange"
          @update:size="handleSizeChange"
          @selection-change="handleSelectionChange"
      />
    </template>

    <template v-else-if="displayMode === 'waterfall'">
      <sticker-waterfall
          :stickers="stickers"
          :loading="loading"
          :has-more="hasMore"
          :selectable="selectionMode"
          @load-more="loadMore"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';
import StickerGrid from '@/components/sticker/StickerGrid.vue';
import StickerList from '@/components/sticker/StickerList.vue';
import StickerWaterfall from '@/components/sticker/StickerWaterfall.vue';
import StickerFilter from '@/components/sticker/StickerFilter.vue';
import {useStickerStore} from '@/store/stickerStore';
import {downloadSelectedStickers} from '@/utils/download';
import {Close, Download} from '@element-plus/icons-vue';
import {ElMessage} from 'element-plus';
import type {Sticker} from '@/types/sticker';

const stickerStore = useStickerStore();
const downloading = ref(false);
const selectionMode = ref(false);

// 从 store 获取数据
const stickers = computed(() => stickerStore.stickers);
const total = computed(() => stickerStore.total);
const loading = computed(() => stickerStore.loading);
const hasMore = computed(() => stickerStore.hasMore);
const displayMode = computed(() => stickerStore.displayMode);
const selectedCount = computed(() => stickerStore.selectedStickers.length);
const hasSelectedStickers = computed(() => selectedCount.value > 0);

// 初始化加载数据
onMounted(async () => {
  if (stickers.value.length === 0) {
    await stickerStore.fetchStickers(true);
  }
});

// 分页操作
const handlePageChange = (page: number) => {
  stickerStore.page = page;
  stickerStore.fetchStickers(false);
};

const handleSizeChange = (size: number) => {
  stickerStore.size = size;
  stickerStore.fetchStickers(true);
};

// 加载更多（用于瀑布流）
const loadMore = () => {
  stickerStore.loadMore();
};

// 处理表格选择变化（用于列表模式）
const handleSelectionChange = (selection: Sticker[]) => {
  stickerStore.clearSelectedStickers();
  selection.forEach(sticker => {
    stickerStore.toggleSelectedSticker(sticker.id);
  });
};

// 批量下载优化，使用已缓存图片
const downloadSelected = async () => {
  if (selectedCount.value === 0) {
    ElMessage.warning('请先选择要下载的表情包');
    return;
  }

  downloading.value = true;
  try {
    // 获取选中的表情包数据
    const selectedStickers = stickers.value.filter(sticker =>
        stickerStore.selectedStickers.includes(sticker.id)
    );

    await downloadSelectedStickers(selectedStickers);
  } catch (error) {
    console.error('Download failed:', error);
    ElMessage.error('下载失败，请重试');
  } finally {
    downloading.value = false;
  }
};

// 清除选中状态
const clearSelected = () => {

  stickerStore.clearSelectedStickers();
};

// 退出选择模式时清空选择
watch(selectionMode, (newVal) => {
  if (!newVal) {
    clearSelected();
  }
});
</script>

<style lang="scss" scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  .actions-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .selected-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }
}

@media (max-width: 768px) {
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