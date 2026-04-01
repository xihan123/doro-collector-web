export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

export const formatRelativeTime = (timestamp: string): string => {
  const date = new Date(Number(timestamp) * 1000)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 0) return '刚刚'

  const intervals = [
    { seconds: 31536000, unit: '年' },
    { seconds: 2592000, unit: '个月' },
    { seconds: 86400, unit: '天' },
    { seconds: 3600, unit: '小时' },
    { seconds: 60, unit: '分钟' },
  ]

  for (const { seconds: s, unit } of intervals) {
    const interval = Math.floor(seconds / s)
    if (interval >= 1) return `${interval} ${unit}前`
  }

  return '刚刚'
}
