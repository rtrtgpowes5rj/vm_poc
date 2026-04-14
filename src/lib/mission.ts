import type {
  GovernanceMappingTask,
  GovernanceQuestion,
  InventoryAsset,
  MaturityAuditCase,
  MaturityImprovementTask,
  MaturitySequenceTask,
  MetricsDashboardTask,
  MetricsInterpretationCase,
  MetricsKpiTask,
  MissionState,
  PrioritizationCase,
  PrioritizationRankingTask,
  PrioritizationWaveTask,
  ResponseCase,
  ResponseSequenceTask,
} from '../types'

export type ReviewStatus = 'correct' | 'partial' | 'wrong' | 'unanswered'

export type MissionMetrics = {
  coverage: number
  quality: number
  blockingIssues: number
  riskScore: number
}

export type MissionObjective = {
  id: string
  title: string
  caption: string
  progressLabel: string
  complete: boolean
}

export type MissionReviewItem = {
  id: string
  title: string
  section: string
  importance: 'critical' | 'important'
  status: ReviewStatus
  feedback: string
}

export function getMissionMetrics(mission: MissionState): MissionMetrics {
  const review = getMissionReviewItems(mission)
  const answered = review.filter((item) => item.status !== 'unanswered').length
  const blockingIssues = review.filter(
    (item) => item.importance === 'critical' && item.status !== 'correct',
  ).length

  const weightedTotal = review.reduce((total, item) => total + getWeight(item.importance), 0)
  const weightedScore = review.reduce(
    (total, item) => total + getWeight(item.importance) * getStatusScore(item.status),
    0,
  )

  const quality =
    weightedTotal === 0 ? 0 : Math.round((weightedScore / weightedTotal) * 100)
  const coverage =
    review.length === 0 ? 0 : Math.round((answered / review.length) * 100)

  const wrong = review.filter((item) => item.status === 'wrong').length
  const unansweredCount = review.filter((item) => item.status === 'unanswered').length
  const partial = review.filter((item) => item.status === 'partial').length

  const riskScore = clamp(
    18 +
      blockingIssues * 16 +
      wrong * 8 +
      unansweredCount * 5 +
      partial * 3 -
      Math.round(quality * 0.18),
    8,
    100,
  )

  return {
    coverage,
    quality,
    blockingIssues,
    riskScore,
  }
}

