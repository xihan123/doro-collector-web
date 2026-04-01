import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { Sticker } from '@/types/sticker'

const getFileExtension = (url: string): string => {
  const i = url.lastIndexOf('.')
  return i !== -1 && i < url.length - 1 ? url.slice(i + 1) : 'png'
}

const fetchStickerBlob = async (sticker: Sticker): Promise<Blob> => {
  const ext = getFileExtension(sticker.url)
  const md5 = sticker.md5

  if (md5 && ext) {
    try {
      const res = await fetch(`/images/${md5}.${ext}`)
      if (res.ok) {
        const blob = await res.blob()
        if (blob.size > 0) return blob
      }
    } catch {
      // fall through to proxy
    }
  }

  const res = await fetch(`/v2/proxy-image?url=${encodeURIComponent(sticker.url)}`)
  if (!res.ok) throw new Error(`下载失败: ${res.status}`)
  return res.blob()
}

export const downloadSingleSticker = async (sticker: Sticker): Promise<void> => {
  const blob = await fetchStickerBlob(sticker)
  saveAs(blob, `${sticker.md5}.${getFileExtension(sticker.url)}`)
}

export const downloadSelectedStickers = async (stickers: Sticker[]): Promise<void> => {
  if (stickers.length === 0) return

  const zip = new JSZip()

  await Promise.all(
    stickers.map(async (sticker) => {
      try {
        const blob = await fetchStickerBlob(sticker)
        zip.file(`${sticker.md5}.${getFileExtension(sticker.url)}`, blob)
      } catch {
        // 单个失败不影响整体
      }
    }),
  )

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  saveAs(zipBlob, `doro-stickers-${Date.now()}.zip`)
}
