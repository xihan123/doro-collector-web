// 表情包类型定义
export interface Sticker {
    id: string;
    description: string; // 表情包描述
    url: string; // 表情包图片URL
    // file_name: string; // 文件名
    file_size: number; // 文件大小 (字节)
    md5: string // 文件MD5
    width: number; // 宽度
    height: number; // 高度
    likes: number; // 喜欢数量
    dislikes: number; // 不喜欢数量
    tags: string[]; // 标签
    created_at: string; // 创建时间
    updated_at: string; // 更新时间
}

// 分页响应类型
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

// 排序方式
export type SortType = 'created_at' | 'likes' | 'dislikes';

// 表情包查询参数
export interface StickerQueryParams {
    page: number;
    size: number;
    sort_by: SortType;
    search?: string;
    tags?: string[] | string;
}

// 表情包上传参数
export interface StickerUploadParams {
    file: File;
}

// 展示模式
export type DisplayMode = 'grid' | 'list' | 'waterfall';

// 热门Tag [
//     {
//         "tag": "有文字",
//         "count": 5
//     },
//     {
//         "tag": "花花",
//         "count": 1
//     },
//     {
//         "tag": "表白",
//         "count": 0
//     },
//     {
//         "tag": "鄙视",
//         "count": 0
//     },
//     {
//         "tag": "生气",
//         "count": 0
//     }
// ]
export interface HotTag {
    tag: string;
    count: number;
}