export function getMissionObjectives(mission: MissionState): MissionObjective[] {
  const review = getMissionReviewItems(mission)
  const metrics = getMissionMetrics(mission)

  if (mission.kind === 'governance') {
    const criticalItems = review.filter((item) => item.importance === 'critical')
    const criticalClosed = criticalItems.filter((item) => item.status === 'correct').length
    const agreementItems = review.filter((item) => item.section === 'agreements')
    const agreementsClosed = agreementItems.filter((item) => item.status === 'correct').length

    return [
      {
        id: 'gov-critical-chain',
        title: 'Определить недопустимые события и атакующую цепочку',
        caption:
          'Без этого процесс стартует не с риска бизнеса, а с бессмысленного списка технических находок.',
        progressLabel: `${criticalClosed}/${criticalItems.length}`,
        complete: criticalClosed === criticalItems.length,
      },
      {
        id: 'gov-agreements',
        title: 'Закрепить роли, артефакты и SLA',
        caption:
          'Команды должны получить общий язык, артефакты процесса и выполнимые правила взаимодействия.',
        progressLabel: `${agreementsClosed}/${agreementItems.length}`,
        complete: agreementsClosed === agreementItems.length,
      },
      {
        id: 'gov-quality',
        title: 'Достичь точности решений не ниже 80%',
        caption:
          'Оценка идёт не за количество кликов, а за методическую корректность выбранных решений.',
        progressLabel: `${metrics.quality}/80`,
        complete: metrics.quality >= 80,
      },
    ]
  }

  if (mission.kind === 'inventory') {
    const assets = mission.inventoryAssets ?? []
    const criticalAssets = assets.filter((item) => item.importance === 'critical')
    const criticalClosed = criticalAssets.filter(
      (item) => evaluateInventoryAsset(item).status === 'correct',
    ).length
    const specialIds = new Set(['asset-legacy', 'asset-laptop', 'asset-vip'])
    const specialClosed = assets
      .filter((item) => specialIds.has(item.id))
      .filter((item) => evaluateInventoryAsset(item).status === 'correct').length

    return [
      {
        id: 'inv-critical',
        title: 'Корректно классифицировать все критические активы',
        caption:
          'Периметр, целевые и ключевые системы должны быть размечены без ошибок, иначе приоритеты развалятся ниже по процессу.',
        progressLabel: `${criticalClosed}/${criticalAssets.length}`,
        complete: criticalClosed === criticalAssets.length,
      },
      {
        id: 'inv-special',
        title: 'Отдельно обработать legacy, mobile и virtual IP',
        caption:
          'Эти классы активов чаще всего ломают инвентаризацию и требуют отдельной стратегии сканирования.',
        progressLabel: `${specialClosed}/3`,
        complete: specialClosed === 3,
      },
      {
        id: 'inv-coverage',
        title: 'Заполнить все поля и набрать не ниже 75% качества',
        caption:
          'VM нельзя строить на полупустой карточке актива. Сначала полнота и корректность атрибутов, потом автоматизация.',
        progressLabel: `${metrics.coverage}% / ${metrics.quality}%`,
        complete: metrics.coverage === 100 && metrics.quality >= 75,
      },
    ]
  }

  if (mission.kind === 'prioritization') {
    const cases = mission.prioritizationCases ?? []
    const rankingTasks = mission.prioritizationRankingTasks ?? []
    const waveTasks = mission.prioritizationWaveTasks ?? []
    const criticalCases = cases.filter((item) => item.importance === 'critical')
    const criticalClosed = criticalCases.filter(
      (item) => evaluatePrioritizationCase(item).status === 'correct',
    ).length
    const factorClosed = cases.filter((item) =>
      hasAcceptableFactorSelection(item),
    ).length
    const rankingClosed = rankingTasks.filter(
      (task) => evaluatePrioritizationRankingTask(task).status === 'correct',
    ).length
    const waveClosed = waveTasks.filter(
      (task) => evaluatePrioritizationWaveTask(task).status === 'correct',
    ).length

    return [
      {
        id: 'prio-rank',
        title: 'Собрать первую волну и не переполнить аварийный слот',
        caption:
          'Даже при ограниченном ресурсе в emergency-wave должны попасть именно те кейсы, которые быстрее других ведут к недопустимому событию.',
        progressLabel: `${rankingClosed + waveClosed}/${rankingTasks.length + waveTasks.length || 1}`,
        complete:
          (rankingTasks.length === 0 || rankingClosed === rankingTasks.length) &&
          (waveTasks.length === 0 || waveClosed === waveTasks.length),
      },
      {
        id: 'prio-critical',
        title: 'Поставить critical-кейсы в правильную очередь',
        caption:
          'Трендовые и действительно опасные сценарии должны быть вынесены в первую очередь вне зависимости от удобства команды.',
        progressLabel: `${criticalClosed}/${criticalCases.length}`,
        complete: criticalClosed === criticalCases.length,
      },
      {
        id: 'prio-factors',
        title: 'Дать точное факторное обоснование каждому кейсу',
        caption:
          'Избыточные или случайные факторы не считаются корректным обоснованием и размывают решение для ИТ и бизнеса.',
        progressLabel: `${factorClosed}/${cases.length}`,
        complete: factorClosed === cases.length,
      },
      {
        id: 'prio-quality',
        title: 'Достичь точности решений не ниже 80%',
        caption:
          'Нужно не просто “разнести кейсы по колонкам”, а сделать это по методике с учётом контекста.',
        progressLabel: `${metrics.quality}/80`,
        complete: metrics.quality >= 80,
      },
    ]
  }

  if (mission.kind === 'metrics') {
    const kpiTasks = mission.metricsKpiTasks ?? []
    const dashboardTasks = mission.metricsDashboardTasks ?? []
    const interpretCases = mission.metricsInterpretationCases ?? []
    const criticalKpi = kpiTasks.filter((t) => t.importance === 'critical')
    const criticalKpiClosed = criticalKpi.filter(
      (t) => evaluateMetricsKpiTask(t).status === 'correct',
    ).length
    const dashboardClosed = dashboardTasks.filter(
      (t) => evaluateMetricsDashboardTask(t).status === 'correct',
    ).length
    const interpretClosed = interpretCases.filter(
      (c) => evaluateMetricsInterpretationCase(c).status === 'correct',
    ).length

    return [
      {
        id: 'metrics-kpi',
        title: 'Выбрать правильный набор KPI для каждой из 3 аудиторий',
        caption:
          'Стратегические и операционные KPI нельзя смешивать: CISO утонет в деталях, аналитик не увидит сигналов действий.',
        progressLabel: `${criticalKpiClosed}/${criticalKpi.length}`,
        complete: criticalKpiClosed === criticalKpi.length,
      },
      {
        id: 'metrics-dashboard',
        title: 'Корректно разметить KPI по аудиториям в матрице',
        caption:
          'Правильная разметка — основа управленческого дашборда. Ошибка здесь делает оба инструмента неэффективными.',
        progressLabel: `${dashboardClosed}/${dashboardTasks.length || 1}`,
        complete: dashboardTasks.length === 0 || dashboardClosed === dashboardTasks.length,
      },
      {
        id: 'metrics-interpret',
        title: 'Диагностировать оба отклонения и предложить PDCA-действие',
        caption:
          'Метрики существуют для действий. Правильный PDCA-Check переводит отклонение в корректирующий шаг.',
        progressLabel: `${interpretClosed}/${interpretCases.length || 1}`,
        complete: interpretCases.length === 0 || interpretClosed === interpretCases.length,
      },
    ]
  }

  if (mission.kind === 'improvement') {
    const auditCases = mission.maturityAuditCases ?? []
    const improvementTasks = mission.maturityImprovementTasks ?? []
    const sequenceTasks = mission.maturitySequenceTasks ?? []
    const criticalAudit = auditCases.filter((c) => c.importance === 'critical')
    const criticalAuditClosed = criticalAudit.filter(
      (c) => evaluateMaturityAuditCase(c).status === 'correct',
    ).length
    const improvementClosed = improvementTasks.filter(
      (t) => evaluateMaturityImprovementTask(t).status === 'correct',
    ).length
    const roadmapClosed = sequenceTasks.filter(
      (t) => evaluateMaturitySequenceTask(t).status === 'correct',
    ).length

    return [
      {
        id: 'maturity-audit',
        title: 'Идентифицировать нарушенные принципы в обоих аудит-кейсах',
        caption:
          'Точная диагностика принципов — основа для правильного выбора улучшений. Симптомы без диагноза ведут к лечению не той болезни.',
        progressLabel: `${criticalAuditClosed}/${criticalAudit.length}`,
        complete: criticalAuditClosed === criticalAudit.length,
      },
      {
        id: 'maturity-improvement',
        title: 'Выбрать топ-3 приоритетных улучшения',
        caption:
          'Без CMDB любая автоматизация ненадёжна. Без согласованного SLA любые сроки — конфликт. Фундамент раньше надстройки.',
        progressLabel: `${improvementClosed}/${improvementTasks.length || 1}`,
        complete: improvementTasks.length === 0 || improvementClosed === improvementTasks.length,
      },
      {
        id: 'maturity-roadmap',
        title: 'Собрать корректную дорожную карту изменений',
        caption:
          'Порядок имеет значение: договорённости → данные → автоматизация → измерение. Нельзя измерять то, чего ещё нет.',
        progressLabel: `${roadmapClosed}/${sequenceTasks.length || 1}`,
        complete: sequenceTasks.length === 0 || roadmapClosed === sequenceTasks.length,
      },
    ]
  }

  const cases = mission.responseCases ?? []
  const sequenceTasks = mission.responseSequenceTasks ?? []
  const criticalCases = cases.filter((item) => item.importance === 'critical')
  const criticalClosed = criticalCases.filter(
    (item) => evaluateResponseCase(item).status === 'correct',
  ).length
  const controlClosed = cases.filter((item) =>
    hasAcceptableSet(
      item.selectedVerification,
      item.requiredVerification,
      item.allowedVerification,
    ),
  ).length
  const playbookClosed = sequenceTasks.filter(
    (task) => evaluateResponseSequenceTask(task).status === 'correct',
  ).length

  return [
    {
      id: 'resp-critical',
      title: 'Выбрать корректный способ обработки для всех critical-кейсов',
      caption:
        'Патч, конфигурация, WAF и компенсирующие меры не взаимозаменяемы. Тип обработки должен соответствовать природе кейса.',
      progressLabel: `${criticalClosed}/${criticalCases.length}`,
      complete: criticalClosed === criticalCases.length,
    },
    {
      id: 'resp-control',
      title: 'Назначить корректный контроль устранения по всем кейсам',
      caption:
        'Повторное сканирование, мониторинг и пересмотр SLA — обязательная часть жизненного цикла, а не постскриптум.',
      progressLabel: `${controlClosed}/${cases.length}`,
      complete: controlClosed === cases.length,
    },
    {
      id: 'resp-playbook',
      title: 'Собрать playbook для zero-day и пересмотра SLA',
      caption:
        'Аварийная обработка и пересмотр SLA должны проходить по воспроизводимому сценарию, а не в ручном хаосе.',
      progressLabel: `${playbookClosed}/${sequenceTasks.length || 1}`,
      complete: sequenceTasks.length === 0 || playbookClosed === sequenceTasks.length,
    },
    {
      id: 'resp-risk',
      title: 'Снизить остаточный риск до 40 и ниже',
      caption:
        'Хороший run не просто закрывает задачи, а действительно уменьшает остаточный риск по критичным сценариям.',
      progressLabel: `${metrics.riskScore}/40`,
      complete: metrics.riskScore <= 40,
    },
  ]
}

