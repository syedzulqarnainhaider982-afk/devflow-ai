"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  tech_stack: string[];
  updated_at: string;
}

export function ProjectCard({ project }: { project: Project }) {
  
  return (
    <Link href={`/dashboard/projects/${project.id}`} className="block h-full">
      <Card 
        className="p-6 bg-white/5 border-white/10 hover:bg-white/10 transition cursor-pointer flex flex-col justify-between h-48 group relative overflow-hidden"
      >
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div>
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-white group-hover:text-primary transition-colors truncate pr-2">
            {project.name}
          </h3>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 shrink-0">
            {project.status === "active" ? "Active" : "Archived"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {project.description || "No description provided."}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tech_stack?.slice(0, 3).map((tech) => (
            <span key={tech} className="text-xs px-2 py-1 rounded-md bg-white/5 text-white/70">
              {tech}
            </span>
          ))}
          {project.tech_stack?.length > 3 && (
            <span className="text-xs px-2 py-1 rounded-md bg-white/5 text-white/70">
              +{project.tech_stack.length - 3}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center text-xs text-muted-foreground gap-1 border-t border-white/5 pt-3">
        <Clock className="w-3 h-3" /> 
        Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
      </div>
      </Card>
    </Link>
  );
}
