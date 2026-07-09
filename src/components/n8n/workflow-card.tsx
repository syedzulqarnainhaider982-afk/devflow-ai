import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  Play, 
  Copy, 
  Edit, 
  Trash2, 
  Star, 
  Network, 
  Tag, 
  Loader2, 
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { N8nWorkflow } from "@/types/n8n";

interface WorkflowCardProps {
  workflow: N8nWorkflow;
  onEdit: (workflow: N8nWorkflow) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onRunSuccess: (id: string, runTime: string) => void;
}

export function WorkflowCard({ workflow, onEdit, onDelete, onToggleFavorite, onRunSuccess }: WorkflowCardProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleRun = async () => {
    if (!workflow.webhook_url) {
      toast.error("No Webhook URL provided for this workflow.");
      return;
    }

    setIsRunning(true);
    try {
      const res = await fetch('/api/n8n/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId: workflow.id, payload: {} })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to trigger workflow');

      toast.success("Workflow triggered successfully!");
      onRunSuccess(workflow.id, new Date().toISOString());
    } catch (err: any) {
      toast.error(err.message || "Failed to trigger workflow");
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyJson = async () => {
    if (!workflow.workflow_json) {
      toast.error("No JSON available for this workflow.");
      return;
    }

    try {
      const jsonStr = typeof workflow.workflow_json === 'string' 
        ? workflow.workflow_json 
        : JSON.stringify(workflow.workflow_json, null, 2);
        
      await navigator.clipboard.writeText(jsonStr);
      setIsCopied(true);
      toast.success("Workflow JSON copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy JSON.");
    }
  };

  return (
    <Card className="flex flex-col h-full bg-[#111] border-white/10 hover:border-white/20 transition-all duration-300 relative group overflow-hidden">
      {/* Top Banner / Color strip depending on category or status */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
      
      <div className="p-6 flex flex-col flex-grow">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white truncate max-w-[200px]" title={workflow.title}>
                {workflow.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-white/5 text-xs text-muted-foreground border-white/10">
                  {workflow.category || "Uncategorized"}
                </Badge>
              </div>
            </div>
          </div>
          <button 
            onClick={() => onToggleFavorite(workflow.id, !workflow.is_favorite)}
            className="text-muted-foreground hover:text-yellow-400 transition"
          >
            <Star className={`w-5 h-5 ${workflow.is_favorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
          {workflow.description || "No description provided."}
        </p>

        {/* Tags */}
        {workflow.tags && workflow.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {workflow.tags.map(tag => (
              <span key={tag} className="flex items-center text-[10px] bg-white/5 px-2 py-0.5 rounded text-muted-foreground">
                <Tag className="w-3 h-3 mr-1" /> {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer / Meta */}
        <div className="text-xs text-muted-foreground/60 mb-4 space-y-1">
          <div>Created: {formatDistanceToNow(new Date(workflow.created_at), { addSuffix: true })}</div>
          <div>Last Run: {workflow.last_run_at ? formatDistanceToNow(new Date(workflow.last_run_at), { addSuffix: true }) : "Never"}</div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 bg-transparent border-white/10 hover:bg-white/10" 
              onClick={() => onEdit(workflow)}
              title="Edit Workflow"
            >
              <Edit className="w-4 h-4 text-blue-400" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 bg-transparent border-white/10 hover:bg-white/10 hover:bg-red-500/20 hover:border-red-500/50 transition-colors" 
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this workflow?")) {
                  onDelete(workflow.id);
                }
              }}
              title="Delete Workflow"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </Button>
          </div>

          <div className="flex gap-2">
            {workflow.workflow_json && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 bg-transparent border-white/10 hover:bg-white/10"
                onClick={handleCopyJson}
              >
                {isCopied ? <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}
                JSON
              </Button>
            )}
            
            {workflow.webhook_url && (
              <Button 
                variant="default" 
                size="sm" 
                className="h-8 bg-orange-600 hover:bg-orange-700 text-white"
                onClick={handleRun}
                disabled={isRunning}
              >
                {isRunning ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}
                Run
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
