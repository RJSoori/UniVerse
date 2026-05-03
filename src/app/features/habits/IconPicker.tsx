import { SVGProps } from 'react'

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: string | number
}

export const ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  activity: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  heart: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  book: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  coffee: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  ),
  dumbbell: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M14 4l10 10M4 14l10 10M7 8l2 2m10 10l2 2" />
    </svg>
  ),
  running: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="16" cy="3" r="2" />
      <path d="M17.5 13.5L14 20M6.5 13.5h-1V10a3 3 0 0 1 3-3h1" />
      <path d="M2 13.5h8" />
      <path d="M17 13.5l2-2.5m-7-7l4 2m-2-4l-3.5 2" />
    </svg>
  ),
  brain: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M9.5 3.5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v.5M9 9a1 1 0 0 1 0-2h6a1 1 0 0 1 0 2" />
      <path d="M8 13a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2" />
      <path d="M6 17a2 2 0 0 0-2 2c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2c0-1.1-.9-2-2-2" />
    </svg>
  ),
  moon: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  apple: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 2c-1.5 0-3 1-3 3v1H6c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-3V5c0-2-1.5-3-3-3z" />
      <path d="M9 5h6M12 3v2" />
    </svg>
  ),
  water: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.32 0z" />
    </svg>
  ),
  music: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M9 18V5m3 0v13M5 5h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
    </svg>
  ),
  code: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <polyline points="16 8 8 12 16 16" />
      <polyline points="8 8 16 12 8 16" />
    </svg>
  ),
  bike: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="18" cy="18" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M12 13v-2M9 5h6M12 13h0" />
    </svg>
  ),
  language: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="m5 8l4 6m0 0l4-6m-4 6v6m7-12h-2a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h2" />
    </svg>
  ),
  soccer: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2v20M2 12h20M5.64 5.64l14.14 14.14M5.64 18.36L19.78 4.22" />
    </svg>
  ),
  meditation: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="5" r="2" />
      <path d="M12 11c-2.21 0-4 1.79-4 4v4c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-4c0-2.21-1.79-4-4-4z" />
      <path d="M8 15l-2 3M16 15l2 3" />
    </svg>
  ),
  lightbulb: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M9 18h6M12 2a6 6 0 0 0-6 6c0 2 1 4 3 5.5V20a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-6.5c2-1.5 3-3.5 3-5.5a6 6 0 0 0-6-6z" />
    </svg>
  ),
  swimming: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M3 7h18M6 11l2 2 4-4M14 11l2 2M4 15h16M5 18h14a2 2 0 0 1 2 2v2H3v-2a2 2 0 0 1 2-2z" />
    </svg>
  ),
  paintbrush: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  camera: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  pen: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L21 3z" />
    </svg>
  ),
  guitar: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="9" cy="9" r="4" />
      <path d="M9 13v8M11 9h2a4 4 0 0 1 0 8h-2M9 5a4 4 0 0 0 0 8" />
    </svg>
  ),
  gamepad2: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <line x1="6" y1="12" x2="12" y2="12" />
      <line x1="9" y1="9" x2="9" y2="15" />
      <circle cx="17" cy="10" r="1" />
      <circle cx="17" cy="16" r="1" />
    </svg>
  ),
  briefcase: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 5V3a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  ),
  users: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  mic: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 1a3 3 0 0 0-3 3v12a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  zap: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  star: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <polygon points="12 2 15.09 10.26 24 10.27 17.18 16.70 20.27 24.97 12 18.54 3.73 24.97 6.82 16.70 0 10.27 8.91 10.26 12 2" />
    </svg>
  ),
  mountain: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M8 3l4 8 5-5 5 15H2L8 3z" />
    </svg>
  ),
  tree: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <line x1="12" y1="2" x2="12" y2="20" />
      <path d="M6 9h12a2 2 0 0 1 0 4H6a2 2 0 0 1 0-4z" />
      <path d="M8 14h8a2 2 0 0 1 0 4H8a2 2 0 0 1 0-4z" />
    </svg>
  ),
  compass: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  book_open: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  rocket: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M4 17v6h16v-6M12 2l3 7H9l3-7z" />
      <circle cx="5" cy="17" r="2" />
      <circle cx="19" cy="17" r="2" />
    </svg>
  ),
  award: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="8" r="7" />
      <polyline points="8 14 12 17 16 14" />
      <line x1="12" y1="17" x2="12" y2="23" />
    </svg>
  ),
  clock: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  droplet: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 1c-6.33 8.51-9 11.85-9 15.5 0 4.41 3.86 8 9 8s9-3.59 9-8c0-3.65-2.67-6.99-9-15.5z" />
    </svg>
  ),
}

