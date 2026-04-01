import type { MissionState } from '../types'

export type HintScope =
  | 'governanceQuestions'
  | 'governanceMappingTasks'
  | 'inventoryAssets'
  | 'prioritizationCases'
  | 'prioritizationRankingTasks'
  | 'prioritizationWaveTasks'
  | 'responseCases'
  | 'responseSequenceTasks'

export type HintToken = `${HintScope}:${string}`

const HINT_SCOPES: HintScope[] = [
  'governanceQuestions',
  'governanceMappingTasks',
  'inventoryAssets',
  'prioritizationCases',
  'prioritizationRankingTasks',
  'prioritizationWaveTasks',
  'responseCases',
  'responseSequenceTasks',
]

export function createHintToken(scope: HintScope, itemId: string): HintToken {
  return `${scope}:${itemId}`
}

export function markHintAsUsed(mission: MissionState, hintToken: string): MissionState {
  const parsed = parseHintToken(hintToken)

  if (!parsed) {
    return mission
  }

  const { scope, itemId } = parsed
  const collection = mission[scope]

  if (!collection) {
    return mission
  }

  let changed = false

  const nextCollection = collection.map((item) => {
    if (item.id !== itemId || item.hintUsed) {
      return item
    }

    changed = true
    return {
      ...item,
      hintUsed: true,
    }
  })

  if (!changed) {
    return mission
  }

  return {
    ...mission,
    [scope]: nextCollection,
  }
}

export function countUsedHintsInCampaign(missionStates: Record<string, MissionState>) {
  return Object.values(missionStates).reduce((total, mission) => total + countUsedHints(mission), 0)
}

function countUsedHints(mission: MissionState) {
  return HINT_SCOPES.reduce((count, scope) => {
    const collection = mission[scope]

    if (!collection) {
      return count
    }

    return count + collection.filter((item) => item.hintUsed).length
  }, 0)
}

function parseHintToken(hintToken: string): { scope: HintScope; itemId: string } | null {
  const separatorIndex = hintToken.indexOf(':')

  if (separatorIndex <= 0) {
    return null
  }

  const scope = hintToken.slice(0, separatorIndex) as HintScope
  const itemId = hintToken.slice(separatorIndex + 1)

  if (!itemId || !HINT_SCOPES.includes(scope)) {
    return null
  }

  return {
    scope,
    itemId,
  }
}
