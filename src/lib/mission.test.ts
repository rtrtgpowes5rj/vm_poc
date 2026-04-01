import { describe, expect, it } from 'vitest'
import { createMissionState } from '../data/campaign'
import { missionBlueprints } from '../data/missions'
import { getMissionMetrics, getMissionObjectives, getMissionReviewItems } from './mission'

describe('mission mechanics', () => {
  it('all implemented missions expose non-empty scenario bundles', () => {
    Object.keys(missionBlueprints).forEach((missionId) => {
      const mission = createMissionState(missionId)

      expect(mission.learningGoals.length).toBeGreaterThan(0)
      expect(mission.failureModes.length).toBeGreaterThan(0)
      expect(mission.methodNotes.length).toBeGreaterThan(0)

      if (mission.kind === 'governance') {
        expect(mission.governanceQuestions?.length).toBeGreaterThan(0)
      }

      if (mission.kind === 'inventory') {
        expect(mission.inventoryAssets?.length).toBeGreaterThan(0)
      }

      if (mission.kind === 'prioritization') {
        expect(mission.prioritizationCases?.length).toBeGreaterThan(0)
      }

      if (mission.kind === 'response') {
        expect(mission.responseCases?.length).toBeGreaterThan(0)
      }
    })
  })

  it('all implemented missions can reach completed objectives through supported mechanics', () => {
    Object.keys(missionBlueprints).forEach((missionId) => {
      const completed = fillMissionWithCorrectAnswers(createMissionState(missionId))
      const objectives = getMissionObjectives(completed)

      expect(objectives.every((objective) => objective.complete)).toBe(true)
    })
  })

  it('wrong answers keep critical blockers visible in review and metrics', () => {
    const mission = createMissionState('mission-process-charter')
    mission.governanceQuestions?.forEach((question) => {
      question.selectedOptionIds = []
    })

    const review = getMissionReviewItems(mission)
    const metrics = getMissionMetrics(mission)

    expect(review.some((item) => item.importance === 'critical' && item.status !== 'correct')).toBe(
      true,
    )
    expect(metrics.blockingIssues).toBeGreaterThan(0)
  })
})

function fillMissionWithCorrectAnswers(mission: ReturnType<typeof createMissionState>) {
  if (mission.kind === 'governance') {
    return {
      ...mission,
      governanceQuestions: mission.governanceQuestions?.map((question) => ({
        ...question,
        selectedOptionIds: [...question.correctOptionIds],
      })),
      governanceMappingTasks: mission.governanceMappingTasks?.map((task) => ({
        ...task,
        rows: task.rows.map((row) => ({
          ...row,
          selectedRole: row.expectedRole,
        })),
      })),
    }
  }

  if (mission.kind === 'inventory') {
    return {
      ...mission,
      inventoryAssets: mission.inventoryAssets?.map((asset) => ({
        ...asset,
        selectedRole: asset.expectedRole,
        selectedScanStrategy: asset.expectedScanStrategy,
        selectedSla: asset.expectedSla,
      })),
    }
  }

  if (mission.kind === 'prioritization') {
    return {
      ...mission,
      prioritizationCases: mission.prioritizationCases?.map((item) => ({
        ...item,
        selectedDecision: item.correctDecision,
        selectedFactors: [...item.requiredFactors],
      })),
      prioritizationRankingTasks: mission.prioritizationRankingTasks?.map((task) => ({
        ...task,
        touched: true,
        selectedOrderIds: [...task.correctOrderIds],
      })),
    }
  }

  return {
    ...mission,
    responseCases: mission.responseCases?.map((item) => ({
      ...item,
      selectedMethod: item.correctMethod,
      selectedWindow: item.correctWindow,
      selectedVerification: [...item.requiredVerification],
    })),
  }
}
