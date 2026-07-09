/* eslint-disable */
"use client";

import { Search, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full rounded-3xl border border-white/10 p-8 flex flex-col items-center text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
          <Search className="w-10 h-10 text-white/40" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-white tracking-tight">
            404
          </h2>
          <p className="text-lg font-medium text-white/80">Page not found</p>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-[250px] mx-auto">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col w-full gap-3 pt-4">
          <Link href="/dashboard" className="w-full">
            <Button className="w-full bg-white text-black hover:bg-white/90">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full text-muted-foreground hover:text-white"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
