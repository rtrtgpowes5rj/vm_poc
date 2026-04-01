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
  return (
    <section className="campaign-layout">
      <motion.div
        className="campaign-hero"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <p className="eyebrow">campaign / vm maturity</p>
        <h2>
          От хаотичного реагирования на CVE к зрелому процессу, где решения
          принимаются по методике и выдерживают разговор с ИТ и бизнесом.
        </h2>
        <p className="hero-copy">
          Кампания больше не начинается со сканера. Сначала строим контур
          процесса, затем наводим порядок в активах, после этого разбираем
          приоритеты и только потом переходим к устранению и контролю.
        </p>

        <div className="campaign-ribbon">
          <div>
            <span>01</span>
            недопустимые события, роли, артефакты и SLA
          </div>
          <div>
            <span>02</span>
            инвентаризация активов и отдельные правила для legacy/mobile/virtual
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
    return 'пройдено'
  }

  if (status === 'active') {
    return 'текущая фаза'
  }

  if (status === 'available') {
    return 'доступно'
  }

  return 'заблокировано'
}
