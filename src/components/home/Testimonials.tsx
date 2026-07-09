/* eslint-disable */
"use client";

import { motion } from "framer-motion";

const reviews = [
  {
    name: "Alex Johnson",
    role: "Senior Full Stack Dev",
    content: "DevFlow AI completely changed how I manage my n8n workflows. Having my prompts and bots in one dashboard saves me hours every week.",
  },
  {
    name: "Sarah Chen",
    role: "Startup Founder",
    content: "The API integrations are flawless. We built our entire customer support AI using DevFlow's platform in under 2 days.",
  },
  {
    name: "Michael Roberts",
    role: "UX Engineer",
    content: "Finally, an AI tool that actually looks and feels premium. The dark mode and glassmorphism UI is an absolute joy to use.",
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-black/40 border-y border-white/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Loved by Developers</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Don't just take our word for it. See what the community is saying.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-8 rounded-3xl border border-white/5"
            >
              <div className="flex items-center gap-2 mb-4 text-yellow-500">
                {"★★★★★"}
              </div>
              <p className="text-gray-300 mb-6 italic">"{review.content}"</p>
              <div>
                <h4 className="font-bold text-white">{review.name}</h4>
                <span className="text-sm text-muted-foreground">{review.role}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
