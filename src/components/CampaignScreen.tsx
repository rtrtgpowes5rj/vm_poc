import { motion } from 'framer-motion'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import type { CampaignChapter } from '../types'

export function CampaignScreen({
  chapters,
  onSelect,
}: {
  chapters: CampaignChapter[]
  onSelect: (missionId: string) => void
}) {
  const completedCount = chapters.filter((chapter) => chapter.status === 'completed').length

  return (
    <section className="campaign-layout">
      <motion.div
        className="campaign-hero"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="campaign-hero__grid">
          <div className="campaign-hero__copy">
            <div className="campaign-hero__topline">
              <p className="eyebrow">campaign / vm maturity</p>
              <span className="campaign-hero__status">live scenario</span>
            </div>

            <h2>
              От хаотичного реагирования на CVE к зрелому VM-процессу, где решения
              проходят проверку риском, операционной реальностью и разговором с ИТ.
            </h2>

            <p className="hero-copy">
              Кампания начинается не со сканера, а с методики: сначала фиксируем
              недопустимые события, затем строим контур активов, после этого
              приоритизируем backlog и только потом идём в устранение и контроль.
            </p>

            <div className="campaign-kpis">
              <div>
                <span>phases</span>
                <strong>{chapters.length}</strong>
              </div>
              <div>
                <span>completed</span>
                <strong>{completedCount}</strong>
              </div>
              <div>
                <span>mode</span>
                <strong>risk-led</strong>
              </div>
            </div>

            <div className="campaign-ribbon">
              <div>
                <span>01</span>
                недопустимые события, роли, артефакты и SLA
              </div>
              <div>
                <span>02</span>
                инвентаризация активов и отдельные правила для legacy, mobile и virtual
              </div>
              <div>
                <span>03</span>
                risk-based приоритизация вместо CVSS-only
              </div>
              <div>
                <span>04</span>
                устранение, компенсирующие меры, контроль и пересмотр SLA
              </div>
            </div>
          </div>

          <motion.div
            className="campaign-visual"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12, duration: 0.8, ease: 'easeOut' }}
          >
            <div className="campaign-visual__core" />
            <div className="campaign-visual__halo" />
            <div className="campaign-visual__ring campaign-visual__ring--outer" />
            <div className="campaign-visual__ring campaign-visual__ring--inner" />
            <div className="campaign-visual__beam campaign-visual__beam--one" />
            <div className="campaign-visual__beam campaign-visual__beam--two" />

            <div className="campaign-visual__legend">
              {chapters.map((chapter, index) => (
                <div key={chapter.id} className={`campaign-node campaign-node--${chapter.status}`}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{chapter.title}</strong>
                  <small>{labelForMissionStatus(chapter.status)}</small>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="campaign-rail">
        {chapters.map((chapter, index) => {
          const isLocked = chapter.status === 'locked'

          return (
            <motion.button
              key={chapter.id}
              type="button"
              className={`mission-tile mission-tile--${chapter.status}`}
              onClick={() => {
                if (!isLocked) {
                  onSelect(chapter.id)
                }
              }}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.45 }}
              disabled={isLocked}
            >
              <div className="mission-tile__header">
                <div>
                  <p>{chapter.phase}</p>
                  <h3>{chapter.title}</h3>
                </div>

                <span className="mission-state">
                  {isLocked ? <AlertTriangle size={16} /> : <ChevronRight size={16} />}
                  {labelForMissionStatus(chapter.status)}
                </span>
              </div>

              <p className="mission-summary">{chapter.summary}</p>

              <div className="mission-meta">
                <span>{chapter.estimated}</span>
                <span>{chapter.implemented ? 'играбельно' : 'в разработке'}</span>
              </div>

              <p className="mission-stakes">{chapter.stakes}</p>

              {isLocked ? (
                <div className="mission-lockline">
                  <AlertTriangle size={14} />
                  Откроется после завершения предыдущей фазы
                </div>
              ) : null}
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}

function labelForMissionStatus(status: CampaignChapter['status']) {
  if (status === 'completed') {
    return 'stabilized'
  }

  if (status === 'active') {
    return 'active phase'
  }

  if (status === 'available') {
    return 'available'
  }

  return 'locked'
}
