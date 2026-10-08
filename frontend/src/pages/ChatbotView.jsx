import React, { useState, useRef, useEffect } from "react";
import API from "../services/api";

const QUICK_PROMPTS = [
  "What causes elevated creatinine levels?",
  "Explain CBC test results",
  "What are symptoms of diabetes?",
  "How to interpret lipid panel?",
  "When is chest pain an emergency?",
  "What does high blood pressure mean?",
];

export default function ChatbotView() {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Welcome to Medical AI Sushruta — your intelligent health education engine.\n\nI can help you understand medical test results, symptoms, and health concepts. Ask me about blood tests, vital signs, common conditions, or biomarker interpretations.\n\n⚕ All responses are for educational purposes only.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    setMessages((prev) => [...prev, { sender: "user", text: msg }]);
    setInput("");
    setIsTyping(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "48px";
    }

    try {
      const res = await API.post("/api/chat", { message: msg });
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: res.data.response,
          keywords: res.data.matchedKeywords,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "⚠ Connection error. Ensure the backend server is running on port 8000.\n\nDisclaimer: Medical AI Sushruta provides educational healthcare guidance only.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = "48px";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const formatAiText = (text) => {
    // Split disclaimer
    const disclaimerIdx = text.indexOf("Disclaimer:");
    let mainText = text;
    let disclaimer = null;

    if (disclaimerIdx > -1) {
      mainText = text.substring(0, disclaimerIdx).trim();
      disclaimer = text.substring(disclaimerIdx).trim();
    }

    // Helper to format bold markdown and inline elements
    const renderFormattedLine = (str) => {
      const parts = str.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, idx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={idx} style={{ color: "var(--neon-cyan)", fontWeight: 700 }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });
    };

    // Process line by line
    const lines = mainText.split("\n").map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} style={{ height: 8 }} />;

      if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
        return (
          <div key={i} style={{ paddingLeft: 16, marginBottom: 4, display: "flex", gap: 8 }}>
            <span style={{ color: "var(--neon-cyan)", flexShrink: 0 }}>•</span>
            <span>{renderFormattedLine(trimmed.replace(/^[•\-\*]\s*/, ""))}</span>
          </div>
        );
      }

      if (/^\d+\.\s/.test(trimmed)) {
        const numMatch = trimmed.match(/^(\d+\.)\s*(.*)/);
        return (
          <div key={i} style={{ paddingLeft: 8, marginTop: 8, marginBottom: 4, fontWeight: 600 }}>
            <span style={{ color: "var(--neon-purple)", marginRight: 6 }}>{numMatch[1]}</span>
            <span>{renderFormattedLine(numMatch[2])}</span>
          </div>
        );
      }

      return (
        <div key={i} style={{ marginBottom: 4, lineHeight: 1.65 }}>
          {renderFormattedLine(line)}
        </div>
      );
    });

    return (
      <>
        {lines}
        {disclaimer && <div className="disclaimer">{disclaimer}</div>}
      </>
    );
  };

  return (
    <div className="chat-container">
      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.sender}`}>
            {msg.sender === "ai" && (
              <span className="bubble-label">⚕ Sushruta AI</span>
            )}
            {msg.sender === "ai" ? formatAiText(msg.text) : msg.text}
            {msg.keywords && msg.keywords.length > 0 && (
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                }}
              >
                {msg.keywords.map((kw, i) => (
                  <span key={i} className="status-badge optimal">
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="symptom-chips" style={{ padding: "0 0 12px" }}>
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              className="symptom-chip"
              onClick={() => sendMessage(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="chat-input-area">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleTextareaInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask about symptoms, test results, or health concepts..."
          rows={1}
        />
        <button
          className="btn-cyber btn-send"
          onClick={() => sendMessage()}
          disabled={!input.trim() || isTyping}
        >
          <span>▶</span>
        </button>
      </div>
    </div>
  );
}
