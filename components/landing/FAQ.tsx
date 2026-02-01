"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  {
    q: "What is Prop IX?",
    a: "Prop IX is a UK platform connecting motivated property sellers with serious investors. Investors get data-driven distress signals, off-market leads, and compliant outreach tools. Sellers can list quietly without public listings or estate agent fees.",
  },
  {
    q: "Is Prop IX compliant with data protection?",
    a: "Yes. We're built compliance-first: suppression lists, opt-out handling, consent rules, audit logs, and daily sending limits. Outreach is assisted sending only by default, with full GDPR-aware practices.",
  },
  {
    q: "Which data sources do you use?",
    a: "We integrate with Companies House, EPC Open Data, The Gazette, and Land Registry Price Paid Data. API keys can be managed per workspace in Settings, with validation—no placeholders.",
  },
  {
    q: "How does the Quiet Sale work for sellers?",
    a: "Sellers submit property details via our form. We match them with investors by area and criteria. Messaging is in-app and discreet. No upfront fees; you only engage with verified, serious buyers.",
  },
  {
    q: "What are the subscription plans?",
    a: "We offer Starter and Pro plans with different limits (e.g. outreach volume). Billing is via Stripe with a customer portal to manage your subscription. See Pricing for details.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="container mx-auto px-6 py-24">
      <motion.h2
        className="text-section font-bold text-deep-teal-50 text-center mb-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Your questions, answered
      </motion.h2>
      <motion.p
        className="text-body text-deep-teal-300 text-center max-w-2xl mx-auto mb-14"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        Everything you need to know about Prop IX, from compliance to pricing.
      </motion.p>
      <div className="max-w-3xl mx-auto space-y-2">
        {items.map((item, i) => (
          <motion.div
            key={item.q}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-deep-teal-700/80 bg-deep-teal-900/60 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-subsection font-semibold text-deep-teal-50 hover:bg-deep-teal-800/50 transition-colors"
            >
              {item.q}
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-deep-teal-400 transition-transform",
                  openIndex === i && "rotate-180"
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-4 text-body-sm text-deep-teal-300 border-t border-deep-teal-700/50 pt-2">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
