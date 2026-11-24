export type UserRole = 'student' | 'instructor' | 'admin'

export type ExperimentStatus = 'published' | 'draft'

export type ExperimentSectionType =
  | 'aim'
  | 'outcomes'
  | 'apparatus'
  | 'theory'
  | 'equations'
  | 'circuit_diagram'
  | 'model_3d'
  | 'simulation'
  | 'procedure'
  | 'observations'
  | 'calculations'
  | 'graphs'
  | 'results'
  | 'precautions'
  | 'viva'
  | 'references'
  | 'downloads'

export type ModelPresetId =
  | 'dc-shunt-motor'
  | 'rlc-workbench'
  | 'three-phase-induction'
  | 'centrifugal-pump'
  | 'logic-gate-ic-trainer'

export type SimulationPresetId =
  | 'dc-motor-speed-control'
  | 'series-rlc-resonance'
  | 'thevenin-network'
  | 'bernoulli-flow-rig'
  | 'logic-gate-truth-table'

export interface VivaQuestion {
  id: string
  question: string
  answer: string
}

export interface DownloadableResource {
  id: string
  title: string
  fileType: 'PDF' | 'PPTX' | 'GLB' | 'IMAGE' | 'DOCX' | 'ZIP'
  fileSize: string
  url: string
  requiresAuth: boolean
  uploadedAt?: string
}

export interface ExperimentSectionConfig {
  id: ExperimentSectionType
  title: string
  enabled: boolean
  order: number
}

export interface ApparatusItem {
  name: string
  specification: string
  quantity: number
}

export interface EquationItem {
  label: string
  formula: string
  variables: string
}

export interface Experiment {
  id: string
  slug: string
  code: string
  experimentNumber: string
  title: string
  labId: string
  departmentId: string
  semester: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedMinutes: number
  published: boolean
  status: ExperimentStatus
  viewsCount: number
  createdAt: string
  updatedAt: string
  authorName: string
  authorRole: UserRole
  topics: string[]
  summary: string
  aim: string
  objectives: string[]
  learningOutcomes: string[]
  apparatus: ApparatusItem[]
  theory: string
  equations: EquationItem[]
  circuitDiagramSvgType: 'none' | 'dc-shunt' | 'series-rlc' | 'thevenin' | 'pump-loop' | 'digital-logic'
  circuitDiagramDescription: string
  circuitDiagramImageUrl?: string
  has3dModel: boolean
  model3dSource?: 'preset' | 'custom_html'
  model3dPreset: ModelPresetId
  customGlbUrl?: string
  customModelHtml?: string
  hasSimulation: boolean
  simulationSource?: 'preset' | 'custom_html'
  simulationPreset: SimulationPresetId
  customSimulationHtml?: string
  driveFolderPath?: string
  drive3dFileId?: string
  driveSimFileId?: string
  driveDiagramFileId?: string
  procedure: string[]
  sampleCalculations: string
  resultsTemplate: string
  precautions: string[]
  vivaQuestions: VivaQuestion[]
  references: string[]
  downloads: DownloadableResource[]
  sectionsConfig: ExperimentSectionConfig[]
}

export interface Laboratory {
  id: string
  slug: string
  code: string
  name: string
  departmentId: string
  semester: number
  description: string
  incharge: string
  roomNumber: string
  equipmentHighlights: string[]
  featured?: boolean
  published: boolean
}

export interface Department {
  id: string
  slug: string
  code: string
  name: string
  shortName: string
  description: string
  iconName: string
  accentColor: string
  published: boolean
}
