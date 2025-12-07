import { useState } from "react";

const VoiceControls = ({ onTranscript }) => {
  const [recording, setRecording] = useState(false);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.onerror = (e) => {
      console.error("Speech error", e.error);
    };

    recognition.onend = () => {
      setRecording(false);
    };

    setRecording(true);
    recognition.start();
  };

  return (
    <button
      type="button"
      onClick={startListening}
      className={`voice-btn ${recording ? "recording" : ""}`}
    >
      {recording ? "🔴 Listening..." : "🎙 Speak"}
    </button>
  );
};

export default VoiceControls;
