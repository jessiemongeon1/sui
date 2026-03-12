// Shared types and constants for Mysticeti explainer components

export interface Colors {
  bg: string
  text: string
  textMuted: string
  textFaint: string
  border: string
  borderStrong: string
  blockBg: string
  blockBgStrong: string
  blockSolid: string
  blockFaint: string
  stroke: string
}

export interface DAGBlock {
  id: string
  validator: number
  round: number
  parents: string[]
  status: "proposed" | "supported" | "certified" | "committed" | "skipped"
  isEquivocation?: boolean
}

export interface ValidatorInfo {
  id: number
  label: string
  color: string
  isByzantine?: boolean
  isCrashed?: boolean
}

// Mysticeti configuration constants
export const MYSTICETI_CONFIG = {
  validators: 4, // n = 3f + 1, f = 1
  f: 1,
  quorum: 3, // 2f + 1
  commitRounds: 3, // 3 message delays to commit
  bullsharkRounds: 6, // Bullshark needs 6 message delays
  wanLatency: 500, // ~0.5s WAN latency for Mysticeti-C
  bullsharkLatency: 1900, // ~1.9s for Bullshark
}

// Validator colors
export const VALIDATOR_COLORS = [
  "#3b82f6", // blue - A0
  "#22c55e", // green - A1
  "#f59e0b", // amber - A2
  "#ef4444", // red - A3
]

export const VALIDATORS: ValidatorInfo[] = [
  { id: 0, label: "A₀", color: VALIDATOR_COLORS[0] },
  { id: 1, label: "A₁", color: VALIDATOR_COLORS[1] },
  { id: 2, label: "A₂", color: VALIDATOR_COLORS[2] },
  { id: 3, label: "A₃", color: VALIDATOR_COLORS[3] },
]
