"use client";

import { motion } from "framer-motion";

export function HeroMotionWrapper({ children, className = "" }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function HeroMotionItem({ children, className = "", delay = 0 }) {
  // Mobile: subtle translate and scale to avoid layout shift and respect limited viewport
  // PC / Desktop: more expressive entrance with slight scale up
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 18,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1], // easeOutQuint-like curve
        delay,
      },
    },
  };

  return (
    <motion.div
      variants={itemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function HeroInteractiveButton({ children, href, className = "", isPrimary = false }) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={className}
    >
      {children}
    </motion.a>
  );
}
