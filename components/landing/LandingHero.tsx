"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AppMockup } from "./AppMockup";

export function LandingHero() {
  return (
    <section className="container mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32 relative">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="text-center lg:text-left">
          <motion.h1
            className="text-display font-bold text-deep-teal-50 mb-6 max-w-2xl mx-auto lg:mx-0"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Take control of your property pipeline
          </motion.h1>
          <motion.p
            className="text-body-lg text-deep-teal-200 mb-10 max-w-xl mx-auto lg:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            Sourcr connects motivated UK sellers with serious investors. Off-market leads, distress signals, compliant outreach, and quiet sales—all in one platform.
          </motion.p>
          <motion.div
            className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <Link href="/signup?intent=investor">
              <Button size="lg" className="premium-button text-label px-8 py-4">
                I&apos;m an investor
              </Button>
            </Link>
            <Link href="/signup?intent=seller">
              <Button
                size="lg"
                variant="outline"
                className="border-deep-teal-600 text-deep-teal-300 hover:bg-deep-teal-800 hover:text-deep-teal-50 px-8 py-4"
              >
                I want to sell
              </Button>
            </Link>
          </motion.div>
        </div>
        <motion.div
          className="relative flex justify-center lg:justify-end"
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative w-full max-w-lg">
            <AppMockup variant="browser" placeholderLabel="Dashboard preview" />
            {/* Subtle glow behind mockup */}
            <div
              className="absolute -inset-4 -z-10 rounded-3xl opacity-40"
              style={{
                background: "radial-gradient(ellipse at center, rgba(71, 184, 152, 0.15) 0%, transparent 70%)",
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
