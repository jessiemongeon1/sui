import { Colors, VALIDATOR_COLORS, MYSTICETI_CONFIG } from "./types"

/**
 * Section 1: The Bottleneck
 * Shows how certified DAGs (Bullshark) require 6 message rounds to commit,
 * because each block must be explicitly certified before consensus can proceed.
 */
export function CertifiedDAGDiagram({ colors }: { colors: Colors }) {
  const certColor = "#9ca3af" // grey for certification overhead
  const consensusColor = "#6366f1" // indigo for actual consensus work

  return (
    <div className="mb-1 mt-2 md:mb-2 md:mt-4">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`text-sm sm:text-xs md:text-[11px] uppercase tracking-[0.15em] ${colors.text} font-semibold`}>
          Certified DAG consensus (Bullshark)
        </span>
      </div>

      {/* Outer container */}
      <div
        className="border p-2 sm:p-3"
        style={{ borderColor: "rgba(156, 163, 175, 0.5)", backgroundColor: "rgba(156, 163, 175, 0.01)" }}
      >
        {/* Legend */}
        <div className="flex items-center gap-4 md:gap-6 flex-wrap px-1 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: certColor, opacity: 0.6 }} />
            <span className={`text-sm sm:text-xs md:text-[11px] uppercase tracking-widest ${colors.text} font-semibold`}>
              Certification (3 rounds)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: consensusColor }} />
            <span className={`text-sm sm:text-xs md:text-[11px] uppercase tracking-widest ${colors.text} font-semibold`}>
              Consensus (3 rounds)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm sm:text-xs md:text-[11px] font-mono ${colors.textMuted}`}>
              = 6 rounds total
            </span>
          </div>
        </div>

        {/* Middle layer */}
        <div className={`p-2 sm:p-3 border ${colors.border} ${colors.blockBg}`}>
          <div
            className="p-4 sm:p-8 overflow-x-auto"
            style={{
              backgroundColor: "rgba(156, 163, 175, 0.05)",
              boxShadow: "inset 0 2px 8px 0 rgba(156, 163, 175, 0.25), inset 0 1px 2px 0 rgba(156, 163, 175, 0.2)",
              border: "1px solid rgba(156, 163, 175, 0.3)",
            }}
          >
            <div className="relative mx-auto" style={{ width: "700px", height: "200px" }}>
              <svg className="absolute inset-0 w-full h-full overflow-visible">
                <defs>
                  <marker id="time-arrow-cert" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L9,3 z" fill={colors.stroke} fillOpacity="0.5" />
                  </marker>
                </defs>

                {/* Two certification+consensus cycles */}
                {[0, 1].map((cycle) => {
                  const baseX = cycle * 350
                  const certWidth = 150
                  const consWidth = 150
                  const height = 120
                  const y = 20
                  const gap = 12

                  return (
                    <g key={cycle}>
                      {/* Certification phase - grey */}
                      <rect x={baseX} y={y} width={certWidth} height={height} fill={`${certColor}30`} stroke={`${certColor}60`} strokeWidth="1.5" rx="4" />
                      <text x={baseX + certWidth / 2} y={y + 15} textAnchor="middle" fill={certColor} fontSize="9" fontFamily="monospace" letterSpacing="0.1em">
                        CERTIFY
                      </text>
                      {/* Three sub-rounds inside certification */}
                      {[0, 1, 2].map((r) => (
                        <g key={r}>
                          <line
                            x1={baseX + ((r + 1) * certWidth) / 3}
                            y1={y + 25}
                            x2={baseX + ((r + 1) * certWidth) / 3}
                            y2={y + height - 8}
                            stroke={certColor}
                            strokeOpacity="0.3"
                            strokeWidth="1"
                            strokeDasharray="4 3"
                          />
                          <text
                            x={baseX + (r * certWidth) / 3 + certWidth / 6}
                            y={y + height - 4}
                            textAnchor="middle"
                            fill={certColor}
                            fontSize="8"
                            fontFamily="monospace"
                          >
                            r{cycle * 6 + r + 1}
                          </text>
                        </g>
                      ))}

                      {/* Consensus phase - indigo */}
                      <rect x={baseX + certWidth + gap} y={y} width={consWidth} height={height} fill={`${consensusColor}20`} stroke={`${consensusColor}50`} strokeWidth="1.5" rx="4" />
                      <text x={baseX + certWidth + gap + consWidth / 2} y={y + 15} textAnchor="middle" fill={consensusColor} fontSize="9" fontFamily="monospace" letterSpacing="0.1em">
                        CONSENSUS
                      </text>
                      {[0, 1, 2].map((r) => (
                        <g key={r}>
                          <line
                            x1={baseX + certWidth + gap + ((r + 1) * consWidth) / 3}
                            y1={y + 25}
                            x2={baseX + certWidth + gap + ((r + 1) * consWidth) / 3}
                            y2={y + height - 8}
                            stroke={consensusColor}
                            strokeOpacity="0.3"
                            strokeWidth="1"
                            strokeDasharray="4 3"
                          />
                          <text
                            x={baseX + certWidth + gap + (r * consWidth) / 3 + consWidth / 6}
                            y={y + height - 4}
                            textAnchor="middle"
                            fill={consensusColor}
                            fontSize="8"
                            fontFamily="monospace"
                          >
                            r{cycle * 6 + r + 4}
                          </text>
                        </g>
                      ))}

                      {/* Bracket showing 6 rounds */}
                      <line x1={baseX} y1={y + height + 15} x2={baseX + certWidth + gap + consWidth} y2={y + height + 15} stroke={colors.stroke} strokeOpacity="0.4" strokeWidth="1" />
                      <text x={baseX + (certWidth + gap + consWidth) / 2} y={y + height + 30} textAnchor="middle" fill={colors.stroke} fillOpacity="0.6" fontSize="10" fontFamily="monospace">
                        6 message rounds
                      </text>
                    </g>
                  )
                })}

                {/* Time arrow */}
                <line x1="0" y1="175" x2="680" y2="175" stroke={colors.stroke} strokeOpacity="0.4" strokeWidth="1.5" markerEnd="url(#time-arrow-cert)" />
                <text x="340" y="195" fill={colors.stroke} fillOpacity="0.5" fontSize="10" fontFamily="monospace" textAnchor="middle" letterSpacing="0.2em">
                  TIME
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 md:mt-6">
        <p className={`text-base sm:text-base ${colors.text} leading-relaxed`}>
          In certified DAGs like Bullshark, every block must be explicitly certified before consensus can use it. Certification requires 3 message rounds (propose, gather signatures, rebroadcast certificate). Consensus then needs another 3 rounds. This doubles the minimum commit latency to 6 message delays, resulting in ~2 second commits on a WAN.
        </p>
      </div>
    </div>
  )
}
