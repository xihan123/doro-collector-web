// 格式化文件大小
import {toNumber} from "lodash-es";

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';

    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

// 格式化日期
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
};

// 格式化时间戳为相对时间，如“5分钟前”
export const formatRelativeTime = (timestamp: string): string => {
    const date = new Date(toNumber(timestamp) * 1000);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return `${interval} 年前`;

    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return `${interval} 个月前`;

    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval} 天前`;

    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `${interval} 小时前`;

    interval = Math.floor(seconds / 60);
    if (interval > 1) return `${interval} 分钟前`;

    return '刚刚';
};
