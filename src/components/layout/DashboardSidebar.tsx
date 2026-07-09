"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit, LayoutDashboard, MessageSquare, BookTemplate, Network, Globe, Code2, FolderKanban, Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "AI Chat",
    icon: MessageSquare,
    href: "/dashboard/chat",
    color: "text-violet-500",
  },
  {
    label: "Prompt Library",
    icon: BookTemplate,
    href: "/dashboard/prompts",
    color: "text-pink-700",
  },
  {
    label: "n8n Workflows",
    icon: Network,
    href: "/dashboard/n8n",
    color: "text-orange-500",
  },
  {
    label: "Website Generator",
    icon: Globe,
    href: "/dashboard/website-gen",
    color: "text-emerald-500",
  },
  {
    label: "Code Generator",
    icon: Code2,
    href: "/dashboard/code-gen",
    color: "text-green-700",
  },
  {
    label: "Project Manager",
    icon: FolderKanban,
    href: "/dashboard/projects",
    color: "text-blue-700",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    color: "text-gray-400",
  },
];

export const DashboardSidebar = () => {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#0a0a0a] border-r border-white/10 text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14 gap-2">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">
            DevFlow<span className="text-primary">AI</span>
          </h1>
        </Link>
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="space-y-1 pr-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                  pathname === route.href
                    ? "text-white bg-white/10"
                    : "text-zinc-400"
                )}
              >
                <div className="flex items-center flex-1">
                  <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                  {route.label}
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
