"use client";

import { motion } from "framer-motion";
import { Cpu, Globe, Infinity, Zap } from "lucide-react";

const companies = [
  { name: "Acme Corp", icon: Globe },
  { name: "Quantum", icon: Infinity },
  { name: "Echo Valley", icon: Zap },
  { name: "Neural Net", icon: Cpu },
  { name: "Global Tech", icon: Globe },
];

export default function TrustedBy() {
  return (
    <section className="py-20 border-y border-white/5 bg-black/50">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm font-medium text-muted-foreground mb-8 uppercase tracking-widest">
          Trusted by innovative teams worldwide
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {companies.map((company, index) => {
            const Icon = company.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2"
              >
                <Icon className="h-8 w-8" />
                <span className="text-xl font-bold font-sans">{company.name}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
