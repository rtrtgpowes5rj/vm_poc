import { describe, expect, it } from 'vitest'
import { createMissionState } from '../data/campaign'
import { missionBlueprints } from '../data/missions'
import {
  getInventoryModeStatus,
  getMissionMetrics,
  getMissionObjectives,
  getMissionReviewItems,
  getPrioritizationModeStatus,
  getPrioritizationWaveTaskStatus,
  getResponseModeStatus,
  getResponseSequenceTaskStatus,
} from './mission'

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

  it('inventory classification status can be correct before scan strategy is filled', () => {
    const mission = createMissionState('mission-asset-inventory')
    const asset = mission.inventoryAssets?.find((item) => item.id === 'asset-vpn')

    expect(asset).toBeTruthy()

    if (!asset) {
      return
    }

    asset.selectedRole = asset.expectedRole
    asset.selectedSla = asset.expectedSla

    expect(getInventoryModeStatus(asset, 'classification')).toBe('correct')
    expect(getInventoryModeStatus(asset, 'scan')).toBe('unanswered')
  })

  it('prioritization accepts supported extra factors but rejects unsupported ones', () => {
    const mission = createMissionState('mission-risk-prioritization')
    const payCase = mission.prioritizationCases?.find((item) => item.id === 'prio-pay-default')
    const qaCase = mission.prioritizationCases?.find((item) => item.id === 'prio-qa-lib')

    expect(payCase).toBeTruthy()
    expect(qaCase).toBeTruthy()

    if (!payCase || !qaCase) {
      return
    }

    payCase.selectedFactors = ['impact', 'asset-criticality', 'accessibility', 'exploit', 'trend']
    qaCase.selectedFactors = ['impact', 'exploit']

    expect(getPrioritizationModeStatus(payCase, 'factors')).toBe('correct')
    expect(getPrioritizationModeStatus(qaCase, 'factors')).toBe('partial')
  })

  it('response planning and control are evaluated independently per tab', () => {
    const mission = createMissionState('mission-remediation-control')
    const zeroDay = mission.responseCases?.find((item) => item.id === 'resp-zero-day')

    expect(zeroDay).toBeTruthy()

    if (!zeroDay) {
      return
    }

    zeroDay.selectedMethod = zeroDay.correctMethod
    zeroDay.selectedWindow = zeroDay.correctWindow

    expect(getResponseModeStatus(zeroDay, 'planning')).toBe('correct')
    expect(getResponseModeStatus(zeroDay, 'control')).toBe('unanswered')
  })

  it('inventory assets remain solvable per tab with intended role, scan strategy and sla', () => {
    const mission = createMissionState('mission-asset-inventory')

    for (const asset of mission.inventoryAssets ?? []) {
      asset.selectedRole = asset.expectedRole
      asset.selectedSla = asset.expectedSla
      asset.selectedScanStrategy = asset.expectedScanStrategy

      expect(getInventoryModeStatus(asset, 'classification')).toBe('correct')
      expect(getInventoryModeStatus(asset, 'scan')).toBe('correct')
    }
  })

  it('models virtual IP as context-only inventory object, not as standalone host', () => {
    const mission = createMissionState('mission-asset-inventory')
    const vip = mission.inventoryAssets?.find((item) => item.id === 'asset-vip')

    expect(vip).toBeTruthy()

    if (!vip) {
      return
    }

    expect(vip.expectedRole).toBe('support')
    expect(vip.expectedScanStrategy).toBe('exclude')
    expect(vip.expectedSla).toBe('exception')
  })

  it('prioritization mechanics accept intended answers and reject blanket over-selection', () => {
    const mission = createMissionState('mission-risk-prioritization')

    for (const item of mission.prioritizationCases ?? []) {
      item.selectedDecision = item.correctDecision
      item.selectedFactors = [...(item.allowedFactors ?? item.requiredFactors)]

      expect(getPrioritizationModeStatus(item, 'queue')).toBe('correct')
      expect(getPrioritizationModeStatus(item, 'factors')).toBe('correct')
    }

    for (const task of mission.prioritizationWaveTasks ?? []) {
      task.selectedOptionIds = [...task.correctOptionIds]
      expect(getPrioritizationWaveTaskStatus(task)).toBe('correct')

      task.selectedOptionIds = task.options.map((option) => option.id)
      if (task.selectedOptionIds.length !== task.correctOptionIds.length) {
        expect(getPrioritizationWaveTaskStatus(task)).not.toBe('correct')
      }
    }
  })

  it('response mechanics accept intended answers and reject over-selected verification steps', () => {
    const mission = createMissionState('mission-remediation-control')

    for (const item of mission.responseCases ?? []) {
      item.selectedMethod = item.correctMethod
      item.selectedWindow = item.correctWindow
      item.selectedVerification = [...(item.allowedVerification ?? item.requiredVerification)]

      expect(getResponseModeStatus(item, 'planning')).toBe('correct')
      expect(getResponseModeStatus(item, 'control')).toBe('correct')

      item.selectedVerification = ['monitoring', 'owner-sync', 'rescan', 'sla-review']
      if (item.allowedVerification && item.allowedVerification.length < 4) {
        expect(getResponseModeStatus(item, 'control')).not.toBe('correct')
      }
    }

    for (const task of mission.responseSequenceTasks ?? []) {
      task.touched = true
      task.selectedOrderIds = [...task.correctOrderIds]
      expect(getResponseSequenceTaskStatus(task)).toBe('correct')

      task.selectedOrderIds = [...task.correctOrderIds].reverse()
      if (task.correctOrderIds.length > 1) {
        expect(getResponseSequenceTaskStatus(task)).not.toBe('correct')
      }
    }
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
        selectedFactors: [...(item.allowedFactors ?? item.requiredFactors)],
      })),
      prioritizationWaveTasks: mission.prioritizationWaveTasks?.map((task) => ({
        ...task,
        selectedOptionIds: [...task.correctOptionIds],
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
    responseSequenceTasks: mission.responseSequenceTasks?.map((task) => ({
      ...task,
      touched: true,
      selectedOrderIds: [...task.correctOrderIds],
    })),
    responseCases: mission.responseCases?.map((item) => ({
      ...item,
      selectedMethod: item.correctMethod,
      selectedWindow: item.correctWindow,
      selectedVerification: [...(item.allowedVerification ?? item.requiredVerification)],
    })),
  }
}
