export interface AIModel {
  id: string;
  name: string;
  provider: 'gemini' | 'openai' | 'ollama';
  isDefault?: boolean;
  disabled?: boolean;
}

export const ALL_AI_MODELS: AIModel[] = [
  {
    id: "gemini-flash-lite-latest",
    name: "Flash Lite (Latest)",
    provider: "gemini",
    isDefault: true,
  },
  // --- Temporarily hidden: quota/availability issues ---
  // { id: "gemini-1.5-flash",   name: "1.5 Flash",     provider: "gemini",  disabled: true },
  // { id: "gemini-2.5-flash",   name: "2.5 Flash",     provider: "gemini",  disabled: true },
  // { id: "gemini-3.1-flash-lite", name: "3.1 Flash-Lite", provider: "gemini", disabled: true },
  // { id: "gemini-3.5-flash",   name: "3.5 Flash",     provider: "gemini",  disabled: true },
  // { id: "gemini-3.1-pro",     name: "3.1 Pro",       provider: "gemini",  disabled: true },
  // { id: "gpt-4o-mini",        name: "GPT-4o Mini",   provider: "openai",  disabled: true },
];

// Only expose models that are currently stable and quota-verified
export const SUPPORTED_AI_MODELS = ALL_AI_MODELS.filter(m => !m.disabled);

export const getDefaultModelId = () => {
  const defaultModel = SUPPORTED_AI_MODELS.find(m => m.isDefault);
  return defaultModel ? defaultModel.id : SUPPORTED_AI_MODELS[0].id;
};

export const isValidModelId = (modelId: string) => {
  return SUPPORTED_AI_MODELS.some(m => m.id === modelId);
};
