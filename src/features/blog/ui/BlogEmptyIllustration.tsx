"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Transition } from "motion/react";

import { staticAssetUrl } from "@/lib/media/static-asset-url";

const BLOG_EMPTY_ILLUSTRATION = staticAssetUrl("/assets/blog/blog-empty.webp");

const springSoft: Transition = {
  type: "spring",
  stiffness: 48,
  damping: 18,
  mass: 1.05,
};

/** Empty-blog photo, pinned to the viewport’s right edge like the home hero. */
export function BlogEmptyIllustration() {
  const reduceMotion = useReducedMotion();
  const playMotion = reduceMotion !== true;

  return (
    <motion.div
      className="pointer-events-none absolute right-0 bottom-0 lg:bottom-[-180px]"
      initial={playMotion ? { opacity: 0, x: "12%" } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={playMotion ? springSoft : { duration: 0 }}
    >
      <Image
        src={BLOG_EMPTY_ILLUSTRATION}
        alt=""
        width={824}
        height={1024}
        unoptimized
        className="h-auto w-[var(--blog-empty-photo)] max-w-none object-contain object-right"
      />
    </motion.div>
  );
}
