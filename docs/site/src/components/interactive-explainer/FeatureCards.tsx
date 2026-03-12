import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Colors, VALIDATOR_COLORS, MYSTICETI_CONFIG } from "./types"

/**
 * Card: 3-Round Commit
 * Animated formula showing propose → support → certify = committed
 */
export function ThreeRoundCommitCard({ colors }: { colors: Colors }) {
  const [activeStep, setActiveStep] = useState(0)
  const steps = ["propose", "support", "certify", "committed"]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4)
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`p-6 h-full flex flex-col col-span-1 md:col-span-2 ${colors.blockBg}`}>
      <div className="mb-5">
        <h3 className={`text-lg font-bold ${colors.text} mb-2`}>3 rounds. That is the lower bound.</h3>
        <p className={`text-base sm:text-sm ${colors.textMuted} leading-relaxed`}>
          Mysticeti-C matches the theoretical minimum for Byzantine consensus: 3 message delays. No protocol can do it faster.
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-6">
        {/* Animated pipeline */}
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {[
            { label: "Propose", sublabel: "round r", color: VALIDATOR_COLORS[0] },
            { label: "Support", sublabel: "round r+1", color: VALIDATOR_COLORS[1] },
            { label: "Certify", sublabel: "round r+2", color: VALIDATOR_COLORS[2] },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-4">
              <motion.div
                className="flex flex-col items-center"
                animate={{
                  opacity: activeStep >= i ? 1 : 0.3,
                  scale: activeStep === i ? 1.05 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-14 h-14 flex items-center justify-center rounded"
                  style={{
                    backgroundColor: `${step.color}20`,
                    border: `2px solid ${activeStep >= i ? step.color : `${step.color}30`}`,
                  }}
                  animate={{
                    borderColor: activeStep >= i ? step.color : `${step.color}30`,
                  }}
                >
                  {activeStep > i ? (
                    <motion.svg
                      width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                    >
                      <path d="M5 13l4 4L19 7" />
                    </motion.svg>
                  ) : activeStep === i ? (
                    <motion.div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: step.color }}
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  ) : (
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `${step.color}30` }} />
                  )}
                </motion.div>
                <span className={`text-[10px] font-mono mt-2 ${colors.text}`}>{step.label}</span>
                <span className={`text-[8px] font-mono ${colors.textMuted}`}>{step.sublabel}</span>
              </motion.div>

              {i < 2 && (
                <svg width="24" height="16" viewBox="0 0 24 16" className="opacity-40">
                  <path d="M0 8h18M14 3l6 5-6 5" stroke={colors.stroke} strokeWidth="1.5" fill="none" />
                </svg>
              )}
            </div>
          ))}

          {/* Result */}
          <div className="flex items-center gap-2 sm:gap-4">
            <span className={`text-lg ${colors.textMuted}`}>=</span>
            <motion.div
              className="flex flex-col items-center"
              animate={{ opacity: activeStep === 3 ? 1 : 0.3, scale: activeStep === 3 ? 1.1 : 1 }}
            >
              <motion.div
                className="w-14 h-14 flex items-center justify-center rounded"
                style={{ border: "2px solid #22c55e" }}
                animate={{ backgroundColor: activeStep === 3 ? "#22c55e20" : "transparent" }}
              >
                <AnimatePresence>
                  {activeStep === 3 && (
                    <motion.svg
                      width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    >
                      <path d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </motion.div>
              <span className="text-[10px] font-mono mt-2 text-green-500 font-bold">Committed</span>
              <span className={`text-[8px] font-mono ${colors.textMuted}`}>~0.5s WAN</span>
            </motion.div>
          </div>
        </div>

        {/* Comparison bar */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 rounded-full bg-green-500" style={{ width: 60 }} />
            <span className={`text-[10px] font-mono ${colors.textMuted}`}>Mysticeti (3 rounds, ~0.5s)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 rounded-full bg-gray-400" style={{ width: 120 }} />
            <span className={`text-[10px] font-mono ${colors.textMuted}`}>Bullshark (6 rounds, ~1.9s)</span>
          </div>
        </div>
      </div>

      <div className={`text-[10px] ${colors.textMuted} font-mono text-center pt-3 mt-auto`} style={{ borderTop: `1px solid ${colors.stroke}10` }}>
        4x latency reduction vs Bullshark, deployed on 106 validators
      </div>
    </div>
  )
}

/**
 * Card: Multi-Proposer Slots
 */
export function MultiProposerCard({ colors }: { colors: Colors }) {
  const [slots, setSlots] = useState<Array<{ id: number; status: "commit" | "skip" | "undecided" }>>([])
  const idRef = useRef(0)

  useEffect(() => {
    const interval = setInterval(() => {
      idRef.current++
      const rand = Math.random()
      const status = rand < 0.7 ? "commit" : rand < 0.85 ? "skip" : "undecided"
      setSlots((prev) => [...prev.slice(-7), { id: idRef.current, status: status as any }])
    }, 800)
    return () => clearInterval(interval)
  }, [])

  const statusConfig = {
    commit: { color: "#22c55e", label: "commit", icon: "✓" },
    skip: { color: "#ef4444", label: "skip", icon: "×" },
    undecided: { color: "#f59e0b", label: "wait", icon: "?" },
  }

  return (
    <div className={`p-6 h-full flex flex-col ${colors.blockBg}`}>
      <div className="mb-4">
        <h3 className={`text-lg font-bold ${colors.text} mb-2`}>Every validator proposes. Every round.</h3>
        <p className={`text-base sm:text-sm ${colors.textMuted} leading-relaxed`}>
          Multiple proposer slots per round. Crashed validators are skipped instantly. No single point of failure.
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4">
        <div className="flex items-center gap-1 justify-center overflow-hidden">
          <AnimatePresence mode="popLayout">
            {slots.map((slot) => {
              const cfg = statusConfig[slot.status]
              return (
                <motion.div
                  key={slot.id}
                  layout
                  initial={{ scale: 0, x: 20 }}
                  animate={{ scale: 1, x: 0 }}
                  exit={{ scale: 0.7, x: -15, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `${cfg.color}15`,
                    border: `1.5px solid ${cfg.color}60`,
                    borderRadius: 4,
                  }}
                >
                  <span style={{ color: cfg.color, fontSize: 14, fontWeight: "bold" }}>{cfg.icon}</span>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        <div className="flex gap-3 justify-center">
          {Object.entries(statusConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: cfg.color }} />
              <span className={`text-[9px] font-mono ${colors.textMuted}`}>{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`text-[10px] ${colors.textMuted} font-mono text-center pt-3 mt-auto`} style={{ borderTop: `1px solid ${colors.stroke}10` }}>
        Crashed validators detected and skipped in 1 round
      </div>
    </div>
  )
}

/**
 * Card: Crash Fault Tolerance
 */
export function CrashToleranceCard({ colors }: { colors: Colors }) {
  const [faultyCount, setFaultyCount] = useState(0)
  const [throughput, setThroughput] = useState(100)
  const [latency, setLatency] = useState(500)

  useEffect(() => {
    const interval = setInterval(() => {
      setFaultyCount((prev) => {
        const next = (prev + 1) % 4 // 0, 1, 2, 3 faults
        // Mysticeti degrades gracefully
        setThroughput(next === 0 ? 100 : next === 1 ? 95 : next === 2 ? 85 : 70)
        setLatency(next === 0 ? 500 : next === 1 ? 550 : next === 2 ? 650 : 800)
        return next
      })
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`p-6 h-full flex flex-col ${colors.blockBg}`}>
      <div className="mb-4">
        <h3 className={`text-lg font-bold ${colors.text} mb-2`}>Crash faults? Barely notice.</h3>
        <p className={`text-base sm:text-sm ${colors.textMuted} leading-relaxed`}>
          Skip patterns instantly exclude crashed validators. Sub-second latency maintained even with maximum faults.
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4">
        {/* Validator status */}
        <div className="flex justify-center gap-3">
          {VALIDATOR_COLORS.map((color, i) => {
            const isFaulty = i >= 4 - faultyCount
            return (
              <motion.div
                key={i}
                className="flex flex-col items-center gap-1"
                animate={{ opacity: isFaulty ? 0.3 : 1 }}
              >
                <motion.div
                  className="w-10 h-10 rounded flex items-center justify-center"
                  style={{
                    backgroundColor: `${color}${isFaulty ? "10" : "25"}`,
                    border: `2px solid ${isFaulty ? "#ef4444" : color}`,
                  }}
                  animate={{ borderColor: isFaulty ? "#ef4444" : color }}
                >
                  {isFaulty ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                      <path d="M6 6l12 12M18 6l-12 12" />
                    </svg>
                  ) : (
                    <motion.div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>
                <span className={`text-[9px] font-mono ${isFaulty ? "text-red-400" : colors.textMuted}`}>
                  A{i}
                </span>
              </motion.div>
            )
          })}
        </div>

        {/* Metrics */}
        <div className="flex justify-center gap-6">
          <div className="text-center">
            <motion.div className={`text-xl font-mono font-bold ${colors.text}`} key={latency} initial={{ scale: 1.2 }} animate={{ scale: 1 }}>
              {latency}ms
            </motion.div>
            <div className={`text-[9px] font-mono ${colors.textMuted}`}>latency</div>
          </div>
          <div className="text-center">
            <motion.div className="text-xl font-mono font-bold text-green-500" key={throughput} initial={{ scale: 1.2 }} animate={{ scale: 1 }}>
              {throughput}%
            </motion.div>
            <div className={`text-[9px] font-mono ${colors.textMuted}`}>throughput</div>
          </div>
          <div className="text-center">
            <motion.div className={`text-xl font-mono font-bold ${colors.text}`} key={faultyCount} initial={{ scale: 1.2 }} animate={{ scale: 1 }}>
              {faultyCount}
            </motion.div>
            <div className={`text-[9px] font-mono ${colors.textMuted}`}>faults</div>
          </div>
        </div>
      </div>

      <div className={`text-[10px] ${colors.textMuted} font-mono text-center pt-3 mt-auto`} style={{ borderTop: `1px solid ${colors.stroke}10` }}>
        15-20x latency improvement vs Bullshark under crash faults
      </div>
    </div>
  )
}

/**
 * Feature grid layout
 */
export function FeatureGrid({ colors }: { colors: Colors }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="min-h-[260px] col-span-1 md:col-span-2">
          <ThreeRoundCommitCard colors={colors} />
        </div>
        <div className="min-h-[260px]">
          <MultiProposerCard colors={colors} />
        </div>
        <div className="min-h-[260px]">
          <CrashToleranceCard colors={colors} />
        </div>
      </div>
    </div>
  )
}
