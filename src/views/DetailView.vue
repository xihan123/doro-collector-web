<template>
  <div class="detail-view">
    <div v-if="loading" class="loading-container">
      <el-skeleton animated :rows="10" />
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
                  <el-icon><PictureRounded /></el-icon>
                  <span>图片加载失败</span>
                </div>
              </template>
            </el-image>
          </div>

          <div class="sticker-info">
            <div class="info-header">
              <div class="interaction-buttons">
                <el-button
                  type="primary"
                  size="large"
                  @click="handleLikeAction"
                  :class="{ 'is-active': isLiked, 'button-animated': isLikeAnimating }"
                >
                  <heart-icon class="icon" :filled="isLiked" />
                  {{ sticker.likes }} 喜欢
                </el-button>
                <el-button
                  type="danger"
                  size="large"
                  @click="handleDislikeAction"
                  :class="{ 'is-active': isDisliked, 'button-animated': isDislikeAnimating }"
                >
                  <thumbs-down-icon class="icon" :filled="isDisliked" />
                  {{ sticker.dislikes }} 踩
                </el-button>
              </div>
            </div>

            <el-descriptions :column="1" border>
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
                  v-if="!isEditingDescription"
                  type="primary"
                  link
                  :icon="Edit"
                  @click="startEditDescription"
                >
                  编辑
                </el-button>
              </div>

              <div v-if="!isEditingDescription" class="description-content">
                {{ sticker.description || '暂无描述' }}
              </div>

              <div v-else class="edit-section">
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
                  v-if="!isEditingTags"
                  type="primary"
                  link
                  :icon="Edit"
                  @click="startEditTags"
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
                <el-empty v-if="sticker.tags.length === 0" description="暂无标签" :image-size="60" />
              </div>

              <div v-else class="edit-section">
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
                    v-for="tag in stickerStore.availableTags"
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
                @click="handleDownloadSticker"
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

    <el-empty v-else description="表情包不存在或已被删除" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStickerStore } from '@/store/stickerStore'
import { useStickerInteractionStore } from '@/store/stickerInteractionStore'
import { useStickerActions } from '@/composables/useStickerActions'
import { downloadSingleSticker } from '@/utils/download'
import { formatFileSize, formatRelativeTime } from '@/utils/format'
import { Download, Edit, Link, PictureRounded } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import HeartIcon from '@/components/icons/HeartIcon.vue'
import ThumbsDownIcon from '@/components/icons/ThumbsDownIcon.vue'

const route = useRoute()
const router = useRouter()
const stickerStore = useStickerStore()
const interactionStore = useStickerInteractionStore()
const { handleLike, handleDislike, handleDownload } = useStickerActions()

const id = computed(() => String(route.params.id))
const sticker = computed(() => stickerStore.currentSticker)
const loading = computed(() => stickerStore.loading)
const isLiked = computed(() => sticker.value ? interactionStore.hasUserLiked(sticker.value.id) : false)
const isDisliked = computed(() => sticker.value ? interactionStore.hasUserDisliked(sticker.value.id) : false)

// 动画状态 — 用响应式变量替代 DOM 操作
const isLikeAnimating = ref(false)
const isDislikeAnimating = ref(false)

// 编辑状态
const isEditingDescription = ref(false)
const isEditingTags = ref(false)
const editedContent = ref('')
const editedTags = ref<string[]>([])
const updating = ref(false)
const downloading = ref(false)

onMounted(async () => {
  await loadDetail()
  if (stickerStore.availableTags.length === 0) {
    await stickerStore.fetchAllTags()
  }
})

watch(() => route.params.id, async () => {
  await loadDetail()
})

const loadDetail = async () => {
  try {
    await stickerStore.fetchStickerDetail(id.value)
    if (sticker.value) {
      editedContent.value = sticker.value.description
      editedTags.value = [...sticker.value.tags]
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

const goBack = () => router.back()

// 带动画的交互处理
const handleLikeAction = async () => {
  if (!sticker.value) return
  isLikeAnimating.value = true
  try {
    await handleLike(sticker.value.id)
  } finally {
    setTimeout(() => { isLikeAnimating.value = false }, 300)
  }
}

const handleDislikeAction = async () => {
  if (!sticker.value) return
  isDislikeAnimating.value = true
  try {
    await handleDislike(sticker.value.id)
  } finally {
    setTimeout(() => { isDislikeAnimating.value = false }, 300)
  }
}

const handleDownloadSticker = async () => {
  if (!sticker.value) return
  downloading.value = true
  try {
    await downloadSingleSticker(sticker.value)
    ElMessage.success('下载成功')
  } catch {
    ElMessage.error('下载失败')
  } finally {
    downloading.value = false
  }
}

const copyImageUrl = () => {
  if (!sticker.value) return
  try {
    navigator.clipboard.writeText(sticker.value.url)
    ElMessage.success('已复制图片链接到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const startEditDescription = () => {
  if (!sticker.value) return
  editedContent.value = sticker.value.description
  isEditingDescription.value = true
}

const cancelEditDescription = () => {
  if (!sticker.value) return
  editedContent.value = sticker.value.description
  isEditingDescription.value = false
}

const saveDescription = async () => {
  if (!sticker.value) return
  updating.value = true
  try {
    await stickerStore.updateStickerDescription(sticker.value.id, editedContent.value)
    ElMessage.success('更新成功')
    isEditingDescription.value = false
  } catch {
    ElMessage.error('更新失败')
  } finally {
    updating.value = false
  }
}

const startEditTags = () => {
  if (!sticker.value) return
  editedTags.value = [...sticker.value.tags]
  isEditingTags.value = true
}

const cancelEditTags = () => {
  if (!sticker.value) return
  editedTags.value = [...sticker.value.tags]
  isEditingTags.value = false
}

const saveTags = async () => {
  if (!sticker.value) return
  updating.value = true
  try {
    await stickerStore.updateStickerTag(sticker.value.id, editedTags.value)
    ElMessage.success('标签更新成功')
    isEditingTags.value = false
  } catch {
    ElMessage.error('标签更新失败')
  } finally {
    updating.value = false
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;

.detail-view {
  max-width: var(--app-width-content);
  margin: 0 auto;
  padding: var(--app-spacing-lg);

  .loading-container {
    min-height: 400px;
  }

  .page-title {
    font-size: 18px;
    font-weight: 500;
  }

  .detail-card {
    margin-top: var(--app-spacing-lg);

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
          @include flex-center;
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
          margin-bottom: var(--app-spacing-lg);

          .interaction-buttons {
            display: flex;
            gap: 10px;
          }
        }

        .description-container,
        .tags-container {
          margin-top: var(--app-spacing-lg);

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
            border-radius: var(--app-radius-sm);
            min-height: 60px;
            white-space: pre-wrap;
          }

          .edit-section {
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
            gap: var(--app-spacing-sm);

            .sticker-tag {
              margin-bottom: var(--app-spacing-sm);
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

.icon {
  vertical-align: middle;
  margin-right: 4px;
  width: 18px;
  height: 18px;
}

.is-active {
  font-weight: bold;
}

@include respond-to(tablet) {
  .detail-view {
    padding: 10px;

    .detail-card .detail-container {
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
</style>
