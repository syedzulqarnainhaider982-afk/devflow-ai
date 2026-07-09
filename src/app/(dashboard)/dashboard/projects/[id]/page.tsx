"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Settings, Trash2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { KanbanBoard } from "@/components/projects/KanbanBoard";
import { ProjectAssets } from "@/components/projects/ProjectAssets";
import { format } from "date-fns";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: "active" | "archived";
  created_at: string;
  tech_stack: string[];
}

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"tasks" | "assets">("tasks");

  useEffect(() => {
    params.then((p) => {
      setProjectId(p.id);
    });
  }, [params]);

  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setProject(data.project);
        } else {
          toast.error(data.error || "Failed to load project details");
          router.push("/dashboard/projects");
        }
      } catch {
        toast.error("Network error");
        router.push("/dashboard/projects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId, router]);

  const handleDeleteProject = async () => {
    if (!confirm("Are you sure you want to delete this project? All tasks will be lost.")) return;
    
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Project deleted");
        router.push("/dashboard/projects");
      } else {
        toast.error("Failed to delete project");
      }
    } catch {
      toast.error("Network error");
    }
  };

  if (isLoading || !project) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <button 
        onClick={() => router.push("/dashboard/projects")}
        className="flex items-center text-sm text-muted-foreground hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
      </button>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-white/5 border border-white/10 p-6 rounded-2xl">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">{project.name}</h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {project.status === "active" ? "Active" : "Archived"}
            </Badge>
          </div>
          
          <p className="text-muted-foreground text-lg max-w-2xl">
            {project.description || "No description provided for this project."}
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4" />
              Created {format(new Date(project.created_at), "MMM d, yyyy")}
            </div>
            {project.tech_stack?.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <div className="flex gap-2">
                  {project.tech_stack.map((tech: string) => (
                    <span key={tech} className="bg-white/10 px-2 py-0.5 rounded text-xs text-white/80">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
            <Settings className="w-4 h-4 mr-2" /> Settings
          </Button>
          <Button variant="destructive" onClick={handleDeleteProject} className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20">
            <Trash2 className="w-4 h-4 mr-2" /> Delete Project
          </Button>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        
        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-white/5 mb-6">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "tasks" ? "border-blue-500 text-blue-400" : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            Kanban Tasks
          </button>
          <button
            onClick={() => setActiveTab("assets")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "assets" ? "border-blue-500 text-blue-400" : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            Linked Assets
          </button>
        </div>
        
        {activeTab === "tasks" ? (
          <>
            <h2 className="text-xl font-semibold text-white mb-2">Project Tasks</h2>
            <p className="text-sm text-muted-foreground">Manage your development workflow.</p>
            {projectId && <KanbanBoard projectId={projectId} />}
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-white mb-2">Project Assets</h2>
            <p className="text-sm text-muted-foreground mb-6">AI generated code, websites, and chat sessions linked to this project.</p>
            {projectId && <ProjectAssets projectId={projectId} />}
          </>
        )}

      </div>
    </div>
  );
}
