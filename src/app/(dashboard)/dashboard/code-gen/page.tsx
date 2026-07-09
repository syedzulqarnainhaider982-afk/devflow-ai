/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import { Code2, Terminal, Copy, Search, Trash2, Loader2, RefreshCw, Plus, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import type { CodeGeneration } from "@/types/code-gen";

import { useMemo } from "react";
import dynamic from 'next/dynamic';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const SyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter').then(mod => mod.Prism),
  { ssr: false, loading: () => <div className="h-full flex items-center justify-center text-white/40">Loading code editor...</div> }
);
import { useGeneratorStore } from "@/store/generator-store";

export default function CodeGenPage() {
  const {
    codeGenPrompt: prompt,
    codeGenLanguage: language,
    codeGenActiveItem: activeItem,
    codeGenGeneratedCode: generatedCode,
    setCodeGenState
  } = useGeneratorStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<CodeGeneration[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isLinking, setIsLinking] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const supabase = createClient();

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch("/api/code-gen/history");
      const data = await res.json();
      if (res.ok && data.success) {
        setHistory(data.history || []);
        if (data.history?.length > 0 && !activeItem) {
          setCodeGenState({
            codeGenActiveItem: data.history[0],
            codeGenPrompt: data.history[0].prompt,
            codeGenGeneratedCode: data.history[0].generated_code,
            codeGenLanguage: data.history[0].language
          });
        }
      }
    } catch (e) {
      console.error("Failed to fetch history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (res.ok && data.success) {
        setProjects(data.projects || []);
        if (data.projects?.length > 0) {
          setSelectedProjectId(data.projects[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to fetch projects");
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchHistory();
    fetchProjects();
  }, []);

  const handleNewGeneration = () => {
    setCodeGenState({
      codeGenActiveItem: null,
      codeGenPrompt: "",
      codeGenGeneratedCode: "",
      codeGenLanguage: ""
    });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt first.");
      return;
    }

    setIsGenerating(true);
    setCodeGenState({ codeGenGeneratedCode: "" });

    try {
      const response = await fetch("/api/code-gen/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate code");
      }

      setCodeGenState({
        codeGenGeneratedCode: data.generation.generated_code,
        codeGenLanguage: data.generation.language,
        codeGenActiveItem: data.generation
      });
      
      // Update history
      setHistory((prev) => [data.generation, ...prev]);
      toast.success(`Successfully generated ${data.generation.language} code!`);
    } catch (err: any) {
      console.error("Generation error:", err);
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (codeToCopy: string) => {
    if (!codeToCopy) return;
    navigator.clipboard.writeText(codeToCopy);
    toast.success("Code copied to clipboard!");
  };

  const confirmDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete(id);
  };

  const executeDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/code-gen/history/${id}`, { method: "DELETE" });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
        toast.success("Deleted successfully");
        if (activeItem?.id === id) {
          setCodeGenState({ codeGenActiveItem: null, codeGenGeneratedCode: "" });
        }
      } else {
        toast.error("Failed to delete item");
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

  const selectHistoryItem = (item: CodeGeneration) => {
    setCodeGenState({
      codeGenActiveItem: item,
      codeGenPrompt: item.prompt,
      codeGenGeneratedCode: item.generated_code,
      codeGenLanguage: item.language
    });
  };

  const handleLinkToProject = async () => {
    if (!activeItem || !selectedProjectId) {
      toast.error("Please select a project and ensure you have generated code.");
      return;
    }
    
    setIsLinking(true);
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_type: "code",
          asset_id: activeItem.id,
          title: activeItem.prompt.substring(0, 50) || "Code Snippet",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Linked to project successfully!");
      } else {
        toast.error(data.error || "Failed to link to project");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsLinking(false);
    }
  };

  const filteredHistory = useMemo(() => {
    return history.filter(item => 
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.language.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [history, searchQuery]);

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Code2 className="w-8 h-8 text-green-500" />
          AI Code Generator
        </h2>
        <p className="text-muted-foreground text-lg mt-2">
          Turn natural language into production-ready code snippets instantly.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Sidebar (History & New) */}
        <div className="lg:col-span-3 flex flex-col gap-4 min-h-0 overflow-hidden">
          <Button 
            onClick={handleNewGeneration}
            className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 h-12 rounded-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Generation
          </Button>

          <div className="glass-card rounded-2xl border border-white/10 p-4 flex flex-col flex-1 min-h-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-white flex items-center gap-2">
                <History className="w-4 h-4" /> History
              </h3>
              <Button variant="ghost" size="sm" onClick={fetchHistory} disabled={isLoadingHistory}>
                <RefreshCw className={`w-4 h-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-white/40" />
              <input 
                type="text"
                placeholder="Search snippets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-green-500/50"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {isLoadingHistory ? (
                <div className="text-center text-white/40 py-4">Loading history...</div>
              ) : filteredHistory.length === 0 ? (
                <div className="text-center text-white/40 py-4">No history found.</div>
              ) : (
                filteredHistory.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => selectHistoryItem(item)}
                    className={`p-3 bg-white/5 hover:bg-white/10 border ${activeItem?.id === item.id ? 'border-green-500/50 bg-green-500/10' : 'border-white/5'} rounded-xl cursor-pointer transition group`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-green-500/20 text-green-400 rounded">
                        {item.language}
                      </span>
                      {itemToDelete === item.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-400">Delete?</span>
                          <button onClick={(e) => executeDelete(item.id, e)} className="text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded hover:bg-red-500/30">Yes</button>
                          <button onClick={cancelDelete} className="text-xs bg-white/10 text-white px-2 py-0.5 rounded hover:bg-white/20">No</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-white/40 hover:text-green-400"
                            onClick={(e) => { e.stopPropagation(); selectHistoryItem(item); }}
                            title="Open/Restore"
                          >
                            <Terminal className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-white/40 hover:text-red-400"
                            onClick={(e) => confirmDelete(item.id, e)}
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-white/80 line-clamp-2 leading-tight">
                      {item.prompt}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Input & Code Output */}
        <div className="lg:col-span-9 flex flex-col gap-6 min-h-0">
          
          {/* Input Panel */}
          <div className="glass-card rounded-2xl border border-white/10 p-4 shrink-0 flex flex-col shadow-lg">
            <label className="text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-green-400" /> Prompt Instructions
            </label>
            <textarea 
              value={prompt}
              onChange={(e) => setCodeGenState({ codeGenPrompt: e.target.value })}
              className="w-full h-24 bg-black/40 border border-white/5 rounded-xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-green-500/50 resize-none font-mono text-sm mb-3"
              placeholder="// Write a complex React component with Tailwind..."
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Code2 className="w-5 h-5 mr-2" />}
                {isGenerating ? "Generating..." : "Generate Code"}
              </Button>
            </div>
          </div>

          {/* Code Output Panel */}
          <div className="glass-card rounded-2xl border border-white/10 flex flex-col flex-1 relative overflow-hidden shadow-lg">
            <div className="flex justify-between items-center p-4 border-b border-white/5 bg-black/40">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-white/80">Generated Output</label>
                {language && (
                  <span className="text-xs font-mono px-2 py-1 bg-white/10 text-white/60 rounded">
                    {language}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {projects.length > 0 && activeItem && (
                  <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="bg-black/40 text-xs text-white/80 border border-white/10 rounded px-2 py-1.5 focus:outline-none"
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20"
                      onClick={handleLinkToProject}
                      disabled={isLinking}
                    >
                      {isLinking ? "Saving..." : "Save to Project"}
                    </Button>
                  </div>
                )}

                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-muted-foreground hover:text-white" 
                  onClick={() => handleCopy(generatedCode)}
                  disabled={!generatedCode}
                >
                  <Copy className="w-4 h-4 mr-2" /> Copy
                </Button>
              </div>
            </div>
            <div className="flex-1 bg-[#1e1e1e] overflow-auto">
              {generatedCode ? (
                <SyntaxHighlighter
                  language={language === 'tsx' ? 'typescript' : language}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: '1.5rem',
                    background: 'transparent',
                    fontSize: '0.875rem',
                  }}
                  wrapLines={true}
                >
                  {generatedCode}
                </SyntaxHighlighter>
              ) : (
                <div className="h-full flex items-center justify-center text-white/20 font-mono text-sm">
                  // Your generated code will appear here
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
