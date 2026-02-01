"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "./AnimatedCounter";

const stats = [
  { value: 500, suffix: "+", label: "Leads sourced", prefix: "" },
  { value: 98, suffix: "%", label: "Compliance-first", prefix: "" },
  { value: 4.9, decimals: 1, suffix: "", label: "User rating", prefix: "" },
  { value: 50, suffix: "+", label: "Deals matched", prefix: "" },
];

export function StatsBar() {
  return (
    <motion.section
      className="border-y border-deep-teal-800/80 bg-deep-teal-950/50 py-10 overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto w-full max-w-[100vw] px-4 sm:px-6 box-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="text-section font-bold text-deep-teal-50 tabular-nums">
                <AnimatedCounter
                  end={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  decimals={stat.decimals ?? 0}
                  duration={2}
                />
              </div>
              <p className="text-body-sm text-deep-teal-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