export function getMissionReviewItems(mission: MissionState): MissionReviewItem[] {
  if (mission.kind === 'governance') {
    return [
      ...(mission.governanceQuestions ?? []).map((question) => {
        const evaluation = evaluateGovernanceQuestion(question)
        return {
          id: question.id,
          title: question.title,
          section: question.section,
          importance: question.importance,
          status: evaluation.status,
          feedback: evaluation.feedback,
        }
      }),
      ...(mission.governanceMappingTasks ?? []).map((task) => {
        const evaluation = evaluateGovernanceMappingTask(task)
        return {
          id: task.id,
          title: task.title,
          section: task.section,
          importance: task.importance,
          status: evaluation.status,
          feedback: evaluation.feedback,
        }
      }),
    ]
  }

  if (mission.kind === 'inventory') {
    return (mission.inventoryAssets ?? []).map((asset) => {
      const evaluation = evaluateInventoryAsset(asset)
      return {
        id: asset.id,
        title: asset.name,
        section: 'inventory',
        importance: asset.importance,
        status: evaluation.status,
        feedback: evaluation.feedback,
      }
    })
  }

  if (mission.kind === 'prioritization') {
    return [
      ...(mission.prioritizationWaveTasks ?? []).map((task) => {
        const evaluation = evaluatePrioritizationWaveTask(task)
        return {
          id: task.id,
          title: task.title,
          section: task.section,
          importance: task.importance,
          status: evaluation.status,
          feedback: evaluation.feedback,
        }
      }),
      ...(mission.prioritizationRankingTasks ?? []).map((task) => {
        const evaluation = evaluatePrioritizationRankingTask(task)
        return {
          id: task.id,
          title: task.title,
          section: task.section,
          importance: task.importance,
          status: evaluation.status,
          feedback: evaluation.feedback,
        }
      }),
      ...(mission.prioritizationCases ?? []).map((item) => {
        const evaluation = evaluatePrioritizationCase(item)
        return {
          id: item.id,
          title: item.title,
          section: 'priority',
          importance: item.importance,
          status: evaluation.status,
          feedback: evaluation.feedback,
        }
      }),
    ]
  }

  if (mission.kind === 'metrics') {
    return [
      ...(mission.metricsKpiTasks ?? []).map((task) => {
        const evaluation = evaluateMetricsKpiTask(task)
        return {
          id: task.id,
          title: task.title,
          section: task.section,
          importance: task.importance,
          status: evaluation.status,
          feedback: evaluation.feedback,
        }
      }),
      ...(mission.metricsDashboardTasks ?? []).map((task) => {
        const evaluation = evaluateMetricsDashboardTask(task)
        return {
          id: task.id,
          title: task.title,
          section: task.section,
          importance: task.importance,
          status: evaluation.status,
          feedback: evaluation.feedback,
        }
      }),
      ...(mission.metricsInterpretationCases ?? []).map((item) => {
        const evaluation = evaluateMetricsInterpretationCase(item)
        return {
          id: item.id,
          title: item.title,
          section: item.section,
          importance: item.importance,
          status: evaluation.status,
          feedback: evaluation.feedback,
        }
      }),
    ]
  }

  if (mission.kind === 'improvement') {
    return [
      ...(mission.maturityAuditCases ?? []).map((item) => {
        const evaluation = evaluateMaturityAuditCase(item)
        return {
          id: item.id,
          title: item.title,
          section: item.section,
          importance: item.importance,
          status: evaluation.status,
          feedback: evaluation.feedback,
        }
      }),
      ...(mission.maturityImprovementTasks ?? []).map((task) => {
        const evaluation = evaluateMaturityImprovementTask(task)
        return {
          id: task.id,
          title: task.title,
          section: task.section,
          importance: task.importance,
          status: evaluation.status,
          feedback: evaluation.feedback,
        }
      }),
      ...(mission.maturitySequenceTasks ?? []).map((task) => {
        const evaluation = evaluateMaturitySequenceTask(task)
        return {
          id: task.id,
          title: task.title,
          section: task.section,
          importance: task.importance,
          status: evaluation.status,
          feedback: evaluation.feedback,
        }
      }),
    ]
  }

  return [
    ...(mission.responseSequenceTasks ?? []).map((task) => {
      const evaluation = evaluateResponseSequenceTask(task)
      return {
        id: task.id,
        title: task.title,
        section: task.section,
        importance: task.importance,
        status: evaluation.status,
        feedback: evaluation.feedback,
      }
    }),
    ...(mission.responseCases ?? []).map((item) => {
      const evaluation = evaluateResponseCase(item)
      return {
        id: item.id,
        title: item.title,
        section: 'response',
        importance: item.importance,
        status: evaluation.status,
        feedback: evaluation.feedback,
      }
    }),
  ]
}

