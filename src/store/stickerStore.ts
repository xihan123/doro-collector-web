import {defineStore} from 'pinia';
import {
    deleteSticker,
    dislikeSticker,
    getAllTags,
    getStickerById,
    getStickers,
    likeSticker,
    updateStickerDescription,
    updateStickerTag,
    uploadSticker
} from '@/api/sticker';
import type {DisplayMode, PaginatedResponse, SortType, Sticker, StickerQueryParams} from '@/types/sticker';
import {ElMessage} from 'element-plus';

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
        sort: 'created_at' as SortType,
        search: '',
        selectedTags: [] as string[],
        availableTags: [] as string[],
        displayMode: 'grid' as DisplayMode,
        selectedStickers: [] as string[],
        // 添加用户交互状态跟踪
        userLikedStickers: [] as string[],  // 用户已点赞的表情包ID
        userDislikedStickers: [] as string[], // 用户已点踩的表情包ID
    }),

    getters: {
        hasMore(): boolean {
            return this.page < this.pages;
        },

        isStickersEmpty(): boolean {
            return this.stickers.length === 0;
        },

        // 添加判断用户是否已点赞/点踩的getter
        hasUserLiked: (state) => (id: string) => {
            return state.userLikedStickers.includes(id);
        },

        hasUserDisliked: (state) => (id: string) => {
            return state.userDislikedStickers.includes(id);
        },
    },

    actions: {
        // 初始化用户交互状态
        initUserInteractions() {
            // 从本地存储加载用户交互历史
            const likedStickers = localStorage.getItem('userLikedStickers');
            const dislikedStickers = localStorage.getItem('userDislikedStickers');

            if (likedStickers) {
                try {
                    this.userLikedStickers = JSON.parse(likedStickers);
                } catch (e) {
                    this.userLikedStickers = [];
                }
            }

            if (dislikedStickers) {
                try {
                    this.userDislikedStickers = JSON.parse(dislikedStickers);
                } catch (e) {
                    this.userDislikedStickers = [];
                }
            }
        },

        // 保存用户交互状态到本地存储
        saveUserInteractions() {
            localStorage.setItem('userLikedStickers', JSON.stringify(this.userLikedStickers));
            localStorage.setItem('userDislikedStickers', JSON.stringify(this.userDislikedStickers));
        },
        // 获取表情包列表
        async fetchStickers(resetPage: boolean = false): Promise<void> {
            if (resetPage) {
                this.page = 1;
            }

            this.loading = true;
            try {
                const params: StickerQueryParams = {
                    page: this.page,
                    size: this.size,
                    sort_by: this.sort
                };

                if (this.search) {
                    params.search = this.search;
                }

                if (this.selectedTags.length > 0) {
                    params.tags = [...this.selectedTags]; // 创建副本避免引用问题
                }

                const response: PaginatedResponse<Sticker> = await getStickers(params);

                if (resetPage || this.page === 1) {
                    // 首页数据直接替换，无需去重
                    this.stickers = response.items as Sticker[];
                } else {
                    // 使用ID索引去重，性能优化
                    const existingIds = new Set(this.stickers.map(s => s.id));

                    // 过滤掉已存在的表情包
                    const newUniqueStickers = response.items.filter(sticker => !existingIds.has(sticker.id));

                    // 合并数组 - 只添加新的不重复项
                    if (newUniqueStickers.length > 0) {
                        this.stickers = [...this.stickers, ...newUniqueStickers];
                    }
                }

                this.total = response.total;
                this.pages = response.pages;
            } catch (error) {
                // 错误处理 - 增加具体错误信息
                const errorMessage = error instanceof Error ? error.message : '未知错误';
                console.error(`获取表情包列表失败: ${errorMessage}`, error);
                ElMessage.error({
                    message: `获取表情包列表失败: ${errorMessage}`,
                    duration: 3000,
                    showClose: true
                });
            } finally {
                this.loading = false;
            }
        },

        // 加载更多表情包
        async loadMore(): Promise<void> {
            if (this.hasMore && !this.loading) {
                this.page += 1;
                await this.fetchStickers(false);
            }
        },

        // 获取表情包详情
        async fetchStickerDetail(id: string): Promise<void> {
            this.loading = true;
            try {
                const sticker = await getStickerById(id);
                this.currentSticker = sticker;
            } catch (error) {
                console.error('Failed to fetch sticker detail:', error);
                ElMessage.error('获取表情包详情失败');
            } finally {
                this.loading = false;
            }
        },

        // 喜欢表情包
        async like(id: string): Promise<void> {
            try {

                const response = await likeSticker(id);
                // 更新本地状态
                const index = this.stickers.findIndex(s => s.id === id);
                if (index !== -1) {
                    this.stickers[index] = response.sticker;
                }

                if (this.currentSticker?.id === id) {
                    this.currentSticker = response.sticker;
                }

                if (response.message === "取消点赞成功") {
                    // 如果之前点过赞，则移除
                    const likeIndex = this.userLikedStickers.indexOf(id);
                    if (likeIndex !== -1) {
                        this.userLikedStickers.splice(likeIndex, 1);
                    }
                } else {
                    // 如果未点赞，则添加点赞
                    this.userLikedStickers.push(id);

                    // 如果之前点过踩，则移除
                    const dislikeIndex = this.userDislikedStickers.indexOf(id);
                    if (dislikeIndex !== -1) {
                        this.userDislikedStickers.splice(dislikeIndex, 1);
                    }
                }

                // 保存状态
                this.saveUserInteractions();

                // 显示API返回的消息
                ElMessage({
                    message: response.message || '操作成功',
                    type: response.success ? 'success' : 'error',
                });
            } catch (error) {
                console.error('点赞操作失败:', error);
                ElMessage.error('点赞失败，请稍后重试');
            }
        },
        // 不喜欢表情包
        async dislike(id: string): Promise<void> {
            try {
                const response = await dislikeSticker(id);
                // 更新本地状态
                const index = this.stickers.findIndex(s => s.id === id);
                if (index !== -1) {
                    this.stickers[index] = response.sticker;
                }

                if (this.currentSticker?.id === id) {
                    this.currentSticker = response.sticker;
                }

                // 切换用户交互状态
                if (response.message === "取消点踩成功") {
                    // 如果已经点踩，则取消点踩
                    const dislikeIndex = this.userDislikedStickers.indexOf(id);
                    if (dislikeIndex !== -1) {
                        this.userDislikedStickers.splice(dislikeIndex, 1);
                    }
                } else {
                    // 如果未点踩，则添加点踩
                    this.userDislikedStickers.push(id);

                    // 如果之前点过赞，则移除
                    const likeIndex = this.userLikedStickers.indexOf(id);
                    if (likeIndex !== -1) {
                        this.userLikedStickers.splice(likeIndex, 1);
                    }
                }

                // 保存状态
                this.saveUserInteractions();

                // 显示API返回的消息
                ElMessage({
                    message: response.message || '操作成功',
                    type: response.success ? 'success' : 'error',
                });
            } catch (error) {
                console.error('踩操作失败:', error);
                ElMessage.error('操作失败，请稍后重试');
            }
        },

        // 更新表情包描述
        async updateStickerDescription(id: number | string, description: string): Promise<void> {
            try {
                const sticker = await updateStickerDescription(id, description);
                if (sticker) {
                    sticker.description = description;
                    this.currentSticker = sticker;
                    ElMessage.success('更新成功');
                }
            } catch (error) {
                console.error('Failed to update sticker description:', error);
                ElMessage.error('更新失败');
            }
        },

        // 更新表情包标签
        async updateStickerTag(id: number | string, tags: string[]): Promise<void> {
            try {
                const sticker = await updateStickerTag(id, tags);
                if (sticker) {
                    // 更新本地状态
                    const index = this.stickers.findIndex(s => s.id === id);
                    if (index !== -1) {
                        this.stickers[index].tags = [...tags];
                    }

                    if (this.currentSticker?.id === id) {
                        this.currentSticker.tags = [...tags];
                    }
                    ElMessage.success('标签添加成功');
                }
            } catch (error) {
                console.error('Failed to update sticker tag:', error);
                ElMessage.error('标签添加失败');
            }
        },
        // 上传表情包
        async upload(file: File, content: string, tags: string[]): Promise<boolean> {
            this.uploading = true;
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('content', content);
                tags.forEach(tag => formData.append('tags', tag));

                const response = await uploadSticker(formData);

                ElMessage({
                    message: response.message || '上传成功',
                    type: response.success ? 'success' : 'error',
                });
                return response.success;
            } catch (error) {
                console.error('Failed to upload sticker:', error);
                ElMessage.error('上传失败');
                return false;
            } finally {
                this.uploading = false;
            }
        },
        // 删除表情包
        async deleteSticker(id: string): Promise<void> {
            try {
                const response = await deleteSticker(id);

                ElMessage({
                    message: response.message || '删除成功',
                    type: response.success ? 'success' : 'error',
                });
            } catch (error) {
                console.error('Failed to delete sticker:', error);
                ElMessage.error('删除失败');
            }
        },

        // 获取所有标签
        async fetchAllTags(): Promise<void> {
            try {
                // 解析
                const response = await getAllTags();
                // 取出 tag 并 按照 count 排序
                this.availableTags = response.map(tag => tag.tag).sort((a, b) => a.localeCompare(b));
                // this.availableTags = await getAllTags();
            } catch (error) {
                console.error('Failed to fetch tags:', error);
                ElMessage.error('获取标签失败');
            }
        },

        // 设置排序方式
        setSort(sort: SortType): void {
            if (this.sort !== sort) {
                this.sort = sort;
                this.fetchStickers(true);
            }
        },

        // 设置搜索关键字
        setSearch(search: string): void {
            this.search = search;
        },

        // 设置展示模式
        setDisplayMode(mode: DisplayMode): void {
            this.displayMode = mode;
        },

        // 设置选中标签
        setSelectedTags(tags: string[]): void {
            this.selectedTags = tags;
        },

        // 切换选中表情包
        toggleSelectedSticker(id: string): void {
            const index = this.selectedStickers.indexOf(id);
            if (index === -1) {
                this.selectedStickers.push(id);
            } else {
                this.selectedStickers.splice(index, 1);
            }
        },

        // 清空选中表情包
        clearSelectedStickers(): void {
            this.selectedStickers = [];
        },

        // 重置过滤条件
        resetFilters(): void {
            this.search = '';
            this.selectedTags = [];
            this.fetchStickers(true);
        },
    },
});