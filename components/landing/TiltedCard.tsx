"use client";

import { useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface TiltedCardProps {
  children: React.ReactNode;
  className?: string;
  tiltAmount?: number;
  /** Stagger delay in seconds for scroll-in animation */
  delay?: number;
}

export function TiltedCard({
  children,
  className,
  tiltAmount = 8,
  delay = 0,
}: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const moveX = (e.clientX - centerX) / (rect.width / 2);
    const moveY = (e.clientY - centerY) / (rect.height / 2);
    x.set(moveY * tiltAmount);
    y.set(-moveX * tiltAmount);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const scale = isHovered ? 1.02 : 1;
  const transform = useMotionTemplate`perspective(800px) rotateX(${x}deg) rotateY(${y}deg) scale3d(${scale}, ${scale}, ${scale})`;

  return (
    <motion.div
      ref={ref}
      className={cn("transition-shadow duration-300", className)}
      onMouseMove={handleMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleLeave}
      style={{ transform }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}
