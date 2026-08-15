export interface Sticker {
  id: string
  description: string
  url: string
  file_size: number
  md5: string
  width: number
  height: number
  likes: number
  dislikes: number
  tags: string[]
  created_at: string
  updated_at: string
  review_status?: 'approved' | 'pending' | 'rejected'
  review_reason?: string | null
  reviewed_at?: number | null
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

export type SortType = 'created_at' | 'likes' | 'dislikes'

export interface StickerQueryParams {
  page: number
  size: number
  sort_by: SortType
  search?: string
  tags?: string[]
}

export type DisplayMode = 'grid' | 'list' | 'waterfall'

export interface HotTag {
  tag: string
  count: number
}
