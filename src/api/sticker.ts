import {request} from './request';
import {HotTag, PaginatedResponse, Sticker, StickerQueryParams} from '@/types/sticker';

// 获取表情包列表
export const getStickers = (params: StickerQueryParams): Promise<PaginatedResponse<Sticker>> => {
    // 特殊处理 tags 数组，确保正确发送多个相同参数名的请求
    if (params.tags && params.tags.length > 0) {
        // 创建 URLSearchParams 对象来正确构建查询参数
        const searchParams = new URLSearchParams();

        // 添加非标签参数
        Object.entries(params).forEach(([key, value]) => {
            if (key !== 'tags' && value !== undefined) {
                searchParams.append(key, String(value));
            }
        });

        // 添加每个标签作为单独的参数
        typeof params.tags !== "string" ? params.tags?.forEach(tag => {
            searchParams.append('tags', tag);
        }) : params;

        // 构建请求URL
        return request.get(`/stickers?${searchParams.toString()}`);
    }


    return request.get('/stickers', {params});
};

// 获取表情包详情
export const getStickerById = (id: string): Promise<Sticker> => {
    return request.get(`/stickers/${id}`);
};

// 喜欢表情包
export const likeSticker = (id: string | number): Promise<{
    success: boolean;
    message: string;
    sticker: Sticker;
    action: string | null;
}> => {
    return request.post(`/stickers/${id}/like`);
};

// 不喜欢表情包
export const dislikeSticker = (id: string | number): Promise<{
    success: boolean;
    message: string;
    sticker: Sticker;
    action: string | null;
}> => {
    return request.post(`/stickers/${id}/dislike`);
};

// 上传表情包
export const uploadSticker = (data: FormData): Promise<Sticker> => {
    return request.post('/stickers/upload', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

// 更新描述
export const updateStickerDescription = (id: number | string, description: string): Promise<Sticker> => {
    return request.patch(`/stickers/${id}/description`, {description: description});
};

// 添加标签
export const updateStickerTag = (id: number | string, tags: string[]): Promise<Sticker> => {
    return request.post(`/stickers/${id}/tags`, {tags: tags});
};

// 获取热门标签
export const getAllTags = (): Promise<HotTag[]> => {
    return request.get('/stickers/tags/popular/');
};

// 下载表情包图片
export const downloadStickerImage = async (url: string): Promise<Blob> => {
    const response = await fetch(url, {mode: 'cors'});
    return await response.blob();
};