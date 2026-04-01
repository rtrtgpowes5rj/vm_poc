import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Orbit, Radar, ShieldCheck, Users2 } from 'lucide-react'
import type { MissionObjective } from '../lib/mission'
import type { CampaignChapter, MissionState } from '../types'

export function BriefScreen({
  chapter,
  mission,
  objectives,
  onBack,
  onStart,
}: {
  chapter: CampaignChapter
  mission: MissionState
  objectives: MissionObjective[]
  onBack: () => void
  onStart: () => void
}) {
  return (
    <section className="brief-layout">
      <div className="brief-head">
        <button type="button" className="ghost-button" onClick={onBack}>
          <ArrowLeft size={16} />
          Назад к кампании
        </button>

        <div className="brief-tagline">
          <span>{chapter.phase}</span>
          <span>{chapter.estimated}</span>
          <span>{mission.code}</span>
        </div>
      </div>

      <div className="brief-grid">
        <section className="brief-copy brief-copy--poster">
          <div className="brief-poster">
            <div className="brief-poster__copy">
              <p className="eyebrow">mission briefing</p>
              <h2>{chapter.title}</h2>
              <p className="brief-text">{mission.narrative}</p>

              <div className="brief-poster__stats">
                <div>
                  <span>environment</span>
                  <strong>fintech / payments</strong>
                </div>
                <div>
                  <span>phase code</span>
                  <strong>{mission.code}</strong>
                </div>
                <div>
                  <span>focus</span>
                  <strong>method first</strong>
                </div>
              </div>
            </div>

            <motion.div
              className="brief-stage"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.65 }}
            >
              <div className="brief-stage__orb" />
              <div className="brief-stage__ring brief-stage__ring--one" />
              <div className="brief-stage__ring brief-stage__ring--two" />
              <div className="brief-stage__card brief-stage__card--top">
                <Radar size={16} />
                <div>
                  <strong>Контур атаки</strong>
                  <span>entry → key → target</span>
                </div>
              </div>
              <div className="brief-stage__card brief-stage__card--mid">
                <ShieldCheck size={16} />
                <div>
                  <strong>SLA и роли</strong>
                  <span>RACI + обязательные артефакты</span>
                </div>
              </div>
              <div className="brief-stage__card brief-stage__card--bottom">
                <Orbit size={16} />
                <div>
                  <strong>Методика</strong>
                  <span>не от сканера, а от риска бизнеса</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="brief-block">
            <h3>Операционная среда</h3>
            <p>{mission.environment}</p>
          </div>

          <div className="brief-block">
            <h3>Что проверяем в этой фазе</h3>
            <p>{mission.briefing}</p>
          </div>

          <div className="brief-block">
            <h3>На что смотрит методика</h3>
            <div className="brief-list">
              {mission.learningGoals.map((item) => (
                <div key={item} className="brief-list__item">
                  <strong>Контрольная опора</strong>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="brief-aside brief-aside--dense">
          <div className="brief-block">
            <div className="brief-section__title">
              <Users2 size={16} />
              <h3>Критерии зачёта</h3>
            </div>
            {objectives.map((objective) => (
              <div key={objective.id} className="objective-row">
                <div>
                  <strong>{objective.title}</strong>
                  <p>{objective.caption}</p>
                </div>
                <span>{objective.progressLabel}</span>
              </div>
            ))}
          </div>

          <div className="brief-block">
            <div className="brief-section__title">
              <ShieldCheck size={16} />
              <h3>Типовые ошибки</h3>
            </div>
            <div className="brief-list">
              {mission.failureModes.map((item) => (
                <div key={item} className="brief-list__item">
                  <strong>Риск</strong>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="brief-block">
            <div className="brief-section__title">
              <Users2 size={16} />
              <h3>Ключевые участники</h3>
            </div>
            {mission.stakeholders.map((stakeholder) => (
              <div key={stakeholder.id} className="stakeholder-inline">
                <strong>{stakeholder.name}</strong>
                <span>{stakeholder.role}</span>
              </div>
            ))}
          </div>

          <button type="button" className="primary-button primary-button--hero" onClick={onStart}>
            Запустить фазу
            <ArrowRight size={18} />
          </button>
        </section>
      </div>
    </section>
  )
}
