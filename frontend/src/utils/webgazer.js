/*
 * WebGazer (browser eye tracking) loader.
 * Bug fix: index.html used to load webgazer.js twice and App.js called webgazer.begin() on
 * every page, switching the webcam on as soon as anyone opened the app. Now it is loaded on
 * demand by the screens that need eye tracking and stopped when they unmount.
 */
const SRC = "https://cdn.jsdelivr.net/npm/webgazer@3.3.0/dist/webgazer.js";
let loading = null;

export function loadWebgazer() {
  if (window.webgazer) return Promise.resolve(window.webgazer);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = SRC;
      s.async = true;
      s.onload = () =>
        window.webgazer ? resolve(window.webgazer) : reject(new Error("WebGazer failed to load"));
      s.onerror = () => {
        loading = null;
        reject(
          new Error("Could not download the eye-tracking library. Check your internet connection.")
        );
      };
      document.head.appendChild(s);
    });
  }
  return loading;
}

let running = false;

/** Start gaze tracking with a listener. Resolves to the webgazer instance. */
export async function startGaze(listener, { showVideo = false, showPoints = false } = {}) {
  const wg = await loadWebgazer();
  wg.params.showVideoPreview = showVideo;
  wg.setRegression("ridge").setGazeListener(listener || (() => {}));
  if (!running) {
    await wg.begin();
    running = true;
  } else {
    wg.resume();
  }
  wg.showVideoPreview(showVideo)
    .showPredictionPoints(showPoints)
    .showFaceOverlay(false)
    .showFaceFeedbackBox(false);
  return wg;
}

export function pauseGaze() {
  const wg = window.webgazer;
  if (wg && running) {
    try {
      wg.clearGazeListener();
      wg.pause();
      wg.showPredictionPoints(false);
    } catch (e) {
      /* ignore */
    }
  }
}

/** Fully stop tracking and release the camera. */
export function stopGaze() {
  const wg = window.webgazer;
  if (wg && running) {
    try {
      wg.clearGazeListener();
      wg.end();
    } catch (e) {
      /* ignore */
    }
    running = false;
    document.getElementById("webgazerVideoContainer")?.remove();
  }
}
