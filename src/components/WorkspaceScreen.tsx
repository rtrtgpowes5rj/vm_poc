import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  BellRing,
  Gauge,
  LayoutDashboard,
  Lightbulb,
  Map,
  Network,
  Radar,
  Search,
  Server,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Wrench,
} from 'lucide-react'
import type { MissionMetrics, MissionObjective, MissionReviewItem } from '../lib/mission'
import { createHintToken } from '../lib/hints'
import type {
  AssetRole,
  ChangeWindow,
  DashboardAudience,
  GovernanceMappingTask,
  GovernanceQuestion,
  ImprovementAction,
  InventoryAsset,
  KpiId,
  MaturityAuditCase,
  MaturityImprovementTask,
  MaturityPrinciple,
  MaturitySequenceTask,
  MetricsDashboardTask,
  MetricsInterpretationCase,
  MetricsKpiTask,
  MissionState,
  MissionTab,
  PdcaAction,
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
const audienceOptions: DashboardAudience[] = ['ciso', 'vm-analyst', 'it-admin']

function labelForAudience(audience: DashboardAudience) {
  switch (audience) {
    case 'ciso': return 'CISO'
    case 'vm-analyst': return 'VM-аналитик'
    case 'it-admin': return 'ИТ-администратор'
  }
}

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
  onToggleMetricsKpiOption,
  onToggleMetricsDashboardAudience,
  onToggleMetricsInterpretationAction,
  onToggleMaturityViolation,
  onToggleMaturityImprovementEntry,
  onMoveMaturitySequenceEntry,
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
  onToggleMetricsKpiOption: (taskId: string, optionId: KpiId) => void
  onToggleMetricsDashboardAudience: (taskId: string, rowId: string, audience: DashboardAudience) => void
  onToggleMetricsInterpretationAction: (caseId: string, actionId: PdcaAction) => void
  onToggleMaturityViolation: (caseId: string, principleId: MaturityPrinciple) => void
  onToggleMaturityImprovementEntry: (taskId: string, entryId: ImprovementAction) => void
  onMoveMaturitySequenceEntry: (taskId: string, entryId: string, move: RankingMove) => void
}) {
  const tabs = getTabsForMission(mission)
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

          {mission.kind === 'metrics' && activeTab === 'kpi' ? (
            <MetricsKpiSection
              hintBankRemaining={hintBankRemaining}
              tasks={mission.metricsKpiTasks ?? []}
              onRevealHint={onRevealHint}
              onToggleOption={onToggleMetricsKpiOption}
            />
          ) : null}

          {mission.kind === 'metrics' && activeTab === 'dashboard' ? (
            <MetricsDashboardSection
              hintBankRemaining={hintBankRemaining}
              tasks={mission.metricsDashboardTasks ?? []}
              onRevealHint={onRevealHint}
              onToggleAudience={onToggleMetricsDashboardAudience}
            />
          ) : null}

          {mission.kind === 'metrics' && activeTab === 'interpretation' ? (
            <MetricsInterpretationSection
              hintBankRemaining={hintBankRemaining}
              cases={mission.metricsInterpretationCases ?? []}
              onRevealHint={onRevealHint}
              onToggleAction={onToggleMetricsInterpretationAction}
            />
          ) : null}

          {mission.kind === 'improvement' && activeTab === 'audit' ? (
            <MaturityAuditSection
              hintBankRemaining={hintBankRemaining}
              cases={mission.maturityAuditCases ?? []}
              onRevealHint={onRevealHint}
              onToggleViolation={onToggleMaturityViolation}
            />
          ) : null}

          {mission.kind === 'improvement' && activeTab === 'improvement' ? (
            <MaturityImprovementSection
              hintBankRemaining={hintBankRemaining}
              tasks={mission.maturityImprovementTasks ?? []}
              onRevealHint={onRevealHint}
              onToggleEntry={onToggleMaturityImprovementEntry}
            />
          ) : null}

          {mission.kind === 'improvement' && activeTab === 'roadmap' ? (
            <MaturityRoadmapSection
              hintBankRemaining={hintBankRemaining}
              tasks={mission.maturitySequenceTasks ?? []}
              onMoveEntry={onMoveMaturitySequenceEntry}
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

function MetricsKpiSection({
  hintBankRemaining,
  tasks,
  onRevealHint,
  onToggleOption,
}: {
  hintBankRemaining: number
  tasks: MetricsKpiTask[]
  onRevealHint: (itemId: string) => void
  onToggleOption: (taskId: string, optionId: KpiId) => void
}) {
  return (
    <Panel title="Подбор KPI по аудитории" icon={BarChart3}>
      <div className="scenario-list">
        {tasks.map((task) => (
          <div key={task.id} className="scenario-card">
            <div className="scenario-card__head">
              <div>
                <strong>{task.title}</strong>
                <p>{task.prompt}</p>
              </div>
              <StatusBadge
                tone="progress"
                label={task.selectedOptionIds.length === 0 ? 'не заполнено' : `${task.selectedOptionIds.length} KPI выбрано`}
              />
            </div>

            <div className="scenario-meta">
              <span className="inline-tag">аудитория: {labelForAudience(task.targetAudience)}</span>
              <span className={`inline-tag inline-tag--${task.importance}`}>
                {task.importance === 'critical' ? 'critical' : 'important'}
              </span>
            </div>

            <div className="choice-grid">
              {task.options.map((option) => (
                <ChoiceButton
                  key={option.id}
                  active={task.selectedOptionIds.includes(option.id)}
                  onClick={() => onToggleOption(task.id, option.id)}
                >
                  <span className="choice-button__stack">
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </span>
                </ChoiceButton>
              ))}
            </div>

            <ScenarioFooter
              hintBankRemaining={hintBankRemaining}
              hintText={task.hint ?? 'Каждая аудитория видит процесс VM со своего уровня. CISO управляет стратегически, аналитик — операционно, ИТ-администратор — тактически.'}
              hintUsed={task.hintUsed}
              hintToken={createHintToken('metricsKpiTasks', task.id)}
              onRevealHint={onRevealHint}
              selectionLabel={`Выбрано ${task.selectedOptionIds.length} KPI`}
            />
          </div>
        ))}
      </div>
    </Panel>
  )
}

function MetricsDashboardSection({
  hintBankRemaining,
  tasks,
  onRevealHint,
  onToggleAudience,
}: {
  hintBankRemaining: number
  tasks: MetricsDashboardTask[]
  onRevealHint: (itemId: string) => void
  onToggleAudience: (taskId: string, rowId: string, audience: DashboardAudience) => void
}) {
  return (
    <Panel title="Матрица дашбордов" icon={LayoutDashboard}>
      <div className="scenario-list">
        {tasks.map((task) => {
          const answeredRows = task.rows.filter((r) => r.selectedAudiences.length > 0).length

          return (
            <div key={task.id} className="scenario-card">
              <div className="scenario-card__head">
                <div>
                  <strong>{task.title}</strong>
                  <p>{task.prompt}</p>
                </div>
                <StatusBadge
                  tone="progress"
                  label={answeredRows === 0 ? 'не заполнено' : `${answeredRows}/${task.rows.length} строк`}
                />
              </div>

              <div className="dashboard-matrix">
                <div className="dashboard-matrix__header">
                  <div className="dashboard-matrix__cell dashboard-matrix__cell--label">KPI</div>
                  {audienceOptions.map((a) => (
                    <div key={a} className="dashboard-matrix__cell dashboard-matrix__cell--header">
                      {labelForAudience(a)}
                    </div>
                  ))}
                </div>
                {task.rows.map((row) => (
                  <div key={row.id} className="dashboard-matrix__row">
                    <div className="dashboard-matrix__cell dashboard-matrix__cell--label">
                      <strong>{row.kpiLabel}</strong>
                      <small>{row.kpiDescription}</small>
                    </div>
                    {audienceOptions.map((audience) => (
                      <div key={audience} className="dashboard-matrix__cell">
                        <button
                          type="button"
                          className={`matrix-toggle ${row.selectedAudiences.includes(audience) ? 'matrix-toggle--active' : ''}`}
                          onClick={() => onToggleAudience(task.id, row.id, audience)}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <ScenarioFooter
                hintBankRemaining={hintBankRemaining}
                hintText={task.hint ?? 'Не каждый KPI нужен каждой аудитории. CISO смотрит на тренды и % покрытия, аналитик — на блокеры и SLA-нарушения, ИТ-администратор — на свою очередь.'}
                hintUsed={task.hintUsed}
                hintToken={createHintToken('metricsDashboardTasks', task.id)}
                onRevealHint={onRevealHint}
                selectionLabel={`${answeredRows}/${task.rows.length} KPI размечены`}
              />
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

function MetricsInterpretationSection({
  hintBankRemaining,
  cases,
  onRevealHint,
  onToggleAction,
}: {
  hintBankRemaining: number
  cases: MetricsInterpretationCase[]
  onRevealHint: (itemId: string) => void
  onToggleAction: (caseId: string, actionId: PdcaAction) => void
}) {
  return (
    <Panel title="PDCA: чтение отклонений" icon={TrendingUp}>
      <div className="scenario-list">
        {cases.map((item) => (
          <div key={item.id} className="scenario-card">
            <div className="scenario-card__head">
              <div>
                <strong>{item.title}</strong>
                <p>{item.prompt}</p>
              </div>
              <StatusBadge
                tone="progress"
                label={item.selectedActionIds.length === 0 ? 'не заполнено' : `${item.selectedActionIds.length} действий`}
              />
            </div>

            <div className="snapshot-compare">
              <div className="snapshot-compare__col">
                <div className="snapshot-compare__label">{item.snapshots[0].month}</div>
                <div className="snapshot-compare__metrics">
                  <span>Покрытие: {item.snapshots[0].coveragePct}%</span>
                  <span>SLA-нарушения: {item.snapshots[0].slaBreachPct}%</span>
                  <span>Trending: {item.snapshots[0].trendingCount}</span>
                  <span>Avg remediation: {item.snapshots[0].avgRemediationDays}д</span>
                  <span>Блокеры: {item.snapshots[0].blockingCount}</span>
                </div>
                {item.snapshots[0].annotation ? (
                  <p className="snapshot-compare__note">{item.snapshots[0].annotation}</p>
                ) : null}
              </div>
              <div className="snapshot-compare__col">
                <div className="snapshot-compare__label">{item.snapshots[1].month}</div>
                <div className="snapshot-compare__metrics">
                  <span>Покрытие: {item.snapshots[1].coveragePct}%</span>
                  <span>SLA-нарушения: {item.snapshots[1].slaBreachPct}%</span>
                  <span>Trending: {item.snapshots[1].trendingCount}</span>
                  <span>Avg remediation: {item.snapshots[1].avgRemediationDays}д</span>
                  <span>Блокеры: {item.snapshots[1].blockingCount}</span>
                </div>
                {item.snapshots[1].annotation ? (
                  <p className="snapshot-compare__note">{item.snapshots[1].annotation}</p>
                ) : null}
              </div>
            </div>

            <div className="scenario-insight">
              <strong>Проблема</strong>
              <p>{item.problemStatement}</p>
            </div>

            <div className="choice-grid">
              {item.actionOptions.map((option) => (
                <ChoiceButton
                  key={option.id}
                  active={item.selectedActionIds.includes(option.id)}
                  onClick={() => onToggleAction(item.id, option.id)}
                >
                  <span className="choice-button__stack">
                    <strong>{option.label}</strong>
                    <small>{option.reasoning}</small>
                  </span>
                </ChoiceButton>
              ))}
            </div>

            <ScenarioFooter
              hintBankRemaining={hintBankRemaining}
              hintText={item.hint ?? 'PDCA-Check — не просто "посмотреть на дашборд". Сравните два периода и определите, это системная проблема процесса или разовое отклонение.'}
              hintUsed={item.hintUsed}
              hintToken={createHintToken('metricsInterpretationCases', item.id)}
              onRevealHint={onRevealHint}
              selectionLabel={`Выбрано действий: ${item.selectedActionIds.length}`}
            />
          </div>
        ))}
      </div>
    </Panel>
  )
}

function MaturityAuditSection({
  hintBankRemaining,
  cases,
  onRevealHint,
  onToggleViolation,
}: {
  hintBankRemaining: number
  cases: MaturityAuditCase[]
  onRevealHint: (itemId: string) => void
  onToggleViolation: (caseId: string, principleId: MaturityPrinciple) => void
}) {
  return (
    <Panel title="Диагностика принципов" icon={Search}>
      <div className="scenario-list">
        {cases.map((item) => (
          <div key={item.id} className="scenario-card">
            <div className="scenario-card__head">
              <div>
                <strong>{item.title}</strong>
                <p>{item.prompt}</p>
              </div>
              <StatusBadge
                tone="progress"
                label={item.selectedViolationIds.length === 0 ? 'не заполнено' : `${item.selectedViolationIds.length} принципов`}
              />
            </div>

            <div className="scenario-insight">
              <strong>Описание ситуации</strong>
              <p>{item.scenarioDescription}</p>
            </div>

            <div className="choice-grid">
              {item.violationOptions.map((option) => (
                <ChoiceButton
                  key={option.id}
                  active={item.selectedViolationIds.includes(option.id)}
                  onClick={() => onToggleViolation(item.id, option.id)}
                >
                  <span className="choice-button__stack">
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </span>
                </ChoiceButton>
              ))}
            </div>

            <ScenarioFooter
              hintBankRemaining={hintBankRemaining}
              hintText={item.hint ?? 'Сценарий может нарушать несколько принципов одновременно. Ищите корневые причины, а не симптомы.'}
              hintUsed={item.hintUsed}
              hintToken={createHintToken('maturityAuditCases', item.id)}
              onRevealHint={onRevealHint}
              selectionLabel={`Принципов выбрано: ${item.selectedViolationIds.length}`}
            />
          </div>
        ))}
      </div>
    </Panel>
  )
}

function MaturityImprovementSection({
  hintBankRemaining,
  tasks,
  onRevealHint,
  onToggleEntry,
}: {
  hintBankRemaining: number
  tasks: MaturityImprovementTask[]
  onRevealHint: (itemId: string) => void
  onToggleEntry: (taskId: string, entryId: ImprovementAction) => void
}) {
  return (
    <Panel title="Приоритетные улучшения" icon={TrendingUp}>
      <div className="scenario-list">
        {tasks.map((task) => {
          const selectedCount = task.selectedEntryIds.length

          return (
            <div key={task.id} className="scenario-card">
              <div className="scenario-card__head">
                <div>
                  <strong>{task.title}</strong>
                  <p>{task.prompt}</p>
                </div>
                <StatusBadge
                  tone="progress"
                  label={selectedCount === 0 ? 'не заполнено' : `${selectedCount}/${task.selectionLimit} выбрано`}
                />
              </div>

              <div className="choice-grid">
                {task.entries.map((entry) => {
                  const active = task.selectedEntryIds.includes(entry.id)
                  const limitReached = selectedCount >= task.selectionLimit && !active

                  return (
                    <ChoiceButton
                      key={entry.id}
                      active={active}
                      disabled={limitReached}
                      onClick={() => onToggleEntry(task.id, entry.id)}
                    >
                      <span className="choice-button__stack">
                        <strong>{entry.title}</strong>
                        <small>{entry.rationale}</small>
                        <small className={`inline-tag inline-tag--${entry.impact === 'high' ? 'critical' : entry.impact === 'medium' ? 'important' : 'low'}`}>
                          impact: {entry.impact}
                        </small>
                      </span>
                    </ChoiceButton>
                  )
                })}
              </div>

              <ScenarioFooter
                hintBankRemaining={hintBankRemaining}
                hintText={task.hint ?? 'Фундамент (данные и договорённости) всегда раньше автоматизации. Без CMDB и согласованного SLA любые надстройки ненадёжны.'}
                hintUsed={task.hintUsed}
                hintToken={createHintToken('maturityImprovementTasks', task.id)}
                onRevealHint={onRevealHint}
                selectionLabel={`${selectedCount}/${task.selectionLimit} слотов занято`}
              />
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

function MaturityRoadmapSection({
  hintBankRemaining,
  tasks,
  onMoveEntry,
  onRevealHint,
}: {
  hintBankRemaining: number
  tasks: MaturitySequenceTask[]
  onMoveEntry: (taskId: string, entryId: string, move: RankingMove) => void
  onRevealHint: (itemId: string) => void
}) {
  return (
    <Panel title="Дорожная карта изменений" icon={Map}>
      <div className="scenario-list">
        {tasks.map((task) => (
          <div key={task.id} className="scenario-card scenario-card--priority">
            <div className="scenario-card__head">
              <div>
                <strong>{task.title}</strong>
                <p>{task.prompt}</p>
              </div>
              <StatusBadge tone="progress" label={!task.touched ? 'не собрано' : `${task.selectedOrderIds.length} позиций`} />
            </div>

            <div className="ranking-list">
              {task.selectedOrderIds.map((entryId, index) => {
                const entry = task.entries.find((item) => item.id === entryId)
                if (!entry) return null

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
                        onClick={() => onMoveEntry(task.id, entry.id, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => onMoveEntry(task.id, entry.id, 'down')}
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
              hintText={task.hint ?? 'Порядок организационных изменений: сначала договорённости и данные, затем автоматизация, потом измерение. Нельзя измерять то, чего ещё нет.'}
              hintUsed={task.hintUsed}
              hintToken={createHintToken('maturitySequenceTasks', task.id)}
              onRevealHint={onRevealHint}
              selectionLabel={task.touched ? 'Дорожная карта перестроена' : 'Ожидается корректный порядок'}
            />
          </div>
        ))}
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
  } else if (mission.kind === 'metrics' && activeTab === 'dashboard') {
    noteIndex = Math.min(1, mission.methodNotes.length - 1)
  } else if (mission.kind === 'metrics' && activeTab === 'interpretation') {
    noteIndex = Math.min(2, mission.methodNotes.length - 1)
  } else if (mission.kind === 'improvement' && activeTab === 'improvement') {
    noteIndex = Math.min(1, mission.methodNotes.length - 1)
  } else if (mission.kind === 'improvement' && activeTab === 'roadmap') {
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

  if (mission.kind === 'metrics') {
    return [
      { id: 'kpi', label: 'KPI', icon: BarChart3 },
      { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
      { id: 'interpretation', label: 'PDCA', icon: TrendingUp },
      { id: 'review', label: 'Разбор', icon: ShieldAlert },
    ]
  }

  if (mission.kind === 'improvement') {
    return [
      { id: 'audit', label: 'Диагностика', icon: Search },
      { id: 'improvement', label: 'Улучшения', icon: TrendingUp },
      { id: 'roadmap', label: 'Дорожная карта', icon: Map },
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
