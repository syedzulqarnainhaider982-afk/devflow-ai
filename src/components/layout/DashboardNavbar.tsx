"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, LogOut, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/utils/supabase/client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardSidebar } from "./DashboardSidebar";

interface UserProfile {
  name: string;
  email: string;
  avatar_url: string;
}

export const DashboardNavbar = () => {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({
          name: user.user_metadata?.full_name || "Dev User",
          email: user.email || "",
          avatar_url: user.user_metadata?.avatar_url || "",
        });
      }
    };
    fetchUser();
  }, []);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Logged out successfully");
      router.push("/");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to log out. Please try again.");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex items-center p-4 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10 h-[72px]">
      <Sheet>
        <SheetTrigger render={
          <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10" />
        }>
          <Menu className="h-6 w-6" />
        </SheetTrigger>
        <SheetContent side="left" className="p-0 border-r-white/10 bg-[#0a0a0a] w-72">
          <DashboardSidebar />
        </SheetContent>
      </Sheet>

      <div className="flex w-full justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" className="relative h-10 w-10 rounded-full" />
          }>
            <Avatar className="h-10 w-10 border border-white/10">
              <AvatarImage src={user?.avatar_url} alt={user?.name} />
              <AvatarFallback className="bg-primary/20 text-primary">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-[#111] border-white/10 text-white" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem className="cursor-pointer hover:bg-white/10 focus:bg-white/10" onClick={() => router.push("/dashboard/settings")}>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer text-red-500 hover:bg-white/10 focus:bg-white/10 focus:text-red-500" 
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
