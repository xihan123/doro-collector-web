import { defineStore } from 'pinia'

export const useStickerInteractionStore = defineStore('stickerInteraction', {
  state: () => ({
    userLikedStickers: [] as string[],
    userDislikedStickers: [] as string[],
    selectedStickers: [] as string[],
  }),

  getters: {
    hasUserLiked: (state) => (id: string) => state.userLikedStickers.includes(id),
    hasUserDisliked: (state) => (id: string) => state.userDislikedStickers.includes(id),
  },

  actions: {
    initUserInteractions() {
      try {
        const liked = localStorage.getItem('userLikedStickers')
        const disliked = localStorage.getItem('userDislikedStickers')
        if (liked) this.userLikedStickers = JSON.parse(liked)
        if (disliked) this.userDislikedStickers = JSON.parse(disliked)
      } catch {
        localStorage.removeItem('userLikedStickers')
        localStorage.removeItem('userDislikedStickers')
      }
    },

    saveUserInteractions() {
      localStorage.setItem('userLikedStickers', JSON.stringify(this.userLikedStickers))
      localStorage.setItem('userDislikedStickers', JSON.stringify(this.userDislikedStickers))
    },

    recordLike(id: string, message: string | null) {
      if (message === '取消点赞成功') {
        const index = this.userLikedStickers.indexOf(id)
        if (index !== -1) this.userLikedStickers.splice(index, 1)
      } else {
        this.userLikedStickers.push(id)
        const dislikeIndex = this.userDislikedStickers.indexOf(id)
        if (dislikeIndex !== -1) this.userDislikedStickers.splice(dislikeIndex, 1)
      }
      this.saveUserInteractions()
    },

    recordDislike(id: string, message: string | null) {
      if (message === '取消点踩成功') {
        const index = this.userDislikedStickers.indexOf(id)
        if (index !== -1) this.userDislikedStickers.splice(index, 1)
      } else {
        this.userDislikedStickers.push(id)
        const likeIndex = this.userLikedStickers.indexOf(id)
        if (likeIndex !== -1) this.userLikedStickers.splice(likeIndex, 1)
      }
      this.saveUserInteractions()
    },

    toggleSelectedSticker(id: string) {
      const index = this.selectedStickers.indexOf(id)
      if (index !== -1) {
        this.selectedStickers.splice(index, 1)
      } else {
        this.selectedStickers.push(id)
      }
    },

    clearSelectedStickers() {
      this.selectedStickers = []
    },
  },
})
