"use client";

import { useState } from "react";
import { BookTemplate, Search, Copy, Check, ExternalLink, Tag } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { elitePrompts, PROMPT_CATEGORIES, AIPrompt } from "@/data/prompts";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function PromptsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredPrompts = elitePrompts.filter((prompt) => {
    const matchesSearch = 
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All" || prompt.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (promptText: string, id: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    toast.success("Prompt copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUseInChat = (promptText: string) => {
    // Save to local storage so chat page can read it on load
    localStorage.setItem("devflow_pending_prompt", promptText);
    router.push("/dashboard/chat");
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <BookTemplate className="w-8 h-8 text-pink-500" />
          Elite Prompt Library
        </h2>
        <p className="text-muted-foreground text-lg mt-2">
          Curated collection of high-performance system prompts for developers.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input 
            placeholder="Search prompts by keyword or tag..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-pink-500/50"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {PROMPT_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                selectedCategory === category 
                  ? "bg-pink-500/20 text-pink-300 border border-pink-500/30" 
                  : "bg-white/5 text-white/60 border border-white/5 hover:bg-white/10"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Grid */}
      {filteredPrompts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-3xl border border-white/5 bg-black/20">
          <BookTemplate className="w-16 h-16 text-white/10 mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No prompts found</h3>
          <p className="text-white/50">Try adjusting your search query or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map((prompt) => (
            <div key={prompt.id} className="glass-card rounded-2xl border border-white/10 bg-black/30 p-6 flex flex-col hover:border-pink-500/30 transition-all group relative overflow-hidden">
              
              <div className="flex justify-between items-start mb-4">
                <Badge variant="outline" className="bg-white/5 border-white/10 text-pink-300 font-medium">
                  {prompt.category}
                </Badge>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleCopy(prompt.promptText, prompt.id)}
                    className="p-2 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Copy Prompt"
                  >
                    {copiedId === prompt.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleUseInChat(prompt.promptText)}
                    className="p-2 rounded-md bg-pink-500/20 hover:bg-pink-500/40 text-pink-300 transition-colors"
                    title="Use in AI Chat"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <Link href={`/dashboard/prompts/${prompt.id}`}>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors cursor-pointer">
                  {prompt.title}
                </h3>
              </Link>
              <p className="text-sm text-white/60 mb-4 flex-1">
                {prompt.description}
              </p>

              <div className="bg-black/50 rounded-lg p-3 mb-4 border border-white/5 relative h-24 overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                <p className="text-xs text-white/70 font-mono leading-relaxed">
                  {prompt.promptText.substring(0, 150)}...
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-white/10">
                <div className="flex flex-wrap gap-2">
                  {prompt.tags.map(tag => (
                    <span key={tag} className="flex items-center text-[11px] text-white/40 bg-white/5 px-2 py-1 rounded-md">
                      <Tag className="w-3 h-3 mr-1 opacity-50" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
