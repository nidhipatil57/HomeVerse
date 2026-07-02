"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  duration = 2,
  className = "",
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const endValue = value;
    const durationMs = duration * 1000;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(eased * endValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </motion.span>
  );
}
