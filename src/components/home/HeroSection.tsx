"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function HeroSection({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container px-4 text-center z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 cursor-pointer hover:bg-white/10 transition-colors"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">DevFlow AI 2.0 is now live</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 max-w-5xl mx-auto leading-tight"
        >
          Ship code faster with the ultimate <br className="hidden md:block" />
          <span className="premium-gradient-text-accent">AI Developer Toolkit</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
        >
          Access premium AI models, manage your n8n workflows, and use our prompt library all from one powerful dashboard.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href={isAuthenticated ? "/dashboard" : "/signup"} className="w-full sm:w-auto">
            <Button size="lg" className="rounded-full px-8 text-base h-12 w-full sm:w-auto shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              {isAuthenticated ? "Go to Dashboard" : "Start Building for Free"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="#features" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="rounded-full px-8 text-base h-12 w-full sm:w-auto border-white/10 hover:bg-white/5 bg-transparent">
              Explore Features
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
