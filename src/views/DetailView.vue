<template>
  <div class="detail-view">
    <div v-if="loading" class="loading-container">
      <el-skeleton animated :rows="10"/>
    </div>

    <template v-else-if="sticker">
      <el-page-header @back="goBack">
        <template #content>
          <span class="page-title">表情包详情</span>
        </template>
      </el-page-header>

      <el-card class="detail-card" shadow="hover">
        <div class="detail-container">
          <div class="sticker-image">
            <el-image
                :src="sticker.url"
                fit="contain"
                :preview-src-list="[sticker.url]"
                preview-teleported
                :initial-index="0"
            >
              <template #error>
                <div class="image-error">
                  <el-icon>
                    <PictureRounded/>
                  </el-icon>
                  <span>图片加载失败</span>
                </div>
              </template>
            </el-image>
          </div>

          <div class="sticker-info">
            <div class="info-header">
              <!--              <h2 class="sticker-title">{{ sticker.file_name }}</h2>-->
              <div class="interaction-buttons">
                <el-button
                    type="primary"
                    size="large"
                    @click="handleLike"
                    class="animated-button"
                    :class="{ 'is-active': isLiked }"
                >
                  <heart-icon class="icon" :filled="isLiked"/>
                  {{ sticker.likes }} 喜欢
                </el-button>
                <el-button
                    type="danger"
                    size="large"
                    @click="handleDislike"
                    class="animated-button"
                    :class="{ 'is-active': isDisliked }"
                >
                  <thumbs-down-icon class="icon" :filled="isDisliked"/>
                  {{ sticker.dislikes }} 踩
                </el-button>
              </div>
            </div>

            <el-descriptions :column="1" border>
              <!--              <el-descriptions-item label="文件名">-->
              <!--                {{ sticker.file_name }}-->
              <!--              </el-descriptions-item>-->
              <el-descriptions-item label="文件大小">
                {{ formatFileSize(sticker.file_size) }}
              </el-descriptions-item>
              <el-descriptions-item label="尺寸">
                {{ sticker.width }} x {{ sticker.height }} 像素
              </el-descriptions-item>
              <el-descriptions-item label="上传时间">
                {{ formatRelativeTime(sticker.created_at) }}
              </el-descriptions-item>
              <el-descriptions-item label="最后更新">
                {{ formatRelativeTime(sticker.updated_at) }}
              </el-descriptions-item>
            </el-descriptions>

            <div class="description-container">
              <div class="section-title">
                <h3>描述</h3>
                <el-button
                    type="primary"
                    link
                    :icon="Edit"
                    @click="isEditingDescription = true"
                    v-if="!isEditingDescription"
                >
                  编辑
                </el-button>
              </div>

              <div v-if="!isEditingDescription" class="description-content">
                {{ sticker.description || '暂无描述' }}
              </div>

              <div v-else class="edit-description">
                <el-input
                    v-model="editedContent"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入表情包描述"
                />
                <div class="edit-actions">
                  <el-button type="primary" @click="saveDescription" :loading="updating">保存</el-button>
                  <el-button @click="cancelEditDescription">取消</el-button>
                </div>
              </div>
            </div>

            <div class="tags-container">
              <div class="section-title">
                <h3>标签</h3>
                <el-button
                    type="primary"
                    link
                    :icon="Edit"
                    @click="isEditingTags = true"
                    v-if="!isEditingTags"
                >
                  编辑
                </el-button>
              </div>

              <div v-if="!isEditingTags" class="tags-content">
                <el-tag
                    v-for="tag in sticker.tags"
                    :key="tag"
                    class="sticker-tag"
                >
                  {{ tag }}
                </el-tag>
                <el-empty v-if="sticker.tags.length === 0" description="暂无标签" :image-size="60"/>
              </div>

              <div v-else class="edit-tags">
                <el-select
                    v-model="editedTags"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    placeholder="请输入或选择标签"
                    style="width: 100%"
                >
                  <el-option
                      v-for="tag in availableTags"
                      :key="tag"
                      :label="tag"
                      :value="tag"
                  />
                </el-select>
                <div class="edit-actions">
                  <el-button type="primary" @click="saveTags" :loading="updating">保存</el-button>
                  <el-button @click="cancelEditTags">取消</el-button>
                </div>
              </div>
            </div>

            <div class="action-buttons">
              <el-button
                  type="success"
                  :icon="Download"
                  @click="downloadSticker"
                  :loading="downloading"
              >
                下载表情包
              </el-button>
              <el-button
                  type="info"
                  :icon="Link"
                  @click="copyImageUrl"
              >
                复制图片链接
              </el-button>
            </div>
          </div>
        </div>
      </el-card>

      <el-alert
          show-icon
          title="请勿随意修改表情包描述和标签，保持内容的友好与准确性"
          type="warning"
          :closable="false"
          style="margin: 20px 0"
      />
    </template>

    <el-empty v-else description="表情包不存在或已被删除"/>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useStickerStore} from '@/store/stickerStore';
