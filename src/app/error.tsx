/* eslint-disable */
"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { AlertOctagon, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service if available
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full rounded-3xl border border-white/10 p-8 flex flex-col items-center text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertOctagon className="w-10 h-10 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Oops! Something went wrong.
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We encountered an unexpected issue while processing your request. Don't worry, your data is safe.
          </p>
        </div>

        <div className="flex flex-col w-full gap-3 pt-4">
          <Button 
            onClick={() => reset()} 
            className="w-full bg-white/10 hover:bg-white/20 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button 
            variant="ghost"
            onClick={() => router.push("/dashboard")} 
            className="w-full text-muted-foreground hover:text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
