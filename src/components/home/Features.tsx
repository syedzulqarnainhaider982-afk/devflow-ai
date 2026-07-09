"use client";

import { motion } from "framer-motion";
import { Bot, Code2, Database, Workflow } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "AI Chat Assistant",
    description: "Chat with premium models like GPT-4, Claude 3, and Gemini directly from your dashboard.",
    icon: Bot,
    color: "text-blue-500",
  },
  {
    title: "Prompt Library",
    description: "Save, organize, and share your best prompts with your team in a centralized hub.",
    icon: Database,
    color: "text-purple-500",
  },
  {
    title: "n8n Workflows",
    description: "Connect your AI to hundreds of apps using built-in n8n automation templates.",
    icon: Workflow,
    color: "text-pink-500",
  },
  {
    title: "Code Generation",
    description: "Generate production-ready code snippets with context-aware AI agents.",
    icon: Code2,
    color: "text-green-500",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Powerful features for modern teams</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to integrate AI into your workflow, without the complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card h-full border-none shadow-none">
                  <CardHeader>
                    <div className={`h-12 w-12 rounded-lg bg-white/5 flex items-center justify-center mb-4 ${feature.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
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
