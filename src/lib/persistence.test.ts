import { describe, expect, it } from 'vitest'
import {
  clearCampaignProgress,
  createDefaultCampaignProgress,
  loadCampaignProgress,
  saveCampaignProgress,
} from './persistence'

describe('campaign persistence', () => {
  it('saves and restores selected mission and mission-specific choices', () => {
    clearCampaignProgress()

    const progress = createDefaultCampaignProgress()
    progress.selectedMissionId = 'mission-risk-prioritization'
    progress.hintBankRemaining = 41
    progress.chapters[0].status = 'completed'
    progress.chapters[1].status = 'completed'
    progress.chapters[2].status = 'available'
    const governanceQuestions =
      progress.missionStates['mission-process-charter'].governanceQuestions ?? []
    const prioritizationCases =
      progress.missionStates['mission-risk-prioritization'].prioritizationCases ?? []

    governanceQuestions[0]?.selectedOptionIds.push('loss-money')
    prioritizationCases[0]?.selectedFactors.push('trend')

    if (prioritizationCases[0]) {
      prioritizationCases[0].selectedDecision = 'urgent'
    }

    saveCampaignProgress(progress)

    const restored = loadCampaignProgress()

    expect(restored.selectedMissionId).toBe('mission-risk-prioritization')
    expect(restored.hintBankRemaining).toBe(41)
    expect(restored.chapters[0].status).toBe('completed')
    expect(
      restored.missionStates['mission-process-charter'].governanceQuestions?.[0].selectedOptionIds,
    ).toContain('loss-money')
    expect(
      restored.missionStates['mission-risk-prioritization'].prioritizationCases?.[0]
        .selectedDecision,
    ).toBe('urgent')
    expect(
      restored.missionStates['mission-risk-prioritization'].prioritizationCases?.[0]
        .selectedFactors,
    ).toContain('trend')
  })
})
