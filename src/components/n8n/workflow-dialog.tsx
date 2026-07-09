/* eslint-disable */
import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { N8nWorkflow, CreateN8nWorkflowDTO, UpdateN8nWorkflowDTO } from "@/types/n8n";

interface WorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow: N8nWorkflow | null;
  onSave: (data: CreateN8nWorkflowDTO | UpdateN8nWorkflowDTO) => Promise<void>;
}

export function WorkflowDialog({ open, onOpenChange, workflow, onSave }: WorkflowDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateN8nWorkflowDTO>({
    title: "",
    description: "",
    webhook_url: "",
    category: "Uncategorized",
    tags: [],
    workflow_json: null
  });
  const [jsonInput, setJsonInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [jsonError, setJsonError] = useState("");

  useEffect(() => {
    if (open) {
      if (workflow) {
        setFormData({
          title: workflow.title,
          description: workflow.description || "",
          webhook_url: workflow.webhook_url || "",
          category: workflow.category || "Uncategorized",
          tags: workflow.tags || []
        });
        setTagsInput((workflow.tags || []).join(", "));
        setJsonInput(workflow.workflow_json ? JSON.stringify(workflow.workflow_json, null, 2) : "");
      } else {
        setFormData({
          title: "",
          description: "",
          webhook_url: "",
          category: "Uncategorized",
          tags: [],
          workflow_json: null
        });
        setTagsInput("");
        setJsonInput("");
      }
      setJsonError("");
    }
  }, [open, workflow]);

  const handleChange = (field: keyof CreateN8nWorkflowDTO, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateAndParseJson = (): any | null => {
    if (!jsonInput.trim()) return null;
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonError("");
      return parsed;
    } catch (e) {
      setJsonError("Invalid JSON format. Please ensure it is a valid n8n workflow JSON.");
      return undefined; // undefined signals error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Title is required.");
      return;
    }

    const parsedJson = validateAndParseJson();
    if (parsedJson === undefined) {
      toast.error("Please fix JSON errors before saving.");
      return;
    }

    const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);

    const submissionData = {
      ...formData,
      tags: tagsArray,
      workflow_json: parsedJson
    };

    setIsSubmitting(true);
    try {
      await onSave(submissionData);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save workflow");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-[#111] border-white/10 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{workflow ? "Edit Workflow" : "Add New Workflow"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input 
              id="title" 
              placeholder="e.g., Daily Data Backup" 
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="bg-white/5 border-white/10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="What does this workflow do?" 
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('description', e.target.value)}
              className="bg-white/5 border-white/10 resize-none h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input 
                id="category" 
                placeholder="e.g., Database, Automation" 
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (Comma separated)</Label>
              <Input 
                id="tags" 
                placeholder="e.g., s3, backup, daily" 
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook_url">Webhook URL (Optional, for Run button)</Label>
            <Input 
              id="webhook_url" 
              placeholder="https://n8n.yourdomain.com/webhook/..." 
              value={formData.webhook_url}
              onChange={(e) => handleChange('webhook_url', e.target.value)}
              className="bg-white/5 border-white/10 font-mono text-sm"
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workflow_json">n8n Workflow JSON</Label>
            <Textarea 
              id="workflow_json" 
              placeholder="Paste your exported n8n workflow JSON here..." 
              value={jsonInput}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setJsonInput(e.target.value);
                setJsonError("");
              }}
              onBlur={() => validateAndParseJson()}
              className="bg-white/5 border-white/10 font-mono text-xs h-32"
            />
            {jsonError && (
              <div className="text-red-400 text-sm flex items-center mt-1">
                <AlertCircle className="w-4 h-4 mr-1" />
                {jsonError}
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 border-t border-white/10">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-white/10 hover:bg-white/10"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={isSubmitting || !!jsonError}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {workflow ? "Save Changes" : "Create Workflow"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
