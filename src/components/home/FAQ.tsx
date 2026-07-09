/* eslint-disable */
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

export default function FAQ() {
  return (
    <section id="faq" className="py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about DevFlow AI.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion className="w-full">
            <AccordionItem value="item-1" className="border-white/10">
              <AccordionTrigger className="text-lg">What AI models do you support?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                We currently support OpenAI's GPT-4o, Anthropic's Claude 3.5 Sonnet, and Google's Gemini 1.5 Pro. We constantly add new models as they become available.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-white/10">
              <AccordionTrigger className="text-lg">Can I integrate my own n8n instance?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                Yes! With our Pro and Enterprise plans, you can securely connect your own hosted n8n instance or use our managed workflows.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-white/10">
              <AccordionTrigger className="text-lg">Is my data secure?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                Absolutely. We use Supabase for secure, encrypted authentication and data storage. We do not use your private prompts to train AI models.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
