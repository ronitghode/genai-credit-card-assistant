import { useState, useEffect } from "react";
import { api } from "../api/client";
import MessageBubble from "./MessageBubble";
import VoiceControls from "./VoiceControls";

const ChatWindow = ({ userId }) => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your credit card assistant. How can I help you today?" }
  ]);
  const [lastInputWasVoice, setLastInputWasVoice] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputType, setInputType] = useState("text"); // text | password

  // Voice State
  const [voices, setVoices] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Load voices on mount
  useEffect(() => {
    const loadVoices = () => {
      const avail = window.speechSynthesis.getVoices();
      setVoices(avail);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Load messages from localStorage
    const savedMessages = localStorage.getItem(`chatMessages_${userId}`);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Error loading messages:", e);
      }
    }
  }, [userId]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`chatMessages_${userId}`, JSON.stringify(messages));
  }, [messages, userId]);

  // Text-to-Speech function
  const speakResponse = (text) => {
    if (isMuted || !window.speechSynthesis) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      return;
    }
    window.speechSynthesis.cancel(); // Stop previous
    const utterance = new SpeechSynthesisUtterance(text);

    // Improved Voice Selection Logic
    // Priority: Google English > Natural OS Voices > Default English
    const preferredVoices = [
      "Google US English",
      "Google UK English Female",
      "Samantha",
      "Microsoft Zira",
      "Daniel"
    ];

    // Find best match
    let selectedVoice = null;

    // 1. Try exact name match from preferred list
    for (const name of preferredVoices) {
      selectedVoice = voices.find(v => v.name.includes(name));
      if (selectedVoice) break;
    }

    // 2. Fallback to any high-quality EN voice
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural')));
    }

    // 3. Fallback to any EN voice
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang; // Sync lang with voice
    }

    // Natural pitch/rate
    utterance.pitch = 1.0;
    utterance.rate = 1.0;

    // Event Listeners
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Toggle Mute
  const toggleMute = () => {
    if (!isMuted) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
    setIsMuted(!isMuted);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const handleResume = () => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const sendMessage = async (text, isVoice = false) => {
    if (!text.trim()) return;
    const userMsg = { role: "user", content: text };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setLastInputWasVoice(isVoice);
    setInputType("text"); // Reset input type after sending

    try {
      const res = await api.post("/chat", {
        userId,
        message: text,
        channel: "web"
      });

      const { reply, type, actionResult, ui } = res.data;

      if (ui && ui.inputType) {
        setInputType(ui.inputType);
      }

      let finalReply = reply;
      let messageMetadata = {};

      if (type === "ACTION" && actionResult) {
        finalReply = actionResult.message;

        // Pass PDF download data to metadata if available
        if (actionResult.isPdfDownload) {
          messageMetadata = {
            isPdfDownload: true,
            pdfEndpoint: actionResult.endpoint,
            pdfParams: actionResult.params
          };
        }

        // Pass transaction data to metadata if available
        if (actionResult.isTableView && actionResult.transactions) {
          messageMetadata = {
            isTableView: true,
            transactions: actionResult.transactions
          };
        }

        // Pass EMI data to metadata if available
        if (actionResult.isTableView && actionResult.emiData) {
          messageMetadata = {
            isTableView: true,
            emiData: actionResult.emiData
          };
        }
      }

      const botMsg = { role: "assistant", content: finalReply, ...messageMetadata };
      setMessages((prev) => [...prev, botMsg]);

      // Auto-speak if input was voice
      if (isVoice) {
        speakResponse(finalReply);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input, false);
  };

  const handleVoiceInput = (spokenText) => {
    sendMessage(spokenText, true);
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear all chat messages? This cannot be undone.")) {
      const initialMessage = [
        { role: "assistant", content: "Hi! I'm your credit card assistant. How can I help you today?" }
      ];
      setMessages(initialMessage);
      localStorage.setItem(`chatMessages_${userId}`, JSON.stringify(initialMessage));
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header-controls">
        {isSpeaking && (
          <div className="voice-playback-controls">
            {!isPaused ? (
              <button onClick={handlePause} title="Pause" className="control-btn">⏸️</button>
            ) : (
              <button onClick={handleResume} title="Resume" className="control-btn">▶️</button>
            )}
            <button onClick={handleStop} title="Stop" className="control-btn">⏹️</button>
          </div>
        )}
        <button
          onClick={clearChat}
          className="clear-chat-btn"
          title="Clear chat history"
        >
          🗑️ Clear
        </button>
        <button
          onClick={toggleMute}
          className={`mute-btn ${isMuted ? 'muted' : ''}`}
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isMuted ? "🔇" : "🔊"}
        </button>
      </div>

      <div className="messages-area">
        {messages.map((m, idx) => (
          <div key={idx} className="flex flex-col">
            <MessageBubble
              role={m.role}
              content={m.content}
              metadata={{
                isTableView: m.isTableView,
                transactions: m.transactions,
                emiData: m.emiData,
                isPdfDownload: m.isPdfDownload,
                pdfEndpoint: m.pdfEndpoint,
                pdfParams: m.pdfParams
              }}
            />
            {m.role === "assistant" && (
              <button
                onClick={() => speakResponse(m.content)}
                className="read-aloud-btn"
                title="Read Aloud"
              >
                🔊
              </button>
            )}
          </div>
        ))}
        {loading && (
          <p className="typing-indicator">Assistant is typing...</p>
        )}
      </div>

      <div className="voice-controls">
        <VoiceControls onTranscript={handleVoiceInput} />
      </div>

      <form onSubmit={handleSubmit} className="input-area">
        <input
          type={inputType}
          className="chat-input"
          placeholder={inputType === "password" ? "Enter your PIN/Password..." : "Ask about onboarding, card delivery, EMI, bill, payments..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
