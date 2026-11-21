import { useState } from 'react'
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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  if (!htmlCode || !htmlCode.trim()) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-xs text-slate-400">
        No custom HTML code provided for this {kind.toLowerCase()}.
      </div>
    )
  }

  return (
    <div
      className={cn(
        'bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col transition-all',
        isFullscreen ? 'fixed inset-3 z-50' : ''
      )}
    >
      {/* Top Toolbar */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
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
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold cursor-pointer"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" /> Exit Fullscreen
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" /> Fullscreen
              </>
            )}
          </button>
        </div>
      </div>

      {/* Strictly Sandboxed iframe: allow-scripts ONLY (blocks access to parent localStorage, cookies & DOM) */}
      <iframe
        key={reloadKey}
        title={title}
        srcDoc={htmlCode}
        sandbox="allow-scripts"
        referrerPolicy="no-referrer"
        className={cn(
          'w-full border-0 bg-slate-950',
          isFullscreen ? 'flex-1 h-full' : 'h-[480px] sm:h-[560px]'
        )}
      />
    </div>
  )
}
