/*
 * Gaze metrics for the attention (shadow-matching) game.
 * Bug fixes: the target area was hard-coded to pixel coordinates of the developer's monitor
 * (x 599-961, y 72-717), "time to first gaze" summed cumulative timestamps and was then divided
 * by 1000 twice. Both metrics now use the real on-screen rectangle of the target picture.
 */
const inside = (p, r, pad = 40) =>
  p.x >= r.left - pad && p.x <= r.right + pad && p.y >= r.top - pad && p.y <= r.bottom + pad;

/** Seconds from the start of the round until the child first looks at the target picture. */
export function timeToFirstGaze(samples, rect, startTime) {
  const hit = samples.find((p) => inside(p, rect));
  return hit ? Math.max(0, (hit.t - startTime) / 1000) : null;
}

/** Number of times the gaze left the target after having been on it. */
export function countGazeShifts(samples, rect) {
  let wasIn = false;
  let n = 0;
  samples.forEach((p) => {
    const isIn = inside(p, rect);
    if (wasIn && !isIn) n += 1;
    wasIn = isIn;
  });
  return n;
}
