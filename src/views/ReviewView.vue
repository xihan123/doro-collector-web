<template>
  <div class="review-view">
    <el-card v-if="!authenticated" class="auth-card" shadow="never">
      <div class="auth-content">
        <el-icon class="auth-icon"><Lock /></el-icon>
        <h2>内容审核</h2>
        <p class="auth-tip">该页面需要安全密钥验证，仅限管理员访问</p>
        <el-input
          v-model="secretKeyInput"
          type="password"
          placeholder="请输入安全密钥"
          show-password
          clearable
          @keyup.enter="handleAuth"
        />
        <el-button
          type="primary"
          class="auth-button"
          :loading="authenticating"
          @click="handleAuth"
        >
          验证并进入
        </el-button>
      </div>
    </el-card>

    <template v-else>
      <div class="review-toolbar">
        <el-tag type="warning" effect="plain" size="large">待审核 {{ total }} 个</el-tag>

        <div class="toolbar-actions">
          <el-button :icon="Refresh" :loading="loading" @click="fetchPending()">刷新</el-button>
          <el-button :icon="SwitchButton" @click="handleExit">更换密钥</el-button>
        </div>
      </div>

      <div v-if="loading" class="review-grid">
        <el-card v-for="i in 8" :key="i" class="review-card" shadow="never" :body-style="{ padding: '0' }">
          <el-skeleton animated class="card-skeleton">
            <template #template>
              <el-skeleton-item variant="image" class="skeleton-image" />
              <div class="skeleton-body">
                <el-skeleton-item variant="text" style="width: 80%; margin-bottom: 10px" />
                <el-skeleton-item variant="text" style="width: 50%" />
              </div>
            </template>
          </el-skeleton>
        </el-card>
      </div>

      <template v-else>
        <div v-if="stickers.length > 0" class="review-grid">
          <el-card
            v-for="sticker in stickers"
            :key="sticker.id"
            class="review-card"
            shadow="hover"
            :body-style="{ padding: '0' }"
          >
            <div class="card-image">
              <el-image
                :src="sticker.url"
                fit="contain"
                :preview-src-list="[sticker.url]"
                preview-teleported
                :initial-index="0"
                loading="lazy"
              >
                <template #placeholder>
                  <div class="image-fallback">
                    <el-icon><PictureRounded /></el-icon>
                  </div>
                </template>
                <template #error>
                  <div class="image-fallback">
                    <el-icon><PictureRounded /></el-icon>
                    <span>加载失败</span>
                  </div>
                </template>
              </el-image>
            </div>

            <div class="card-body">
              <el-alert
                v-if="sticker.review_reason"
                class="card-reason"
                type="warning"
                show-icon
                :closable="false"
                :title="`审核原因：${sticker.review_reason}`"
              />

              <div class="card-description">{{ sticker.description || '野生Doro表情包' }}</div>

              <div class="card-tags" v-if="sticker.tags?.length">
                <el-tag v-for="tag in sticker.tags.slice(0, 3)" :key="tag" size="small">
                  {{ tag }}
                </el-tag>
              </div>

              <div class="card-meta">
                <span>{{ formatRelativeTime(sticker.created_at) }}上传</span>
                <span>{{ formatFileSize(sticker.file_size) }}</span>
              </div>

              <div class="card-actions">
                <el-button
                  type="success"
                  :icon="CircleCheck"
                  :loading="actingId === sticker.id"
                  @click="handleApprove(sticker)"
                >
                  通过
                </el-button>
                <el-button
                  type="danger"
                  :icon="CircleClose"
                  :disabled="actingId === sticker.id"
                  @click="handleReject(sticker)"
                >
                  驳回
                </el-button>
              </div>
            </div>
          </el-card>
        </div>

        <el-empty v-else description="暂无待审核的表情包" />

        <div class="review-pagination" v-if="total > 0">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="size"
            :total="total"
            :page-sizes="[20, 50, 100]"
            layout="total, sizes, prev, pager, next"
            background
            @current-change="fetchPending()"
            @size-change="handleSizeChange"
          />
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { approveSticker, getPendingReviews, rejectSticker } from '@/api/sticker'
import { formatFileSize, formatRelativeTime } from '@/utils/format'
import { CircleCheck, CircleClose, Lock, PictureRounded, Refresh, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Sticker } from '@/types/sticker'

const STORAGE_KEY = 'review-secret-key'

const secretKey = ref('')
const secretKeyInput = ref('')
const authenticated = ref(false)
const authenticating = ref(false)

const stickers = ref<Sticker[]>([])
const loading = ref(false)
const actingId = ref<string | null>(null)
const total = ref(0)
const page = ref(1)
const size = ref(20)

onMounted(() => {
  const saved = sessionStorage.getItem(STORAGE_KEY)
  if (saved) {
    secretKey.value = saved
    authenticated.value = true
    fetchPending()
  }
})

