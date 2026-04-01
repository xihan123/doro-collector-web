import { ref, onMounted, onUnmounted } from 'vue'
import { throttle } from 'lodash-es'

export function useInfiniteScroll(callback: () => Promise<void>, options: {
  threshold?: number
  throttleDelay?: number
} = {}) {
  const { threshold = 200, throttleDelay = 300 } = options
  const isLoading = ref(false)

  const handleScroll = throttle(async () => {
    if (isLoading.value) return

    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight

    if (scrollTop + windowHeight >= documentHeight - threshold) {
      isLoading.value = true
      try {
        await callback()
      } finally {
        isLoading.value = false
      }
    }
  }, throttleDelay)

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
  })

  onUnmounted(() => {
    handleScroll.cancel()
    window.removeEventListener('scroll', handleScroll)
  })

  return { isLoading }
}
