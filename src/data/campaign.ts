import type { CampaignChapter, MissionBlueprint, MissionState } from '../types'
import { missionBlueprints } from './missions'

export const campaignChapters: CampaignChapter[] = [
  {
    id: 'mission-process-charter',
    phase: 'Фаза 01',
    title: 'Контур процесса',
    summary:
      'Сначала строим сам VM-процесс: недопустимые события, роли, артефакты, SLA и принципы взаимодействия.',
    stakes:
      'Если начать со сканера, а не с методики, команда получит шум, конфликты по срокам и нулевую управляемость.',
    estimated: '20-25 минут',
    status: 'active',
    implemented: true,
  },
  {
    id: 'mission-asset-inventory',
    phase: 'Фаза 02',
    title: 'Инвентаризация и категоризация',
    summary:
      'Формируем достоверный реестр активов и связываем его с недопустимыми событиями, ролями и SLA.',
    stakes:
      'Ошибки в инвентаризации превращают приоритизацию в формальность и ломают весь downstream VM-процесс.',
    estimated: '20 минут',
    status: 'locked',
    implemented: true,
  },
  {
    id: 'mission-risk-prioritization',
    phase: 'Фаза 03',
    title: 'Анализ и приоритизация',
    summary:
      'Учим игрока строить очередь устранения по бизнес-контексту, доступности, PoC и трендовости, а не по CVSS-only.',
    stakes:
      'Если все кейсы помечены как срочные или плановые без логики, ИТ потеряет доверие к процессу и не будет исполнять решения.',
    estimated: '20-25 минут',
    status: 'locked',
    implemented: true,
  },
  {
    id: 'mission-remediation-control',
    phase: 'Фаза 04',
    title: 'Устранение и контроль',
    summary:
      'Переходим от очереди к исполнению: корректный тип обработки, окно изменений, компенсирующие меры и контроль устранения.',
    stakes:
      'Без проверки результата и пересмотра SLA процесс быстро скатывается к “тикеты закрыты, а риск остался”.',
    estimated: '20-25 минут',
    status: 'locked',
    implemented: true,
  },
]

export function createMissionState(missionId: string): MissionState {
  return cloneBlueprint(missionBlueprints[missionId])
}

export function createAllMissionStates() {
  return Object.fromEntries(
    Object.keys(missionBlueprints).map((missionId) => [missionId, createMissionState(missionId)]),
  ) as Record<string, MissionState>
}

function cloneBlueprint(blueprint: MissionBlueprint): MissionState {
  return {
    ...blueprint,
    learningGoals: [...blueprint.learningGoals],
    failureModes: [...blueprint.failureModes],
    methodNotes: blueprint.methodNotes.map((note) => ({ ...note })),
    alerts: blueprint.alerts.map((alert) => ({ ...alert })),
    stakeholders: blueprint.stakeholders.map((stakeholder) => ({ ...stakeholder })),
    governanceQuestions: blueprint.governanceQuestions?.map((question) => ({
      ...question,
      options: question.options.map((option) => ({ ...option })),
      correctOptionIds: [...question.correctOptionIds],
      selectedOptionIds: [...question.selectedOptionIds],
    })),
    governanceMappingTasks: blueprint.governanceMappingTasks?.map((task) => ({
      ...task,
      rows: task.rows.map((row) => ({ ...row })),
    })),
    inventoryAssets: blueprint.inventoryAssets?.map((asset) => ({
      ...asset,
      sources: [...asset.sources],
    })),
    prioritizationCases: blueprint.prioritizationCases?.map((item) => ({
      ...item,
      selectedFactors: [...item.selectedFactors],
      requiredFactors: [...item.requiredFactors],
      allowedFactors: item.allowedFactors ? [...item.allowedFactors] : undefined,
    })),
    prioritizationRankingTasks: blueprint.prioritizationRankingTasks?.map((task) => ({
      ...task,
      entries: task.entries.map((entry) => ({ ...entry })),
      correctOrderIds: [...task.correctOrderIds],
      selectedOrderIds: [...task.selectedOrderIds],
    })),
    prioritizationWaveTasks: blueprint.prioritizationWaveTasks?.map((task) => ({
      ...task,
      options: task.options.map((option) => ({ ...option })),
      correctOptionIds: [...task.correctOptionIds],
      selectedOptionIds: [...task.selectedOptionIds],
    })),
    responseCases: blueprint.responseCases?.map((item) => ({
      ...item,
      selectedVerification: [...item.selectedVerification],
      requiredVerification: [...item.requiredVerification],
      allowedVerification: item.allowedVerification ? [...item.allowedVerification] : undefined,
    })),
    responseSequenceTasks: blueprint.responseSequenceTasks?.map((task) => ({
      ...task,
      entries: task.entries.map((entry) => ({ ...entry })),
      correctOrderIds: [...task.correctOrderIds],
      selectedOrderIds: [...task.selectedOrderIds],
    })),
  }
}
