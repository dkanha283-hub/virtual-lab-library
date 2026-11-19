import React from 'react'
import { cn } from '../../lib/utils'

/* 1. Button Component (44px touch-friendly heights, academic emerald/slate styling) */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      'bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white shadow-xs border border-teal-800/20',
    secondary:
      'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white shadow-xs border border-slate-900',
    outline:
      'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs',
    ghost:
      'bg-transparent hover:bg-slate-100 active:bg-slate-200/70 text-slate-700 border border-transparent',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white border border-rose-700 shadow-xs',
  }

  const sizes = {
    sm: 'min-h-[36px] px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5',
    md: 'min-h-[42px] px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl gap-2',
    lg: 'min-h-[48px] px-5 py-2.5 text-sm sm:text-base font-semibold rounded-xl gap-2.5',
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center transition-all cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/* 2. Card & Surface Container */
export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200/90 rounded-2xl shadow-2xs transition-all',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* 3. Badge Component (Monospace codes, status tags, difficulty pills) */
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'slate' | 'teal' | 'sky' | 'amber' | 'rose' | 'purple'
  mono?: boolean
}

export function Badge({
  tone = 'slate',
  mono = false,
  className,
  children,
  ...props
}: BadgeProps) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    teal: 'bg-teal-50 text-teal-800 border-teal-200',
    sky: 'bg-sky-50 text-sky-800 border-sky-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    rose: 'bg-rose-50 text-rose-800 border-rose-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border',
        tones[tone],
        mono && 'font-mono tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

/* 4. SectionHeader Component */
interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-1">
      <div>
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

/* 5. EmptyState Component */
interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 sm:p-10 text-center max-w-xl mx-auto my-4 space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center mx-auto">
        {icon}
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
        {description}
      </p>
      {action && <div className="pt-2 flex justify-center">{action}</div>}
    </div>
  )
}

/* 6. Form Input & Label Primitives */
export function FormField({
  label,
  hint,
  required,
  error,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-800">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-500">{hint}</p>}
      {error && <p className="text-[11px] font-medium text-rose-600">{error}</p>}
    </div>
  )
}

export const inputClassName =
  'w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition-all'
