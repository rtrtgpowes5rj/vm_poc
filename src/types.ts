export type AppStage = 'campaign' | 'brief' | 'workspace' | 'debrief'

export type MissionTab = string

export type MissionStatus = 'available' | 'locked' | 'active' | 'completed'

export type MissionKind = 'governance' | 'inventory' | 'prioritization' | 'response' | 'metrics' | 'improvement'

export type Importance = 'critical' | 'important'

export type Severity = 'critical' | 'high' | 'medium' | 'low'

export type StakeholderStance = 'ally' | 'neutral' | 'resistant'

export type AlertKind = 'intel' | 'ops' | 'business' | 'method'

export type AssetRole = 'entry-point' | 'target' | 'key' | 'support' | 'test'

export type ScanStrategy = 'audit' | 'discovery' | 'agent' | 'manual' | 'exclude'

export type SlaTier = '24h' | '72h' | '5d' | 'exception'

export type PriorityDecision = 'urgent' | 'planned' | 'compensating' | 'accepted'

export type PriorityFactor =
  | 'impact'
  | 'asset-criticality'
  | 'exploit'
  | 'accessibility'
  | 'trend'

export type TaskMethod = 'patch' | 'config' | 'waf' | 'monitoring' | 'replace'

export type ChangeWindow = 'emergency' | 'planned' | 'exception' | 'defer'

export type VerificationStep = 'rescan' | 'owner-sync' | 'sla-review' | 'monitoring'

export type RankingMove = 'up' | 'down'

// VM-05 types
export type KpiId =
  | 'coverage-pct'
  | 'sla-breach-pct'
  | 'trending-count'
  | 'avg-remediation-days'
  | 'blocking-count'
  | 'risk-score'
  | 'assets-without-owner'
  | 'false-positive-rate'

export type DashboardAudience = 'ciso' | 'vm-analyst' | 'it-admin'

export type PdcaAction =
  | 'update-sla'
  | 'expand-coverage'
  | 'escalate-to-ciso'
  | 'run-additional-scan'
  | 'revise-process'
  | 'accept-temporarily'
  | 'add-monitoring'
  | 'retrain-team'

// VM-06 types
export type MaturityPrinciple =
  | 'minimize-human-dependency'
  | 'just-in-time'
  | 'accuracy'
  | 'deviation-management'
  | 'self-control'
  | 'explicit-communication'
  | 'embedded-in-process'
  | 'right-tools'

export type ImprovementAction =
  | 'build-cmdb'
  | 'negotiate-sla-trilateral'
  | 'add-trending-feed'
  | 'deploy-agents'
  | 'formalize-playbook'
  | 'add-dashboard'
  | 'schedule-pdca-review'
  | 'add-exception-process'
  | 'train-it-owners'
  | 'automate-ticketing'

// Achievement types
export type AchievementId =
  | 'zero-hint-run'
  | 'emergency-responder'
  | 'perfect-prioritization'
  | 'risk-manager'
  | 'process-architect'
  | 'pdca-master'
  | 'maturity-auditor'

export interface Achievement {
  id: AchievementId
  title: string
  description: string
  unlockedAt?: string
}

// Cross-mission inherited context
export interface InheritedContextItem {
  id: string
  title: string
  value: string
}

export interface InheritedContext {
  sourceCode: string
  sourceMissionId: string
  label: string
  items: InheritedContextItem[]
}

export interface Hintable {
  hint?: string
  hintUsed?: boolean
}

export interface CampaignChapter {
  id: string
  phase: string
  title: string
  summary: string
  stakes: string
  estimated: string
  status: MissionStatus
  implemented: boolean
}

export interface Stakeholder {
  id: string
  name: string
  role: string
  stance: StakeholderStance
  pressure: string
  quote: string
  reactionPositive?: string
  reactionNegative?: string
}

export interface AlertItem {
  id: string
  kind: AlertKind
  title: string
  summary: string
  timeLabel: string
  cta: string
}

