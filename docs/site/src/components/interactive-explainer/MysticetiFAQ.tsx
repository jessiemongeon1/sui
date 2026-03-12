import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Colors } from "./types"

interface FAQItem {
  question: string
  answer: string
}

function FAQAccordion({ item, colors, isOpen, onToggle }: { item: FAQItem; colors: Colors; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b" style={{ borderColor: `${colors.stroke}15` }}>
      <button onClick={onToggle} className="w-full flex items-center justify-between py-4 px-1 text-left">
        <span className={`text-sm sm:text-base ${colors.text} font-medium pr-4`}>{item.question}</span>
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.stroke} strokeWidth="2" strokeOpacity={0.5}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={`pb-4 px-1 text-sm ${colors.textMuted} leading-relaxed`}>{item.answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function MysticetiFAQ({ colors }: { colors: Colors }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqItems: FAQItem[] = [
    {
      question: "How does Mysticeti-C achieve 3-round commits?",
      answer:
        "By removing explicit block certification. In certified DAGs like Bullshark, each block needs 3 rounds to be certified, then 3 more rounds for consensus. Mysticeti-C interprets certificate patterns directly from the DAG structure, so blocks are proposed, supported, and committed in exactly 3 message rounds. This matches the theoretical lower bound for Byzantine consensus.",
    },
    {
      question: "What is an uncertified DAG?",
      answer:
        "In a certified DAG, every block must be signed by 2f+1 validators before it can be used by the consensus protocol. This adds latency and CPU overhead. In Mysticeti's uncertified DAG, validators propose signed blocks directly. The DAG structure itself provides the certification guarantees: if 2f+1 blocks in round r+1 reference a block from round r, that block is implicitly certified. Same safety, fewer messages.",
    },
    {
      question: "How does Mysticeti handle crashed validators?",
      answer:
        "Through skip patterns. If 2f+1 blocks in a round do not reference a particular validator's block, Mysticeti immediately marks that proposer slot as to-skip and moves on. This is why Mysticeti maintains sub-second latency even with maximum crash faults, while Bullshark's latency degrades to 8-10 seconds.",
    },
    {
      question: "What are proposer slots?",
      answer:
        "Each (validator, round) pair is a proposer slot. Mysticeti-C introduces three states for each slot: to-commit, to-skip, and undecided. Unlike Bullshark, which only commits one proposer every two rounds, Mysticeti can commit every block in every round. This maximizes throughput and minimizes tail latency.",
    },
    {
      question: "What is the difference between Mysticeti-C and Mysticeti-FPC?",
      answer:
        "Mysticeti-C is the consensus protocol: it commits blocks in 3 rounds and handles shared-object transactions. Mysticeti-FPC extends it with a fast path for owned-object transactions (like token transfers). Fast path transactions are embedded in DAG blocks and can be executed after just 1 round of voting, without waiting for consensus. Both protocols share the same DAG, so there is no extra message overhead.",
    },
    {
      question: "How does the fast path work for owned objects?",
      answer:
        "Transactions that only touch objects controlled by a single owner do not need consensus ordering. Validators include these transactions in their blocks and vote for them. Once a transaction receives 2f+1 votes from distinct validators, it can be safely executed. This takes about 1 message round, achieving ~0.25 second latency.",
    },
    {
      question: "How do epoch transitions work?",
      answer:
        "Mysticeti-FPC uses an epoch-change bit in blocks. When validators set this bit, they stop voting on fast path transactions. Once 2f+1 blocks with the epoch-change bit are committed, the epoch closes. By quorum intersection, all finalized fast path transactions are guaranteed to be in the commit history, ensuring they persist across epoch boundaries and validator reconfigurations.",
    },
    {
      question: "What throughput does Mysticeti achieve?",
      answer:
        "Over 200,000 transactions per second at sub-second latency for consensus commits. For fast path transactions, Mysticeti-FPC achieves 175,000 TPS on a single host, an 8-10x improvement over Zef. Current real-world blockchains combined process about 1,200 TPS, well within Mysticeti's steady-state capacity.",
    },
    {
      question: "Is Mysticeti deployed in production?",
      answer:
        "Yes. Mysticeti-C replaced Bullshark as the consensus protocol for the Sui blockchain on July 25, 2024. The switch resulted in a 4x latency reduction: P50 latency dropped from 1.9 seconds to 400 milliseconds on a network of 106 independently run validators.",
    },
    {
      question: "Does Mysticeti-C use only one message type?",
      answer:
        "Yes. The only message type is the signed block. Validators propose blocks, receive blocks, and derive consensus decisions entirely from the DAG structure. There is no separate certification protocol, no view-change sub-protocol, and no additional metadata exchange. This simplicity makes the protocol easier to implement, test, and maintain.",
    },
  ]

  return (
    <div className="mb-12 md:mb-24">
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <div className={`flex-1 h-px ${colors.border.replace("border", "bg")}`} />
        <span className={`text-sm uppercase tracking-[0.2em] ${colors.text} font-medium`}>FAQ</span>
        <div className={`flex-1 h-px ${colors.border.replace("border", "bg")}`} />
      </div>

      <div className="border p-2 sm:p-3" style={{ borderColor: "rgba(156, 163, 175, 0.5)", backgroundColor: "rgba(156, 163, 175, 0.01)" }}>
        <div className={`p-4 sm:p-6 border ${colors.border} ${colors.blockBg}`}>
          {faqItems.map((item, index) => (
            <FAQAccordion key={index} item={item} colors={colors} isOpen={openIndex === index} onToggle={() => setOpenIndex(openIndex === index ? null : index)} />
          ))}
        </div>
      </div>
    </div>
  )
}
