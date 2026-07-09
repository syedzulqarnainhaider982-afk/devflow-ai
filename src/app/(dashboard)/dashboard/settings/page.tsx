"use client";

import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfile {
  name: string;
  email: string;
  avatar_url: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        if (user) {
          const fetchedName = user.user_metadata?.full_name || user.user_metadata?.name || "Dev User";
          setUser({
            name: fetchedName,
            email: user.email || "",
            avatar_url: user.user_metadata?.avatar_url || "",
          });
          setNameInput(fetchedName);
        }
      } catch {
        toast.error("Failed to load user profile.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: nameInput }
      });
      if (error) throw error;
      toast.success("Settings saved successfully!");
      // Update local state to reflect new name
      setUser(prev => prev ? { ...prev, name: nameInput } : null);
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-gray-400" />
          Settings
        </h2>
        <p className="text-muted-foreground text-lg mt-2">
          Manage your account preferences and API keys.
        </p>
      </div>

      <div className="glass-card rounded-3xl border border-white/10 p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Profile Information</h3>
            
            <div className="flex items-center gap-6 pb-4">
              <Avatar className="h-20 w-20 border-2 border-white/10">
                <AvatarImage src={user?.avatar_url} alt={user?.name} />
                <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Profile Picture</p>
                <p className="text-xs text-white/50">Avatar is synced from your authentication provider.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/80">Full Name</Label>
                <Input 
                  value={nameInput} 
                  onChange={(e) => setNameInput(e.target.value)}
                  className="bg-white/5 border-white/10 h-11" 
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Email Address</Label>
                <Input 
                  value={user?.email || ""} 
                  disabled 
                  className="bg-white/5 border-white/10 h-11 opacity-50 cursor-not-allowed" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-2">API Configurations</h3>
            <div className="space-y-2">
              <Label className="text-white/80">OpenAI API Key</Label>
              <Input type="password" placeholder="sk-..." className="bg-white/5 border-white/10 h-11" />
              <p className="text-xs text-muted-foreground">Required for advanced code generation features.</p>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isSaving} className="bg-white text-black hover:bg-gray-200">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
