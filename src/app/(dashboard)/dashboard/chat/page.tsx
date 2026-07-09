/* eslint-disable */
"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { MessageSquare, Send, Bot, User, Loader2, Square, ArrowDown, Trash2 } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SUPPORTED_AI_MODELS, getDefaultModelId } from "@/config/models";

export default function AIChatPage() {
  const [selectedModel, setSelectedModel] = useState(getDefaultModelId());
  const [rateLimitTimer, setRateLimitTimer] = useState<number | null>(null);
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const supabase = createClient();

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const res = await fetch("/api/chat/sessions");
      const data = await res.json();
      if (res.ok && data.success) {
        setSessions(data.sessions || []);
      }
    } catch (e) {
      console.error("Failed to fetch sessions", e);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchSessions();
  }, []);

  

  const loadSessionMessages = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}/messages`);
      const data = await res.json();
      if (res.ok && data.success) {
        // Map DB messages to UI messages
        const uiMessages = data.messages.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        }));
        setMessages(uiMessages);
      }
    } catch (e) {
      console.error("Failed to load messages", e);
    }
  };

  const { messages, setMessages, sendMessage, status, stop, error } = useChat({
    // @ts-expect-error - 'api' option is missing from types in ai@7+ but required at runtime
    api: "/api/chat",
    body: { modelId: selectedModel },
    onError: (err) => {
      let errorMessage = err.message || "An error occurred with the AI provider.";
      if (errorMessage.includes("exceeded your current quota") || errorMessage.includes("429")) {
        setRateLimitTimer(60); 
        toast.error("Rate limit reached. Please wait a moment.");
      } else {
        if (errorMessage.includes("Failed after 3 attempts")) {
          errorMessage = "The AI provider is currently busy or unavailable. Please try again.";
        }
        toast.error(errorMessage, { duration: 5000 });
      }
    },
    onFinish: async (event) => {
      // Save AI's response to DB
      if (activeSessionId) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const content = (event.message as any).content || (Array.isArray(event.message.parts) ? event.message.parts.map((p: any) => p.text).join('') : "");
          await fetch(`/api/chat/sessions/${activeSessionId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: "assistant", content }),
          });
        } catch (e) {
          console.error("Failed to save AI message to DB", e);
        }
      }
    }
  });

  const [input, setInput] = useState("");

  useEffect(() => {
    const pendingPrompt = localStorage.getItem("devflow_pending_prompt");
    if (pendingPrompt) {
      // Defer state update to avoid cascading renders
      setTimeout(() => setInput(pendingPrompt), 0);
      localStorage.removeItem("devflow_pending_prompt");
    }
  }, []);

  useEffect(() => {
    if (rateLimitTimer === null) return;
    if (rateLimitTimer <= 0) {
      setTimeout(() => setRateLimitTimer(null), 0);
      return;
    }
    const timer = setTimeout(() => setRateLimitTimer(rateLimitTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [rateLimitTimer]);

  const isLoading = (status === 'submitted' || status === 'streaming') && !error;
  const isRateLimited = rateLimitTimer !== null && rateLimitTimer > 0;

  const scrollRef = useRef<HTMLDivElement>(null);
  const isSubmittingRef = useRef(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    if (status !== 'submitted' && status !== 'streaming') {
      isSubmittingRef.current = false;
    }
  }, [status]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isRateLimited || isSubmittingRef.current) return;
    
    isSubmittingRef.current = true;
    const userMessageContent = input.trim();
    setInput("");
    
    let currentSessionId = activeSessionId;

    try {
      // 1. Create session if none exists
      if (!currentSessionId) {
        const title = userMessageContent.substring(0, 40) + (userMessageContent.length > 40 ? "..." : "");
        const res = await fetch("/api/chat/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          currentSessionId = data.session.id;
          setActiveSessionId(currentSessionId);
          setSessions(prev => [data.session, ...prev]);
        }
      }

      // 2. Save user message to DB
      if (currentSessionId) {
        await fetch(`/api/chat/sessions/${currentSessionId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "user", content: userMessageContent }),
        });
      }

      // 3. Trigger AI
      await sendMessage(
        { text: userMessageContent },
        { body: { modelId: selectedModel } }
      );
    } catch (err: any) {
      console.warn("Message sending failed:", err);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 20;
    setIsAtBottom(isBottom);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (isAtBottom || status === 'streaming') {
      scrollToBottom();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, status, isAtBottom]);

  const selectSession = (id: string) => {
    setActiveSessionId(id);
    loadSessionMessages(id);
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
  };

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete(id);
  };

  const executeDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/chat/sessions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== id));
        toast.success("Chat deleted");
        if (activeSessionId === id) {
          handleNewChat();
        }
      } else {
        toast.error("Failed to delete chat");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setItemToDelete(null);
    }
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col space-y-6">
      <div className="mb-2">
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-violet-500" />
          DevFlow AI Chat
        </h2>
        <p className="text-muted-foreground text-lg mt-2">
          Your elite pair-programming assistant powered by Vercel AI SDK.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: History */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 min-h-0 overflow-hidden">
          <Button 
            onClick={handleNewChat}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg shrink-0"
          >
            + New Chat
          </Button>

          <div className="glass-card rounded-2xl border border-white/10 p-4 flex flex-col flex-1 min-h-0">
            <h3 className="font-medium text-white mb-4 flex items-center justify-between">
              History
              <span className="text-xs text-white/50 bg-black/40 px-2 py-1 rounded-full">{sessions.length}</span>
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {isLoadingSessions ? (
                <div className="text-center text-white/40 py-4 flex flex-col items-center">
                  <Loader2 className="w-4 h-4 animate-spin mb-2" />
                  Loading...
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center text-white/40 py-4 text-sm">No chats yet.</div>
              ) : (
                sessions.map((session) => (
                  <div 
                    key={session.id} 
                    onClick={() => selectSession(session.id)}
                    className={`p-3 bg-white/5 hover:bg-white/10 border ${activeSessionId === session.id ? 'border-violet-500/50 bg-violet-500/10' : 'border-white/5'} rounded-xl cursor-pointer transition group flex flex-col gap-2`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium text-white line-clamp-1">{session.title || "New Chat"}</h4>
                      
                      {itemToDelete === session.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={(e) => executeDelete(session.id, e)} className="text-[10px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded hover:bg-red-500/30">Yes</button>
                          <button onClick={cancelDelete} className="text-[10px] bg-white/10 text-white px-1.5 py-0.5 rounded hover:bg-white/20">No</button>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => confirmDelete(session.id, e)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity p-0.5 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Chat Interface */}
        <div className="lg:col-span-9 flex flex-col min-h-0 relative">
          <div className="flex-1 glass-card rounded-t-3xl border border-white/10 flex flex-col bg-black/20 overflow-hidden relative">
            <div 
              className="flex-1 overflow-y-auto p-6 relative custom-scrollbar" 
              ref={scrollRef}
              onScroll={handleScroll}
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 pt-10">
                  <Bot className="w-16 h-16 mb-4 text-violet-500/50" />
                  <p>Send a message to start chatting with DevFlow AI.</p>
                </div>
              ) : (
                <div className="space-y-6 pb-4 min-h-full">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <Avatar className="w-8 h-8 border border-white/10 mt-1 shadow-lg shrink-0">
                        {m.role === 'user' ? (
                          <AvatarFallback className="bg-primary/20 text-primary"><User className="w-4 h-4" /></AvatarFallback>
                        ) : (
                          <AvatarFallback className="bg-violet-500/20 text-violet-400"><Bot className="w-4 h-4" /></AvatarFallback>
                        )}
                      </Avatar>
                      
                      <div className={`glass-card px-5 py-3 rounded-2xl text-sm max-w-[85%] ${
                        m.role === 'user' 
                          ? 'bg-primary/10 border-primary/20 text-white rounded-tr-sm' 
                          : 'bg-white/5 border-white/10 text-white/90 rounded-tl-sm'
                      }`}>
                        {m.role === 'user' ? (
                          <p className="whitespace-pre-wrap">
                            {Array.isArray(m.parts) ? m.parts.map((p: any) => p.type === 'text' ? p.text : '').join('') : ((m as any).content || '')}
                          </p>
                        ) : (
                          <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl max-w-none break-words overflow-x-auto custom-scrollbar">
                            <ReactMarkdown>
                              {Array.isArray(m.parts) ? m.parts.map((p: any) => p.type === 'text' ? p.text : '').join('') : ((m as any).content || '')}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex items-start gap-4">
                      <Avatar className="w-8 h-8 border border-white/10 mt-1 shrink-0">
                        <AvatarFallback className="bg-violet-500/20 text-violet-400"><Bot className="w-4 h-4" /></AvatarFallback>
                      </Avatar>
                      <div className="glass-card px-5 py-4 rounded-2xl rounded-tl-sm bg-white/5 border-white/10">
                        <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Floating Scroll to Bottom Button */}
            {!isAtBottom && (
              <button 
                onClick={scrollToBottom}
                className="absolute bottom-6 right-6 bg-violet-600/80 hover:bg-violet-700 text-white p-3 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.3)] backdrop-blur transition-all z-10"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="glass-card rounded-b-3xl border border-t-0 border-white/10 p-4 bg-black/40 backdrop-blur-xl relative">
            {isRateLimited && (
              <div className="absolute -top-12 left-0 right-0 flex justify-center">
                <div className="bg-red-500/20 border border-red-500/30 text-red-400 text-xs px-4 py-1.5 rounded-full flex items-center shadow-lg backdrop-blur-md animate-pulse">
                  <span>Too many requests. You can chat again in <strong className="font-mono text-sm ml-1">{rateLimitTimer}s</strong></span>
                </div>
              </div>
            )}
            <form onSubmit={onFormSubmit} className="flex gap-2 relative">
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={isLoading || isRateLimited}
                className="h-12 px-4 rounded-md bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/50 appearance-none min-w-[140px] disabled:opacity-50"
              >
                {SUPPORTED_AI_MODELS.map((model) => (
                  <option key={model.id} value={model.id} className="bg-[#050505]">
                    {model.name}
                  </option>
                ))}
              </select>
              <Input 
                value={input}
                onChange={handleInputChange}
                placeholder={isRateLimited ? "Please wait..." : "Ask anything about coding, architecture, or debugging..."}
                className={`flex-1 h-12 bg-white/5 border-white/10 focus-visible:ring-violet-500/50 text-white placeholder:text-white/30 ${isRateLimited ? 'opacity-50' : ''}`}
                disabled={isLoading || isRateLimited}
              />
              {isLoading ? (
                <Button 
                  type="button" 
                  onClick={() => stop()}
                  className="h-12 w-12 shrink-0 bg-red-600 hover:bg-red-700 p-0 shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-colors"
                >
                  <Square className="w-5 h-5 fill-current" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={!input.trim() || isRateLimited} 
                  className={`h-12 w-12 shrink-0 p-0 transition-colors ${
                    isRateLimited 
                      ? 'bg-white/10 text-white/30 cursor-not-allowed' 
                      : 'bg-violet-600 hover:bg-violet-700 shadow-[0_0_15px_rgba(124,58,237,0.3)]'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </Button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
