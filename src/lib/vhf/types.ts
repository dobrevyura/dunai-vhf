import type { LangId } from "@/lib/vhf/languages";

export type UiLang = "ru" | "en";
export type ViewId = "air" | "phrases" | "compose" | "log";
export type Direction = "upstream" | "downstream" | "stopped" | "unknown";
export type Situation = "routine" | "safety" | "urgency" | "distress";
export type Procedure = Situation | "unknown";
export type SourceLang = LangId | "auto";

export type VhfContext = {
  vessel: string;
  direction: Direction;
  situation: Situation;
  sectorId: string;
  channel: string;
  km: string;
};

export type AiResult = {
  radio: string;
  spoken: string;
  gloss: string;
  procedure: Procedure;
  notes: string[];
  suggestedReply: string;
  detected: string;
};

export type LogItem = {
  id: string;
  at: number;
  mode: "translate" | "compose";
  text: string;
  from: SourceLang;
  to: LangId;
  context: VhfContext;
  result: AiResult;
};

export type TranslateInput = {
  mode: "translate" | "compose";
  text: string;
  from: SourceLang;
  to: LangId;
  ui: UiLang;
  context: VhfContext;
};
