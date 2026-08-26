"use client";

import Image from "next/image";
import { motion } from "motion/react";

import { homeEaseOut } from "@/features/home/ui/home-motion";
import { usePlayHomeMotion } from "@/features/home/ui/use-play-home-motion";
import { staticAssetUrl } from "@/lib/media/static-asset-url";

const ORNAMENT_SRC = staticAssetUrl("/assets/brand/home/ornament-strip.webp");
const ORNAMENT_COUNT = 9;
const ORNAMENT_H = 232;
const ORNAMENT_W_EDGE = 172;
const ORNAMENT_W_MID = 170;
/** Half of each edge motif sits past the viewport (стык). */
const ORNAMENT_EDGE_HALF = ORNAMENT_W_EDGE / 2;

/**
 * Decorative ornament strip under the home hero (Figma Frame 182 / 22:189).
 * Purely visual — sits on the storefront forest background.
 * Left and right edges each show exactly one half-ornament at the viewport junction.
 */
export function HomeOrnamentStrip() {
  const playMotion = usePlayHomeMotion();

  return (
    <section
      aria-hidden="true"
      data-node-id="22:189"
      className="relative left-1/2 z-[1] w-screen max-w-[100vw] -translate-x-1/2 -mt-10 overflow-hidden sm:-mt-16 md:-mt-[88px] lg:-mt-[104px]"
    >
      <motion.div
        className="relative w-full"
        style={{ height: ORNAMENT_H }}
        initial={playMotion ? { opacity: 0, y: 20 } : false}
        whileInView={playMotion ? { opacity: 1, y: 0 } : undefined}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ ...homeEaseOut, delay: 0.05 }}
      >
        <div
          className="absolute inset-y-0 flex items-center justify-between"
          style={{
            left: -ORNAMENT_EDGE_HALF,
            right: -ORNAMENT_EDGE_HALF,
          }}
        >
          {Array.from({ length: ORNAMENT_COUNT }, (_, index) => {
            const isEdge = index === 0 || index === ORNAMENT_COUNT - 1;
            const width = isEdge ? ORNAMENT_W_EDGE : ORNAMENT_W_MID;
            const delay = playMotion ? 0.04 + index * 0.045 : 0;

            return (
              <motion.div
                key={index}
                className="relative shrink-0"
                style={{ width, height: ORNAMENT_H }}
                data-node-id={
                  index === 0
                    ? "22:190"
                    : index === ORNAMENT_COUNT - 1
                      ? "22:198"
                      : undefined
                }
                initial={playMotion ? { opacity: 0, scale: 0.92 } : false}
                whileInView={
                  playMotion ? { opacity: 1, scale: 1 } : undefined
                }
                viewport={{ once: true, amount: 0.3 }}
                transition={{ ...homeEaseOut, delay }}
              >
                <Image
                  src={ORNAMENT_SRC}
                  alt=""
                  width={width * 2}
                  height={ORNAMENT_H * 2}
                  sizes={`${width}px`}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
