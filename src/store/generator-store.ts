import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CodeGeneration } from "@/types/code-gen";
import type { WebsiteGeneration } from "@/types/website";

interface GeneratorState {
  codeGenPrompt: string;
  codeGenLanguage: string;
  codeGenActiveItem: CodeGeneration | null;
  codeGenGeneratedCode: string;
  setCodeGenState: (state: Partial<GeneratorState>) => void;

  websiteGenPrompt: string;
  websiteGenBrandName: string;
  websiteGenActiveSite: WebsiteGeneration | null;
  websiteGenViewMode: "preview" | "code";
  setWebsiteGenState: (state: Partial<GeneratorState>) => void;
}

export const useGeneratorStore = create<GeneratorState>()(
  persist(
    (set) => ({
      // Code Generator State
      codeGenPrompt: "",
      codeGenLanguage: "typescript",
      codeGenActiveItem: null,
      codeGenGeneratedCode: "",
      setCodeGenState: (newState) => set((state) => ({ ...state, ...newState })),

      // Website Generator State
      websiteGenPrompt: "",
      websiteGenBrandName: "",
      websiteGenActiveSite: null,
      websiteGenViewMode: "preview",
      setWebsiteGenState: (newState) => set((state) => ({ ...state, ...newState })),
    }),
    {
      name: "devflow-generator-storage",
    }
  )
);
