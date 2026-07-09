"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CTASection({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto glass-card p-12 md:p-20 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready to ship faster?</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join thousands of developers who are already using DevFlow AI to supercharge their workflow.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
              <Button size="lg" className="rounded-full px-8 text-base h-14 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                {isAuthenticated ? "Go to Dashboard" : "Get Started for Free"} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#pricing" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="rounded-full px-8 text-base h-14 border-white/10 hover:bg-white/5 bg-transparent w-full">
                View Pricing
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
