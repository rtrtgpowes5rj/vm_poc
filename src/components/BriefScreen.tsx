import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Orbit,
  Radar,
  Users2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { MissionObjective } from '../lib/mission'
import type { CampaignChapter, MissionState } from '../types'

export function BriefScreen({
  allowFreePhaseAccess,
  chapter,
  mission,
  objectives,
  onBack,
  onStart,
}: {
  allowFreePhaseAccess: boolean
  chapter: CampaignChapter
  mission: MissionState
  objectives: MissionObjective[]
  onBack: () => void
  onStart: () => void
}) {
  const slides = useMemo(
    () => createBriefSlides({ chapter, mission, objectives }),
    [chapter, mission, objectives],
  )
  const [step, setStep] = useState(0)
  const currentSlide = slides[step]
  const isLastStep = step === slides.length - 1

  return (
    <section className="brief-layout brief-layout--guided">
      <div className="brief-head">
        <button type="button" className="ghost-button" onClick={onBack}>
          <ArrowLeft size={16} />
          Назад к кампании
        </button>

        <div className="brief-tagline">
          <span>{chapter.phase}</span>
          <span>{chapter.estimated}</span>
          <span>{mission.code}</span>
          {allowFreePhaseAccess && chapter.status === 'locked' ? <span>test access</span> : null}
        </div>
      </div>

      <div className="brief-flow">
        <section className="brief-story">
          <div className="brief-story__hero">
            <div className="brief-story__copy">
              <p className="eyebrow">module intro</p>
              <h2>{chapter.title}</h2>
              <p className="brief-text">{mission.environment}</p>

              <div className="brief-glance">
                <div>
                  <span>focus</span>
                  <strong>{currentSlide.shortLabel}</strong>
                </div>
                <div>
                  <span>format</span>
                  <strong>intro → action → outcome</strong>
                </div>
                <div>
                  <span>result</span>
                  <strong>{chapter.estimated}</strong>
                </div>
              </div>
            </div>

            <motion.div
              className="brief-story__visual"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12, duration: 0.55 }}
            >
              <div className="brief-stage">
                <div className="brief-stage__orb" />
                <div className="brief-stage__ring brief-stage__ring--one" />
                <div className="brief-stage__ring brief-stage__ring--two" />
                <div className="brief-stage__card brief-stage__card--top">
                  <Radar size={16} />
                  <div>
                    <strong>{slides[0].shortLabel}</strong>
                    <span>{slides[0].title}</span>
                  </div>
                </div>
                <div className="brief-stage__card brief-stage__card--mid">
                  <Users2 size={16} />
                  <div>
                    <strong>{slides[1].shortLabel}</strong>
                    <span>{slides[1].title}</span>
                  </div>
                </div>
                <div className="brief-stage__card brief-stage__card--bottom">
                  <Orbit size={16} />
                  <div>
                    <strong>{slides[2].shortLabel}</strong>
                    <span>{slides[2].title}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="brief-progress">
            {slides.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`brief-progress__step ${index === step ? 'brief-progress__step--active' : ''}`}
                onClick={() => setStep(index)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.shortLabel}</small>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="brief-scene">
          <div className="brief-scene__copy">
            <p className="eyebrow">{currentSlide.kicker}</p>
            <h3>{currentSlide.title}</h3>
            <p>{currentSlide.body}</p>
          </div>

          <div className="brief-scene__list">
            {currentSlide.points.map((point) => (
              <div key={point.title} className="brief-scene__point">
                <strong>{point.title}</strong>
                <p>{point.body}</p>
              </div>
            ))}
          </div>

          <div className="brief-scene__signal">
            <span>{currentSlide.signalTitle}</span>
            <p>{currentSlide.signalBody}</p>
          </div>
        </section>
      </div>

      <div className="brief-actions brief-actions--guided">
        <div className="brief-actions__secondary">
          {step > 0 ? (
            <button
              type="button"
              className="ghost-button"
              onClick={() => setStep((current) => Math.max(current - 1, 0))}
            >
              <ArrowLeft size={16} />
              Назад
            </button>
          ) : null}
        </div>

        {isLastStep ? (
          <button type="button" className="primary-button primary-button--hero" onClick={onStart}>
            Перейти к рабочей сцене
            <ArrowRight size={18} />
          </button>
        ) : (
          <button
            type="button"
            className="primary-button primary-button--hero"
            onClick={() => setStep((current) => Math.min(current + 1, slides.length - 1))}
          >
            Дальше
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </section>
  )
}

function createBriefSlides({
  chapter,
  mission,
  objectives,
}: {
  chapter: CampaignChapter
  mission: MissionState
  objectives: MissionObjective[]
}) {
  const firstAlert = mission.alerts[0]
  const firstStakeholder = mission.stakeholders[0]
  const resistantStakeholder =
    mission.stakeholders.find((stakeholder) => stakeholder.stance === 'resistant') ??
    mission.stakeholders[0]

  return [
    {
      id: 'situation',
      kicker: 'ситуация',
      shortLabel: 'что происходит',
      title: 'Сначала нужно понять, почему этот модуль вообще важен.',
      body: mission.narrative,
      points: [
        {
          title: 'Среда',
          body: mission.environment,
        },
        {
          title: 'Сигнал сверху',
          body: firstAlert?.summary ?? chapter.stakes,
        },
        {
          title: 'Главное напряжение',
          body: chapter.stakes,
        },
      ],
      signalTitle: 'Если пройти этот шаг поверхностно',
      signalBody:
        'Следующая механика превратится в перебор вариантов, а не в управляемое решение. Здесь мы задаём смысл всей фазы.',
    },
    {
      id: 'task',
      kicker: 'задача модуля',
      shortLabel: 'что решаем',
      title: 'В модуле нужно не просто отвечать на вопросы, а собрать рабочую логику процесса.',
      body: mission.briefing,
      points: objectives.slice(0, 3).map((objective) => ({
        title: objective.title,
        body: objective.caption,
      })),
      signalTitle: 'Кто первым оспорит слабое решение',
      signalBody:
        resistantStakeholder?.quote ??
        'Если решение не связано с операционной реальностью, ИТ и владельцы сервисов перестанут доверять процессу.',
    },
    {
      id: 'finish',
      kicker: 'что будет на выходе',
      shortLabel: 'как поймём успех',
      title: 'Хорошее прохождение видно не по числу кликов, а по качеству управленческого контура.',
      body:
        'Мы смотрим, связаны ли ответы с реальным риском, исполнимы ли договорённости и можно ли по ним вести процесс дальше без ручной импровизации.',
      points: [
        {
          title: 'Сильный результат',
          body:
            'После шага становится понятно, почему именно этот вариант выдерживает бизнес-контекст, ИТ-реальность и логику VM.',
        },
        {
          title: 'Слабый результат',
          body:
            mission.failureModes[0] ??
            'Решение формально закрывает поле, но не объясняет, как по нему будет жить команда.',
        },
        {
          title: 'Что увидит команда',
          body:
            firstStakeholder?.pressure ??
            'На выходе должен получиться контур, который можно исполнять, а не только красиво показать.',
        },
      ],
      signalTitle: 'После старта фазы',
      signalBody:
        'Ты попадёшь в рабочую сцену с одним главным действием на экране, а контекст и ограничения будут показаны только в том объёме, который реально нужен сейчас.',
    },
  ]
}
