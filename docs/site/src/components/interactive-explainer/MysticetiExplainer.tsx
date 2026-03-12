import { useColorMode } from "@docusaurus/theme-common"
import Link from "@docusaurus/Link"
import { Colors } from "./types"
import { SectionDivider } from "./SharedComponents"
import { CertifiedDAGDiagram } from "./CertifiedDAGDiagram"
import { UncertifiedDAGDiagram } from "./UncertifiedDAGDiagram"
import { AnimatedDAG } from "./AnimatedDAG"
import { FeatureGrid } from "./FeatureCards"
import { PayoffSection } from "./PayoffSection"
import { MysticetiFAQ } from "./MysticetiFAQ"

export function MysticetiExplainer() {
  const { colorMode } = useColorMode()
  const isDark = colorMode === "dark"

  const colors: Colors = {
    bg: "bg-transparent",
    text: isDark ? "text-white" : "text-black",
    textMuted: isDark ? "text-white/50" : "text-black/50",
    textFaint: isDark ? "text-white/20" : "text-black/20",
    border: isDark ? "border-white/10" : "border-black/10",
    borderStrong: isDark ? "border-white/30" : "border-black/30",
    blockBg: isDark ? "bg-white/5" : "bg-black/5",
    blockBgStrong: isDark ? "bg-white/10" : "bg-black/10",
    blockSolid: isDark ? "bg-white" : "bg-black",
    blockFaint: isDark ? "bg-white/20" : "bg-black/20",
    stroke: isDark ? "#ffffff" : "#000000",
  }

  return (
    <div className={`relative w-full ${colors.bg} flex flex-col items-center justify-center p-4 md:p-12 overflow-x-hidden`}>
      {/* Header */}
      <div className="text-center mb-4 md:mb-16 max-w-5xl w-full mx-auto px-2">
        <h1 className={`text-base sm:text-xl md:text-3xl font-medium ${colors.text} uppercase tracking-[0.1em] sm:tracking-[0.2em] mb-4 md:mb-6 font-mono`}>
          Mysticeti
        </h1>
        <p className={`text-[10px] sm:text-xs md:text-sm ${colors.textMuted} font-mono uppercase tracking-[0.1em] mb-4 md:mb-6`}>
          Reaching the Latency Limits with Uncertified DAGs
        </p>

        {/* Learn More links */}
        <div className="flex flex-row gap-2 sm:gap-3 justify-center items-center">
          <Link
            to="/guides"
            className={`group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 border ${colors.border} ${colors.blockBg} hover:${colors.blockBgStrong} transition-all`}
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.stroke} strokeWidth="1.5"
              className="opacity-50 group-hover:opacity-100 transition-opacity shrink-0 sm:w-4 sm:h-4"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span className={`text-[10px] sm:text-xs ${colors.text} font-mono uppercase tracking-[0.05em] sm:tracking-[0.1em]`}>
              Read Docs
            </span>
          </Link>

          <a
            href="https://arxiv.org/abs/2310.14821"
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 border ${colors.border} ${colors.blockBg} hover:${colors.blockBgStrong} transition-all`}
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.stroke} strokeWidth="1.5"
              className="opacity-50 group-hover:opacity-100 transition-opacity shrink-0 sm:w-4 sm:h-4"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span className={`text-[10px] sm:text-xs ${colors.text} font-mono uppercase tracking-[0.05em] sm:tracking-[0.1em]`}>
              Read Paper
            </span>
          </a>
        </div>
      </div>

      <div className="w-full max-w-5xl">
        {/* Problem statement */}
        <div className="pb-6 mb-6 md:-mt-4 md:pb-10 md:mb-10">
          <p className={`text-base ${colors.textMuted} leading-relaxed`}>
            DAG-based consensus protocols scale well but pay a latency tax: every block must be explicitly certified before it can be committed.
          </p>
          <p className={`text-base ${colors.text} mt-2 md:mt-3 font-medium`}>
            What if certification was implicit?
          </p>
        </div>

        {/* ═════════ SECTION 1: THE PROBLEM ═════════ */}
        <div className="mb-12 md:mb-24">
          <SectionDivider number="01" title="The Bottleneck" colors={colors} />

          <div className="overflow-hidden md:overflow-visible mb-4 md:mb-0">
            <div className="md:transform-none origin-top-left transform scale-[0.5] sm:scale-[0.7] md:scale-100 w-[200%] sm:w-[143%] md:w-full">
              <CertifiedDAGDiagram colors={colors} />
            </div>
          </div>
        </div>

        {/* ═════════ SECTION 2: THE SOLUTION ═════════ */}
        <div className="mb-12 md:mb-24">
          <SectionDivider number="02" title="The Solution" colors={colors} />

          <div className="overflow-hidden md:overflow-visible mb-8 md:mb-8">
            <div className="md:transform-none origin-top-left transform scale-[0.5] sm:scale-[0.7] md:scale-100 w-[200%] sm:w-[143%] md:w-full">
              <UncertifiedDAGDiagram colors={colors} />
            </div>
          </div>

          {/* Live animated DAG */}
          <div className="overflow-hidden md:overflow-visible mb-4 md:mb-0">
            <div className="md:transform-none origin-top-left transform scale-[0.55] sm:scale-[0.75] md:scale-100 w-[182%] sm:w-[133%] md:w-full">
              <AnimatedDAG colors={colors} />
            </div>
          </div>
        </div>

        {/* ═════════ SECTION 3: KEY FEATURES ═════════ */}
        <div className="mb-12 md:mb-24">
          <SectionDivider number="03" title="Key Features" colors={colors} />

          <div className="overflow-hidden md:overflow-visible mb-0">
            <div className="md:transform-none origin-top-left transform scale-[0.55] sm:scale-[0.75] md:scale-100 w-[182%] sm:w-[133%] md:w-full">
              <FeatureGrid colors={colors} />
            </div>
          </div>
        </div>

        {/* ═════════ SECTION 4: THE PAYOFF ═════════ */}
        <div className="mb-12 md:mb-16">
          <SectionDivider number="04" title="The Payoff" colors={colors} />

          <div className="md:overflow-visible h-[750px] sm:h-[850px] md:h-auto overflow-hidden">
            <div className="md:transform-none origin-top-left transform scale-[0.55] sm:scale-[0.75] md:scale-100 w-[182%] sm:w-[133%] md:w-full">
              <PayoffSection colors={colors} />
            </div>
          </div>
        </div>

        {/* ═════════ FAQ ═════════ */}
        <MysticetiFAQ colors={colors} />

        {/* ═════════ LEARN MORE ═════════ */}
        <div className="pt-8 pb-12 md:pt-12 md:pb-16">
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <div className={`flex-1 h-px ${colors.border.replace("border", "bg")}`} />
            <span className={`text-sm uppercase tracking-[0.2em] ${colors.text} font-medium`}>Learn More</span>
            <div className={`flex-1 h-px ${colors.border.replace("border", "bg")}`} />
          </div>

          <div className="flex flex-row gap-2 sm:gap-4 justify-center items-stretch">
            <Link
              to="/guides"
              className={`group flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 border ${colors.border} ${colors.blockBg} hover:${colors.blockBgStrong} transition-all`}
            >
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.stroke} strokeWidth="1.5"
                className="opacity-50 group-hover:opacity-100 transition-opacity shrink-0 sm:w-5 sm:h-5"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <div className="text-left">
                <div className={`text-[9px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.15em] ${colors.textMuted} font-mono`}>Documentation</div>
                <div className={`text-xs sm:text-sm ${colors.text} font-mono`}>Consensus in Sui</div>
              </div>
            </Link>

            <a
              href="https://arxiv.org/abs/2310.14821"
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 border ${colors.border} ${colors.blockBg} hover:${colors.blockBgStrong} transition-all`}
            >
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.stroke} strokeWidth="1.5"
                className="opacity-50 group-hover:opacity-100 transition-opacity shrink-0 sm:w-5 sm:h-5"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <div className="text-left">
                <div className={`text-[9px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.15em] ${colors.textMuted} font-mono`}>Paper</div>
                <div className={`text-xs sm:text-sm ${colors.text} font-mono`}>Mysticeti (NDSS 2025)</div>
              </div>
            </a>

            <a
              href="https://github.com/MystenLabs/sui"
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 border ${colors.border} ${colors.blockBg} hover:${colors.blockBgStrong} transition-all`}
            >
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.stroke} strokeWidth="1.5"
                className="opacity-50 group-hover:opacity-100 transition-opacity shrink-0 sm:w-5 sm:h-5"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
              <div className="text-left">
                <div className={`text-[9px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.15em] ${colors.textMuted} font-mono`}>Source</div>
                <div className={`text-xs sm:text-sm ${colors.text} font-mono`}>GitHub</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
