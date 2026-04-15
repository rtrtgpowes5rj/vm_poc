import { campaignChapters, createAllMissionStates } from '../data/campaign'
import { countUsedHintsInCampaign } from './hints'
import type { CampaignChapter, MissionState } from '../types'

const STORAGE_KEY = 'vm-control-room.save.v5'

export type CampaignProgress = {
  chapters: CampaignChapter[]
  selectedMissionId: string
  missionStates: Record<string, MissionState>
  hintBankRemaining: number
  allowFreePhaseAccess: boolean
}

export function createDefaultCampaignProgress(): CampaignProgress {
  return {
    chapters: campaignChapters.map((chapter) => ({ ...chapter })),
    selectedMissionId: campaignChapters[0].id,
    missionStates: createAllMissionStates(),
    hintBankRemaining: 50,
    allowFreePhaseAccess: true,
  }
}

export function loadCampaignProgress(): CampaignProgress {
  const fallback = createDefaultCampaignProgress()
  const storage = getStorage()

  if (!storage) {
    return fallback
  }

  try {
    const raw = storage.getItem(STORAGE_KEY)

    if (!raw) {
      return fallback
    }

    const parsed = JSON.parse(raw) as Partial<CampaignProgress>

    if (!parsed || typeof parsed !== 'object') {
      return fallback
    }

    const missionStates = mergeMissionStates(
      fallback.missionStates,
      parsed.missionStates,
    )
    const maxHintBalance = Math.max(50 - countUsedHintsInCampaign(missionStates), 0)

    return {
      chapters: parsed.chapters?.map((chapter) => ({ ...chapter })) ?? fallback.chapters,
      selectedMissionId:
        typeof parsed.selectedMissionId === 'string'
          ? parsed.selectedMissionId
          : fallback.selectedMissionId,
      missionStates,
      hintBankRemaining:
        typeof parsed.hintBankRemaining === 'number'
          ? Math.min(parsed.hintBankRemaining, maxHintBalance)
          : fallback.hintBankRemaining,
      allowFreePhaseAccess:
        typeof parsed.allowFreePhaseAccess === 'boolean'
          ? parsed.allowFreePhaseAccess
          : fallback.allowFreePhaseAccess,
    }
  } catch {
    return fallback
  }
}

function mergeMissionStates(
  fallbackStates: Record<string, MissionState>,
  parsedStates?: Record<string, MissionState>,
) {
  if (!parsedStates) {
    return fallbackStates
  }

  return Object.fromEntries(
    Object.entries(fallbackStates).map(([missionId, fallbackMission]) => [
      missionId,
      mergeMissionState(
        fallbackMission,
        parsedStates[missionId] as MissionState | undefined,
      ),
    ]),
  ) as Record<string, MissionState>
}

function mergeMissionState(fallbackMission: MissionState, parsedMission?: MissionState) {
  if (!parsedMission) {
    return fallbackMission
  }

  return {
    ...fallbackMission,
    ...parsedMission,
    methodNotes: parsedMission.methodNotes ?? fallbackMission.methodNotes,
    alerts: parsedMission.alerts ?? fallbackMission.alerts,
    stakeholders: parsedMission.stakeholders ?? fallbackMission.stakeholders,
    learningGoals: parsedMission.learningGoals ?? fallbackMission.learningGoals,
    failureModes: parsedMission.failureModes ?? fallbackMission.failureModes,
    governanceQuestions: mergeCollections(
      fallbackMission.governanceQuestions,
      parsedMission.governanceQuestions,
    ),
    governanceMappingTasks: mergeCollections(
      fallbackMission.governanceMappingTasks,
      parsedMission.governanceMappingTasks,
    ),
    inventoryAssets: mergeCollections(
      fallbackMission.inventoryAssets,
      parsedMission.inventoryAssets,
    ),
    prioritizationCases: mergeCollections(
      fallbackMission.prioritizationCases,
      parsedMission.prioritizationCases,
    ),
    prioritizationRankingTasks: mergeCollections(
      fallbackMission.prioritizationRankingTasks,
      parsedMission.prioritizationRankingTasks,
    ),
    prioritizationWaveTasks: mergeCollections(
      fallbackMission.prioritizationWaveTasks,
      parsedMission.prioritizationWaveTasks,
    ),
    responseCases: mergeCollections(
      fallbackMission.responseCases,
      parsedMission.responseCases,
    ),
    responseSequenceTasks: mergeCollections(
      fallbackMission.responseSequenceTasks,
      parsedMission.responseSequenceTasks,
    ),
    metricsKpiTasks: mergeCollections(
      fallbackMission.metricsKpiTasks,
      parsedMission.metricsKpiTasks,
    ),
    metricsDashboardTasks: mergeCollections(
      fallbackMission.metricsDashboardTasks,
      parsedMission.metricsDashboardTasks,
    ),
    metricsInterpretationCases: mergeCollections(
      fallbackMission.metricsInterpretationCases,
      parsedMission.metricsInterpretationCases,
    ),
    maturityAuditCases: mergeCollections(
      fallbackMission.maturityAuditCases,
      parsedMission.maturityAuditCases,
    ),
    maturityImprovementTasks: mergeCollections(
      fallbackMission.maturityImprovementTasks,
      parsedMission.maturityImprovementTasks,
    ),
    maturitySequenceTasks: mergeCollections(
      fallbackMission.maturitySequenceTasks,
      parsedMission.maturitySequenceTasks,
    ),
  }
}

function mergeCollections<T extends { id: string }>(
  fallbackCollection?: T[],
  parsedCollection?: T[],
) {
  if (!fallbackCollection) {
    return parsedCollection
  }

  if (!parsedCollection) {
    return fallbackCollection
  }

  const parsedMap = new Map(parsedCollection.map((item) => [item.id, item]))

  return fallbackCollection.map((fallbackItem) => ({
    ...fallbackItem,
    ...(parsedMap.get(fallbackItem.id) ?? {}),
  }))
}

export function saveCampaignProgress(progress: CampaignProgress) {
  const storage = getStorage()

  if (!storage) {
    return
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function clearCampaignProgress() {
  const storage = getStorage()

  if (!storage) {
    return
  }

  storage.removeItem(STORAGE_KEY)
}

function getStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}
