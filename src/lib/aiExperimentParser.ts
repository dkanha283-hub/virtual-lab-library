import { ApparatusItem, Department, EquationItem, Laboratory } from '../types/lab'

export interface ParsedExperimentData {
  departmentId?: string
  labId?: string
  customLabName?: string
  experimentNumber?: string
  code?: string
  title?: string
  summary?: string
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced'
  semester?: number
  estimatedMinutes?: number
  objectivesText?: string
  aim?: string
  learningOutcomesText?: string
  apparatus?: ApparatusItem[]
  theory?: string
  equations?: EquationItem[]
  circuitDiagramSvgType?: 'none' | 'dc-shunt' | 'series-rlc' | 'thevenin' | 'pump-loop' | 'digital-logic'
  circuitDiagramDescription?: string
  procedureText?: string
  sampleCalculations?: string
  resultsTemplate?: string
  precautionsText?: string
  vivaQuestions?: { id: string; question: string; answer: string }[]
  referencesText?: string
  filledCount: number
}

function cleanBullet(line: string): string {
  return line.replace(/^\s*([*•\-]|\d+[.)])\s+/, '').trim()
}

function extractStep1Field(step1Text: string, labelPattern: string): string {
  const regex = new RegExp(
    '(?:^|\\n)\\s*(?:[*•\\-]\\s*)?(?:\\*\\*)?(?:' +
      labelPattern +
      ')(?:\\*\\*)?\\s*:\\s*([^\\n]+)',
    'i'
  )
  const match = step1Text.match(regex)
  return match ? match[1].replace(/\*\*/g, '').trim() : ''
}

function extractNumberedSection(step2Text: string, num: number, nextNum?: number): string {
  const startRegex = new RegExp(
    '(?:^|\\n)\\s*(?:#+\\s*)?(?:\\*\\*)?' + num + '\\.\\s+[^\\n]+',
    'i'
  )
  const startMatch = startRegex.exec(step2Text)
  if (!startMatch) return ''
  const contentStart = startMatch.index + startMatch[0].length
  if (!nextNum) return step2Text.slice(contentStart).trim()

  const endRegex = new RegExp(
    '(?:^|\\n)\\s*(?:#+\\s*)?(?:\\*\\*)?' + nextNum + '\\.\\s+[^\\n]+',
    'i'
  )
  const rest = step2Text.slice(contentStart)
  const endMatch = endRegex.exec(rest)
  return (endMatch ? rest.slice(0, endMatch.index) : rest).trim()
}

function parseMarkdownTable(block: string): string[][] {
  const lines = block
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('|') && l.endsWith('|'))

  const rows: string[][] = []
  for (let i = 0; i < lines.length; i++) {
    const cells = lines[i]
      .slice(1, -1)
      .split('|')
      .map((c) => c.trim())
    if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue
    if (i === 0) continue
    if (cells.some((c) => c.length > 0)) rows.push(cells)
  }
  return rows
}

