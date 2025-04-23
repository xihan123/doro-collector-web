<template>
  <div class="sticker-list">
    <div v-if="loading && stickers.length === 0" class="loading-container">
      <el-skeleton :rows="1" animated/>
      <el-skeleton :rows="1" animated/>
      <el-skeleton :rows="1" animated/>
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
                  :preview-src-list="selectable ? null : [row.url]"
                  preview-teleported
                  style="width: 80px; height: 80px"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon>
                      <PictureRounded/>
                    </el-icon>
                  </div>
                </template>
              </el-image>
            </template>
          </el-table-column>

          <el-table-column prop="content" label="描述">
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

          <!--          <el-table-column prop="file_name" label="文件名" min-width="120" />-->

          <el-table-column label="尺寸" width="100">
            <template #default="{ row }">
              {{ row.width }}x{{ row.height }}
            </template>
          </el-table-column>

          <el-table-column label="点赞/踩" width="100">
            <template #default="{ row }">
              <el-space>
                <el-text type="primary" :class="{ 'text-bold': stickerStore.hasUserLiked(row.id) }">
                  <heart-icon class="icon" :filled="stickerStore.hasUserLiked(row.id)"/>
                  {{ row.likes }}
                </el-text>
                <el-text type="danger" :class="{ 'text-bold': stickerStore.hasUserDisliked(row.id) }">
                  <thumbs-down-icon class="icon" :filled="stickerStore.hasUserDisliked(row.id)"/>
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
                    <el-icon>
                      <MoreFilled/>
                    </el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="handleLike(row.id)"
                                        :class="{ 'is-active': stickerStore.hasUserLiked(row.id) }">
                        <heart-icon class="icon" :filled="stickerStore.hasUserLiked(row.id)"/>
                        点赞
                      </el-dropdown-item>
                      <el-dropdown-item @click="handleDislike(row.id)"
                                        :class="{ 'is-active': stickerStore.hasUserDisliked(row.id) }">
                        <thumbs-down-icon class="icon" :filled="stickerStore.hasUserDisliked(row.id)"/>
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
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </template>

    <el-empty v-else description="暂无表情包"/>
  </div>
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import {useRouter} from 'vue-router';
import {useStickerStore} from '@/store/stickerStore';
import {downloadSingleSticker} from '@/utils/download';
import type {Sticker} from '@/types/sticker';
import {Download, More, MoreFilled, PictureRounded} from '@element-plus/icons-vue';
import {ElMessage} from 'element-plus';
import HeartIcon from "@/components/icons/HeartIcon.vue";
import ThumbsDownIcon from "@/components/icons/ThumbsDownIcon.vue";

const props = defineProps<{
  stickers: Sticker[];
  total: number;
  loading: boolean;
  selectable?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:page', page: number): void;
  (e: 'update:size', size: number): void;
  (e: 'selection-change', selection: Sticker[]): void;
}>();

// 添加表格引用
const tableRef = ref();

const router = useRouter();
const stickerStore = useStickerStore();

const currentPage = computed({
  get: () => stickerStore.page,
  set: (val) => emit('update:page', val)
});

const pageSize = computed({
  get: () => stickerStore.size,
  set: (val) => emit('update:size', val)
});

const handleSizeChange = (val: number) => {
  emit('update:size', val);
};

const handleCurrentChange = (val: number) => {
  emit('update:page', val);
};

const handleSelectionChange = (selection: Sticker[]) => {
  emit('selection-change', selection);

  // 更新 store 中的选择状态
  stickerStore.clearSelectedStickers();
  selection.forEach(sticker => {
    stickerStore.toggleSelectedSticker(sticker.id);
  });
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

// 添加对store中selectedStickers变化的监听
watch(() => stickerStore.selectedStickers, (newSelectedIds) => {
  // 如果选中的数组为空，清除表格的选中状态
  if (newSelectedIds.length === 0 && tableRef.value) {
    tableRef.value.clearSelection();
  }
}, {deep: true});
</script>

<style lang="scss" scoped>
.sticker-list {
  .loading-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 20px;
  }

  .list-container {
    margin-bottom: 20px;

    .content-container {
      .sticker-description {
        display: block;
        margin-bottom: 8px;
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
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}

/* 添加图标样式 */
.icon {
  vertical-align: middle;
  width: 16px;
  height: 16px;
}

/* 添加激活状态样式 */
.text-bold {
  font-weight: bold;

  &.el-text--primary, &.el-text--danger {
    color: #FF4D4F !important;
  }
}

.is-active {
  font-weight: bold;
  color: #FF4D4F;
}

@media (max-width: 768px) {
  .sticker-list {
    .list-container {
      overflow-x: auto;
    }
  }
}
</style>