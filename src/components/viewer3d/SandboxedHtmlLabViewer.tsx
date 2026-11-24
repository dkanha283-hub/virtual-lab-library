import { useEffect, useRef, useState } from 'react'
import { Maximize2, Minimize2, RotateCcw, ShieldCheck, Code2 } from 'lucide-react'
import { cn } from '../../lib/utils'

interface Props {
  htmlCode: string
  title: string
  kind?: '3D Model' | 'Virtual Lab Simulation'
}

export function SandboxedHtmlLabViewer({
  htmlCode,
  title,
  kind = '3D Model',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const enterFullscreen = async () => {
    setIsFullscreen(true)
    const el = containerRef.current as (HTMLDivElement & {
      webkitRequestFullscreen?: () => Promise<void> | void
    }) | null
    try {
      if (el?.requestFullscreen) {
        await el.requestFullscreen()
      } else if (el?.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen()
      }
    } catch {
      // Fallback to edge-to-edge fixed 100dvh overlay (e.g., iOS Safari)
    }
  }

  const exitFullscreen = async () => {
    setIsFullscreen(false)
    const doc = document as Document & {
      webkitFullscreenElement?: Element | null
      webkitExitFullscreen?: () => Promise<void> | void
    }
    try {
      if (doc.fullscreenElement && doc.exitFullscreen) {
        await doc.exitFullscreen()
      } else if (doc.webkitFullscreenElement && doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen()
      }
    } catch {
      // Ignore if already exited
    }
  }

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
  }

  useEffect(() => {
    const handleFsChange = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element | null }
      if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
        setIsFullscreen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen()
      }
    }

    document.addEventListener('fullscreenchange', handleFsChange)
    document.addEventListener('webkitfullscreenchange', handleFsChange)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange)
      document.removeEventListener('webkitfullscreenchange', handleFsChange)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen])

  useEffect(() => {
    if (!isFullscreen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [isFullscreen])

  if (!htmlCode || !htmlCode.trim()) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-xs text-slate-400">
        No custom HTML code provided for this {kind.toLowerCase()}.
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'bg-slate-950 overflow-hidden flex flex-col transition-all relative',
        isFullscreen
          ? 'fixed inset-0 z-[9999] w-screen h-[100dvh] rounded-none border-0 shadow-none'
          : 'border border-slate-800 rounded-2xl shadow-xl'
      )}
    >
      {/* Top Toolbar: hidden in fullscreen mode */}
      {!isFullscreen && (
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-bold shrink-0">
              <Code2 className="w-3.5 h-3.5" />
              HTML {kind}
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-white truncate">{title}</h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-700 text-[10px] font-semibold text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              Sandboxed Isolated Runtime
            </span>

            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              title="Reload HTML Lab"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reload
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" /> Fullscreen
            </button>
          </div>
        </div>
      )}

      {/* Compact floating Exit button in fullscreen mode */}
      {isFullscreen && (
        <button
          type="button"
          onClick={exitFullscreen}
          className="fixed bottom-3 left-3 z-[10000] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white border border-slate-700/80 backdrop-blur-sm text-xs font-semibold shadow-lg opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
          title="Exit Fullscreen (Esc)"
        >
          <Minimize2 className="w-3.5 h-3.5" /> Exit
        </button>
      )}

      {/* Strictly Sandboxed iframe: allow-scripts ONLY */}
      <iframe
        key={reloadKey}
        title={title}
        srcDoc={htmlCode}
        sandbox="allow-scripts"
        allowFullScreen
        referrerPolicy="no-referrer"
        className={cn(
          'w-full border-0 bg-slate-950',
          isFullscreen ? 'flex-1 h-full' : 'h-[480px] sm:h-[560px]'
        )}
      />
    </div>
  )
}
