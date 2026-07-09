"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateProjectModal({ open, onOpenChange, onSuccess }: CreateProjectModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tech_stack: "" // Comma separated for now
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const techStackArray = formData.tech_stack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          tech_stack: techStackArray,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create project");
      }

      toast.success("Project created successfully!");
      setFormData({ name: "", description: "", tech_stack: "" });
      onOpenChange(false);
      if (onSuccess) onSuccess();
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111] border-white/10 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Set up a new workspace for your code, tasks, and workflows.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name <span className="text-red-500">*</span></Label>
            <Input 
              id="name"
              placeholder="e.g. E-Commerce Backend" 
              className="bg-white/5 border-white/10"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              placeholder="Brief overview of the project..." 
              className="bg-white/5 border-white/10 resize-none"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tech_stack">Tech Stack (comma separated)</Label>
            <Input 
              id="tech_stack"
              placeholder="e.g. Next.js, TypeScript, Supabase" 
              className="bg-white/5 border-white/10"
              value={formData.tech_stack}
              onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end pt-4 gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-white/10 hover:bg-white/5"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-white hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