export interface MethodNote {
  id: string
  title: string
  body: string
  source: string
}

export interface GovernanceOption {
  id: string
  label: string
}

export interface GovernanceQuestion extends Hintable {
  id: string
  section: 'charter' | 'agreements'
  title: string
  prompt: string
  multi: boolean
  importance: Importance
  explanation: string
  options: GovernanceOption[]
  correctOptionIds: string[]
  selectedOptionIds: string[]
}

export interface GovernanceMappingRow {
  id: string
  assetName: string
  context: string
  expectedRole: AssetRole
  selectedRole: AssetRole | null
}

export interface GovernanceMappingTask extends Hintable {
  id: string
  section: 'charter' | 'agreements'
  title: string
  prompt: string
  importance: Importance
  explanation: string
  rows: GovernanceMappingRow[]
}

export interface InventoryAsset extends Hintable {
  id: string
  name: string
  zone: string
  owner: string
  description: string
  sources: string[]
  importance: Importance
  explanation: string
  selectedRole: AssetRole | null
  expectedRole: AssetRole
  selectedScanStrategy: ScanStrategy | null
  expectedScanStrategy: ScanStrategy
  selectedSla: SlaTier | null
  expectedSla: SlaTier
}

export interface PrioritizationCase extends Hintable {
  id: string
  title: string
  assetName: string
  zone: string
  severity: Severity
  cvss: number
  summary: string
  whyNow: string
  importance: Importance
  hasExploit: boolean
  trending: boolean
  selectedDecision: PriorityDecision | null
  correctDecision: PriorityDecision
  selectedFactors: PriorityFactor[]
  requiredFactors: PriorityFactor[]
  allowedFactors?: PriorityFactor[]
  explanation: string
}

export interface PrioritizationWaveOption {
  id: string
  title: string
  cue: string
}

export interface PrioritizationWaveTask extends Hintable {
  id: string
  section: 'queue'
  title: string
  prompt: string
  importance: Importance
  explanation: string
  selectionLimit: number
  options: PrioritizationWaveOption[]
  correctOptionIds: string[]
  selectedOptionIds: string[]
}

export interface PrioritizationRankingEntry {
  id: string
  title: string
  cue: string
}

export interface PrioritizationRankingTask extends Hintable {
  id: string
  section: 'queue' | 'factors'
  title: string
  prompt: string
  importance: Importance
  explanation: string
  entries: PrioritizationRankingEntry[]
  correctOrderIds: string[]
  selectedOrderIds: string[]
  touched: boolean
}

export interface ResponseCase extends Hintable {
  id: string
  title: string
  assetName: string
  summary: string
  limitation: string
  importance: Importance
  selectedMethod: TaskMethod | null
  correctMethod: TaskMethod
  selectedWindow: ChangeWindow | null
  correctWindow: ChangeWindow
  selectedVerification: VerificationStep[]
  requiredVerification: VerificationStep[]
  allowedVerification?: VerificationStep[]
  explanation: string
}

export interface ResponseSequenceEntry {
  id: string
  title: string
  cue: string
}

export interface ResponseSequenceTask extends Hintable {
  id: string
  section: 'playbook'
  title: string
  prompt: string
  importance: Importance
  explanation: string
  entries: ResponseSequenceEntry[]
  correctOrderIds: string[]
  selectedOrderIds: string[]
  touched: boolean
}

// VM-05 interfaces
export interface MetricsKpiOption {
  id: KpiId
  label: string
  description: string
  isDistractor: boolean
}

export interface MetricsKpiTask extends Hintable {
  id: string
  section: 'kpi' | 'dashboard' | 'interpretation'
  targetAudience: DashboardAudience
  title: string
  prompt: string
  importance: Importance
  explanation: string
  options: MetricsKpiOption[]
  correctOptionIds: KpiId[]
  selectedOptionIds: KpiId[]
}

