import { defineStore } from 'pinia'
import {
  deleteSticker,
  dislikeSticker,
  getAllTags,
  getStickerById,
  getStickers,
  likeSticker,
  updateStickerDescription,
  updateStickerTag,
  uploadSticker,
} from '@/api/sticker'
import type { PaginatedResponse, Sticker, StickerQueryParams } from '@/types/sticker'

export const useStickerStore = defineStore('sticker', {
  state: () => ({
    stickers: [] as Sticker[],
    currentSticker: null as Sticker | null,
    loading: false,
    uploading: false,
    total: 0,
    page: 1,
    size: 20,
    pages: 1,
    availableTags: [] as string[],
  }),

  getters: {
    hasMore(): boolean {
      return this.page < this.pages
    },
    isStickersEmpty(): boolean {
      return this.stickers.length === 0
    },
  },

  actions: {
    async fetchStickers(params: StickerQueryParams, resetPage: boolean = false): Promise<void> {
      this.loading = true
      try {
        const response: PaginatedResponse<Sticker> = await getStickers(params)

        if (resetPage || params.page === 1) {
          this.stickers = response.items as Sticker[]
        } else {
          const existingIds = new Set(this.stickers.map(s => s.id))
          const newUniqueStickers = response.items.filter(sticker => !existingIds.has(sticker.id))
          if (newUniqueStickers.length > 0) {
            this.stickers = [...this.stickers, ...newUniqueStickers]
          }
        }

        this.total = response.total
        this.pages = response.pages
      } catch (error) {
        console.error('获取表情包列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async loadMore(params: StickerQueryParams): Promise<void> {
      if (this.hasMore && !this.loading) {
        const nextPageParams = { ...params, page: this.page + 1 }
        await this.fetchStickers(nextPageParams)
        this.page += 1
      }
    },

    async fetchStickerDetail(id: string): Promise<void> {
      this.loading = true
      try {
        const sticker = await getStickerById(id)
        this.currentSticker = sticker
      } catch (error) {
        console.error('获取表情包详情失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async like(id: string) {
      const response = await likeSticker(id)

      const index = this.stickers.findIndex(s => s.id === id)
      if (index !== -1) {
        this.stickers[index] = response.sticker
      }
      if (this.currentSticker?.id === id) {
        this.currentSticker = response.sticker
      }

      return response
    },

    async dislike(id: string) {
      const response = await dislikeSticker(id)

      const index = this.stickers.findIndex(s => s.id === id)
      if (index !== -1) {
        this.stickers[index] = response.sticker
      }
      if (this.currentSticker?.id === id) {
        this.currentSticker = response.sticker
      }

      return response
    },

    async updateStickerDescription(id: number | string, description: string): Promise<Sticker> {
      const sticker = await updateStickerDescription(id, description)
      if (this.currentSticker?.id === String(id)) {
        this.currentSticker = sticker
      }
      return sticker
    },

    async updateStickerTag(id: number | string, tags: string[]): Promise<Sticker> {
      const sticker = await updateStickerTag(id, tags)
      const index = this.stickers.findIndex(s => s.id === String(id))
      if (index !== -1) {
        this.stickers[index].tags = [...tags]
      }
      if (this.currentSticker?.id === String(id)) {
        this.currentSticker.tags = [...tags]
      }
      return sticker
    },

    async upload(file: File, content: string, tags: string[]): Promise<boolean> {
      this.uploading = true
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('content', content)
        tags.forEach(tag => formData.append('tags', tag))

        const response = await uploadSticker(formData)
        return response.success
      } catch (error) {
        console.error('上传表情包失败:', error)
        throw error
      } finally {
        this.uploading = false
      }
    },

    async removeSticker(id: string, secretKey?: string): Promise<void> {
      await deleteSticker(id, secretKey)
    },

    async fetchAllTags(): Promise<void> {
      const response = await getAllTags()
      this.availableTags = response.map(tag => tag.tag).sort((a, b) => a.localeCompare(b))
    },
  },
})
