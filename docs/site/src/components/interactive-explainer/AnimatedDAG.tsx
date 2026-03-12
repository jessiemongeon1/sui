import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Colors, VALIDATOR_COLORS, VALIDATORS } from "./types"

/**
 * Animated DAG visualization showing blocks being proposed by validators
 * across rounds, with support arrows and commit patterns emerging.
 */
export function AnimatedDAG({ colors }: { colors: Colors }) {
  const [currentRound, setCurrentRound] = useState(0)
  const [blocks, setBlocks] = useState<Array<{ round: number; validator: number; committed: boolean }>>([])
  const [commitFlash, setCommitFlash] = useState<string | null>(null)
  const roundRef = useRef(0)
  const maxVisibleRounds = 8

  useEffect(() => {
    const interval = setInterval(() => {
      roundRef.current++
      const round = roundRef.current

      // All 4 validators propose (sometimes one crashes)
      const crashedValidator = round % 7 === 0 ? 3 : -1
      const newBlocks = VALIDATORS
        .filter((v) => v.id !== crashedValidator)
        .map((v) => ({
          round,
          validator: v.id,
          committed: false,
        }))

      setBlocks((prev) => {
        const updated = [...prev, ...newBlocks]
        // Mark blocks from 3 rounds ago as committed (if they have enough support)
        if (round >= 3) {
          return updated.map((b) => {
            if (b.round === round - 2 && !b.committed) {
              return { ...b, committed: true }
            }
            return b
          })
        }
        return updated
      })

      setCurrentRound(round)

      // Flash commit indicator
      if (round >= 3) {
        setCommitFlash(`r${round - 2}`)
        setTimeout(() => setCommitFlash(null), 600)
      }
    }, 1200)

    return () => clearInterval(interval)
  }, [])

  // Only show recent rounds
  const visibleRounds = Array.from(
    { length: Math.min(maxVisibleRounds, currentRound + 1) },
    (_, i) => currentRound - Math.min(maxVisibleRounds, currentRound + 1) + 1 + i
  ).filter((r) => r > 0)

  const nodeSize = 28
  const roundSpacing = 80
  const validatorSpacing = 44
  const startX = 50
  const startY = 36

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <span className={`text-sm sm:text-xs md:text-[11px] uppercase tracking-[0.15em] ${colors.text} font-semibold`}>
          Live DAG
        </span>
        <span className={`text-[10px] ${colors.textFaint} font-mono`}>
          blocks commit in 3 rounds
        </span>
      </div>

      <div
        className="border p-2 sm:p-3"
        style={{ borderColor: "rgba(156, 163, 175, 0.5)", backgroundColor: "rgba(156, 163, 175, 0.01)" }}
      >
        <div className={`p-2 sm:p-3 border ${colors.border} ${colors.blockBg}`}>
          <div
            className="p-4 sm:p-6 overflow-hidden"
            style={{
              backgroundColor: "rgba(156, 163, 175, 0.05)",
              boxShadow: "inset 0 2px 8px 0 rgba(156, 163, 175, 0.25)",
              border: "1px solid rgba(156, 163, 175, 0.3)",
            }}
          >
            <div style={{ height: startY + 4 * validatorSpacing + 20, position: "relative" }}>
              <svg className="absolute inset-0 w-full h-full overflow-visible">
                {/* Validator labels */}
                {VALIDATORS.map((v) => (
                  <text
                    key={v.id}
                    x={12}
                    y={startY + v.id * validatorSpacing + nodeSize / 2 + 4}
                    fill={v.color}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {v.label}
                  </text>
                ))}

                {/* Connections between rounds */}
                {visibleRounds.map((round, ri) => {
                  if (ri === 0) return null
                  const prevRound = visibleRounds[ri - 1]
                  const prevBlocks = blocks.filter((b) => b.round === prevRound)
                  const currBlocks = blocks.filter((b) => b.round === round)

                  return currBlocks.map((curr) =>
                    prevBlocks.map((prev) => {
                      const x1 = startX + (ri - 1) * roundSpacing + nodeSize
                      const y1 = startY + prev.validator * validatorSpacing + nodeSize / 2
                      const x2 = startX + ri * roundSpacing
                      const y2 = startY + curr.validator * validatorSpacing + nodeSize / 2

                      const isCommitPath = prev.committed && curr.committed

                      return (
                        <line
                          key={`${prev.round}-${prev.validator}-${curr.round}-${curr.validator}`}
                          x1={x1} y1={y1} x2={x2} y2={y2}
                          stroke={isCommitPath ? "#22c55e" : colors.stroke}
                          strokeOpacity={isCommitPath ? 0.35 : 0.1}
                          strokeWidth={isCommitPath ? 1.5 : 0.8}
                        />
                      )
                    })
                  )
                })}
              </svg>

              {/* Animated block nodes */}
              <AnimatePresence>
                {visibleRounds.map((round, ri) => {
                  const roundBlocks = blocks.filter((b) => b.round === round)
                  return roundBlocks.map((block) => {
                    const x = startX + ri * roundSpacing
                    const y = startY + block.validator * validatorSpacing
                    const color = VALIDATOR_COLORS[block.validator]

                    return (
                      <motion.div
                        key={`${block.round}-${block.validator}`}
                        className="absolute"
                        style={{ left: x, top: y }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0, x: -30 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <motion.div
                          style={{
                            width: nodeSize,
                            height: nodeSize,
                            backgroundColor: `${color}${block.committed ? "40" : "25"}`,
                            border: `2px solid ${block.committed ? "#22c55e" : `${color}60`}`,
                            borderRadius: 4,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          animate={
                            block.committed
                              ? { borderColor: "#22c55e", backgroundColor: `${color}40` }
                              : {}
                          }
                        >
                          {block.committed && (
                            <motion.svg
                              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 20 }}
                            >
                              <path d="M5 13l4 4L19 7" />
                            </motion.svg>
                          )}
                        </motion.div>
                      </motion.div>
                    )
                  })
                })}
              </AnimatePresence>

              {/* Round labels */}
              {visibleRounds.map((round, ri) => (
                <div
                  key={round}
                  className="absolute text-center font-mono"
                  style={{
                    left: startX + ri * roundSpacing,
                    top: startY + 4 * validatorSpacing + 4,
                    width: nodeSize,
                    fontSize: 9,
                    color: commitFlash === `r${round}` ? "#22c55e" : `${colors.stroke}60`,
                  }}
                >
                  r{round}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className={`text-base sm:text-base ${colors.text} leading-relaxed mt-4 md:mt-6`}>
        Every validator proposes a block every round. Each block references 2f+1 blocks from the previous round. Certificate patterns emerge implicitly from the DAG structure. No explicit certification messages, no extra round trips, no wasted CPU on signature verification.
      </p>
    </div>
  )
}
