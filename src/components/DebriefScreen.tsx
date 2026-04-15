import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Gauge,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react'
import type { MissionMetrics, MissionObjective, MissionReviewItem } from '../lib/mission'
import { getScoreTier } from '../lib/mission'
import type { CampaignChapter, MissionState } from '../types'
import { CompletedObjective, MetricRail, Panel, ReviewItemCard } from './ui'

export function DebriefScreen({
  metrics,
  mission,
  nextChapter,
  objectives,
  reviewItems,
  score,
  onContinue,
  onRestart,
  onReturnToCampaign,
}: {
  metrics: MissionMetrics
  mission: MissionState
  nextChapter: CampaignChapter | null
  objectives: MissionObjective[]
  reviewItems: MissionReviewItem[]
  score: number
  onContinue: () => void
  onRestart: () => void
  onReturnToCampaign: () => void
}) {
  const completedObjectives = objectives.filter((objective) => objective.complete)
  const gaps = reviewItems.filter((item) => item.status !== 'correct')
  const tier = getScoreTier(score)

  return (
    <section className="debrief-layout">
      <div className="debrief-hero debrief-hero--cinematic">
        <div className="debrief-hero__copy">
          <p className="eyebrow">after action review</p>
          <h2>{mission.title} завершена</h2>
          <p>
            Итоговый разбор показывает, насколько решения выдержали методическую
            проверку: есть ли у процесса опора на бизнес-контекст, правильно ли
            выбран путь обработки и где ещё остаются системные пробелы.
          </p>
        </div>

        <motion.div
          className="debrief-score debrief-score--ring"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.55 }}
        >
          <div className="debrief-score__ring" />
          <div className="debrief-score__core">
            <small>score</small>
            <span>{score}</span>
            <small>из 100</small>
          </div>
          <div className={`score-tier score-tier--${tier.tone}`}>
            {tier.label}
          </div>
        </motion.div>
      </div>

      <div className="debrief-grid">
        <Panel title="Итог run" icon={Gauge}>
          <MetricRail
            label="Точность решений"
            value={`${metrics.quality}%`}
            progress={metrics.quality}
            tone={metrics.quality >= 80 ? 'good' : 'warning'}
          />
          <MetricRail
            label="Заполненность обязательных блоков"
            value={`${metrics.coverage}%`}
            progress={metrics.coverage}
            tone={metrics.coverage === 100 ? 'good' : 'warning'}
          />
          <MetricRail
            label="Критические блокеры"
            value={`${metrics.blockingIssues}`}
            progress={Math.min(metrics.blockingIssues * 25, 100)}
            tone={metrics.blockingIssues === 0 ? 'good' : 'critical'}
          />
          <MetricRail
            label="Остаточный риск"
            value={`${metrics.riskScore}/100`}
            progress={metrics.riskScore}
            tone={metrics.riskScore <= 40 ? 'good' : 'critical'}
          />
        </Panel>

        <Panel title="Что зачтено" icon={ShieldCheck}>
          <div className="completed-objectives">
            {completedObjectives.length > 0 ? (
              completedObjectives.map((objective) => (
                <CompletedObjective
                  key={objective.id}
                  title={objective.title}
                  caption={objective.caption}
                />
              ))
            ) : (
              <div className="empty-state">
                Пока ни одна из целевых задач не закрыта полностью. Это полезный
                сигнал: методический каркас ещё не стал устойчивым.
              </div>
            )}
          </div>
        </Panel>
      </div>

      <Panel title="Незакрытые пробелы" icon={Target}>
        <div className="review-list">
          {gaps.length > 0 ? (
            gaps.map((item) => <ReviewItemCard key={item.id} item={item} />)
          ) : (
            <div className="empty-state">
              Все проверяемые элементы закрыты корректно. Эта фаза выдержала
              методическую проверку.
            </div>
          )}
        </div>
      </Panel>

      <div className="debrief-actions">
        <div className="debrief-actions__group">
          <button type="button" className="ghost-button" onClick={onReturnToCampaign}>
            <ArrowLeft size={16} />
            Кампания
          </button>

          <button type="button" className="icon-button icon-button--ghost" onClick={onRestart}>
            <RotateCcw size={15} />
          </button>
        </div>

        <button type="button" className="primary-button primary-button--hero" onClick={onContinue}>
          {nextChapter ? `К следующей фазе: ${nextChapter.title}` : 'Вернуться к кампании'}
          <ArrowRight size={16} />
        </button>
      </div>

      {nextChapter ? (
        <div className="unlock-banner">
          <Sparkles size={18} />
          Следующая фаза уже разблокирована: {nextChapter.title}. Можно сразу
          продолжить кампанию без повторного запуска текущей миссии.
        </div>
      ) : null}
    </section>
  )
}
