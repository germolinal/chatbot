export type AI_platform = "google" | "openai";
type GoogleLLM = "gemini-1.5-flash" | "gemini-1.5-pro" | "gemini-2.0-flash-exp";
type OpenAILLM =
  | "gpt-4o"
  | "gpt-4o-mini"
  | "gpt-3.5-turbo"
  | "gpt-4"
  | "gpt-4-turbo";
export type LLM = GoogleLLM | OpenAILLM;

export const llm_providers: { [K in LLM]: AI_platform } = {
  "gemini-1.5-flash": "google",
  "gemini-2.0-flash-exp": "google",
  "gemini-1.5-pro": "google",
  "gpt-4o": "openai",
  "gpt-4o-mini": "openai",
  "gpt-3.5-turbo": "openai",
  "gpt-4": "openai",
  "gpt-4-turbo": "openai",
};
//@ts-ignore
export const llms: LLM[] = Object.keys(llm_providers);
