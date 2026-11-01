/** Webcam recording helpers shared by the behavioural and sensory tests. */

export const cameraSupported = () =>
  typeof window !== "undefined" &&
  !!navigator.mediaDevices?.getUserMedia &&
  typeof window.MediaRecorder !== "undefined";

export function pickMimeType() {
  const types = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"];
  return types.find((t) => window.MediaRecorder?.isTypeSupported?.(t)) || "";
}

export function extFor(mime) {
  return mime && mime.includes("mp4") ? "mp4" : "webm";
}

/**
 * Starts recording the webcam. Returns { stream, stop() -> Promise<Blob> }.
 */
export async function startRecording({ audio = false, width = 640, height = 480 } = {}) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: width }, height: { ideal: height }, facingMode: "user" },
    audio,
  });
  const mimeType = pickMimeType();
  const recorder = new MediaRecorder(
    stream,
    mimeType ? { mimeType, videoBitsPerSecond: 1_500_000 } : undefined
  );
  const chunks = [];
  recorder.ondataavailable = (e) => e.data && e.data.size > 0 && chunks.push(e.data);
  recorder.start(1000);
  const stop = () =>
    new Promise((resolve) => {
      const finish = () => {
        stream.getTracks().forEach((t) => t.stop());
        resolve(new Blob(chunks, { type: recorder.mimeType || mimeType || "video/webm" }));
      };
      if (recorder.state === "inactive") return finish();
      recorder.onstop = finish;
      recorder.stop();
      return null;
    });
  const cancel = () => {
    try {
      if (recorder.state !== "inactive") recorder.stop();
    } catch (e) {
      /* ignore */
    }
    stream.getTracks().forEach((t) => t.stop());
  };
  return { stream, stop, cancel, mimeType: recorder.mimeType || mimeType };
}

export function cameraErrorMessage(err) {
  if (err?.name === "NotAllowedError")
    return "Camera permission was denied. Allow camera access in your browser and try again.";
  if (err?.name === "NotFoundError") return "No camera was found on this device.";
  if (err?.name === "NotReadableError") return "The camera is being used by another application.";
  return err?.message || "Could not start the camera.";
}
