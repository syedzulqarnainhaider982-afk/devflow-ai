/* eslint-disable */
"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function WhyChooseUs() {
  const points = [
    "Built specifically for developers and teams.",
    "Native Supabase integration for your data.",
    "Extremely fast API response times.",
    "Open-source friendly with n8n hooks.",
    "Dark mode optimized for late-night coding.",
    "Zero vendor lock-in for your prompts."
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex-1"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Why Choose DevFlow AI?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            We understand the pain of modern development. Switching between ChatGPT, n8n, Supabase, and your IDE ruins focus. DevFlow AI unifies your workflow.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {points.map((point, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                <span className="text-sm text-gray-300">{point}</span>
              </div>
            ))}
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex-1 w-full"
        >
          <div className="glass-card rounded-2xl p-2 border border-white/10 shadow-2xl relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-20" />
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-white/5">
              {/* Dummy Code Editor Visual */}
              <div className="absolute top-0 left-0 w-full h-8 bg-white/5 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <pre className="text-sm text-green-400 font-mono p-8 w-full">
                <code>
                  const agent = new DevFlowAgent();<br/>
                  await agent.analyzeCodebase();<br/>
                  console.log("Zero bugs found. 🚀");
                </code>
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
