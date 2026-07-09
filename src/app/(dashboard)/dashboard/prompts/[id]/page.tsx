"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, Check, ExternalLink, Tag, Bookmark } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { elitePrompts, AIPrompt } from "@/data/prompts";
import { Badge } from "@/components/ui/badge";

export default function PromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [prompt, setPrompt] = useState<AIPrompt | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const found = elitePrompts.find(p => p.id === params.id);
    if (found) {
      setTimeout(() => setPrompt(found), 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (!prompt) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold text-white mb-4">Prompt not found</h2>
        <Link href="/dashboard/prompts" className="text-pink-400 hover:underline">
          &larr; Back to Library
        </Link>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.promptText);
    setIsCopied(true);
    toast.success("Prompt copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleUseInChat = () => {
    localStorage.setItem("devflow_pending_prompt", prompt.promptText);
    router.push("/dashboard/chat");
  };

  const toggleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Removed from saved" : "Prompt saved to favorites");
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-[calc(100vh-80px)]">
      <div className="mb-6">
        <Link 
          href="/dashboard/prompts" 
          className="inline-flex items-center text-sm text-white/50 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Library
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <Badge variant="outline" className="bg-pink-500/10 border-pink-500/30 text-pink-400 font-medium mb-3">
              {prompt.category}
            </Badge>
            <h1 className="text-4xl font-bold text-white tracking-tight">{prompt.title}</h1>
            <p className="text-muted-foreground text-lg mt-3">{prompt.description}</p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleSave}
              className={`p-3 rounded-xl border transition-all ${
                isSaved 
                  ? "bg-pink-500/20 border-pink-500/50 text-pink-400" 
                  : "bg-white/5 border-white/10 text-white hover:bg-white/10"
              }`}
              title="Save Prompt"
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all font-medium"
            >
              {isCopied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
              {isCopied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={handleUseInChat}
              className="flex items-center gap-2 px-4 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all font-medium"
            >
              <ExternalLink className="w-5 h-5" />
              Use in AI Chat
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl border border-white/10 bg-black/40 p-6 relative">
            <div className="absolute top-0 right-8 px-3 py-1 bg-white/10 border-x border-b border-white/10 rounded-b-lg text-[10px] font-mono text-white/50 tracking-widest uppercase">
              System Prompt
            </div>
            <pre className="text-white/80 font-mono text-sm leading-relaxed whitespace-pre-wrap mt-4">
              {prompt.promptText}
            </pre>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-2xl border border-white/10 bg-black/20 p-6">
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Use Case</h3>
            <p className="text-white/90 text-sm leading-relaxed">
              {prompt.useCase}
            </p>
          </div>

          <div className="glass-card rounded-2xl border border-white/10 bg-black/20 p-6">
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {prompt.tags.map(tag => (
                <span key={tag} className="flex items-center text-xs text-white/70 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                  <Tag className="w-3 h-3 mr-1.5 opacity-50 text-pink-400" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