export function getMissionScore(metrics: MissionMetrics, objectives: MissionObjective[]) {
  const objectiveBonus = Math.round(
    (objectives.filter((item) => item.complete).length / Math.max(objectives.length, 1)) * 12,
  )

  return clamp(Math.round(metrics.quality - metrics.blockingIssues * 6 + objectiveBonus), 0, 100)
}

function evaluateGovernanceQuestion(question: GovernanceQuestion) {
  if (question.selectedOptionIds.length === 0) {
    return {
      status: 'unanswered' as const,
      feedback: `Ожидаемое решение: ${joinExpectedLabels(question)}. ${question.explanation}`,
    }
  }

  const correct = new Set(question.correctOptionIds)
  const selected = new Set(question.selectedOptionIds)
  const selectedCorrect = [...selected].filter((item) => correct.has(item)).length
  const selectedWrong = [...selected].filter((item) => !correct.has(item)).length

  if (selectedCorrect === correct.size && selected.size === correct.size) {
    return {
      status: 'correct' as const,
      feedback: question.explanation,
    }
  }

  if (selectedCorrect > 0) {
    const guidance =
      selectedWrong > 0
        ? 'В ответе есть лишние варианты, которые искажают приоритет.'
        : 'Часть логики выбрана верно, но решение неполное.'

    return {
      status: 'partial' as const,
      feedback: `${guidance} Ожидаемое решение: ${joinExpectedLabels(question)}. ${question.explanation}`,
    }
  }

  return {
    status: 'wrong' as const,
    feedback: `Ожидаемое решение: ${joinExpectedLabels(question)}. ${question.explanation}`,
  }
}

function evaluateGovernanceMappingTask(task: GovernanceMappingTask) {
  const answered = task.rows.filter((row) => row.selectedRole !== null).length
  const correctCount = task.rows.filter((row) => row.selectedRole === row.expectedRole).length

  if (answered === 0) {
    return {
      status: 'unanswered' as const,
      feedback: `Ожидаемая разметка: ${joinMappingExpectations(task)}. ${task.explanation}`,
    }
  }

  if (correctCount === task.rows.length) {
    return {
      status: 'correct' as const,
      feedback: task.explanation,
    }
  }

  if (correctCount > 0) {
    return {
      status: 'partial' as const,
      feedback: `Часть цепочки размечена верно, но нужно уточнить роли: ${joinMappingExpectations(
        task,
      )}. ${task.explanation}`,
    }
  }

  return {
    status: 'wrong' as const,
    feedback: `Ожидаемая разметка: ${joinMappingExpectations(task)}. ${task.explanation}`,
  }
}

function evaluateInventoryAsset(asset: InventoryAsset) {
  const answered = [
    asset.selectedRole !== null,
    asset.selectedScanStrategy !== null,
    asset.selectedSla !== null,
  ].filter(Boolean).length

  const roleCorrect = asset.selectedRole === asset.expectedRole
  const scanCorrect = asset.selectedScanStrategy === asset.expectedScanStrategy
  const slaCorrect = asset.selectedSla === asset.expectedSla
  const correctCount = [roleCorrect, scanCorrect, slaCorrect].filter(Boolean).length

  if (answered === 0) {
    return {
      status: 'unanswered' as const,
      roleCorrect,
      scanCorrect,
      slaCorrect,
      feedback: `Ожидаемая модель: роль «${labelForRole(asset.expectedRole)}», сканирование «${labelForScanStrategy(asset.expectedScanStrategy)}», SLA «${labelForSla(asset.expectedSla)}». ${asset.explanation}`,
    }
  }

  if (correctCount === 3) {
    return {
      status: 'correct' as const,
      roleCorrect,
      scanCorrect,
      slaCorrect,
      feedback: asset.explanation,
    }
  }

  const issues: string[] = []

  if (!roleCorrect) {
    issues.push(`роль должна быть «${labelForRole(asset.expectedRole)}»`)
  }

  if (!scanCorrect) {
    issues.push(`стратегия должна быть «${labelForScanStrategy(asset.expectedScanStrategy)}»`)
  }

  if (!slaCorrect) {
    issues.push(`SLA должен быть «${labelForSla(asset.expectedSla)}»`)
  }

  return {
    status: correctCount >= 1 ? ('partial' as const) : ('wrong' as const),
    roleCorrect,
    scanCorrect,
    slaCorrect,
    feedback: `Исправьте: ${issues.join('; ')}. ${asset.explanation}`,
  }
}

