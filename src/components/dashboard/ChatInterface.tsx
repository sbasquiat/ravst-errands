"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface ChatMessage {
  id: string;
  sender: "customer" | "runner" | "system";
  text: string;
  time: string;
}

interface Props {
  runnerName: string;
  runnerInitials: string;
  messages: ChatMessage[];
}

export default function ChatInterface({ runnerName, runnerInitials, messages: initialMessages }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isExpanded]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "customer",
      text: input.trim(),
      time: "now",
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    // Mock runner reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-reply`,
          sender: "runner",
          text: "Got it, thanks! I'll keep you updated.",
          time: "now",
        },
      ]);
    }, 1500);
  };

  return (
    <div className="rounded-2xl border border-[var(--color-border-light)] bg-white overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-5 py-3 border-b border-[var(--color-border-light)] hover:bg-[var(--color-cream)]/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-copper)]/10 text-xs font-bold text-[var(--color-copper)]">
            {runnerInitials}
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-[var(--color-charcoal)]">Chat with {runnerName}</h3>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-text-light)"
          strokeWidth="1.5"
          className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Chat body */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          transition={{ duration: 0.2 }}
        >
          <div
            ref={scrollRef}
            className="h-64 overflow-y-auto px-4 py-3 space-y-3"
          >
            {messages.map((msg) => {
              if (msg.sender === "system") {
                return (
                  <div key={msg.id} className="text-center">
                    <span className="inline-block rounded-full bg-[var(--color-cream)] px-3 py-1 text-[11px] text-[var(--color-text-light)]">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              const isCustomer = msg.sender === "customer";
              return (
                <div key={msg.id} className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}>
                  <div className={`flex items-end gap-2 max-w-[80%] ${isCustomer ? "flex-row-reverse" : ""}`}>
                    {!isCustomer && (
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-copper)]/10 text-[8px] font-bold text-[var(--color-copper)]">
                        {runnerInitials}
                      </div>
                    )}
                    <div>
                      <div
                        className={`rounded-2xl px-3.5 py-2 text-sm ${
                          isCustomer
                            ? "bg-[var(--color-charcoal)] text-white rounded-br-md"
                            : "bg-[var(--color-cream)] text-[var(--color-text)] rounded-bl-md"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <p className={`mt-0.5 text-[10px] text-[var(--color-text-light)] ${isCustomer ? "text-right" : ""}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div className="border-t border-[var(--color-border-light)] px-4 py-3">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-text-light)] outline-none focus:ring-2 focus:ring-[var(--color-copper)]/20 focus:border-[var(--color-copper)]"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--color-charcoal)] text-white transition-all hover:bg-[var(--color-charcoal)]/90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
}
