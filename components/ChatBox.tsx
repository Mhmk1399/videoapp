"use client";
import React, { useState } from "react";

interface ChatBoxProps {
  onSubmitPrompt: (prompt: string, videoId: string) => void;
  videoId: string | null;
}

const ChatBox: React.FC<ChatBoxProps> = ({ onSubmitPrompt, videoId }) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt && videoId) {
      onSubmitPrompt(prompt, videoId);
      setPrompt("");
    }
  };

  return (
    <div className="chat-box">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'cut at 5s' or 'add subtitle "
          disabled={!videoId}
          className="prompt-input"
        />
        <button type="submit" disabled={!videoId} className="submit-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;