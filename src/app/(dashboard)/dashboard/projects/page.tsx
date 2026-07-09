"use client";

import { useEffect, useState } from "react";
import { FolderKanban, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  tech_stack: string[];
  updated_at: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (res.ok && data.success) {
        setProjects(data.projects || []);
      } else {
        toast.error(data.error || "Failed to load projects");
      }
    } catch {
      toast.error("Network error while loading projects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <FolderKanban className="w-8 h-8 text-blue-500" />
            Project Manager
          </h2>
          <p className="text-muted-foreground text-lg mt-2">
            Organize your generated assets, code, and deployments.
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Project
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
          <FolderKanban className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-white mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-6">Create your first project to start organizing.</p>
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-white text-black hover:bg-gray-200"
          >
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <CreateProjectModal 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        onSuccess={fetchProjects}
      />
    </div>
  );
}
