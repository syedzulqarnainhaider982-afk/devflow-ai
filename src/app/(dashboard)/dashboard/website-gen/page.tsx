/* eslint-disable */
"use client";

import { useState, useEffect, useMemo } from "react";
import { Globe, LayoutTemplate, Sparkles, Download, Copy, Trash2, Eye, Code, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { WebsiteGeneration } from "@/types/website";
import { formatDistanceToNow } from "date-fns";
import { useGeneratorStore } from "@/store/generator-store";

export default function WebsiteGenPage() {
  const {
    websiteGenPrompt: prompt,
    websiteGenBrandName: brandName,
    websiteGenActiveSite: activeSite,
    websiteGenViewMode: viewMode,
    setWebsiteGenState
  } = useGeneratorStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<WebsiteGeneration[]>([]);
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
      const res = await fetch("/api/website-gen/history");
      const data = await res.json();
      if (res.ok && data.success) {
        setHistory(data.history || []);
        if (!activeSite && data.history?.length > 0) {
          setWebsiteGenState({ websiteGenActiveSite: data.history[0] });
        }
      } else {
        toast.error("Failed to load history");
      }
    } catch {
      toast.error("Network error");
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

  

  

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please enter a description");
      return;
    }

    setIsGenerating(true);
    toast.loading("Generating your website... This may take up to 30 seconds", { id: "generating-toast" });

    try {
      const response = await fetch('/api/website-gen/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, brandName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate website");
      }

      toast.success("Website generated successfully!", { id: "generating-toast" });
      
      const newSite = data.website as WebsiteGeneration;
      setHistory(prev => [newSite, ...prev]);
      setWebsiteGenState({
        websiteGenActiveSite: newSite,
        websiteGenViewMode: "preview",
        websiteGenPrompt: "",
        websiteGenBrandName: ""
      });
    } catch (error: any) {
      toast.error(error.message || "An error occurred", { id: "generating-toast" });
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete(id);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete(null);
  };

  const executeDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/website-gen/history/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Website deleted");
        setHistory(prev => prev.filter(h => h.id !== id));
        if (activeSite?.id === id) {
          setWebsiteGenState({ websiteGenActiveSite: null });
        }
      } else {
        toast.error("Failed to delete website");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setItemToDelete(null);
    }
  };

  const handleLinkToProject = async () => {
    if (!activeSite || !selectedProjectId) {
      toast.error("Please select a project and a generated website.");
      return;
    }
    
    setIsLinking(true);
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_type: "website",
          asset_id: activeSite.id,
          title: activeSite.brand_name || activeSite.prompt.substring(0, 30) || "Generated Website",
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

  const handleCopyCode = () => {
    if (!activeSite) return;
    navigator.clipboard.writeText(activeSite.generated_code);
    toast.success("Code copied to clipboard");
  };

  const handleDownload = () => {
    if (!activeSite) return;
    const blob = new Blob([activeSite.generated_code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeSite.brand_name?.replace(/\s+/g, '-').toLowerCase() || 'website'}-export.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Download started");
  };

  const filteredHistory = useMemo(() => {
    return history.filter(h => 
      h.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.brand_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [history, searchQuery]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col">
      <div className="mb-6 flex-shrink-0 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Globe className="w-8 h-8 text-emerald-500" />
            AI Website Generator
          </h2>
          <p className="text-muted-foreground mt-2">
            Describe your vision, and AI will build a complete HTML & Tailwind website in seconds.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Left Panel: Form & History */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6 flex-shrink-0 overflow-y-auto pr-2 hide-scrollbar">
          
          {/* Form */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 relative overflow-hidden flex-shrink-0">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <LayoutTemplate className="w-32 h-32 text-emerald-500" />
            </div>
            
            <form onSubmit={handleGenerate} className="space-y-4 relative z-10">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Website Description</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setWebsiteGenState({ websiteGenPrompt: e.target.value })}
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                  placeholder="E.g. A modern dark-mode landing page for a SaaS product..."
                  disabled={isGenerating}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Brand Name (Optional)</label>
                <Input 
                  value={brandName}
                  onChange={(e) => setWebsiteGenState({ websiteGenBrandName: e.target.value })}
                  placeholder="Brand Name" 
                  className="bg-white/5 border-white/10 h-11"
                  disabled={isGenerating}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all"
                disabled={isGenerating || !prompt.trim()}
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {isGenerating ? "Generating..." : "Generate Magic"}
              </Button>
            </form>
          </div>

          {/* History Panel */}
          <div className="flex-1 flex flex-col bg-black/20 rounded-3xl border border-white/5 overflow-hidden min-h-[300px]">
            <div className="p-4 border-b border-white/5 bg-white/5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Your Websites</h3>
                <span className="text-xs text-white/50 bg-black/40 px-2 py-1 rounded-full">{history.length}</span>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <Input 
                  placeholder="Search history..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="h-9 pl-9 bg-black/40 border-white/10 text-xs"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoadingHistory ? (
                <div className="text-center text-white/40 text-sm py-8 flex flex-col items-center">
                  <RefreshCw className="w-5 h-5 animate-spin mb-2 opacity-50" />
                  Loading...
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="text-center text-white/40 text-sm py-8">
                  {searchQuery ? "No matches found" : "No generated websites yet"}
                </div>
              ) : (
                filteredHistory.map(site => (
                  <div 
                    key={site.id} 
                    className={`p-4 rounded-xl border transition-all cursor-pointer group flex flex-col gap-2 ${
                      activeSite?.id === site.id 
                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                        : 'bg-black/40 border-white/5 hover:border-white/20'
                    }`}
                    onClick={() => setWebsiteGenState({ websiteGenActiveSite: site })}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-white text-sm line-clamp-1">{site.brand_name || "Untitled"}</h4>
                      
                      {itemToDelete === site.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-red-400">Delete?</span>
                          <button onClick={(e) => executeDelete(site.id, e)} className="text-[10px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded hover:bg-red-500/30">Yes</button>
                          <button onClick={cancelDelete} className="text-[10px] bg-white/10 text-white px-1.5 py-0.5 rounded hover:bg-white/20">No</button>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => confirmDelete(site.id, e)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                      {site.prompt}
                    </p>
                    <div className="text-[10px] text-white/30 mt-1">
                      {formatDistanceToNow(new Date(site.created_at), { addSuffix: true })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Panel: Preview & Code */}
        <div className="flex-1 glass-card rounded-3xl border border-white/10 flex flex-col overflow-hidden min-h-[500px] lg:min-h-0 relative">
          
          {activeSite ? (
            <>
              {/* Header */}
              <div className="h-14 border-b border-white/10 bg-white/5 px-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center bg-black/40 p-1 rounded-lg border border-white/5">
                  <button
                    onClick={() => setWebsiteGenState({ websiteGenViewMode: "preview" })}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center transition-all ${
                      viewMode === "preview" ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
                    }`}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </button>
                  <button
                    onClick={() => setWebsiteGenState({ websiteGenViewMode: "code" })}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center transition-all ${
                      viewMode === "code" ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
                    }`}
                  >
                    <Code className="w-4 h-4 mr-2" />
                    Code
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {projects.length > 0 && (
                    <div className="flex items-center gap-2 border-r border-white/10 pr-3">
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
                        className="h-8 bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                        onClick={handleLinkToProject}
                        disabled={isLinking}
                      >
                        {isLinking ? "Saving..." : "Save to Project"}
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyCode}
                      className="p-2 rounded-lg bg-black/40 border border-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center group"
                      title="Copy HTML"
                    >
                      <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={handleDownload}
                      className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 hover:text-emerald-300 transition-all flex items-center group"
                      title="Download HTML"
                    >
                      <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden bg-white/5 relative">
                {viewMode === "preview" ? (
                  <iframe 
                    srcDoc={activeSite.generated_code}
                    className="w-full h-full bg-white border-none"
                    sandbox="allow-scripts allow-same-origin"
                    title="Live Preview"
                  />
                ) : (
                  <div className="w-full h-full overflow-auto bg-[#0d1117] p-4 hide-scrollbar">
                    <pre className="text-sm font-mono text-emerald-400/90 leading-relaxed">
                      <code>{activeSite.generated_code}</code>
                    </pre>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-black/20">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                <LayoutTemplate className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Website Selected</h3>
              <p className="text-white/50 max-w-sm">
                Generate your first website using the panel on the left, or select an existing one from your history.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