function evaluatePrioritizationWaveTask(task: PrioritizationWaveTask) {
  if (task.selectedOptionIds.length === 0) {
    return {
      status: 'unanswered' as const,
      feedback: `Ожидаемый состав аварийной волны: ${joinWaveLabels(task)}. ${task.explanation}`,
    }
  }

  const hasExactSelection = hasExactSet(task.selectedOptionIds, task.correctOptionIds)

  if (hasExactSelection) {
    return {
      status: 'correct' as const,
      feedback: task.explanation,
    }
  }

  const selectedCorrect = task.selectedOptionIds.filter((id) => task.correctOptionIds.includes(id)).length

  if (selectedCorrect > 0) {
    return {
      status: 'partial' as const,
      feedback: `Часть emergency-slot собрана верно, но итоговый состав должен быть таким: ${joinWaveLabels(task)}. ${task.explanation}`,
    }
  }

  return {
    status: 'wrong' as const,
    feedback: `Ожидаемый состав аварийной волны: ${joinWaveLabels(task)}. ${task.explanation}`,
  }
}

function evaluatePrioritizationCase(item: PrioritizationCase) {
  const hasAnyAnswer = item.selectedDecision !== null || item.selectedFactors.length > 0

  if (!hasAnyAnswer) {
    return {
      status: 'unanswered' as const,
      feedback: `Ожидаемое решение: «${labelForDecision(item.correctDecision)}» с факторами ${joinFactorLabels(item.requiredFactors)}. ${item.explanation}`,
    }
  }

  const decisionCorrect = item.selectedDecision === item.correctDecision
  const exactFactors = hasAcceptableFactorSelection(item)
  const someFactorPresent = item.requiredFactors.some((factor) =>
    item.selectedFactors.includes(factor),
  )
  const extraFactors = item.selectedFactors.some((factor) => !getAllowedFactors(item).includes(factor))

  if (decisionCorrect && exactFactors) {
    return {
      status: 'correct' as const,
      feedback: item.explanation,
    }
  }

  if (decisionCorrect || someFactorPresent) {
    const guidance =
      extraFactors || someFactorPresent
        ? 'Факторное обоснование должно быть точнее: лишние или случайные факторы не считаются корректной аргументацией.'
        : 'Решение выбрано не до конца.'

    return {
      status: 'partial' as const,
      feedback: `${guidance} Ожидается «${labelForDecision(item.correctDecision)}» и факторы ${joinFactorLabels(item.requiredFactors)}. ${item.explanation}`,
    }
  }

  return {
    status: 'wrong' as const,
    feedback: `Ожидаемое решение: «${labelForDecision(item.correctDecision)}» и факторы ${joinFactorLabels(item.requiredFactors)}. ${item.explanation}`,
  }
}

function evaluatePrioritizationRankingTask(task: PrioritizationRankingTask) {
  if (!task.touched || task.selectedOrderIds.length === 0) {
    return {
      status: 'unanswered' as const,
      feedback: `Ожидаемый порядок: ${joinRankingLabels(task)}. ${task.explanation}`,
    }
  }

  const correctPositions = task.selectedOrderIds.filter(
    (itemId, index) => task.correctOrderIds[index] === itemId,
  ).length

  if (correctPositions === task.correctOrderIds.length) {
    return {
      status: 'correct' as const,
      feedback: task.explanation,
    }
  }

  if (correctPositions > 0) {
    return {
      status: 'partial' as const,
      feedback: `Порядок собран не до конца: ожидается ${joinRankingLabels(task)}. ${task.explanation}`,
    }
  }

  return {
    status: 'wrong' as const,
    feedback: `Ожидаемый порядок: ${joinRankingLabels(task)}. ${task.explanation}`,
  }
}

function evaluateResponseSequenceTask(task: ResponseSequenceTask) {
  if (!task.touched || task.selectedOrderIds.length === 0) {
    return {
      status: 'unanswered' as const,
      feedback: `Ожидаемая последовательность: ${joinResponseSequenceLabels(task)}. ${task.explanation}`,
    }
  }

  const correctPositions = task.selectedOrderIds.filter(
    (itemId, index) => task.correctOrderIds[index] === itemId,
  ).length

  if (correctPositions === task.correctOrderIds.length) {
    return {
      status: 'correct' as const,
      feedback: task.explanation,
    }
  }

  if (correctPositions > 0) {
    return {
      status: 'partial' as const,
      feedback: `Плейбук собран не до конца: ожидается ${joinResponseSequenceLabels(task)}. ${task.explanation}`,
    }
  }

  return {
    status: 'wrong' as const,
    feedback: `Ожидаемая последовательность: ${joinResponseSequenceLabels(task)}. ${task.explanation}`,
  }
}

