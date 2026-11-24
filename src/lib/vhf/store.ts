import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LangId } from "@/lib/vhf/languages";
import type { AiResult, LogItem, SourceLang, UiLang, VhfContext, ViewId } from "@/lib/vhf/types";

type Active = { result: AiResult; cached: boolean; mode: "translate" | "compose" } | null;

type VhfState = {
  ui: UiLang;
  view: ViewId;
  from: SourceLang;
  to: LangId;
  draft: string;
  intent: string;
  context: VhfContext;
  log: LogItem[];
  active: Active;
  setUi: (ui: UiLang) => void;
  setView: (view: ViewId) => void;
  setFrom: (from: SourceLang) => void;
  setTo: (to: LangId) => void;
  setDraft: (draft: string) => void;
  setIntent: (intent: string) => void;
  patchContext: (patch: Partial<VhfContext>) => void;
  setActive: (active: Active) => void;
  pushLog: (item: LogItem) => void;
  removeLog: (id: string) => void;
  clearLog: () => void;
  openLog: (id: string) => void;
};

const defaultContext: VhfContext = {
  vessel: "",
  direction: "unknown",
  situation: "routine",
  sectorId: "unset",
  channel: "10",
  km: "",
};

export const useVhf = create<VhfState>()(
  persist(
    (set) => ({
      ui: "ru",
      view: "air",
      from: "auto",
      to: "ru",
      draft: "",
      intent: "",
      context: defaultContext,
      log: [],
      active: null,
      setUi: (ui) => set({ ui }),
      setView: (view) => set({ view }),
      setFrom: (from) => set({ from }),
      setTo: (to) => set({ to }),
      setDraft: (draft) => set({ draft }),
      setIntent: (intent) => set({ intent }),
      patchContext: (patch) => set((state) => ({ context: { ...state.context, ...patch } })),
      setActive: (active) => set({ active }),
      pushLog: (item) =>
        set((state) => {
          const prev = state.log[0];
          if (
            prev &&
            prev.mode === item.mode &&
            prev.text === item.text &&
            prev.from === item.from &&
            prev.to === item.to &&
            prev.result.radio === item.result.radio
          ) {
            return state;
          }
          return { log: [item, ...state.log].slice(0, 40) };
        }),
      removeLog: (id) => set((state) => ({ log: state.log.filter((item) => item.id !== id) })),
      clearLog: () => set({ log: [] }),
      openLog: (id) =>
        set((state) => {
          const item = state.log.find((entry) => entry.id === id);
          if (!item) return state;
          return {
            view: item.mode === "compose" ? "compose" : "air",
            from: item.from,
            to: item.to,
            draft: item.mode === "translate" ? item.text : state.draft,
            intent: item.mode === "compose" ? item.text : state.intent,
            context: item.context,
            active: { result: item.result, cached: true, mode: item.mode },
          };
        }),
    }),
    { name: "dunai-vhf-v1", skipHydration: true },
  ),
);

const CACHE_KEY = "dunai-vhf-cache-v1";

type CacheEntry = { at: number; result: AiResult };

export function readTranslationCache(key: string): AiResult | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, CacheEntry>;
    return parsed[key]?.result ?? null;
  } catch {
    return null;
  }
}

export function writeTranslationCache(key: string, result: AiResult) {
  if (typeof localStorage === "undefined") return;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, CacheEntry>) : {};
    parsed[key] = { at: Date.now(), result };
    const entries = Object.entries(parsed).sort((a, b) => b[1].at - a[1].at).slice(0, 30);
    localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    /* quota or private mode */
  }
}
