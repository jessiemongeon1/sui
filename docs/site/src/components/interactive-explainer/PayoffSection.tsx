import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Colors, VALIDATOR_COLORS } from "./types"

/**
 * Card: Fast Path for Owned Objects (Mysticeti-FPC)
 * Shows how single-owner transactions skip consensus and finalize in 2 rounds.
 */
function FastPathCard({ colors }: { colors: Colors }) {
  const [phase, setPhase] = useState<"submit" | "vote" | "execute" | "done">("submit")

  useEffect(() => {
    const cycle = () => {
      setPhase("submit")
      setTimeout(() => setPhase("vote"), 800)
      setTimeout(() => setPhase("execute"), 1600)
      setTimeout(() => setPhase("done"), 2200)
    }
    cycle()
    const interval = setInterval(cycle, 3500)
    return () => clearInterval(interval)
  }, [])

  const phases = [
    { key: "submit", label: "Submit", sublabel: "owned object tx", color: VALIDATOR_COLORS[0] },
    { key: "vote", label: "Vote", sublabel: "2f+1 validators", color: VALIDATOR_COLORS[1] },
    { key: "execute", label: "Execute", sublabel: "no consensus needed", color: VALIDATOR_COLORS[2] },
  ]

  const phaseIndex = phases.findIndex((p) => p.key === phase)

  return (
    <div className={`p-6 border ${colors.border} ${colors.blockBg} h-full flex flex-col`}>
      <div className="mb-5">
        <h3 className={`text-lg font-bold ${colors.text} mb-2`}>Fast path for owned objects</h3>
        <p className={`text-base sm:text-sm ${colors.textMuted} leading-relaxed`}>
          Transactions on single-owner objects (coins, NFTs) skip consensus entirely. Votes are embedded in DAG blocks, avoiding extra signature overhead.
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4">
        {/* Pipeline */}
        <div className="flex items-center justify-center gap-3">
          {phases.map((step, i) => (
            <div key={step.key} className="flex items-center gap-3">
              <motion.div className="flex flex-col items-center" animate={{ opacity: phaseIndex >= i ? 1 : 0.3 }}>
                <motion.div
                  className="w-16 h-12 flex flex-col items-center justify-center rounded"
                  style={{
                    backgroundColor: `${step.color}15`,
                    border: `1.5px solid ${phaseIndex >= i ? step.color : `${step.color}30`}`,
                  }}
                >
                  {phaseIndex > i ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  ) : phaseIndex === i ? (
                    <motion.div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: step.color }}
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: `${step.color}30` }} />
                  )}
                </motion.div>
                <span className={`text-[9px] font-mono mt-1.5 ${colors.text}`}>{step.label}</span>
                <span className={`text-[7px] font-mono ${colors.textMuted}`}>{step.sublabel}</span>
              </motion.div>
              {i < phases.length - 1 && (
                <svg width="20" height="12" viewBox="0 0 20 12" className="opacity-30">
                  <path d="M0 6h14M10 2l6 4-6 4" stroke={colors.stroke} strokeWidth="1.5" fill="none" />
                </svg>
              )}
            </div>
          ))}

          <span className={`text-lg ${colors.textMuted} mx-1`}>=</span>

          <motion.div className="flex flex-col items-center" animate={{ opacity: phase === "done" ? 1 : 0.3 }}>
            <motion.div
              className="w-16 h-12 flex items-center justify-center rounded"
              style={{ border: "1.5px solid #22c55e" }}
              animate={{ backgroundColor: phase === "done" ? "#22c55e15" : "transparent" }}
            >
              <AnimatePresence>
                {phase === "done" && (
                  <motion.svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <path d="M5 13l4 4L19 7" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.div>
            <span className="text-[9px] font-mono mt-1.5 text-green-500 font-bold">Finalized</span>
            <span className={`text-[7px] font-mono ${colors.textMuted}`}>~0.25s</span>
          </motion.div>
        </div>

        {/* Comparison */}
        <div className="flex justify-center gap-3 mt-2">
          <div className={`px-3 py-1.5 text-[10px] font-mono`} style={{ backgroundColor: "#22c55e15", border: "1px solid #22c55e40" }}>
            <span style={{ color: "#22c55e" }}>Fast path: 1 round to execute</span>
          </div>
          <div className={`px-3 py-1.5 text-[10px] font-mono`} style={{ backgroundColor: `${colors.stroke}08`, border: `1px solid ${colors.stroke}15` }}>
            <span className={colors.textMuted}>Consensus path: 3 rounds</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Card: Epoch Safety
 * Shows how the epoch-change bit mechanism prevents finalized transactions from being lost.
 */
function EpochSafetyCard({ colors }: { colors: Colors }) {
  const [epoch, setEpoch] = useState(1)
  const [epochBit, setEpochBit] = useState(false)
  const [txCount, setTxCount] = useState(0)
  const txRef = useRef(0)

  useEffect(() => {
    // Simulate epoch lifecycle
    const cycle = () => {
      setEpochBit(false)
      txRef.current = 0
      setTxCount(0)

      // Fast path transactions flowing
      const txInterval = setInterval(() => {
        txRef.current++
        setTxCount(txRef.current)
      }, 400)

      // Epoch change bit set after 3s
      setTimeout(() => {
        setEpochBit(true)
        clearInterval(txInterval)
      }, 3000)

      // New epoch after 4s
      setTimeout(() => {
        setEpoch((prev) => prev + 1)
      }, 4500)
    }

    cycle()
    const interval = setInterval(cycle, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`p-6 border ${colors.border} ${colors.blockBg} h-full flex flex-col`}>
      <div className="mb-5">
        <h3 className={`text-lg font-bold ${colors.text} mb-2`}>Safe epoch transitions</h3>
        <p className={`text-base sm:text-sm ${colors.textMuted} leading-relaxed`}>
          The epoch-change bit pauses the fast path before closing an epoch. All finalized transactions persist across validator reconfigurations.
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4">
        {/* Epoch indicator */}
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <motion.div className={`text-2xl font-mono font-bold ${colors.text}`} key={epoch} initial={{ scale: 1.3 }} animate={{ scale: 1 }}>
              E{epoch}
            </motion.div>
            <div className={`text-[9px] font-mono ${colors.textMuted}`}>current epoch</div>
          </div>

          <div className="h-8 w-px" style={{ backgroundColor: `${colors.stroke}20` }} />

          <div className="text-center">
            <motion.div
              className="text-2xl font-mono font-bold"
              style={{ color: epochBit ? "#ef4444" : "#22c55e" }}
              key={`${epoch}-${epochBit}`}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
            >
              {epochBit ? "1" : "0"}
            </motion.div>
            <div className={`text-[9px] font-mono ${colors.textMuted}`}>epoch-change bit</div>
          </div>

          <div className="h-8 w-px" style={{ backgroundColor: `${colors.stroke}20` }} />

          <div className="text-center">
            <motion.div className="text-2xl font-mono font-bold text-green-500" key={txCount} initial={{ scale: 1.1 }} animate={{ scale: 1 }}>
              {txCount}
            </motion.div>
            <div className={`text-[9px] font-mono ${colors.textMuted}`}>fast path txns</div>
          </div>
        </div>

        {/* Status */}
        <div className="flex justify-center">
          <motion.div
            className="px-3 py-1.5 text-[10px] font-mono"
            animate={{
              backgroundColor: epochBit ? "#ef444415" : "#22c55e15",
              borderColor: epochBit ? "#ef444440" : "#22c55e40",
            }}
            style={{ border: "1px solid" }}
          >
            <motion.span animate={{ color: epochBit ? "#ef4444" : "#22c55e" }}>
              {epochBit ? "Fast path paused, finalizing epoch..." : "Fast path active, transactions flowing"}
            </motion.span>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

/**
 * Section 4: The Payoff - what Mysticeti enables
 */
export function PayoffSection({ colors }: { colors: Colors }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className={`text-lg md:text-xl font-bold ${colors.text} mb-2`}>What Mysticeti enables</h3>
        <p className={`text-sm ${colors.textMuted}`}>
          Mysticeti-FPC extends consensus with a fast path for owned-object transactions, co-designed with the DAG instead of bolted on.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="min-h-[300px]">
          <FastPathCard colors={colors} />
        </div>
        <div className="min-h-[300px]">
          <EpochSafetyCard colors={colors} />
        </div>
      </div>

      <p className={`text-xs ${colors.textMuted} font-mono font-medium`}>
        8-10x throughput improvement over Zef for fast path transactions, with comparable latency (~0.25s).
      </p>
    </div>
  )
}
