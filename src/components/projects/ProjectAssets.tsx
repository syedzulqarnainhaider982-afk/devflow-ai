/* eslint-disable */
"use client";

import { useEffect, useState } from "react";
import { Loader2, Code2, Globe, MessageSquare, Workflow, ExternalLink, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

interface ProjectAsset {
  id: string;
  asset_type: "code" | "website" | "chat" | "n8n";
  asset_id: string;
  title: string;
  created_at: string;
}

export function ProjectAssets({ projectId }: { projectId: string }) {
  const [assets, setAssets] = useState<ProjectAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/assets`);
      const data = await res.json();
      if (res.ok && data.success) {
        setAssets(data.assets || []);
      } else {
        toast.error("Failed to load project assets");
      }
    } catch (e) {
      toast.error("Network error while loading assets");
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchAssets();
  }, [projectId]);

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "code": return <Code2 className="w-5 h-5 text-green-500" />;
      case "website": return <Globe className="w-5 h-5 text-emerald-500" />;
      case "chat": return <MessageSquare className="w-5 h-5 text-purple-500" />;
      case "n8n": return <Workflow className="w-5 h-5 text-orange-500" />;
      default: return <ExternalLink className="w-5 h-5 text-blue-500" />;
    }
  };

  const navigateToAsset = (type: string, id: string) => {
    // Navigate to respective module (we can pass id in query params if needed to auto-load, 
    // for now we just navigate to the module)
    switch (type) {
      case "code": router.push("/dashboard/code-gen"); break;
      case "website": router.push("/dashboard/website-gen"); break;
      case "chat": router.push("/dashboard/chat"); break;
      case "n8n": router.push("/dashboard/n8n"); break;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-white/5 border border-white/10 border-dashed rounded-xl">
        <FolderKanban className="w-12 h-12 mb-4 opacity-50" />
        <p>No assets linked yet.</p>
        <p className="text-sm mt-1">Generate code or websites and select &quot;Link to Project&quot;.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {assets.map(asset => (
        <div key={asset.id} className="p-4 bg-white/5 border border-white/10 hover:border-white/20 transition-all rounded-2xl flex flex-col group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-black/40 rounded-lg">
              {getAssetIcon(asset.asset_type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium truncate">{asset.title}</h4>
              <p className="text-xs text-white/40 capitalize">{asset.asset_type}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
            <span className="text-xs text-white/30">
              {formatDistanceToNow(new Date(asset.created_at), { addSuffix: true })}
            </span>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 text-xs bg-white/5 hover:bg-white/10"
              onClick={() => navigateToAsset(asset.asset_type, asset.asset_id)}
            >
              Open module
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
