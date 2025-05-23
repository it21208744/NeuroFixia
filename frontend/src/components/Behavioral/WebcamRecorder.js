import { useRef, useState } from "react";

const WebcamRecorder = () => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState("");

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);

      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: "video/webm",
      });

      mediaRecorderRef.current = mediaRecorder;
      setRecordedChunks([]);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setRecording(false);

      // Stop all tracks in the stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const handleDownload = () => {
    if (recordedChunks.length === 0) return;

    const blob = new Blob(recordedChunks, {
      type: "video/webm",
    });

    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);

    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "recorded-video.webm";
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Webcam Recorder</h1>

      <div style={{ marginBottom: "20px" }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: "100%", border: "1px solid #ccc", borderRadius: "4px" }}
        />
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {!recording ? (
          <button
            onClick={startRecording}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            style={{
              padding: "10px 20px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Stop Recording
          </button>
        )}

        {recordedChunks.length > 0 && (
          <button
            onClick={handleDownload}
            disabled={recording}
            style={{
              padding: "10px 20px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              opacity: recording ? 0.5 : 1,
            }}
          >
            Download Video
          </button>
        )}
      </div>

      {downloadUrl && (
        <div style={{ marginTop: "20px" }}>
          <p>Video recorded successfully!</p>
        </div>
      )}
    </div>
  );
};

export default WebcamRecorder;