function evaluateResponseCase(item: ResponseCase) {
  const hasAnyAnswer =
    item.selectedMethod !== null ||
    item.selectedWindow !== null ||
    item.selectedVerification.length > 0

  if (!hasAnyAnswer) {
    return {
      status: 'unanswered' as const,
      feedback: `Ожидаемый ответ: «${labelForMethod(item.correctMethod)}», окно «${labelForWindow(item.correctWindow)}», контроль ${joinVerificationLabels(item.requiredVerification)}. ${item.explanation}`,
    }
  }

  const methodCorrect = item.selectedMethod === item.correctMethod
  const windowCorrect = item.selectedWindow === item.correctWindow
  const verificationCorrect = hasAcceptableSet(
    item.selectedVerification,
    item.requiredVerification,
    item.allowedVerification,
  )
  const verificationPartial = item.requiredVerification.some((step) =>
    item.selectedVerification.includes(step),
  )

  if (methodCorrect && windowCorrect && verificationCorrect) {
    return {
      status: 'correct' as const,
      feedback: item.explanation,
    }
  }

  if (methodCorrect || windowCorrect || verificationPartial) {
    return {
      status: 'partial' as const,
      feedback: `Нужно довести план до конца: ожидается «${labelForMethod(item.correctMethod)}», окно «${labelForWindow(item.correctWindow)}», контроль ${joinVerificationLabels(item.requiredVerification)}. ${item.explanation}`,
    }
  }

  return {
    status: 'wrong' as const,
    feedback: `Ожидаемый ответ: «${labelForMethod(item.correctMethod)}», окно «${labelForWindow(item.correctWindow)}», контроль ${joinVerificationLabels(item.requiredVerification)}. ${item.explanation}`,
  }
}

function evaluateMetricsKpiTask(task: MetricsKpiTask) {
  if (task.selectedOptionIds.length === 0) {
    return {
      status: 'unanswered' as const,
      feedback: `Ожидаемый набор KPI: ${joinMetricsKpiLabels(task)}. ${task.explanation}`,
    }
  }

  if (hasExactSet(task.selectedOptionIds, task.correctOptionIds)) {
    return {
      status: 'correct' as const,
      feedback: task.explanation,
    }
  }

  const correctHits = task.selectedOptionIds.filter((id) => task.correctOptionIds.includes(id)).length

  if (correctHits > 0) {
    return {
      status: 'partial' as const,
      feedback: `Часть набора собрана верно, но для этой аудитории нужен точный комплект KPI: ${joinMetricsKpiLabels(task)}. ${task.explanation}`,
    }
  }

  return {
    status: 'wrong' as const,
    feedback: `Ожидаемый набор KPI: ${joinMetricsKpiLabels(task)}. ${task.explanation}`,
  }
}

function evaluateMetricsDashboardTask(task: MetricsDashboardTask) {
  const answeredRows = task.rows.filter((row) => row.selectedAudiences.length > 0).length
  const correctRows = task.rows.filter((row) =>
    hasExactSet(row.selectedAudiences, row.correctAudiences),
  ).length

  if (answeredRows === 0) {
    return {
      status: 'unanswered' as const,
      feedback: `Ожидаемая разметка: ${joinMetricsDashboardLabels(task)}. ${task.explanation}`,
    }
  }

  if (correctRows === task.rows.length) {
    return {
      status: 'correct' as const,
      feedback: task.explanation,
    }
  }

  if (correctRows > 0) {
    return {
      status: 'partial' as const,
      feedback: `Часть KPI размечена корректно, но матрицу нужно довести до точного соответствия: ${joinMetricsDashboardLabels(task)}. ${task.explanation}`,
    }
  }

  return {
    status: 'wrong' as const,
    feedback: `Ожидаемая разметка: ${joinMetricsDashboardLabels(task)}. ${task.explanation}`,
  }
}

function evaluateMetricsInterpretationCase(item: MetricsInterpretationCase) {
  if (item.selectedActionIds.length === 0) {
    return {
      status: 'unanswered' as const,
      feedback: `Ожидаемое PDCA-действие: ${joinMetricsInterpretationLabels(item)}. ${item.explanation}`,
    }
  }

  if (hasExactSet(item.selectedActionIds, item.correctActionIds)) {
    return {
      status: 'correct' as const,
      feedback: item.explanation,
    }
  }

  const correctHits = item.selectedActionIds.filter((id) => item.correctActionIds.includes(id)).length

  if (correctHits > 0) {
    return {
      status: 'partial' as const,
      feedback: `Часть реакции выбрана верно, но PDCA-шаг должен быть точнее: ${joinMetricsInterpretationLabels(item)}. ${item.explanation}`,
    }
  }

  return {
    status: 'wrong' as const,
    feedback: `Ожидаемое PDCA-действие: ${joinMetricsInterpretationLabels(item)}. ${item.explanation}`,
  }
}

function evaluateMaturityAuditCase(item: MaturityAuditCase) {
  if (item.selectedViolationIds.length === 0) {
    return {
      status: 'unanswered' as const,
      feedback: `Нарушенные принципы: ${joinMaturityViolationLabels(item)}. ${item.explanation}`,
    }
  }

  if (hasExactSet(item.selectedViolationIds, item.correctViolationIds)) {
    return {
      status: 'correct' as const,
      feedback: item.explanation,
    }
  }

  const correctHits = item.selectedViolationIds.filter((id) =>
    item.correctViolationIds.includes(id),
  ).length

  if (correctHits > 0) {
    return {
      status: 'partial' as const,
      feedback: `Диагностика частично верна, но полный набор принципов такой: ${joinMaturityViolationLabels(item)}. ${item.explanation}`,
    }
  }

  return {
    status: 'wrong' as const,
    feedback: `Нарушенные принципы: ${joinMaturityViolationLabels(item)}. ${item.explanation}`,
  }
}

