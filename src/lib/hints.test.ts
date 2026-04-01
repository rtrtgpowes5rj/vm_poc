import { describe, expect, it } from 'vitest'
import { createMissionState } from '../data/campaign'
import { countUsedHintsInCampaign, createHintToken, markHintAsUsed } from './hints'

describe('hint mechanics', () => {
  it('marks only the addressed hint within its own scope', () => {
    const mission = createMissionState('mission-process-charter')
    const questionId = mission.governanceQuestions?.[0]?.id
    const mappingId = mission.governanceMappingTasks?.[0]?.id

    expect(questionId).toBeTruthy()
    expect(mappingId).toBeTruthy()

    const updated = markHintAsUsed(
      mission,
      createHintToken('governanceQuestions', questionId as string),
    )

    expect(updated.governanceQuestions?.[0]?.hintUsed).toBe(true)
    expect(updated.governanceMappingTasks?.[0]?.hintUsed).not.toBe(true)
  })

  it('counts used hints across the whole campaign state', () => {
    const governanceBase = createMissionState('mission-process-charter')
    const inventoryBase = createMissionState('mission-asset-inventory')
    const governanceHintId = governanceBase.governanceQuestions?.[0]?.id
    const inventoryHintId = inventoryBase.inventoryAssets?.[0]?.id

    expect(governanceHintId).toBeTruthy()
    expect(inventoryHintId).toBeTruthy()

    const governanceMission = markHintAsUsed(
      governanceBase,
      createHintToken('governanceQuestions', governanceHintId as string),
    )
    const inventoryMission = markHintAsUsed(
      inventoryBase,
      createHintToken('inventoryAssets', inventoryHintId as string),
    )

    const count = countUsedHintsInCampaign({
      [governanceMission.id]: governanceMission,
      [inventoryMission.id]: inventoryMission,
    })

    expect(count).toBe(2)
  })
})
