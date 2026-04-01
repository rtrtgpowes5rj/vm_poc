import { ArrowLeft, ArrowRight } from 'lucide-react'
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
        <section className="brief-copy">
          <p className="eyebrow">mission briefing</p>
          <h2>{chapter.title}</h2>
          <p className="brief-text">{mission.narrative}</p>

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
                  <strong>Цель</strong>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="brief-aside">
          <div className="brief-block">
            <h3>Критерии зачёта</h3>
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
            <h3>Типовые ошибки</h3>
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
            <h3>Ключевые участники</h3>
            {mission.stakeholders.map((stakeholder) => (
              <div key={stakeholder.id} className="stakeholder-inline">
                <strong>{stakeholder.name}</strong>
                <span>{stakeholder.role}</span>
              </div>
            ))}
          </div>

          <button type="button" className="primary-button" onClick={onStart}>
            Запустить фазу
            <ArrowRight size={18} />
          </button>
        </section>
      </div>
    </section>
  )
}
