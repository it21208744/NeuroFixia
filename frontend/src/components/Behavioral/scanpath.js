/*
 * Turns raw WebGazer samples into a scan-path image in the same style as the training data
 * (Carette et al. 2019 eye-tracking scanpath dataset): 640x480 black canvas, fixations joined
 * by thin coloured lines whose colour changes over time.
 *
 * Bug fixes vs. the original LineArtCanvas: it drew one random colour per raw sample at
 * 0.5px width on a 1080x720 canvas (lines vanished when the model resized to 128px), normalised
 * by the window size instead of the stimulus, and the app then uploaded a fixed example image
 * instead of the child's real gaze drawing.
 */
export const W = 640;
export const H = 480;

/** Dispersion-based fixation detection (I-DT, radius in px of the normalised 640x480 space). */
export function toFixations(points, radius = 35, minSamples = 3) {
  const fix = [];
  let group = [];
  const flush = () => {
    if (group.length >= minSamples) {
      const x = group.reduce((a, p) => a + p.x, 0) / group.length;
      const y = group.reduce((a, p) => a + p.y, 0) / group.length;
      fix.push({ x, y, n: group.length, t: group[0].t });
    }
    group = [];
  };
  points.forEach((p) => {
    if (!group.length) {
      group.push(p);
      return;
    }
    const cx = group.reduce((a, q) => a + q.x, 0) / group.length;
    const cy = group.reduce((a, q) => a + q.y, 0) / group.length;
    if (Math.hypot(p.x - cx, p.y - cy) <= radius) group.push(p);
    else {
      flush();
      group.push(p);
    }
  });
  flush();
  return fix;
}

export function drawScanpath(canvas, points) {
  const ctx = canvas.getContext("2d");
  canvas.width = W;
  canvas.height = H;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  const fix = toFixations(points);
  if (fix.length < 2) return fix.length;
  ctx.lineWidth = 1.2;
  for (let i = 1; i < fix.length; i += 1) {
    const a = fix[i - 1];
    const b = fix[i];
    const hue = 180 - (150 * i) / fix.length; // cyan -> red over time, like the dataset
    ctx.strokeStyle = `hsl(${hue}, 90%, 45%)`;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  fix.forEach((f, i) => {
    const hue = 180 - (150 * i) / fix.length;
    ctx.fillStyle = `hsl(${hue}, 90%, 55%)`;
    ctx.beginPath();
    ctx.arc(f.x, f.y, 1.8, 0, Math.PI * 2);
    ctx.fill();
  });
  return fix.length;
}

export const canvasToBlob = (canvas) =>
  new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
