import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BellRing,
  Gauge,
  Lightbulb,
  Network,
  Radar,
  Server,
  ShieldAlert,
  Sparkles,
  Wrench,
} from 'lucide-react'
import type { MissionMetrics, MissionObjective, MissionReviewItem } from '../lib/mission'
import { createHintToken } from '../lib/hints'
import type {
  AssetRole,
  ChangeWindow,
  GovernanceMappingTask,
  GovernanceQuestion,
  InventoryAsset,
  MissionState,
  MissionTab,
  PriorityDecision,
  PriorityFactor,
  PrioritizationCase,
  RankingMove,
  ResponseCase,
  ResponseSequenceTask,
  ScanStrategy,
  SlaTier,
  TaskMethod,
  VerificationStep,
} from '../types'
import {
  ChoiceButton,
  ControlSelect,
  InlineOption,
  MetricRail,
  Panel,
  StatusBadge,
  ReviewItemCard,
  labelForAssetRoleUi,
  labelForPriorityDecision,
  labelForPriorityFactor,
  labelForScanStrategyUi,
  labelForSlaUi,
  labelForTaskMethod,
  labelForVerificationUi,
  labelForWindowUi,
} from './ui'

const roleOptions: AssetRole[] = ['entry-point', 'target', 'key', 'support', 'test']
const scanOptions: ScanStrategy[] = ['audit', 'discovery', 'agent', 'manual', 'exclude']
const slaOptions: SlaTier[] = ['24h', '72h', '5d', 'exception']
const priorityDecisions: PriorityDecision[] = ['urgent', 'planned', 'compensating', 'accepted']
const priorityFactors: PriorityFactor[] = [
  'impact',
  'asset-criticality',
  'exploit',
  'accessibility',
  'trend',
]
const responseMethods: TaskMethod[] = ['patch', 'config', 'waf', 'monitoring', 'replace']
const changeWindows: ChangeWindow[] = ['emergency', 'planned', 'exception', 'defer']
const verificationSteps: VerificationStep[] = ['rescan', 'owner-sync', 'sla-review', 'monitoring']

