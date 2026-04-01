export type AppStage = 'campaign' | 'brief' | 'workspace' | 'debrief'

export type MissionTab = string

export type MissionStatus = 'available' | 'locked' | 'active' | 'completed'

export type MissionKind = 'governance' | 'inventory' | 'prioritization' | 'response'

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
  explanation: string
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
  explanation: string
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
  responseCases?: ResponseCase[]
}

export interface MissionState extends MissionBlueprint {}