function evaluateMaturityImprovementTask(task: MaturityImprovementTask) {
  if (task.selectedEntryIds.length === 0) {
    return {
      status: 'unanswered' as const,
      feedback: `Ожидаемый набор улучшений: ${joinMaturityImprovementLabels(task)}. ${task.explanation}`,
    }
  }

  if (hasExactSet(task.selectedEntryIds, task.correctEntryIds)) {
    return {
      status: 'correct' as const,
      feedback: task.explanation,
    }
  }

  const correctHits = task.selectedEntryIds.filter((id) => task.correctEntryIds.includes(id)).length

  if (correctHits > 0) {
    return {
      status: 'partial' as const,
      feedback: `Приоритеты выбраны не до конца точно. Здесь ожидаются: ${joinMaturityImprovementLabels(task)}. ${task.explanation}`,
    }
  }

  return {
    status: 'wrong' as const,
    feedback: `Ожидаемый набор улучшений: ${joinMaturityImprovementLabels(task)}. ${task.explanation}`,
  }
}

function evaluateMaturitySequenceTask(task: MaturitySequenceTask) {
  if (!task.touched || task.selectedOrderIds.length === 0) {
    return {
      status: 'unanswered' as const,
      feedback: `Ожидаемая дорожная карта: ${joinMaturitySequenceLabels(task)}. ${task.explanation}`,
    }
  }

  const correctPositions = task.selectedOrderIds.filter(
    (itemId, index) => task.correctOrderIds[index] === itemId,
  ).length

  if (correctPositions === task.correctOrderIds.length) {
    return {
      status: 'correct' as const,
      feedback: task.explanation,
    }
  }

  if (correctPositions > 0) {
    return {
      status: 'partial' as const,
      feedback: `Порядок изменений частично верный. Ожидается: ${joinMaturitySequenceLabels(task)}. ${task.explanation}`,
    }
  }

  return {
    status: 'wrong' as const,
    feedback: `Ожидаемая дорожная карта: ${joinMaturitySequenceLabels(task)}. ${task.explanation}`,
  }
}

function joinExpectedLabels(question: GovernanceQuestion) {
  return question.correctOptionIds
    .map((id) => question.options.find((item) => item.id === id)?.label ?? id)
    .join(', ')
}

function joinMappingExpectations(task: GovernanceMappingTask) {
  return task.rows
    .map((row) => `${row.assetName} → ${labelForRole(row.expectedRole)}`)
    .join('; ')
}

function joinFactorLabels(factors: PrioritizationCase['requiredFactors']) {
  return factors.map((factor) => `«${labelForFactor(factor)}»`).join(', ')
}

function joinWaveLabels(task: PrioritizationWaveTask) {
  return task.correctOptionIds
    .map((id) => task.options.find((item) => item.id === id)?.title ?? id)
    .join('; ')
}

function joinVerificationLabels(steps: ResponseCase['requiredVerification']) {
  return steps.map((step) => `«${labelForVerification(step)}»`).join(', ')
}

function joinRankingLabels(task: PrioritizationRankingTask) {
  return task.correctOrderIds
    .map((id, index) => {
      const entry = task.entries.find((item) => item.id === id)
      return `${index + 1}. ${entry?.title ?? id}`
    })
    .join('; ')
}

function joinResponseSequenceLabels(task: ResponseSequenceTask) {
  return task.correctOrderIds
    .map((id, index) => {
      const entry = task.entries.find((item) => item.id === id)
      return `${index + 1}. ${entry?.title ?? id}`
    })
    .join('; ')
}

function joinMetricsKpiLabels(task: MetricsKpiTask) {
  return task.correctOptionIds
    .map((id) => task.options.find((item) => item.id === id)?.label ?? id)
    .join(', ')
}

function joinMetricsDashboardLabels(task: MetricsDashboardTask) {
  return task.rows
    .map((row) => {
      const audiences = row.correctAudiences.join(' + ')
      return `${row.kpiLabel} → ${audiences}`
    })
    .join('; ')
}

function joinMetricsInterpretationLabels(item: MetricsInterpretationCase) {
  return item.correctActionIds
    .map((id) => item.actionOptions.find((option) => option.id === id)?.label ?? id)
    .join(', ')
}

function joinMaturityViolationLabels(item: MaturityAuditCase) {
  return item.correctViolationIds
    .map((id) => item.violationOptions.find((option) => option.id === id)?.label ?? id)
    .join(', ')
}

function joinMaturityImprovementLabels(task: MaturityImprovementTask) {
  return task.correctEntryIds
    .map((id) => task.entries.find((entry) => entry.id === id)?.title ?? id)
    .join('; ')
}

function joinMaturitySequenceLabels(task: MaturitySequenceTask) {
  return task.correctOrderIds
    .map((id, index) => {
      const entry = task.entries.find((item) => item.id === id)
      return `${index + 1}. ${entry?.title ?? id}`
    })
    .join('; ')
}

function hasExactSet<T extends string>(selected: T[], expected: T[]) {
  if (selected.length !== expected.length) {
    return false
  }

  const expectedSet = new Set(expected)
  return selected.every((item) => expectedSet.has(item))
}

function hasAcceptableSet<T extends string>(selected: T[], required: T[], allowed?: T[]) {
  const allowedSet = new Set(allowed ?? required)

  return (
    required.every((item) => selected.includes(item)) &&
    selected.every((item) => allowedSet.has(item))
  )
}

function getAllowedFactors(item: PrioritizationCase) {
  return item.allowedFactors ?? item.requiredFactors
}

function hasAcceptableFactorSelection(item: PrioritizationCase) {
  return hasAcceptableSet(item.selectedFactors, item.requiredFactors, item.allowedFactors)
}

function getStatusScore(status: ReviewStatus) {
  if (status === 'correct') {
    return 1
  }

  if (status === 'partial') {
    return 0.55
  }

  return 0
}

