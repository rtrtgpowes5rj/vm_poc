import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, ChevronRight, Sparkles } from 'lucide-react'
import type { CampaignChapter } from '../types'

export function CampaignScreen({
  allowFreePhaseAccess,
  chapters,
  onSelect,
  onToggleFreePhaseAccess,
}: {
  allowFreePhaseAccess: boolean
  chapters: CampaignChapter[]
  onSelect: (missionId: string) => void
  onToggleFreePhaseAccess: () => void
}) {
  const completedCount = chapters.filter((chapter) => chapter.status === 'completed').length
  const nextChapter = chapters.find((chapter) => {
    if (!chapter.implemented) {
      return false
    }

    if (allowFreePhaseAccess) {
      return true
    }

    return chapter.status === 'active' || chapter.status === 'available'
  })

  return (
    <section className="campaign-layout campaign-layout--guided">
      <motion.div
        className="campaign-hero campaign-hero--guided"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="campaign-hero__grid">
          <div className="campaign-hero__copy">
            <div className="campaign-hero__topline">
              <p className="eyebrow">campaign / vm operating model</p>
              <div className="campaign-hero__controls">
                <button
                  type="button"
                  className={`campaign-access-toggle ${
                    allowFreePhaseAccess ? 'campaign-access-toggle--active' : ''
                  }`}
                  onClick={onToggleFreePhaseAccess}
                >
                  {allowFreePhaseAccess ? 'test access / all phases' : 'guided access'}
                </button>
                <span className="campaign-hero__status">4 modules live</span>
              </div>
            </div>

            <h2>Построить VM-процесс, который выдерживает реальную эксплуатацию, а не только отчёт.</h2>

            <p className="hero-copy">
              Кампания ведёт от первой договорённости о процессе до обработки сложных кейсов.
              Каждый модуль даёт короткий контекст, одно главное рабочее полотно и понятный
              вывод о том, что получилось у команды.
            </p>

            <div className="campaign-kpis">
              <div>
                <span>modules</span>
                <strong>{chapters.length}</strong>
              </div>
              <div>
                <span>stabilized</span>
                <strong>{completedCount}</strong>
              </div>
              <div>
                <span>logic</span>
                <strong>risk-led</strong>
              </div>
            </div>

            <div className="campaign-intent-grid">
              <div className="campaign-intent-card">
                <span>01</span>
                <strong>Сначала контекст</strong>
                <p>Каждый модуль начинается с короткой вводной, а не со стены из текста.</p>
              </div>
              <div className="campaign-intent-card">
                <span>02</span>
                <strong>Потом решение</strong>
                <p>На экране всегда одно главное действие, а не три равноправных колонки.</p>
              </div>
              <div className="campaign-intent-card">
                <span>03</span>
                <strong>Дальше последствия</strong>
                <p>После шага мы показываем не только score, а смысл принятого решения.</p>
              </div>
            </div>

            {nextChapter ? (
              <button
                type="button"
                className="primary-button primary-button--hero"
                onClick={() => onSelect(nextChapter.id)}
              >
                Продолжить с модуля: {nextChapter.title}
                <ArrowRight size={18} />
              </button>
            ) : null}
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

            <div className="campaign-orbit-points">
              {chapters.map((chapter, index) => (
                <div key={chapter.id} className={`campaign-orbit-point campaign-orbit-point--${chapter.status}`}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{chapter.title}</strong>
                  <small>{labelForMissionStatus(chapter.status, allowFreePhaseAccess)}</small>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="campaign-module-grid">
        {chapters.map((chapter, index) => {
          const isLocked = chapter.status === 'locked' && !allowFreePhaseAccess
          const isTestUnlocked = chapter.status === 'locked' && allowFreePhaseAccess

          return (
            <motion.button
              key={chapter.id}
              type="button"
              className={`campaign-module campaign-module--${chapter.status}`}
              onClick={() => {
                if (!isLocked) {
                  onSelect(chapter.id)
                }
              }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * index, duration: 0.42 }}
              disabled={isLocked}
            >
              <div className="campaign-module__topline">
                <span className="campaign-module__phase">{chapter.phase}</span>
                <span className="campaign-module__state">
                  {isLocked ? <AlertTriangle size={15} /> : <ChevronRight size={15} />}
                  {labelForMissionStatus(chapter.status, allowFreePhaseAccess)}
                </span>
              </div>

              <div className="campaign-module__body">
                <div>
                  <h3>{chapter.title}</h3>
                  <p>{chapter.summary}</p>
                </div>

                <div className="campaign-module__details">
                  <div>
                    <span>Что удерживаем в фокусе</span>
                    <strong>{chapter.stakes}</strong>
                  </div>
                  <div>
                    <span>Темп</span>
                    <strong>{chapter.estimated}</strong>
                  </div>
                </div>
              </div>

              <div className="campaign-module__footer">
                <span className="campaign-module__index">{String(index + 1).padStart(2, '0')}</span>
                <div className="campaign-module__cta">
                  {isLocked ? (
                    <>Откроется после предыдущего модуля</>
                  ) : isTestUnlocked ? (
                    <>
                      <Sparkles size={14} />
                      Доступно для тестового прохода
                    </>
                  ) : (
                    <>
                      Открыть модуль
                      <ArrowRight size={15} />
                    </>
                  )}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}

function labelForMissionStatus(
  status: CampaignChapter['status'],
  allowFreePhaseAccess: boolean,
) {
  if (status === 'completed') {
    return 'stabilized'
  }

  if (status === 'active') {
    return 'active'
  }

  if (status === 'available') {
    return 'ready'
  }

  if (allowFreePhaseAccess) {
    return 'test access'
  }

  return 'locked'
}