import {downloadSingleSticker} from '@/utils/download';
import {formatFileSize, formatRelativeTime} from '@/utils/format';
import {Download, Edit, Link, PictureRounded} from '@element-plus/icons-vue';
import {ElMessage} from 'element-plus';
import HeartIcon from "@/components/icons/HeartIcon.vue";
import ThumbsDownIcon from "@/components/icons/ThumbsDownIcon.vue";

const route = useRoute();
const router = useRouter();
const stickerStore = useStickerStore();

const id = computed(() => String(route.params.id));
const sticker = computed(() => stickerStore.currentSticker);
const loading = computed(() => stickerStore.loading);
const availableTags = computed(() => stickerStore.availableTags);

// 添加计算属性判断用户是否已点赞/点踩
const isLiked = computed(() => {
  return sticker.value ? stickerStore.hasUserLiked(sticker.value.id) : false;
});

const isDisliked = computed(() => {
  return sticker.value ? stickerStore.hasUserDisliked(sticker.value.id) : false;
});

// 编辑状态
const isEditingDescription = ref(false);
const isEditingTags = ref(false);
const editedContent = ref('');
const editedTags = ref<string[]>([]);
const updating = ref(false);
const downloading = ref(false);

// 加载表情包详情
onMounted(async () => {
  await loadStickerDetail();

  // 如果还没有加载标签列表，就加载一次
  if (availableTags.value.length === 0) {
    await stickerStore.fetchAllTags();
  }
});

// 监听路由参数变化，重新加载数据
watch(() => route.params.id, async () => {
  console.log('Route params changed, reloading sticker detail', route.params.id);
  await loadStickerDetail();
});

