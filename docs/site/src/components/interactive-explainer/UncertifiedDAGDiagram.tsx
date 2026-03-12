import { Colors, VALIDATOR_COLORS, VALIDATORS } from "./types"

/**
 * Section 2: The Solution
 * Shows how Mysticeti-C commits in 3 message rounds using uncertified DAGs.
 * Blocks are proposed, supported, and committed without explicit certification.
 */
export function UncertifiedDAGDiagram({ colors }: { colors: Colors }) {
  // Layout constants
  const roundWidth = 100
  const validatorHeight = 50
  const startX = 60
  const startY = 40
  const nodeSize = 24
  const rounds = 6

  function nodeX(round: number) {
    return startX + round * roundWidth
  }
  function nodeY(validator: number) {
    return startY + validator * validatorHeight
  }

  // Define parent connections (simplified DAG showing 2f+1 references)
  const connections: Array<{ from: [number, number]; to: [number, number]; isSupport?: boolean }> = [
    // Round 1 → Round 2 (each block references 3+ from previous round)
    { from: [0, 0], to: [1, 0] }, { from: [0, 1], to: [1, 0] }, { from: [0, 2], to: [1, 0] },
    { from: [0, 0], to: [1, 1] }, { from: [0, 1], to: [1, 1] }, { from: [0, 3], to: [1, 1] },
    { from: [0, 0], to: [1, 2] }, { from: [0, 2], to: [1, 2] }, { from: [0, 3], to: [1, 2] },
    { from: [0, 1], to: [1, 3] }, { from: [0, 2], to: [1, 3] }, { from: [0, 3], to: [1, 3] },
    // Round 2 → Round 3
    { from: [1, 0], to: [2, 0] }, { from: [1, 1], to: [2, 0] }, { from: [1, 2], to: [2, 0] },
    { from: [1, 0], to: [2, 1] }, { from: [1, 1], to: [2, 1] }, { from: [1, 3], to: [2, 1] },
    { from: [1, 0], to: [2, 2] }, { from: [1, 2], to: [2, 2] }, { from: [1, 3], to: [2, 2] },
    { from: [1, 1], to: [2, 3] }, { from: [1, 2], to: [2, 3] }, { from: [1, 3], to: [2, 3] },
    // Round 3 → Round 4
    { from: [2, 0], to: [3, 0] }, { from: [2, 1], to: [3, 0] }, { from: [2, 2], to: [3, 0] },
    { from: [2, 0], to: [3, 1] }, { from: [2, 1], to: [3, 1] }, { from: [2, 3], to: [3, 1] },
    { from: [2, 0], to: [3, 2] }, { from: [2, 2], to: [3, 2] }, { from: [2, 3], to: [3, 2] },
    { from: [2, 1], to: [3, 3] }, { from: [2, 2], to: [3, 3] }, { from: [2, 3], to: [3, 3] },
    // Round 4 → Round 5
    { from: [3, 0], to: [4, 0] }, { from: [3, 1], to: [4, 0] }, { from: [3, 2], to: [4, 0] },
    { from: [3, 0], to: [4, 1] }, { from: [3, 1], to: [4, 1] }, { from: [3, 3], to: [4, 1] },
    { from: [3, 0], to: [4, 2] }, { from: [3, 2], to: [4, 2] }, { from: [3, 3], to: [4, 2] },
    { from: [3, 1], to: [4, 3] }, { from: [3, 2], to: [4, 3] }, { from: [3, 3], to: [4, 3] },
    // Round 5 → Round 6
    { from: [4, 0], to: [5, 0] }, { from: [4, 1], to: [5, 0] }, { from: [4, 2], to: [5, 0] },
    { from: [4, 0], to: [5, 1] }, { from: [4, 1], to: [5, 1] }, { from: [4, 3], to: [5, 1] },
    { from: [4, 0], to: [5, 2] }, { from: [4, 2], to: [5, 2] }, { from: [4, 3], to: [5, 2] },
    { from: [4, 1], to: [5, 3] }, { from: [4, 2], to: [5, 3] }, { from: [4, 3], to: [5, 3] },
  ]

  // Highlight the 3-round commit path for block (A0, round 1)
  // Round 1: propose → Round 2: 2f+1 support → Round 3: 2f+1 certificates
  const commitPath = {
    proposer: [0, 0], // A0, round 1
    supporters: [[1, 0], [1, 1], [1, 2]], // 3 blocks in round 2 support it
    certifiers: [[2, 0], [2, 1], [2, 2]], // 3 blocks in round 3 certify it
  }

  const svgWidth = startX + rounds * roundWidth + 40
  const svgHeight = startY + 4 * validatorHeight + 20

  return (
    <div className="mb-1 mt-2 md:mb-2 md:mt-4">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`text-sm sm:text-xs md:text-[11px] uppercase tracking-[0.15em] ${colors.text} font-semibold`}>
          Uncertified DAG consensus (Mysticeti-C)
        </span>
      </div>

      <div
        className="border p-2 sm:p-3"
        style={{ borderColor: "rgba(156, 163, 175, 0.5)", backgroundColor: "rgba(156, 163, 175, 0.01)" }}
      >
        {/* Legend */}
        <div className="flex items-center gap-4 md:gap-6 flex-wrap px-1 mb-3">
          {VALIDATORS.map((v) => (
            <div key={v.id} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: v.color }} />
              <span className={`text-sm sm:text-xs md:text-[11px] uppercase tracking-widest ${colors.text} font-semibold`}>
                {v.label}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#22c55e" }} />
            <span className={`text-sm sm:text-xs md:text-[11px] uppercase tracking-widest ${colors.text} font-semibold`}>
              Committed
            </span>
          </div>
        </div>

        <div className={`p-2 sm:p-3 border ${colors.border} ${colors.blockBg}`}>
          <div
            className="p-4 sm:p-6 overflow-x-auto"
            style={{
              backgroundColor: "rgba(156, 163, 175, 0.05)",
              boxShadow: "inset 0 2px 8px 0 rgba(156, 163, 175, 0.25), inset 0 1px 2px 0 rgba(156, 163, 175, 0.2)",
              border: "1px solid rgba(156, 163, 175, 0.3)",
            }}
          >
            <div className="relative mx-auto" style={{ width: svgWidth, height: svgHeight }}>
              <svg className="absolute inset-0 w-full h-full overflow-visible">
                <defs>
                  <marker id="dag-arrow" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill={colors.stroke} fillOpacity="0.2" />
                  </marker>
                  <marker id="dag-arrow-highlight" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#22c55e" fillOpacity="0.6" />
                  </marker>
                </defs>

                {/* Validator labels */}
                {VALIDATORS.map((v) => (
                  <text
                    key={v.id}
                    x={15}
                    y={nodeY(v.id) + nodeSize / 2 + 4}
                    fill={v.color}
                    fontSize="12"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {v.label}
                  </text>
                ))}

                {/* Round labels */}
                {Array.from({ length: rounds }).map((_, r) => (
                  <text
                    key={r}
                    x={nodeX(r) + nodeSize / 2}
                    y={startY - 12}
                    textAnchor="middle"
                    fill={colors.stroke}
                    fillOpacity="0.5"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    r{r + 1}
                  </text>
                ))}

                {/* DAG connections */}
                {connections.map((conn, i) => {
                  const [fromRound, fromVal] = conn.from
                  const [toRound, toVal] = conn.to
                  const x1 = nodeX(fromRound) + nodeSize
                  const y1 = nodeY(fromVal) + nodeSize / 2
                  const x2 = nodeX(toRound)
                  const y2 = nodeY(toVal) + nodeSize / 2

                  // Check if this is part of the commit path highlight
                  const isHighlight =
                    (fromRound === 0 && fromVal === 0 && toRound === 1 && [0, 1, 2].includes(toVal)) ||
                    (fromRound === 1 && [0, 1, 2].includes(fromVal) && toRound === 2 && [0, 1, 2].includes(toVal))

                  return (
                    <line
                      key={i}
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={isHighlight ? "#22c55e" : colors.stroke}
                      strokeOpacity={isHighlight ? 0.5 : 0.12}
                      strokeWidth={isHighlight ? 1.5 : 1}
                    />
                  )
                })}

                {/* DAG nodes */}
                {Array.from({ length: rounds }).map((_, r) =>
                  VALIDATORS.map((v) => {
                    const x = nodeX(r)
                    const y = nodeY(v.id)
                    const isProposer = r === 0 && v.id === 0
                    const isCommitted = isProposer
                    const isSupporter = r === 1 && [0, 1, 2].includes(v.id)
                    const isCertifier = r === 2 && [0, 1, 2].includes(v.id)

                    let borderStroke = `${v.color}60`
                    let fillOpacity = "30"
                    if (isCommitted) {
                      borderStroke = "#22c55e"
                      fillOpacity = "40"
                    } else if (isCertifier) {
                      borderStroke = `#22c55e80`
                      fillOpacity = "25"
                    } else if (isSupporter) {
                      borderStroke = `${v.color}90`
                      fillOpacity = "35"
                    }

                    return (
                      <g key={`${r}-${v.id}`}>
                        <rect
                          x={x} y={y} width={nodeSize} height={nodeSize}
                          fill={`${v.color}${fillOpacity}`}
                          stroke={borderStroke}
                          strokeWidth={isCommitted || isCertifier ? 2 : 1.5}
                          rx="3"
                        />
                        {isCommitted && (
                          <g>
                            <path
                              d={`M${x + 7} ${y + 13} l3 3 l7-7`}
                              fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"
                            />
                          </g>
                        )}
                      </g>
                    )
                  })
                )}

                {/* 3-round bracket */}
                <line x1={nodeX(0)} y1={startY + 4 * validatorHeight + 5} x2={nodeX(2) + nodeSize} y2={startY + 4 * validatorHeight + 5} stroke="#22c55e" strokeWidth="1.5" />
                <text x={nodeX(1) + nodeSize / 2} y={startY + 4 * validatorHeight + 22} textAnchor="middle" fill="#22c55e" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  3 message rounds = committed
                </text>

                {/* Round labels: propose, support, certify */}
                <text x={nodeX(0) + nodeSize / 2} y={startY + 4 * validatorHeight + 38} textAnchor="middle" fill={colors.stroke} fillOpacity="0.4" fontSize="8" fontFamily="monospace">
                  PROPOSE
                </text>
                <text x={nodeX(1) + nodeSize / 2} y={startY + 4 * validatorHeight + 38} textAnchor="middle" fill={colors.stroke} fillOpacity="0.4" fontSize="8" fontFamily="monospace">
                  SUPPORT
                </text>
                <text x={nodeX(2) + nodeSize / 2} y={startY + 4 * validatorHeight + 38} textAnchor="middle" fill={colors.stroke} fillOpacity="0.4" fontSize="8" fontFamily="monospace">
                  CERTIFY
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 md:mt-6">
        <p className={`text-base sm:text-base ${colors.text} leading-relaxed`}>
          Mysticeti-C removes explicit certification. Blocks are proposed, supported, and committed through implicit certificate patterns in the DAG itself. Every block can be committed in exactly 3 message rounds: propose (round r), gather 2f+1 support (round r+1), observe 2f+1 certificates (round r+2). On a WAN, this achieves ~0.5 second commit latency.
        </p>
      </div>
    </div>
  )
}
