import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BellRing,
  BookOpenCheck,
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
  ReviewBadge,
  ReviewItemCard,
  StakeholderCard,
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
  onSetPriorityDecision,
  onTogglePriorityFactor,
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
  onSetPriorityDecision: (caseId: string, decision: PriorityDecision) => void
  onTogglePriorityFactor: (caseId: string, factor: PriorityFactor) => void
  onSetResponseMethod: (caseId: string, method: TaskMethod) => void
  onSetResponseWindow: (caseId: string, window: ChangeWindow) => void
  onToggleResponseVerification: (caseId: string, step: VerificationStep) => void
}) {
  const tabs = getTabsForMission(mission)
  const reviewMap = new Map(reviewItems.map((item) => [item.id, item]))

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

      <div className="workspace-grid">
        <aside className="left-rail">
          <Panel title="Цели фазы" icon={ShieldAlert}>
            <div className="objective-list">
              {objectives.map((objective) => (
                <div
                  key={objective.id}
                  className={`objective-card ${objective.complete ? 'objective-card--done' : ''}`}
                >
                  <div className="objective-card__head">
                    <strong>{objective.title}</strong>
                    <span>{objective.complete ? 'ok' : 'in progress'}</span>
                  </div>
                  <p>{objective.caption}</p>
                  <span>{objective.progressLabel}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Методические опоры" icon={BookOpenCheck}>
            <div className="method-note-list">
              {mission.methodNotes.map((note) => (
                <div key={note.id} className="method-note">
                  <strong>{note.title}</strong>
                  <p>{note.body}</p>
                  <small>{note.source}</small>
                </div>
              ))}
            </div>
          </Panel>
        </aside>

        <div className="center-stage">
          {mission.kind === 'governance' && activeTab === 'charter' ? (
            <GovernanceSection
              hintBankRemaining={hintBankRemaining}
              mappingTasks={(mission.governanceMappingTasks ?? []).filter(
                (item) => item.section === 'charter',
              )}
              questions={(mission.governanceQuestions ?? []).filter((item) => item.section === 'charter')}
              reviewMap={reviewMap}
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
              reviewMap={reviewMap}
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
              reviewMap={reviewMap}
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
              reviewMap={reviewMap}
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
              reviewMap={reviewMap}
              onMovePriorityRankingEntry={onMovePriorityRankingEntry}
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
              reviewMap={reviewMap}
              onMovePriorityRankingEntry={onMovePriorityRankingEntry}
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
              reviewMap={reviewMap}
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
              reviewMap={reviewMap}
              onRevealHint={onRevealHint}
              onSetResponseMethod={onSetResponseMethod}
              onSetResponseWindow={onSetResponseWindow}
              onToggleResponseVerification={onToggleResponseVerification}
            />
          ) : null}

          {activeTab === 'review' ? <ReviewSection reviewItems={reviewItems} /> : null}
        </div>

        <aside className="right-rail">
          <Panel title="Mission Pulse" icon={Gauge}>
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

          <Panel title="Сигналы и ограничения" icon={BellRing}>
            <div className="alert-list">
              {mission.alerts.map((alert) => (
                <div key={alert.id} className={`alert-card alert-card--${alert.kind}`}>
                  <div className="alert-card__topline">
                    <strong>{alert.title}</strong>
                    <span>{alert.timeLabel}</span>
                  </div>
                  <p>{alert.summary}</p>
                  <small>{alert.cta}</small>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Участники процесса" icon={Network}>
            {mission.stakeholders.map((stakeholder) => (
              <StakeholderCard key={stakeholder.id} stakeholder={stakeholder} />
            ))}
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
  reviewMap,
  onRevealHint,
  onSetGovernanceMappingRole,
  onToggleGovernanceOption,
}: {
  hintBankRemaining: number
  mappingTasks: GovernanceMappingTask[]
  questions: GovernanceQuestion[]
  reviewMap: Map<string, MissionReviewItem>
  onRevealHint: (itemId: string) => void
  onSetGovernanceMappingRole: (taskId: string, rowId: string, role: AssetRole) => void
  onToggleGovernanceOption: (questionId: string, optionId: string) => void
}) {
  return (
    <Panel title="Процессные решения" icon={Radar}>
      <div className="scenario-list">
        {questions.map((question) => {
          const reviewItem = reviewMap.get(question.id)

          return (
            <div key={question.id} className="scenario-card">
              <div className="scenario-card__head">
                <div>
                  <strong>{question.title}</strong>
                  <p>{question.prompt}</p>
                </div>
                {reviewItem ? <ReviewBadge status={reviewItem.status} /> : null}
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
                itemId={question.id}
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
          const reviewItem = reviewMap.get(task.id)

          return (
            <div key={task.id} className="scenario-card">
              <div className="scenario-card__head">
                <div>
                  <strong>{task.title}</strong>
                  <p>{task.prompt}</p>
                </div>
                {reviewItem ? <ReviewBadge status={reviewItem.status} /> : null}
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
                itemId={task.id}
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
  reviewMap,
  onRevealHint,
  onSetInventoryRole,
  onSetInventoryScanStrategy,
  onSetInventorySla,
}: {
  assets: InventoryAsset[]
  hintBankRemaining: number
  mode: 'classification' | 'scan'
  reviewMap: Map<string, MissionReviewItem>
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
          const reviewItem = reviewMap.get(asset.id)

          return (
            <div key={asset.id} className="scenario-card">
              <div className="scenario-card__head">
                <div>
                  <strong>{asset.name}</strong>
                  <p>{asset.description}</p>
                </div>
                {reviewItem ? <ReviewBadge status={reviewItem.status} /> : null}
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
                itemId={asset.id}
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
  reviewMap,
  onMovePriorityRankingEntry,
  onRevealHint,
  onSetPriorityDecision,
  onTogglePriorityFactor,
}: {
  hintBankRemaining: number
  mission: MissionState
  mode: 'queue' | 'factors'
  reviewMap: Map<string, MissionReviewItem>
  onMovePriorityRankingEntry: (taskId: string, entryId: string, move: RankingMove) => void
  onRevealHint: (itemId: string) => void
  onSetPriorityDecision: (caseId: string, decision: PriorityDecision) => void
  onTogglePriorityFactor: (caseId: string, factor: PriorityFactor) => void
}) {
  const cases = mission.prioritizationCases ?? []
  const rankingTasks = (mission.prioritizationRankingTasks ?? []).filter(
    (task) => task.section === mode,
  )

  return (
    <Panel
      title={mode === 'queue' ? 'Очередь устранения' : 'Факторное обоснование'}
      icon={Radar}
    >
      <div className="scenario-list">
        {rankingTasks.map((task) => {
          const reviewItem = reviewMap.get(task.id)

          return (
            <div key={task.id} className="scenario-card scenario-card--priority">
              <div className="scenario-card__head">
                <div>
                  <strong>{task.title}</strong>
                  <p>{task.prompt}</p>
                </div>
                {reviewItem ? <ReviewBadge status={reviewItem.status} /> : null}
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
                itemId={task.id}
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
          const reviewItem = reviewMap.get(item.id)

          return (
            <div key={item.id} className="scenario-card">
              <div className="scenario-card__head">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.summary}</p>
                </div>
                {reviewItem ? <ReviewBadge status={reviewItem.status} /> : null}
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
                itemId={item.id}
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
  reviewMap,
  onRevealHint,
  onSetResponseMethod,
  onSetResponseWindow,
  onToggleResponseVerification,
}: {
  cases: ResponseCase[]
  hintBankRemaining: number
  mode: 'planning' | 'control'
  reviewMap: Map<string, MissionReviewItem>
  onRevealHint: (itemId: string) => void
  onSetResponseMethod: (caseId: string, method: TaskMethod) => void
  onSetResponseWindow: (caseId: string, window: ChangeWindow) => void
  onToggleResponseVerification: (caseId: string, step: VerificationStep) => void
}) {
  return (
    <Panel title={mode === 'planning' ? 'План устранения' : 'Контроль устранения'} icon={Wrench}>
      <div className="scenario-list">
        {cases.map((item) => {
          const reviewItem = reviewMap.get(item.id)

          return (
            <div key={item.id} className="scenario-card">
              <div className="scenario-card__head">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.summary}</p>
                </div>
                {reviewItem ? <ReviewBadge status={reviewItem.status} /> : null}
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
                itemId={item.id}
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
  itemId,
  onRevealHint,
  selectionLabel,
}: {
  hintBankRemaining: number
  hintText: string
  hintUsed?: boolean
  itemId: string
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
          onClick={() => onRevealHint(itemId)}
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

function getResponseHint(item: ResponseCase) {
  if (item.title.toLowerCase().includes('zero-day')) {
    return 'Когда патча ещё нет, корректная реакция обычно лежит в зоне временной защиты, ограничений доступа и усиленного мониторинга.'
  }

  return 'Способ обработки должен соответствовать природе кейса: misconfig лечится не патчем, а legacy без патча не притворяется обычным SLA.'
}

function getTabsForMission(mission: MissionState) {
  if (mission.kind === 'governance') {
    return [
      { id: 'charter', label: 'Каркас процесса', icon: Radar },
      { id: 'agreements', label: 'Роли и SLA', icon: Network },
      { id: 'review', label: 'Разбор', icon: ShieldAlert },
    ]
  }

  if (mission.kind === 'inventory') {
    return [
      { id: 'classification', label: 'Категоризация', icon: Server },
      { id: 'scan', label: 'Сканирование', icon: Radar },
      { id: 'review', label: 'Разбор', icon: ShieldAlert },
    ]
  }

  if (mission.kind === 'prioritization') {
    return [
      { id: 'queue', label: 'Очередь', icon: Radar },
      { id: 'factors', label: 'Факторы', icon: Network },
      { id: 'review', label: 'Разбор', icon: ShieldAlert },
    ]
  }

  return [
    { id: 'planning', label: 'План', icon: Wrench },
    { id: 'control', label: 'Контроль', icon: BellRing },
    { id: 'review', label: 'Разбор', icon: ShieldAlert },
  ]
}
