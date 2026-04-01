import { motion } from 'framer-motion'
import { Check, CheckCircle2, ChevronDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { MissionReviewItem, ReviewStatus } from '../lib/mission'
import {
  labelForDecision,
  labelForFactor,
  labelForMethod,
  labelForRole,
  labelForScanStrategy,
  labelForSla,
  labelForVerification,
  labelForWindow,
} from '../lib/mission'
import type {
  AssetRole,
  ChangeWindow,
  PriorityDecision,
  PriorityFactor,
  ResponseCase,
  ScanStrategy,
  SlaTier,
  Stakeholder,
  TaskMethod,
  VerificationStep,
} from '../types'

export function Panel({
  children,
  icon: Icon,
  title,
}: {
  children: ReactNode
  icon: LucideIcon
  title: string
}) {
  return (
    <motion.section
      className="panel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="panel-head">
        <div className="panel-title">
          <Icon size={16} />
          <h3>{title}</h3>
        </div>
      </div>
      {children}
    </motion.section>
  )
}

export function MetricRail({
  label,
  progress,
  tone,
  value,
}: {
  label: string
  progress: number
  tone: 'neutral' | 'good' | 'warning' | 'critical'
  value: string
}) {
  const safeProgress = Math.min(Math.max(progress, 0), 100)

  return (
    <div className={`metric-rail metric-rail--${tone}`}>
      <div className="metric-rail__label">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="metric-rail__track">
        <motion.div
          initial={{ width: 0, opacity: 0.65 }}
          animate={{ width: `${safeProgress}%`, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}

export function StakeholderCard({ stakeholder }: { stakeholder: Stakeholder }) {
  return (
    <motion.div
      className={`stakeholder-card stakeholder-card--${stakeholder.stance}`}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.18 }}
    >
      <div className="stakeholder-card__header">
        <div>
          <strong>{stakeholder.name}</strong>
          <span>{stakeholder.role}</span>
        </div>
        <span className="inline-tag">{labelForStance(stakeholder.stance)}</span>
      </div>
      <p>{stakeholder.quote}</p>
      <small>{stakeholder.pressure}</small>
    </motion.div>
  )
}

export function ReviewBadge({ status }: { status: ReviewStatus }) {
  return <span className={`status-badge status-badge--${status}`}>{labelForStatus(status)}</span>
}

export function ReviewItemCard({ item }: { item: MissionReviewItem }) {
  return (
    <motion.div
      className={`review-card review-card--${item.status}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26 }}
    >
      <div className="review-card__head">
        <div>
          <strong>{item.title}</strong>
          <span>{item.section}</span>
        </div>
        <div className="review-card__meta">
          <span className={`inline-tag inline-tag--${item.importance}`}>
            {item.importance === 'critical' ? 'critical' : 'important'}
          </span>
          <ReviewBadge status={item.status} />
        </div>
      </div>
      <p>{item.feedback}</p>
    </motion.div>
  )
}

export function ChoiceButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      className={`choice-button ${active ? 'choice-button--active' : ''}`}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.16 }}
    >
      {children}
    </motion.button>
  )
}

export function InlineOption({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      className={`inline-option ${active ? 'inline-option--active' : ''}`}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.16 }}
    >
      {children}
    </motion.button>
  )
}

export function CompletedObjective({
  caption,
  title,
}: {
  caption: string
  title: string
}) {
  return (
    <motion.div
      className="completed-objective"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
    >
      <CheckCircle2 size={16} />
      <div>
        <strong>{title}</strong>
        <p>{caption}</p>
      </div>
    </motion.div>
  )
}

export type ControlSelectOption<T extends string> = {
  value: T
  label: string
  meta?: string
}

export function ControlSelect<T extends string>({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: T | null
  options: Array<ControlSelectOption<T>>
  placeholder: string
  onChange: (value: T) => void
}) {
  const [open, setOpen] = useState(false)
  const shellRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!shellRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    return () => window.removeEventListener('mousedown', handlePointerDown)
  }, [])

  const selectedOption = options.find((option) => option.value === value) ?? null

  return (
    <div ref={shellRef} className={`control-select ${open ? 'control-select--open' : ''}`}>
      <motion.button
        type="button"
        className={`control-select__trigger ${
          selectedOption ? 'control-select__trigger--selected' : ''
        }`}
        onClick={() => setOpen((current) => !current)}
        whileTap={{ scale: 0.99 }}
      >
        <span className="control-select__copy">
          <span className="control-select__value">{selectedOption?.label ?? placeholder}</span>
          {selectedOption?.meta ? (
            <small className="control-select__meta">{selectedOption.meta}</small>
          ) : null}
        </span>
        <ChevronDown size={16} />
      </motion.button>

      {open ? (
        <motion.div
          className="control-select__menu"
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.14 }}
        >
          {options.map((option) => {
            const active = option.value === value

            return (
              <motion.button
                key={option.value}
                type="button"
                className={`control-select__option ${
                  active ? 'control-select__option--active' : ''
                }`}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.99 }}
              >
                <span className="control-select__copy">
                  <span className="control-select__value">{option.label}</span>
                  {option.meta ? (
                    <small className="control-select__meta">{option.meta}</small>
                  ) : null}
                </span>
                {active ? <Check size={16} /> : null}
              </motion.button>
            )
          })}
        </motion.div>
      ) : null}
    </div>
  )
}

export function labelForPriorityDecision(decision: PriorityDecision) {
  return labelForDecision(decision)
}

export function labelForPriorityFactor(factor: PriorityFactor) {
  return labelForFactor(factor)
}

export function labelForTaskMethod(method: TaskMethod) {
  return labelForMethod(method as ResponseCase['correctMethod'])
}

export function labelForAssetRoleUi(role: AssetRole) {
  return labelForRole(role)
}

export function labelForScanStrategyUi(strategy: ScanStrategy) {
  return labelForScanStrategy(strategy)
}

export function labelForSlaUi(sla: SlaTier) {
  return labelForSla(sla)
}

export function labelForVerificationUi(step: VerificationStep) {
  return labelForVerification(step)
}

export function labelForWindowUi(window: ChangeWindow) {
  return labelForWindow(window)
}

function labelForStance(stance: Stakeholder['stance']) {
  if (stance === 'ally') {
    return 'союзник'
  }

  if (stance === 'resistant') {
    return 'сопротивление'
  }

  return 'нейтрально'
}

function labelForStatus(status: ReviewStatus) {
  switch (status) {
    case 'correct':
      return 'корректно'
    case 'partial':
      return 'частично'
    case 'wrong':
      return 'ошибка'
    default:
      return 'не заполнено'
  }
}
