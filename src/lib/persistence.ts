import { campaignChapters, createAllMissionStates } from '../data/campaign'
import type { CampaignChapter, MissionState } from '../types'

const STORAGE_KEY = 'vm-control-room.save.v4'

export type CampaignProgress = {
  chapters: CampaignChapter[]
  selectedMissionId: string
  missionStates: Record<string, MissionState>
  hintBankRemaining: number
}

export function createDefaultCampaignProgress(): CampaignProgress {
  return {
    chapters: campaignChapters.map((chapter) => ({ ...chapter })),
    selectedMissionId: campaignChapters[0].id,
    missionStates: createAllMissionStates(),
    hintBankRemaining: 50,
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

    return {
      chapters: parsed.chapters?.map((chapter) => ({ ...chapter })) ?? fallback.chapters,
      selectedMissionId:
        typeof parsed.selectedMissionId === 'string'
          ? parsed.selectedMissionId
          : fallback.selectedMissionId,
      missionStates: parsed.missionStates ?? fallback.missionStates,
      hintBankRemaining:
        typeof parsed.hintBankRemaining === 'number'
          ? parsed.hintBankRemaining
          : fallback.hintBankRemaining,
    }
  } catch {
    return fallback
  }
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