export function WorkspaceScreen({
  activeTab,
  canFinish,
  hintBankRemaining,
  metrics,
  mission,
  objectives,
  reviewItems,
  setActiveTab,
  onBack,
  onFinishMission,
  onRevealHint,
  onToggleGovernanceOption,
  onSetGovernanceMappingRole,
  onSetInventoryRole,
  onSetInventoryScanStrategy,
  onSetInventorySla,
  onMovePriorityRankingEntry,
  onTogglePriorityWaveOption,
  onSetPriorityDecision,
  onTogglePriorityFactor,
  onMoveResponseSequenceEntry,
  onSetResponseMethod,
  onSetResponseWindow,
  onToggleResponseVerification,
}: {
  activeTab: MissionTab
  canFinish: boolean
  hintBankRemaining: number
  metrics: MissionMetrics
  mission: MissionState
  objectives: MissionObjective[]
  reviewItems: MissionReviewItem[]
  setActiveTab: (tab: MissionTab) => void
  onBack: () => void
  onFinishMission: () => void
  onRevealHint: (itemId: string) => void
  onToggleGovernanceOption: (questionId: string, optionId: string) => void
  onSetGovernanceMappingRole: (taskId: string, rowId: string, role: AssetRole) => void
  onSetInventoryRole: (assetId: string, role: AssetRole) => void
  onSetInventoryScanStrategy: (assetId: string, strategy: ScanStrategy) => void
  onSetInventorySla: (assetId: string, sla: SlaTier) => void
  onMovePriorityRankingEntry: (taskId: string, entryId: string, move: RankingMove) => void
  onTogglePriorityWaveOption: (taskId: string, optionId: string) => void
  onSetPriorityDecision: (caseId: string, decision: PriorityDecision) => void
  onTogglePriorityFactor: (caseId: string, factor: PriorityFactor) => void
  onMoveResponseSequenceEntry: (taskId: string, entryId: string, move: RankingMove) => void
  onSetResponseMethod: (caseId: string, method: TaskMethod) => void
  onSetResponseWindow: (caseId: string, window: ChangeWindow) => void
  onToggleResponseVerification: (caseId: string, step: VerificationStep) => void
}) {
  const tabs = getTabsForMission(mission)
  const guide = getWorkspaceGuide(mission, activeTab)
  const visibleObjectives = [...objectives]
    .sort((left, right) => Number(left.complete) - Number(right.complete))
    .slice(0, 3)
  const contextualAlert =
    mission.alerts.find((alert) => alert.kind === 'intel' || alert.kind === 'business') ??
    mission.alerts[0]
  const contextualStakeholder = getContextStakeholder(mission, activeTab)
  const contextualNote = getContextNote(mission, activeTab)

  return (
    <section className="workspace-layout">
      <div className="workspace-head">
        <div>
          <button type="button" className="ghost-button" onClick={onBack}>
            <ArrowLeft size={16} />
            Кампания
          </button>
          <p className="eyebrow">phase / {mission.code}</p>
          <h2>{mission.title}</h2>
        </div>

        <div className="workspace-head__actions">
          <div className="mission-pulse-inline">
            <span>качество {metrics.quality}%</span>
            <span>риск {metrics.riskScore}/100</span>
            <span>подсказки {hintBankRemaining}/50</span>
          </div>

          <button
            type="button"
            className={`primary-button ${!canFinish ? 'primary-button--muted' : ''}`}
            onClick={onFinishMission}
            disabled={!canFinish}
          >
            Завершить фазу
            <Sparkles size={18} />
          </button>
        </div>
      </div>

      <div className="tab-strip">
        {tabs.map((tab) => {
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              type="button"
              className={`tab-pill ${activeTab === tab.id ? 'tab-pill--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="workspace-guide">
        <div className="workspace-guide__lead">
          <p className="eyebrow">{guide.kicker}</p>
          <h3>{guide.title}</h3>
          <p>{guide.body}</p>
        </div>

        <div className="workspace-guide__list">
          {guide.points.map((point) => (
            <div key={point.title} className="workspace-guide__point">
              <strong>{point.title}</strong>
              <p>{point.body}</p>
            </div>
          ))}
        </div>

        <div className="workspace-guide__outcome">
          <span>После этого шага</span>
          <p>{guide.outcome}</p>
        </div>
      </div>

      <div className="workspace-grid workspace-grid--guided">

        <div className="center-stage">
          {mission.kind === 'governance' && activeTab === 'charter' ? (
            <GovernanceSection
              hintBankRemaining={hintBankRemaining}
              mappingTasks={(mission.governanceMappingTasks ?? []).filter(
                (item) => item.section === 'charter',
              )}
              questions={(mission.governanceQuestions ?? []).filter((item) => item.section === 'charter')}
              onRevealHint={onRevealHint}
              onSetGovernanceMappingRole={onSetGovernanceMappingRole}
              onToggleGovernanceOption={onToggleGovernanceOption}
            />
          ) : null}

          {mission.kind === 'governance' && activeTab === 'agreements' ? (
            <GovernanceSection
              hintBankRemaining={hintBankRemaining}
              mappingTasks={(mission.governanceMappingTasks ?? []).filter(
                (item) => item.section === 'agreements',
              )}
              questions={(mission.governanceQuestions ?? []).filter((item) => item.section === 'agreements')}
              onRevealHint={onRevealHint}
              onSetGovernanceMappingRole={onSetGovernanceMappingRole}
              onToggleGovernanceOption={onToggleGovernanceOption}
            />
          ) : null}

          {mission.kind === 'inventory' && activeTab === 'classification' ? (
            <InventorySection
              assets={mission.inventoryAssets ?? []}
              hintBankRemaining={hintBankRemaining}
              mode="classification"
              onRevealHint={onRevealHint}
              onSetInventoryRole={onSetInventoryRole}
              onSetInventoryScanStrategy={onSetInventoryScanStrategy}
              onSetInventorySla={onSetInventorySla}
            />
          ) : null}

          {mission.kind === 'inventory' && activeTab === 'scan' ? (
            <InventorySection
              assets={mission.inventoryAssets ?? []}
              hintBankRemaining={hintBankRemaining}
              mode="scan"
              onRevealHint={onRevealHint}
              onSetInventoryRole={onSetInventoryRole}
              onSetInventoryScanStrategy={onSetInventoryScanStrategy}
              onSetInventorySla={onSetInventorySla}
            />
          ) : null}

          {mission.kind === 'prioritization' && activeTab === 'queue' ? (
            <PrioritizationSection
              hintBankRemaining={hintBankRemaining}
              mission={mission}
              mode="queue"
              onMovePriorityRankingEntry={onMovePriorityRankingEntry}
              onTogglePriorityWaveOption={onTogglePriorityWaveOption}
              onRevealHint={onRevealHint}
              onSetPriorityDecision={onSetPriorityDecision}
              onTogglePriorityFactor={onTogglePriorityFactor}
            />
          ) : null}

          {mission.kind === 'prioritization' && activeTab === 'factors' ? (
            <PrioritizationSection
              hintBankRemaining={hintBankRemaining}
              mission={mission}
              mode="factors"
              onMovePriorityRankingEntry={onMovePriorityRankingEntry}
              onTogglePriorityWaveOption={onTogglePriorityWaveOption}
              onRevealHint={onRevealHint}
              onSetPriorityDecision={onSetPriorityDecision}
              onTogglePriorityFactor={onTogglePriorityFactor}
            />
          ) : null}

          {mission.kind === 'response' && activeTab === 'planning' ? (
            <ResponseSection
              cases={mission.responseCases ?? []}
              hintBankRemaining={hintBankRemaining}
              mode="planning"
              onRevealHint={onRevealHint}
              onSetResponseMethod={onSetResponseMethod}
              onSetResponseWindow={onSetResponseWindow}
              onToggleResponseVerification={onToggleResponseVerification}
            />
          ) : null}

          {mission.kind === 'response' && activeTab === 'control' ? (
            <ResponseSection
              cases={mission.responseCases ?? []}
              hintBankRemaining={hintBankRemaining}
              mode="control"
              onRevealHint={onRevealHint}
              onSetResponseMethod={onSetResponseMethod}
              onSetResponseWindow={onSetResponseWindow}
              onToggleResponseVerification={onToggleResponseVerification}
            />
          ) : null}

          {mission.kind === 'response' && activeTab === 'playbook' ? (
            <ResponsePlaybookSection
              hintBankRemaining={hintBankRemaining}
              tasks={mission.responseSequenceTasks ?? []}
              onMoveResponseSequenceEntry={onMoveResponseSequenceEntry}
              onRevealHint={onRevealHint}
            />
          ) : null}

          {activeTab === 'review' ? <ReviewSection reviewItems={reviewItems} /> : null}
        </div>

        <aside className="right-rail right-rail--guided">
          <Panel title="Фокус фазы" icon={ShieldAlert}>
            <div className="objective-list objective-list--compact">
              {visibleObjectives.map((objective) => (
                <div
                  key={objective.id}
                  className={`objective-card objective-card--compact ${
                    objective.complete ? 'objective-card--done' : ''
                  }`}
                >
                  <div className="objective-card__head">
                    <strong>{objective.title}</strong>
                    <span>{objective.complete ? 'ok' : 'now'}</span>
                  </div>
                  <p>{objective.caption}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Контекст решения" icon={BellRing}>
            <div className="context-stack">
              {contextualAlert ? (
                <div className="context-card">
                  <span>сигнал</span>
                  <strong>{contextualAlert.title}</strong>
                  <p>{contextualAlert.summary}</p>
                </div>
              ) : null}

              {contextualStakeholder ? (
                <div className="context-card">
                  <span>позиция команды</span>
                  <strong>
                    {contextualStakeholder.name} · {contextualStakeholder.role}
                  </strong>
                  <p>{contextualStakeholder.quote}</p>
                </div>
              ) : null}

              {contextualNote ? (
                <div className="context-card">
                  <span>ориентир</span>
                  <strong>{contextualNote.title}</strong>
                  <p>{contextualNote.body}</p>
                </div>
              ) : null}
            </div>
          </Panel>

          <Panel title="Состояние фазы" icon={Gauge}>
            <MetricRail
              label="Точность решений"
              tone={metrics.quality >= 80 ? 'good' : 'warning'}
              value={`${metrics.quality}%`}
              progress={metrics.quality}
            />
            <MetricRail
              label="Заполненность"
              tone={metrics.coverage === 100 ? 'good' : 'warning'}
              value={`${metrics.coverage}%`}
              progress={metrics.coverage}
            />
            <MetricRail
              label="Критические блокеры"
              tone={metrics.blockingIssues === 0 ? 'good' : 'critical'}
              value={`${metrics.blockingIssues}`}
              progress={Math.min(metrics.blockingIssues * 25, 100)}
            />
            <MetricRail
              label="Остаточный риск"
              tone={metrics.riskScore <= 40 ? 'good' : 'critical'}
              value={`${metrics.riskScore}/100`}
              progress={metrics.riskScore}
            />
            <div className="hint-bank-card">
              <div className="hint-bank-card__head">
                <Lightbulb size={16} />
                <strong>Банк подсказок</strong>
              </div>
              <p>Подсказки скрыты по умолчанию и тратятся из общего лимита на всю кампанию.</p>
              <span>{hintBankRemaining} из 50 осталось</span>
            </div>
          </Panel>
        </aside>
      </div>
    </section>
  )
}

function GovernanceSection({
  hintBankRemaining,
  mappingTasks,
  questions,
  onRevealHint,
  onSetGovernanceMappingRole,
  onToggleGovernanceOption,
}: {
  hintBankRemaining: number
  mappingTasks: GovernanceMappingTask[]
  questions: GovernanceQuestion[]
  onRevealHint: (itemId: string) => void
  onSetGovernanceMappingRole: (taskId: string, rowId: string, role: AssetRole) => void
  onToggleGovernanceOption: (questionId: string, optionId: string) => void
}) {
  return (
    <Panel title="Процессные решения" icon={Radar}>
        <div className="scenario-list">
          {questions.map((question) => {
            return (
              <div key={question.id} className="scenario-card">
                <div className="scenario-card__head">
                  <div>
                    <strong>{question.title}</strong>
                    <p>{question.prompt}</p>
                  </div>
                  <StatusBadge
                    tone="progress"
                    label={getGovernanceQuestionProgressLabel(question)}
                  />
                </div>

              <div className="choice-grid">
                {question.options.map((option) => (
                  <ChoiceButton
                    key={option.id}
                    active={question.selectedOptionIds.includes(option.id)}
                    onClick={() => onToggleGovernanceOption(question.id, option.id)}
                  >
                    {option.label}
                  </ChoiceButton>
                ))}
              </div>

              <ScenarioFooter
                hintBankRemaining={hintBankRemaining}
                hintText={question.hint ?? getGovernanceHint(question.id)}
                hintUsed={question.hintUsed}
                hintToken={createHintToken('governanceQuestions', question.id)}
                onRevealHint={onRevealHint}
                selectionLabel={
                  question.multi
                    ? `Выбрано ${question.selectedOptionIds.length} вариантов`
                    : question.selectedOptionIds.length > 0
                      ? 'Решение выбрано'
                      : 'Ожидается решение'
                }
              />
            </div>
          )
        })}

        {mappingTasks.map((task) => {
          return (
            <div key={task.id} className="scenario-card">
                <div className="scenario-card__head">
                  <div>
                    <strong>{task.title}</strong>
                    <p>{task.prompt}</p>
                  </div>
                  <StatusBadge tone="progress" label={getMappingProgressLabel(task)} />
                </div>

              <div className="mapping-grid">
                {task.rows.map((row) => (
                  <div key={row.id} className="mapping-row">
                    <div className="mapping-row__copy">
                      <strong>{row.assetName}</strong>
                      <p>{row.context}</p>
                    </div>

                    <ControlSelect
                      value={row.selectedRole}
                      options={roleOptions.map((role) => ({
                        value: role,
                        label: labelForAssetRoleUi(role),
                        meta: getRoleMeta(role),
                      }))}
                      placeholder="Выберите роль в цепочке"
                      onChange={(role) => onSetGovernanceMappingRole(task.id, row.id, role)}
                    />
                  </div>
                ))}
              </div>

              <ScenarioFooter
                hintBankRemaining={hintBankRemaining}
                hintText={task.hint ?? getGovernanceMappingHint()}
                hintUsed={task.hintUsed}
                hintToken={createHintToken('governanceMappingTasks', task.id)}
                onRevealHint={onRevealHint}
                selectionLabel={`${task.rows.filter((row) => row.selectedRole !== null).length}/${task.rows.length} ролей сопоставлено`}
              />
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

function InventorySection({
  assets,
  hintBankRemaining,
  mode,
  onRevealHint,
  onSetInventoryRole,
  onSetInventoryScanStrategy,
  onSetInventorySla,
}: {
  assets: InventoryAsset[]
  hintBankRemaining: number
  mode: 'classification' | 'scan'
  onRevealHint: (itemId: string) => void
  onSetInventoryRole: (assetId: string, role: AssetRole) => void
  onSetInventoryScanStrategy: (assetId: string, strategy: ScanStrategy) => void
  onSetInventorySla: (assetId: string, sla: SlaTier) => void
}) {
  return (
    <Panel
      title={mode === 'classification' ? 'Роли активов и SLA' : 'Стратегия сканирования и источники'}
      icon={Server}
    >
      <div className="scenario-list">
          {assets.map((asset) => {
            const statusLabel = getInventoryProgressLabel(asset, mode)

            return (
              <div key={asset.id} className="scenario-card">
                <div className="scenario-card__head">
                  <div>
                    <strong>{asset.name}</strong>
                    <p>{asset.description}</p>
                  </div>
                  <StatusBadge tone="progress" label={statusLabel} />
                </div>

              <div className="scenario-meta">
                <span className="inline-tag">{asset.zone}</span>
                <span className="inline-tag">owner: {asset.owner}</span>
                <span className={`inline-tag inline-tag--${asset.importance}`}>
                  {asset.importance === 'critical' ? 'critical' : 'important'}
                </span>
              </div>

              {mode === 'classification' ? (
                <div className="field-grid">
                  <label className="field-group">
                    <span>Роль в процессе</span>
                    <ControlSelect
                      value={asset.selectedRole}
                      options={roleOptions.map((role) => ({
                        value: role,
                        label: labelForAssetRoleUi(role),
                        meta: getRoleMeta(role),
                      }))}
                      placeholder="Выберите роль"
                      onChange={(role) => onSetInventoryRole(asset.id, role)}
                    />
                  </label>

                  <label className="field-group">
                    <span>SLA</span>
                    <ControlSelect
                      value={asset.selectedSla}
                      options={slaOptions.map((sla) => ({
                        value: sla,
                        label: labelForSlaUi(sla),
                        meta: getSlaMeta(sla),
                      }))}
                      placeholder="Выберите SLA"
                      onChange={(sla) => onSetInventorySla(asset.id, sla)}
                    />
                  </label>
                </div>
              ) : (
                <>
                  <div className="source-strip">
                    {asset.sources.map((source) => (
                      <span key={source} className="inline-tag">
                        {source}
                      </span>
                    ))}
                  </div>

                  <label className="field-group">
                    <span>Стратегия сканирования</span>
                    <ControlSelect
                      value={asset.selectedScanStrategy}
                      options={scanOptions.map((strategy) => ({
                        value: strategy,
                        label: labelForScanStrategyUi(strategy),
                        meta: getScanMeta(strategy),
                      }))}
                      placeholder="Выберите стратегию"
                      onChange={(strategy) => onSetInventoryScanStrategy(asset.id, strategy)}
                    />
                  </label>
                </>
              )}

              <ScenarioFooter
                hintBankRemaining={hintBankRemaining}
                hintText={asset.hint ?? getInventoryHint(asset)}
                hintUsed={asset.hintUsed}
                hintToken={createHintToken('inventoryAssets', asset.id)}
                onRevealHint={onRevealHint}
                selectionLabel={
                  mode === 'classification'
                    ? `${asset.selectedRole ? 'роль выбрана' : 'роль не выбрана'} / ${
                        asset.selectedSla ? 'SLA выбран' : 'SLA не выбран'
                      }`
                    : asset.selectedScanStrategy
                      ? 'Стратегия выбрана'
                      : 'Ожидается стратегия'
                }
              />
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

function PrioritizationSection({
  hintBankRemaining,
  mission,
  mode,
  onMovePriorityRankingEntry,
  onTogglePriorityWaveOption,
  onRevealHint,
  onSetPriorityDecision,
  onTogglePriorityFactor,
}: {
  hintBankRemaining: number
  mission: MissionState
  mode: 'queue' | 'factors'
  onMovePriorityRankingEntry: (taskId: string, entryId: string, move: RankingMove) => void
  onTogglePriorityWaveOption: (taskId: string, optionId: string) => void
  onRevealHint: (itemId: string) => void
  onSetPriorityDecision: (caseId: string, decision: PriorityDecision) => void
  onTogglePriorityFactor: (caseId: string, factor: PriorityFactor) => void
}) {
  const cases = mission.prioritizationCases ?? []
  const waveTasks = (mission.prioritizationWaveTasks ?? []).filter((task) => task.section === mode)
  const rankingTasks = (mission.prioritizationRankingTasks ?? []).filter(
    (task) => task.section === mode,
  )

  return (
    <Panel
      title={mode === 'queue' ? 'Очередь устранения' : 'Факторное обоснование'}
      icon={Radar}
    >
      <div className="scenario-list">
          {waveTasks.map((task) => {
            const selectedCount = task.selectedOptionIds.length

            return (
              <div key={task.id} className="scenario-card">
                <div className="scenario-card__head">
                  <div>
                    <strong>{task.title}</strong>
                    <p>{task.prompt}</p>
                  </div>
                  <StatusBadge
                    tone="progress"
                    label={`${selectedCount}/${task.selectionLimit} слотов`}
                  />
                </div>

              <div className="choice-grid">
                {task.options.map((option) => {
                  const active = task.selectedOptionIds.includes(option.id)
                  const limitReached = selectedCount >= task.selectionLimit && !active

                  return (
                    <ChoiceButton
                      key={option.id}
                      active={active}
                      disabled={limitReached}
                      onClick={() => onTogglePriorityWaveOption(task.id, option.id)}
                    >
                      <span className="choice-button__stack">
                        <strong>{option.title}</strong>
                        <small>{option.cue}</small>
                      </span>
                    </ChoiceButton>
                  )
                })}
              </div>

              <ScenarioFooter
                hintBankRemaining={hintBankRemaining}
                hintText={task.hint ?? getWaveHint()}
                hintUsed={task.hintUsed}
                hintToken={createHintToken('prioritizationWaveTasks', task.id)}
                onRevealHint={onRevealHint}
                selectionLabel={`${selectedCount}/${task.selectionLimit} emergency-слотов занято`}
              />
            </div>
          )
        })}

          {rankingTasks.map((task) => {
            return (
              <div key={task.id} className="scenario-card scenario-card--priority">
                <div className="scenario-card__head">
                  <div>
                    <strong>{task.title}</strong>
                    <p>{task.prompt}</p>
                  </div>
                  <StatusBadge tone="progress" label={getRankingProgressLabel(task)} />
                </div>

              <div className="ranking-list">
                {task.selectedOrderIds.map((entryId, index) => {
                  const entry = task.entries.find((item) => item.id === entryId)

                  if (!entry) {
                    return null
                  }

                  return (
                    <div key={entry.id} className="ranking-card">
                      <div className="ranking-card__order">{index + 1}</div>
                      <div className="ranking-card__copy">
                        <strong>{entry.title}</strong>
                        <p>{entry.cue}</p>
                      </div>
                      <div className="ranking-card__actions">
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => onMovePriorityRankingEntry(task.id, entry.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => onMovePriorityRankingEntry(task.id, entry.id, 'down')}
                          disabled={index === task.selectedOrderIds.length - 1}
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <ScenarioFooter
                hintBankRemaining={hintBankRemaining}
                hintText={task.hint ?? getRankingHint()}
                hintUsed={task.hintUsed}
                hintToken={createHintToken('prioritizationRankingTasks', task.id)}
                onRevealHint={onRevealHint}
                selectionLabel={
                  task.touched
                    ? 'Очередь перестроена'
                    : 'Ожидается ранжирование первой волны'
                }
              />
            </div>
          )
        })}

          {cases.map((item) => {
            return (
              <div key={item.id} className="scenario-card">
                <div className="scenario-card__head">
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.summary}</p>
                  </div>
                  <StatusBadge tone="progress" label={getPrioritizationProgressLabel(item, mode)} />
                </div>

              <div className="scenario-meta">
                <span className={`inline-tag inline-tag--${item.severity}`}>{item.severity}</span>
                <span className="inline-tag">CVSS {item.cvss}</span>
                <span className="inline-tag">{item.zone}</span>
                {item.trending ? <span className="inline-tag inline-tag--hot">trending</span> : null}
                {item.hasExploit ? <span className="inline-tag">PoC / exploit</span> : null}
              </div>

              <div className="scenario-insight">
                <strong>Контекст</strong>
                <p>{item.whyNow}</p>
              </div>

              {mode === 'queue' ? (
                <div className="choice-grid">
                  {priorityDecisions.map((decision) => (
                    <ChoiceButton
                      key={decision}
                      active={item.selectedDecision === decision}
                      onClick={() => onSetPriorityDecision(item.id, decision)}
                    >
                      {labelForPriorityDecision(decision)}
                    </ChoiceButton>
                  ))}
                </div>
              ) : (
                <div className="choice-grid choice-grid--chips">
                  {priorityFactors.map((factor) => (
                    <InlineOption
                      key={factor}
                      active={item.selectedFactors.includes(factor)}
                      onClick={() => onTogglePriorityFactor(item.id, factor)}
                    >
                      {labelForPriorityFactor(factor)}
                    </InlineOption>
                  ))}
                </div>
              )}

              <ScenarioFooter
                hintBankRemaining={hintBankRemaining}
                hintText={item.hint ?? getPrioritizationHint(item)}
                hintUsed={item.hintUsed}
                hintToken={createHintToken('prioritizationCases', item.id)}
                onRevealHint={onRevealHint}
                selectionLabel={
                  mode === 'queue'
                    ? item.selectedDecision
                      ? 'Решение по очереди выбрано'
                      : 'Ожидается решение по очереди'
                    : `Выбрано факторов: ${item.selectedFactors.length}`
                }
              />
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

function ResponseSection({
  cases,
  hintBankRemaining,
  mode,
  onRevealHint,
  onSetResponseMethod,
  onSetResponseWindow,
  onToggleResponseVerification,
}: {
  cases: ResponseCase[]
  hintBankRemaining: number
  mode: 'planning' | 'control'
  onRevealHint: (itemId: string) => void
  onSetResponseMethod: (caseId: string, method: TaskMethod) => void
  onSetResponseWindow: (caseId: string, window: ChangeWindow) => void
  onToggleResponseVerification: (caseId: string, step: VerificationStep) => void
}) {
  return (
    <Panel title={mode === 'planning' ? 'План устранения' : 'Контроль устранения'} icon={Wrench}>
      <div className="scenario-list">
          {cases.map((item) => {
            return (
              <div key={item.id} className="scenario-card">
                <div className="scenario-card__head">
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.summary}</p>
                  </div>
                  <StatusBadge tone="progress" label={getResponseProgressLabel(item, mode)} />
                </div>

              <div className="scenario-meta">
                <span className="inline-tag">{item.assetName}</span>
                <span className={`inline-tag inline-tag--${item.importance}`}>
                  {item.importance === 'critical' ? 'critical' : 'important'}
                </span>
              </div>

              <div className="scenario-insight">
                <strong>Ограничение</strong>
                <p>{item.limitation}</p>
              </div>

              {mode === 'planning' ? (
                <div className="field-grid">
                  <label className="field-group">
                    <span>Способ обработки</span>
                    <ControlSelect
                      value={item.selectedMethod}
                      options={responseMethods.map((method) => ({
                        value: method,
                        label: labelForTaskMethod(method),
                        meta: getMethodMeta(method),
                      }))}
                      placeholder="Выберите способ"
                      onChange={(method) => onSetResponseMethod(item.id, method)}
                    />
                  </label>

                  <label className="field-group">
                    <span>Окно изменений</span>
                    <ControlSelect
                      value={item.selectedWindow}
                      options={changeWindows.map((window) => ({
                        value: window,
                        label: labelForWindowUi(window),
                        meta: getWindowMeta(window),
                      }))}
                      placeholder="Выберите окно"
                      onChange={(window) => onSetResponseWindow(item.id, window)}
                    />
                  </label>
                </div>
              ) : (
                <div className="choice-grid choice-grid--chips">
                  {verificationSteps.map((step) => (
                    <InlineOption
                      key={step}
                      active={item.selectedVerification.includes(step)}
                      onClick={() => onToggleResponseVerification(item.id, step)}
                    >
                      {labelForVerificationUi(step)}
                    </InlineOption>
                  ))}
                </div>
              )}

              <ScenarioFooter
                hintBankRemaining={hintBankRemaining}
                hintText={item.hint ?? getResponseHint(item)}
                hintUsed={item.hintUsed}
                hintToken={createHintToken('responseCases', item.id)}
                onRevealHint={onRevealHint}
                selectionLabel={
                  mode === 'planning'
                    ? `${item.selectedMethod ? 'метод выбран' : 'метод не выбран'} / ${
                        item.selectedWindow ? 'окно выбрано' : 'окно не выбрано'
                      }`
                    : `Шагов контроля выбрано: ${item.selectedVerification.length}`
                }
              />
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

function ResponsePlaybookSection({
  hintBankRemaining,
  tasks,
  onMoveResponseSequenceEntry,
  onRevealHint,
}: {
  hintBankRemaining: number
  tasks: ResponseSequenceTask[]
  onMoveResponseSequenceEntry: (taskId: string, entryId: string, move: RankingMove) => void
  onRevealHint: (itemId: string) => void
}) {
  return (
    <Panel title="Плейбуки и эскалации" icon={Wrench}>
      <div className="scenario-list">
          {tasks.map((task) => {
            return (
              <div key={task.id} className="scenario-card scenario-card--priority">
                <div className="scenario-card__head">
                  <div>
                    <strong>{task.title}</strong>
                    <p>{task.prompt}</p>
                  </div>
                  <StatusBadge tone="progress" label={getSequenceProgressLabel(task)} />
                </div>

              <div className="ranking-list">
                {task.selectedOrderIds.map((entryId, index) => {
                  const entry = task.entries.find((item) => item.id === entryId)

                  if (!entry) {
                    return null
                  }

                  return (
                    <div key={entry.id} className="ranking-card">
                      <div className="ranking-card__order">{index + 1}</div>
                      <div className="ranking-card__copy">
                        <strong>{entry.title}</strong>
                        <p>{entry.cue}</p>
                      </div>
                      <div className="ranking-card__actions">
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => onMoveResponseSequenceEntry(task.id, entry.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => onMoveResponseSequenceEntry(task.id, entry.id, 'down')}
                          disabled={index === task.selectedOrderIds.length - 1}
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <ScenarioFooter
                hintBankRemaining={hintBankRemaining}
                hintText={task.hint ?? getResponsePlaybookHint(task.id)}
                hintUsed={task.hintUsed}
                hintToken={createHintToken('responseSequenceTasks', task.id)}
                onRevealHint={onRevealHint}
                selectionLabel={task.touched ? 'Плейбук перестроен' : 'Ожидается корректная последовательность'}
              />
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

function ReviewSection({ reviewItems }: { reviewItems: MissionReviewItem[] }) {
  return (
    <Panel title="Разбор решений" icon={ShieldAlert}>
      <div className="review-list">
        {reviewItems.map((item) => (
          <ReviewItemCard key={item.id} item={item} />
        ))}
      </div>
    </Panel>
  )
}

function ScenarioFooter({
  hintBankRemaining,
  hintText,
  hintUsed,
  hintToken,
  onRevealHint,
  selectionLabel,
}: {
  hintBankRemaining: number
  hintText: string
  hintUsed?: boolean
  hintToken: string
  onRevealHint: (itemId: string) => void
  selectionLabel: string
}) {
  return (
    <div className="scenario-footer">
      <div className="scenario-footnote">{selectionLabel}</div>

      {hintUsed ? (
        <div className="hint-callout">
          <div className="hint-callout__head">
            <Lightbulb size={15} />
            <strong>Подсказка раскрыта</strong>
          </div>
          <p>{hintText}</p>
        </div>
      ) : (
        <button
          type="button"
          className="hint-button"
          disabled={hintBankRemaining <= 0}
          onClick={() => onRevealHint(hintToken)}
        >
          <Lightbulb size={15} />
          {hintBankRemaining > 0 ? 'Показать подсказку' : 'Лимит подсказок исчерпан'}
        </button>
      )}
    </div>
  )
}

function getRoleMeta(role: AssetRole) {
  switch (role) {
    case 'entry-point':
      return 'внешняя точка входа в цепочку'
    case 'target':
      return 'конечная цель недопустимого события'
    case 'key':
      return 'опорная система для развития атаки'
    case 'support':
      return 'влияет на процесс, но не является целью'
    default:
      return 'изолированный или нерелевантный контур'
  }
}

function getSlaMeta(sla: SlaTier) {
  switch (sla) {
    case '24h':
      return 'аварийный горизонт для периметра и hot-кейсов'
    case '72h':
      return 'короткий срок для значимых систем'
    case '5d':
      return 'плановая обработка без emergency-режима'
    default:
      return 'исключение с компенсирующими мерами'
  }
}

function getScanMeta(strategy: ScanStrategy) {
  switch (strategy) {
    case 'audit':
      return 'полный технический аудит с учётными данными'
    case 'discovery':
      return 'базовое обнаружение без глубокой проверки'
    case 'agent':
      return 'агентный контроль для нестабильных адресов'
    case 'manual':
      return 'ручной анализ и внешние источники'
    default:
      return 'не сканировать как самостоятельный хост'
  }
}

function getMethodMeta(method: TaskMethod) {
  switch (method) {
    case 'patch':
      return 'когда исправление доступно у вендора'
    case 'config':
      return 'для misconfig и policy-изменений'
    case 'waf':
      return 'временный барьер до патча'
    case 'monitoring':
      return 'режим исключения и компенсирующий контроль'
    default:
      return 'если безопаснее заменить компонент'
  }
}

function getWindowMeta(window: ChangeWindow) {
  switch (window) {
    case 'emergency':
      return 'для трендовых и internet-facing кейсов'
    case 'planned':
      return 'штатное окно изменений'
    case 'exception':
      return 'отдельно оформленное отклонение от SLA'
    default:
      return 'допустимо только при обоснованном риске'
  }
}

function getGovernanceHint(questionId: string) {
  if (questionId === 'gov-outcomes') {
    return 'Выбирайте не технические обстоятельства, а события, которые наносят прямой бизнес-ущерб и связаны с недопустимым сценарием.'
  }

  if (questionId === 'gov-artifacts') {
    return 'Нужны не презентационные материалы, а артефакты, по которым команды реально исполняют процесс: шаги, роли, сроки и эскалации.'
  }

  if (questionId === 'gov-sla-participants') {
    return 'Если в SLA нет ИТ и владельца сервиса, срок почти наверняка окажется формальным и невыполнимым.'
  }

  return 'Сверяйте решение с тем, помогает ли оно запустить процесс VM как управляемую совместную работу, а не как набор разрозненных действий.'
}

function getGovernanceMappingHint() {
  return 'Разложите активы по месту в атакующей цепочке: где нарушитель входит, на чём закрепляется и к какой системе стремится ради недопустимого события.'
}

function getInventoryHint(asset: InventoryAsset) {
  if (asset.id === 'asset-vip') {
    return 'Virtual IP важен как часть периметра, но не как отдельный хост для аудита. Не путайте объект маршрутизации с полноценным активом для сканирования.'
  }

  if (asset.id === 'asset-laptop') {
    return 'Для мобильных устройств признак “актив существует” надёжнее снимается агентом, чем сетевым сканированием по плавающему IP.'
  }

  if (asset.id === 'asset-legacy') {
    return 'Legacy не должен выпадать из процесса, но и полный аудит по нему часто опасен. Ищите режим ручного контроля и исключения.'
  }

  return 'Сначала определите роль актива в недопустимом событии, затем подберите способ контроля и только потом срок обработки.'
}

function getPrioritizationHint(item: PrioritizationCase) {
  if (item.trending || item.hasExploit) {
    return 'Если кейс internet-facing, с PoC или уже в тренде эксплуатации, проверьте, не должен ли он уйти в первую волну вне обычной очереди.'
  }

  return 'Не опирайтесь только на severity и CVSS. Сначала оцените последствия, значимость актива и достижимость для нарушителя.'
}

function getRankingHint() {
  return 'Верх списка занимают кейсы, которые быстрее всего приводят к недопустимому событию: периметр, активная эксплуатация, прямой путь к целевой системе.'
}

function getWaveHint() {
  return 'Аварийный слот всегда ограничен. Туда попадают только кейсы, которые уже сейчас дают внешнему нарушителю кратчайший путь к недопустимому событию.'
}

function getResponseHint(item: ResponseCase) {
  if (item.title.toLowerCase().includes('zero-day')) {
    return 'Когда патча ещё нет, корректная реакция обычно лежит в зоне временной защиты, ограничений доступа и усиленного мониторинга.'
  }

  return 'Способ обработки должен соответствовать природе кейса: misconfig лечится не патчем, а legacy без патча не притворяется обычным SLA.'
}

function getResponsePlaybookHint(taskId: string) {
  if (taskId === 'resp-zero-day-playbook') {
    return 'Zero-day без патча не начинается с ожидания обновления. Сначала фиксируем контур и владельца, затем быстро ставим временную защиту и только потом удерживаем кейс в контроле.'
  }

  return 'Пересмотр SLA начинается с анализа причины срыва и операционных ограничений, а не с косметической смены цифры в таблице.'
}

function getGovernanceQuestionProgressLabel(question: GovernanceQuestion) {
  if (question.selectedOptionIds.length === 0) {
    return 'не заполнено'
  }

  return question.multi ? `${question.selectedOptionIds.length} выбрано` : 'ответ выбран'
}

function getMappingProgressLabel(task: GovernanceMappingTask) {
  const answered = task.rows.filter((row) => row.selectedRole !== null).length

  if (answered === 0) {
    return 'не заполнено'
  }

  return `${answered}/${task.rows.length} ролей`
}

function getInventoryProgressLabel(asset: InventoryAsset, mode: 'classification' | 'scan') {
  if (mode === 'classification') {
    const answered = [asset.selectedRole !== null, asset.selectedSla !== null].filter(Boolean).length

    if (answered === 0) {
      return 'не заполнено'
    }

    if (answered === 1) {
      return 'ввод'
    }

    return 'заполнено'
  }

  return asset.selectedScanStrategy === null ? 'ожидает' : 'выбрано'
}

function getPrioritizationProgressLabel(item: PrioritizationCase, mode: 'queue' | 'factors') {
  if (mode === 'queue') {
    return item.selectedDecision === null ? 'не задано' : 'решение выбрано'
  }

  return item.selectedFactors.length === 0 ? 'не задано' : `${item.selectedFactors.length} факторов`
}

function getRankingProgressLabel(task: { selectedOrderIds: string[]; touched?: boolean }) {
  if (!task.touched) {
    return 'не собрано'
  }

  return `${task.selectedOrderIds.length} позиций`
}

function getResponseProgressLabel(item: ResponseCase, mode: 'planning' | 'control') {
  if (mode === 'planning') {
    const answered = [item.selectedMethod !== null, item.selectedWindow !== null].filter(Boolean).length

    if (answered === 0) {
      return 'не заполнено'
    }

    if (answered === 1) {
      return 'ввод'
    }

    return 'заполнено'
  }

  return item.selectedVerification.length === 0
    ? 'не задано'
    : `${item.selectedVerification.length} шагов`
}

function getSequenceProgressLabel(task: ResponseSequenceTask) {
  if (!task.touched) {
    return 'не собрано'
  }

  return `${task.selectedOrderIds.length} позиций`
}

function getWorkspaceGuide(mission: MissionState, activeTab: MissionTab) {
  if (mission.kind === 'governance' && activeTab === 'charter') {
    return {
      kicker: 'контур процесса',
      title: 'Сначала определяем, от какого ущерба вообще строится VM.',
      body:
        'На этом шаге мы не обсуждаем инструмент и не собираем шум из находок. Нужно зафиксировать недопустимые события и разложить путь атаки по ролям активов.',
      points: [
        {
          title: 'Выбери бизнес-события',
          body: 'В основу процесса ложатся деньги, доступность сервиса и компрометация данных, а не технические неудобства команды.',
        },
        {
          title: 'Разметь цепочку атаки',
          body: 'Периметр, ключевые и целевые системы должны получить осмысленную роль в сценарии нарушения.',
        },
        {
          title: 'Не стартуй со сканера',
          body: 'Если каркас не собран, следующая фаза превратится в спор о том, что именно сканировать и зачем.',
        },
      ],
      outcome:
        'После этого шага у команды появится понятный разговор о риске: что именно мы защищаем, через что приходит атака и где проходит граница процесса.',
    }
  }

  if (mission.kind === 'governance' && activeTab === 'agreements') {
    return {
      kicker: 'договорённости',
      title: 'Теперь переводим логику процесса в роли, артефакты и выполнимые сроки.',
      body:
        'Здесь важно не “назначить цифры”, а собрать управляемый контур: кто владеет процессом, какие артефакты обязательны и как сроки привязаны к реальности ИТ.',
      points: [
        {
          title: 'Закрепи ownership',
          body: 'VM не живёт без владельца процесса и понятной ответственности ИБ, ИТ и владельцев сервисов.',
        },
        {
          title: 'Согласуй SLA',
          body: 'Сроки должны учитывать окна изменений, тестирование и возможность компенсирующих мер.',
        },
        {
          title: 'Оставь рабочие артефакты',
          body: 'Нужны не презентации, а документы и правила, по которым команда реально будет исполнять процесс.',
        },
      ],
      outcome:
        'На выходе у процесса появляется язык, на котором смогут разговаривать между собой ИБ, ИТ и бизнес.',
    }
  }

  if (mission.kind === 'inventory' && activeTab === 'classification') {
    return {
      kicker: 'карта активов',
      title: 'Здесь мы не просто перечисляем системы, а связываем их с риском и режимом обработки.',
      body:
        'Категоризация нужна для того, чтобы дальше не спорить о важности актива постфактум. Важен не только хост, но и его роль в недопустимом событии.',
      points: [
        {
          title: 'Определи роль актива',
          body: 'Периметр, ключевые и целевые системы должны быть разделены без двусмысленности.',
        },
        {
          title: 'Назначь правильный SLA',
          body: 'Срок зависит от критичности и операционной реальности, а не только от яркости названия уязвимости.',
        },
        {
          title: 'Не путай special-case активы с обычными хостами',
          body: 'Legacy, mobile и virtual IP требуют отдельного режима учёта и контроля.',
        },
      ],
      outcome:
        'После этого шага видно, каким активам нужен быстрый цикл, а какие нельзя вести по стандартному шаблону.',
    }
  }

  if (mission.kind === 'inventory' && activeTab === 'scan') {
    return {
      kicker: 'контроль и покрытие',
      title: 'Теперь подбираем не “любой скан”, а уместный способ наблюдения за каждым классом активов.',
      body:
        'Сканирование должно быть достоверным и безопасным. Для части активов нужен аудит, для части discovery, а некоторые должны идти через agent или ручной контроль.',
      points: [
        {
          title: 'Выбери подходящий источник данных',
          body: 'Полный аудит полезен не везде: иногда безопаснее discovery, agent или manual-режим.',
        },
        {
          title: 'Исключай осознанно',
          body: 'Virtual IP и подобные сущности нужно выводить из host-логики без потери связи с периметром.',
        },
        {
          title: 'Смотри на достоверность',
          body: 'Главная цель этого шага — не покрытие ради покрытия, а доверие к реестру и будущим отчётам.',
        },
      ],
      outcome:
        'Хороший результат даёт реестр, которому можно верить, и стратегию контроля, которая не ломает инфраструктуру.',
    }
  }

  if (mission.kind === 'prioritization' && activeTab === 'queue') {
    return {
      kicker: 'первая волна',
      title: 'Сначала формируем первую очередь, которую ИТ действительно должна взять в работу.',
      body:
        'Emergency-слот ограничен. Поэтому сюда попадают только кейсы, которые сейчас дают кратчайший путь к недопустимому событию.',
      points: [
        {
          title: 'Собери первую волну',
          body: 'Вне очереди должны идти реальные hot-case, а не всё подряд с высоким severity.',
        },
        {
          title: 'Разнеси backlog по режимам',
          body: 'Срочно, планово, компенсирующие меры и принятие риска — это разные управленческие решения.',
        },
        {
          title: 'Думай ограниченным ресурсом',
          body: 'Если “срочно” становится всё, приоритизация перестаёт существовать.',
        },
      ],
      outcome:
        'После этого шага видно, какая часть backlog действительно должна ехать первой, а что можно перевести в управляемый план.',
    }
  }

  if (mission.kind === 'prioritization' && activeTab === 'factors') {
    return {
      kicker: 'аргументация',
      title: 'Теперь очередь нужно защитить факторами, а не только intuition и CVSS.',
      body:
        'Сильная приоритизация объяснима. Нужно показать, какие именно факторы делают кейс срочным: ущерб, значимость актива, доступность, эксплойт и тренд эксплуатации.',
      points: [
        {
          title: 'Выбери только релевантные факторы',
          body: 'Лишние причины размывают аргументацию и показывают, что решение собрано “на всякий случай”.',
        },
        {
          title: 'Связывай фактор с активом',
          body: 'Один и тот же CVSS весит по-разному на тестовом сервере и на целевой системе в периметре.',
        },
        {
          title: 'Покажи, почему ИТ должна согласиться',
          body: 'Очередь без обоснования быстро превращается в спор между функциями.',
        },
      ],
      outcome:
        'Хорошо собранный факторный слой делает очередь исполнимой и снимает часть конфликтов между безопасностью и эксплуатацией.',
    }
  }

  if (mission.kind === 'response' && activeTab === 'planning') {
    return {
      kicker: 'способ обработки',
      title: 'Не каждая уязвимость лечится патчем — здесь мы выбираем правильный режим обработки.',
      body:
        'На этом шаге важно не “закрыть задачу”, а подобрать действие, которое соответствует природе кейса: patch, config, WAF, monitoring или замена компонента.',
      points: [
        {
          title: 'Соотнеси кейс и метод',
          body: 'Misconfig чинится конфигурацией, zero-day без патча закрывается временной защитой, legacy переводится в исключение.',
        },
        {
          title: 'Выбери реалистичное окно',
          body: 'Emergency нужен не всегда. Иногда сильнее выглядит корректный planned-режим или formal exception.',
        },
        {
          title: 'Не подменяй снижение риска видимостью работы',
          body: 'Отправить тикет ещё не значит реально уменьшить поверхность атаки.',
        },
      ],
      outcome:
        'После этого шага у каждого кейса появляется не просто владелец, а осмысленный способ обработки и правильный темп исполнения.',
    }
  }

  if (mission.kind === 'response' && activeTab === 'control') {
    return {
      kicker: 'контроль результата',
      title: 'Закрытие кейса нужно подтвердить, иначе риск останется в системе под видом выполненной работы.',
      body:
        'Повторный скан, синхронизация с владельцем, мониторинг и пересмотр SLA — это не бюрократия, а доказательство, что решение реально сработало.',
      points: [
        {
          title: 'Выбери проверку по типу кейса',
          body: 'Не каждому кейсу нужен весь набор шагов; важна корректная комбинация контроля.',
        },
        {
          title: 'Фиксируй системные срывы',
          body: 'Если SLA стабильно нарушается, это уже вопрос к процессу, а не к одной конкретной задаче.',
        },
        {
          title: 'Не считай тикет доказательством',
          body: 'Процесс завершается не тогда, когда задача закрыта, а когда подтверждён результат.',
        },
      ],
      outcome:
        'Хороший контроль переводит устранение из формального статуса “сделано” в измеримый факт снижения риска.',
    }
  }

  if (mission.kind === 'response' && activeTab === 'playbook') {
    return {
      kicker: 'кризисный сценарий',
      title: 'Сейчас тренируем не ответ на один кейс, а последовательность действий команды под давлением.',
      body:
        'Плейбук нужен там, где нельзя позволить себе импровизацию: zero-day без патча, повторный срыв SLA, нестабильный периметр или высокое бизнес-давление.',
      points: [
        {
          title: 'Собери шаги в правильном порядке',
          body: 'Важно не только что делать, но и в какой момент: владельцы, временная защита, мониторинг, формализация исключения.',
        },
        {
          title: 'Держи эскалацию управляемой',
          body: 'Кризисный процесс не должен превращаться в хаотичную переписку без владельца и следующего шага.',
        },
        {
          title: 'Сохрани след для процесса',
          body: 'После кризиса команда должна не только потушить инцидент, но и обновить управленческий контур.',
        },
      ],
      outcome:
        'После этого шага видно, способен ли процесс удерживать редкие, но самые опасные сценарии без ручной самодеятельности.',
    }
  }

  return {
    kicker: 'разбор',
    title: 'Теперь посмотрим, что из решений выдержало практическую проверку.',
    body:
      'Разбор нужен не для галочки, а чтобы увидеть, где решение было действительно сильным, а где оно только выглядело аккуратно на экране.',
    points: [
      {
        title: 'Сильные решения',
        body: 'Сохраняем то, что можно повторять дальше без дополнительного ручного контроля.',
      },
      {
        title: 'Слабые места',
        body: 'Смотрим не только на ошибку, но и на её управленческое последствие для процесса.',
      },
      {
        title: 'Следующий модуль',
        body: 'Идём дальше только с пониманием, что именно стоит унести в следующую фазу.',
      },
    ],
    outcome:
      'Хороший разбор помогает не просто получить балл, а перенести правильную логику в следующий модуль.',
  }
}

function getContextStakeholder(mission: MissionState, activeTab: MissionTab) {
  if (activeTab === 'review') {
    return mission.stakeholders.find((stakeholder) => stakeholder.stance === 'ally') ?? mission.stakeholders[0]
  }

  return mission.stakeholders.find((stakeholder) => stakeholder.stance === 'resistant') ?? mission.stakeholders[0]
}

function getContextNote(mission: MissionState, activeTab: MissionTab) {
  if (mission.methodNotes.length === 0) {
    return null
  }

  let noteIndex = 0

  if (mission.kind === 'governance' && activeTab === 'agreements') {
    noteIndex = Math.min(2, mission.methodNotes.length - 1)
  } else if (mission.kind === 'inventory' && activeTab === 'scan') {
    noteIndex = Math.min(1, mission.methodNotes.length - 1)
  } else if (mission.kind === 'prioritization' && activeTab === 'factors') {
    noteIndex = Math.min(1, mission.methodNotes.length - 1)
  } else if (mission.kind === 'response' && activeTab === 'playbook') {
    noteIndex = Math.min(2, mission.methodNotes.length - 1)
  }

  return mission.methodNotes[noteIndex] ?? null
}

function getTabsForMission(mission: MissionState) {
  if (mission.kind === 'governance') {
    return [
      { id: 'charter', label: 'Контекст', icon: Radar },
      { id: 'agreements', label: 'Договорённости', icon: Network },
      { id: 'review', label: 'Разбор', icon: ShieldAlert },
    ]
  }

  if (mission.kind === 'inventory') {
    return [
      { id: 'classification', label: 'Карта активов', icon: Server },
      { id: 'scan', label: 'Контроль', icon: Radar },
      { id: 'review', label: 'Разбор', icon: ShieldAlert },
    ]
  }

  if (mission.kind === 'prioritization') {
    return [
      { id: 'queue', label: 'Первая волна', icon: Radar },
      { id: 'factors', label: 'Аргументы', icon: Network },
      { id: 'review', label: 'Разбор', icon: ShieldAlert },
    ]
  }

  return [
    { id: 'planning', label: 'Обработка', icon: Wrench },
    { id: 'control', label: 'Проверка', icon: BellRing },
    { id: 'playbook', label: 'Плейбук', icon: Network },
    { id: 'review', label: 'Разбор', icon: ShieldAlert },
  ]
}
