import { request } from './client'
import type { HotTag, PaginatedResponse, Sticker, StickerQueryParams } from '@/types/sticker'

/** 写操作的通用响应体 */
export interface MutationResult {
  success: boolean
  message: string
}

/** 返回更新后表情包的写操作响应(点赞/点踩/审核等) */
export type StickerMutationResult = MutationResult & {
  sticker: Sticker
  action?: string | null
}

export const getStickers = (params: StickerQueryParams): Promise<PaginatedResponse<Sticker>> => {
  if (params.tags && params.tags.length > 0) {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (key !== 'tags' && value !== undefined) {
        searchParams.append(key, String(value))
      }
    })

    params.tags.forEach(tag => {
      searchParams.append('tags', tag)
    })

    return request.get(`/stickers?${searchParams.toString()}`)
  }

  return request.get('/stickers', { params })
}

export const getStickerById = (id: string): Promise<Sticker> => {
  return request.get(`/stickers/${id}`)
}

export const likeSticker = (id: string | number): Promise<StickerMutationResult> => {
  return request.post(`/stickers/${id}/like`)
}

export const dislikeSticker = (id: string | number): Promise<StickerMutationResult> => {
  return request.post(`/stickers/${id}/dislike`)
}

export const uploadSticker = (data: FormData): Promise<MutationResult & { sticker: Sticker | null }> => {
  return request.post('/stickers/upload', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    // 上传含服务端 OCR 处理,单独放宽超时
    timeout: 60000,
  })
}

export const updateStickerDescription = (id: number | string, description: string): Promise<Sticker> => {
  return request.patch(`/stickers/${id}/description`, { description })
}

export const updateStickerTag = (id: number | string, tags: string[]): Promise<Sticker> => {
  return request.post(`/stickers/${id}/tags`, { tags })
}

export const getAllTags = (): Promise<HotTag[]> => {
  return request.get('/stickers/tags/popular/')
}

export const deleteSticker = (identifier: string | number, secretKey?: string): Promise<MutationResult> => {
  return request.delete(`/stickers/${identifier}`, {
    headers: secretKey ? { 'secret-key': secretKey } : undefined,
  })
}

export const batchDeleteStickers = (stickerIds: string[], secretKey?: string): Promise<MutationResult> => {
  return request.delete('/stickers/batch/', {
    headers: secretKey ? {
      'secret-key': secretKey,
      'Content-Type': 'application/json',
    } : { 'Content-Type': 'application/json' },
    data: { sticker_ids: stickerIds },
  })
}

export const getPendingReviews = (params: { page: number; size: number }, secretKey: string): Promise<PaginatedResponse<Sticker>> => {
  return request.get('/stickers/review/pending/', {
    params,
    headers: { 'secret-key': secretKey },
  })
}

export const approveSticker = (id: string | number, secretKey: string): Promise<StickerMutationResult> => {
  return request.post(`/stickers/review/${id}/approve`, undefined, {
    headers: { 'secret-key': secretKey },
  })
}

export const rejectSticker = (id: string | number, secretKey: string, reason?: string): Promise<StickerMutationResult> => {
  return request.post(`/stickers/review/${id}/reject`, { reason }, {
    headers: { 'secret-key': secretKey },
  })
}
