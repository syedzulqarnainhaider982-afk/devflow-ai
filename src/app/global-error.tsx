"use client";

import { AlertOctagon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-[#0a0a0a] text-white">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-3xl border border-white/10 p-8 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertOctagon className="w-10 h-10 text-red-500" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Critical System Error
              </h2>
              <p className="text-white/60 text-sm leading-relaxed">
                The application encountered a critical error. We apologize for the inconvenience.
              </p>
            </div>

            <div className="flex flex-col w-full pt-4">
              <Button 
                onClick={() => reset()} 
                className="w-full bg-white text-black hover:bg-white/90"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Application
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