export function parseAiExperimentInfo(
  rawText: string,
  departments: Department[],
  laboratories: Laboratory[]
): ParsedExperimentData {
  const text = rawText.replace(/\r\n/g, '\n').trim()
  const result: ParsedExperimentData = { filledCount: 0 }
  if (!text) return result

  const step2Split = text.search(/(?:^|\n)\s*(?:#+\s*)?(?:\*\*)?STEP\s*2\b/i)
  const step1Text = step2Split !== -1 ? text.slice(0, step2Split) : text
  const step2Text = step2Split !== -1 ? text.slice(step2Split) : text

  // --- STEP 1 FIELDS ---
  const deptRaw = extractStep1Field(step1Text, 'Engineering Department|Department')
  if (deptRaw) {
    const lower = deptRaw.toLowerCase()
    const matchedDept = departments.find(
      (d) =>
        lower.includes(d.name.toLowerCase()) ||
        lower.includes('(' + d.code.toLowerCase() + ')') ||
        lower === d.code.toLowerCase()
    )
    if (matchedDept) {
      result.departmentId = matchedDept.id
      result.filledCount++
    }
  }

  const labRaw = extractStep1Field(step1Text, 'Laboratory Name')
  if (labRaw) {
    const lower = labRaw.toLowerCase()
    const matchedLab = laboratories.find(
      (l) =>
        lower.includes(l.name.toLowerCase()) ||
        l.name.toLowerCase().includes(lower) ||
        lower.includes(l.code.toLowerCase())
    )
    if (matchedLab) {
      result.labId = matchedLab.id
      result.filledCount++
    }
  }

  const newLabRaw = extractStep1Field(step1Text, 'Create New Lab Name')
  if (newLabRaw && !/^not required|^none|^n\/a/i.test(newLabRaw)) {
    result.customLabName = newLabRaw
    result.filledCount++
  }

  const expNum = extractStep1Field(step1Text, 'Experiment Number')
  if (expNum) {
    result.experimentNumber = expNum
    result.filledCount++
  }

  const codeRaw = extractStep1Field(step1Text, 'Course\\s*\\/\\s*Experiment Code|Experiment Code|Course Code')
  if (codeRaw) {
    result.code = codeRaw.replace(/\s*\(Suggested[^)]*\)/i, '').trim()
    result.filledCount++
  }

  const titleRaw = extractStep1Field(step1Text, 'Experiment Name\\s*\\/\\s*Title|Experiment Title|Experiment Name')
  if (titleRaw) {
    result.title = titleRaw
    result.filledCount++
  }

  const summaryRaw = extractStep1Field(step1Text, 'Short Description\\s*\\/\\s*Executive Overview|Short Description|Executive Overview')
  if (summaryRaw) {
    result.summary = summaryRaw
    result.filledCount++
  }

  const diffRaw = extractStep1Field(step1Text, 'Difficulty Level|Difficulty')
  if (/beginner/i.test(diffRaw)) {
    result.difficulty = 'Beginner'
    result.filledCount++
  } else if (/advanced/i.test(diffRaw)) {
    result.difficulty = 'Advanced'
    result.filledCount++
  } else if (/intermediate/i.test(diffRaw)) {
    result.difficulty = 'Intermediate'
    result.filledCount++
  }

  const semRaw = extractStep1Field(step1Text, 'Target Semester|Semester')
  const semMatch = semRaw.match(/\b([1-8])\b/)
  if (semMatch) {
    result.semester = Number(semMatch[1])
    result.filledCount++
  }

  const durRaw = extractStep1Field(step1Text, 'Duration\\s*\\(Minutes\\)|Duration')
  const durMatch = durRaw.match(/(\d+)/)
  if (durMatch) {
    result.estimatedMinutes = Number(durMatch[1])
    result.filledCount++
  }

  const objStart = step1Text.search(/(?:^|\n)\s*(?:[*•\-]\s*)?(?:\*\*)?Learning Objectives(?:\*\*)?\s*:/i)
  if (objStart !== -1) {
    const objBlock = step1Text
      .slice(objStart)
      .split('\n')
      .slice(1)
      .map(cleanBullet)
      .filter((l) => l.length > 0)
    if (objBlock.length > 0) {
      result.objectivesText = objBlock.join('\n')
      result.filledCount++
    }
  }

  // --- STEP 2 SECTIONS ---
  const aimSec = extractNumberedSection(step2Text, 1, 2)
  if (aimSec) {
    result.aim = aimSec
    result.filledCount++
  }

  const coSec = extractNumberedSection(step2Text, 2, 3)
  if (coSec) {
    const lines = coSec.split('\n').map(cleanBullet).filter(Boolean)
    if (lines.length > 0) {
      result.learningOutcomesText = lines.join('\n')
      result.filledCount++
    }
  }

  // Apparatus: supports both Markdown tables AND "- Name | Spec | Qty: 1" bullets
  const appSec = extractNumberedSection(step2Text, 3, 4)
  if (appSec) {
    const tableRows = parseMarkdownTable(appSec)
    if (tableRows.length > 0) {
      result.apparatus = tableRows.map((r) => {
        const qtyMatch = (r[2] || '').match(/\d+/)
        return {
          name: r[0] || 'Instrument',
          specification: r[1] || 'Standard Rating',
          quantity: qtyMatch ? Number(qtyMatch[0]) : 1,
        }
      })
      result.filledCount++
    } else {
      const bulletRows = appSec
        .split('\n')
        .map(cleanBullet)
        .filter((l) => l.includes('|'))
      if (bulletRows.length > 0) {
        result.apparatus = bulletRows.map((line) => {
          const parts = line.split('|').map((p) => p.trim())
          const qtyMatch = (parts[2] || '').match(/\d+/)
          return {
            name: parts[0] || 'Instrument',
            specification: parts[1] || 'Standard Rating',
            quantity: qtyMatch ? Number(qtyMatch[0]) : 1,
          }
        })
        result.filledCount++
      }
    }
  }

  const theorySec = extractNumberedSection(step2Text, 4, 5)
  if (theorySec) {
    result.theory = theorySec
    result.filledCount++
  }

  // Equations: supports both "Equation Name:" blocks AND "1. Name: Formula (LaTeX: ...) | Variables"
  const eqSec = extractNumberedSection(step2Text, 5, 6)
  if (eqSec) {
    const eqBlocks = eqSec.split(/(?=Equation Name\s*:)/i).filter((b) => /Equation Name\s*:/i.test(b))
    if (eqBlocks.length > 0) {
      result.equations = eqBlocks.map((block) => {
        const nameM = block.match(/Equation Name\s*:\s*([^\n]+)/i)
        const copyM = block.match(/Direct Copy-Paste\s*:\s*\n+([^\n]+)/i)
        const latexM = block.match(/LaTeX\s*:\s*\n+([^\n]+)/i)
        const varIdx = block.search(/Variable Definitions\s*:/i)
        const vars =
          varIdx !== -1
            ? block
                .slice(varIdx)
                .split('\n')
                .slice(1)
                .map(cleanBullet)
                .filter(Boolean)
                .join(', ')
            : ''
        return {
          label: nameM ? nameM[1].trim() : 'Equation',
          formula: copyM ? copyM[1].trim() : latexM ? latexM[1].trim() : '',
          variables: vars,
        }
      })
      result.filledCount++
    } else {
      const eqLines = eqSec
        .split('\n')
        .map(cleanBullet)
        .filter((l) => l.includes(':'))
      if (eqLines.length > 0) {
        result.equations = eqLines.map((line) => {
          const [left, right] = line.split('|').map((s) => s.trim())
          const colonIdx = left.indexOf(':')
          const label = colonIdx !== -1 ? left.slice(0, colonIdx).trim() : 'Equation'
          const formulaRaw = colonIdx !== -1 ? left.slice(colonIdx + 1).trim() : left
          const formula = formulaRaw.replace(/\s*\(LaTeX:[\s\S]*\)\s*$/i, '').trim()
          return {
            label,
            formula,
            variables: right || '',
          }
        })
        result.filledCount++
      }
    }
  }

  const schTypeSec = extractNumberedSection(step2Text, 6, 7)
  if (schTypeSec) {
    const low = schTypeSec.toLowerCase()
    if (low.includes('thevenin') || low.includes('superposition') || low.includes('norton') || low.includes('t-network')) {
      result.circuitDiagramSvgType = 'thevenin'
    } else if (low.includes('rlc') || low.includes('resonance')) {
      result.circuitDiagramSvgType = 'series-rlc'
    } else if (low.includes('pump') || low.includes('hydraulic')) {
      result.circuitDiagramSvgType = 'pump-loop'
    } else if (low.includes('digital') || low.includes('logic') || low.includes('ttl')) {
      result.circuitDiagramSvgType = 'digital-logic'
    } else if (low.includes('dc shunt') || low.includes('motor')) {
      result.circuitDiagramSvgType = 'dc-shunt'
    }
    result.filledCount++
  }

  const schDescSec = extractNumberedSection(step2Text, 7, 8)
  if (schDescSec) {
    result.circuitDiagramDescription = schDescSec
    result.filledCount++
  }

  const procSec = extractNumberedSection(step2Text, 8, 9)
  if (procSec) {
    const lines = procSec.split('\n').map(cleanBullet).filter(Boolean)
    if (lines.length > 0) {
      result.procedureText = lines.map((l, idx) => `${idx + 1}. ${l}`).join('\n')
      result.filledCount++
    }
  }

  const calcSec = extractNumberedSection(step2Text, 9, 10)
  if (calcSec) {
    result.sampleCalculations = calcSec
    result.filledCount++
  }

  const resSec = extractNumberedSection(step2Text, 10, 11)
  if (resSec) {
    result.resultsTemplate = resSec
    result.filledCount++
  }

  const precSec = extractNumberedSection(step2Text, 11, 12)
  if (precSec) {
    const lines = precSec.split('\n').map(cleanBullet).filter(Boolean)
    if (lines.length > 0) {
      result.precautionsText = lines.join('\n')
      result.filledCount++
    }
  }

  // Viva-Voce: supports both Markdown tables AND "Q1: ... / A1: ..." pairs
  const vivaSec = extractNumberedSection(step2Text, 12, 13)
  if (vivaSec) {
    const rows = parseMarkdownTable(vivaSec)
    if (rows.length > 0) {
      result.vivaQuestions = rows.map((r, idx) => ({
        id: `viva-${Date.now()}-${idx}`,
        question: r[0] || '',
        answer: r[1] || '',
      }))
      result.filledCount++
    } else {
      const qaMatches = [...vivaSec.matchAll(/Q\d+\s*:\s*([^\n]+)\n+A\d+\s*:\s*([^\n]+)/gi)]
      if (qaMatches.length > 0) {
        result.vivaQuestions = qaMatches.map((m, idx) => ({
          id: `viva-${Date.now()}-${idx}`,
          question: m[1].trim(),
          answer: m[2].trim(),
        }))
        result.filledCount++
      }
    }
  }

  const refSec = extractNumberedSection(step2Text, 13)
  if (refSec) {
    const lines = refSec
      .split('\n')
      .filter((l) => !/^\(No bibliography/i.test(l.trim()))
      .map(cleanBullet)
      .filter(Boolean)
    if (lines.length > 0) {
      result.referencesText = lines.join('\n')
      result.filledCount++
    }
  }

  return result
}