const ICON_COLORS: Record<string, string> = {
  activity: '#3b82f6',
  heart: '#ef4444',
  book: '#8b5cf6',
  coffee: '#92400e',
  dumbbell: '#dc2626',
  running: '#06b6d4',
  brain: '#a855f7',
  moon: '#1f2937',
  apple: '#dc2626',
  water: '#0ea5e9',
  music: '#ec4899',
  code: '#14b8a6',
  bike: '#f59e0b',
  language: '#6366f1',
  soccer: '#22c55e',
  meditation: '#f59e0b',
  lightbulb: '#fbbf24',
  swimming: '#06b6d4',
  paintbrush: '#ec4899',
  camera: '#6f42c1',
  pen: '#6b7280',
  guitar: '#d97706',
  gamepad2: '#8b5cf6',
  briefcase: '#1f2937',
  users: '#0891b2',
  mic: '#dc2626',
  zap: '#eab308',
  star: '#fbbf24',
  mountain: '#92400e',
  tree: '#22c55e',
  compass: '#0ea5e9',
  book_open: '#7c3aed',
  rocket: '#f43f5e',
  award: '#fbbf24',
  clock: '#06b6d4',
  droplet: '#0ea5e9',
}

interface IconPickerProps {
  selectedIconId: string
  onSelect: (iconId: string) => void
}

export function IconPicker({ selectedIconId, onSelect }: IconPickerProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {Object.keys(ICON_MAP).map((iconId) => {
        const IconComponent = ICON_MAP[iconId]
        const iconColor = ICON_COLORS[iconId] || '#3b82f6'
        return (
          <button
            key={iconId}
            onClick={() => onSelect(iconId)}
            className={`p-3 rounded-lg border-2 transition flex items-center justify-center ${
              selectedIconId === iconId
                ? 'border-primary bg-primary/10'
                : 'border-muted hover:border-muted-foreground'
            }`}
            title={iconId}
            style={{ color: iconColor }}
          >
            <IconComponent className="h-6 w-6" />
          </button>
        )
      })}
    </div>
  )
}

export function IconBadge({
  iconId,
  size = 'md',
  color = '#3b82f6',
}: {
  iconId?: string
  size?: 'sm' | 'md' | 'lg'
  color?: string
}) {
  const sizeMap = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  }
  const iconSizeMap = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-6 w-6',
  }
  const sizeClass = sizeMap[size]
  const iconSizeClass = iconSizeMap[size]
  const IconComponent = iconId && ICON_MAP[iconId] ? ICON_MAP[iconId] : null

  // Convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const bgColor = hexToRgba(color, 0.2)

  return (
    <div
      className={`${sizeClass} rounded-lg flex items-center justify-center flex-shrink-0`}
      style={{ 
        backgroundColor: bgColor,
        position: 'relative',
      }}
    >
      {IconComponent ? (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <IconComponent 
            className={iconSizeClass} 
            style={{ 
              color: '#000000',
              stroke: '#000000',
              fill: '#000000',
            }} 
          />
        </div>
      ) : (
        <div className="text-xs font-bold" style={{ color: '#000000' }}>
          H
        </div>
      )}
    </div>
  )
}