export interface MetricsDashboardRow {
  id: string
  kpiId: KpiId
  kpiLabel: string
  kpiDescription: string
  correctAudiences: DashboardAudience[]
  selectedAudiences: DashboardAudience[]
}

export interface MetricsDashboardTask extends Hintable {
  id: string
  section: 'kpi' | 'dashboard' | 'interpretation'
  title: string
  prompt: string
  importance: Importance
  explanation: string
  rows: MetricsDashboardRow[]
}

export interface MetricsSnapshot {
  month: string
  coveragePct: number
  slaBreachPct: number
  trendingCount: number
  avgRemediationDays: number
  blockingCount: number
  annotation?: string
}

export interface MetricsInterpretationOption {
  id: PdcaAction
  label: string
  reasoning: string
}

export interface MetricsInterpretationCase extends Hintable {
  id: string
  section: 'kpi' | 'dashboard' | 'interpretation'
  title: string
  prompt: string
  importance: Importance
  explanation: string
  snapshots: [MetricsSnapshot, MetricsSnapshot]
  problemStatement: string
  actionOptions: MetricsInterpretationOption[]
  correctActionIds: PdcaAction[]
  selectedActionIds: PdcaAction[]
}

// VM-06 interfaces
export interface MaturityViolationOption {
  id: MaturityPrinciple
  label: string
  description: string
}

export interface MaturityAuditCase extends Hintable {
  id: string
  section: 'audit' | 'improvement' | 'roadmap'
  title: string
  prompt: string
  scenarioDescription: string
  importance: Importance
  explanation: string
  violationOptions: MaturityViolationOption[]
  correctViolationIds: MaturityPrinciple[]
  selectedViolationIds: MaturityPrinciple[]
}

export interface MaturityImprovementEntry {
  id: ImprovementAction
  title: string
  rationale: string
  impact: 'high' | 'medium' | 'low'
}

export interface MaturityImprovementTask extends Hintable {
  id: string
  section: 'audit' | 'improvement' | 'roadmap'
  title: string
  prompt: string
  importance: Importance
  explanation: string
  selectionLimit: number
  entries: MaturityImprovementEntry[]
  correctEntryIds: ImprovementAction[]
  selectedEntryIds: ImprovementAction[]
}

export interface MaturitySequenceEntry {
  id: string
  title: string
  cue: string
}

export interface MaturitySequenceTask extends Hintable {
  id: string
  section: 'audit' | 'improvement' | 'roadmap'
  title: string
  prompt: string
  importance: Importance
  explanation: string
  entries: MaturitySequenceEntry[]
  correctOrderIds: string[]
  selectedOrderIds: string[]
  touched: boolean
}

export interface MissionBlueprint {
  id: string
  code: string
  kind: MissionKind
  title: string
  narrative: string
  environment: string
  briefing: string
  learningGoals: string[]
  failureModes: string[]
  methodNotes: MethodNote[]
  alerts: AlertItem[]
  stakeholders: Stakeholder[]
  governanceQuestions?: GovernanceQuestion[]
  governanceMappingTasks?: GovernanceMappingTask[]
  inventoryAssets?: InventoryAsset[]
  prioritizationCases?: PrioritizationCase[]
  prioritizationRankingTasks?: PrioritizationRankingTask[]
  prioritizationWaveTasks?: PrioritizationWaveTask[]
  responseCases?: ResponseCase[]
  responseSequenceTasks?: ResponseSequenceTask[]
  metricsKpiTasks?: MetricsKpiTask[]
  metricsDashboardTasks?: MetricsDashboardTask[]
  metricsInterpretationCases?: MetricsInterpretationCase[]
  maturityAuditCases?: MaturityAuditCase[]
  maturityImprovementTasks?: MaturityImprovementTask[]
  maturitySequenceTasks?: MaturitySequenceTask[]
}

export interface MissionState extends MissionBlueprint {}
