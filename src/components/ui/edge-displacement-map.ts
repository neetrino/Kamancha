const MAX_MAP_EDGE_PX = 280;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function roundedRectSdf(
  px: number,
  py: number,
  halfW: number,
  halfH: number,
  radius: number,
): number {
  const qx = Math.abs(px) - halfW + radius;
  const qy = Math.abs(py) - halfH + radius;
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  return Math.min(Math.max(qx, qy), 0) + outside - radius;
}

type EdgeDisplacementOptions = {
  width: number;
  height: number;
  radiusPx: number;
  rimPx: number;
};

/**
 * RG displacement map: neutral center, outward bend concentrated on the rim.
 */
export function createEdgeDisplacementDataUrl({
  width,
  height,
  radiusPx,
  rimPx,
}: EdgeDisplacementOptions): string | null {
  const scale = Math.min(1, MAX_MAP_EDGE_PX / Math.max(width, height, 1));
  const w = Math.max(8, Math.round(width * scale));
  const h = Math.max(8, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return null;
  }

  const image = ctx.createImageData(w, h);
  const data = image.data;
  const halfW = w / 2;
  const halfH = h / 2;
  const radius = Math.min(radiusPx * scale, halfW - 1, halfH - 1);
  const rim = Math.max(6, rimPx * scale);

  paintRimDisplacement(data, w, h, halfW, halfH, radius, rim);
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL("image/png");
}

function paintRimDisplacement(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  halfW: number,
  halfH: number,
  radius: number,
  rim: number,
): void {
  const eps = 1.25;

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const nx = x + 0.5 - halfW;
      const ny = y + 0.5 - halfH;
      const sdf = roundedRectSdf(nx, ny, halfW, halfH, radius);
      const inside = Math.max(0, -sdf);
      const rimWeight = smoothstep(rim, 0, inside);
      const ddx = roundedRectSdf(nx + eps, ny, halfW, halfH, radius) - sdf;
      const ddy = roundedRectSdf(nx, ny + eps, halfW, halfH, radius) - sdf;
      const len = Math.hypot(ddx, ddy) || 1;
      const ox = (ddx / len) * rimWeight;
      const oy = (ddy / len) * rimWeight;
      const i = (y * w + x) * 4;
      data[i] = Math.round((ox * 0.5 + 0.5) * 255);
      data[i + 1] = Math.round((oy * 0.5 + 0.5) * 255);
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }
}
