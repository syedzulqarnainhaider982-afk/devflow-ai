"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, FolderOpen, Globe, Code2, MessageSquare, 
  Plus, Activity, Clock, Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { routes } from "@/components/layout/DashboardSidebar";
import { cn } from "@/lib/utils";

interface DashboardStats {
  projects: number;
  websites: number;
  codes: number;
  chats: number;
}

interface ActivityItem {
  id: string;
  type: "project" | "website" | "code" | "chat";
  title: string;
  description?: string;
  timestamp: string;
  url: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Exclude the 'Dashboard' itself from the feature cards
  const features = routes.filter(r => r.href !== "/dashboard");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        const data = await res.json();
        if (res.ok && data.success) {
          setStats(data.stats);
          setActivities(data.activities);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getIconForType = (type: string) => {
    switch (type) {
      case "project": return <FolderOpen className="w-5 h-5 text-blue-500" />;
      case "website": return <Globe className="w-5 h-5 text-emerald-500" />;
      case "code": return <Code2 className="w-5 h-5 text-green-500" />;
      case "chat": return <MessageSquare className="w-5 h-5 text-purple-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "project": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "website": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "code": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "chat": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto space-y-8 h-full overflow-y-auto hide-scrollbar">
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Zap className="w-8 h-8 text-yellow-500" />
            DevFlow AI Overview
          </h2>
          <p className="text-muted-foreground text-lg">
            Monitor your activity and access your AI tools instantly.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-wrap gap-3"
        >
          <Button onClick={() => router.push("/dashboard/projects")} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> New Project
          </Button>
          <Button onClick={() => router.push("/dashboard/code-gen")} className="bg-green-600 hover:bg-green-700 text-white">
            <Code2 className="w-4 h-4 mr-2" /> Gen Code
          </Button>
          <Button onClick={() => router.push("/dashboard/chat")} className="bg-purple-600 hover:bg-purple-700 text-white">
            <MessageSquare className="w-4 h-4 mr-2" /> New Chat
          </Button>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Projects", value: stats?.projects ?? "-", icon: FolderOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Websites Generated", value: stats?.websites ?? "-", icon: Globe, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Code Snippets", value: stats?.codes ?? "-", icon: Code2, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "AI Chat Sessions", value: stats?.chats ?? "-", icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-500/10" }
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="glass-card p-6 rounded-2xl border border-white/10 flex items-center gap-4">
              <div className={cn("p-4 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div>
                <p className="text-sm font-medium text-white/50">{stat.label}</p>
                <h4 className="text-2xl font-bold text-white">
                  {isLoading ? <span className="animate-pulse">...</span> : stat.value}
                </h4>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity Timeline */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-4"
        >
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-white/50" /> Recent Activity
          </h3>
          
          <div className="glass-card rounded-2xl border border-white/10 p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-white/5" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-white/5 rounded w-3/4" />
                      <div className="h-3 bg-white/5 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12 text-white/40 flex flex-col items-center">
                <Activity className="w-12 h-12 mb-4 opacity-20" />
                <p>No recent activity found.</p>
                <p className="text-sm mt-1">Start by creating a project or generating some code!</p>
              </div>
            ) : (
              <div className="relative border-l border-white/10 ml-5 space-y-8 pb-4">
                {activities.map((activity, idx) => (
                  <div key={`${activity.id}-${idx}`} className="relative pl-8 group">
                    <span className="absolute -left-5 top-1 flex items-center justify-center w-10 h-10 rounded-full bg-black border border-white/10">
                      {getIconForType(activity.type)}
                    </span>
                    
                    <div 
                      className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 transition cursor-pointer"
                      onClick={() => router.push(activity.url)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                        <div className="flex items-center gap-3">
                          <span className={cn("text-[10px] font-semibold uppercase px-2 py-1 rounded border", getBadgeColor(activity.type))}>
                            {activity.type}
                          </span>
                          <span className="text-xs text-white/40 font-mono">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <h4 className="text-base font-semibold text-white/90">{activity.title}</h4>
                      {activity.description && (
                        <p className="text-sm text-white/60 mt-2 line-clamp-2 leading-relaxed">
                          {activity.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Modules Grid */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            Tools & Modules
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {features.map((feature, index) => (
              <Card 
                key={feature.href}
                className="p-5 bg-black/40 border-white/5 hover:bg-white/10 transition cursor-pointer flex items-center justify-between group"
                onClick={() => router.push(feature.href)}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-2.5 rounded-xl bg-white/5", feature.color)}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-medium text-white group-hover:text-white/90 transition">
                    {feature.label}
                  </h3>
                </div>
                <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-transform group-hover:translate-x-1" />
              </Card>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
