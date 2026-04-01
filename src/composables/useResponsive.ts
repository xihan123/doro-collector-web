import { ref, onMounted, onUnmounted, computed } from 'vue'

type Breakpoint = 'mobile' | 'tablet' | 'desktop'

export function useResponsive() {
  const breakpoint = ref<Breakpoint>('desktop')

  const mediaMobile = window.matchMedia('(max-width: 576px)')
  const mediaTablet = window.matchMedia('(max-width: 768px)')

  const update = () => {
    if (mediaMobile.matches) {
      breakpoint.value = 'mobile'
    } else if (mediaTablet.matches) {
      breakpoint.value = 'tablet'
    } else {
      breakpoint.value = 'desktop'
    }
  }

  onMounted(() => {
    update()
    mediaMobile.addEventListener('change', update)
    mediaTablet.addEventListener('change', update)
  })

  onUnmounted(() => {
    mediaMobile.removeEventListener('change', update)
    mediaTablet.removeEventListener('change', update)
  })

  const isMobile = computed(() => breakpoint.value === 'mobile')
  const isTablet = computed(() => breakpoint.value === 'tablet')
  const isDesktop = computed(() => breakpoint.value === 'desktop')

  return { breakpoint, isMobile, isTablet, isDesktop }
}
