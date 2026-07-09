"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, Trash2, Edit2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

interface Task {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  created_at: string;
}

interface KanbanBoardProps {
  projectId: string;
}

const COLUMNS: { id: "todo" | "in_progress" | "done"; title: string; color: string }[] = [
  { id: "todo", title: "To Do", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { id: "done", title: "Done", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
];

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [addingToColumn, setAddingToColumn] = useState<"todo" | "in_progress" | "done" | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`);
      const data = await res.json();
      if (res.ok && data.success) {
        setTasks(data.tasks || []);
      } else {
        toast.error(data.error || "Failed to load tasks");
      }
    } catch {
      toast.error("Network error while loading tasks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleCreateTask = async (status: "todo" | "in_progress" | "done") => {
    if (!newTaskTitle.trim()) {
      setAddingToColumn(null);
      return;
    }

    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTaskTitle, status }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTasks((prev) => [...prev, data.task]);
        setNewTaskTitle("");
        setAddingToColumn(null);
      } else {
        toast.error(data.error || "Failed to create task");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        toast.success("Task deleted");
      } else {
        toast.error("Failed to delete task");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: "todo" | "in_progress" | "done") => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );

      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        // Revert on failure
        toast.error(data.error || "Failed to update task");
        fetchTasks();
      }
    } catch {
      toast.error("Network error");
      fetchTasks();
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mt-8">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);

        return (
          <div key={column.id} className="flex flex-col h-full">
            <div className={`px-4 py-2 rounded-t-lg border-t border-l border-r font-medium flex items-center justify-between ${column.color}`}>
              <span>{column.title}</span>
              <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full">{columnTasks.length}</span>
            </div>
            
            <div className="bg-white/5 border border-white/10 p-3 rounded-b-lg min-h-[400px] flex flex-col gap-3">
              {columnTasks.map((task) => (
                <Card key={task.id} className="p-3 bg-white/10 border-white/10 hover:bg-white/15 transition group">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-white/90 leading-tight">{task.title}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <select
                      className="bg-black/40 text-xs text-white/70 border border-white/10 rounded px-1.5 py-1 focus:outline-none"
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as any)}
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              ))}

              {addingToColumn === column.id ? (
                <div className="p-2 bg-black/40 rounded-lg border border-white/10">
                  <Input 
                    autoFocus
                    placeholder="Task title..."
                    className="bg-transparent border-0 h-8 text-sm focus-visible:ring-0 px-2 mb-2"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateTask(column.id);
                      if (e.key === "Escape") setAddingToColumn(null);
                    }}
                  />
                  <div className="flex justify-end gap-2 px-1">
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setAddingToColumn(null)}>Cancel</Button>
                    <Button size="sm" className="h-6 text-xs px-2" onClick={() => handleCreateTask(column.id)}>Save</Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAddingToColumn(column.id);
                    setNewTaskTitle("");
                  }}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white hover:bg-white/5 p-2 rounded-lg transition-colors mt-1"
                >
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
