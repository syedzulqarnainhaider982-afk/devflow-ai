"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full z-50 glass-nav"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">DevFlow<span className="text-primary">AI</span></span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="#tools" className="hover:text-foreground transition-colors">AI Tools</Link>
          <Link href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</Link>
          <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
        </div>

        <div className="flex items-center gap-4">
          {!isAuthenticated && (
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Sign In
            </Link>
          )}
          <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
            <Button className="rounded-full px-6 font-semibold shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all hover:shadow-[0_0_25px_rgba(59,130,246,0.8)]">
              {isAuthenticated ? "Dashboard" : "Get Started"}
            </Button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
