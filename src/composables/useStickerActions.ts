import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useStickerStore } from '@/store/stickerStore'
import { useStickerFilterStore } from '@/store/stickerFilterStore'
import { useStickerInteractionStore } from '@/store/stickerInteractionStore'
import { downloadSingleSticker } from '@/utils/download'
import type { Sticker } from '@/types/sticker'

export function useStickerActions() {
  const router = useRouter()
  const stickerStore = useStickerStore()
  const filterStore = useStickerFilterStore()
  const interactionStore = useStickerInteractionStore()

  const handleLike = async (id: string) => {
    try {
      const response = await stickerStore.like(id)
      interactionStore.recordLike(id, response.message)
      ElMessage({ message: response.message || '操作成功', type: response.success ? 'success' : 'error' })
    } catch {
      ElMessage.error('点赞失败，请稍后重试')
    }
  }

  const handleDislike = async (id: string) => {
    try {
      const response = await stickerStore.dislike(id)
      interactionStore.recordDislike(id, response.message)
      ElMessage({ message: response.message || '操作成功', type: response.success ? 'success' : 'error' })
    } catch {
      ElMessage.error('操作失败，请稍后重试')
    }
  }

  const handleDownload = async (sticker: Sticker) => {
    try {
      await downloadSingleSticker(sticker)
      ElMessage.success('下载成功')
    } catch {
      ElMessage.error('下载失败')
    }
  }

  const handleTagClick = (tag: string) => {
    filterStore.selectedTags = [tag]
  }

  const navigateToDetail = (id: string) => {
    router.push(`/sticker/${id}`)
  }

  return { handleLike, handleDislike, handleDownload, handleTagClick, navigateToDetail }
}
