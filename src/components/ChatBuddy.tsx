import React, { useState, useRef, useEffect } from "react";
import { Send, Leaf, Sparkles, Check, AlertCircle, RefreshCw } from "lucide-react";
import { ChatMessage } from "../types";

interface ChatBuddyProps {
  onAddMessageToLog?: (messageText: string) => void;
}

export default function ChatBuddy({ onAddMessageToLog }: ChatBuddyProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: "Hi there! I'm EcoBuddy, your green friend! 🌿 I can help you track and reduce your daily pollution (CO2). Tell me about your day, or ask for simple green tips!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue("");
    setError(null);

    const userMessage: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          chatHistory: messages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "EcoBuddy is having some trouble connecting. Please try again!");
      }

      const data = await response.json();
      const buddyMessage: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        text: data.text || "Done! Let me know if you want to ask anything else. 😊",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, buddyMessage]);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "model",
          text: "Oh! My connection failed. Please try again. 🌳",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <div className="flex flex-col h-[580px] bg-[#1B2119] rounded-3xl border border-[#2C342B] shadow-sm overflow-hidden" id="chat-buddy-container">
      {/* Header */}
      <div className="bg-slate-900 px-6 py-4 border-b border-[#2C342B] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-none">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white flex items-center gap-1.5 text-base">
              Chat with EcoBuddy
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            </h3>
            <p className="text-xs text-emerald-400 font-medium">Your Green Friend</p>
          </div>
        </div>
        <div className="bg-emerald-950/50 text-emerald-400 border border-emerald-800/60 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
          Active
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#121714]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-emerald-600 text-white rounded-tr-none shadow-none"
                  : "bg-[#1B2119] text-[#E8F0E3] border border-[#2C342B] rounded-tl-none shadow-none"
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>
              <div
                className={`text-[10px] mt-1 text-right ${
                  msg.role === "user" ? "text-emerald-100" : "text-emerald-550"
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#1B2119] border border-[#2C342B] rounded-2xl rounded-tl-none px-4 py-3 shadow-none max-w-[80%]">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-emerald-400 font-medium">EcoBuddy is typing...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-900/60 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts */}
      <div className="px-6 py-2.5 bg-[#121714] border-t border-[#2C342B] flex gap-2 overflow-x-auto whitespace-nowrap no-scrollbar scroll-smooth">
        <button
          onClick={() => handleQuickQuestion("How is pollution calculated?")}
          className="text-xs bg-[#1B2119] text-emerald-400 hover:text-emerald-300 border border-[#2C342B] hover:bg-[#222d20] px-3 py-1.5 rounded-full font-medium transition cursor-pointer"
        >
          💡 Pollution Math
        </button>
        <button
          onClick={() => handleQuickQuestion("How to save home light bills?")}
          className="text-xs bg-[#1B2119] text-emerald-400 hover:text-emerald-300 border border-[#2C342B] hover:bg-[#222d20] px-3 py-1.5 rounded-full font-medium transition cursor-pointer"
        >
          ⚡ Save Light Bills
        </button>
        <button
          onClick={() => handleQuickQuestion("Why vegetarian food helps?")}
          className="text-xs bg-[#1B2119] text-emerald-400 hover:text-emerald-300 border border-[#2C342B] hover:bg-[#222d20] px-3 py-1.5 rounded-full font-medium transition cursor-pointer"
        >
          🍔 Diet & Food
        </button>
      </div>

      {/* Input panel */}
      <form onSubmit={handleSend} className="p-4 bg-[#1B2119] border-t border-[#2C342B] flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask EcoBuddy anything..."
          className="flex-1 bg-[#121714] text-[#E8F0E3] placeholder-emerald-800/80 border border-[#2C342B] focus:ring-2 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm outline-none transition"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 flex items-center justify-center text-white font-medium shrink-0 shadow-none transition cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