function getWeight(importance: 'critical' | 'important') {
  return importance === 'critical' ? 2 : 1
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function getInventoryModeStatus(asset: InventoryAsset, mode: 'classification' | 'scan') {
  if (mode === 'classification') {
    const answered = [asset.selectedRole !== null, asset.selectedSla !== null].filter(Boolean).length
    const correctCount = [
      asset.selectedRole === asset.expectedRole,
      asset.selectedSla === asset.expectedSla,
    ].filter(Boolean).length

    if (answered === 0) {
      return 'unanswered' as const
    }

    if (correctCount === 2) {
      return 'correct' as const
    }

    return correctCount > 0 ? ('partial' as const) : ('wrong' as const)
  }

  if (asset.selectedScanStrategy === null) {
    return 'unanswered' as const
  }

  return asset.selectedScanStrategy === asset.expectedScanStrategy
    ? ('correct' as const)
    : ('wrong' as const)
}

export function getPrioritizationModeStatus(
  item: PrioritizationCase,
  mode: 'queue' | 'factors',
) {
  if (mode === 'queue') {
    if (item.selectedDecision === null) {
      return 'unanswered' as const
    }

    return item.selectedDecision === item.correctDecision ? ('correct' as const) : ('wrong' as const)
  }

  if (item.selectedFactors.length === 0) {
    return 'unanswered' as const
  }

  if (hasAcceptableFactorSelection(item)) {
    return 'correct' as const
  }

  return item.requiredFactors.some((factor) => item.selectedFactors.includes(factor))
    ? ('partial' as const)
    : ('wrong' as const)
}

export function getPrioritizationRankingTaskStatus(task: PrioritizationRankingTask) {
  return evaluatePrioritizationRankingTask(task).status
}

export function getPrioritizationWaveTaskStatus(task: PrioritizationWaveTask) {
  return evaluatePrioritizationWaveTask(task).status
}

export function getResponseModeStatus(item: ResponseCase, mode: 'planning' | 'control') {
  if (mode === 'planning') {
    const answered = [item.selectedMethod !== null, item.selectedWindow !== null].filter(Boolean).length
    const correctCount = [
      item.selectedMethod === item.correctMethod,
      item.selectedWindow === item.correctWindow,
    ].filter(Boolean).length

    if (answered === 0) {
      return 'unanswered' as const
    }

    if (correctCount === 2) {
      return 'correct' as const
    }

    return correctCount > 0 ? ('partial' as const) : ('wrong' as const)
  }

  if (item.selectedVerification.length === 0) {
    return 'unanswered' as const
  }

  if (
    hasAcceptableSet(
      item.selectedVerification,
      item.requiredVerification,
      item.allowedVerification,
    )
  ) {
    return 'correct' as const
  }

  return item.requiredVerification.some((step) => item.selectedVerification.includes(step))
    ? ('partial' as const)
    : ('wrong' as const)
}

export function getResponseSequenceTaskStatus(task: ResponseSequenceTask) {
  return evaluateResponseSequenceTask(task).status
}

export function labelForRole(role: InventoryAsset['expectedRole']) {
  switch (role) {
    case 'entry-point':
      return 'точка проникновения'
    case 'target':
      return 'целевая система'
    case 'key':
      return 'ключевая система'
    case 'support':
      return 'вспомогательная система'
    default:
      return 'тестовая система'
  }
}

export function labelForScanStrategy(strategy: InventoryAsset['expectedScanStrategy']) {
  switch (strategy) {
    case 'audit':
      return 'полноценный аудит'
    case 'discovery':
      return 'discovery / базовое покрытие'
    case 'agent':
      return 'агентный контроль'
    case 'manual':
      return 'ручной анализ'
    default:
      return 'исключение из сканирования'
  }
}

export function labelForSla(sla: InventoryAsset['expectedSla']) {
  switch (sla) {
    case '24h':
      return '24 часа'
    case '72h':
      return '72 часа'
    case '5d':
      return '5 рабочих дней'
    default:
      return 'исключение + компенсирующие меры'
  }
}

export function labelForDecision(decision: PrioritizationCase['correctDecision']) {
  switch (decision) {
    case 'urgent':
      return 'срочно'
    case 'planned':
      return 'планово'
    case 'compensating':
      return 'компенсирующая обработка'
    default:
      return 'принятие риска'
  }
}

export function labelForFactor(factor: PrioritizationCase['requiredFactors'][number]) {
  switch (factor) {
    case 'impact':
      return 'последствия эксплуатации'
    case 'asset-criticality':
      return 'значимость актива'
    case 'exploit':
      return 'наличие PoC/эксплойта'
    case 'accessibility':
      return 'доступность нарушителю'
    default:
      return 'трендовость'
  }
}

export function labelForMethod(method: ResponseCase['correctMethod']) {
  switch (method) {
    case 'patch':
      return 'патч / обновление'
    case 'config':
      return 'изменение конфигурации'
    case 'waf':
      return 'WAF / временная защитная мера'
    case 'monitoring':
      return 'компенсирующие меры и мониторинг'
    default:
      return 'замена компонента'
  }
}

export function labelForWindow(window: ResponseCase['correctWindow']) {
  switch (window) {
    case 'emergency':
      return 'аварийное окно'
    case 'planned':
      return 'ближайшее плановое окно'
    case 'exception':
      return 'режим исключения'
    default:
      return 'отложить'
  }
}

export function labelForVerification(step: ResponseCase['requiredVerification'][number]) {
  switch (step) {
    case 'rescan':
      return 'повторное сканирование'
    case 'owner-sync':
      return 'фиксация статуса с владельцем актива'
    case 'sla-review':
      return 'пересмотр SLA'
    default:
      return 'усиленный мониторинг'
  }
}
