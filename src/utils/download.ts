import JSZip from 'jszip';
import {saveAs} from 'file-saver';
import type {Sticker} from '@/types/sticker';

// 获取文件扩展名
const getFileExtension = (fileName: string): string => {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex !== -1 && lastDotIndex < fileName.length - 1
        ? fileName.slice(lastDotIndex + 1)
        : 'png';
};

// 下载单个表情包
export const downloadSingleSticker = async (sticker: Sticker): Promise<void> => {
    try {
        // 获取文件扩展名
        const extension = getFileExtension(sticker.url);
        // 获取MD5值
        const md5 = sticker.md5;

        // 方案1: 优先通过MD5值+扩展名路径下载
        if (md5 && extension) {
            try {
                const directUrl = `/images/${md5}.${extension}`;
                const response = await fetch(directUrl);

                // 如果请求成功
                if (response.ok) {
                    const blob = await response.blob();
                    // 确认blob不为空
                    if (blob.size > 0) {
                        saveAs(blob, sticker.md5);
                        return;
                    }
                }
            } catch (error) {
                console.warn('Direct MD5 download failed, trying proxy:', error);
            }
        }

        // 方案2: 如果MD5下载失败或不可用，使用代理下载
        const proxyUrl = `/v2/proxy-image?url=${encodeURIComponent(sticker.url)}`;
        const proxyResponse = await fetch(proxyUrl);

        if (!proxyResponse.ok) {
            throw new Error(`代理下载失败: ${proxyResponse.status}`);
        }

        const blob = await proxyResponse.blob();
        saveAs(blob, sticker.md5);

    } catch (error) {
        console.error('Failed to download sticker:', error);
        throw new Error('下载表情包失败');
    }
};

// 批量下载表情包
export const downloadSelectedStickers = async (stickers: Sticker[]): Promise<void> => {
    if (stickers.length === 0) return;

    try {
        const zip = new JSZip();
        const promises = stickers.map(async sticker => {
            try {
                // 获取文件扩展名
                const extension = getFileExtension(sticker.url);
                // 获取MD5值
                const md5 = sticker.md5;

                // 尝试直接通过MD5值下载
                if (md5 && extension) {
                    try {
                        const directUrl = `/images/${md5}.${extension}`;
                        const response = await fetch(directUrl);

                        if (response.ok) {
                            const blob = await response.blob();
                            if (blob.size > 0) {
                                zip.file(sticker.md5 + '.' + extension, blob);
                                return;
                            }
                        }
                    } catch (error) {
                        console.warn(`MD5 download failed for ${sticker.id}:`, error);
                    }
                }

                // 回退到代理下载
                const proxyUrl = `/v2/proxy-image?url=${encodeURIComponent(sticker.url)}`;
                const proxyResponse = await fetch(proxyUrl);

                if (proxyResponse.ok) {
                    const blob = await proxyResponse.blob();
                    zip.file(sticker.md5, blob);
                } else {
                    console.error(`Failed to download sticker ${sticker.id} via proxy`);
                }
            } catch (error) {
                console.error(`Failed to download sticker ${sticker.id}:`, error);
            }
        });

        await Promise.all(promises);

        const zipBlob = await zip.generateAsync({type: 'blob'});
        saveAs(zipBlob, `doro-stickers-${Date.now()}.zip`);
    } catch (error) {
        console.error('Failed to create zip file:', error);
        throw new Error('批量下载失败');
    }
};