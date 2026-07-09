/* eslint-disable */
"use client";

import { useState, useEffect, useMemo } from "react";
import { Network, Plus, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { N8nWorkflow, CreateN8nWorkflowDTO, UpdateN8nWorkflowDTO } from "@/types/n8n";
import { WorkflowCard } from "@/components/n8n/workflow-card";
import { WorkflowDialog } from "@/components/n8n/workflow-dialog";

export default function N8nPage() {
  const [workflows, setWorkflows] = useState<N8nWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<N8nWorkflow | null>(null);

  const supabase = createClient();

  const fetchWorkflows = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to view workflows.");
        return;
      }

      const { data, error } = await supabase
        .from('n8n_workflows')
        .select('*')
        .order('is_favorite', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch workflows");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchWorkflows();
  }, []);

  

  const filteredWorkflows = useMemo(() => {
    if (!searchQuery) return workflows;
    const lowerQuery = searchQuery.toLowerCase();
    
    return workflows.filter(w => {
      const titleMatch = w.title.toLowerCase().includes(lowerQuery);
      const descMatch = (w.description || "").toLowerCase().includes(lowerQuery);
      const categoryMatch = (w.category || "").toLowerCase().includes(lowerQuery);
      const tagsMatch = (w.tags || []).some(t => t.toLowerCase().includes(lowerQuery));
      return titleMatch || descMatch || categoryMatch || tagsMatch;
    });
  }, [workflows, searchQuery]);

  const handleOpenAdd = () => {
    setEditingWorkflow(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (workflow: N8nWorkflow) => {
    setEditingWorkflow(workflow);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('n8n_workflows').delete().eq('id', id);
      if (error) throw error;
      
      setWorkflows(prev => prev.filter(w => w.id !== id));
      toast.success("Workflow deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete workflow");
    }
  };

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    // Optimistic update
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, is_favorite: isFavorite } : w).sort((a, b) => {
      if (a.is_favorite && !b.is_favorite) return -1;
      if (!a.is_favorite && b.is_favorite) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }));

    try {
      const { error } = await supabase
        .from('n8n_workflows')
        .update({ is_favorite: isFavorite })
        .eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      // Revert on error
      toast.error("Failed to update favorite status");
      fetchWorkflows();
    }
  };

  const handleRunSuccess = (id: string, runTime: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, last_run_at: runTime } : w));
  };

  const handleSaveWorkflow = async (data: CreateN8nWorkflowDTO | UpdateN8nWorkflowDTO) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    if (editingWorkflow) {
      // Update
      const { error } = await supabase
        .from('n8n_workflows')
        .update(data)
        .eq('id', editingWorkflow.id);
      
      if (error) throw error;
      toast.success("Workflow updated successfully");
    } else {
      // Insert
      const insertData = { ...data, user_id: user.id };
      const { error } = await supabase
        .from('n8n_workflows')
        .insert([insertData]);
      
      if (error) throw error;
      toast.success("Workflow created successfully");
    }
    
    fetchWorkflows();
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Network className="w-8 h-8 text-orange-500" />
            n8n Workflow Library
          </h2>
          <p className="text-muted-foreground text-lg mt-2">
            Store, manage, and trigger your automations directly from DevFlow.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-orange-600 hover:bg-orange-700 text-white shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          New Workflow
        </Button>
      </div>

      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Search by title, description, category, or tags..." 
          className="pl-10 bg-[#111] border-white/10 text-white w-full max-w-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-[#111] border border-white/10 border-dashed rounded-xl text-center p-8">
          <Network className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-white mb-2">No workflows found</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            {searchQuery 
              ? "We couldn't find any workflows matching your search." 
              : "You haven't added any n8n workflows yet. Create one to get started!"}
          </p>
          {searchQuery ? (
            <Button variant="outline" onClick={() => setSearchQuery("")} className="border-white/10">Clear Search</Button>
          ) : (
            <Button onClick={handleOpenAdd} className="bg-orange-600 hover:bg-orange-700">Add First Workflow</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow) => (
            <WorkflowCard 
              key={workflow.id} 
              workflow={workflow} 
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
              onRunSuccess={handleRunSuccess}
            />
          ))}
        </div>
      )}

      <WorkflowDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        workflow={editingWorkflow}
        onSave={handleSaveWorkflow}
      />
    </div>
  );
}
