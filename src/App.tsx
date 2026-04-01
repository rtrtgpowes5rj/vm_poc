import { AnimatePresence, motion } from 'framer-motion'
import { Activity, Gauge, Lightbulb, ShieldCheck, Sparkles, Workflow } from 'lucide-react'
import { useEffect, useState, useTransition, type ReactNode } from 'react'
import './App.css'
import { BriefScreen } from './components/BriefScreen'
import { CampaignScreen } from './components/CampaignScreen'
import { DebriefScreen } from './components/DebriefScreen'
import { WorkspaceScreen } from './components/WorkspaceScreen'
import { campaignChapters, createMissionState } from './data/campaign'
import {
  getMissionMetrics,
  getMissionObjectives,
  getMissionReviewItems,
  getMissionScore,
} from './lib/mission'
import { markHintAsUsed } from './lib/hints'
import { loadCampaignProgress, saveCampaignProgress } from './lib/persistence'
import type {
  AppStage,
  AssetRole,
  ChangeWindow,
  MissionState,
  MissionTab,
  PriorityDecision,
  PriorityFactor,
  RankingMove,
  ScanStrategy,
  SlaTier,
  TaskMethod,
  VerificationStep,
} from './types'

function App() {
  const initialProgress = loadCampaignProgress()

  const [chapters, setChapters] = useState(initialProgress.chapters)
  const [missionStates, setMissionStates] = useState(initialProgress.missionStates)
  const [selectedMissionId, setSelectedMissionId] = useState(initialProgress.selectedMissionId)
  const [hintBankRemaining, setHintBankRemaining] = useState(initialProgress.hintBankRemaining)
  const [stage, setStage] = useState<AppStage>('campaign')
  const [isRouting, startRouting] = useTransition()

  const selectedChapter =
    chapters.find((chapter) => chapter.id === selectedMissionId) ?? chapters[0]
  const currentMission =
    missionStates[selectedMissionId] ?? missionStates[campaignChapters[0].id]
  const nextChapter = getNextChapter(chapters, selectedMissionId)
  const completedCount = chapters.filter((chapter) => chapter.status === 'completed').length

  const [activeTab, setActiveTab] = useState<MissionTab>(getDefaultTab(currentMission))
  const metrics = getMissionMetrics(currentMission)
  const objectives = getMissionObjectives(currentMission)
  const reviewItems = getMissionReviewItems(currentMission)
  const score = getMissionScore(metrics, objectives)
  const canFinish = objectives.every((objective) => objective.complete)

  useEffect(() => {
    saveCampaignProgress({
      chapters,
      selectedMissionId,
      missionStates,
      hintBankRemaining,
    })
  }, [chapters, hintBankRemaining, missionStates, selectedMissionId])

  const updateMission = (
    missionId: string,
    updater: (mission: MissionState) => MissionState,
  ) => {
    setMissionStates((current) => ({
      ...current,
      [missionId]: updater(current[missionId]),
    }))
  }

  const openMission = (missionId: string) => {
    setSelectedMissionId(missionId)
    setActiveTab(getDefaultTab(missionStates[missionId]))
    startRouting(() => setStage('brief'))
  }

  const beginMission = () => {
    if (selectedChapter.status === 'locked' || !selectedChapter.implemented) {
      return
    }

    setActiveTab(getDefaultTab(currentMission))
    startRouting(() => setStage('workspace'))
  }

  const finishMission = () => {
    if (!canFinish) {
      return
    }

    setChapters((current) =>
      current.map((chapter, index) => {
        if (chapter.id === selectedMissionId) {
          return { ...chapter, status: 'completed' }
        }

        const previous = current[index - 1]

        if (chapter.status === 'locked' && previous?.id === selectedMissionId) {
          return { ...chapter, status: 'available' }
        }

        return chapter
      }),
    )

    startRouting(() => setStage('debrief'))
  }

  const restartMission = () => {
    const freshMission = createMissionState(selectedMissionId)

    setMissionStates((current) => ({
      ...current,
      [selectedMissionId]: freshMission,
    }))
    setActiveTab(getDefaultTab(freshMission))
    startRouting(() => setStage('workspace'))
  }

  const goToCampaign = () => {
    startRouting(() => setStage('campaign'))
  }

  const goToNextChapter = () => {
    if (!nextChapter) {
      goToCampaign()
      return
    }

    setSelectedMissionId(nextChapter.id)
    setActiveTab(getDefaultTab(missionStates[nextChapter.id]))
    startRouting(() => setStage('brief'))
  }

  const revealHint = (hintToken: string) => {
    if (hintBankRemaining <= 0) {
      return
    }

    let consumed = false

    setMissionStates((current) => {
      const mission = current[selectedMissionId]
      const nextMission = markHintAsUsed(mission, hintToken)
      consumed = nextMission !== mission

      if (!consumed) {
        return current
      }

      return {
        ...current,
        [selectedMissionId]: nextMission,
      }
    })

    if (consumed) {
      setHintBankRemaining((current) => Math.max(current - 1, 0))
    }
  }

  const toggleGovernanceOption = (questionId: string, optionId: string) => {
    updateMission(selectedMissionId, (mission) => ({
      ...mission,
      governanceQuestions: mission.governanceQuestions?.map((question) => {
        if (question.id !== questionId) {
          return question
        }

        const isSelected = question.selectedOptionIds.includes(optionId)

        return {
          ...question,
          selectedOptionIds: question.multi
            ? isSelected
              ? question.selectedOptionIds.filter((item) => item !== optionId)
              : [...question.selectedOptionIds, optionId]
            : isSelected
              ? []
              : [optionId],
        }
      }),
    }))
  }

  const setGovernanceMappingRole = (
    taskId: string,
    rowId: string,
    role: AssetRole,
  ) => {
    updateMission(selectedMissionId, (mission) => ({
      ...mission,
      governanceMappingTasks: mission.governanceMappingTasks?.map((task) =>
        task.id === taskId
          ? {
              ...task,
              rows: task.rows.map((row) =>
                row.id === rowId ? { ...row, selectedRole: role } : row,
              ),
            }
          : task,
      ),
    }))
  }

  const setInventoryRole = (assetId: string, role: AssetRole) => {
    updateMission(selectedMissionId, (mission) => ({
      ...mission,
      inventoryAssets: mission.inventoryAssets?.map((asset) =>
        asset.id === assetId ? { ...asset, selectedRole: role } : asset,
      ),
    }))
  }

  const setInventoryScanStrategy = (assetId: string, strategy: ScanStrategy) => {
    updateMission(selectedMissionId, (mission) => ({
      ...mission,
      inventoryAssets: mission.inventoryAssets?.map((asset) =>
        asset.id === assetId ? { ...asset, selectedScanStrategy: strategy } : asset,
      ),
    }))
  }

  const setInventorySla = (assetId: string, sla: SlaTier) => {
    updateMission(selectedMissionId, (mission) => ({
      ...mission,
      inventoryAssets: mission.inventoryAssets?.map((asset) =>
        asset.id === assetId ? { ...asset, selectedSla: sla } : asset,
      ),
    }))
  }

  const movePriorityRankingEntry = (
    taskId: string,
    entryId: string,
    move: RankingMove,
  ) => {
    updateMission(selectedMissionId, (mission) => ({
      ...mission,
      prioritizationRankingTasks: mission.prioritizationRankingTasks?.map((task) => {
        if (task.id !== taskId) {
          return task
        }

        const currentIndex = task.selectedOrderIds.indexOf(entryId)

        if (currentIndex === -1) {
          return task
        }

        const targetIndex = move === 'up' ? currentIndex - 1 : currentIndex + 1

        if (targetIndex < 0 || targetIndex >= task.selectedOrderIds.length) {
          return task
        }

        const nextOrder = [...task.selectedOrderIds]
        const [moved] = nextOrder.splice(currentIndex, 1)
        nextOrder.splice(targetIndex, 0, moved)

        return {
          ...task,
          touched: true,
          selectedOrderIds: nextOrder,
        }
      }),
    }))
  }

  const setPriorityDecision = (caseId: string, decision: PriorityDecision) => {
    updateMission(selectedMissionId, (mission) => ({
      ...mission,
      prioritizationCases: mission.prioritizationCases?.map((item) =>
        item.id === caseId ? { ...item, selectedDecision: decision } : item,
      ),
    }))
  }

  const togglePriorityFactor = (caseId: string, factor: PriorityFactor) => {
    updateMission(selectedMissionId, (mission) => ({
      ...mission,
      prioritizationCases: mission.prioritizationCases?.map((item) => {
        if (item.id !== caseId) {
          return item
        }

        const hasFactor = item.selectedFactors.includes(factor)

        return {
          ...item,
          selectedFactors: hasFactor
            ? item.selectedFactors.filter((current) => current !== factor)
            : [...item.selectedFactors, factor],
        }
      }),
    }))
  }

  const setResponseMethod = (caseId: string, method: TaskMethod) => {
    updateMission(selectedMissionId, (mission) => ({
      ...mission,
      responseCases: mission.responseCases?.map((item) =>
        item.id === caseId ? { ...item, selectedMethod: method } : item,
      ),
    }))
  }

  const setResponseWindow = (caseId: string, window: ChangeWindow) => {
    updateMission(selectedMissionId, (mission) => ({
      ...mission,
      responseCases: mission.responseCases?.map((item) =>
        item.id === caseId ? { ...item, selectedWindow: window } : item,
      ),
    }))
  }

  const toggleResponseVerification = (caseId: string, step: VerificationStep) => {
    updateMission(selectedMissionId, (mission) => ({
      ...mission,
      responseCases: mission.responseCases?.map((item) => {
        if (item.id !== caseId) {
          return item
        }

        const exists = item.selectedVerification.includes(step)

        return {
          ...item,
          selectedVerification: exists
            ? item.selectedVerification.filter((current) => current !== step)
            : [...item.selectedVerification, step],
        }
      }),
    }))
  }

  const missionHeadline =
    stage === 'workspace'
      ? 'Операционный штаб VM'
      : stage === 'debrief'
        ? 'After Action Review'
        : 'VM Control Room'

  return (
    <div className="app-shell">
      <div className="background-grid" />
      <div className="background-noise" />
      <div className="background-vignette" />
      <div className="background-glow background-glow--left" />
      <div className="background-glow background-glow--center" />
      <div className="background-glow background-glow--right" />
      <div className="background-orbit background-orbit--one" />
      <div className="background-orbit background-orbit--two" />
      <div className="background-scanline" />

      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-badge">
            <ShieldCheck size={18} />
          </div>
          <div className="brand-copy">
            <p className="eyebrow">serious game / vulnerability management</p>
            <h1>{missionHeadline}</h1>
            <div className="brand-subline">
              <span>
                <Activity size={14} />
                command state online
              </span>
              <span>{selectedChapter.phase}</span>
              <span>
                {completedCount}/{chapters.length} phases stabilized
              </span>
            </div>
          </div>
        </div>

        <div className="topbar-meta">
          <TopbarChip label="риск" value={`${metrics.riskScore}/100`} icon={<Gauge size={16} />} />
          <TopbarChip
            label="качество"
            value={`${metrics.quality}%`}
            icon={<Workflow size={16} />}
          />
          <TopbarChip
            label="покрытие"
            value={`${metrics.coverage}%`}
            icon={<Sparkles size={16} />}
            pending={isRouting}
          />
          <TopbarChip
            label="подсказки"
            value={`${hintBankRemaining}/50`}
            icon={<Lightbulb size={16} />}
          />
        </div>
      </header>

      <main className="stage">
        <div className="stage-shell">
          <div className="stage-shell__edge stage-shell__edge--left" />
          <div className="stage-shell__edge stage-shell__edge--right" />
          <div className="stage-shell__inner">
        <AnimatePresence mode="wait">
          {stage === 'campaign' ? (
            <motion.div
              key="campaign"
              initial={{ opacity: 0, y: 24, scale: 0.985, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -24, scale: 0.992, filter: 'blur(8px)' }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              <CampaignScreen chapters={chapters} onSelect={openMission} />
            </motion.div>
          ) : null}

          {stage === 'brief' ? (
            <motion.div
              key="brief"
              initial={{ opacity: 0, y: 24, scale: 0.985, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -24, scale: 0.992, filter: 'blur(8px)' }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              <BriefScreen
                chapter={selectedChapter}
                mission={currentMission}
                objectives={objectives}
                onBack={goToCampaign}
                onStart={beginMission}
              />
            </motion.div>
          ) : null}

          {stage === 'workspace' ? (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, y: 24, scale: 0.985, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -24, scale: 0.992, filter: 'blur(8px)' }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              <WorkspaceScreen
                activeTab={activeTab}
                canFinish={canFinish}
                hintBankRemaining={hintBankRemaining}
                metrics={metrics}
                mission={currentMission}
                objectives={objectives}
                reviewItems={reviewItems}
                setActiveTab={setActiveTab}
                onBack={goToCampaign}
                onFinishMission={finishMission}
                onRevealHint={revealHint}
                onToggleGovernanceOption={toggleGovernanceOption}
                onSetGovernanceMappingRole={setGovernanceMappingRole}
                onSetInventoryRole={setInventoryRole}
                onSetInventoryScanStrategy={setInventoryScanStrategy}
                onSetInventorySla={setInventorySla}
                onMovePriorityRankingEntry={movePriorityRankingEntry}
                onSetPriorityDecision={setPriorityDecision}
                onTogglePriorityFactor={togglePriorityFactor}
                onSetResponseMethod={setResponseMethod}
                onSetResponseWindow={setResponseWindow}
                onToggleResponseVerification={toggleResponseVerification}
              />
            </motion.div>
          ) : null}

          {stage === 'debrief' ? (
            <motion.div
              key="debrief"
              initial={{ opacity: 0, y: 24, scale: 0.985, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -24, scale: 0.992, filter: 'blur(8px)' }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              <DebriefScreen
                nextChapter={nextChapter}
                metrics={metrics}
                mission={currentMission}
                objectives={objectives}
                reviewItems={reviewItems}
                score={score}
                onContinue={goToNextChapter}
                onRestart={restartMission}
                onReturnToCampaign={goToCampaign}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}

function TopbarChip({
  icon,
  label,
  pending,
  value,
}: {
  icon: ReactNode
  label: string
  pending?: boolean
  value: string
}) {
  return (
    <div className={`status-chip ${pending ? 'status-chip--pending' : ''}`}>
      {icon}
      {label} {value}
    </div>
  )
}

function getDefaultTab(mission: MissionState) {
  switch (mission.kind) {
    case 'governance':
      return 'charter'
    case 'inventory':
      return 'classification'
    case 'prioritization':
      return 'queue'
    default:
      return 'planning'
  }
}

function getNextChapter(
  chapters: typeof campaignChapters,
  currentMissionId: string,
) {
  const currentIndex = chapters.findIndex((chapter) => chapter.id === currentMissionId)

  if (currentIndex === -1) {
    return null
  }

  for (let index = currentIndex + 1; index < chapters.length; index += 1) {
    const candidate = chapters[index]

    if (candidate.status === 'available') {
      return candidate
    }
  }

  return null
}

export default App
