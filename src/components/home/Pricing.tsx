/* eslint-disable */
"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Pricing({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the perfect plan for your team's needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Basic */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-8 border border-white/5"
          >
            <h3 className="text-xl font-medium mb-2">Starter</h3>
            <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
            <ul className="space-y-4 mb-8">
              {['Basic AI Chat', '10 Prompts', 'Community Support'].map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <Link href={isAuthenticated ? "/dashboard" : "/signup"} className="block w-full">
              <Button className="w-full" variant="outline">{isAuthenticated ? "Dashboard" : "Get Started"}</Button>
            </Link>
          </motion.div>

          {/* Pro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-3xl p-8 border border-primary relative"
          >
            <div className="absolute top-0 right-8 -translate-y-1/2">
              <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
            </div>
            <h3 className="text-xl font-medium mb-2">Pro</h3>
            <div className="text-4xl font-bold mb-6">$29<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
            <ul className="space-y-4 mb-8">
              {['GPT-4 & Claude 3', 'Unlimited Prompts', 'n8n Integrations', 'Priority Support'].map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <Link href={isAuthenticated ? "/dashboard/settings" : "/signup"} className="block w-full">
              <Button className="w-full shadow-[0_0_15px_rgba(59,130,246,0.5)]">Upgrade to Pro</Button>
            </Link>
          </motion.div>

          {/* Enterprise */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-3xl p-8 border border-white/5"
          >
            <h3 className="text-xl font-medium mb-2">Enterprise</h3>
            <div className="text-4xl font-bold mb-6">Custom</div>
            <ul className="space-y-4 mb-8">
              {['Custom Models', 'Dedicated Server', 'White-labeling', '24/7 SLA Support'].map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <Link href="mailto:support@devflow-ai.com" className="block w-full">
              <Button className="w-full" variant="outline">Contact Sales</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
