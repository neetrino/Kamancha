import Image from "next/image";

const ORNAMENT_SRC = "/assets/brand/home/ornament-strip.webp";
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
  return (
    <section
      aria-hidden="true"
      data-node-id="22:189"
      className="relative left-1/2 z-[1] w-screen max-w-[100vw] -translate-x-1/2 -mt-10 overflow-hidden sm:-mt-16 md:-mt-[88px] lg:-mt-[104px]"
    >
      <div
        className="relative w-full"
        style={{ height: ORNAMENT_H }}
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

            return (
              <div
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
              >
                <Image
                  src={ORNAMENT_SRC}
                  alt=""
                  width={width * 2}
                  height={ORNAMENT_H * 2}
                  sizes={`${width}px`}
                  className="h-full w-full object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
