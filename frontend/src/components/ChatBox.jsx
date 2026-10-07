import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";

function ChatBox() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("query");

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    {
      sender: "AI",
      text: "Greetings. I am Medical AI Sushruta, your clinical educational assistant powered by advanced biomedical models.\n\nI can help you understand symptoms, translate complex lab results, and prepare questions for your physician.\n\nHow can I assist your health inquiry today?",
      time: "Just now",
      isDisclaimer: true,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const symptomPresets = [
    "Headache with light sensitivity & nausea",
    "Interpret high ferritin & iron saturation",
    "Persistent dry cough vs allergic bronchitis",
    "Sharp lower abdominal pain after meals",
  ];

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, loading]);

  // Handle URL query parameter prefill
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  const handleSendMessage = async (userPrompt) => {
    const textToSend = userPrompt || message;
    if (!textToSend.trim() || loading) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChat((prev) => [
      ...prev,
      { sender: "User", text: textToSend, time: timestamp },
    ]);

    if (!userPrompt) {
      setMessage("");
    }
    setLoading(true);

    try {
      const response = await API.post("/chat/", {
        message: textToSend,
      });

      const aiText = response.data.response || "No response received.";

      setChat((prev) => [
        ...prev,
        {
          sender: "AI",
          text: aiText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (error) {
      console.error("Clinical API Error:", error);
      setChat((prev) => [
        ...prev,
        {
          sender: "AI",
          text: "System communication advisory: Unable to reach the clinical AI inference engine. Please confirm backend connectivity at http://localhost:8000.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setChat([
      {
        sender: "AI",
        text: "New clinical consultation session initiated. Ask any healthcare, symptom, or lab report question.",
        time: "Just now",
      },
    ]);
  };

  return (
    <div className="chatbox-console glass-panel">
      {/* Console Top Header */}
      <div className="chatbox-header">
        <div className="chatbox-header-title">
          <div className="avatar-ai-glow">
            <span className="pulse-beacon-green" />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 2v20M2 12h20" stroke="#0066ff" />
              <circle cx="12" cy="12" r="8" stroke="#00e599" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <div className="console-name">SUSHRUTA CLINICAL COPILOT</div>
            <div className="console-meta font-mono">MODEL: GEMINI-2.5-FLASH • TEMP: 0.2</div>
          </div>
        </div>

        <div className="chatbox-header-controls">
          <button onClick={handleClearChat} className="btn-glass chat-reset-btn" title="Reset Session">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="chat-chips-bar">
        <span className="chips-hint">Suggested Inquiries:</span>
        <div className="chips-scroll">
          {symptomPresets.map((preset, index) => (
            <button
              key={index}
              onClick={() => handleSendMessage(preset)}
              disabled={loading}
              className="chat-preset-chip"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Message History Feed */}
      <div className="chat-stream-window">
        {chat.map((msg, index) => {
          const isAI = msg.sender === "AI";
          return (
            <div
              key={index}
              className={`message-row ${isAI ? "row-ai" : "row-user"}`}
            >
              {isAI && (
                <div className="ai-avatar-badge">
                  <span>AI</span>
                </div>
              )}

              <div className={`message-bubble ${isAI ? "bubble-ai glass-card-elevated" : "bubble-user"}`}>
                <div className="bubble-header font-mono">
                  <span className="bubble-author">{isAI ? "Sushruta Assistant" : "You (Patient Inquiry)"}</span>
                  <span className="bubble-time">{msg.time}</span>
                </div>

                <div className="bubble-content">
                  {msg.text.split("\n\n").map((paragraph, pIdx) => (
                    <p key={pIdx} className="bubble-paragraph">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {isAI && (
                  <div className="bubble-disclaimer-tag">
                    <span className="pulse-beacon-red" style={{ width: 6, height: 6 }} />
                    <span>Educational triage only • Not a medical prescription</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="message-row row-ai">
            <div className="ai-avatar-badge">
              <span>AI</span>
            </div>
            <div className="message-bubble bubble-ai glass-card-elevated">
              <div className="loading-pulse-stream">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="loading-caption font-mono">Synthesizing clinical knowledge...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="chat-input-toolbar"
      >
        <div className="chat-input-wrapper">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your medical query or symptoms (e.g. sharp lower back pain)..."
            className="chat-text-input"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={!message.trim() || loading}
          className="btn-neon-cta chat-send-btn"
        >
          <span>Send</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>

      <style>{`
        .chatbox-console {
          display: flex;
          flex-direction: column;
          height: 680px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(0, 102, 255, 0.2);
          box-shadow: 0 20px 50px -10px rgba(0, 102, 255, 0.12);
          overflow: hidden;
        }

        .chatbox-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: rgba(255, 255, 255, 0.9);
          border-bottom: 1px solid var(--border-subtle);
        }

        .chatbox-header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar-ai-glow {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: rgba(0, 102, 255, 0.08);
          border: 1px solid rgba(0, 102, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .avatar-ai-glow .pulse-beacon-green {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
        }

        .console-name {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .console-meta {
          font-size: 0.68rem;
          color: var(--neon-blue);
          font-weight: 600;
        }

        .chat-reset-btn {
          padding: 7px 14px;
          font-size: 0.8rem;
          border-radius: 8px;
        }

        .chat-chips-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 24px;
          background: rgba(248, 250, 252, 0.8);
          border-bottom: 1px solid var(--border-subtle);
          overflow-x: auto;
        }

        .chips-hint {
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--text-muted);
          white-space: nowrap;
          text-transform: uppercase;
        }

        .chips-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .chat-preset-chip {
          background: #ffffff;
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          font-size: 0.78rem;
          padding: 5px 12px;
          border-radius: 9999px;
          white-space: nowrap;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .chat-preset-chip:hover {
          border-color: var(--neon-cyan);
          color: var(--neon-blue);
          background: rgba(240, 249, 255, 0.6);
        }

        /* Message Stream */
        .chat-stream-window {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: radial-gradient(circle at 50% 10%, rgba(0, 102, 255, 0.02) 0%, transparent 60%);
        }

        .message-row {
          display: flex;
          gap: 12px;
          max-width: 85%;
        }

        .row-ai {
          align-self: flex-start;
        }

        .row-user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .ai-avatar-badge {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: var(--grad-neon-cta);
          color: #ffffff;
          font-weight: 800;
          font-size: 0.72rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 102, 255, 0.25);
        }

        .message-bubble {
          padding: 16px 20px;
          border-radius: 18px;
          font-size: 0.94rem;
          line-height: 1.6;
        }

        .bubble-ai {
          background: #ffffff;
          border: 1px solid rgba(226, 232, 240, 0.9);
          color: var(--text-primary);
          border-top-left-radius: 4px;
        }

        .bubble-user {
          background: linear-gradient(135deg, #0066ff 0%, #0099ff 100%);
          color: #ffffff;
          border-top-right-radius: 4px;
          box-shadow: 0 8px 24px rgba(0, 102, 255, 0.25);
        }

        .bubble-header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 8px;
          font-size: 0.72rem;
          opacity: 0.8;
        }

        .bubble-user .bubble-header {
          color: rgba(255, 255, 255, 0.85);
        }

        .bubble-ai .bubble-header {
          color: var(--text-muted);
        }

        .bubble-paragraph {
          margin-bottom: 8px;
        }

        .bubble-paragraph:last-child {
          margin-bottom: 0;
        }

        .bubble-disclaimer-tag {
          margin-top: 12px;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 42, 95, 0.15);
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.74rem;
          font-weight: 600;
          color: #dc2626;
        }

        /* Loading Stream */
        .loading-pulse-stream {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 0;
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--neon-blue);
          animation: typingBounce 1.4s infinite ease-in-out both;
        }

        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typingBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1.1); opacity: 1; }
        }

        .loading-caption {
          margin-left: 10px;
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        /* Input Toolbar */
        .chat-input-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.95);
          border-top: 1px solid var(--border-subtle);
        }

        .chat-input-wrapper {
          flex: 1;
        }

        .chat-text-input {
          width: 100%;
          border: 1px solid var(--border-subtle);
          border-radius: 9999px;
          padding: 14px 22px;
          font-size: 0.94rem;
          font-family: inherit;
          color: var(--text-primary);
          outline: none;
          background: #f8fafc;
          transition: var(--transition-smooth);
        }

        .chat-text-input:focus {
          border-color: var(--neon-cyan);
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.12);
        }

        .chat-send-btn {
          padding: 12px 24px;
          font-size: 0.92rem;
          border-radius: 9999px;
          flex-shrink: 0;
        }

        .chat-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        @media (max-width: 768px) {
          .message-row {
            max-width: 95%;
          }
          .chatbox-console {
            height: calc(100vh - 170px);
          }
        }
      `}</style>
    </div>
  );
}

export default ChatBox;