const handleAuth = async () => {
  const key = secretKeyInput.value.trim()
  if (!key) {
    ElMessage.warning('请输入安全密钥')
    return
  }

  authenticating.value = true
  secretKey.value = key
  page.value = 1
  if (await fetchPending()) {
    authenticated.value = true
    sessionStorage.setItem(STORAGE_KEY, key)
  }
  authenticating.value = false
}

const handleExit = () => {
  sessionStorage.removeItem(STORAGE_KEY)
  secretKey.value = ''
  authenticated.value = false
  stickers.value = []
  total.value = 0
  page.value = 1
}

const handleError = (error: unknown, fallback: string) => {
  const message = (error as Error).message || ''
  if (message.includes('密钥')) {
    ElMessage.error(message)
    handleExit()
  } else {
    ElMessage.error(message || fallback)
  }
}

const fetchPending = async (): Promise<boolean> => {
  loading.value = true
  try {
    const response = await getPendingReviews({ page: page.value, size: size.value }, secretKey.value)
    stickers.value = response.items
    total.value = response.total
    return true
  } catch (error) {
    handleError(error, '获取待审核列表失败')
    return false
  } finally {
    loading.value = false
  }
}

const handleSizeChange = () => {
  page.value = 1
  fetchPending()
}

const removeSticker = (id: string) => {
  const index = stickers.value.findIndex(s => s.id === id)
  if (index !== -1) {
    stickers.value.splice(index, 1)
  }
  total.value = Math.max(0, total.value - 1)

  if (stickers.value.length === 0 && page.value > 1) {
    page.value -= 1
    fetchPending()
  }
}

const handleApprove = async (sticker: Sticker) => {
  actingId.value = sticker.id
  try {
    const response = await approveSticker(sticker.id, secretKey.value)
    ElMessage.success(response.message || '已通过审核')
    removeSticker(sticker.id)
  } catch (error) {
    handleError(error, '操作失败，请重试')
  } finally {
    actingId.value = null
  }
}

const handleReject = async (sticker: Sticker) => {
  let reason = ''
  try {
    const { value } = await ElMessageBox.prompt(
      '可以填写驳回原因（可选），会记录在该表情包上',
      '驳回表情包',
      {
        confirmButtonText: '确认驳回',
        cancelButtonText: '取消',
        type: 'warning',
        inputType: 'textarea',
        inputPlaceholder: '驳回原因（可选）',
      },
    )
    reason = (value || '').trim()
  } catch {
    return
  }

  actingId.value = sticker.id
  try {
    const response = await rejectSticker(sticker.id, secretKey.value, reason || undefined)
    ElMessage.success(response.message || '已驳回')
    removeSticker(sticker.id)
  } catch (error) {
    handleError(error, '操作失败，请重试')
  } finally {
    actingId.value = null
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;

.review-view {
  @include content-container;

  .auth-card {
    max-width: 420px;
    margin: 60px auto;

    .auth-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 20px 12px;

      .auth-icon {
        font-size: 48px;
        color: var(--el-color-primary);
      }

      h2 {
        margin: 0;
      }

      .auth-tip {
        margin: 0;
        font-size: 13px;
        color: var(--el-text-color-secondary);
        text-align: center;
      }

      .auth-button {
        width: 100%;
      }
    }
  }

  .review-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--app-spacing-lg);

    .toolbar-actions {
      display: flex;
      gap: 10px;
    }
  }

  .review-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--app-spacing-lg);
  }

  .review-card {
    display: flex;
    flex-direction: column;

    .card-skeleton {
      .skeleton-image {
        width: 100%;
        height: 200px;
      }

      .skeleton-body {
        padding: 14px;
      }
    }

    .card-image {
      width: 100%;
      height: 200px;
      background-color: var(--el-fill-color-light);

      .el-image {
        width: 100%;
        height: 100%;
        @include flex-center;
      }

      .image-fallback {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: var(--el-text-color-secondary);

        .el-icon {
          font-size: 32px;
          margin-bottom: 10px;
        }
      }
    }

    .card-body {
      display: flex;
      flex-direction: column;
      flex: 1;
      padding: 12px;

      .card-reason {
        margin-bottom: var(--app-spacing-sm);
      }

      .card-description {
        margin-bottom: var(--app-spacing-sm);
        font-size: 14px;
        line-height: 1.4;
        max-height: 40px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .card-tags {
        margin-bottom: 10px;
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }

      .card-meta {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--app-spacing-sm);
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }

      .card-actions {
        margin-top: auto;
        display: flex;

        .el-button {
          flex: 1;
          margin-left: 0;

          & + .el-button {
            margin-left: 10px;
          }
        }
      }
    }

    @include card-hover;
  }

  .review-pagination {
    display: flex;
    justify-content: center;
    margin-top: var(--app-spacing-lg);
  }
}

@include respond-to(tablet) {
  .review-view {
    padding: 10px;

    .auth-card {
      margin: 30px auto;
    }

    .review-toolbar {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }
}
</style>
