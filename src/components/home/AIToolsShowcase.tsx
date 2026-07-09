"use client";

import { motion } from "framer-motion";
import { Image as ImageIcon, FileText, Code, Database, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tools = [
  { title: "Image Generation", icon: ImageIcon, color: "text-pink-500", desc: "Access DALL-E 3 & Pollinations API directly." },
  { title: "Smart Copywriting", icon: FileText, color: "text-blue-500", desc: "Write blogs, emails, and ads instantly." },
  { title: "Code Refactoring", icon: Code, color: "text-green-500", desc: "Let AI review and improve your codebase." },
  { title: "Database Architect", icon: Database, color: "text-purple-500", desc: "Generate SQL and Prisma schemas." },
  { title: "SEO Analyzer", icon: Globe, color: "text-yellow-500", desc: "Optimize your web pages for search engines." },
  { title: "Text to Speech", icon: FileText, color: "text-orange-500", desc: "Convert text to human-like voice." }
];

export default function AIToolsShowcase() {
  return (
    <section id="tools" className="py-24 bg-black/30 border-y border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">The Ultimate AI Directory</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need in one platform. Stop switching between 10 different tabs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card h-full hover:border-white/10 border-transparent bg-white/5">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className={`h-10 w-10 rounded-lg bg-black/50 flex items-center justify-center ${tool.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl m-0">{tool.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{tool.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
