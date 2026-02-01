"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AppMockupProps {
  className?: string;
  variant?: "browser" | "laptop";
  placeholderLabel?: string;
}

export function AppMockup({
  className,
  variant = "browser",
  placeholderLabel = "Dashboard preview",
}: AppMockupProps) {
  return (
    <motion.div
      className={cn("relative", className)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="relative w-full"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        {variant === "browser" ? (
        <div className="rounded-2xl border border-deep-teal-700/80 bg-deep-teal-900/90 shadow-2xl shadow-black/40 overflow-hidden backdrop-blur">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-deep-teal-700/80 bg-deep-teal-950/95 px-4 py-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-deep-teal-600" />
              <span className="h-2.5 w-2.5 rounded-full bg-deep-teal-600" />
              <span className="h-2.5 w-2.5 rounded-full bg-deep-teal-600" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="rounded-lg bg-deep-teal-800/80 px-4 py-1.5 text-body-sm text-deep-teal-400 w-3/4 max-w-xs text-center">
                app.propix.co/dashboard
              </div>
            </div>
          </div>
          {/* Placeholder content */}
          <div className="relative aspect-[16/10] min-h-[280px] bg-gradient-to-br from-deep-teal-900 via-deep-teal-800/50 to-deep-teal-900 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(71,184,152,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(71,184,152,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="relative rounded-xl border border-deep-teal-600/50 bg-deep-teal-950/80 px-8 py-6 text-center backdrop-blur">
              <p className="text-body-sm font-medium text-deep-teal-400 mb-1">
                {placeholderLabel}
              </p>
              <p className="text-body-sm text-deep-teal-500">
                Screenshot coming soon
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Laptop frame */}
          <div className="rounded-lg border-4 border-deep-teal-700 bg-deep-teal-800 p-2 shadow-2xl">
            <div className="rounded border border-deep-teal-600/80 overflow-hidden bg-deep-teal-900">
              <div className="flex items-center gap-2 border-b border-deep-teal-700 px-3 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-deep-teal-500" />
                <span className="h-1.5 w-1.5 rounded-full bg-deep-teal-500" />
                <span className="h-1.5 w-1.5 rounded-full bg-deep-teal-500" />
              </div>
              <div className="aspect-video min-h-[200px] bg-gradient-to-br from-deep-teal-900 to-deep-teal-800 flex items-center justify-center">
                <p className="text-body-sm text-deep-teal-500">{placeholderLabel}</p>
              </div>
            </div>
          </div>
          <div className="mx-auto mt-1 h-2 w-24 rounded-b-full bg-deep-teal-700" />
        </div>
      )}
      </motion.div>
    </motion.div>
  );
}
