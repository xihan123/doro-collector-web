import {onMounted, onUnmounted, ref} from 'vue';
import {throttle} from 'lodash-es';

export function useInfiniteScroll(loadMore: () => void, options = {threshold: 200, throttleDelay: 300}) {
    const isLoading = ref(false);

    const handleScroll = throttle(() => {
        if (isLoading.value) return;

        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // 当滚动到距离底部threshold像素时加载更多
        if (documentHeight - scrollTop - windowHeight <= options.threshold) {
            isLoading.value = true;
            loadMore();
            setTimeout(() => {
                isLoading.value = false;
            }, 500);
        }
    }, options.throttleDelay);

    onMounted(() => {
        window.addEventListener('scroll', handleScroll);
    });

    onUnmounted(() => {
        window.removeEventListener('scroll', handleScroll);
    });

    return {isLoading};
}