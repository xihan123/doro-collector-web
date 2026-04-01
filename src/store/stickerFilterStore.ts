import { defineStore } from 'pinia'
import type { DisplayMode, SortType, StickerQueryParams } from '@/types/sticker'

export const useStickerFilterStore = defineStore('stickerFilter', {
  state: () => ({
    sort: 'created_at' as SortType,
    search: '',
    selectedTags: [] as string[],
    displayMode: 'grid' as DisplayMode,
  }),

  getters: {
    queryParams(): StickerQueryParams {
      const params: StickerQueryParams = {
        page: 1,
        size: 20,
        sort_by: this.sort,
      }
      if (this.search) params.search = this.search
      if (this.selectedTags.length > 0) params.tags = [...this.selectedTags]
      return params
    },
  },

  actions: {
    resetFilters() {
      this.search = ''
      this.selectedTags = []
    },
  },
})
