import {ref} from 'vue';

export function useImagePreload() {
    const isLoading = ref(false);
    const progress = ref(0);
    const error = ref<string | null>(null);

    const preloadImage = (src: string): Promise<HTMLImageElement> => {
        isLoading.value = true;
        error.value = null;

        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                isLoading.value = false;
                progress.value = 100;
                resolve(img);
            };

            img.onerror = () => {
                isLoading.value = false;
                error.value = '图片加载失败';
                reject(new Error('图片加载失败'));
            };

            if (img.complete) {
                isLoading.value = false;
                progress.value = 100;
                resolve(img);
            } else {
                img.src = src;
            }
        });
    };

    return {
        isLoading,
        progress,
        error,
        preloadImage
    };
}