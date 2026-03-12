import { motion, AnimatePresence } from "framer-motion"
import { Colors, VALIDATOR_COLORS } from "./types"

export function FlowArrow({ colors, dotted = false }: { colors: Colors; dotted?: boolean }) {
  return (
    <div className="flex items-center justify-center sm:-mt-4">
      <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
        <line
          x1="0" y1="8" x2={dotted ? "24" : "34"} y2="8"
          stroke={colors.stroke} strokeOpacity="0.6" strokeWidth="1.5"
          strokeDasharray={dotted ? "4 3" : undefined}
        />
        <path
          d="M26 3l8 5-8 5"
          stroke={colors.stroke} strokeOpacity="0.7" strokeWidth="2"
          fill="none" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={dotted ? "4 3" : undefined}
        />
      </svg>
    </div>
  )
}

export function DAGNode({
  validator,
  size = 24,
  status = "proposed",
  animate = false,
}: {
  validator: number
  size?: number
  status?: "proposed" | "supported" | "certified" | "committed" | "skipped"
  animate?: boolean
}) {
  const color = VALIDATOR_COLORS[validator % VALIDATOR_COLORS.length]
  const opacity = status === "skipped" ? 0.2 : status === "committed" ? 1 : 0.7
  const borderColor = status === "committed" ? "#22c55e" : status === "certified" ? color : `${color}60`

  const node = (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: `${color}${status === "skipped" ? "15" : "30"}`,
        border: `2px solid ${borderColor}`,
        borderRadius: 4,
        opacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {status === "committed" && (
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3">
          <path d="M5 13l4 4L19 7" />
        </svg>
      )}
      {status === "skipped" && (
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeOpacity="0.4">
          <path d="M6 6l12 12M18 6l-12 12" />
        </svg>
      )}
    </div>
  )

  if (animate) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {node}
      </motion.div>
    )
  }

  return node
}

export function SectionDivider({
  number,
  title,
  colors,
}: {
  number: string
  title: string
  colors: Colors
}) {
  return (
    <div className="flex items-center gap-4 mb-3 md:mb-6">
      <span className={`text-sm uppercase tracking-[0.3em] ${colors.text} font-mono font-bold`}>{number}</span>
      <div className={`flex-1 h-px ${colors.border.replace("border", "bg")}`} />
      <span className={`text-sm uppercase tracking-[0.2em] ${colors.text} font-bold`}>{title}</span>
      <div className={`flex-1 h-px ${colors.border.replace("border", "bg")}`} />
    </div>
  )
}

export function ValidatorLegend({ colors }: { colors: Colors }) {
  return (
    <div className="flex items-center gap-4 md:gap-6 flex-wrap px-1 mb-3">
      {VALIDATOR_COLORS.map((color, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
          <span className={`text-sm sm:text-xs md:text-[11px] uppercase tracking-widest ${colors.text} font-semibold`}>
            A{i}
          </span>
        </div>
      ))}
    </div>
  )
}