// 加载表情包详情
const loadStickerDetail = async () => {
  try {

    await stickerStore.fetchStickerDetail(id.value);

    // 初始化编辑数据
    if (sticker.value) {
      editedContent.value = sticker.value.description;
      editedTags.value = [...sticker.value.tags];
    }
  } catch (error) {
    console.error('Failed to load sticker detail:', error);
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 处理喜欢
const handleLike = async () => {
  if (!sticker.value) return;

  try {
    const button = document.querySelector('.interaction-buttons .el-button--primary');
    button?.classList.add('button-animated');
    await stickerStore.like(sticker.value.id);
    setTimeout(() => {
      button?.classList.remove('button-animated');
    }, 1000);
  } catch (error) {
    console.error('Failed to like sticker:', error);
  }
};

// 处理踩
const handleDislike = async () => {
  if (!sticker.value) return;

  try {
    const button = document.querySelector('.interaction-buttons .el-button--danger');
    button?.classList.add('button-animated');
    await stickerStore.dislike(sticker.value.id);
    setTimeout(() => {
      button?.classList.remove('button-animated');
    }, 1000);
  } catch (error) {
    console.error('Failed to dislike sticker:', error);
  }
};

// 下载表情包
const downloadSticker = async () => {
  if (!sticker.value) return;

  downloading.value = true;
  try {
    await downloadSingleSticker(sticker.value);
    ElMessage.success('下载成功');
  } catch (error) {
    console.error('Failed to download sticker:', error);
    ElMessage.error('下载失败');
  } finally {
    downloading.value = false;
  }
};

// 复制图片链接
const copyImageUrl = () => {
  if (!sticker.value) return;

  try {
    navigator.clipboard.writeText(sticker.value.url);
    ElMessage.success('已复制图片链接到剪贴板');
  } catch (error) {
    console.error('Failed to copy URL:', error);
    ElMessage.error('复制失败');
  }
};

// 保存表情包描述
const saveDescription = async () => {
  if (!sticker.value) return;

  updating.value = true;
  try {
    await stickerStore.updateStickerDescription(sticker.value.id, editedContent.value);
    isEditingDescription.value = false;
  } catch (error) {
    console.error('Failed to update description:', error);
  } finally {
    updating.value = false;
  }
};

// 取消编辑描述
const cancelEditDescription = () => {
  if (!sticker.value) return;
  editedContent.value = sticker.value.description;
  isEditingDescription.value = false;
};

// 保存标签
const saveTags = async () => {
  if (!sticker.value) return;

  updating.value = true;
  try {
    await stickerStore.updateStickerTag(sticker.value.id, editedTags.value);
    isEditingTags.value = false;
    ElMessage.success('标签更新成功');
  } catch (error) {
    console.error('Failed to update tags:', error);
    ElMessage.error('标签更新失败');
  } finally {
    updating.value = false;
  }
};

// 取消编辑标签
const cancelEditTags = () => {
  if (!sticker.value) return;
  editedTags.value = [...sticker.value.tags];
  isEditingTags.value = false;
};
</script>

<style lang="scss" scoped>
.detail-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  .loading-container {
    min-height: 400px;
  }

  .page-title {
    font-size: 18px;
    font-weight: 500;
  }

  .detail-card {
    margin-top: 20px;

    .detail-container {
      display: flex;
      gap: 30px;

      .sticker-image {
        flex: 0 0 400px;
        background-color: var(--el-fill-color-light);
        display: flex;
        justify-content: center;
        align-items: center;

        .el-image {
          max-width: 100%;
          max-height: 500px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .image-error {
          width: 100%;
          height: 100%;
          min-height: 300px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: var(--el-text-color-secondary);
        }
      }

      .sticker-info {
        flex: 1;

        .info-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;

          .sticker-title {
            margin: 0;
            font-size: 24px;
            font-weight: 500;
            word-break: break-all;
          }

          .interaction-buttons {
            display: flex;
            gap: 10px;

            .animated-button {
              transition: transform 0.3s;

              &.button-animated {
                animation: pulse 1s;
              }
            }
          }
        }

        .description-container, .tags-container {
          margin-top: 20px;

          .section-title {
            display: flex;
            justify-content: space-between;
            align-items: center;

            h3 {
              margin: 0;
              font-size: 18px;
              font-weight: 500;
            }
          }

          .description-content {
            margin-top: 10px;
            padding: 10px;
            background-color: var(--el-fill-color-light);
            border-radius: 4px;
            min-height: 60px;
            white-space: pre-wrap;
          }

          .edit-description, .edit-tags {
            margin-top: 10px;

            .edit-actions {
              margin-top: 10px;
              display: flex;
              justify-content: flex-end;
              gap: 10px;
            }
          }

          .tags-content {
            margin-top: 10px;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;

            .sticker-tag {
              margin-bottom: 8px;
            }
          }
        }

        .action-buttons {
          margin-top: 30px;
          display: flex;
          gap: 15px;
        }
      }
    }
  }
}

/* 添加图标样式 */
.icon {
  vertical-align: middle;
  margin-right: 4px;
  width: 18px;
  height: 18px;
}

/* 添加激活状态样式 */
.is-active {
  font-weight: bold;

  //&.el-button--primary, &.el-button--danger {
  //  background-color: #FFF;
  //  color: #FF4D4F;
  //  border-color: #FF4D4F;
  //
  //  &:hover {
  //    background-color: #FFF7F7;
  //  }
  //}
}


@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .detail-view {
    padding: 10px;

    .detail-card {
      .detail-container {
        flex-direction: column;

        .sticker-image {
          flex: none;
          width: 100%;

          .el-image {
            max-height: 300px;
          }
        }

        .sticker-info {
          .info-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;

            .interaction-buttons {
              width: 100%;
            }
          }

          .action-buttons {
            flex-wrap: wrap;
          }
        }
      }
    }
  }
}
</style>